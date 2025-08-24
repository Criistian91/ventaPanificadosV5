// Productos base
let baseProductos = [
  "Pan casero Salame",
  "Pan casero Chicha",
  "Pan casero Simple",
  "Facturas varias",
  "Budines",
  "Alfajores maicena"
];

// Leer productos personalizados del localStorage
let productosPersonalizados = JSON.parse(localStorage.getItem("productosPersonalizados")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];

const selectNombre = document.getElementById("select-nombre");
const inputNombre = document.getElementById("nombre");
const contenedor = document.getElementById("productos");

// 🔁 Renderiza el desplegable
function renderSelect() {
  const opciones = [...baseProductos, ...productosPersonalizados];
  selectNombre.innerHTML = "";
  opciones.forEach(nombre => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectNombre.appendChild(option);
  });

  const otra = document.createElement("option");
  otra.value = "__otro__";
  otra.textContent = "Otro...";
  selectNombre.appendChild(otra);
}

selectNombre.addEventListener("change", () => {
  if (selectNombre.value === "__otro__") {
    inputNombre.classList.remove("hidden");
    inputNombre.required = true;
  } else {
    inputNombre.classList.add("hidden");
    inputNombre.required = false;
  }
});

function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function guardarPersonalizados() {
  localStorage.setItem("productosPersonalizados", JSON.stringify(productosPersonalizados));
}

function actualizarTotales() {
  let costoTotal = 0;
  let ventaEsperada = 0;
  let ingresoReal = 0;
  let gananciaReal = 0;

  productos.forEach((p, i) => {
    const restante = p.cargado - p.vendido;
    document.getElementById("vendido-" + i).innerText = p.vendido;
    document.getElementById("restante-" + i).innerText = restante;
    document.getElementById("ingreso-" + i).innerText = "$" + (p.vendido * p.venta);
    document.getElementById("ganancia-" + i).innerText = "$" + (p.vendido * (p.venta - p.costo));

    costoTotal += p.cargado * p.costo;
    ventaEsperada += p.cargado * p.venta;
    ingresoReal += p.vendido * p.venta;
    gananciaReal += p.vendido * (p.venta - p.costo);
  });

  document.getElementById("costo-total").innerText = costoTotal;
  document.getElementById("venta-total").innerText = ventaEsperada;
  document.getElementById("ganancia-esperada").innerText = ventaEsperada - costoTotal;
  document.getElementById("ingreso-real").innerText = ingresoReal;
  document.getElementById("ganancia-real").innerText = gananciaReal;
}

function mostrarAviso(mensaje) {
  const aviso = document.createElement("div");
  aviso.textContent = mensaje;
  aviso.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fadeInOut";
  document.body.appendChild(aviso);
  setTimeout(() => {
    aviso.remove();
  }, 3000);
}

function marcarVendido(index) {
  if (productos[index].vendido < productos[index].cargado) {
    productos[index].vendido++;
    guardarProductos();
    actualizarTotales();
  } else {
    mostrarAviso(`No hay más stock de "${productos[index].nombre}".`);
  }
}

function restarVendido(index) {
  if (productos[index].vendido > 0) {
    productos[index].vendido--;
    guardarProductos();
    actualizarTotales();
  }
}

function eliminarProducto(index) {
  if (confirm(`¿Querés eliminar el producto "${productos[index].nombre}"? Esta acción no se puede deshacer.`)) {
    productos.splice(index, 1);
    guardarProductos();
    renderProductos();
  }
}

function renderProductos() {
  contenedor.innerHTML = "";
  productos.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "grid grid-cols-2 md:grid-cols-9 gap-4 items-center bg-gray-50 p-4 rounded-lg shadow";
    card.innerHTML = `
      <div class="font-medium col-span-2">${p.nombre}</div>
      <div><strong>Cargado:</strong> ${p.cargado}</div>
      <div><strong>Vendido:</strong> <span id="vendido-${i}">${p.vendido}</span></div>
      <div><strong>Restante:</strong> <span id="restante-${i}">${p.cargado - p.vendido}</span></div>
      <div><strong>Costo:</strong> $${p.costo}</div>
      <div><strong>Venta:</strong> $${p.venta}</div>
      <div><strong>Ingreso:</strong> <span id="ingreso-${i}">$0</span></div>
      <div><strong>Ganancia:</strong> <span id="ganancia-${i}">$0</span></div>
      <div class="col-span-2 md:col-span-2 flex gap-2">
        <button onclick="marcarVendido(${i})" class="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">+1</button>
        <button onclick="restarVendido(${i})" class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">-1</button>
        <button onclick="eliminarProducto(${i})" class="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">🗑️</button>
      </div>
    `;
    contenedor.appendChild(card);
  });
  actualizarTotales();
}

function resetearTodo() {
  if (confirm("¿Borrar todos los productos cargados (no afecta la lista de nombres)?")) {
    productos = [];
    guardarProductos();
    renderProductos();
  }
}

document.getElementById("form-producto").addEventListener("submit", function (e) {
  e.preventDefault();
  let nombre = selectNombre.value;
  if (nombre === "__otro__") {
    nombre = inputNombre.value.trim();
    if (nombre && !baseProductos.includes(nombre) && !productosPersonalizados.includes(nombre)) {
      productosPersonalizados.push(nombre);
      guardarPersonalizados();
      renderSelect();
    }
  }

  const cargado = parseInt(document.getElementById("cantidad").value);
  const costo = parseFloat(document.getElementById("costo").value);
  const venta = parseFloat(document.getElementById("venta").value);

  if (nombre && cargado > 0 && costo >= 0 && venta >= 0) {
    productos.push({ nombre, cargado, vendido: 0, costo, venta });
    guardarProductos();
    renderProductos();
    e.target.reset();
    renderSelect();
    inputNombre.classList.add("hidden");
  }
});

renderSelect();
renderProductos();
