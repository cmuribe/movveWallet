function esDiaHabil(fecha) {
  const dia = fecha.getDay();
  return dia >= 1 && dia <= 5; // lunes a viernes
}

function calcularProyeccion() {
  const capitalInicial = parseFloat(document.getElementById("capital").value);
  const interesMensual = parseFloat(document.getElementById("interes").value);
  const meses = parseInt(document.getElementById("meses").value);
  const error = document.getElementById("error");
  const seccionResultados = document.getElementById("resultados");
  const cuerpoTabla = document.querySelector("#tabla-resultados tbody");
  const roi = document.getElementById("roi");

  error.textContent = "";
  cuerpoTabla.innerHTML = "";
  roi.textContent = "";
  seccionResultados.classList.add("oculto");

  if (!capitalInicial || !interesMensual || !meses) {
    error.textContent = "Por favor ingresa todos los valores correctamente.";
    return;
  }

  let capital = capitalInicial;
  let fechaActual = new Date();
  const labels = [];
  const data = [];

  for (let mes = 1; mes <= meses; mes++) {
    const fechaFin = new Date(fechaActual);
    fechaFin.setMonth(fechaFin.getMonth() + 1);

    let diasHabiles = 0;
    let temp = new Date(fechaActual);
    while (temp < fechaFin) {
      if (esDiaHabil(temp)) diasHabiles++;
      temp.setDate(temp.getDate() + 1);
    }

    const tasaMensual = interesMensual / 100;
    const tasaDiaria = Math.pow(1 + tasaMensual, 1 / diasHabiles) - 1;

    let capitalInicialMes = capital;
    for (let i = 0; i < diasHabiles; i++) {
      capital *= 1 + tasaDiaria;
    }

    const interesGanado = capital - capitalInicialMes;

    cuerpoTabla.innerHTML += `
      <tr>
        <td>Mes ${mes}</td>
        <td>$ ${Math.round(capitalInicialMes).toLocaleString("es-ES")}</td>
        <td>$ ${Math.round(interesGanado).toLocaleString("es-ES")}</td>
        <td>$ ${Math.round(capital).toLocaleString("es-ES")}</td>
      </tr>
    `;

    labels.push("Mes " + mes);
    data.push(Math.round(capital));

    fechaActual = fechaFin;
  }

  const roiTotal = ((capital / capitalInicial) - 1) * 100;
  roi.textContent = `Retorno total: ${Math.round(roiTotal)}%`;

  seccionResultados.classList.remove("oculto");

  dibujarGrafico(labels, data);
}

let chart;

function dibujarGrafico(labels, data) {
  const ctx = document.getElementById("grafico").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Capital Final (USD)",
        data: data,
        backgroundColor: "rgba(26, 255, 58, 0.4)",
        borderColor: "#1AFF3A",
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: { color: "#82f382" },
          grid: { color: "#143614" }
        },
        x: {
          ticks: { color: "#82f382" },
          grid: { color: "transparent" }
        }
      },
      plugins: {
        legend: { labels: { color: "#82f382" } },
        tooltip: {
          backgroundColor: "#111",
          titleColor: "#1AFF3A",
          bodyColor: "#fff"
        }
      }
    }
  });
}

async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const exportable = document.getElementById("exportable");

  const canvas = await html2canvas(exportable, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const fecha = new Date().toLocaleDateString("es-ES");

  pdf.setFillColor(10, 15, 10);
  pdf.rect(0, 0, 210, 297, "F");

  pdf.addImage("Selo01.png", "PNG", 85, 10, 40, 40);
  pdf.setTextColor(26, 255, 58);
  pdf.setFontSize(18);
  pdf.text("Reporte de Proyección Movve Wallet", 105, 60, { align: "center" });
  pdf.setFontSize(11);
  pdf.text(`Generado el ${fecha}`, 105, 68, { align: "center" });

  pdf.addImage(imgData, "PNG", 10, 80, 190, 180);
  pdf.save("Reporte_MovveWallet.pdf");
}