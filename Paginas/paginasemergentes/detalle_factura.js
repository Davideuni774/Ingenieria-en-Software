document.addEventListener('DOMContentLoaded', async function () {
    const statusMessage = document.getElementById('status-message');
    const itemsBody = document.getElementById('items-body');
    const saveBtn = document.getElementById('save-btn');
    const addItemBtn = document.getElementById('add-item-btn');

    const params = new URLSearchParams(window.location.search);
    const facturaId = Number(params.get('id') || 0);

    if (!facturaId) {
        statusMessage.style.color = '#ef4444';
        statusMessage.textContent = 'ID de factura inválido.';
        saveBtn.disabled = true;
        return;
    }

    const isInPaginasEmergentes = window.location.pathname.toLowerCase().includes('paginasemergentes/');
    const detalleApiPath = isInPaginasEmergentes ? '../../api/post/obtener_detalle_factura.php' : '../api/post/obtener_detalle_factura.php';
    const actualizarApiPath = isInPaginasEmergentes ? '../../api/post/actualizar_detalle_factura.php' : '../api/post/actualizar_detalle_factura.php';

    function setFacturaFields(factura) {
        document.getElementById('emisor').value = factura.emisor || '';
        document.getElementById('nit').value = factura.nit || '';
        document.getElementById('numero_factura').value = factura.numero_factura || '';
        document.getElementById('fecha').value = factura.fecha || '';
        document.getElementById('subtotal').value = factura.subtotal ?? 0;
        document.getElementById('iva').value = factura.iva ?? 0;
        document.getElementById('total').value = factura.total ?? 0;
        document.getElementById('pdf_nombre').value = factura.pdf_nombre || '';
    }

    function createItemRow(item = {}) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="item-descripcion" value="${item.descripcion || ''}" /></td>
            <td><input type="number" class="item-cantidad" step="0.01" value="${item.cantidad ?? 0}" /></td>
            <td><input type="number" class="item-precio" step="0.01" value="${item.precio_unit ?? 0}" /></td>
            <td><input type="number" class="item-total" step="0.01" value="${item.total ?? 0}" /></td>
            <td><button type="button" class="btn btn-danger remove-item-btn">Eliminar</button></td>
        `;

        const cantidadInput = tr.querySelector('.item-cantidad');
        const precioInput = tr.querySelector('.item-precio');
        const totalInput = tr.querySelector('.item-total');

        function recalcularTotalItem() {
            const cant = Number(cantidadInput.value || 0);
            const precio = Number(precioInput.value || 0);
            totalInput.value = (cant * precio).toFixed(2);
        }

        cantidadInput.addEventListener('input', recalcularTotalItem);
        precioInput.addEventListener('input', recalcularTotalItem);

        tr.querySelector('.remove-item-btn').addEventListener('click', () => {
            tr.remove();
        });

        itemsBody.appendChild(tr);
    }

    async function cargarDetalle() {
        try {
            const url = new URL(detalleApiPath, window.location.href);
            url.searchParams.append('id', facturaId);

            const resp = await fetch(url.toString(), {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            const json = await resp.json();

            if (!resp.ok || !json.success) {
                throw new Error(json.message || 'No se pudo cargar el detalle.');
            }

            const { factura, items } = json.data;
            setFacturaFields(factura);

            itemsBody.innerHTML = '';
            if (!items || items.length === 0) {
                createItemRow();
            } else {
                items.forEach((it) => createItemRow(it));
            }

            statusMessage.style.color = '#1d4ed8';
            statusMessage.textContent = 'Detalle cargado. Ya puedes editar y guardar cambios.';
        } catch (e) {
            statusMessage.style.color = '#ef4444';
            statusMessage.textContent = e.message || 'Error al cargar detalle.';
            saveBtn.disabled = true;
        }
    }

    async function guardarCambios() {
        statusMessage.style.color = '#1d4ed8';
        statusMessage.textContent = 'Guardando cambios...';

        const payload = {
            factura_id: facturaId,
            factura: {
                emisor: document.getElementById('emisor').value.trim(),
                nit: document.getElementById('nit').value.trim(),
                numero_factura: document.getElementById('numero_factura').value.trim(),
                fecha: document.getElementById('fecha').value,
                subtotal: Number(document.getElementById('subtotal').value || 0),
                iva: Number(document.getElementById('iva').value || 0),
                total: Number(document.getElementById('total').value || 0)
            },
            items: Array.from(itemsBody.querySelectorAll('tr')).map((row) => ({
                descripcion: row.querySelector('.item-descripcion').value.trim(),
                cantidad: Number(row.querySelector('.item-cantidad').value || 0),
                precio_unit: Number(row.querySelector('.item-precio').value || 0),
                total: Number(row.querySelector('.item-total').value || 0)
            }))
        };

        try {
            const resp = await fetch(new URL(actualizarApiPath, window.location.href).toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const json = await resp.json();
            if (!resp.ok || !json.success) {
                throw new Error(json.message || 'No se pudo guardar.');
            }

            statusMessage.style.color = '#16a34a';
            statusMessage.textContent = 'Cambios guardados correctamente.';
        } catch (e) {
            statusMessage.style.color = '#ef4444';
            statusMessage.textContent = e.message || 'Error al guardar cambios.';
        }
    }

    addItemBtn.addEventListener('click', () => createItemRow());
    saveBtn.addEventListener('click', guardarCambios);

    await cargarDetalle();
});
