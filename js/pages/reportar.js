/**
 * @file reportar.js
 * @description Controlador para reportar objetos perdidos/encontrados con selector GPS en Usulután y detección de coincidencias.
 */

(function () {
  'use strict';

  let ubicaciones = [];
  let reportMap = null;
  let reportMarker = null;
  let latActual = 13.34212;
  let lngActual = -88.41797;
  let matchTimer = null;

  function esc(str) {
    return window.CampusFindLayout.escapeHtml(str);
  }

  function actualizarTipoReporte(estadoId) {
    document.getElementById('report-estado-id').value = String(estadoId);
    const btnPerdido = document.getElementById('btn-tipo-perdido');
    const btnEncontrado = document.getElementById('btn-tipo-encontrado');
    const btnSubmit = document.getElementById('btn-submit-reporte');

    if (estadoId === 1) {
      btnPerdido.className =
        'p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer';
      btnEncontrado.className =
        'p-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-600 hover:border-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer';
      btnSubmit.className =
        'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer';
      btnSubmit.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i><span>Publicar Reporte de Objeto Perdido</span>`;
    } else {
      btnEncontrado.className =
        'p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer';
      btnPerdido.className =
        'p-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-600 hover:border-rose-300 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer';
      btnSubmit.className =
        'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer';
      btnSubmit.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i><span>Publicar Reporte de Objeto Encontrado</span>`;
    }
    window.CampusFindLayout.refreshIcons();
    programarBusquedaCoincidencias();
  }

  function actualizarCoords(lat, lng, volar = false) {
    latActual = Number(Number(lat).toFixed(6));
    lngActual = Number(Number(lng).toFixed(6));
    document.getElementById('report-lat-display').textContent = latActual.toFixed(6);
    document.getElementById('report-lng-display').textContent = lngActual.toFixed(6);
    if (reportMarker) {
      reportMarker.setLatLng([latActual, lngActual]);
    }
    if (volar && reportMap) {
      reportMap.flyTo([latActual, lngActual], 17, { duration: 0.7 });
    }
  }

  function initMapaSelector() {
    const container = document.getElementById('reportar-map');
    if (!container || !window.L || reportMap) return;

    reportMap = window.L.map(container, {
      center: [latActual, lngActual],
      zoom: 18,
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | UGB Usulután',
      maxZoom: 19,
    }).addTo(reportMap);

    window.L.circle(window.CampusFindGeo.CENTRO_CAMPUS_USULUTAN, {
      radius: 105,
      color: '#1d4ed8',
      weight: 2,
      dashArray: '5 5',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
    }).addTo(reportMap);

    reportMarker = window.L.marker([latActual, lngActual], { draggable: true }).addTo(reportMap);
    reportMarker.bindPopup('📍 Haz clic en el mapa o arrastra el pin al punto exacto en Usulután').openPopup();

    reportMarker.on('dragend', () => {
      const pos = reportMarker.getLatLng();
      actualizarCoords(pos.lat, pos.lng, false);
    });

    reportMap.on('click', (e) => {
      actualizarCoords(e.latlng.lat, e.latlng.lng, false);
    });

    setTimeout(() => reportMap.invalidateSize(), 200);
  }

  function programarBusquedaCoincidencias() {
    clearTimeout(matchTimer);
    matchTimer = setTimeout(buscarCoincidencias, 350);
  }

  async function buscarCoincidencias() {
    const categoria_id = document.getElementById('report-categoria').value;
    const ubicacion_id = document.getElementById('report-ubicacion').value;
    const estado_id = document.getElementById('report-estado-id').value;
    const titulo = document.getElementById('report-titulo').value.trim();

    const box = document.getElementById('report-matching-box');
    const list = document.getElementById('report-matching-list');
    if (!categoria_id) {
      box.style.display = 'none';
      return;
    }

    try {
      const res = await window.CampusFindAPI.objetos.coincidencias({
        categoria_id,
        ubicacion_id,
        estado_id,
        titulo,
      });
      const matches = res.coincidencias || [];
      if (matches.length === 0) {
        box.style.display = 'none';
        return;
      }

      list.innerHTML = '';
      matches.forEach((m) => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2';
        item.innerHTML = `
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-900 truncate">${esc(m.titulo)}</p>
            <p class="text-[11px] text-slate-500 truncate">📍 ${esc(m.ubicacion?.edificio || 'Campus')} — ${esc(m.ubicacion?.nombre || '')}</p>
          </div>
          <button type="button" class="btn-match-ver px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold shrink-0 cursor-pointer">
            Ver
          </button>
        `;
        item.querySelector('.btn-match-ver').addEventListener('click', () => {
          window.CampusFindLayout.abrirModalDetalle(m);
        });
        list.appendChild(item);
      });
      box.style.display = 'block';
    } catch {
      box.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    window.CampusFindLayout.renderNavbar('reportar');
    window.CampusFindLayout.renderFooter();

    const form = document.getElementById('form-reportar-objeto');
    window.CampusFindLayout.initFormValidation(form);

    // Fecha de hoy por defecto y máximo permitido
    const hoy = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('report-fecha');
    fechaInput.value = hoy;
    fechaInput.max = hoy;

    // Verificar sesión
    const usuario = window.CampusFindLayout.getUsuarioActual();
    if (!usuario) {
      document.getElementById('report-auth-banner').style.display = 'flex';
      document.getElementById('btn-report-login').addEventListener('click', () => {
        window.CampusFindLayout.abrirModalAuth();
      });
    }

    // Leer tipo de URL (?tipo=encontrado)
    const params = new URLSearchParams(window.location.search);
    const tipoParam = (params.get('tipo') || 'perdido').toLowerCase();
    actualizarTipoReporte(tipoParam === 'encontrado' ? 2 : 1);

    document.getElementById('btn-tipo-perdido').addEventListener('click', () => actualizarTipoReporte(1));
    document.getElementById('btn-tipo-encontrado').addEventListener('click', () => actualizarTipoReporte(2));

    initMapaSelector();

    try {
      const [resCat, resUbi] = await Promise.all([
        window.CampusFindAPI.categorias.listar(),
        window.CampusFindAPI.ubicaciones.listar(),
      ]);

      const selCat = document.getElementById('report-categoria');
      (resCat.categorias || []).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = String(c.id);
        opt.textContent = c.nombre;
        selCat.appendChild(opt);
      });

      ubicaciones = resUbi.ubicaciones || [];
      const selUbi = document.getElementById('report-ubicacion');
      ubicaciones.forEach((u) => {
        const opt = document.createElement('option');
        opt.value = String(u.id);
        opt.textContent = `${u.edificio} — ${u.nombre}`;
        selUbi.appendChild(opt);
      });

      if (ubicaciones.length > 0) {
        const primera = ubicaciones[0];
        if (primera.latitud != null && primera.longitud != null) {
          actualizarCoords(primera.latitud, primera.longitud, true);
        }
      }
      programarBusquedaCoincidencias();
    } catch (err) {
      window.CampusFindLayout.showToast(err.message || 'No se pudieron cargar categorías y ubicaciones.', 'error');
    }

    document.getElementById('report-ubicacion').addEventListener('change', (e) => {
      const u = ubicaciones.find((x) => String(x.id) === e.target.value);
      if (u) {
        const lat = u.latitud ?? window.CampusFindGeo.USULUTAN_COORDS_FALLBACK[u.id]?.lat ?? 13.34212;
        const lng = u.longitud ?? window.CampusFindGeo.USULUTAN_COORDS_FALLBACK[u.id]?.lng ?? -88.41797;
        actualizarCoords(lat, lng, true);
      }
      programarBusquedaCoincidencias();
    });

    document.getElementById('report-categoria').addEventListener('change', programarBusquedaCoincidencias);
    document.getElementById('report-titulo').addEventListener('input', programarBusquedaCoincidencias);

    document.getElementById('btn-report-mi-gps').addEventListener('click', () => {
      if (!navigator.geolocation) {
        window.CampusFindLayout.showToast('Tu navegador no soporta geolocalización.', 'error');
        return;
      }
      window.CampusFindLayout.showToast('Obteniendo ubicación GPS actual...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          actualizarCoords(pos.coords.latitude, pos.coords.longitude, true);
          window.CampusFindLayout.showToast('Ubicación GPS aplicada al marcador.', 'success');
        },
        () => {
          actualizarCoords(13.34212, -88.41797, true);
          window.CampusFindLayout.showToast('No se obtuvo permiso GPS; centrado en Campus UGB Usulután.', 'info');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('report-error-box');
      errBox.style.display = 'none';

      if (!window.CampusFindLayout.getUsuarioActual()) {
        window.CampusFindLayout.abrirModalAuth();
        return;
      }

      const payload = {
        titulo: document.getElementById('report-titulo').value.trim(),
        categoria_id: Number(document.getElementById('report-categoria').value),
        ubicacion_id: Number(document.getElementById('report-ubicacion').value),
        estado_id: Number(document.getElementById('report-estado-id').value),
        fecha_reporte: document.getElementById('report-fecha').value,
        descripcion: document.getElementById('report-descripcion').value.trim(),
        latitud: latActual,
        longitud: lngActual,
      };

      const btn = document.getElementById('btn-submit-reporte');
      btn.disabled = true;

      try {
        await window.CampusFindAPI.objetos.crear(payload);
        window.CampusFindLayout.showToast('¡Reporte publicado exitosamente en Campus Find!', 'success');
        setTimeout(() => {
          window.location.href = window.CampusFindLayout.getRouteUrl('mis-reportes');
        }, 500);
      } catch (err) {
        errBox.textContent = err.message || 'No se pudo registrar el reporte.';
        errBox.style.display = 'block';
        btn.disabled = false;
      }
    });
  });
})();
