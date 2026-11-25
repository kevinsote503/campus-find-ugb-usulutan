# campus-find-ugb-usulutan
# 🎓 Campus Find — Usulután (Objetos Perdidos y Encontrados con GPS)

📍 **Plataforma web universitaria integral** para reportar, buscar, geolocalizar y recuperar objetos perdidos y encontrados en el **Campus Regional Usulután de la Universidad Gerardo Barrios (UGB, Km. 113 Carretera El Litoral)** y el **Centro de Usulután, El Salvador**.

---

## ✨ ¿Qué trae de nuevo esta versión?

### 🗺️ 1. Mapa Interactivo GPS Calibrado en UGB Usulután y Centro de Usulután
- 📌 **Coordenadas reales verificadas** con **Leaflet + OpenStreetMap**, centrado directamente en el **Campus UGB Usulután (`13.34212, -88.41797`)** con un perímetro visual que delimita el campus.
- 🏫 **Ubicaciones reales del campus y la ciudad:**
  - Biblioteca UGB Usulután
  - Cafetería Universitaria UGB
  - Laboratorio de Cómputo UGB
  - Cancha y Zona Deportiva UGB
  - Recepción y Caseta de Vigilancia UGB
  - Edificio de Aulas UGB
  - 🏛️ Parque Central Raúl Francisco Munguía (Centro de Usulután)
- 🎯 **Botón de GPS en tiempo real** que calcula automáticamente la distancia en metros/kilómetros desde tu ubicación hasta cada objeto mediante la **fórmula de Haversine**.
- 🛰️ **Cambio instantáneo** entre vista de calles y vista satelital, filtros por estado/categoría/zona y lista lateral sincronizada con cada pin.

---

### 🌐 2. Todas las Vistas Web Completas y Modulares (HTML5 + CSS3 + JS Puro)
- 🏠 **Inicio:** Métricas en vivo del campus, buscador rápido, categorías y reportes recientes.
- 🔍 **Búsqueda Avanzada:** Filtros multicriterio combinables (texto, categoría, edificio y estado).
- ➕ **Reportar con Mapa GPS:** Selector de punto exacto arrastrando el pin o haciendo clic en el mapa, además de **detección automática de coincidencias en vivo** antes de publicar.
- 📁 **Mis Reportes:** Panel personal para ver, editar en modal nativo o eliminar tus reportes publicados.
- 📋 **Mis Reclamaciones ("Creo que es mío"):** Seguimiento en vivo del estado de cada solicitud (*Pendiente*, *Aprobada* o *Rechazada*), visualización del **Acta de Entrega Oficial** y opción para retirar solicitudes pendientes.
- 🛡️ **Panel de Administración y Vigilancia:** KPIs en tiempo real, filtro de reclamaciones, aprobación/rechazo de evidencias, emisión de **Actas de Entrega Oficial** e historial auditable de devoluciones.
- 🗄️ **Centro CRUD 3FN:** Mantenimiento completo (Crear, Leer, Actualizar y Eliminar) de Ubicaciones GPS, Categorías y Usuarios, más un **visor en vivo del esquema relacional 3FN**.

---

### 🗄️ 3. Base de Datos Relacional en Tercera Forma Normal (3FN)
- ✅ **SQLite embebido + Sequelize ORM** con **9 tablas normalizadas** e integridad referencial (`PRIMARY KEY`, `FOREIGN KEY`, restricciones `RESTRICT` y `CASCADE`):
  `tipos_usuario` · `usuarios` · `categorias` · `ubicaciones` · `estados` · `estados_reclamacion` · `objetos` · `reclamaciones` · `entregas`

---

### 🔐 4. Seguridad, Roles (RBAC) y Experiencia de Usuario
- 🔑 **Autenticación con JWT y contraseñas encriptadas con Bcrypt**.
- 👥 **4 Roles institucionales:** Estudiante, Docente, Personal de Seguridad y Administrador (con acceso rápido de 1 clic en el login para facilitar la evaluación).
- 🛡️ **Prevención de XSS** mediante escape HTML centralizado en tarjetas, tablas y popups del mapa.
- 💬 **Modales nativos accesibles (`<dialog>`)**, validaciones en formularios, botón para ver/ocultar contraseña y **notificaciones flotantes (toasts)** para cada acción.

---

## 🚀 Cómo ejecutar el proyecto localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor (backend + frontend + SQLite automático)
npm run dev

# 3. Abrir en el navegador
http://localhost:3000
```

> 👤 **Cuentas de prueba (contraseña: `password123`):**
> - 🛡️ **Administrador:** `admin@campusfind.edu`
> - 🎓 **Estudiante:** `estudiante@campusfind.edu`
> - 👨‍🏫 **Docente:** `docente@campusfind.edu`
> - 👮 **Personal de Vigilancia:** `personal@campusfind.edu`
