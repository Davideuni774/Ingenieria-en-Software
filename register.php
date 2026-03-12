<?php
// register.php - Maneja el registro de nuevos usuarios
session_start();
header("Content-Type: text/html; charset=utf-8");

$mensaje = "";

// Log para debugging
error_log("[REGISTER] POST recibido: " . print_r($_POST, true));

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = trim($_POST['nombre'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $clave = $_POST['clave'] ?? '';
    $confirmar_clave = $_POST['confirmar_clave'] ?? '';

    // Validaciones
    if (empty($nombre) || empty($correo) || empty($clave) || empty($confirmar_clave)) {
        $mensaje = "Todos los campos son obligatorios (excepto teléfono).";
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $mensaje = "El correo electrónico no es válido.";
    } elseif ($clave !== $confirmar_clave) {
        $mensaje = "Las contraseñas no coinciden.";
    } elseif (strlen($clave) < 6) {
        $mensaje = "La contraseña debe tener al menos 6 caracteres.";
    } else {
        // Conectar usando configuración central (actualiza Phps/db_config.php con los datos de InfinityFree)
        include_once __DIR__ . '/Phps/db_config.php';
        if (!isset($conn) || $conn->connect_errno) {
            $mensaje = "Error conectando al servidor de base de datos. Ver logs del servidor.";
        } else {
            // Verificar que la tabla exista
            $tblCheck = $conn->query("SHOW TABLES LIKE 'cuentas'");
            if (!$tblCheck || $tblCheck->num_rows === 0) {
                $mensaje = "La tabla 'cuentas' no existe. Crea la tabla en phpMyAdmin antes de usar el registro.";
            } else {
                // Verificar si el correo ya existe
                $stmt = $conn->prepare("SELECT id FROM cuentas WHERE correo = ?");
                $stmt->bind_param('s', $correo);
                $stmt->execute();
                $stmt->store_result();

                if ($stmt->num_rows > 0) {
                    $mensaje = "El correo ya está registrado. Por favor usa otro correo.";
                } else {
                    // Hash de la contraseña
                    $clave_hash = password_hash($clave, PASSWORD_DEFAULT);

                    // Insertar nueva cuenta
                    $stmt_insert = $conn->prepare("INSERT INTO cuentas (nombre, correo, telefono, clave) VALUES (?, ?, ?, ?)");
                    $stmt_insert->bind_param('ssss', $nombre, $correo, $telefono, $clave_hash);

                    if ($stmt_insert->execute()) {
                        // Registro exitoso - iniciar sesión automáticamente
                        $_SESSION['usuario'] = $nombre;
                        $_SESSION['correo'] = $correo;
                        $_SESSION['usuario_id'] = $stmt_insert->insert_id;

                        // Confirmaciones en consola + redirección diferida a la página de inicio de sesión
                        echo '<script>
                            console.group("[REGISTER] Flujo de registro");
                            console.log("Estado: Registro exitoso en el servidor.");
                            console.log("Datos del usuario creado:", {
                                nombre: "' . addslashes($nombre) . '",
                                correo: "' . addslashes($correo) . '",
                                telefono: "' . addslashes($telefono) . '"
                            });
                            console.log("Acción: Esperando 5 segundos antes de redirigir a la pantalla de inicio de sesión (Index.html)...");
                            console.groupEnd();

                            setTimeout(function() {
                                console.info("[REGISTER] Redirigiendo ahora a Index.html para iniciar sesión.");
                                window.location.href = "Index.html";
                            }, 5000);
                        </script>';
                        exit();
                    } else {
                        $mensaje = "Error al registrar la cuenta: " . $stmt_insert->error;
                    }
                    $stmt_insert->close();
                }
                $stmt->close();
            }
        }
    }
}
// Si hubo algún error de validación o de base de datos, mostrarlo en consola y al usuario
if (!empty($mensaje)) {
    $safeNombre = isset($nombre) ? addslashes($nombre) : '';
    $safeCorreo = isset($correo) ? addslashes($correo) : '';
    $safeTelefono = isset($telefono) ? addslashes($telefono) : '';

    echo '<script>
        console.group("[REGISTER] Error en el registro");
        console.error("Mensaje:", "' . addslashes($mensaje) . '");
        console.log("Datos enviados (sin contraseña):", {
            nombre: "' . $safeNombre . '",
            correo: "' . $safeCorreo . '",
            telefono: "' . $safeTelefono . '"
        });
        console.warn("Acción: Mostrando alerta al usuario y regresando a la página anterior para corregir los datos.");
        console.groupEnd();

        alert("' . addslashes($mensaje) . '");
        window.history.back();
    </script>';
}
?>
