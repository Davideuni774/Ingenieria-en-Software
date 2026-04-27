// URL de tu API de FastAPI en Render
// External URL: https://mi-ia-backend-p528.onrender.com
const API_FACTURAS_URL = "https://mi-ia-backend-p528.onrender.com/procesar";

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const fileList = document.getElementById("file-list");
    const actionButtons = document.getElementById("action-buttons");
    const clearBtn = document.getElementById("clear-btn");
    const processBtn = document.getElementById("process-btn");

    let archivosSeleccionados = [];

    function renderListaArchivos() {
        fileList.innerHTML = "";
        if (archivosSeleccionados.length === 0) {
            actionButtons.style.display = "none";
            return;
        }

        actionButtons.style.display = "flex";

        archivosSeleccionados.forEach((file, index) => {
            const item = document.createElement("div");
            item.className = "file-item";
            item.innerHTML = `
                <span>${file.name}</span>
                <button class="remove-btn" data-index="${index}">✕</button>
            `;
            fileList.appendChild(item);
        });
    }

    function agregarArchivos(files) {
        for (const file of files) {
            if (file.type !== "application/pdf") continue;
            archivosSeleccionados.push(file);
        }
        renderListaArchivos();
    }

    // Click en el área de carga abre el selector
    dropZone.addEventListener("click", () => fileInput.click());

    // Selección por input
    fileInput.addEventListener("change", (e) => {
        agregarArchivos(e.target.files);
        // reset para poder volver a seleccionar los mismos archivos
        fileInput.value = "";
    });

    // Drag & drop
    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        if (!dt) return;
        agregarArchivos(dt.files);
    });

    // Quitar archivo individual
    fileList.addEventListener("click", (e) => {
        const btn = e.target.closest(".remove-btn");
        if (!btn) return;
        const index = parseInt(btn.dataset.index, 10);
        archivosSeleccionados.splice(index, 1);
        renderListaArchivos();
    });

    // Limpiar todo
    clearBtn.addEventListener("click", () => {
        archivosSeleccionados = [];
        renderListaArchivos();
    });

    // Enviar a la API (Render) y luego guardar en la BD (PHP)
    processBtn.addEventListener("click", async () => {
        if (archivosSeleccionados.length === 0) {
            alert("Primero selecciona al menos un PDF.");
            return;
        }

        const formData = new FormData();
        archivosSeleccionados.forEach(file => {
            formData.append("files", file, file.name);
        });

        processBtn.disabled = true;
        processBtn.textContent = "Procesando...";

        try {
            // 1) Enviar PDFs a la API de IA en Render
            const resp = await fetch(API_FACTURAS_URL, {
                method: "POST",
                body: formData
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Error ${resp.status}: ${text}`);
            }

            const data = await resp.json();
            // Guardamos en global para inspeccionar luego en la consola
            window.ultimaRespuestaIA = data;
            console.log("Respuesta IA:", data);

            // 2) Enviar el JSON resultante a PHP para guardarlo en MySQL
            try {
                // Inyectamos el ID de usuario si existe
                data.id_usuario = localStorage.getItem('usuarioId') || null;
                
                const guardarResp = await fetch("../../Phps/guardar_facturas.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (!guardarResp.ok) {
                    const txt = await guardarResp.text();
                    console.error("Error al guardar en la BD:", txt);
                    alert("La IA procesó las facturas, pero hubo un error al guardarlas en la base de datos.");
                    return;
                }

                const guardarData = await guardarResp.json().catch(() => null);
                console.log("Respuesta guardar_facturas.php:", guardarData);
                alert("Facturas procesadas y guardadas correctamente.");
            } catch (e) {
                console.error("Fallo al llamar a guardar_facturas.php", e);
                alert("Las facturas se procesaron, pero no se pudieron guardar en la base de datos.");
            }
        } catch (err) {
            console.error(err);
            alert("Ocurrió un error al procesar las facturas.");
        } finally {
            processBtn.disabled = false;
            processBtn.textContent = "Subir y Procesar";
        }
    });
});
