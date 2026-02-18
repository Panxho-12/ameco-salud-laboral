# ⚠️ ACCIÓN REQUERIDA - Ejecutar Script SQL

## Problema Actual

Todos los usuarios (Turno A y Turno B) tienen el mismo `start_date = '2026-02-14'`, lo que causa:

- ❌ Turno A: Muestra "Día 10" cuando debería estar en descanso
- ❌ Turno B: Correcto (día 4), pero por casualidad

## Solución

Ejecutar el script SQL que separa correctamente los turnos A y B.

## Pasos para Ejecutar

### 1. Abrir Supabase SQL Editor

1. Ir a [https://supabase.com](https://supabase.com)
2. Abrir tu proyecto
3. Ir a **SQL Editor** (icono de base de datos en el menú lateral)
4. Click en **New Query**

### 2. Copiar y Pegar el Script

Copiar TODO el contenido del archivo: `database/fix_turnos_A_B.sql`

O copiar directamente desde aquí:

```sql
-- Fix: Configurar correctamente los turnos A y B
-- Fecha: 2026-02-17 (Martes)

-- ============================================
-- TURNO B - Actualmente en faena (día 4)
-- ============================================
UPDATE shifts 
SET start_date = '2026-02-14'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'B' 
    AND role IN ('worker', 'supervisor')
);

-- ============================================
-- TURNO A - Actualmente en descanso
-- ============================================
UPDATE shifts 
SET start_date = '2026-02-04'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'A' 
    AND role IN ('worker', 'supervisor')
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 
    u.shift as turno,
    u.name as usuario,
    u.role as rol,
    s.shift_number as num_turno,
    s.start_date as fecha_inicio,
    s.status as estado,
    CURRENT_DATE as hoy,
    CURRENT_DATE - s.start_date as dias_transcurridos,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 1 AND 10 THEN 'EN FAENA'
        WHEN (CURRENT_DATE - s.start_date) + 1 > 10 THEN 'EN DESCANSO'
        ELSE 'FUTURO'
    END as estado_turno
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
AND u.role IN ('worker', 'supervisor')
ORDER BY u.shift, u.name;
```

### 3. Ejecutar el Script

1. Click en **Run** (o presionar Ctrl+Enter)
2. Esperar a que termine (debería ser instantáneo)
3. Revisar los resultados de la verificación

### 4. Verificar Resultados

Deberías ver en la tabla de resultados:

**Turno A:**
- start_date: `2026-02-04`
- dia_actual: `14`
- estado_turno: `EN DESCANSO`

**Turno B:**
- start_date: `2026-02-14`
- dia_actual: `4`
- estado_turno: `EN FAENA`

### 5. Recargar la Aplicación

1. En el navegador, recargar la página (F5)
2. Hacer logout y login nuevamente

## Resultado Esperado

**Después de ejecutar el script:**

### Usuario Turno A
- ❌ No ve formularios
- 🏖️ Ve mensaje: "Período de Descanso"
- 📅 Próximo turno: 24/02/2026
- ⏰ Días restantes: 7

### Usuario Turno B
- ✅ Ve "Día 4 de 10"
- ✅ Solo día 4 habilitado
- ✅ Puede completar formularios

## Si Algo Sale Mal

Si después de ejecutar el script los usuarios siguen viendo días incorrectos:

1. Verificar que el script se ejecutó sin errores
2. Revisar la tabla de verificación al final del script
3. Hacer logout/login en la aplicación
4. Limpiar caché del navegador (Ctrl+Shift+Delete)

## Contacto

Si necesitas ayuda, revisa:
- `database/diagnostico_turnos.sql` - Para ver el estado actual
- `CAMBIOS_TURNOS_A_B.md` - Documentación completa de cambios
