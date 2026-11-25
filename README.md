Aquí tienes una versión mucho más sólida y profesional, con una sección dedicada al **cumplimiento de las rúbricas de evaluación** para que tu docente vea al instante todo lo que abarca el proyecto:

---

```markdown
# 🎓 Campus Find — Usulután
### Sistema Web Integral de Objetos Perdidos y Encontrados con Geolocalización GPS en Tiempo Real

📍 **Sede:** Campus Regional Usulután — Universidad Gerardo Barrios (UGB, Km. 113 Carretera El Litoral) y Centro de Usulután, El Salvador.  
⚙️ **Arquitectura:** Frontend Modular (HTML5 + CSS3 + JavaScript ES6+) · Backend API RESTful (Node.js + Express + TypeScript) · Persistencia Relacional **SQLite en 3FN (9 Tablas)** · Mapas Interactivos (**Leaflet + OpenStreetMap**).

---

## 🎯 Propósito del Proyecto

**Campus Find** resuelve una necesidad real de la comunidad universitaria: centralizar, geolocalizar y dar seguimiento formal a pertenencias perdidas y encontradas dentro del campus y sus alrededores. El sistema cubre el **ciclo de vida completo** de cada objeto:

> 📝 **Reporte con GPS** → ✨ **Detección automática de coincidencias** → 🙋 **Reclamación verificada ("Creo que es mío")** → 🛡️ **Validación por Administración/Vigilancia** → 🧾 **Emisión de Acta Oficial de Entrega**

---

## 🏆 Cumplimiento de Rúbricas de Evaluación

| Criterio de Rúbrica | Estado | Evidencia Implementada en el Proyecto |
| :--- | :---: | :--- |
| **📐 Base de Datos Normalizada (1FN, 2FN y 3FN)** | ✅ | Esquema relacional de **9 tablas independientes** en SQLite sin redundancias ni dependencias transitivas, con llaves primarias (`PK`), llaves foráneas (`FK`), restricciones `RESTRICT` / `CASCADE` e integridad referencial activa (`PRAGMA foreign_keys = ON`). |
| **🧱 Programación Orientada a Objetos (POO)** | ✅ | Modelos organizados en clases TypeScript/Sequelize con **herencia** (`EntidadBase`), **encapsulación** (protección y hash de contraseñas con `bcryptjs`), **polimorfismo** y asociaciones relacionales explícitas. |
| **🌐 Arquitectura API RESTful Completa** | ✅ | Más de **25 endpoints REST** organizados por controladores, rutas y middlewares (`/auth`, `/objetos`, `/categorias`, `/ubicaciones`, `/usuarios`, `/reclamaciones`, `/entregas`, `/stats`), con códigos HTTP semánticos (`200`, `201`, `400`, `401`, `403`, `404`, `500`). |
| **⚙️ Operaciones CRUD Integrales** | ✅ | **Create, Read, Update y Delete** funcionales y validados tanto desde el backend como desde la interfaz web (reportes propios, reclamaciones, ubicaciones GPS, categorías y usuarios). |
| **🔐 Autenticación y Roles (RBAC + JWT)** | ✅ | Autenticación mediante **JSON Web Tokens (JWT)** y control de acceso basado en **4 roles institucionales**: *Estudiante*, *Docente*, *Personal de Seguridad* y *Administrador*. |
| **🗺️ Innovación Tecnológica (Geolocalización Real)** | ✅ | Mapa interactivo calibrado con coordenadas reales del **Campus UGB Usulután** y el **Parque Central Raúl Francisco Munguía**, cálculo de distancias en vivo (**fórmula de Haversine**) y selector de coordenadas GPS al reportar. |
| **🎨 Diseño UI/UX, Accesibilidad y Validaciones** | ✅ | Interfaz moderna y responsiva, **modales nativos `<dialog>`**, prevención de **XSS** mediante escape HTML, validación diferida de formularios, notificaciones flotantes (*toasts*) y manejo amigable de errores. |
| **📄 Documentación y Facilidad de Evaluación** | ✅ | Scripts de esquema (`schema.sql`), semilla automática (`seed.ts`), visor en vivo del esquema 3FN dentro de la web y acceso rápido de 1 clic por rol para pruebas del docente. |

---

## ✨ Novedades y Mejoras Destacadas de Esta Versión

### 🗺️ 1. Mapa Interactivo Calibrado al Campus UGB Usulután y Ciudad de Usulután
- 📌 **Ubicación exacta del Campus Regional UGB Usulután (`13.34212° N, -88.41797° O`)** con perímetro visual delimitado y zonas reales del campus:
  - 🏫 **Biblioteca UGB Usulután**
  - ☕ **Cafetería Universitaria UGB**
  - 💻 **Laboratorio de Cómputo UGB**
  - ⚽ **Cancha y Zona Deportiva UGB**
  - 🛡️ **Recepción y Caseta de Vigilancia UGB (Acceso Km. 113)**
  - 🎓 **Edificio de Aulas UGB**
  - 🏛️ **Parque Central Raúl Francisco Munguía (Centro de Usulután — `13.34382° N, -88.43823° O`)**
- 🎯 **GPS del dispositivo en vivo:** Ubica al usuario en el mapa y calcula automáticamente la distancia exacta en metros o kilómetros hacia cada objeto reportado.
- 🛰️ **Controles cartográficos completos:** Alternancia entre **Vista de Calles** y **Vista Satelital**, vuelo rápido entre el Campus UGB y el Centro de Usulután, filtros combinados y lista lateral sincronizada con cada pin.

---

### 🖥️ 2. Plataforma Web Modular Completa (8 Vistas Funcionales)
- 🏠 **Inicio (`/`):** Indicadores estadísticos en vivo, barra de búsqueda rápida, chips por categoría y reportes recientes.
- 🔍 **Búsqueda Multicriterio (`/pages/buscar/`):** Filtros combinables por palabra clave, categoría, ubicación y estado.
- 🗺️ **Mapa GPS (`/pages/mapa/`):** Exploración espacial interactiva de pertenencias en Usulután.
- ➕ **Reportar con GPS (`/pages/reportar/`):** Formulario con mapa selector (clic o arrastre de pin) y **alerta automática de posibles coincidencias** antes de publicar.
- 📁 **Mis Reportes (`/pages/mis-reportes/`):** Gestión personal con edición en modal nativo, contador de reclamos recibidos y eliminación con confirmación.
- 📋 **Mis Reclamaciones (`/pages/mis-reclamaciones/`):** Seguimiento del dictamen (*Pendiente*, *Aprobada*, *Rechazada*), visualización del **Acta de Entrega Oficial** y retiro de solicitudes pendientes.
- 🛡️ **Panel de Administración (`/pages/admin/`):** Dashboard con KPIs, filtro de solicitudes, aprobación/rechazo de evidencias, emisión formal de **Actas de Entrega** e historial auditable.
- 🗄️ **Centro CRUD 3FN (`/pages/crud/`):** Mantenimiento de *Ubicaciones GPS*, *Categorías* y *Usuarios*, más un **inspector en vivo de las 9 tablas normalizadas**.

---

### 🗄️ 3. Modelo Relacional en Tercera Forma Normal (3FN — 9 Tablas)
1. `tipos_usuario` — Catálogo de roles (Estudiante, Docente, Personal, Administrador).
2. `usuarios` — Comunidad universitaria con contraseñas encriptadas (`bcrypt`).
3. `categorias` — Clasificación normalizada de pertenencias.
4. `ubicaciones` — Espacios físicos georreferenciados (`latitud`, `longitud`).
5. `estados` — Ciclo de vida del objeto (`perdido`, `encontrado`, `recuperado`).
6. `estados_reclamacion` — Dictamen de validación (`pendiente`, `aprobada`, `rechazada`).
7. `objetos` — Entidad central con 4 llaves foráneas y coordenadas GPS precisas.
8. `reclamaciones` — Solicitudes *"Creo que es mío"* con justificación y evidencias.
9. `entregas` — Acta oficial 1:1 que cierra formalmente la devolución.

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/campus-find-usulutan.git
cd campus-find-usulutan

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor (API REST + SQLite 3FN + Frontend Web)
npm run dev
```

🌐 Abrir en el navegador: **`http://localhost:3000`**

### 👤 Cuentas de Prueba (Acceso Rápido 1-Clic en "Iniciar Sesión")
> Contraseña general para pruebas: **`password123`**

| Rol | Correo Institucional | Permisos Principales |
| :--- | :--- | :--- |
| 🛡️ **Administrador** | `admin@campusfind.edu` | Acceso total, Panel Admin, Actas de Entrega y Centro CRUD 3FN |
| 🎓 **Estudiante** | `estudiante@campusfind.edu` | Reportar, buscar, usar mapa GPS y enviar reclamaciones |
| 👨‍🏫 **Docente** | `docente@campusfind.edu` | Reportar hallazgos/extravíos en aulas y gestionar reportes |
| 👮 **Personal de Vigilancia** | `personal@campusfind.edu` | Registro y custodia de objetos encontrados en el campus |
```
