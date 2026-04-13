<?php
// Evitar advertencias CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

include_once __DIR__ . '/../cors.php';
header("Content-Type: application/json; charset=utf-8");

$raw = file_get_contents("php://input");
$data = $raw ? json_decode($raw, true) : null;

if (!$data || !isset($data['correo']) || !isset($data['nueva_clave'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

$correo = trim($data['correo']);
$nueva_clave = $data['nueva_clave'];

if (empty($correo) || strlen($nueva_clave) < 6) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos inválidos o la contraseña es muy corta."]);
    exit;
}

include_once __DIR__ . '/../../Phps/db_config.php';

if (!isset($conn) || $conn->connect_errno) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de conexión a la base de datos."]);
    exit;
}

// Hash de la nueva contraseña (como en login-cuenta)
$clave_hash = password_hash($nueva_clave, PASSWORD_BCRYPT);

// Actualizar la contraseña
$stmt = $conn->prepare("UPDATE cuentas SET clave = ? WHERE correo = ?");
$stmt->bind_param('ss', $clave_hash, $correo);
$stmt->execute();

if ($stmt->affected_rows >= 0) {
    echo json_encode(["success" => true, "message" => "Contraseña actualizada correctamente."]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Hubo un problema al actualizar la contraseña."]);
}

$stmt->close();
$conn->close();
?>