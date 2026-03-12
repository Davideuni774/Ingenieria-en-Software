<?php
// test_db.php - Script de prueba rápida de conexión MySQL

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/Phps/db_config.php';

if (!isset($conn)) {
    echo "No existe la variable $conn. Revisa la ruta de Phps/db_config.php.";
    exit;
}

if ($conn->connect_errno) {
    echo "Error de conexión (" . $conn->connect_errno . "): " . htmlspecialchars($conn->connect_error);
} else {
    echo "Conexión OK a la base de datos '" . htmlspecialchars($conn->select_db($db_name) ? $db_name : 'desconocida') . "'.";
}
