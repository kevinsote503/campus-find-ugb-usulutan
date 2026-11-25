/**
 * @file seed.ts
 * @description Script para inicializar y precargar la base de datos SQLite con datos sembrados.
 */

import bcrypt from 'bcryptjs';
import {
  sequelize,
  TipoUsuario,
  Usuario,
  Categoria,
  Ubicacion,
  Estado,
  EstadoReclamacion,
  Objeto,
  Reclamacion,
  Entrega,
} from '../models';

export async function runSeed(force = false) {
  try {
    console.log('🔄 Sincronizando modelos con la base de datos SQLite...');
    await sequelize.sync({ force });

    // Asegurar columnas de geolocalización (latitud, longitud) en bases de datos preexistentes
    const migracionesGeo = [
      'ALTER TABLE ubicaciones ADD COLUMN latitud FLOAT DEFAULT 13.34212;',
      'ALTER TABLE ubicaciones ADD COLUMN longitud FLOAT DEFAULT -88.41797;',
      'ALTER TABLE objetos ADD COLUMN latitud FLOAT;',
      'ALTER TABLE objetos ADD COLUMN longitud FLOAT;',
    ];
    for (const sql of migracionesGeo) {
      try {
        await sequelize.query(sql);
      } catch {
        // La columna ya existe
      }
    }

    // Coordenadas reales verificadas de Universidad Gerardo Barrios (UGB) Centro Regional Usulután (Km. 113 Carretera El Litoral: 13.34212, -88.41797)
    // y Parque Central Raúl Francisco Munguía en el Centro de Usulután (13.34382, -88.43823).
    const coordenadasUsulutan: Record<number, { latitud: number; longitud: number; edificio: string; nombre: string; descripcion: string }> = {
      1: {
        nombre: 'Biblioteca UGB Usulután',
        edificio: 'Campus UGB Usulután',
        descripcion: 'Sala de lectura y consulta académica, Campus Regional UGB Usulután (Km. 113 Carretera El Litoral)',
        latitud: 13.34218,
        longitud: -88.41792,
      },
      2: {
        nombre: 'Cafetería Universitaria UGB',
        edificio: 'Campus UGB Usulután',
        descripcion: 'Área de comedor estudiantil y mesas techadas dentro del Campus UGB Usulután',
        latitud: 13.34192,
        longitud: -88.41825,
      },
      3: {
        nombre: 'Laboratorio de Cómputo UGB',
        edificio: 'Área de Informática UGB',
        descripcion: 'Laboratorios de sistemas y prácticas tecnológicas del Campus Regional UGB Usulután',
        latitud: 13.34232,
        longitud: -88.41772,
      },
      4: {
        nombre: 'Cancha y Zona Deportiva UGB',
        edificio: 'Campus UGB Usulután',
        descripcion: 'Cancha multiusos y graderías recreativas del Campus Regional UGB Usulután',
        latitud: 13.34178,
        longitud: -88.41768,
      },
      5: {
        nombre: 'Recepción y Caseta de Vigilancia UGB',
        edificio: 'Acceso Principal UGB',
        descripcion: 'Entrada principal Km. 113 Carretera El Litoral, atención estudiantil y resguardo de objetos',
        latitud: 13.34205,
        longitud: -88.41845,
      },
      6: {
        nombre: 'Parque Central Raúl Francisco Munguía',
        edificio: 'Centro de Usulután',
        descripcion: 'Plaza principal del centro de Usulután y zona de abordaje de transporte estudiantil',
        latitud: 13.34382,
        longitud: -88.43823,
      },
      7: {
        nombre: 'Edificio de Aulas UGB',
        edificio: 'Campus UGB Usulután',
        descripcion: 'Módulo principal de salones de clases del Campus Regional UGB Usulután',
        latitud: 13.34238,
        longitud: -88.41812,
      },
    };

    // 1. Tipos de usuario
    const countTipos = await TipoUsuario.count();
    if (countTipos === 0) {
      console.log('🌱 Sembrando tipos de usuario...');
      await TipoUsuario.bulkCreate([
        { id: 1, nombre: 'estudiante' },
        { id: 2, nombre: 'docente' },
        { id: 3, nombre: 'personal' },
        { id: 4, nombre: 'administrador' },
      ]);
    }

    // 2. Categorías
    const countCategorias = await Categoria.count();
    if (countCategorias === 0) {
      console.log('🌱 Sembrando categorías...');
      await Categoria.bulkCreate([
        { id: 1, nombre: 'Electrónica' },
        { id: 2, nombre: 'Documentos e Identificaciones' },
        { id: 3, nombre: 'Mochilas y Bolsos' },
        { id: 4, nombre: 'Ropa y Accesorios' },
        { id: 5, nombre: 'Libros y Cuadernos' },
        { id: 6, nombre: 'Llaves y Llaveros' },
        { id: 7, nombre: 'Botellas y Termos' },
        { id: 8, nombre: 'Otros' },
      ]);
    }

    // 3. Ubicaciones
    const countUbicaciones = await Ubicacion.count();
    if (countUbicaciones === 0) {
      console.log('🌱 Sembrando ubicaciones geolocalizadas de Usulután...');
      await Ubicacion.bulkCreate(
        Object.entries(coordenadasUsulutan).map(([id, data]) => ({
          id: Number(id),
          ...data,
        }))
      );
    } else {
      // Actualizar nombre, edificio, descripción y coordenadas reales de UGB Usulután en ubicaciones base
      for (const [idStr, coords] of Object.entries(coordenadasUsulutan)) {
        await Ubicacion.update(
          {
            nombre: coords.nombre,
            edificio: coords.edificio,
            descripcion: coords.descripcion,
            latitud: coords.latitud,
            longitud: coords.longitud,
          },
          { where: { id: Number(idStr) } }
        );
      }
    }

    // 4. Estados de objetos
    const countEstados = await Estado.count();
    if (countEstados === 0) {
      console.log('🌱 Sembrando estados de objetos...');
      await Estado.bulkCreate([
        { id: 1, nombre: 'perdido' },
        { id: 2, nombre: 'encontrado' },
        { id: 3, nombre: 'recuperado' },
      ]);
    }

    // 5. Estados de reclamación
    const countEstadosRec = await EstadoReclamacion.count();
    if (countEstadosRec === 0) {
      console.log('🌱 Sembrando estados de reclamación...');
      await EstadoReclamacion.bulkCreate([
        { id: 1, nombre: 'pendiente' },
        { id: 2, nombre: 'aprobada' },
        { id: 3, nombre: 'rechazada' },
      ]);
    }

    // 6. Usuarios semilla
    const countUsuarios = await Usuario.count();
    if (countUsuarios === 0) {
      console.log('🌱 Sembrando usuarios de prueba con contraseñas seguras...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      await Usuario.bulkCreate([
        {
          id: 1,
          nombre: 'Coordinador de Seguridad y Hallazgos',
          correo: 'admin@campusfind.edu',
          contraseña: hashedPassword,
          telefono: '555-0100',
          tipo_usuario_id: 4, // administrador
        },
        {
          id: 2,
          nombre: 'Valeria Morales',
          correo: 'estudiante@campusfind.edu',
          contraseña: hashedPassword,
          telefono: '555-0101',
          tipo_usuario_id: 1, // estudiante
        },
        {
          id: 3,
          nombre: 'Prof. Carlos Méndez',
          correo: 'docente@campusfind.edu',
          contraseña: hashedPassword,
          telefono: '555-0102',
          tipo_usuario_id: 2, // docente
        },
        {
          id: 4,
          nombre: 'Marta Gómez (Vigilancia)',
          correo: 'personal@campusfind.edu',
          contraseña: hashedPassword,
          telefono: '555-0103',
          tipo_usuario_id: 3, // personal
        },
      ]);
    }

    // 7. Objetos de prueba
    const countObjetos = await Objeto.count();
    if (countObjetos === 0) {
      console.log('🌱 Sembrando objetos perdidos y encontrados...');
      const now = new Date();
      const hace2Dias = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const hace1Dia = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      const hace3Dias = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const hace4Horas = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      const hace5Dias = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

      await Objeto.bulkCreate([
        {
          id: 1,
          usuario_id: 2, // Valeria
          categoria_id: 1, // Electrónica
          ubicacion_id: 1, // Biblioteca UGB Usulután
          estado_id: 1, // perdido
          titulo: 'Calculadora Texas Instruments TI-84 Plus',
          descripcion: 'Calculadora gráfica color negro con funda protectora gris clara. Tiene una calcomanía de fórmula física en la tapa trasera.',
          fecha_reporte: hace2Dias,
          latitud: 13.34220,
          longitud: -88.41790,
        },
        {
          id: 2,
          usuario_id: 4, // Marta (Personal)
          categoria_id: 1, // Electrónica
          ubicacion_id: 3, // Laboratorio de Cómputo UGB
          estado_id: 2, // encontrado
          titulo: 'Auriculares Inalámbricos Sony WH-CH520',
          descripcion: 'Auriculares de diadema color azul marino, encontrados sobre el escritorio de la terminal de cómputo número 12.',
          fecha_reporte: hace1Dia,
          latitud: 13.34234,
          longitud: -88.41770,
        },
        {
          id: 3,
          usuario_id: 2, // Valeria
          categoria_id: 2, // Documentos
          ubicacion_id: 2, // Cafetería Universitaria UGB
          estado_id: 1, // perdido
          titulo: 'Credencial Universitaria y Tarjeta de Transporte',
          descripcion: 'Portacredencial de acrílico con cinta azul de la UGB. A nombre de Valeria M.',
          fecha_reporte: hace3Dias,
          latitud: 13.34194,
          longitud: -88.41822,
        },
        {
          id: 4,
          usuario_id: 3, // Prof. Carlos
          categoria_id: 3, // Mochilas
          ubicacion_id: 7, // Edificio de Aulas UGB
          estado_id: 2, // encontrado
          titulo: 'Mochila Jansport Color Verde Oliva',
          descripcion: 'Contiene libreta de apuntes de Cálculo Vectorial y una cartuchera negra con bolígrafos y lápices.',
          fecha_reporte: hace4Horas,
          latitud: 13.34240,
          longitud: -88.41810,
        },
        {
          id: 5,
          usuario_id: 4, // Marta
          categoria_id: 6, // Llaves
          ubicacion_id: 6, // Parque Central Raúl Francisco Munguía
          estado_id: 2, // encontrado
          titulo: 'Llavero con 3 llaves y figura metálica de búho',
          descripcion: 'Llavero metálico hallado en una de las bancas del Parque Central Raúl Francisco Munguía en Usulután.',
          fecha_reporte: hace1Dia,
          latitud: 13.34382,
          longitud: -88.43823,
        },
        {
          id: 6,
          usuario_id: 2, // Valeria
          categoria_id: 7, // Botellas y Termos
          ubicacion_id: 4, // Cancha y Zona Deportiva UGB
          estado_id: 3, // recuperado
          titulo: 'Termo Hydro Flask 32oz Azul Cielo',
          descripcion: 'Termo de acero inoxidable con calcomanía universitaria en la parte frontal.',
          fecha_reporte: hace5Dias,
          latitud: 13.34180,
          longitud: -88.41766,
        },
      ]);
    } else {
      // Corregir objetos existentes que aún tengan coordenadas desfasadas (>13.345 en zona antigua) o nulas
      const objetosExistentes = await Objeto.findAll();
      for (const obj of objetosExistentes) {
        const esCoordenadaAntiguaDesfasada =
          obj.latitud != null &&
          obj.longitud != null &&
          ((obj.latitud >= 13.3450 && obj.latitud <= 13.3480 && obj.longitud >= -88.4230 && obj.longitud <= -88.4190) ||
            (Math.abs(obj.latitud - 13.3446) < 0.001 && Math.abs(obj.longitud - -88.4368) < 0.001));

        if (!obj.latitud || !obj.longitud || esCoordenadaAntiguaDesfasada) {
          const baseCoord = coordenadasUsulutan[obj.ubicacion_id] || coordenadasUsulutan[1];
          const offsetLat = ((obj.id % 3) - 1) * 0.00004;
          const offsetLng = ((obj.id % 3) - 1) * 0.00004;
          await Objeto.update(
            {
              latitud: Number((baseCoord.latitud + offsetLat).toFixed(6)),
              longitud: Number((baseCoord.longitud + offsetLng).toFixed(6)),
            },
            { where: { id: obj.id } }
          );
        }
      }
    }

    // 8. Reclamaciones
    const countReclamaciones = await Reclamacion.count();
    if (countReclamaciones === 0) {
      console.log('🌱 Sembrando solicitudes de reclamación...');
      const now = new Date();
      const hace18Horas = new Date(now.getTime() - 18 * 60 * 60 * 1000);
      const hace4Dias = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

      await Reclamacion.bulkCreate([
        {
          id: 1,
          objeto_id: 2, // Auriculares Sony
          usuario_id: 2, // Valeria
          descripcion: 'Creo que los auriculares son míos. Son marca Sony modelo azul marino, tienen una pequeña raspadura en el auricular izquierdo y la almohadilla derecha está ligeramente desgastada.',
          fecha: hace18Horas,
          estado_reclamacion_id: 1, // pendiente
        },
        {
          id: 2,
          objeto_id: 6, // Termo recuperado
          usuario_id: 2, // Valeria
          descripcion: 'El termo tiene mis iniciales VM en la base con marcador permanente y la calcomanía del búho deportivo.',
          fecha: hace4Dias,
          estado_reclamacion_id: 2, // aprobada
        },
      ]);
    }

    // 9. Entregas
    const countEntregas = await Entrega.count();
    if (countEntregas === 0) {
      console.log('🌱 Sembrando entregas registradas...');
      const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      await Entrega.bulkCreate([
        {
          id: 1,
          reclamacion_id: 2,
          fecha: hace3Dias,
          observaciones: 'Entrega formal realizada en caseta de seguridad central previa verificación de identidad con credencial universitaria.',
        },
      ]);
    }

    console.log('✅ Base de datos SQLite inicializada y sembrada con éxito.');
  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:', error);
    throw error;
  }
}

// Ejecución directa si se invoca desde CLI: node / tsx seed.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default runSeed;
