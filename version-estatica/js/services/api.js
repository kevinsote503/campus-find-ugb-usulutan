/**
 * @file api.js
 * @description Cliente modular de comunicación HTTP con la API RESTful de Campus Find (SQLite 3FN)
 *              y utilidades de geolocalización de Usulután, El Salvador.
 */

(function (window) {
  'use strict';

  const isLocalStaticPreview =
    window.location.protocol === 'file:' ||
    ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      window.location.port !== '' &&
      window.location.port !== '3000');

  const API_BASE = isLocalStaticPreview ? 'http://localhost:3000/api' : '/api';

  // Coordenadas reales verificadas de UGB Centro Regional Usulután (Km. 113 Carretera El Litoral) y Centro de Usulután
  const USULUTAN_COORDS_FALLBACK = {
    1: { lat: 13.34218, lng: -88.41792 }, // Biblioteca UGB Usulután
    2: { lat: 13.34192, lng: -88.41825 }, // Cafetería Universitaria UGB
    3: { lat: 13.34232, lng: -88.41772 }, // Laboratorio de Cómputo UGB
    4: { lat: 13.34178, lng: -88.41768 }, // Cancha y Zona Deportiva UGB
    5: { lat: 13.34205, lng: -88.41845 }, // Recepción y Caseta de Vigilancia UGB
    6: { lat: 13.34382, lng: -88.43823 }, // Parque Central Raúl Francisco Munguía (Centro Usulután)
    7: { lat: 13.34238, lng: -88.41812 }, // Edificio de Aulas UGB
  };

  async function request(endpoint, options = {}) {
    const token = localStorage.getItem('campus_find_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor de Campus Find. Verifica que el backend esté activo en el puerto 3000.');
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && token && !endpoint.startsWith('/auth/login')) {
        localStorage.removeItem('campus_find_token');
        localStorage.removeItem('campus_find_user');
      }
      const errorMsg = data?.mensaje || data?.error || `Error HTTP ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  }

  function obtenerCoordenadasObjeto(obj) {
    if (obj && obj.latitud != null && obj.longitud != null && !isNaN(Number(obj.latitud)) && !isNaN(Number(obj.longitud))) {
      return { lat: Number(obj.latitud), lng: Number(obj.longitud) };
    }
    if (obj && obj.ubicacion && obj.ubicacion.latitud != null && obj.ubicacion.longitud != null) {
      const offsetLat = (((obj.id || 1) % 3) - 1) * 0.00003;
      const offsetLng = (((obj.id || 1) % 3) - 1) * 0.00003;
      return {
        lat: Number(obj.ubicacion.latitud) + offsetLat,
        lng: Number(obj.ubicacion.longitud) + offsetLng,
      };
    }
    const base = USULUTAN_COORDS_FALLBACK[obj?.ubicacion_id] || USULUTAN_COORDS_FALLBACK[1];
    const offsetLat = (((obj?.id || 1) % 3) - 1) * 0.00003;
    const offsetLng = (((obj?.id || 1) % 3) - 1) * 0.00003;
    return { lat: base.lat + offsetLat, lng: base.lng + offsetLng };
  }

  function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  window.CampusFindGeo = {
    CENTRO_CAMPUS_USULUTAN: [13.34212, -88.41797],
    CENTRO_CIUDAD_USULUTAN: [13.34382, -88.43823],
    VISTA_GENERAL_USULUTAN: [13.3430, -88.4281],
    USULUTAN_COORDS_FALLBACK,
    obtenerCoordenadasObjeto,
    calcularDistanciaKm,
  };

  window.CampusFindAPI = {
    auth: {
      login: (correo, contraseña) =>
        request('/auth/login', { method: 'POST', body: JSON.stringify({ correo, contraseña }) }),
      registro: (payload) =>
        request('/auth/registro', { method: 'POST', body: JSON.stringify(payload) }),
      perfil: () => request('/auth/perfil'),
      tipos: () => request('/auth/tipos'),
    },
    usuarios: {
      listar: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.texto) params.append('texto', filtros.texto);
        if (filtros.tipo_usuario_id && filtros.tipo_usuario_id !== 'todos') {
          params.append('tipo_usuario_id', String(filtros.tipo_usuario_id));
        }
        const qs = params.toString() ? `?${params.toString()}` : '';
        return request(`/usuarios${qs}`);
      },
      crear: (data) => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
      actualizar: (id, data) => request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      eliminar: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
    },
    objetos: {
      listar: (limite = 50, estado) => {
        const query = estado ? `?limite=${limite}&estado=${estado}` : `?limite=${limite}`;
        return request(`/objetos${query}`);
      },
      buscar: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.categoria && filtros.categoria !== 'todas') params.append('categoria', String(filtros.categoria));
        if (filtros.ubicacion && filtros.ubicacion !== 'todas') params.append('ubicacion', String(filtros.ubicacion));
        if (filtros.estado && filtros.estado !== 'todos') params.append('estado', String(filtros.estado));
        if (filtros.texto) params.append('texto', filtros.texto);
        return request(`/objetos/buscar?${params.toString()}`);
      },
      coincidencias: (filtros) => {
        const params = new URLSearchParams();
        params.append('categoria_id', String(filtros.categoria_id));
        params.append('estado_id', String(filtros.estado_id));
        if (filtros.ubicacion_id) params.append('ubicacion_id', String(filtros.ubicacion_id));
        if (filtros.titulo) params.append('titulo', filtros.titulo);
        return request(`/objetos/coincidencias?${params.toString()}`);
      },
      obtenerPorId: (id) => request(`/objetos/${id}`),
      misReportes: () => request('/objetos/mis-reportes'),
      crear: (data) => request('/objetos', { method: 'POST', body: JSON.stringify(data) }),
      actualizar: (id, data) => request(`/objetos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      eliminar: (id) => request(`/objetos/${id}`, { method: 'DELETE' }),
    },
    categorias: {
      listar: (texto) => {
        const qs = texto ? `?texto=${encodeURIComponent(texto)}` : '';
        return request(`/categorias${qs}`);
      },
      crear: (nombre) => request('/categorias', { method: 'POST', body: JSON.stringify({ nombre }) }),
      actualizar: (id, nombre) => request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify({ nombre }) }),
      eliminar: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
    },
    ubicaciones: {
      listar: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.texto) params.append('texto', filtros.texto);
        if (filtros.edificio && filtros.edificio !== 'todos') params.append('edificio', filtros.edificio);
        const qs = params.toString() ? `?${params.toString()}` : '';
        return request(`/ubicaciones${qs}`);
      },
      crear: (data) => request('/ubicaciones', { method: 'POST', body: JSON.stringify(data) }),
      actualizar: (id, data) => request(`/ubicaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      eliminar: (id) => request(`/ubicaciones/${id}`, { method: 'DELETE' }),
    },
    reclamaciones: {
      listar: (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.texto) params.append('texto', filtros.texto);
        if (filtros.estado_reclamacion_id && filtros.estado_reclamacion_id !== 'todos') {
          params.append('estado_reclamacion_id', String(filtros.estado_reclamacion_id));
        }
        const qs = params.toString() ? `?${params.toString()}` : '';
        return request(`/reclamaciones${qs}`);
      },
      misReclamaciones: () => request('/reclamaciones/mis-reclamaciones'),
      crear: (data) => request('/reclamaciones', { method: 'POST', body: JSON.stringify(data) }),
      actualizarEstado: (id, estado_reclamacion_id) =>
        request(`/reclamaciones/${id}`, { method: 'PUT', body: JSON.stringify({ estado_reclamacion_id }) }),
      actualizar: (id, data) => request(`/reclamaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      eliminar: (id) => request(`/reclamaciones/${id}`, { method: 'DELETE' }),
    },
    entregas: {
      listar: () => request('/entregas'),
      registrar: (data) => request('/entregas', { method: 'POST', body: JSON.stringify(data) }),
    },
    stats: {
      obtener: () => request('/stats'),
      esquema: () => request('/stats/esquema'),
    },
  };
})(window);
