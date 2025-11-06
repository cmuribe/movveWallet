function esDiaHabil(f) {
  const d = f.getDay();
  return d >= 1 && d <= 5;
}

let chartInstance;

// Plugin “pulse” en el último punto
Chart.register({
  id: 'profitPulse',
  afterDatasetDraw(chart) {
    const p = chart.getDatasetMeta(0).data.slice(-1)[0];
    if (!p) return;
    const ctx = chart.ctx;
    const r = 6 + Math.sin(Date.now()/200)*2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(26,255,58,0.25)';
    ctx.fill();
    ctx.restore();
  }
});

function calcularProyeccion() {
  const monto = parseFloat(document.getElementById("monto").value);
  const periodo = parseInt(document.getElementById("periodo").value);
  const unidad = document.getElementById("unidad").value;
  const error = document.getElementById("mensaje-error");
  const resDiv = document.getElementById("resultado");

  error.textContent = "";
  resDiv.classList.add("oculto");
  resDiv.innerHTML = "";

  if (!monto || monto <= 0) {
    error.textContent = "Ingresa un monto válido.";
    return;
  }
  if (!periodo || periodo <= 0) {
    error.textContent = "Ingresa un período válido.";
    return;
  }

  const hoy = new Date();
  let fechaFin = new Date(hoy);
  if (unidad === "meses") fechaFin.setMonth(fechaFin.getMonth() + periodo);
  else fechaFin.setFullYear(fechaFin.getFullYear() + periodo);

  let capital = monto;
  let aux = new Date(hoy);
  let diasHabiles = 0;
  const valores = [capital];

  while (aux <= fechaFin) {
    aux.setDate(aux.getDate() + 1);
    if (esDiaHabil(aux)) {
      capital *= 1.009;     // 0.9 % diario
      valores.push(capital);
      diasHabiles++;
    }
  }

  const retorno = ((capital / monto) - 1) * 100;

  function animarValor(el, ini, fin, dur = 1200) {
    const paso = 16, total = dur / paso;
    let i = 0;
    const int = setInterval(() => {
      i++;
      el.textContent = (ini + (fin - ini) * (i / total))
        .toLocaleString("es-ES", { minimumFractionDigits: 2 });
      if (i >= total) clearInterval(int);
    }, paso);
  }

  dibujarGrafica(valores);

  // Cálculo CAGR (anual equivalente)
  const años = diasHabiles / 252;
  const factor = capital / monto;
  const cagr = Math.pow(factor, 1 / años) - 1;

  // Construcción del resultado
  resDiv.innerHTML = `
    <p>Monto inicial: <strong id="vInicial"></strong> USD</p>
    <p>Período: <strong>${periodo} ${unidad}</strong></p>
    <p>Valor final proyectado: <strong id="vFinal"></strong> USD</p>
    <p>Retorno total: <strong id="vRetorno"></strong></p>
    <p>Días hábiles contados: <strong>${diasHabiles}</strong></p>
    <p>Equivalente anual (CAGR): <strong>${(cagr*100).toFixed(2)} %</strong></p>
    <p>Fecha proyectada: <strong>${fechaFin.toLocaleDateString("es-ES")}</strong></p>
    <p class="nota">*El cálculo considera solo días hábiles reales (lunes a viernes) y una tasa de 0.9 % diario compuesto.</p>
  `;

  resDiv.classList.remove("oculto");

  animarValor(document.getElementById("vInicial"), 0, monto);
  animarValor(document.getElementById("vFinal"), 0, capital);
  animarValor(document.getElementById("vRetorno"), 0, retorno, 1400);
  setTimeout(()=>document.getElementById("vRetorno").textContent += " %",1500);
}

// === Chart.js ===
function dibujarGrafica(data) {
  const wrap = document.querySelector(".chart-wrapper");
  wrap.classList.remove("oculto");
  const ctx = document.getElementById("grafica").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i)=>i),
      datasets: [{
        data,
        borderColor: '#1AFF3A',
        backgroundColor: 'rgba(26,255,58,0.15)',
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#1AFF3A'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1800, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111',
          borderColor: '#1AFF3A',
          borderWidth: 1,
          titleColor: '#1AFF3A',
          bodyColor: '#fff',
          padding: 10,
          callbacks: {
            label: c => `${c.raw.toLocaleString("es-ES",{minimumFractionDigits:2})} USD`
          }
        }
      },
      scales: {
        x: { display: false },
        y: {
          ticks: {
            color: '#82F382',
            callback: v => v.toLocaleString("es-ES")
          },
          grid: { color: '#163A1A' },
          border: { color: '#1AFF3A' }
        }
      }
    }
  });
}
