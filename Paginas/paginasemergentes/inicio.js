document.addEventListener("DOMContentLoaded", function () {
    // Detectamos si estamos dentro de "paginasemergentes" u otro directorio
    // para ajustar rutas relativas (por ejemplo la salida de sesión o enlaces)
    const isInPaginasEmergentes = window.location.pathname.toLowerCase().includes('paginasemergentes/');
    const basePath = isInPaginasEmergentes ? '' : 'paginasemergentes/';
    const indexRoute = isInPaginasEmergentes ? '../../index.html' : '../index.html';

    // Para saber qué página es la activa
    const currentPath = window.location.pathname.split('/').pop();

    const headerStyles = `
    <style>
		/* ---------------- HEADER ---------------- */
		.header {
			background: #ffffff;
			border-bottom: 1px solid #e4e7eb;
			padding: 14px 32px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			position: sticky;
			top: 0;
			z-index: 10;
		}
		.header-left {
			display: flex;
			align-items: center;
			gap: 10px;
		}
		.header-logo {
			width: 70px; /* Tamaño del logo */
			height: auto;
			object-fit: contain;
		}
		.header-title {
			display: flex;
			flex-direction: column;
			line-height: 1.1;
		}
		.header-title span:first-child {
			font-weight: 700;
			color: #1c4f82;
		}
		.header-title span:last-child {
			font-size: 0.78rem;
			color: #7b8794;
		}
		.header-nav {
			display: flex;
			gap: 28px;
			align-items: center;
		}
		.header-nav a {
			text-decoration: none;
			font-size: 0.95rem;
			color: #7b8794;
			position: relative;
			padding-bottom: 4px;
		}
		.header-nav a.active {
			color: #1c4f82;
			font-weight: 600;
		}
		.header-nav a.active::after {
			content: "";
			position: absolute;
			left: 0;
			right: 0;
			bottom: -6px;
			height: 3px;
			border-radius: 999px;
			background: #1c9b5d;
		}
		.header-right {
			display: flex;
			align-items: center;
			gap: 18px;
		}
		.header-icon {
			width: 34px;
			height: 34px;
			border-radius: 50%;
			border: 1px solid #d8e2ec;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 18px;
			color: #7b8794;
		}
		.user-menu {
			display: flex;
			align-items: center;
			gap: 10px;
		}
		.user-avatar {
			width: 36px;
			height: 36px;
			border-radius: 999px;
			overflow: hidden;
			background: #d8e2ec;
		}
		.user-avatar img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		.user-info {
			display: flex;
			flex-direction: column;
			font-size: 0.82rem;
		}
		.user-info span:first-child {
			color: #9fb3c8;
		}
		.user-info span:last-child {
			font-weight: 600;
			color: #1f2933;
		}
		@media (max-width: 900px) {
			.header { padding-inline: 16px; }
			.header-nav { display: none; }
		}
    </style>
    `;

    const headerHTML = `
        <header class="header">
			<div class="header-left">
				<img src="https://i.imgur.com/qlfEJ79.png" alt="Logo FacturaSmart" class="header-logo">
				
				<div class="header-title">
					<span>FacturaSmart</span>
					<span>Gestión de facturas electrónicas</span>
				</div>
			</div>

			<nav class="header-nav">
				<a href="${basePath}inicio.html" class="${currentPath === 'inicio.html' || currentPath === '' ? 'active' : ''}">Inicio</a>
				<a href="${basePath}historial_facturas.html" class="${currentPath === 'historial_facturas.html' ? 'active' : ''}">Historial</a>
				<a href="javascript:exportarExcel()" class="${currentPath === 'exportar_excel.html' ? 'active' : ''}">Exportar a Excel</a>
			</nav>

			<div class="header-right">
				<div class="header-icon" style="cursor:pointer;">🔔</div>
				<div class="user-menu">
					<div class="user-info">
						<span>Hola,</span>
						<span id="nombre-usuario">Usuario</span>
					</div>
					<div class="user-avatar">
						<img src="#" alt="Foto de usuario">
					</div>
				</div>
				<a href="${indexRoute}" onclick="localStorage.removeItem('usuarioNombre');" style="margin-left:12px;font-size:0.8rem;color:#7b8794;text-decoration:none;font-weight:500;">Cerrar sesión</a>
			</div>
		</header>
    `;

    // Insertamos el HTML al principio del body (dentro de un contenedor padre si existe, o directo al body)
    const appContainer = document.querySelector('.app');
    if (appContainer) {
        appContainer.insertAdjacentHTML('afterbegin', headerStyles + headerHTML);
    } else {
        document.head.insertAdjacentHTML('beforeend', headerStyles);
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // Restauramos el nombre de usuario
    const userName = localStorage.getItem('usuarioNombre');
    if (userName) {
        const userElement = document.getElementById('nombre-usuario');
        if (userElement) userElement.textContent = userName;
    }
});

// Exponemos la función globalmente para que se use en botones y links
window.exportarExcel = function () {
    const isInPaginasEmergentes = window.location.pathname.toLowerCase().includes('paginasemergentes/');
    const exportarRoute = isInPaginasEmergentes ? 'exportar_excel.html' : 'paginasemergentes/exportar_excel.html';
    window.location.href = exportarRoute;
};