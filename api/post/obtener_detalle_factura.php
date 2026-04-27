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

$facturaId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($facturaId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID de factura inválido."]);
    exit;
}

$stmtFactura = $conn_facturas->prepare("SELECT id, cliente_nombre AS emisor, nit, numero_factura, fecha, subtotal, iva, total, pdf_nombre, pdf_url, creado_en FROM facturas WHERE id = ? AND id_usuario = ? LIMIT 1");
if (!$stmtFactura) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "No se pudo preparar la consulta de factura."]);
    exit;
}

$stmtFactura->bind_param('ii', $facturaId, $idUsuario);
$stmtFactura->execute();
$resFactura = $stmtFactura->get_result();
$factura = $resFactura->fetch_assoc();
$stmtFactura->close();

if (!$factura) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Factura no encontrada para tu cuenta."]);
    exit;
}

$stmtItems = $conn_facturas->prepare("SELECT id, descripcion, cantidad, precio_unit, total FROM factura_items WHERE factura_id = ? ORDER BY id ASC");
if (!$stmtItems) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "No se pudo preparar la consulta de items."]);
    exit;
}

$stmtItems->bind_param('i', $facturaId);
$stmtItems->execute();
$resItems = $stmtItems->get_result();

$items = [];
while ($row = $resItems->fetch_assoc()) {
    $items[] = $row;
}
$stmtItems->close();
$conn_facturas->close();

echo json_encode([
    "success" => true,
    "data" => [
        "factura" => $factura,
        "items" => $items
    ]
]);
?>