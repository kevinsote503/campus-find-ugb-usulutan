/**
 * @file mis-reclamaciones.js
 * @description Controlador para consultar y gestionar las reclamaciones enviadas por el usuario autenticado.
 */

(function () {
  'use strict';

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

  function badgeReclamacion(estadoId) {
    if (estadoId === 2) {
      return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Aprobada</span>`;
    }
    if (estadoId === 3) {
      return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">✕ Rechazada</span>`;
    }
    return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">⏳ Pendiente de revisión</span>`;
  }

  async function cargarMisReclamaciones() {
    const container = document.getElementById('mis-reclamaciones-content');
    const usuario = window.CampusFindLayout.getUsuarioActual();

    if (!usuario) {
      container.innerHTML = `
        <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            <i data-lucide="lock" class="w-6 h-6"></i>
          </div>
          <h2 class="text-lg font-extrabold text-slate-900">Inicia sesión para ver tus reclamaciones</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Consulta el estado de tus solicitudes "Creo que es mío" y las indicaciones para retirar tus pertenencias.
          </p>
          <button id="btn-login-mis-rec" type="button" class="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold cursor-pointer">
            Iniciar Sesión
          </button>
        </div>
      `;
      document.getElementById('btn-login-mis-rec').addEventListener('click', () => {
        window.CampusFindLayout.abrirModalAuth();
      });
      window.CampusFindLayout.refreshIcons();
      return;
    }

    container.innerHTML = `<div class="p-12 text-center text-slate-400 text-sm">Cargando tus reclamaciones...</div>`;

    try {
      const res = await window.CampusFindAPI.reclamaciones.misReclamaciones();
      const reclamaciones = res.reclamaciones || [];

      if (reclamaciones.length === 0) {
        container.innerHTML = `
          <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <i data-lucide="file-check-2" class="w-6 h-6"></i>
            </div>
            <h2 class="text-lg font-extrabold text-slate-900">No tienes solicitudes de reclamación</h2>
            <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Cuando encuentres una pertenencia tuya en el catálogo o en el mapa GPS, presiona "Creo que es mío" para iniciar la validación.
            </p>
            <a href="../buscar/index.html" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold no-underline">
              Explorar Catálogo
            </a>
          </div>
        `;
        window.CampusFindLayout.refreshIcons();
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-5';

      reclamaciones.forEach((rec) => {
        const card = document.createElement('article');
        card.className = 'bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between';
        card.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              ${badgeReclamacion(rec.estado_reclamacion_id)}
              <span class="text-xs text-slate-400">Solicitud #${rec.id} • ${esc(formatFecha(rec.fecha))}</span>
            </div>

            <div>
              <h3 class="font-extrabold text-base text-slate-900">${esc(rec.objeto?.titulo || 'Objeto reportado')}</h3>
              <p class="text-xs text-slate-500 mt-0.5">
                📍 ${esc(rec.objeto?.ubicacion?.edificio || 'Campus Usulután')} — ${esc(rec.objeto?.ubicacion?.nombre || '')}
              </p>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <p class="font-bold text-slate-500 uppercase text-[10px] mb-1">Evidencia enviada</p>
              <p class="leading-relaxed">${esc(rec.descripcion)}</p>
            </div>

            ${
              rec.entrega
                ? `
              <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p class="font-extrabold">✅ Acta de Entrega Oficial #${rec.entrega.id} (${esc(formatFecha(rec.entrega.fecha))})</p>
                <p class="text-emerald-800">${esc(rec.entrega.observaciones)}</p>
              </div>
            `
                : rec.estado_reclamacion_id === 2
                ? `
              <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                🎉 Tu reclamación fue aprobada. Acércate a la Oficina de Seguridad y Vigilancia con tu carnet universitario para retirar el objeto.
              </div>
            `
                : ''
            }
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            ${
              rec.objeto
                ? `<button type="button" class="btn-ver-obj-rec text-xs font-bold text-blue-700 hover:underline cursor-pointer">Ver detalle del objeto</button>`
                : `<span></span>`
            }
            ${
              rec.estado_reclamacion_id === 1
                ? `<button type="button" class="btn-del-rec px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer">Retirar solicitud</button>`
                : ''
            }
          </div>
        `;

        const btnVer = card.querySelector('.btn-ver-obj-rec');
        if (btnVer && rec.objeto) {
          btnVer.addEventListener('click', () => window.CampusFindLayout.abrirModalDetalle(rec.objeto));
        }

        const btnDel = card.querySelector('.btn-del-rec');
        if (btnDel) {
          btnDel.addEventListener('click', () => {
            window.CampusFindLayout.abrirModalConfirmacion({
              titulo: 'Retirar reclamación',
              mensaje: '¿Deseas cancelar esta solicitud de reclamación pendiente?',
              textoConfirmar: 'Sí, retirar',
              onConfirmar: async () => {
                try {
                  await window.CampusFindAPI.reclamaciones.eliminar(rec.id);
                  window.CampusFindLayout.showToast('Reclamación retirada.', 'success');
                  cargarMisReclamaciones();
                } catch (err) {
                  window.CampusFindLayout.showToast(err.message || 'No se pudo retirar la reclamación.', 'error');
                }
              },
            });
          });
        }

        grid.appendChild(card);
      });

      container.innerHTML = '';
      container.appendChild(grid);
      window.CampusFindLayout.refreshIcons();
    } catch (err) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-700 text-sm font-semibold">
          ${esc(err.message || 'No se pudieron cargar tus reclamaciones.')}
        </div>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.CampusFindLayout.renderNavbar('mis-reclamaciones');
    window.CampusFindLayout.renderFooter();
    cargarMisReclamaciones();
  });
})();
