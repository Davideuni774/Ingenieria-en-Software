// login-cuenta.js - Maneja el login con AJAX/JSON

// Capturar la URL del script actual para determinar la raíz del sitio de forma robusta
const _currentScriptSrc = document.currentScript ? document.currentScript.src : '';

document.addEventListener('DOMContentLoaded', () => {
    const IS_GHPAGES = /github\.io$/i.test(location.hostname);
    
    // Calcular SITE_ROOT basado en la ubicación de este script (que está en la raíz)
    let SITE_ROOT = '';
    if (_currentScriptSrc) {
        const match = _currentScriptSrc.match(/^(.*\/)login-cuenta\.js(\?.*)?$/i);
        if (match) SITE_ROOT = match[1];
    }
    // Fallback
    if (!SITE_ROOT) {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('/paginas/paginasemergentes/')) SITE_ROOT = '../../';
        else if (path.includes('/paginas/')) SITE_ROOT = '../';
    }

    const REMOTE_ORIGIN = (typeof window !== 'undefined' && window.BACKEND_ORIGIN) ? String(window.BACKEND_ORIGIN).replace(/\/$/, '') : '';
    // Helper: Mostrar un toast no modal en la esquina superior derecha
    function showToast(message, type = 'info') {
        const existing = document.getElementById('site-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'site-toast';
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.top = '16px';
        toast.style.right = '16px';
        toast.style.background = type === 'success' ? '#2ecc71' : (type === 'error' ? '#e74c3c' : '#333');
        toast.style.color = '#fff';
        toast.style.padding = '10px 14px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
        toast.style.zIndex = 99999;
        toast.style.fontFamily = 'Arial, sans-serif';
        toast.style.fontSize = '14px';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity 300ms ease';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

    const formulario = document.getElementById('form-login');
    const respEl = document.getElementById('respuesta-login');
    const submitBtn = formulario ? formulario.querySelector('button[type="submit"]') : null;

    if (!formulario) {
        console.error('❌ No se encontró el formulario de login');
        return;
    }

    console.log('✅ Formulario de login encontrado, escuchando submit...');

    // Aviso en GH Pages
    if (IS_GHPAGES && !REMOTE_ORIGIN) {
        const note = document.createElement('div');
        note.textContent = 'Inicio de sesión deshabilitado en GitHub Pages (requiere backend PHP). Prueba en tu servidor XAMPP o hosting.';
        note.style.background = '#fff3cd';
        note.style.color = '#856404';
        note.style.border = '1px solid #ffeeba';
        note.style.padding = '10px 12px';
        note.style.borderRadius = '8px';
        note.style.margin = '10px 0';
        (formulario.parentElement || document.body).insertBefore(note, formulario);
    }

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        if (IS_GHPAGES && !REMOTE_ORIGIN) {
            showToast('Esta acción requiere backend. Prueba en XAMPP o hosting con PHP.', 'error');
            return;
        }

        const formData = new FormData(formulario);
        const dataObjeto = {};
        for (const [k, v] of formData.entries()) {
            dataObjeto[k] = v;
        }

        console.log('🔐 Enviando datos de login:', {
            correo: dataObjeto.correo || '(vacío)',
            clave: dataObjeto.clave ? '🔒 [ENCRIPTADA]' : '(vacío)'
        });
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 CONFIRMACIÓN DE DATOS A ENVIAR:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Correo:', dataObjeto.correo);
        console.log('🔐 Contraseña:', '●●●●●●●● (protegida)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 Enviando al servidor...');

        function sendPayload(payload) {
            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.dataset.origText = submitBtn.textContent;
                    submitBtn.textContent = 'Iniciando sesión...';
                }

                const xhr = new XMLHttpRequest();
                const base = REMOTE_ORIGIN ? (REMOTE_ORIGIN + '/api/post') : (SITE_ROOT + 'api/post');
                xhr.open('POST', base + "/login-cuenta.php", true);
                if (REMOTE_ORIGIN) {
                    xhr.withCredentials = true; // permitir cookies/sesión entre dominios
                }
                xhr.timeout = 15000;
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        let msg = 'Inicio de sesión exitoso.';
                        try {
                            const json = JSON.parse(xhr.responseText);
                            console.log('✅ Respuesta servidor:', json);
                            if (json && json.message) msg = json.message;
                            if (json && json.success) {
                                console.log('✅ Éxito:', msg);
                                // Mostrar mensaje no modal en pantalla
                                try { showToast(msg, 'success'); } catch (e) {}
                                // Redirigir al perfil después de 1.5 segundos
                                setTimeout(() => {
                                    window.location.href = 'perfil.html';
                                }, 1500);
                            } else {
                                console.warn('⚠️ Login no exitoso:', msg);
                                try { showToast(msg, 'error'); } catch (e) {}
                            }
                        } catch (e) {
                            if (xhr.responseText && xhr.responseText.trim()) msg = xhr.responseText.trim();
                            console.log('✅ Respuesta servidor (no JSON):', msg);
                        }
                        console.log('Respuesta completa:', xhr.responseText);
                    } else {
                        console.error('❌ Error:', xhr.status, xhr.statusText);
                        let serverMsg = 'Error al iniciar sesión.';
                        try {
                            if (xhr.responseText) {
                                const jsonErr = JSON.parse(xhr.responseText);
                                if (jsonErr && (jsonErr.message || jsonErr.mensaje)) serverMsg = jsonErr.message || jsonErr.mensaje;
                                else serverMsg = xhr.responseText;
                            }
                        } catch (e) {
                            if (xhr.responseText && xhr.responseText.trim()) serverMsg = xhr.responseText.trim();
                        }
                        console.error('❌ Error del servidor:', serverMsg);
                        console.error('Detalle respuesta servidor:', xhr.responseText);
                    }
                };

                xhr.onerror = function () {
                    console.error('❌ Network error al enviar - Verifica tu conexión');
                };

                xhr.ontimeout = function () {
                    console.error('❌ Timeout al enviar - El servidor no respondió a tiempo');
                };

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = submitBtn.dataset.origText || 'Continuar';
                        }
                    }
                };

                xhr.send(JSON.stringify(payload));
            } catch (err) {
                console.error('❌ Exception al enviar payload:', err);
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.origText || 'Continuar'; }
            }
        }

        sendPayload(dataObjeto);
    });
});
