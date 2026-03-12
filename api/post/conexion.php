<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir configuración central
include_once __DIR__ . '/../../Phps/db_config.php';

if (!isset($conn) || ($conn instanceof mysqli && $conn->connect_errno)) {
    $err = isset($conn_error) ? $conn_error : 'Unknown connection error';
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos',
        'error' => $err
    ]);
    exit;
}

// Establecer charset para evitar problemas con caracteres especiales
$conn->set_charset("utf8");

// Respuesta de éxito
echo json_encode([
    'success' => true,
    'message' => 'Conexión exitosa a la base de datos'
]);
?>
