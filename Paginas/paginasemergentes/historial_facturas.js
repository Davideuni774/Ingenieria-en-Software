document.addEventListener('DOMContentLoaded', async function () {
    const tablaHistorial = document.getElementById('tabla-historial');
    const loadingMessage = document.getElementById('loading-message');

    // URL para obtener el historial
    const isInPaginasEmergentes = window.location.pathname.toLowerCase().includes('paginasemergentes/');
    const apiPath = isInPaginasEmergentes ? '../../api/post/obtener_historial.php' : '../api/post/obtener_historial.php';

    try {
        const url = new URL(apiPath, window.location.href);

        const respuesta = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const json = await respuesta.json();
        
        loadingMessage.style.display = 'none';

        if (!respuesta.ok || !json.success) {
            tablaHistorial.innerHTML = `<tr><td colspan="6" class="empty-state">No se pudo cargar el historial: ${json.message || 'Error desconocido'}</td></tr>`;
            return;
        }

        const facturas = json.data;

        if (!facturas || facturas.length === 0) {
            tablaHistorial.innerHTML = `<tr><td colspan="6" class="empty-state">No tienes facturas procesadas aún.</td></tr>`;
            return;
        }

        facturas.forEach(f => {
            const tr = document.createElement('tr');
            
            // Formatear valores
            const totalStr = f.total != null ? '$' + Number(f.total).toLocaleString('es-CO') : 'N/A';
            const numFactura = f.numero_factura || 'S/N';
            const emisor = f.emisor || 'Desconocido';
            const nit = f.nit ? `<br><small style="color: #7b8794;">NIT: ${f.nit}</small>` : '';
            const fecha = f.fecha ? f.fecha : 'S/F';
            const pdfName = f.pdf_nombre || 'N/A';
            
            tr.innerHTML = `
                <td style="font-weight: 500;">${numFactura}</td>
                <td>${emisor} ${nit}</td>
                <td>${fecha}</td>
                <td style="font-weight: bold; color: #1c9b5d;">${totalStr}</td>
                <td style="font-size: 0.85em; color: #4a5568;">${pdfName}</td>
                <td><button class="btn-secondary" onclick="verDetalles(${f.id})">Ver Detalles</button></td>
            `;
            
            tablaHistorial.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al obtener el historial:', error);
        loadingMessage.style.display = 'none';
        tablaHistorial.innerHTML = `<tr><td colspan="6" class="empty-state">Ocurrió un error al contactar con el servidor.</td></tr>`;
    }
});

function verDetalles(idFactura) {
    alert('Función "Ver Detalles" para la factura ID ' + idFactura + ' en desarrollo.');
    // Aquí se implementará la ventana modal para ver las columnas adicionales: subtotal, iva, etc.
}