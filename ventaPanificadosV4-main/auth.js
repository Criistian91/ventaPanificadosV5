// Archivo: auth.js
// Autor: Cristian Altamiranda
// Funcionalidad de login, registro y validación de sesión segura

const SESSION_DURATION_MIN = 15;

function isValidPassword(pw) {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
}

function guardarUsuarios(users) {
  localStorage.setItem("usuarios", JSON.stringify(users));
}

function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios") || "[]");
}

function iniciarSesionStorage(usuario) {
  localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
  localStorage.setItem("inicioSesion", Date.now());
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("inicioSesion");
  location.reload();
}

function sesionActiva() {
  const user = JSON.parse(localStorage.getItem("usuarioActivo"));
  const inicio = parseInt(localStorage.getItem("inicioSesion") || 0);
  if (!user || !inicio) return false;
  if (Date.now() - inicio > SESSION_DURATION_MIN * 60 * 1000) {
    cerrarSesion();
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerBtn = document.getElementById("registerBtn");
  const authMessage = document.getElementById("authMessage");

  if (sesionActiva()) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    return;
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const usuarios = obtenerUsuarios();
    const user = usuarios.find(u => u.username === username && u.password === password);

    if (!user) {
      authMessage.textContent = "Usuario o contraseña incorrectos.";
      return;
    }

    iniciarSesionStorage(user);
    location.reload();
  });

  registerBtn.addEventListener("click", () => {
    const username = prompt("Elegí un nombre de usuario (único):");
    const password = prompt("Contraseña (mínimo 8 caracteres, 1 mayúscula y 1 número):");
    const email = prompt("Correo electrónico:");
    const phone = prompt("Número de teléfono:");

    if (!username || !password || !email || !phone) return alert("Todos los campos son obligatorios.");
    if (!isValidPassword(password)) return alert("Contraseña no válida.");

    const usuarios = obtenerUsuarios();
    if (usuarios.find(u => u.username === username)) return alert("El nombre ya está en uso.");

    usuarios.push({
      username,
      password,
      email,
      phone,
      isAdmin: username.toLowerCase() === "cristian"
    });

    guardarUsuarios(usuarios);
    alert("Registro exitoso. Ahora podés iniciar sesión.");
  });
});
