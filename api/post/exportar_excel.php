<?php
session_start();

require_once __DIR__ . '/../../Phps/db_facturas.php';

if (!isset($conn_facturas) || $conn_facturas->connect_errno) {
    die("Error de conexión a la BD.");
}

$id_usuario = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 0;
if ($id_usuario === 0 && isset($_SESSION['usuario_id'])) {
    $id_usuario = (int)$_SESSION['usuario_id'];
}

if ($id_usuario === 0) {
    die("Usuario no autenticado para exportar facturas.");
}

// Filtros opcionales
$fecha_inicio = $_GET['fecha_inicio'] ?? '';
$fecha_fin = $_GET['fecha_fin'] ?? '';
$emisor = $_GET['emisor'] ?? '';

// Sentencia base
$sql = "SELECT numero_factura, cliente_nombre, nit, fecha, subtotal, iva, total FROM facturas WHERE id_usuario = ?";
$params = [$id_usuario];
$types = "i";

if ($fecha_inicio !== '') {
    $sql .= " AND fecha >= ?";
    $params[] = $fecha_inicio;
    $types .= "s";
}
if ($fecha_fin !== '') {
    $sql .= " AND fecha <= ?";
    $params[] = $fecha_fin;
    $types .= "s";
}
if ($emisor !== '') {
    $sql .= " AND cliente_nombre LIKE ?";
    $params[] = '%' . $emisor . '%';
    $types .= "s";
}

$sql .= " ORDER BY fecha DESC, id DESC";

$stmt = $conn_facturas->prepare($sql);
if (!$stmt) {
    // Fallback si no existe la columna id_usuario
    $sql_fallback = str_replace("WHERE id_usuario = ?", "WHERE 1=1", $sql);
    $stmt = $conn_facturas->prepare($sql_fallback);
    if($stmt) {
        $stmt->execute($params); // Requiere PHP 8.1+
    }
} else {
    // Vincular dinámicamente
    $bind_names[] = $types;
    for ($i = 0; $i < count($params); $i++) {
        $bind_names[] = &$params[$i];
    }
    call_user_func_array(array($stmt, 'bind_param'), $bind_names);
    $stmt->execute();
}
$result = $stmt->get_result();

// Configurar las cabeceras para forzar la descarga de un archivo CSV
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="Reporte_Facturas_' . date('Ymd_His') . '.csv"');

// Abrir la salida estándar de PHP
$output = fopen('php://output', 'w');

// Añadir el BOM de UTF-8 para que Excel reconozca correctamente los acentos y caracteres especiales
fputs($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

// Escribir la cabecera del CSV (usaremos punto y coma para que Excel en español lo divida facil en columnas)
fputcsv($output, ['Número de Factura', 'Emisor (Nombre)', 'NIT', 'Fecha', 'Subtotal', 'IVA', 'Total'], ';');

// Escribir los datos
while ($row = $result->fetch_assoc()) {
    $linea = [
        $row['numero_factura'] ?: 'S/N',
        $row['cliente_nombre'] ?: 'Desconocido',
        $row['nit'] ?: 'S/N',
        $row['fecha'] ?: 'S/F',
        $row['subtotal'] !== null ? number_format((float)$row['subtotal'], 2, ',', '') : '0,00',
        $row['iva'] !== null ? number_format((float)$row['iva'], 2, ',', '') : '0,00',
        $row['total'] !== null ? number_format((float)$row['total'], 2, ',', '') : '0,00'
    ];
    fputcsv($output, $linea, ';');
}

$stmt->close();
$conn_facturas->close();
fclose($output);
exit;
?>