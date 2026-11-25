/**
 * @file mis-reportes.js
 * @description Controlador para gestionar los reportes propios del usuario autenticado.
 */

(function () {
  'use strict';

  let categorias = [];
  let ubicaciones = [];

  function esc(str) {
    return window.CampusFindLayout.escapeHtml(str);
  }

  function formatFecha(fechaStr) {
    try {
      return new Date(fechaStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return fechaStr || '';
    }
  }

  function badgeEstado(estadoId) {
    if (estadoId === 1) return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Perdido</span>`;
    if (estadoId === 2) return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Encontrado</span>`;
    return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Recuperado</span>`;
  }

  function abrirModalEdicion(obj) {
    document.getElementById('edit-rep-id').value = String(obj.id);
    document.getElementById('edit-rep-titulo').value = obj.titulo || '';
    document.getElementById('edit-rep-estado').value = String(obj.estado_id || 1);
    document.getElementById('edit-rep-categoria').value = String(obj.categoria_id || '');
    document.getElementById('edit-rep-ubicacion').value = String(obj.ubicacion_id || '');
    document.getElementById('edit-rep-desc').value = obj.descripcion || '';
    document.getElementById('dialog-editar-reporte').showModal();
  }

  async function cargarMisReportes() {
    const container = document.getElementById('mis-reportes-content');
    const usuario = window.CampusFindLayout.getUsuarioActual();

    if (!usuario) {
      container.innerHTML = `
        <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <i data-lucide="lock" class="w-6 h-6"></i>
          </div>
          <h2 class="text-lg font-extrabold text-slate-900">Inicia sesión para ver tus reportes</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Aquí podrás consultar el estado de tus objetos reportados, editarlos o revisar si alguien envió una reclamación.
          </p>
          <button id="btn-login-mis-reportes" type="button" class="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold cursor-pointer">
            Iniciar Sesión
          </button>
        </div>
      `;
      document.getElementById('btn-login-mis-reportes').addEventListener('click', () => {
        window.CampusFindLayout.abrirModalAuth();
      });
      window.CampusFindLayout.refreshIcons();
      return;
    }

    container.innerHTML = `<div class="p-12 text-center text-slate-400 text-sm">Cargando tus reportes...</div>`;

    try {
      const res = await window.CampusFindAPI.objetos.misReportes();
      const objetos = res.objetos || [];

      if (objetos.length === 0) {
        container.innerHTML = `
          <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <i data-lucide="folder-heart" class="w-6 h-6"></i>
            </div>
            <h2 class="text-lg font-extrabold text-slate-900">Aún no has publicado reportes</h2>
            <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              ¿Perdiste o encontraste algo en el campus? Regístralo ahora con ubicación GPS.
            </p>
            <a href="../reportar/index.html" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold no-underline">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Crear mi primer reporte</span>
            </a>
          </div>
        `;
        window.CampusFindLayout.refreshIcons();
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';

      objetos.forEach((obj) => {
        const cantReclamos = Array.isArray(obj.reclamaciones) ? obj.reclamaciones.length : 0;
        const card = document.createElement('article');
        card.className = 'bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden';
        card.innerHTML = `
          <div class="p-5 space-y-3">
            <div class="flex items-center justify-between gap-2">
              ${badgeEstado(obj.estado_id)}
              <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">${esc(obj.categoria?.nombre || 'General')}</span>
            </div>
            <h3 class="font-extrabold text-base text-slate-900 line-clamp-1">${esc(obj.titulo)}</h3>
            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${esc(obj.descripcion)}</p>
            <div class="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <p class="truncate">📍 ${esc(obj.ubicacion?.edificio || 'Campus')} — ${esc(obj.ubicacion?.nombre || '')}</p>
              <p>📅 ${esc(formatFecha(obj.fecha_reporte))}</p>
              ${
                cantReclamos > 0
                  ? `<p class="text-blue-700 font-bold">📋 ${cantReclamos} reclamación(es) recibida(s)</p>`
                  : `<p class="text-slate-400">Sin reclamaciones aún</p>`
              }
            </div>
          </div>
          <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
            <button type="button" class="btn-ver-obj text-xs font-bold text-slate-700 hover:text-blue-700 cursor-pointer">Ver detalle</button>
            <div class="flex items-center gap-2">
              <button type="button" class="btn-edit-obj px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer">Editar</button>
              <button type="button" class="btn-del-obj px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer">Eliminar</button>
            </div>
          </div>
        `;

        card.querySelector('.btn-ver-obj').addEventListener('click', () => {
          window.CampusFindLayout.abrirModalDetalle(obj);
        });
        card.querySelector('.btn-edit-obj').addEventListener('click', () => abrirModalEdicion(obj));
        card.querySelector('.btn-del-obj').addEventListener('click', () => {
          window.CampusFindLayout.abrirModalConfirmacion({
            titulo: 'Eliminar reporte',
            mensaje: `¿Seguro que deseas eliminar "${obj.titulo}"? Esta acción no se puede deshacer.`,
            textoConfirmar: 'Sí, eliminar',
            onConfirmar: async () => {
              try {
                await window.CampusFindAPI.objetos.eliminar(obj.id);
                window.CampusFindLayout.showToast('Reporte eliminado correctamente.', 'success');
                cargarMisReportes();
              } catch (err) {
                window.CampusFindLayout.showToast(err.message || 'No se pudo eliminar el reporte.', 'error');
              }
            },
          });
        });

        grid.appendChild(card);
      });

      container.innerHTML = '';
      container.appendChild(grid);
      window.CampusFindLayout.refreshIcons();
    } catch (err) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-700 text-sm font-semibold">
          ${esc(err.message || 'No se pudieron cargar tus reportes.')}
        </div>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    window.CampusFindLayout.renderNavbar('mis-reportes');
    window.CampusFindLayout.renderFooter();

    const dlgEdit = document.getElementById('dialog-editar-reporte');
    if (dlgEdit && !('closedBy' in HTMLDialogElement.prototype)) {
      dlgEdit.addEventListener('click', (event) => {
        if (event.target !== dlgEdit) return;
        const rect = dlgEdit.getBoundingClientRect();
        if (rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width) return;
        dlgEdit.close();
      });
    }
    document.getElementById('btn-cerrar-editar-reporte').addEventListener('click', () => dlgEdit.close());
    document.getElementById('btn-cancelar-editar-reporte').addEventListener('click', () => dlgEdit.close());

    try {
      const [resCat, resUbi] = await Promise.all([
        window.CampusFindAPI.categorias.listar(),
        window.CampusFindAPI.ubicaciones.listar(),
      ]);
      categorias = resCat.categorias || [];
      ubicaciones = resUbi.ubicaciones || [];

      const selCat = document.getElementById('edit-rep-categoria');
      categorias.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = String(c.id);
        opt.textContent = c.nombre;
        selCat.appendChild(opt);
      });
      const selUbi = document.getElementById('edit-rep-ubicacion');
      ubicaciones.forEach((u) => {
        const opt = document.createElement('option');
        opt.value = String(u.id);
        opt.textContent = `${u.edificio} — ${u.nombre}`;
        selUbi.appendChild(opt);
      });
    } catch {
      // Silencioso si falla catálogo secundario
    }

    document.getElementById('form-editar-reporte').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = Number(document.getElementById('edit-rep-id').value);
      try {
        await window.CampusFindAPI.objetos.actualizar(id, {
          titulo: document.getElementById('edit-rep-titulo').value.trim(),
          estado_id: Number(document.getElementById('edit-rep-estado').value),
          categoria_id: Number(document.getElementById('edit-rep-categoria').value),
          ubicacion_id: Number(document.getElementById('edit-rep-ubicacion').value),
          descripcion: document.getElementById('edit-rep-desc').value.trim(),
        });
        dlgEdit.close();
        window.CampusFindLayout.showToast('Reporte actualizado correctamente.', 'success');
        cargarMisReportes();
      } catch (err) {
        window.CampusFindLayout.showToast(err.message || 'Error al actualizar el reporte.', 'error');
      }
    });

    cargarMisReportes();
  });
})();
