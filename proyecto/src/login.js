// src/login.js
import { supabase } from './supabase.js';

export function mostrarLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <section>
      <h2>Iniciar sesión</h2>
      <form id="login-form">
        <input type="email" name="correo" placeholder="Correo" required />
        <input type="password" name="password" placeholder="Contraseña" required />
        <button type="submit">Ingresar</button>
      </form>
      <p id="error" style="color:red;"></p>
      <p>¿No tienes cuenta? <button id="ir-registro">Crear cuenta</button></p>
    </section>
  `;

    document.getElementById('ir-registro').addEventListener('click', () => {
        const ev = new CustomEvent('nav', { detail: { route: 'registro' } });
        window.dispatchEvent(ev);
    });

    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const correo = form.correo.value.trim();
        const password = form.password.value.trim();

        if (!correo || !password) {
            errorMsg.textContent = 'Completa todos los campos.';
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password,
        });

        if (error) {
            errorMsg.textContent = 'Error inicio de sesión: ' + error.message;
            return;
        }

        // redirigir a feed / actividades
        // recargar menú
        const evReload = new CustomEvent('session-changed');
        window.dispatchEvent(evReload);

        // mostrar feed
        const ev = new CustomEvent('nav', { detail: { route: 'feed' } });
        window.dispatchEvent(ev);
    });
}
