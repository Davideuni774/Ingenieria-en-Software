<?php
// Phps/db_facturas.php - Conexión específica para la BD de facturas

$db_host = 'sql309.infinityfree.com';     // mismo host
$db_user = 'if0_41353119';                // mismo usuario
$db_pass = 'Manchasymd10';                // misma contraseña
$db_name = 'if0_41353119_facturas_clientes'; // BD de facturas

$conn_facturas = @new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn_facturas->connect_errno) {
    error_log('[DB_FACTURAS] Error de conexión MySQL: ' . $conn_facturas->connect_error);
}
