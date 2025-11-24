// src/main.js
import { mostrarRegistro } from './register.js';
import { mostrarLogin } from './login.js';
import { mostrarFeed } from './posts.js';
import { mostrarUser } from './user.js';
import { mostrarAdmin } from './admin.js';
import { supabase } from './supabase.js';

const routes = {
  registro: mostrarRegistro,
  login: mostrarLogin,
  feed: mostrarFeed,
  perfil: mostrarUser,
  admin: mostrarAdmin,
};

// 1. FUNCIÓN PARA INYECTAR EL MODAL (Se ejecuta una sola vez)
function inicializarModal() {
  if (document.getElementById('modal-crear-post')) return; // Ya existe

  const modal = document.createElement('div');
  modal.id = 'modal-crear-post';
  modal.innerHTML = `
    <div class="modal-bg"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Nuevo hilo</h3>
        <button type="button" id="cerrar-modal">Cancelar</button>
      </div>
      <form id="modal-post-form">
        <textarea name="contenido" placeholder="¿Qué hay de nuevo?" required></textarea>
        <input type="text" name="imagen" placeholder="URL de imagen (opcional)">
        <div class="modal-footer">
            <button type="submit" class="btn-publicar">Publicar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Eventos del Modal (Cerrar y Submit)
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-bg') || e.target.id === 'cerrar-modal') {
      modal.classList.remove('open');
    }
  });

  const form = document.getElementById('modal-post-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contenido = form.contenido.value.trim();
    const imagen = form.imagen.value.trim();

    // Obtener usuario
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }

    const { error } = await supabase.from('posts').insert([
      { usuario_id: user.id, contenido, imagen: imagen || null }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      form.reset();
      modal.classList.remove('open');
      // Disparar evento para recargar feed
      window.dispatchEvent(new CustomEvent('post-creado'));
    }
  });
}

// 2. FUNCIÓN CARGAR MENÚ
export async function cargarMenu() {
  const menu = document.getElementById('menu');
  const { data: { user } } = await supabase.auth.getUser();

  // Aseguramos que el modal exista antes de pintar el menú
  inicializarModal();

  // Limpiamos
  menu.innerHTML = '';

  // Logo (Visible solo en Desktop por CSS)
  const logoDiv = document.createElement('div');
  logoDiv.className = 'logo';
  logoDiv.innerHTML = `<img src="./Threads_(app)_logo.svg" alt="Threads"/>`;
  menu.appendChild(logoDiv);

  if (!user) {
    // MENÚ DESCONECTADO
    menu.innerHTML += `
      <button data-action="registro">Registrarse</button>
      <button data-action="login">Iniciar sesión</button>
    `;
  } else {
    // MENÚ CONECTADO (Iconos)
    menu.innerHTML += `
      <button data-action="feed" class="nav-btn" title="Inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </button>

      <button id="btn-crear-post" class="nav-btn" title="Crear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      </button>

      <button data-action="perfil" class="nav-btn" title="Perfil">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>

      <button id="logout" class="nav-btn" title="Salir">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    `;

    // Si es admin
    if (user.email === 'jesus.vargasl@uniagustiniana.edu.co') {
      const adminBtn = document.createElement('button');
      adminBtn.dataset.action = 'admin';
      adminBtn.className = 'nav-btn';
      adminBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>`;
      menu.insertBefore(adminBtn, document.getElementById('logout'));
    }
  }

  // --- ASIGNAR EVENTOS ---

  // 1. Navegación
  menu.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (routes[action]) routes[action]();
    });
  });

  // 2. Abrir Modal (EL FIX PRINCIPAL)
  const btnCrear = document.getElementById('btn-crear-post');
  if (btnCrear) {
    btnCrear.addEventListener('click', () => {
      const modal = document.getElementById('modal-crear-post');
      if (modal) modal.classList.add('open');
    });
  }

  // 3. Logout
  const btnLogout = document.getElementById('logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await supabase.auth.signOut();
      await cargarMenu();
      mostrarLogin();
    });
  }
}

// EVENTOS GLOBALES
window.addEventListener('nav', (e) => {
  const route = e.detail?.route;
  if (route && routes[route]) routes[route]();
});

window.addEventListener('session-changed', async () => {
  await cargarMenu();
});

window.addEventListener('post-creado', () => {
  if (typeof mostrarFeed === 'function') mostrarFeed();
});

// ARRANQUE
document.addEventListener('DOMContentLoaded', async () => {
  await cargarMenu();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) mostrarFeed();
  else mostrarRegistro();
});