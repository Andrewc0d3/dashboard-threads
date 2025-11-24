import { supabase } from './supabase.js';

let currentMode = 'global';
let feedInitialized = false;

export function mostrarFeed() {
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="feed-container">
      <div class="feed-header">
        <button id="btn-feed-global">🌎 Global</button>
        <button id="btn-feed-seguidos">👥 Seguidos</button>
      </div>

      <div id="posts-container">Cargando publicaciones...</div>
    </div>
  `;

    document.getElementById('btn-feed-global')
        .addEventListener('click', () => {
            currentMode = 'global';
            cargarPosts('global');
        });

    document.getElementById('btn-feed-seguidos')
        .addEventListener('click', () => {
            currentMode = 'seguidos';
            cargarPosts('seguidos');
        });

    cargarPosts('global');

    if (!feedInitialized) {
        window.addEventListener('post-creado', () => cargarPosts(currentMode));
        feedInitialized = true;
    }
}

export async function cargarPosts(modo) {
    const container = document.getElementById('posts-container');
    container.innerHTML = "Cargando publicaciones...";

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            container.innerHTML = "⚠️ Debes iniciar sesión.";
            return;
        }

        let query = supabase
            .from('posts')
            .select(`
        id,
        contenido,
        imagen,
        creado_en,
        usuario_id,
        usuarios (usuario, avatar_url)
      `)
            .order('creado_en', { ascending: false });

        // Feed solo de seguidos
        if (modo === 'seguidos') {
            const { data: seguidos } = await supabase
                .from('follows')
                .select('seguido_id')
                .eq('seguidor_id', user.id);

            const ids = seguidos.map(s => s.seguido_id);

            if (ids.length === 0) {
                container.innerHTML = `<p>No sigues a nadie todavía.</p>`;
                return;
            }

            query = query.in('usuario_id', ids);
        }

        const { data: posts, error } = await query;

        if (error) throw error;

        if (!posts || posts.length === 0) {
            container.innerHTML = `<p>No hay publicaciones.</p>`;
            return;
        }

        const postIds = posts.map(p => p.id);

        // ✅ Solo traemos likes de los posts presentes
        const { data: likesData } = await supabase
            .from('likes')
            .select('post_id, usuario_id')
            .in('post_id', postIds);

        container.innerHTML = '';

        for (let post of posts) {

            const likes = likesData.filter(l => l.post_id === post.id);
            const likedByUser = likes.some(l => l.usuario_id === user.id);

            const avatar = post.usuarios?.avatar_url || 'default.png';
            const username = post.usuarios?.usuario || 'usuario';

            const div = document.createElement('div');
            div.classList.add('post');

            div.innerHTML = `
        <div class="post-header">
          <img src="${avatar}" class="avatar" />
          <strong>@${username}</strong>
        </div>

        <p class="post-content">${post.contenido}</p>

        ${post.imagen ? `<img src="${post.imagen}" class="post-image">` : ''}

        <div class="post-footer">
          <button class="btn-like" data-id="${post.id}">
            ${likedByUser ? '❤️' : '🤍'} ${likes.length}
          </button>
          <button class="btn-comentar" data-id="${post.id}">
            💬 Comentar
          </button>
        </div>
      `;

            container.appendChild(div);
        }

        activarEventosLikes();

    } catch (err) {
        console.error("ERROR POSTS:", err);
        container.innerHTML = "❌ Error cargando publicaciones.";
    }
}

function activarEventosLikes() {
    document.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', async () => {

            const postId = btn.dataset.id;

            const { data: { user } } = await supabase.auth.getUser();

            const { data: existingLike } = await supabase
                .from('likes')
                .select('*')
                .eq('post_id', postId)
                .eq('usuario_id', user.id)
                .maybeSingle();

            if (existingLike) {
                await supabase
                    .from('likes')
                    .delete()
                    .eq('id', existingLike.id);
            } else {
                await supabase
                    .from('likes')
                    .insert({
                        post_id: postId,
                        usuario_id: user.id
                    });
            }

            cargarPosts(currentMode);
        });
    });
}
