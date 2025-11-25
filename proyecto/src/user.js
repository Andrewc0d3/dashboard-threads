import {
  obtenerUsuarioPorId,
  actualizarUsuario
} from "./usuariosCrud.js";

import { supabase } from "./supabase.js";

export async function mostrarUser() {

  const app = document.getElementById('app');

  app.innerHTML = `
    <section>
      <h2>Mi Perfil</h2>

      <form id="user-form">
        <label>Nombre</label>
        <input type="text" id="nombre" required />

        <label>Usuario</label>
        <input type="text" id="usuario" required />

        <label>Bio</label>
        <textarea id="bio"></textarea>

        <label>Avatar URL</label>
        <input type="text" id="avatar_url" />

        <button type="submit">Actualizar</button>
      </form>

      <p id="mensaje"></p>
    </section>
  `;

  const mensaje = document.getElementById('mensaje');

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    app.innerHTML = '<p>⚠️ Inicia sesión para ver tu perfil.</p>';
    return;
  }

  const usuario = await obtenerUsuarioPorId(user.id);

  if (!usuario) {
    mensaje.textContent = "❌ Error cargando datos del usuario.";
    return;
  }

  document.getElementById('nombre').value = usuario.nombre || '';
  document.getElementById('usuario').value = usuario.usuario || '';
  document.getElementById('bio').value = usuario.bio || '';
  document.getElementById('avatar_url').value = usuario.avatar_url || '';

  document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const usuarioNick = document.getElementById('usuario').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const avatar_url = document.getElementById('avatar_url').value.trim();

    const resultado = await actualizarUsuario(user.id, {
      nombre,
      usuario: usuarioNick,
      bio: bio || null,
      avatar_url: avatar_url || null
    });

    if (typeof resultado === "string") {
      mensaje.textContent = "❌ " + resultado;
    } else {
      mensaje.textContent = "✅ Perfil actualizado correctamente";

      window.dispatchEvent(new CustomEvent('session-changed'));
    }
  });
}
