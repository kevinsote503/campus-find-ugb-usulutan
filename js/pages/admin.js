/**
 * @file admin.js
 * @description Controlador del Panel de Administración (validación de reclamaciones y actas de entrega).
 */

(function () {
  'use strict';

  let filtroEstado = 'todos';
  let filtroTexto = '';

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

  function badgeReclamacion(id) {
    if (id === 2) return `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Aprobada</span>`;
    if (id === 3) return `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Rechazada</span>`;
    return `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Pendiente</span>`;
  }

  async function renderAdminDashboard() {
    const root = document.getElementById('admin-root');

    if (!window.CampusFindLayout.esAdminActual()) {
      root.innerHTML = `
        <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
            <i data-lucide="shield-alert" class="w-6 h-6"></i>
          </div>
          <h2 class="text-lg font-extrabold text-slate-900">Acceso exclusivo para Administradores</h2>
          <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Inicia sesión con la cuenta institucional de Administrador (<code class="font-mono font-bold">admin@campusfind.edu</code>) para gestionar reclamaciones y actas de entrega.
          </p>
          <button id="btn-admin-login" type="button" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold cursor-pointer">
            Iniciar Sesión como Administrador
          </button>
        </div>
      `;
      document.getElementById('btn-admin-login').addEventListener('click', () => {
        window.CampusFindLayout.abrirModalAuth();
      });
      window.CampusFindLayout.refreshIcons();
      return;
    }

    try {
      const [resStats, resRec, resEnt] = await Promise.all([
        window.CampusFindAPI.stats.obtener(),
        window.CampusFindAPI.reclamaciones.listar({
          texto: filtroTexto || undefined,
          estado_reclamacion_id: filtroEstado !== 'todos' ? filtroEstado : undefined,
        }),
        window.CampusFindAPI.entregas.listar(),
      ]);

      const stats = resStats.estadisticas || {};
      const reclamaciones = resRec.reclamaciones || [];
      const entregas = resEnt.entregas || [];

      root.innerHTML = `
        <div class="space-y-6">
          <!-- KPIs -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p class="text-xs font-semibold text-slate-500">Total Objetos</p>
              <p class="text-2xl font-black text-slate-900 mt-1">${stats.totalObjetos ?? 0}</p>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs">
              <p class="text-xs font-semibold text-amber-700">Reclamos Pendientes</p>
              <p class="text-2xl font-black text-amber-700 mt-1">${stats.reclamacionesPendientes ?? 0}</p>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
              <p class="text-xs font-semibold text-emerald-700">Reclamos Aprobados</p>
              <p class="text-2xl font-black text-emerald-700 mt-1">${stats.reclamacionesAprobadas ?? 0}</p>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-blue-200 shadow-xs">
              <p class="text-xs font-semibold text-blue-700">Actas de Entrega</p>
              <p class="text-2xl font-black text-blue-700 mt-1">${stats.totalEntregas ?? 0}</p>
            </div>
          </div>

          <!-- Tabla de Reclamaciones -->
          <section class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="font-extrabold text-base sm:text-lg text-slate-900">Solicitudes de Reclamación (${reclamaciones.length})</h2>
                <p class="text-xs text-slate-500">Aprueba o rechaza evidencias y registra entregas oficiales</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <input id="admin-search-rec" type="text" value="${esc(filtroTexto)}" placeholder="Buscar evidencia..." class="text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-purple-600" />
                <select id="admin-filter-rec" class="text-xs p-2 rounded-xl border border-slate-300 bg-white outline-none">
                  <option value="todos" ${filtroEstado === 'todos' ? 'selected' : ''}>Todos los estados</option>
                  <option value="1" ${filtroEstado === '1' ? 'selected' : ''}>Pendientes</option>
                  <option value="2" ${filtroEstado === '2' ? 'selected' : ''}>Aprobadas</option>
                  <option value="3" ${filtroEstado === '3' ? 'selected' : ''}>Rechazadas</option>
                </select>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                    <th class="py-3 px-4">ID</th>
                    <th class="py-3 px-4">Objeto</th>
                    <th class="py-3 px-4">Solicitante</th>
                    <th class="py-3 px-4">Evidencia</th>
                    <th class="py-3 px-4">Estado</th>
                    <th class="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody id="admin-claims-tbody" class="divide-y divide-slate-100"></tbody>
              </table>
            </div>
          </section>

          <!-- Historial de Actas de Entrega -->
          <section class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-5 border-b border-slate-100">
              <h2 class="font-extrabold text-base sm:text-lg text-slate-900">Historial de Actas de Entrega Oficial (${entregas.length})</h2>
              <p class="text-xs text-slate-500">Registro auditable de pertenencias devueltas a sus propietarios</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                    <th class="py-3 px-4">Acta #</th>
                    <th class="py-3 px-4">Objeto Recuperado</th>
                    <th class="py-3 px-4">Entregado a</th>
                    <th class="py-3 px-4">Fecha</th>
                    <th class="py-3 px-4">Observaciones</th>
                  </tr>
                </thead>
                <tbody id="admin-deliveries-tbody" class="divide-y divide-slate-100"></tbody>
              </table>
            </div>
          </section>
        </div>
      `;

      // Poblar tabla reclamaciones
      const claimsTbody = document.getElementById('admin-claims-tbody');
      if (reclamaciones.length === 0) {
        claimsTbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">No hay reclamaciones que coincidan con el filtro.</td></tr>`;
      } else {
        reclamaciones.forEach((rec) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-slate-50/80';
          tr.innerHTML = `
            <td class="py-3 px-4 font-mono text-xs text-slate-500">#${rec.id}</td>
            <td class="py-3 px-4">
              <p class="font-bold text-slate-900">${esc(rec.objeto?.titulo || 'Objeto')}</p>
              <p class="text-[11px] text-slate-500">${esc(rec.objeto?.ubicacion?.edificio || '')}</p>
            </td>
            <td class="py-3 px-4">
              <p class="font-semibold text-slate-800">${esc(rec.usuario?.nombre || 'Usuario')}</p>
              <p class="text-[11px] text-slate-500">${esc(rec.usuario?.correo || '')}</p>
            </td>
            <td class="py-3 px-4 max-w-xs">
              <p class="text-xs text-slate-600 line-clamp-2" title="${esc(rec.descripcion)}">${esc(rec.descripcion)}</p>
            </td>
            <td class="py-3 px-4">${badgeReclamacion(rec.estado_reclamacion_id)}</td>
            <td class="py-3 px-4 text-right">
              <div class="inline-flex items-center gap-1.5 flex-wrap justify-end">
                ${
                  rec.estado_reclamacion_id === 1
                    ? `<button type="button" class="btn-aprobar px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer">Aprobar</button>
                       <button type="button" class="btn-rechazar px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer">Rechazar</button>`
                    : ''
                }
                ${
                  !rec.entrega && rec.estado_reclamacion_id !== 3
                    ? `<button type="button" class="btn-entregar px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold cursor-pointer">Emitir Acta</button>`
                    : rec.entrega
                    ? `<span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Entregado (#${rec.entrega.id})</span>`
                    : ''
                }
              </div>
            </td>
          `;

          const btnAprobar = tr.querySelector('.btn-aprobar');
          if (btnAprobar) {
            btnAprobar.addEventListener('click', async () => {
              try {
                await window.CampusFindAPI.reclamaciones.actualizarEstado(rec.id, 2);
                window.CampusFindLayout.showToast('Reclamación aprobada correctamente.', 'success');
                renderAdminDashboard();
              } catch (err) {
                window.CampusFindLayout.showToast(err.message, 'error');
              }
            });
          }

          const btnRechazar = tr.querySelector('.btn-rechazar');
          if (btnRechazar) {
            btnRechazar.addEventListener('click', async () => {
              try {
                await window.CampusFindAPI.reclamaciones.actualizarEstado(rec.id, 3);
                window.CampusFindLayout.showToast('Reclamación rechazada.', 'info');
                renderAdminDashboard();
              } catch (err) {
                window.CampusFindLayout.showToast(err.message, 'error');
              }
            });
          }

          const btnEntregar = tr.querySelector('.btn-entregar');
          if (btnEntregar) {
            btnEntregar.addEventListener('click', () => {
              window.CampusFindLayout.abrirModalEntrega(rec, renderAdminDashboard);
            });
          }

          claimsTbody.appendChild(tr);
        });
      }

      // Poblar tabla entregas
      const delTbody = document.getElementById('admin-deliveries-tbody');
      if (entregas.length === 0) {
        delTbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">Aún no se han registrado actas de entrega.</td></tr>`;
      } else {
        entregas.forEach((ent) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-slate-50/80';
          tr.innerHTML = `
            <td class="py-3 px-4 font-mono font-bold text-blue-700">#${ent.id}</td>
            <td class="py-3 px-4 font-bold text-slate-900">${esc(ent.reclamacion?.objeto?.titulo || 'Objeto')}</td>
            <td class="py-3 px-4">
              <p class="font-semibold text-slate-800">${esc(ent.reclamacion?.usuario?.nombre || 'Propietario')}</p>
              <p class="text-[11px] text-slate-500">${esc(ent.reclamacion?.usuario?.correo || '')}</p>
            </td>
            <td class="py-3 px-4 text-xs text-slate-600">${esc(formatFecha(ent.fecha))}</td>
            <td class="py-3 px-4 text-xs text-slate-600 max-w-sm">${esc(ent.observaciones)}</td>
          `;
          delTbody.appendChild(tr);
        });
      }

      // Eventos de búsqueda y filtro
      let timer = null;
      document.getElementById('admin-search-rec').addEventListener('input', (e) => {
        filtroTexto = e.target.value;
        clearTimeout(timer);
        timer = setTimeout(renderAdminDashboard, 250);
      });
      document.getElementById('admin-filter-rec').addEventListener('change', (e) => {
        filtroEstado = e.target.value;
        renderAdminDashboard();
      });

      window.CampusFindLayout.refreshIcons();
    } catch (err) {
      root.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-700 text-sm font-semibold">
          ${esc(err.message || 'No se pudo cargar el panel administrativo.')}
        </div>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.CampusFindLayout.renderNavbar('admin');
    window.CampusFindLayout.renderFooter();
    renderAdminDashboard();
  });
})();
