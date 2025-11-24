// src/user.js
import { supabase } from './supabase.js';

export async function mostrarUser() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <section>
      <h2>Mi Perfil</h2>
      <form id="user-form">
        <label>Nombre</label><input type="text" id="nombre" required />
        <label>Usuario</label><input type="text" id="usuario" required />
        <label>Bio</label><textarea id="bio"></textarea>
        <label>Avatar URL</label><input type="text" id="avatar_url" />
        <button type="submit">Actualizar</button>
      </form>
      <p id="mensaje"></p>
    </section>
  `;

    const mensaje = document.getElementById('mensaje');
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
        app.innerHTML = '<p>⚠️ Inicia sesión para ver tu perfil.</p>';
        return;
    }

    const { data, error } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
    if (error) {
        mensaje.textContent = 'Error cargando datos: ' + error.message;
        return;
    }

    document.getElementById('nombre').value = data.nombre || '';
    document.getElementById('usuario').value = data.usuario || '';
    document.getElementById('bio').value = data.bio || '';
    document.getElementById('avatar_url').value = data.avatar_url || '';

    document.getElementById('user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        mensaje.textContent = '';
        const nombre = document.getElementById('nombre').value.trim();
        const usuario = document.getElementById('usuario').value.trim();
        const bio = document.getElementById('bio').value.trim();
        const avatar_url = document.getElementById('avatar_url').value.trim();

        const { error: updateError } = await supabase.from('usuarios').update({ nombre, usuario, bio: bio || null, avatar_url: avatar_url || null }).eq('id', user.id);
        if (updateError) {
            mensaje.textContent = '❌ Error: ' + updateError.message;
        } else {
            mensaje.textContent = '✅ Perfil actualizado';
            // opcional: recargar menu / datos
            const ev = new CustomEvent('session-changed');
            window.dispatchEvent(ev);
        }
    });
}
