<?php
// Evitar advertencias CORS para peticiones pre-flight si existen
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

if (!$data || !isset($data['correo'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Entrada inválida o correo no proporcionado."]);
    exit;
}

$correo = trim($data['correo']);

if (empty($correo)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El correo no puede estar vacío."]);
    exit;
}

include_once __DIR__ . '/../../Phps/db_config.php';

if (!isset($conn) || $conn->connect_errno) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al conectar con la base de datos."]);
    exit;
}

// Buscar el usuario por correo
$stmt = $conn->prepare("SELECT nombre FROM cuentas WHERE correo = ? LIMIT 1");
$stmt->bind_param('s', $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "No se encontró ninguna cuenta con este correo."]);
    $stmt->close();
    $conn->close();
    exit;
}

$row = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "nombre" => $row['nombre']
]);

$stmt->close();
$conn->close();
?>