const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxqOL-jfNz3XCoO_jSblSdGQhGbkV_V3GU473A3fdGafLWwZj2H2N9jEodbUqZobn0/exec";
let mainChart;
let saludActual = 0;

async function fetchData() {
    const btn = document.querySelector('.btn-refresh');
    btn.innerText = "Cargando...";

    try {
        const response = await fetch(URL_SCRIPT);
        const json = await response.json();
        const d = json.datos;

        // Actualizar Números
        document.getElementById('val-mora').innerText = fmt(d.dineroEnMora);
        document.getElementById('val-meta').innerText = fmt(d.metaMensual);
        document.getElementById('val-ingreso').innerText = fmt(d.ingresosMesActual);
        document.getElementById('val-brecha').innerText = fmt(d.brecha);
        document.getElementById('val-salud').innerText = d.saludProyecto + "%";
        document.getElementById('txt-mora-count').innerText = `${d.totalClientesMora} clientes en mora`;
        document.getElementById('sync-status').innerText = `Sincronizado: ${json.actualizado}`;

        saludActual = parseFloat(d.saludProyecto);

        // Barras
        const pctIngreso = (d.ingresosMesActual / d.metaMensual) * 100;
        document.getElementById('ingreso-fill').style.width = `${Math.min(pctIngreso, 100)}%`;
        document.getElementById('health-fill').style.width = `${d.saludProyecto}%`;

        // Alerta Pago Especial
        const metaCard = document.getElementById('card-meta');
        if (d.alertaPagoEspecial) {
            metaCard.classList.add('special-alert');
            document.getElementById('label-meta').innerText = "🔥 PAGO ESPECIAL DETECTADO";
        } else {
            metaCard.classList.remove('special-alert');
            document.getElementById('label-meta').innerText = "META MENSUAL ESPERADA";
        }

        renderChart(d);
    } catch (e) { console.error(e); } finally { btn.innerText = " Actualizar datos nuevamente"; }
}

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

function renderChart(d) {
    const ctx = document.getElementById('financialChart').getContext('2d');
    if (mainChart) mainChart.destroy();
    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mora', 'Meta', 'Ingreso', 'Brecha'],
            datasets: [{
                data: [d.dineroEnMora, d.metaMensual, d.ingresosMesActual, d.brecha],
                backgroundColor: ['#ef4444', '#2563eb', '#10b981', '#f59e0b'],
                borderRadius: 10
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// Lógica de Salud
document.getElementById('health-trigger').onclick = function() {
    const modal = document.getElementById('health-modal');
    const body = document.getElementById('modal-body');
    let content = "";

    if (saludActual >= 90) {
        content = `<div class="status-desc"><h1>🟢</h1><h2 style="color:#10b981">${saludActual}% - Excelente</h2><p>La comunidad es financieramente estable. Los ingresos son predecibles y el riesgo es casi nulo.</p></div>`;
    } else if (saludActual >= 75) {
        content = `<div class="status-desc"><h1>🟡</h1><h2 style="color:#f59e0b">${saludActual}% - Atención</h2><p>Un segmento empieza a fallar. Revisar métodos de pago o comunicación.</p></div>`;
    } else {
        content = `<div class="status-desc"><h1>🔴</h1><h2 style="color:#ef4444">${saludActual}% - Crítico</h2><p>Alerta roja: en el 75% uno de cada cuatro no paga. Se necesitan medidas legales urgentes.</p></div>`;
    }
    body.innerHTML = content;
    modal.style.display = "block";
};

function closeModal() { document.getElementById('health-modal').style.display = "none"; }
window.onclick = function(e) { if(e.target == document.getElementById('health-modal')) closeModal(); }
window.onload = fetchData;