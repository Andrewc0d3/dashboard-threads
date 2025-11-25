// src/login.js
import { iniciarSesionSeguro } from "./authValidaciones.js";

export function mostrarLogin() {

  const app = document.getElementById('app');

  app.innerHTML = `
  <section>
    <h2>Iniciar Sesión</h2>
    <form id="login-form">
      <input type="email" name="correo" placeholder="Correo" required />
      <input type="password" name="password" placeholder="Contraseña" required />
      <button type="submit">Ingresar</button>
    </form>
    <p id="error" style="color:red;"></p>
  </section>
 `;

  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = form.correo.value.trim();
    const password = form.password.value.trim();

    const resultado = await iniciarSesionSeguro(correo, password);

    if (resultado.error) {
      errorMsg.textContent = resultado.error;
      return;
    }

    location.reload();
  });
}
