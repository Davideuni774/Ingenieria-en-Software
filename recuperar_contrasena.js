document.addEventListener('DOMContentLoaded', () => {
    const formVerifyEmail = document.getElementById('form-verify-email');
    const formChangePassword = document.getElementById('form-change-password');
    const stepEmail = document.getElementById('step-email');
    const stepPassword = document.getElementById('step-password');
    const emailMsg = document.getElementById('email-msg');
    const passwordMsg = document.getElementById('password-msg');

    // Step 1: Verificar el correo electrónico
    if (formVerifyEmail) {
        formVerifyEmail.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('recovery-email').value.trim();
            emailMsg.className = 'message hidden';
            
            try {
                const response = await fetch('../api/post/verificar_correo.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: email })
                });

                const data = await response.json();

                if (data.success) {
                    // Mostrar paso 2
                    stepEmail.classList.add('hidden');
                    stepPassword.classList.remove('hidden');
                    
                    document.getElementById('user-name-display').textContent = data.nombre;
                    document.getElementById('verified-email').value = email;
                } else {
                    emailMsg.textContent = data.message || 'Error al verificar el correo.';
                    emailMsg.className = 'message error';
                }
            } catch (err) {
                console.error(err);
                emailMsg.textContent = 'Error de conexión con el servidor.';
                emailMsg.className = 'message error';
            }
        });
    }

    // Step 2: Cambiar la contraseña
    if (formChangePassword) {
        formChangePassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('verified-email').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            passwordMsg.className = 'message hidden';

            if (newPassword !== confirmPassword) {
                passwordMsg.textContent = 'Las contraseñas no coinciden.';
                passwordMsg.className = 'message error';
                return;
            }

            try {
                const response = await fetch('../api/post/cambiar_contrasena.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: email, nueva_clave: newPassword })
                });

                const data = await response.json();

                if (data.success) {
                    passwordMsg.textContent = '¡Contraseña actualizada exitosamente! Redirigiendo...';
                    passwordMsg.className = 'message success';
                    
                    formChangePassword.reset();
                    
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 2500);
                } else {
                    passwordMsg.textContent = data.message || 'Error al actualizar la contraseña.';
                    passwordMsg.className = 'message error';
                }
            } catch (err) {
                console.error(err);
                passwordMsg.textContent = 'Error de conexión con el servidor.';
                passwordMsg.className = 'message error';
            }
        });
    }
});