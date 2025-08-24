document.addEventListener("DOMContentLoaded", () => {
  const productosContainer = document.getElementById("productosContainer");
  const togglePreciosBtn = document.getElementById("togglePreciosBtn");
  const addStockBtn = document.getElementById("addStockBtn");
  const totalesContainer = document.getElementById("totalesContainer");

  let mostrarPrecios = false;
  let categoriaSeleccionada = "";

  const usuarioActivo = localStorage.getItem("usuarioActivo");
  if (!usuarioActivo) return;
  
    function abrirModalExportar() {
      document.getElementById("modalExportar").style.display = "flex";
    }

	function cerrarModalExportar() {
	  document.getElementById("modalExportar").style.display = "none";
	}

  // Mostrar horarios actuales si existen
	function cargarHorarios() {
	  const horariosGuardados = JSON.parse(localStorage.getItem(`turnos_${usuarioActivo}`)) || HORARIOS_DEFAULT;

	  document.getElementById("inicioManana").value = horariosGuardados.mañana.inicio;
	  document.getElementById("finManana").value = horariosGuardados.mañana.fin;
	  document.getElementById("inicioTarde").value = horariosGuardados.tarde.inicio;
	  document.getElementById("finTarde").value = horariosGuardados.tarde.fin;
	}
	const toggleProductosBtn = document.getElementById("toggleProductosBtn");
	toggleProductosBtn.addEventListener("click", () => {
	  const container = document.getElementById("productosContainer");
	  if (container.style.display === "none") {
		container.style.display = "block";
		toggleProductosBtn.textContent = "Ocultar productos";
	  } else {
		container.style.display = "none";
		toggleProductosBtn.textContent = "Ver productos";
	  }
	});



  document.getElementById("authSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";

  function crearSelectCategorias(productos) {
    let select = document.getElementById("selectCategorias");
    if (!select) {
      select = document.createElement("select");
      select.id = "selectCategorias";
      select.innerHTML = `<option value="">Todas las categorías</option>`;
      productosContainer.before(select);
      select.addEventListener("change", () => {
        categoriaSeleccionada = select.value;
        cargarProductos();
      });
    }

    const categorias = [...new Set(productos.map(p => p.categoria))];
    select.innerHTML = `<option value="">Todas las categorías</option>`;
    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      if (cat === categoriaSeleccionada) option.selected = true;
      select.appendChild(option);
    });
  }

	function calcularTotales(productos) {
	  let costoTotal = 0;
	  let ventaEsperada = 0;
	  let ingresoReal = 0;
	  let gananciaReal = 0;

	  productos.forEach(p => {
		const sInicial = p.stockInicial ?? p.stock; // fallback para productos viejos

		costoTotal += sInicial * p.precioCosto;
		ventaEsperada += sInicial * p.precioVenta;
		ingresoReal += (p.vendido || 0) * p.precioVenta;
		gananciaReal += (p.vendido || 0) * (p.precioVenta - p.precioCosto);
	  });

	  return { costoTotal, ventaEsperada, ingresoReal, gananciaReal };
	}


  function mostrarTotales(productos) {
    const totales = calcularTotales(productos);
    totalesContainer.innerHTML = `
      <button id="mostrarTotalesBtn">👁️ Mostrar Totales</button>
      <div id="panelTotales" style="display:none; margin-top:1em;">
        <p><strong>Costo Total:</strong> $${totales.costoTotal}</p>
        <p><strong>Venta Esperada:</strong> $${totales.ventaEsperada}</p>
        <p><strong>Ingreso Real:</strong> $${totales.ingresoReal}</p>
        <p><strong>Ganancia Real:</strong> $${totales.gananciaReal}</p>
      </div>
    `;

    document.getElementById("mostrarTotalesBtn").addEventListener("click", () => {
      const panel = document.getElementById("panelTotales");
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    });
  }

  function cargarProductos() {
    const clave = `productos_${usuarioActivo}`;
    const productos = JSON.parse(localStorage.getItem(clave) || "[]");

    crearSelectCategorias(productos);

    const productosFiltrados = categoriaSeleccionada
      ? productos.filter(p => p.categoria === categoriaSeleccionada)
      : productos;

    productosContainer.innerHTML = "";

    productosFiltrados.forEach(prod => {
      const div = document.createElement("div");
      div.className = "producto-item";

      let html = `<h3>${prod.nombre}</h3>`;
      html += `<p>Stock disponible: ${prod.stock}</p>`;
      html += `<p>Categoría: ${prod.categoria}</p>`;
      if (mostrarPrecios) {
        html += `<p>Precio costo: $${prod.precioCosto}</p>`;
        html += `<p>Precio venta: $${prod.precioVenta}</p>`;
      }
      // html += `<button onclick="venderProducto(${prod.id})">Vender</button>`;
	// Bloque de acciones agrupadas con estilo
	  html += `
	    <div class="acciones">
		  <button onclick="venderProducto(${prod.id})">🛒 Vender</button>
		  <button onclick="devolverProducto(${prod.id})">↩️ Devolver</button>
		  <button onclick="sumarStock(${prod.id})">➕ Stock</button>
		  <button onclick="eliminarProducto(${prod.id})">🗑️ Eliminar</button>
	    </div>
	  `;

	
      div.innerHTML = html;
      productosContainer.appendChild(div);
    });

    mostrarTotales(productosFiltrados);
  }

  togglePreciosBtn.addEventListener("click", () => {
    mostrarPrecios = !mostrarPrecios;
    togglePreciosBtn.textContent = mostrarPrecios ? "Ocultar precios" : "Mostrar precios";
    cargarProductos();
  });
    
	const reponerBtn = document.getElementById("reponerBtn");
	reponerBtn.addEventListener("click", () => {
	  const clave = `productos_${usuarioActivo}`;
	  const productos = JSON.parse(localStorage.getItem(clave) || "[]");

	  if (productos.length === 0) {
		alert("No hay productos para reponer.");
		return;
	  }

	  const nombres = productos.map((p, i) => `${i + 1}. ${p.nombre}`).join("\n");
	  const opcion = parseInt(prompt(`¿Qué producto desea reponer?\n${nombres}`), 10);

	  if (isNaN(opcion) || opcion < 1 || opcion > productos.length) {
		alert("Opción inválida.");
		return;
	  }

	  const cantidad = parseInt(prompt("¿Cuántas unidades desea agregar?"), 10);
	  if (isNaN(cantidad) || cantidad <= 0) {
		alert("Cantidad inválida.");
		return;
	  }

	  productos[opcion - 1].stock += cantidad;
	  productos[opcion - 1].stockInicial += cantidad;

	  localStorage.setItem(clave, JSON.stringify(productos));
	  cargarProductos();
	  alert(`Se repusieron ${cantidad} unidades de "${productos[opcion - 1].nombre}".`);
	});
	
	addStockBtn.addEventListener("click", () => {
	  const nombre = prompt("Nombre del producto:");
	  if (nombre === null) return; // Cancelado

	  const clave = `productos_${usuarioActivo}`;
	  const productos = JSON.parse(localStorage.getItem(clave) || "[]");
	  const categorias = [...new Set(productos.map(p => p.categoria))];

	  let mensajeCat = "Seleccioná una categoría:\n";
	  categorias.forEach((cat, i) => {
		mensajeCat += `${i + 1}. ${cat}\n`;
	  });
	  mensajeCat += "0. Crear nueva categoría";

	  const seleccion = prompt(mensajeCat);
	  if (seleccion === null) return;

	  let categoria = "";

	  if (seleccion === "0") {
		categoria = prompt("Ingresá el nombre de la nueva categoría:");
		if (categoria === null) return;
	  } else {
		const index = parseInt(seleccion, 10) - 1;
		if (index >= 0 && index < categorias.length) {
		  categoria = categorias[index];
		} else {
		  alert("Selección inválida.");
		  return;
		}
	  }

	  const precioCosto = prompt("Precio de costo:");
	  if (precioCosto === null) return;

	  const precioVenta = prompt("Precio de venta:");
	  if (precioVenta === null) return;

	  const stockInicial = prompt("Cantidad ingresada:");
	  if (stockInicial === null) return;

	  // Validación final
	  if (!nombre || !categoria || isNaN(precioCosto) || isNaN(precioVenta) || isNaN(stockInicial)) {
		alert("Campos inválidos.");
		return;
	  }

	  productos.push({
		id: Date.now(),
		nombre,
		categoria,
		precioCosto: parseFloat(precioCosto),
		precioVenta: parseFloat(precioVenta),
		stock: parseInt(stockInicial, 10),
		stockInicial: parseInt(stockInicial, 10),
		vendido: 0
	  });

	  localStorage.setItem(clave, JSON.stringify(productos));
	  cargarProductos();

	  alert("✅ Producto creado con éxito.");
	});

  window.venderProducto = function (id) {
    const clave = `productos_${usuarioActivo}`;
    const productos = JSON.parse(localStorage.getItem(clave) || "[]");

    const index = productos.findIndex(p => p.id === id);
    if (index === -1 || productos[index].stock <= 0) {
      alert("No hay stock disponible.");
      return;
    }

    productos[index].stock--;
    productos[index].vendido = (productos[index].vendido || 0) + 1;
    localStorage.setItem(clave, JSON.stringify(productos));
    cargarProductos();
  };
  
  // Botón para cerrar sesión
	const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");
	cerrarSesionBtn.addEventListener("click", () => {
	  localStorage.removeItem("usuarioActivo");
	  localStorage.removeItem("ultimaActividad");
	  location.reload();
	});
	
	// Configurar horarios de turno
	const HORARIOS_DEFAULT = {
	  mañana: { inicio: "06:00", fin: "14:00" },
	  tarde: { inicio: "15:00", fin: "23:00" }
	};

	function obtenerTurnoActual() {
	  const ahora = new Date();
	  const horaActual = ahora.getHours() + ahora.getMinutes() / 60;

	  const usuarioConfig = JSON.parse(localStorage.getItem(`turnos_${usuarioActivo}`)) || HORARIOS_DEFAULT;

	  const horaInicioM = parseFloat(usuarioConfig.mañana.inicio.split(":")[0]) + parseFloat(usuarioConfig.mañana.inicio.split(":")[1]) / 60;
	  const horaFinM = parseFloat(usuarioConfig.mañana.fin.split(":")[0]) + parseFloat(usuarioConfig.mañana.fin.split(":")[1]) / 60;
	  const horaInicioT = parseFloat(usuarioConfig.tarde.inicio.split(":")[0]) + parseFloat(usuarioConfig.tarde.inicio.split(":")[1]) / 60;
	  const horaFinT = parseFloat(usuarioConfig.tarde.fin.split(":")[0]) + parseFloat(usuarioConfig.tarde.fin.split(":")[1]) / 60;

	  if (horaActual >= horaInicioM && horaActual <= horaFinM) return "mañana";
	  if (horaActual >= horaInicioT && horaActual <= horaFinT) return "tarde";

	  return "fuera de horario";
	}
	
	document.getElementById("formTurnos").addEventListener("submit", (e) => {
	  e.preventDefault();

	  const nuevaConfig = {
		mañana: {
		  inicio: document.getElementById("inicioManana").value,
		  fin: document.getElementById("finManana").value
		},
		tarde: {
		  inicio: document.getElementById("inicioTarde").value,
		  fin: document.getElementById("finTarde").value
		}
	  };

	  localStorage.setItem(`turnos_${usuarioActivo}`, JSON.stringify(nuevaConfig));
	  alert("Horarios guardados correctamente.");
	});


	// Mostrar turno actual en consola o en pantalla (luego lo usaremos)
	const turno = obtenerTurnoActual();
	console.log("Turno actual:", turno);
	
	const guardarSesionBtn = document.getElementById("guardarSesionBtn");
	guardarSesionBtn.addEventListener("click", () => {
	  const claveProductos = `productos_${usuarioActivo}`;
	  const productos = JSON.parse(localStorage.getItem(claveProductos) || "[]");
	  const vendidos = productos.filter(p => p.vendido && p.vendido > 0);

	  if (vendidos.length === 0) {
		alert("No hay productos vendidos en esta sesión.");
		return;
	  }

	  const fecha = new Date().toISOString().split("T")[0]; // formato YYYY-MM-DD
	  const turnoActual = obtenerTurnoActual();
	  const claveRegistro = `registro_${usuarioActivo}_${fecha}_${turnoActual}`;

	  localStorage.setItem(claveRegistro, JSON.stringify(vendidos));
	  alert("Sesión guardada exitosamente.");

	  // Limpiar vendidos para próxima sesión (opcional)
	  vendidos.forEach(p => {
		p.vendido = 0;
	   });

	  localStorage.setItem(claveProductos, JSON.stringify(productos));
	  cargarProductos();
	});
	
	window.devolverProducto = function (id) {
	  const clave = `productos_${usuarioActivo}`;
	  const productos = JSON.parse(localStorage.getItem(clave) || "[]");
	  const index = productos.findIndex(p => p.id === id);
	  if (index === -1) return;

	  if ((productos[index].vendido || 0) <= 0) {
		alert("No hay ventas para devolver.");
		return;
	  }

	  productos[index].vendido -= 1;
	  productos[index].stock += 1;

	  localStorage.setItem(clave, JSON.stringify(productos));
	  cargarProductos();
	};

	window.sumarStock = function (id) {
	  const clave = `productos_${usuarioActivo}`;
	  const productos = JSON.parse(localStorage.getItem(clave) || "[]");
	  const index = productos.findIndex(p => p.id === id);
	  if (index === -1) return;

	  const cantidad = parseInt(prompt("¿Cuántas unidades desea agregar al stock?"), 10);
	  if (isNaN(cantidad) || cantidad <= 0) {
		alert("Cantidad inválida.");
		return;
	  }

	  productos[index].stock += cantidad;
	  productos[index].stockInicial += cantidad;

	  localStorage.setItem(clave, JSON.stringify(productos));
	  cargarProductos();
	};
	
	document.getElementById("calcularPromediosBtn").addEventListener("click", () => {
	  const usuario = localStorage.getItem("usuarioActivo");
	  if (!usuario) return;

	  const registros = Object.keys(localStorage)
		.filter(k => k.startsWith(`registro_${usuario}_`))
		.map(k => {
		  const [, , fecha, turno] = k.split("_");
		  const ventas = JSON.parse(localStorage.getItem(k));
		  return { fecha, turno, ventas };
		});

	  const resumen = {};

	  registros.forEach(({ fecha, turno, ventas }) => {
		const dia = new Date(fecha).toLocaleDateString("es-AR", { weekday: "long" });

		ventas.forEach(prod => {
		  const clave = prod.nombre;
		  if (!resumen[clave]) {
			resumen[clave] = { total: 0, veces: 0, porTurno: {}, porDia: {} };
		  }

		  resumen[clave].total += prod.vendido;
		  resumen[clave].veces++;

		  // Por turno
		  resumen[clave].porTurno[turno] = (resumen[clave].porTurno[turno] || 0) + prod.vendido;

		  // Por día de la semana
		  resumen[clave].porDia[dia] = (resumen[clave].porDia[dia] || 0) + prod.vendido;
		});
	  });

	  // Mostrar en pantalla
	  const resultados = document.getElementById("resultadosPromedios");
	  resultados.innerHTML = "<h3>Promedios de venta</h3>";

	  if (Object.keys(resumen).length === 0) {
		resultados.innerHTML += "<p>No hay datos registrados para calcular promedios.</p>";
		return;
	  }

	  for (const [nombre, data] of Object.entries(resumen)) {
		resultados.innerHTML += `
		  <div class="resumen-producto">
			<strong>${nombre}</strong><br />
			Promedio general: ${(data.total / data.veces).toFixed(1)} unidades por sesión<br />
			Por turno: ${Object.entries(data.porTurno).map(([t, v]) => `${t}: ${v}`).join(", ")}<br />
			Por día: ${Object.entries(data.porDia).map(([d, v]) => `${d}: ${v}`).join(", ")}
		  </div>
		`;
	  }
	});
	
	window.eliminarProducto = function (id) {
	  if (!confirm("¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.")) return;

	  const clave = `productos_${usuarioActivo}`;
	  const productos = JSON.parse(localStorage.getItem(clave) || "[]");
	  const nuevos = productos.filter(p => p.id !== id);

	  localStorage.setItem(clave, JSON.stringify(nuevos));
	  cargarProductos();
	};
	
	function mostrarGraficoPromedios(resumen) {
	  const ctx = document.getElementById("graficoPromedios").getContext("2d");
	  
	  // Destruir gráfico anterior si existe
	  if (window.graficoPromedios) window.graficoPromedios.destroy();

	  const labels = Object.keys(resumen);
	  const data = labels.map(nombre => (resumen[nombre].total / resumen[nombre].veces).toFixed(2));

	  window.graficoPromedios = new Chart(ctx, {
		type: "bar",
		data: {
		  labels,
		  datasets: [{
			label: "Promedio de unidades vendidas por sesión",
			data,
			backgroundColor: "rgba(75, 192, 192, 0.6)",
			borderColor: "rgba(75, 192, 192, 1)",
			borderWidth: 1
		  }]
		},
		options: {
		  responsive: true,
		  scales: {
			y: {
			  beginAtZero: true,
			  ticks: {
				stepSize: 1
			  }
			}
		  }
		}
	  });
	}
	
	// Gráficos estadisticos
	const verEstadisticasBtn = document.getElementById("verEstadisticasBtn");
	const estadisticasGraficas = document.getElementById("estadisticasGraficas");

	verEstadisticasBtn.addEventListener("click", () => {
	  estadisticasGraficas.style.display = estadisticasGraficas.style.display === "none" ? "block" : "none";
	  generarGraficasComparativas();
	});

	function generarGraficasComparativas() {
	  const registros = Object.keys(localStorage)
		.filter(k => k.startsWith(`registro_${usuarioActivo}_`))
		.map(k => ({ clave: k, datos: JSON.parse(localStorage.getItem(k)) }));

	  const resumenPorDia = {};
	  const resumenTurnos = { mañana: 0, tarde: 0 };
	  const productosPorTurno = {};

	  registros.forEach(r => {
		const [, , fecha, turno] = r.clave.split("_");
		let total = 0;
		r.datos.forEach(p => {
		  total += (p.precioVenta || 0) * (p.vendido || 0);
		  const claveProd = `${turno}_${p.nombre}`;
		  productosPorTurno[claveProd] = (productosPorTurno[claveProd] || 0) + (p.vendido || 0);
		});

		resumenPorDia[fecha] = (resumenPorDia[fecha] || 0) + total;
		resumenTurnos[turno] = (resumenTurnos[turno] || 0) + total;
	  });

	  // Gráfico por día
	  const ctx1 = document.getElementById("graficoVentasPorDia").getContext("2d");
	  new Chart(ctx1, {
		type: "bar",
		data: {
		  labels: Object.keys(resumenPorDia),
		  datasets: [{
			label: "Ventas por día ($)",
			data: Object.values(resumenPorDia),
			backgroundColor: "#3498db"
		  }]
		},
		options: {
		  responsive: true,
		  plugins: {
			title: {
			  display: true,
			  text: "Ventas por día"
			}
		  }
		}
	  });

	  // Gráfico por turno
	const coloresTurnos = {
	  mañana: "#f39c12",     // naranja
	  tarde: "#2ecc71",      // verde
	  "fuera de horario": "#e74c3c" // rojo (nuevo)
	};

	const labelsTurnos = Object.keys(resumenTurnos);
	const datosTurnos = Object.values(resumenTurnos);
	const colores = labelsTurnos.map(turno => coloresTurnos[turno] || "#95a5a6"); // gris por defecto

	const ctx2 = document.getElementById("graficoTurnosDia").getContext("2d");
	new Chart(ctx2, {
	  type: "doughnut",
	  data: {
		labels: labelsTurnos,
		datasets: [{
		  label: "Ventas por turno",
		  data: datosTurnos,
		  backgroundColor: colores
		}]
	  },
	  options: {
		plugins: {
		  title: {
			display: true,
			text: "Distribución de ventas por turno"
		  }
		}
	  }
	});


	  // Gráfico por producto dentro de cada turno
	  const labelsProductos = Object.keys(productosPorTurno);
	  const dataProductos = Object.values(productosPorTurno);

	  const ctx3 = document.getElementById("graficoProductosPorTurno").getContext("2d");
	  new Chart(ctx3, {
		type: "bar",
		data: {
		  labels: labelsProductos,
		  datasets: [{
			label: "Cantidad vendida",
			data: dataProductos,
			backgroundColor: "#9b59b6"
		  }]
		},
		options: {
		  indexAxis: 'y',
		  plugins: {
			title: {
			  display: true,
			  text: "Productos vendidos por turno"
			}
		  }
		}
	  });
	}

	
document.getElementById("verComparativasBtn").addEventListener("click", () => {
  const registros = [];
  const usuarioActivo = localStorage.getItem("usuarioActivo");
  const claves = Object.keys(localStorage);

  // Buscar todas las claves que son registros del usuario
  claves.forEach(clave => {
    if (clave.startsWith(`registro_${usuarioActivo}_`)) {
      const partes = clave.split("_"); // [registro, usuario, fecha, turno]
      const fecha = partes[2];
      const turno = partes[3];
      const productos = JSON.parse(localStorage.getItem(clave));
      const total = productos.reduce((sum, p) => sum + (p.vendido || 0) * (p.precioVenta || 0), 0);
      registros.push({ fecha, turno, total });
    }
  });

  // Agrupar por fecha y turno
  const agrupado = {};
  registros.forEach(r => {
    if (!agrupado[r.fecha]) agrupado[r.fecha] = { mañana: 0, tarde: 0 };
    agrupado[r.fecha][r.turno] += r.total;
  });

  const fechas = Object.keys(agrupado).sort();
  const valoresManana = fechas.map(f => agrupado[f].mañana || 0);
  const valoresTarde = fechas.map(f => agrupado[f].tarde || 0);

  // Mostrar la sección
  document.getElementById("estadisticasComparativas").style.display = "block";

  // Crear gráfico
  const ctx = document.getElementById("graficoComparativo").getContext("2d");
  if (window.graficoComparativoInstance) {
    window.graficoComparativoInstance.destroy();
  }
  window.graficoComparativoInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: fechas,
      datasets: [
        {
          label: "Turno Mañana",
          data: valoresManana,
          backgroundColor: "rgba(75, 192, 192, 0.7)"
        },
        {
          label: "Turno Tarde",
          data: valoresTarde,
          backgroundColor: "rgba(255, 159, 64, 0.7)"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Ventas ($)"
          }
        },
        x: {
          title: {
            display: true,
            text: "Fechas"
          }
        }
      }
    }
  });
});
	
	// Exportar datos en distintos fomator
	const exportarDatosBtn = document.getElementById("exportarDatosBtn").addEventListener("click", abrirModalExportar);
	const tipoExportacionSelect = document.getElementById("tipoExportacion");

	exportarDatosBtn.addEventListener("click", () => {
	  const clave = `productos_${usuarioActivo}`;
	  const productos = JSON.parse(localStorage.getItem(clave) || "[]");

	  if (productos.length === 0) {
		alert("No hay productos para exportar.");
		return;
	  }

	  const tipo = tipoExportacionSelect.value;

	  if (tipo === "csv") {
		let csv = "Nombre,Categoría,Stock,Precio Costo,Precio Venta,Vendidos\n";
		productos.forEach(p => {
		  csv += `${p.nombre},${p.categoria},${p.stock},${p.precioCosto},${p.precioVenta},${p.vendido || 0}\n`;
		});
		const blobCSV = new Blob([csv], { type: "text/csv" });
		const linkCSV = document.createElement("a");
		linkCSV.href = URL.createObjectURL(blobCSV);
		linkCSV.download = "productos.csv";
		linkCSV.click();
	  }

	  if (tipo === "json") {
		const blobJSON = new Blob([JSON.stringify(productos, null, 2)], { type: "application/json" });
		const linkJSON = document.createElement("a");
		linkJSON.href = URL.createObjectURL(blobJSON);
		linkJSON.download = "productos.json";
		linkJSON.click();
	  }

	  if (tipo === "pdf") {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF();
		doc.setFontSize(12);
		doc.text("Reporte de Productos", 10, 10);
		let y = 20;
		productos.forEach(p => {
		  doc.text(`• ${p.nombre} (${p.categoria}) - Stock: ${p.stock} | Vendidos: ${p.vendido || 0}`, 10, y);
		  y += 8;
		  if (y > 270) {
			doc.addPage();
			y = 20;
		  }
		});
		doc.save("productos.pdf");
	  }

	  alert(`Datos exportados como ${tipo.toUpperCase()}`);
	});


  cargarProductos();
  cargarHorarios();
  mostrarGraficoPromedios(resumen);

});

