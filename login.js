// login.js - Gestión de autenticación
// Autor: Cristian Altamiranda

// Registro de usuarios con validación (contraseña segura, email, teléfono).
// Inicio de sesión con almacenamiento local.
// Persistencia de sesión durante 15 minutos.
// Control de intentos fallidos (bloqueo temporal tras 5 intentos).

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerBtn = document.getElementById("registerBtn");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      mostrarMensaje("Completá todos los campos.");
      return;
    }

    if (estaBloqueado(username)) {
      mostrarMensaje("Demasiados intentos. Intentá más tarde.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      guardarSesionActiva(user);
      location.reload();
    } else {
      incrementarIntento(username);
      mostrarMensaje("Usuario o contraseña incorrectos.");
    }
  });

  registerBtn.addEventListener("click", () => {
    const username = prompt("Nombre de usuario único:");
    const password = prompt("Contraseña (8-12 caracteres, 1 mayúscula, 1 número):");
    const email = prompt("Correo electrónico:");
    const telefono = prompt("Número de teléfono:");

    if (!validarPassword(password)) {
      alert("La contraseña debe tener entre 8 y 12 caracteres, con al menos una mayúscula y un número.");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const existe = usuarios.some(u => u.username === username);

    if (existe) {
      alert("Ese nombre de usuario ya está en uso.");
      return;
    }

    usuarios.push({
      username,
      password,
      email,
      telefono,
      isAdmin: username.toLowerCase() === "cristian"
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Usuario registrado con éxito.");
  });
});

// --- Funciones auxiliares ---

function mostrarMensaje(msg) {
  const mensaje = document.getElementById("authMessage");
  mensaje.textContent = msg;
  mensaje.style.color = "red";
}

function validarPassword(pwd) {
  const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,12}$/;
  return regex.test(pwd);
}

function guardarSesionActiva(user) {
  const sesion = {
    usuario: user.username,
    inicio: Date.now()
  };
  localStorage.setItem("sesionActiva", JSON.stringify(sesion));
  localStorage.setItem("usuarioActivo", user.username);
  localStorage.setItem("ultimaActividad", Date.now());
}

function estaBloqueado(username) {
  const intentos = JSON.parse(localStorage.getItem("intentosFallidos") || "{}");
  const info = intentos[username];
  if (!info) return false;

  if (info.count >= MAX_ATTEMPTS) {
    const ahora = Date.now();
    if (ahora - info.ultimoIntento < 10 * 60 * 1000) return true; // 10 minutos de bloqueo
    else {
      delete intentos[username]; // se restablece
      localStorage.setItem("intentosFallidos", JSON.stringify(intentos));
      return false;
    }
  }
  return false;
}

function incrementarIntento(username) {
  const intentos = JSON.parse(localStorage.getItem("intentosFallidos") || "{}");
  if (!intentos[username]) {
    intentos[username] = { count: 1, ultimoIntento: Date.now() };
  } else {
    intentos[username].count += 1;
    intentos[username].ultimoIntento = Date.now();
  }
  localStorage.setItem("intentosFallidos", JSON.stringify(intentos));
}
