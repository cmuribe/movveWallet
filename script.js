// Verifica si es día hábil
function esDiaHabil(fecha) {
  const d = fecha.getDay();
  return d >= 1 && d <= 5;
}

let chartInstance;

// Plugin para animación "pulse" en el punto final
Chart.register({
  id: 'profitPulse',
  afterDatasetDraw(chart) {
    const point = chart.getDatasetMeta(0).data.slice(-1)[0];
    if (!point) return;

    const ctx = chart.ctx;
    const radius = 6 + Math.sin(Date.now() / 200) * 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
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
  const resultadoDiv = document.getElementById("resultado");

  error.textContent = "";
  resultadoDiv.classList.add("oculto");
  resultadoDiv.innerHTML = "";

  if (!monto || monto <= 0) {
    error.textContent = "Ingresa un monto válido.";
    return;
  }

  if (!periodo || periodo <= 0) {
    error.textContent = "Ingresa un período válido.";
    return;
  }

  const fecha = new Date();
  let fechaFinal = new Date(fecha);

  if (unidad === "meses") fechaFinal.setMonth(fechaFinal.getMonth() + periodo);
  else fechaFinal.setFullYear(fechaFinal.getFullYear() + periodo);

  let capital = monto;
  let aux = new Date(fecha);
  const valores = [capital];

  while (aux <= fechaFinal) {
    aux.setDate(aux.getDate() + 1);
    if (esDiaHabil(aux)) {
      capital *= 1.009;
      valores.push(capital);
    }
  }

  const retorno = ((capital / monto) - 1) * 100;

  function animarValor(el, inicio, fin, dur = 1200) {
    const paso = 16;
    const total = dur / paso;
    let count = 0;

    const int = setInterval(() => {
      count++;
      el.textContent = (inicio + (fin - inicio) * (count / total))
        .toLocaleString("es-ES", { minimumFractionDigits: 2 });
      if (count >= total) clearInterval(int);
    }, paso);
  }

  dibujarGrafica(valores);

  resultadoDiv.innerHTML = `
    <p>Monto inicial: <strong id="vInicial"></strong> USD</p>
    <p>Período: <strong>${periodo} ${unidad}</strong></p>
    <p>Valor final proyectado: <strong id="vFinal"></strong> USD</p>
    <p>Retorno total: <strong id="vRetorno"></strong></p>
    <p>Fecha proyectada: <strong>${fechaFinal.toLocaleDateString("es-ES")}</strong></p>
  `;
  resultadoDiv.classList.remove("oculto");

  animarValor(document.getElementById("vInicial"), 0, monto);
  animarValor(document.getElementById("vFinal"), 0, capital);
  animarValor(document.getElementById("vRetorno"), 0, retorno, 1400);

  setTimeout(() => {
    document.getElementById("vRetorno").textContent += " %";
  }, 1500);
}

// Chart.js gráfico
function dibujarGrafica(data) {
  const wrap = document.querySelector(".chart-wrapper");
  wrap.classList.remove("oculto");

  const ctx = document.getElementById("grafica").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
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
      animation: {
        duration: 1800,
        easing: 'easeOutQuart'
      },
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
            label: ctx => `${ctx.raw.toLocaleString("es-ES", {
              minimumFractionDigits: 2
            })} USD`
          }
        }
      },
      scales: {
        x: { display: false },
        y: {
          ticks: {
            color: '#82F382',
            callback: val => val.toLocaleString("es-ES")
          },
          grid: { color: '#163A1A' },
          border: { color: '#1AFF3A' }
        }
      }
    }
  });
}
