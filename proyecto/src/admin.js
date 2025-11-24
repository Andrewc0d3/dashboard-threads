// src/admin.js
import { supabase } from './supabase.js';
import { escapeHtml, escapeAttr } from './helpers.js';

const ADMIN_EMAIL = 'jesus.vargasl@uniagustiniana.edu.co';

export async function mostrarAdmin() {
    const app = document.getElementById('app');

    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData.user;
    if (!user || user.email !== ADMIN_EMAIL) {
        app.innerHTML = '<p>⛔ No tienes permisos para acceder a este panel.</p>';
        return;
    }

    app.innerHTML = `
    <h2>Panel Administrativo</h2>
    <div id="admin-mensaje"></div>
    <section style="display:flex;gap:20px;">
      <div style="flex:1;">
        <h3>Usuarios</h3>
        <div id="lista-usuarios">Cargando...</div>
      </div>
      <div style="flex:2;">
        <h3>Posts</h3>
        <div id="lista-posts">Cargando...</div>
      </div>
    </section>
  `;

    const msg = document.getElementById('admin-mensaje');

    // cargar usuarios
    const { data: users, error: errU } = await supabase.from('usuarios').select('id,nombre,usuario,correo,avatar_url').order('nombre', { ascending: true });
    if (errU) {
        document.getElementById('lista-usuarios').innerHTML = 'Error: ' + errU.message;
    } else {
        document.getElementById('lista-usuarios').innerHTML = users.length === 0 ? '<p>No hay usuarios</p>' : `<ul>${users.map(u => `<li style="margin-bottom:8px;"><strong>${escapeHtml(u.nombre)}</strong> (@${escapeHtml(u.usuario)}) — ${escapeHtml(u.correo)} <button data-id="${u.id}" class="borrar-u">Eliminar</button></li>`).join('')}</ul>`;
        document.querySelectorAll('.borrar-u').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (!confirm('Eliminar usuario y sus datos?')) return;
                const { error } = await supabase.from('usuarios').delete().eq('id', id);
                if (error) msg.textContent = 'Error: ' + error.message;
                else {
                    msg.textContent = 'Usuario eliminado';
                    mostrarAdmin();
                }
            });
        });
    }

    // cargar posts con usuario
    const { data: posts, error: errP } = await supabase.from('posts').select('*').order('creado_en', { ascending: false }).limit(200);
    if (errP) {
        document.getElementById('lista-posts').innerHTML = 'Error: ' + errP.message;
    } else {
        // get user ids
        const uids = Array.from(new Set(posts.map(p => p.usuario_id)));
        const { data: udata } = await supabase.from('usuarios').select('id,nombre,usuario,avatar_url').in('id', uids);
        const mapU = {};
        (udata || []).forEach(u => (mapU[u.id] = u));

        document.getElementById('lista-posts').innerHTML = posts.length === 0 ? '<p>No hay posts</p>' : `<ul>${posts.map(p => {
            const u = mapU[p.usuario_id] || {};
            return `<li style="margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:8px;">
        <div><strong>${escapeHtml(u.nombre || 'Usuario')}</strong> (@${escapeHtml(u.usuario || '')})</div>
        <div style="margin-top:6px;">${escapeHtml(p.contenido || '')}</div>
        ${p.imagen ? `<div style="margin-top:6px;"><img src="${escapeAttr(p.imagen)}" style="max-width:160px;"></div>` : ''}
        <div style="margin-top:6px;"><button data-id="${p.id}" class="borrar-p">Eliminar</button></div>
      </li>`;
        }).join('')}</ul>`;

        document.querySelectorAll('.borrar-p').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (!confirm('Eliminar post?')) return;
                const { error } = await supabase.from('posts').delete().eq('id', id);
                if (error) msg.textContent = 'Error: ' + error.message;
                else {
                    msg.textContent = 'Post eliminado';
                    mostrarAdmin();
                }
            });
        });
    }
}
