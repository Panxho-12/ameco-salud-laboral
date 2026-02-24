# 🚀 EJECUTAR AHORA: Prueba Turno B

## ⚡ Pasos Rápidos

### 1️⃣ LIMPIAR (Eliminar formularios y firmas existentes)

Ve a Supabase → SQL Editor y ejecuta:

```sql
-- Archivo: database/limpiar_datos_prueba.sql
```

Esto eliminará:
- ✅ TODOS los formularios del Turno B (incluidos los 3 que hiciste manualmente)
- ✅ Todas las firmas del Turno B

---

### 2️⃣ CREAR DATOS DE PRUEBA

En Supabase → SQL Editor, ejecuta:

```sql
-- Archivo: database/crear_datos_prueba_turno_B.sql
```

Esto creará:
- ✅ 29 firmas genéricas (todos los usuarios del Turno B)
- ✅ 26 formularios del día 6 (todos los trabajadores del Turno B)
- ✅ Formularios marcados como firmados por trabajador

---

### 3️⃣ PROBAR COMO SUPERVISOR

Inicia sesión:
- **Usuario**: `18970956-0` (Campusano)
- **Contraseña**: `Ameco@2025`

Deberías ver 26 formularios pendientes.

**Prueba estos botones:**
1. ✓ Marcar Todos NO (derivación)
2. 🔥 Firmar Todos los Pendientes
3. 📄 PDF (en cualquier formulario)

---

### 4️⃣ LIMPIAR DESPUÉS DE PROBAR

**IMPORTANTE**: Después de terminar las pruebas, ejecuta de nuevo:

```sql
-- Archivo: database/limpiar_datos_prueba.sql
```

Esto dejará la base de datos limpia para uso real.

---

## 📊 Resumen

- **Turno B**: 29 usuarios (3 supervisores + 26 trabajadores)
- **Día actual**: 6 de 10
- **Fecha**: 19/02/2026
- **Supervisor de prueba**: Campusano (18970956-0)

---

## ⚠️ Notas

- Los scripts solo afectan al Turno B
- El Turno A no se ve afectado
- Las firmas genéricas son válidas pero invisibles (1x1 pixel)
- Todos los formularios tienen respuestas en "NO" (trabajadores saludables)

---

## 🔄 Si algo falla

1. Ejecuta `limpiar_datos_prueba.sql`
2. Ejecuta `crear_datos_prueba_turno_B.sql`
3. Intenta de nuevo

---

## 📄 Documentación Completa

Ver: `INSTRUCCIONES_PRUEBA_FIRMA_MASIVA.md`
