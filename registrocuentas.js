// registrocuentas.js - Lógica de registro para Factura Smart

// Mostrar/ocultar contraseña en los campos del formulario de registro
function togglePasswordField(fieldId, btn) {
    const input = document.getElementById(fieldId);
    if (!input) return;

    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Mostrar mensajes de error/éxito reutilizando los estilos de alertas del login
function showRegisterAlert(message, type = 'info') {
    const container = document.querySelector('.form-container');
    if (!container) return;

    const existing = container.querySelector('.alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    container.insertBefore(alert, container.firstChild);

    setTimeout(() => {
        if (alert && alert.parentElement) alert.remove();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const clave = document.getElementById('clave').value;
        const confirmar = document.getElementById('confirmar_clave').value;

        // Validaciones básicas antes de enviar a PHP
        if (!nombre) {
            e.preventDefault();
            showRegisterAlert('Por favor, ingresa tu nombre completo.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            e.preventDefault();
            showRegisterAlert('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        if (clave.length < 6) {
            e.preventDefault();
            showRegisterAlert('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        if (clave !== confirmar) {
            e.preventDefault();
            showRegisterAlert('Las contraseñas no coinciden.', 'error');
            return;
        }
        // Si todo está bien, el formulario se envía normalmente a register.php
    });
});

