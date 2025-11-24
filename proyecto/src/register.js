// src/register.js
import { supabase } from './supabase.js';

export function mostrarRegistro() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <section>
      <h2>Registro</h2>
      <form id="registro-form">
        <input type="text" name="nombre" placeholder="Nombre completo" required />
        <input type="text" name="usuario" placeholder="@usuario" required />
        <input type="email" name="correo" placeholder="Correo" required />
        <input type="password" name="password" placeholder="Contraseña" required />
        <input type="text" name="bio" placeholder="Bio (opcional)" />
        <input type="text" name="avatar_url" placeholder="URL avatar (opcional)" />
        <button type="submit">Registrarse</button>
      </form>
      <p id="error" style="color:red;"></p>
      <p>¿Ya tienes cuenta? <button id="ir-login">Iniciar sesión</button></p>
    </section>
  `;

    const form = document.getElementById('registro-form');
    const errorMsg = document.getElementById('error');
    document.getElementById('ir-login').addEventListener('click', () => {
        // disparar evento global o usar main.cargarMenu + mostrarLogin desde main
        const ev = new CustomEvent('nav', { detail: { route: 'login' } });
        window.dispatchEvent(ev);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const nombre = form.nombre.value.trim();
        const usuario = form.usuario.value.trim();
        const correo = form.correo.value.trim();
        const password = form.password.value.trim();
        const bio = form.bio.value.trim();
        const avatar_url = form.avatar_url.value.trim();

        if (!nombre || !usuario || !correo || !password) {
            errorMsg.textContent = 'Por favor completa los campos requeridos.';
            return;
        }

        // 1) Crear usuario en Auth
        const { data: dataAuth, error: errorAuth } = await supabase.auth.signUp({
            email: correo,
            password,
        });

        if (errorAuth) {
            errorMsg.textContent = `Error autenticación: ${errorAuth.message}`;
            return;
        }

        const uid = dataAuth.user?.id;
        if (!uid) {
            // en caso de que supabase requiera confirmación por email primero:
            errorMsg.textContent = 'Registrado. Confirma tu correo para continuar.';
            // intentaremos igualmente insertar con un uuid temporal si se obtuvo
            return;
        }

        // 2) Insertar en tabla usuarios (usar el mismo id)
        const { error: insertError } = await supabase.from('usuarios').insert([
            {
                id: uid,
                nombre,
                usuario,
                correo,
                bio: bio || null,
                avatar_url: avatar_url || null,
            },
        ]);

        if (insertError) {
            // si falla, intentamos borrar el usuario creado en Auth (opcional)
            errorMsg.textContent = `Error guardando usuario: ${insertError.message}`;
            return;
        }

        alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
        // redirigir a login
        const ev = new CustomEvent('nav', { detail: { route: 'login' } });
        window.dispatchEvent(ev);
    });
}
