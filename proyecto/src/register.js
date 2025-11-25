// src/register.js

import { supabase } from './supabase.js';
import { registrarUsuarioSeguro } from './authValidaciones.js';

export function mostrarRegistro() {

    const app = document.getElementById('app');

    app.innerHTML = `
   <section>
     <h2>Registro de Estudiante</h2>
     <form id="registro-form">
       <input type="text" name="nombre" placeholder="Nombre de usuario" required />
       <input type="email" name="correo" placeholder="Correo" required />
       <input type="password" name="password" placeholder="Contraseña" required />
       <input type="password" name="confirmar" placeholder="Confirmar contraseña" required />
       <input type="text" name="telefono" placeholder="Teléfono" required />
       <button type="submit">Registrarse</button>
     </form>
     <p id="error" style="color:red;"></p>
   </section>
 `;

    const form = document.getElementById("registro-form");
    const errorMsg = document.getElementById("error");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.textContent = "";

        const nombre = form.nombre.value.trim();
        const correo = form.correo.value.trim();
        const password = form.password.value.trim();
        const confirmarPassword = form.confirmar.value.trim();
        const telefono = form.telefono.value.trim();

        const resultado = await registrarUsuarioSeguro(nombre, correo, password, confirmarPassword, telefono);

        if (resultado.error) {
            errorMsg.textContent = resultado.error;
            return;
        }

        alert(resultado.mensaje);
        form.reset();
    });
}
