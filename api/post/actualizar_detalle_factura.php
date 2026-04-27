<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . '/../../Phps/db_facturas.php';

if (!isset($conn_facturas) || $conn_facturas->connect_errno) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la BD."]);
    exit;
}

$idUsuario = isset($_SESSION['usuario_id']) ? (int)$_SESSION['usuario_id'] : 0;
if ($idUsuario === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Usuario no autenticado."]);
    exit;
}

$raw = file_get_contents("php://input");
$payload = $raw ? json_decode($raw, true) : null;

if (!$payload || !is_array($payload)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Entrada inválida. Se esperaba JSON."]);
    exit;
}

$facturaId = isset($payload['factura_id']) ? (int)$payload['factura_id'] : 0;
$factura = isset($payload['factura']) && is_array($payload['factura']) ? $payload['factura'] : [];
$items = isset($payload['items']) && is_array($payload['items']) ? $payload['items'] : [];

if ($facturaId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "factura_id inválido."]);
    exit;
}

$emisor = trim((string)($factura['emisor'] ?? ''));
$nit = trim((string)($factura['nit'] ?? ''));
$numeroFactura = trim((string)($factura['numero_factura'] ?? ''));
$fecha = trim((string)($factura['fecha'] ?? ''));
$subtotal = isset($factura['subtotal']) ? (float)$factura['subtotal'] : 0;
$iva = isset($factura['iva']) ? (float)$factura['iva'] : 0;
$total = isset($factura['total']) ? (float)$factura['total'] : 0;

if ($emisor === '' || $numeroFactura === '' || $fecha === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Emisor, número de factura y fecha son obligatorios."]);
    exit;
}

$conn_facturas->begin_transaction();

try {
    $stmtOwner = $conn_facturas->prepare("SELECT id FROM facturas WHERE id = ? AND id_usuario = ? LIMIT 1");
    if (!$stmtOwner) {
        throw new Exception("No se pudo validar la propiedad de la factura.");
    }
    $stmtOwner->bind_param('ii', $facturaId, $idUsuario);
    $stmtOwner->execute();
    $resOwner = $stmtOwner->get_result();
    $owner = $resOwner->fetch_assoc();
    $stmtOwner->close();

    if (!$owner) {
        throw new Exception("No tienes permisos para editar esta factura.");
    }

    $stmtUpdateFactura = $conn_facturas->prepare("UPDATE facturas SET cliente_nombre = ?, nit = ?, numero_factura = ?, fecha = ?, subtotal = ?, iva = ?, total = ? WHERE id = ? AND id_usuario = ?");
    if (!$stmtUpdateFactura) {
        throw new Exception("No se pudo preparar la actualización de factura.");
    }
    $stmtUpdateFactura->bind_param('ssssdddii', $emisor, $nit, $numeroFactura, $fecha, $subtotal, $iva, $total, $facturaId, $idUsuario);
    if (!$stmtUpdateFactura->execute()) {
        throw new Exception("Falló la actualización de factura.");
    }
    $stmtUpdateFactura->close();

    $stmtDeleteItems = $conn_facturas->prepare("DELETE FROM factura_items WHERE factura_id = ?");
    if (!$stmtDeleteItems) {
        throw new Exception("No se pudo preparar limpieza de items.");
    }
    $stmtDeleteItems->bind_param('i', $facturaId);
    if (!$stmtDeleteItems->execute()) {
        throw new Exception("No se pudieron limpiar los items anteriores.");
    }
    $stmtDeleteItems->close();

    if (!empty($items)) {
        $stmtInsertItem = $conn_facturas->prepare("INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unit, total) VALUES (?, ?, ?, ?, ?)");
        if (!$stmtInsertItem) {
            throw new Exception("No se pudo preparar inserción de items.");
        }

        foreach ($items as $item) {
            $descripcion = trim((string)($item['descripcion'] ?? ''));
            $cantidad = isset($item['cantidad']) ? (float)$item['cantidad'] : 0;
            $precioUnit = isset($item['precio_unit']) ? (float)$item['precio_unit'] : 0;
            $totalItem = isset($item['total']) ? (float)$item['total'] : 0;

            if ($descripcion === '') {
                continue;
            }

            $stmtInsertItem->bind_param('isddd', $facturaId, $descripcion, $cantidad, $precioUnit, $totalItem);
            if (!$stmtInsertItem->execute()) {
                throw new Exception("Falló la inserción de item.");
            }
        }

        $stmtInsertItem->close();
    }

    $conn_facturas->commit();

    echo json_encode([
        "success" => true,
        "message" => "Factura actualizada correctamente."
    ]);
} catch (Exception $e) {
    $conn_facturas->rollback();
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn_facturas->close();
?>