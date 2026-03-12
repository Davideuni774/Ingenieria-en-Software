<?php
// api/post/login-cuenta.php - Endpoint JSON para login de cuentas
include_once __DIR__ . '/../cors.php';
session_start();
header("Content-Type: application/json; charset=utf-8");

// Leer JSON de entrada
$raw = file_get_contents("php://input");
$data = $raw ? json_decode($raw, true) : null;

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Entrada inválida, JSON esperado."]);
    exit;
}

$correo = trim($data['correo'] ?? '');
$clave = $data['clave'] ?? '';

// Validaciones básicas
if (empty($correo) || empty($clave)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Por favor completa correo y contraseña."]);
    exit;
}

// Conectar usando configuración central
include_once __DIR__ . '/../../Phps/db_config.php';
if (!isset($conn) || $conn->connect_errno) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al conectar con la base de datos."]);
    exit;
}

// Buscar cuenta por correo
$stmt = $conn->prepare("SELECT id, nombre, correo, clave FROM cuentas WHERE correo = ? LIMIT 1");
$stmt->bind_param('s', $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Correo o contraseña incorrectos."]);
    $stmt->close();
    $conn->close();
    exit;
}

$row = $result->fetch_assoc();

// Verificar contraseña usando el hash almacenado en la base de datos
if (isset($row['clave']) && password_verify($clave, $row['clave'])) {
    session_regenerate_id(true);
    $_SESSION['usuario'] = $row['nombre'];
    $_SESSION['correo'] = $row['correo'];
    $_SESSION['usuario_id'] = $row['id'];

    echo json_encode([
        "success" => true,
        "message" => "Inicio de sesión exitoso.",
        "data" => [
            "nombre" => $row['nombre'],
            "correo" => $row['correo']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Correo o contraseña incorrectos."]);
}

$stmt->close();
$conn->close();
?>
