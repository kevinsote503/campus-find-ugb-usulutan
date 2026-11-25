/**
 * @file buscar.js
 * @description Controlador en JavaScript puro para la página de Búsqueda Avanzada (pages/buscar/index.html).
 */

(function () {
  'use strict';

  let timeoutBusqueda = null;

  async function ejecutarBusqueda() {
    const texto = document.getElementById('input-buscar-texto').value.trim();
    const categoria = document.getElementById('select-filtro-categoria').value;
    const ubicacion = document.getElementById('select-filtro-ubicacion').value;
    const estado = document.getElementById('select-filtro-estado').value;

    const hayFiltros = Boolean(texto || categoria !== 'todas' || ubicacion !== 'todas' || estado !== 'todos');
    document.getElementById('badge-filtros-activos').style.display = hayFiltros ? 'inline' : 'none';

    const loadingEl = document.getElementById('buscar-loading');
    const emptyEl = document.getElementById('buscar-empty');
    const gridEl = document.getElementById('buscar-grid');

    try {
      const res = await window.CampusFindAPI.objetos.buscar({
        texto: texto || undefined,
        categoria,
        ubicacion,
        estado,
      });

      if (loadingEl) loadingEl.style.display = 'none';
      const objetos = res.objetos || [];
      document.getElementById('count-objetos-encontrados').textContent = String(objetos.length);

      if (objetos.length === 0) {
        gridEl.innerHTML = '';
        emptyEl.style.display = 'block';
      } else {
        emptyEl.style.display = 'none';
        window.CampusFindLayout.renderObjectCardsGrid(objetos, gridEl);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      if (loadingEl) loadingEl.style.display = 'none';
      emptyEl.style.display = 'none';
      const msg = window.CampusFindLayout.escapeHtml(err.message || 'No se pudo consultar el catálogo.');
      gridEl.innerHTML = `
        <div class="col-span-full p-10 text-center bg-white rounded-2xl border border-rose-200 space-y-3">
          <p class="text-sm font-bold text-rose-700">Error al consultar los objetos</p>
          <p class="text-xs text-slate-500">${msg}</p>
          <button id="btn-retry-buscar" type="button" class="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer">
            Reintentar
          </button>
        </div>
      `;
      const btnRetry = document.getElementById('btn-retry-buscar');
      if (btnRetry) btnRetry.addEventListener('click', ejecutarBusqueda);
    }
  }

  function limpiarFiltros() {
    document.getElementById('input-buscar-texto').value = '';
    document.getElementById('select-filtro-categoria').value = 'todas';
    document.getElementById('select-filtro-ubicacion').value = 'todas';
    document.getElementById('select-filtro-estado').value = 'todos';
    ejecutarBusqueda();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    window.CampusFindLayout.renderNavbar('buscar');
    window.CampusFindLayout.renderFooter();

    // Leer parámetros iniciales de la URL (?texto=&categoria=&estado=&ubicacion=)
    const urlParams = new URLSearchParams(window.location.search);
    const textoInicial = urlParams.get('texto') || '';
    const catInicial = urlParams.get('categoria') || 'todas';
    const ubiInicial = urlParams.get('ubicacion') || 'todas';
    const estInicial = urlParams.get('estado') || 'todos';

    document.getElementById('input-buscar-texto').value = textoInicial;
    if (['1', '2', '3'].includes(estInicial)) {
      document.getElementById('select-filtro-estado').value = estInicial;
    }

    try {
      const [resCat, resUbi] = await Promise.all([
        window.CampusFindAPI.categorias.listar(),
        window.CampusFindAPI.ubicaciones.listar(),
      ]);

      const selCat = document.getElementById('select-filtro-categoria');
      (resCat.categorias || []).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = String(c.id);
        opt.textContent = c.nombre;
        selCat.appendChild(opt);
      });
      if (catInicial !== 'todas') {
        selCat.value = catInicial;
      }

      const selUbi = document.getElementById('select-filtro-ubicacion');
      (resUbi.ubicaciones || []).forEach((u) => {
        const opt = document.createElement('option');
        opt.value = String(u.id);
        opt.textContent = `${u.edificio} - ${u.nombre}`;
        selUbi.appendChild(opt);
      });
      if (ubiInicial !== 'todas') {
        selUbi.value = ubiInicial;
      }
    } catch (err) {
      console.error('Error cargando filtros:', err);
      window.CampusFindLayout.showToast('No se pudieron cargar las listas de filtros.', 'error');
    }

    ejecutarBusqueda();

    document.getElementById('input-buscar-texto').addEventListener('input', () => {
      clearTimeout(timeoutBusqueda);
      timeoutBusqueda = setTimeout(ejecutarBusqueda, 220);
    });

    ['select-filtro-categoria', 'select-filtro-ubicacion', 'select-filtro-estado'].forEach((id) => {
      document.getElementById(id).addEventListener('change', ejecutarBusqueda);
    });

    document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    document.getElementById('btn-restablecer-empty').addEventListener('click', limpiarFiltros);
  });
})();
