// Funciones para la página de inicio de sesión

// Función para mostrar/ocultar contraseña
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// Función para manejar el envío del formulario
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validaciones básicas
        if (!validateEmail(email)) {
            showAlert('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAlert('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }
        
        // Mostrar carga
        showLoading(true);
        
        // Simular proceso de login (reemplaza con tu lógica de autenticación)
        setTimeout(() => {
            showLoading(false);
            
            // Aquí iría tu lógica de autenticación real
            if (authenticateUser(email, password)) {
                if (remember) {
                    localStorage.setItem('rememberUser', email);
                }
                showAlert('Inicio de sesión exitoso', 'success');
                // Redirigir al dashboard o página principal
                // window.location.href = 'Paginas/dashboard.html';
            } else {
                showAlert('Credenciales incorrectas. Inténtalo de nuevo.', 'error');
            }
        }, 1500);
    });
    
    // Cargar email guardado si existe
    const rememberedEmail = localStorage.getItem('rememberUser');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
});

// Función para validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función simulada de autenticación (reemplaza con tu lógica real)
function authenticateUser(email, password) {
    // Esta es una función de ejemplo - reemplaza con tu lógica de autenticación real
    const validUsers = [
        { email: 'admin@facturasmart.com', password: '123456' },
        { email: 'demo@demo.com', password: 'demo123' }
    ];
    
    return validUsers.some(user => user.email === email && user.password === password);
}

// Función para mostrar alertas
function showAlert(message, type = 'info') {
    // Remover alerta existente si hay una
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
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
    
    // Insertar la alerta al principio del form-container
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(alert, formContainer.firstChild);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alert && alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Función para mostrar/ocultar indicador de carga
function showLoading(show) {
    const loginBtn = document.querySelector('.login-btn');
    
    if (show) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        loginBtn.disabled = true;
    } else {
        loginBtn.innerHTML = 'Iniciar Sesión';
        loginBtn.disabled = false;
    }
}

// Funciones para login con redes sociales
function loginWithFacebook() {
    showAlert('Función de Facebook en desarrollo', 'info');
    // Aquí implementarías la integración con Facebook SDK
    console.log('Login con Facebook');
}

function loginWithGoogle() {
    showAlert('Función de Google en desarrollo', 'info');
    // Aquí implementarías la integración con Google Sign-In
    console.log('Login con Google');
}

function loginWithApple() {
    showAlert('Función de Apple en desarrollo', 'info');
    // Aquí implementarías la integración con Apple Sign-In
    console.log('Login con Apple');
}

// Efectos visuales adicionales
document.addEventListener('DOMContentLoaded', function() {
    // Efecto de focus en los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });
    });
    
    // Animación de entrada para elementos
    const elements = document.querySelectorAll('.input-group, .form-options, .login-btn, .social-btn');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Manejo de errores de conexión
window.addEventListener('online', function() {
    showAlert('Conexión restablecida', 'success');
});

window.addEventListener('offline', function() {
    showAlert('Sin conexión a internet', 'error');
});

// Prevenir envío múltiple del formulario
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        if (isSubmitting) {
            e.preventDefault();
            return;
        }
        isSubmitting = true;
        
        // Resetear después de un tiempo
        setTimeout(() => {
            isSubmitting = false;
        }, 3000);
    });
});