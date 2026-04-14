<?php
// Phps/guardar_facturas.php
// Recibe el JSON devuelto por la API de IA (FastAPI en Render)
// y guarda la información en las tablas `facturas` y `factura_items`.

header('Content-Type: application/json; charset=utf-8');

// Usamos una conexión separada para la BD de facturas
require_once __DIR__ . '/db_facturas.php';

if ($conn_facturas->connect_errno) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error de conexión a la base de datos'
    ]);
    exit;
}

// Leer cuerpo JSON (se espera que el frontend haga fetch con Content-Type: application/json)
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'JSON inválido o vacío'
    ]);
    exit;
}

// Normaliza fechas tipo "13/04/2026" o "2026-04-13" a formato MySQL YYYY-MM-DD
function normalizar_fecha($str)
{
    if ($str === null) return null;
    $str = trim((string)$str);
    if ($str === '') return null;

    // Ya viene en formato YYYY-MM-DD
    if (preg_match('/^(\\d{4})-(\\d{2})-(\\d{2})$/', $str)) {
        return $str;
    }

    // Formato DD/MM/YYYY o DD-MM-YYYY
    if (preg_match('/^(\\d{2})[\\\/\\-](\\d{2})[\\\/\\-](\\d{4})$/', $str, $m)) {
        return $m[3] . '-' . $m[2] . '-' . $m[1];
    }

    // Si no se reconoce, mejor devolver null
    return null;
}

if (empty($data['facturas']) || !is_array($data['facturas'])) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'No se encontraron facturas en el payload'
    ]);
    exit;
}

// Preparar sentencias
$stmtFactura = $conn_facturas->prepare("INSERT INTO facturas (
    cliente_nombre, nit, numero_factura, fecha,
    subtotal, iva, total,
    pdf_nombre, pdf_url
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmtFactura) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error al preparar INSERT de facturas'
    ]);
    exit;
}

$stmtItem = $conn_facturas->prepare("INSERT INTO factura_items (
    factura_id, descripcion, cantidad, precio_unit, total
) VALUES (?, ?, ?, ?, ?)");

if (!$stmtItem) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error al preparar INSERT de items'
    ]);
    exit;
}

$insertadas = 0;
$errores = [];

foreach ($data['facturas'] as $facturaRaw) {
    $archivo = $facturaRaw['archivo'] ?? '';
    $resultado = $facturaRaw['resultado'] ?? [];

    // Solo guardamos si la IA marcó la factura como PROCESADA
    $estado = $resultado['estado'] ?? '';
    if ($estado !== 'PROCESADA') {
        $errores[] = "Factura {$archivo} saltada por estado={$estado}";
        continue;
    }

    $datos = $resultado['datos'] ?? [];

    $clienteNombre   = $datos['proveedor'] ?? '';
    $nit             = $datos['nit'] ?? '';
    $numeroFactura   = $datos['numero_factura'] ?? '';
    $fecha           = normalizar_fecha($datos['fecha'] ?? null);
    $subtotal        = isset($datos['subtotal']) ? (float)$datos['subtotal'] : null;
    $iva             = isset($datos['iva']) ? (float)$datos['iva'] : null;
    $total           = isset($datos['total']) ? (float)$datos['total'] : null;

    $pdfNombre = $archivo;
    $pdfUrl    = null; // si luego guardas ruta/URL del archivo, ponla aquí

    // Vincular parámetros e insertar en `facturas`
    $stmtFactura->bind_param(
        'ssssddsss',
        $clienteNombre,
        $nit,
        $numeroFactura,
        $fecha,
        $subtotal,
        $iva,
        $total,
        $pdfNombre,
        $pdfUrl
    );

    if (!$stmtFactura->execute()) {
        $errores[] = '[FACTURA] ' . $stmtFactura->error;
        error_log('[GUARDAR_FACTURA] Error al insertar factura: ' . $stmtFactura->error);
        continue;
    }

    $facturaId = $stmtFactura->insert_id;
    $insertadas++;

    // Insertar items si existen
    if (!empty($datos['items']) && is_array($datos['items'])) {
        foreach ($datos['items'] as $item) {
            $descripcion = $item['descripcion'] ?? '';
            $cantidad    = isset($item['cantidad']) ? (float)$item['cantidad'] : null;
            $precioUnit  = isset($item['precio_unit']) ? (float)$item['precio_unit'] : null;
            $totalItem   = isset($item['total']) ? (float)$item['total'] : null;

            $stmtItem->bind_param(
                'isddd',
                $facturaId,
                $descripcion,
                $cantidad,
                $precioUnit,
                $totalItem
            );

            if (!$stmtItem->execute()) {
                $errores[] = '[ITEM] ' . $stmtItem->error;
                error_log('[GUARDAR_FACTURA] Error al insertar item: ' . $stmtItem->error);
            }
        }
    }
}

$stmtFactura->close();
$stmtItem->close();
$conn_facturas->close();

echo json_encode([
    'ok' => true,
    'facturas_insertadas' => $insertadas,
    'errores' => $errores,
]);
