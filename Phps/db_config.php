<?php
// Phps/db_config.php - Configuración de conexión a la base de datos

// IMPORTANTE: Rellena estos valores con los datos que te da InfinityFree
//   - DB Host
//   - DB Username
//   - DB Password
//   - DB Name

$db_host = 'sql309.infinityfree.com';     // Cambia sqlXXX por el host exacto
$db_user = 'if0_41353119';               // Usuario de la base de datos
$db_pass = 'Manchasymd10';           // Contraseña de la base de datos
$db_name = 'if0_41353119_cuentas';      // Nombre de la base de datos

$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_errno) {
    // Log de error para depuración en el servidor
    error_log('[DB_CONFIG] Error de conexión MySQL: ' . $conn->connect_error);
}
