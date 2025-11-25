// src/admin.js
import { supabase } from './supabase.js';
import { escapeHtml, escapeAttr } from './helpers.js';
import { obtenerUsuarios, eliminarUsuario } from './usuariosCrud.js';

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

        <section style="display:flex;gap:20px;flex-wrap:wrap;">
            <div style="flex:1;min-width:300px;">
                <h3>Usuarios</h3>
                <div id="lista-usuarios">Cargando...</div>
            </div>

            <div style="flex:2;min-width:300px;">
                <h3>Posts</h3>
                <div id="lista-posts">Cargando...</div>
            </div>
        </section>
    `;

    const msg = document.getElementById('admin-mensaje');

    // =============================
    // CARGAR USUARIOS
    // =============================

    const users = await obtenerUsuarios();

    if (!users) {
        document.getElementById('lista-usuarios').innerHTML = '❌ Error cargando usuarios.';
        return;
    }

    document.getElementById('lista-usuarios').innerHTML =
        users.length === 0
            ? '<p>No hay usuarios registrados</p>'
            : `
                <ul style="list-style:none;padding:0;">
                ${users.map(u => `
                    <li style="margin-bottom:10px;padding:8px;border:1px solid #eee;border-radius:6px;">
                        <strong>${escapeHtml(u.nombre)}</strong>
                        <span> (@${escapeHtml(u.usuario)})</span><br>
                        <small>${escapeHtml(u.correo)}</small><br>

                        ${u.avatar_url ? `
                            <img src="${escapeAttr(u.avatar_url)}" 
                                 style="max-width:60px;margin-top:6px;border-radius:50%;">
                        ` : ``}

                        <div style="margin-top:8px;">
                            <button data-id="${u.id}" class="borrar-u">
                                Eliminar
                            </button>
                        </div>
                    </li>
                `).join('')}
                </ul>
            `;

    document.querySelectorAll('.borrar-u').forEach(btn => {
        btn.addEventListener('click', async (e) => {

            const id = e.target.getAttribute('data-id');

            if (!confirm('¿Eliminar este usuario definitivamente?')) return;

            const resultado = await eliminarUsuario(id);

            if (resultado !== "Usuario eliminado correctamente.") {
                msg.textContent = "❌ " + resultado;
            } else {
                msg.textContent = "✅ Usuario eliminado";
                mostrarAdmin();
            }
        });
    });


    // =============================
    // CARGAR POSTS
    // =============================

    const { data: posts, error: errP } = await supabase
        .from('posts')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(200);

    if (errP) {
        document.getElementById('lista-posts').innerHTML = '❌ Error: ' + errP.message;
        return;
    }

    if (!posts || posts.length === 0) {
        document.getElementById('lista-posts').innerHTML = '<p>No hay posts</p>';
        return;
    }

    // Obtener usuarios de esos posts
    const uids = [...new Set(posts.map(p => p.usuario_id))];

    const { data: udata } = await supabase
        .from('usuarios')
        .select('id,nombre,usuario,avatar_url')
        .in('id', uids);

    const mapU = {};
    (udata || []).forEach(u => mapU[u.id] = u);

    document.getElementById('lista-posts').innerHTML = `
        <ul style="list-style:none;padding:0;">
        ${posts.map(p => {

        const u = mapU[p.usuario_id] || {};

        return `
            <li style="margin-bottom:12px;border:1px solid #eee;border-radius:6px;padding:10px;">
                
                <div>
                    <strong>${escapeHtml(u.nombre || 'Usuario')}</strong>
                    <span> (@${escapeHtml(u.usuario || '')})</span>
                </div>

                <div style="margin-top:6px;">
                    ${escapeHtml(p.contenido || '')}
                </div>

                ${p.imagen ? `
                    <div style="margin-top:6px;">
                        <img src="${escapeAttr(p.imagen)}" style="max-width:160px;border-radius:6px;">
                    </div>
                ` : ''}

                <div style="margin-top:8px;">
                    <button data-id="${p.id}" class="borrar-p">
                        Eliminar post
                    </button>
                </div>
            </li>
            `;
    }).join('')}
        </ul>
    `;

    document.querySelectorAll('.borrar-p').forEach(btn => {
        btn.addEventListener('click', async (e) => {

            const id = e.target.getAttribute('data-id');

            if (!confirm('¿Eliminar este post?')) return;

            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) {
                msg.textContent = '❌ Error: ' + error.message;
            } else {
                msg.textContent = '✅ Post eliminado';
                mostrarAdmin();
            }
        });
    });
}
