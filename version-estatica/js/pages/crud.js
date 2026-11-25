/**
 * @file crud.js
 * @description Controlador del Centro CRUD 3FN (Ubicaciones GPS, Categorías, Usuarios y Esquema Relacional).
 */

(function () {
  'use strict';

  let tabActual = 'ubicaciones';
  let ubicacionEditId = null;
  let categoriaEditId = null;

  function esc(str) {
    return window.CampusFindLayout.escapeHtml(str);
  }

  function renderTabs() {
    const tabs = [
      { id: 'ubicaciones', label: '📍 Ubicaciones Usulután (GPS)' },
      { id: 'categorias', label: '🏷️ Categorías' },
      { id: 'usuarios', label: '👥 Usuarios y Roles' },
      { id: 'esquema', label: '📐 Esquema Relacional 3FN (9 Tablas)' },
    ];
    return `
      <div class="flex flex-wrap gap-2">
        ${tabs
          .map(
            (t) => `
          <button
            type="button"
            data-crud-tab="${t.id}"
            class="btn-crud-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
              tabActual === t.id
                ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
            }"
          >
            ${t.label}
          </button>
        `
          )
          .join('')}
      </div>
    `;
  }

  async function cargarTab() {
    const root = document.getElementById('crud-root');

    if (!window.CampusFindLayout.esAdminActual()) {
      root.innerHTML = `
        <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
            <i data-lucide="database" class="w-6 h-6"></i>
          </div>
          <h2 class="text-lg font-extrabold text-slate-900">Acceso exclusivo para Administradores</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Inicia sesión con <code class="font-mono font-bold">admin@campusfind.edu</code> para administrar las tablas normalizadas 3FN.
          </p>
          <button id="btn-crud-login" type="button" class="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs sm:text-sm font-bold cursor-pointer">
            Iniciar Sesión
          </button>
        </div>
      `;
      document.getElementById('btn-crud-login').addEventListener('click', () => window.CampusFindLayout.abrirModalAuth());
      window.CampusFindLayout.refreshIcons();
      return;
    }

    root.innerHTML = `
      <div class="space-y-5">
        ${renderTabs()}
        <div id="crud-panel-body" class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div class="p-8 text-center text-slate-400 text-sm">Cargando registros de SQLite...</div>
        </div>
      </div>
    `;

    root.querySelectorAll('.btn-crud-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        tabActual = btn.getAttribute('data-crud-tab');
        ubicacionEditId = null;
        categoriaEditId = null;
        cargarTab();
      });
    });

    const panel = document.getElementById('crud-panel-body');

    try {
      if (tabActual === 'ubicaciones') {
        await renderUbicaciones(panel);
      } else if (tabActual === 'categorias') {
        await renderCategorias(panel);
      } else if (tabActual === 'usuarios') {
        await renderUsuarios(panel);
      } else {
        await renderEsquema(panel);
      }
    } catch (err) {
      panel.innerHTML = `<div class="p-6 text-center text-rose-700 text-sm font-semibold">${esc(err.message)}</div>`;
    }

    window.CampusFindLayout.refreshIcons();
  }

  async function renderUbicaciones(panel) {
    const res = await window.CampusFindAPI.ubicaciones.listar();
    const lista = res.ubicaciones || [];

    panel.innerHTML = `
      <div class="space-y-5">
        <div>
          <h2 class="font-extrabold text-base sm:text-lg text-slate-900">Ubicaciones Geolocalizadas en Usulután (${lista.length})</h2>
          <p class="text-xs text-slate-500">Tabla <code class="font-mono">ubicaciones</code> con coordenadas GPS</p>
        </div>

        <form id="form-crud-ubi" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <input id="ubi-edificio" type="text" required minlength="2" placeholder="Edificio / Zona" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none" />
          <input id="ubi-nombre" type="text" required minlength="3" placeholder="Salón o Espacio" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none" />
          <input id="ubi-lat" type="number" step="any" required value="13.34212" placeholder="Latitud" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none font-mono" />
          <input id="ubi-lng" type="number" step="any" required value="-88.41797" placeholder="Longitud" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none font-mono" />
          <input id="ubi-desc" type="text" placeholder="Referencia (opcional)" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none" />
          <button id="btn-save-ubi" type="submit" class="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold cursor-pointer">
            Guardar
          </button>
        </form>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <th class="py-2.5 px-3">ID</th>
                <th class="py-2.5 px-3">Edificio</th>
                <th class="py-2.5 px-3">Espacio</th>
                <th class="py-2.5 px-3">Coordenadas GPS</th>
                <th class="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-ubi" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = document.getElementById('tbody-ubi');
    lista.forEach((u) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/70';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-mono text-xs text-slate-400">#${u.id}</td>
        <td class="py-2.5 px-3 font-bold text-slate-900">${esc(u.edificio)}</td>
        <td class="py-2.5 px-3">
          <p class="font-medium text-slate-800">${esc(u.nombre)}</p>
          ${u.descripcion ? `<p class="text-[11px] text-slate-400">${esc(u.descripcion)}</p>` : ''}
        </td>
        <td class="py-2.5 px-3 font-mono text-xs text-blue-700">${Number(u.latitud || 13.34212).toFixed(5)}, ${Number(u.longitud || -88.41797).toFixed(5)}</td>
        <td class="py-2.5 px-3 text-right space-x-1.5">
          <button type="button" class="btn-edit-ubi px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold cursor-pointer">Editar</button>
          <button type="button" class="btn-del-ubi px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer">Eliminar</button>
        </td>
      `;
      tr.querySelector('.btn-edit-ubi').addEventListener('click', () => {
        ubicacionEditId = u.id;
        document.getElementById('ubi-edificio').value = u.edificio || '';
        document.getElementById('ubi-nombre').value = u.nombre || '';
        document.getElementById('ubi-lat').value = u.latitud ?? 13.34212;
        document.getElementById('ubi-lng').value = u.longitud ?? -88.41797;
        document.getElementById('ubi-desc').value = u.descripcion || '';
        document.getElementById('btn-save-ubi').textContent = 'Actualizar #' + u.id;
      });
      tr.querySelector('.btn-del-ubi').addEventListener('click', () => {
        window.CampusFindLayout.abrirModalConfirmacion({
          titulo: 'Eliminar ubicación',
          mensaje: `¿Deseas eliminar "${u.edificio} — ${u.nombre}"?`,
          onConfirmar: async () => {
            try {
              await window.CampusFindAPI.ubicaciones.eliminar(u.id);
              window.CampusFindLayout.showToast('Ubicación eliminada.', 'success');
              cargarTab();
            } catch (err) {
              window.CampusFindLayout.showToast(err.message, 'error');
            }
          },
        });
      });
      tbody.appendChild(tr);
    });

    document.getElementById('form-crud-ubi').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        edificio: document.getElementById('ubi-edificio').value.trim(),
        nombre: document.getElementById('ubi-nombre').value.trim(),
        latitud: Number(document.getElementById('ubi-lat').value),
        longitud: Number(document.getElementById('ubi-lng').value),
        descripcion: document.getElementById('ubi-desc').value.trim(),
      };
      try {
        if (ubicacionEditId) {
          await window.CampusFindAPI.ubicaciones.actualizar(ubicacionEditId, data);
          window.CampusFindLayout.showToast('Ubicación actualizada correctamente.', 'success');
          ubicacionEditId = null;
        } else {
          await window.CampusFindAPI.ubicaciones.crear(data);
          window.CampusFindLayout.showToast('Ubicación registrada correctamente.', 'success');
        }
        cargarTab();
      } catch (err) {
        window.CampusFindLayout.showToast(err.message, 'error');
      }
    });
  }

  async function renderCategorias(panel) {
    const res = await window.CampusFindAPI.categorias.listar();
    const lista = res.categorias || [];

    panel.innerHTML = `
      <div class="space-y-5">
        <div>
          <h2 class="font-extrabold text-base sm:text-lg text-slate-900">Catálogo de Categorías (${lista.length})</h2>
          <p class="text-xs text-slate-500">Tabla <code class="font-mono">categorias</code> con restricción de integridad referencial</p>
        </div>

        <form id="form-crud-cat" class="flex flex-wrap gap-2.5 max-w-lg">
          <input id="cat-nombre" type="text" required minlength="3" maxlength="50" placeholder="Nombre de categoría (ej. Instrumentos)" class="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-300 outline-none focus:border-indigo-700" />
          <button id="btn-save-cat" type="submit" class="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs sm:text-sm font-bold cursor-pointer">
            Crear Categoría
          </button>
        </form>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <th class="py-2.5 px-3">ID</th>
                <th class="py-2.5 px-3">Nombre</th>
                <th class="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-cat" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = document.getElementById('tbody-cat');
    lista.forEach((c) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/70';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-mono text-xs text-slate-400">#${c.id}</td>
        <td class="py-2.5 px-3 font-bold text-slate-900">${esc(c.nombre)}</td>
        <td class="py-2.5 px-3 text-right space-x-1.5">
          <button type="button" class="btn-edit-cat px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-700 text-xs font-bold cursor-pointer">Editar</button>
          <button type="button" class="btn-del-cat px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer">Eliminar</button>
        </td>
      `;
      tr.querySelector('.btn-edit-cat').addEventListener('click', () => {
        categoriaEditId = c.id;
        document.getElementById('cat-nombre').value = c.nombre;
        document.getElementById('btn-save-cat').textContent = 'Actualizar #' + c.id;
      });
      tr.querySelector('.btn-del-cat').addEventListener('click', () => {
        window.CampusFindLayout.abrirModalConfirmacion({
          titulo: 'Eliminar categoría',
          mensaje: `¿Seguro que deseas eliminar la categoría "${c.nombre}"?`,
          onConfirmar: async () => {
            try {
              await window.CampusFindAPI.categorias.eliminar(c.id);
              window.CampusFindLayout.showToast('Categoría eliminada.', 'success');
              cargarTab();
            } catch (err) {
              window.CampusFindLayout.showToast(err.message, 'error');
            }
          },
        });
      });
      tbody.appendChild(tr);
    });

    document.getElementById('form-crud-cat').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('cat-nombre').value.trim();
      try {
        if (categoriaEditId) {
          await window.CampusFindAPI.categorias.actualizar(categoriaEditId, nombre);
          window.CampusFindLayout.showToast('Categoría actualizada.', 'success');
          categoriaEditId = null;
        } else {
          await window.CampusFindAPI.categorias.crear(nombre);
          window.CampusFindLayout.showToast('Categoría creada.', 'success');
        }
        cargarTab();
      } catch (err) {
        window.CampusFindLayout.showToast(err.message, 'error');
      }
    });
  }

  async function renderUsuarios(panel) {
    const res = await window.CampusFindAPI.usuarios.listar();
    const lista = res.usuarios || [];

    panel.innerHTML = `
      <div class="space-y-5">
        <div>
          <h2 class="font-extrabold text-base sm:text-lg text-slate-900">Usuarios Institucionales (${lista.length})</h2>
          <p class="text-xs text-slate-500">Tabla <code class="font-mono">usuarios</code> vinculada por FK a <code class="font-mono">tipos_usuario</code></p>
        </div>

        <form id="form-crud-user" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <input id="usr-nombre" type="text" required minlength="3" placeholder="Nombre completo" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none" />
          <input id="usr-correo" type="email" required placeholder="correo@campusfind.edu" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none" />
          <input id="usr-tel" type="tel" placeholder="Teléfono (ej. 7788-9900)" class="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white outline-none" />
          <select id="usr-rol" class="text-xs p-2 rounded-xl border border-slate-300 bg-white outline-none">
            <option value="1">Estudiante</option>
            <option value="2">Docente</option>
            <option value="3">Personal</option>
            <option value="4">Administrador</option>
          </select>
          <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold cursor-pointer">
            Registrar Usuario
          </button>
        </form>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <th class="py-2.5 px-3">ID</th>
                <th class="py-2.5 px-3">Nombre</th>
                <th class="py-2.5 px-3">Correo</th>
                <th class="py-2.5 px-3">Teléfono</th>
                <th class="py-2.5 px-3">Rol</th>
                <th class="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-usr" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = document.getElementById('tbody-usr');
    lista.forEach((u) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/70';
      const rolNombre = u.tipo_usuario?.nombre || 'estudiante';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-mono text-xs text-slate-400">#${u.id}</td>
        <td class="py-2.5 px-3 font-bold text-slate-900">${esc(u.nombre)}</td>
        <td class="py-2.5 px-3 text-xs text-slate-600 font-mono">${esc(u.correo)}</td>
        <td class="py-2.5 px-3 text-xs text-slate-600">${esc(u.telefono || '—')}</td>
        <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[11px] font-bold capitalize bg-slate-100 text-slate-700">${esc(rolNombre)}</span></td>
        <td class="py-2.5 px-3 text-right">
          <button type="button" class="btn-del-usr px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer">Eliminar</button>
        </td>
      `;
      tr.querySelector('.btn-del-usr').addEventListener('click', () => {
        window.CampusFindLayout.abrirModalConfirmacion({
          titulo: 'Eliminar usuario',
          mensaje: `¿Deseas eliminar la cuenta de "${u.nombre}"?`,
          onConfirmar: async () => {
            try {
              await window.CampusFindAPI.usuarios.eliminar(u.id);
              window.CampusFindLayout.showToast('Usuario eliminado.', 'success');
              cargarTab();
            } catch (err) {
              window.CampusFindLayout.showToast(err.message, 'error');
            }
          },
        });
      });
      tbody.appendChild(tr);
    });

    document.getElementById('form-crud-user').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await window.CampusFindAPI.usuarios.crear({
          nombre: document.getElementById('usr-nombre').value.trim(),
          correo: document.getElementById('usr-correo').value.trim(),
          telefono: document.getElementById('usr-tel').value.trim(),
          tipo_usuario_id: Number(document.getElementById('usr-rol').value),
        });
        window.CampusFindLayout.showToast('Usuario registrado (contraseña inicial: password123).', 'success');
        cargarTab();
      } catch (err) {
        window.CampusFindLayout.showToast(err.message, 'error');
      }
    });
  }

  async function renderEsquema(panel) {
    const res = await window.CampusFindAPI.stats.esquema();
    const tablas = res.tablas || [];

    panel.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="font-extrabold text-base sm:text-lg text-slate-900">Arquitectura Relacional en 3FN (${tablas.length} Tablas)</h2>
            <p class="text-xs text-slate-500">${esc(res.motor || 'SQLite3')} • ${esc(res.orm || 'Sequelize')}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${tablas
            .map(
              (t) => `
            <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <code class="font-mono font-extrabold text-sm text-indigo-800">${esc(t.nombre)}</code>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">${t.registros} reg.</span>
              </div>
              <p class="text-[11px] font-semibold text-emerald-700">${esc(t.formaNormal)}</p>
              <p class="text-xs text-slate-600 leading-relaxed">${esc(t.descripcion)}</p>
              <div class="pt-2 border-t border-slate-200 text-[11px] space-y-1 font-mono text-slate-600">
                <p><strong class="text-slate-800">PK:</strong> ${esc(t.pk)}</p>
                ${
                  t.fks && t.fks.length > 0
                    ? `<p><strong class="text-slate-800">FKs:</strong> ${t.fks.map((fk) => esc(fk)).join(', ')}</p>`
                    : `<p class="text-slate-400">Sin claves foráneas (tabla catálogo)</p>`
                }
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.CampusFindLayout.renderNavbar('crud');
    window.CampusFindLayout.renderFooter();
    cargarTab();
  });
})();
