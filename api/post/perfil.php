<?php
// api/post/perfil.php - Obtener datos del perfil del usuario logueado
include_once __DIR__ . '/../cors.php';
session_start();
header("Content-Type: application/json; charset=utf-8");

// Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No has iniciado sesión."]);
    exit;
}

include_once __DIR__ . '/../../Phps/db_config.php';

if (!isset($conn) || $conn->connect_errno) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos."]);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

$stmt = $conn->prepare("SELECT nombre, correo, telefono, fecha_registro FROM cuentas WHERE id = ?");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "data" => [
            "nombre" => $row['nombre'],
            "correo" => $row['correo'],
            "telefono" => $row['telefono'] ? $row['telefono'] : 'No registrado',
            "fecha_registro" => $row['fecha_registro']
        ]
    ]);
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
}

$stmt->close();
$conn->close();
?>
