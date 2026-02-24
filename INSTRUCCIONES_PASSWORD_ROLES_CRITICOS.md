# Cambio de Contraseña Obligatorio - Solo Roles Críticos

## 🎯 Objetivo

Implementar cambio de contraseña obligatorio SOLO para roles críticos:
- ✅ Supervisores
- ✅ Jefe de Operaciones  
- ✅ Prevencionistas (OHSEM)

Los trabajadores (operadores) mantienen la contraseña compartida `Ameco@2025`.

---

## 📋 Flujo de Primera Vez (Roles Críticos)

1. Usuario hace login con credenciales iniciales
2. **Modal de cambio de contraseña** (obligatorio, no se puede cerrar)
3. Usuario cambia contraseña
4. **Página se refresca automáticamente**
5. **Modal de firma digital** (obligatorio)
6. Usuario crea firma
7. Acceso al sistema ✅

---

## 🚀 Pasos de Implementación

### Paso 1: Ejecutar Migración en Supabase

```sql
-- Ejecuta en Supabase SQL Editor:
-- database/migration_password_roles_criticos.sql
```

Esta migración:
- Agrega columnas `first_login_completed` y `password_changed_at`
- Marca TODOS los usuarios como que ya completaron primer login
- Marca SOLO roles críticos como que necesitan cambiar contraseña

### Paso 2: Crear Usuario de Prueba (Opcional)

```sql
-- Ejecuta en Supabase SQL Editor:
-- database/crear_supervisor_prueba_password.sql
```

Esto crea un supervisor de prueba:
- Usuario: `test-supervisor`
- Contraseña: `Ameco@2025`
- Necesita cambiar contraseña

### Paso 3: Probar Localmente

```bash
npm start
```

1. Abre `http://localhost:3000`
2. Login con `test-supervisor` / `Ameco@2025`
3. Verás modal de cambio de contraseña
4. Cambia a: `MiNueva@Pass123`
5. Página se refresca
6. Verás modal de firma digital
7. Crea firma
8. ¡Listo!

### Paso 4: Verificar con Trabajador

1. Login con cualquier trabajador (role='worker')
2. NO deberías ver modal de cambio de contraseña
3. Solo verás modal de firma (si no tiene)
4. Acceso directo al sistema

---

## 🔒 Requisitos de Contraseña

- Mínimo 8 caracteres
- Al menos una mayúscula (A-Z)
- Al menos una minúscula (a-z)
- Al menos un número (0-9)
- Al menos un carácter especial (!@#$%^&*...)
- No puede ser `Ameco@2025` (contraseña por defecto)
- No puede ser igual a la contraseña actual

---

## 📝 Archivos Modificados

### Backend
- `server.js` - Endpoint `/api/change-password` y lógica de roles críticos

### Frontend
- `public/index.html` - Modal de cambio de contraseña
- `public/app.js` - Lógica de cambio de contraseña y refresh
- `public/styles.css` - Estilos del modal

### Base de Datos
- `database/migration_password_roles_criticos.sql` - Migración
- `database/crear_supervisor_prueba_password.sql` - Usuario de prueba

---

## 🧪 Casos de Prueba

### Caso 1: Supervisor Primera Vez
- Login → Modal contraseña → Cambio exitoso → Refresh → Modal firma → Sistema

### Caso 2: Trabajador Primera Vez
- Login → Modal firma (si no tiene) → Sistema

### Caso 3: Supervisor Ya Cambió Contraseña
- Login → Sistema directo (sin modal contraseña)

### Caso 4: Contraseña Débil
- Intentar contraseña sin mayúsculas → Error
- Intentar contraseña sin números → Error
- Intentar contraseña corta → Error

### Caso 5: Contraseña Por Defecto
- Intentar cambiar a `Ameco@2025` → Error

---

## 🔄 Flujo Técnico

```
Login
  ↓
¿Es rol crítico? (supervisor/operations_manager/ohsem)
  ↓ SÍ                           ↓ NO
¿first_login_completed = FALSE?   Ir a Dashboard
  ↓ SÍ              ↓ NO
Modal Password    Ir a Dashboard
  ↓
Cambiar Password
  ↓
UPDATE first_login_completed = TRUE
  ↓
window.location.reload()
  ↓
Login automático (token guardado)
  ↓
¿Tiene firma digital?
  ↓ NO              ↓ SÍ
Modal Firma      Dashboard
```

---

## 🚨 Notas Importantes

1. **Trabajadores NO se ven afectados** - Siguen usando `Ameco@2025` sin problemas

2. **Refresh automático** - Después de cambiar contraseña, la página se refresca para que salte el modal de firma

3. **Usuarios existentes** - La migración marca a todos como que ya completaron primer login, luego marca solo roles críticos como que necesitan cambiar

4. **Producción** - Después de ejecutar la migración en producción, todos los supervisores/jefes/ohsem verán el modal la próxima vez que hagan login

---

## 📦 Deploy a Producción

```bash
git add .
git commit -m "feat: Cambio de contraseña obligatorio para roles críticos"
git push origin main
```

Luego en Supabase de producción:
1. Ejecuta `database/migration_password_roles_criticos.sql`
2. Render desplegará automáticamente
3. Listo para usar

---

¿Listo para hacer el push?
