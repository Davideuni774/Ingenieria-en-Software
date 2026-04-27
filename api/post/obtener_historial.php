<?php
include_once __DIR__ . '/../cors.php';
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . '/../../Phps/db_facturas.php';

if (!isset($conn_facturas) || $conn_facturas->connect_errno) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la BD."]);
    exit;
}

$id_usuario = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 0;
if ($id_usuario === 0 && isset($_SESSION['usuario_id'])) {
    $id_usuario = (int)$_SESSION['usuario_id'];
}

if ($id_usuario === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Usuario no autenticado."]);
    exit;
}

// Sentencia para obtener facturas de este usuario
$stmt = $conn_facturas->prepare("SELECT id, numero_factura, cliente_nombre as emisor, nit, fecha, subtotal, iva, total, pdf_nombre FROM facturas WHERE id_usuario = ? ORDER BY fecha DESC, id DESC");
if (!$stmt) {
    // Si la tabla facturas aún no tiene id_usuario, devolverá error. En ese caso devolvemos todas temporalmente para que no falle feo,
    // o mostramos error. Intentaremos obtener todas si falla.
    $stmt2 = $conn_facturas->prepare("SELECT id, numero_factura, cliente_nombre as emisor, nit, fecha, subtotal, iva, total, pdf_nombre FROM facturas ORDER BY fecha DESC, id DESC");
    if (!$stmt2) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Ocurrió un error al preparar la consulta."]);
        exit;
    }
    $stmt2->execute();
    $result = $stmt2->get_result();
    $facturas = [];
    while ($row = $result->fetch_assoc()) {
        $facturas[] = $row;
    }
    echo json_encode(["success" => true, "data" => $facturas, "note" => "Fallback: mostrando todas. Falta columna id_usuario."]);
    exit;
}

$stmt->bind_param('i', $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$facturas = [];
while ($row = $result->fetch_assoc()) {
    $facturas[] = $row;
}
$stmt->close();
$conn_facturas->close();

echo json_encode(["success" => true, "data" => $facturas]);
?>