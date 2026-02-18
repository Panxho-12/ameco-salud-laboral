# Sistema de Turnos 10x10 - AMECO

## Concepto General

El sistema AMECO utiliza un esquema de turnos rotativos 10x10:
- **10 días de trabajo** en faena
- **10 días de descanso** fuera de faena

## Turnos Disponibles

### Turno A
- Trabaja 10 días, descansa 10 días
- Cuando Turno A está en faena, Turno B está en descanso
- Cuando Turno A está en descanso, Turno B está en faena

### Turno B
- Trabaja 10 días, descansa 10 días
- Alterna con Turno A para mantener operación continua

## Ejemplo de Calendario (Febrero-Marzo 2026)

```
Turno A:
- Trabajo:   04/02 - 13/02 (10 días)
- Descanso:  14/02 - 23/02 (10 días)
- Trabajo:   24/02 - 05/03 (10 días)
- Descanso:  06/03 - 15/03 (10 días)

Turno B:
- Descanso:  04/02 - 13/02 (10 días)
- Trabajo:   14/02 - 23/02 (10 días) ← ACTUALMENTE AQUÍ (día 4)
- Descanso:  24/02 - 05/03 (10 días)
- Trabajo:   06/03 - 15/03 (10 días)
```

## Cálculo del Día Actual

El sistema calcula automáticamente el día actual basándose en:

1. **start_date**: Fecha de inicio del turno (día 1)
2. **Fecha actual**: Hoy
3. **Diferencia**: `días_transcurridos = fecha_actual - start_date`
4. **Día actual**: `día_actual = días_transcurridos + 1`

### Estados del Turno

- **Días 1-10**: Usuario en faena (puede completar formularios)
- **Días 11-20**: Usuario en descanso (no puede acceder a formularios)
- **Día 21+**: Nuevo turno comienza automáticamente

## Comportamiento del Sistema

### Durante el Período de Trabajo (Días 1-10)

- ✅ Usuario puede ver y completar formularios
- ✅ Solo el día actual está habilitado
- ✅ Días pasados están bloqueados (aunque no se completaron)
- ✅ Días futuros están bloqueados
- ✅ Firmas digitales se aplican automáticamente

### Durante el Período de Descanso (Días 11-20)

- 🏖️ Usuario ve mensaje de "Período de Descanso"
- ❌ No puede acceder a formularios
- ℹ️ Se muestra la fecha del próximo turno
- ℹ️ Se muestran los días de descanso restantes

## Configuración en Base de Datos

### Script de Migración

Para configurar correctamente los turnos A y B, ejecutar:

```sql
-- Turno B (actualmente en faena desde 14/02)
UPDATE shifts 
SET start_date = '2026-02-14'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'B' 
    AND role IN ('worker', 'supervisor')
);

-- Turno A (actualmente en descanso, último turno empezó 04/02)
UPDATE shifts 
SET start_date = '2026-02-04'
WHERE status = 'active'
AND user_id IN (
    SELECT id FROM users 
    WHERE shift = 'A' 
    AND role IN ('worker', 'supervisor')
);
```

### Verificación

Para verificar el estado actual de los turnos:

```sql
SELECT 
    u.shift as turno,
    u.name as usuario,
    s.start_date as fecha_inicio,
    CURRENT_DATE as hoy,
    (CURRENT_DATE - s.start_date) + 1 as dia_actual,
    CASE 
        WHEN (CURRENT_DATE - s.start_date) + 1 BETWEEN 1 AND 10 THEN 'EN FAENA'
        WHEN (CURRENT_DATE - s.start_date) + 1 > 10 THEN 'EN DESCANSO'
        ELSE 'FUTURO'
    END as estado
FROM shifts s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active'
ORDER BY u.shift, u.name;
```

## Roles Especiales

### Jefe de Operaciones y OHSEM

- **NO tienen turno asignado** (campo `shift` es NULL)
- Pueden ver formularios de **ambos turnos** (A y B)
- No están sujetos al sistema de rotación 10x10
- Siempre tienen acceso al sistema

## Transición Automática de Turnos

Cuando un turno completa sus 10 días de trabajo + 10 días de descanso (día 21+):

1. El sistema detecta que `current_day > 20`
2. Completa automáticamente el turno anterior (`status = 'completed'`)
3. Crea un nuevo turno con `start_date = hoy`
4. El usuario ve "Día 1 de 10" y puede completar formularios
5. El ciclo comienza nuevamente

**Ejemplo práctico:**
- Usuario Turno A con `start_date = '2026-02-04'`
- El 24/02/2026 hace login (día 21)
- Sistema crea nuevo turno con `start_date = '2026-02-24'`
- Usuario ve "Día 1 de 10" y puede trabajar normalmente

## Notas Importantes

- ⚠️ Los días pasados NO se pueden completar (aunque no se hayan llenado)
- ⚠️ Solo el día actual está habilitado
- ⚠️ El sistema usa hora del mediodía (12:00) para evitar problemas de zona horaria
- ⚠️ Los supervisores también siguen el sistema 10x10 (completan sus propios formularios)

## Ejemplo Práctico

### Hoy: 17/02/2026 (Martes)

**Usuario del Turno B:**
- start_date: 2026-02-14 (sábado)
- Hoy: 2026-02-17 (martes)
- Días transcurridos: 3
- **Día actual: 4** ✅ EN FAENA
- Puede completar formulario del día 4
- Ve: "Día 4 de 10"

**Usuario del Turno A:**
- start_date: 2026-02-04 (miércoles)
- Hoy: 2026-02-17 (martes)
- Días transcurridos: 13
- **Día actual: 14** 🏖️ EN DESCANSO
- No puede acceder a formularios
- Ve: "Período de Descanso"
- Próximo turno: 2026-02-24 (martes)
- Días de descanso restantes: 7

### El 24/02/2026 (Martes) - Turno A vuelve a faena

**Usuario del Turno A hace login:**
1. Sistema detecta: día 21 (2026-02-24 - 2026-02-04 + 1 = 21)
2. Sistema completa turno anterior automáticamente
3. Sistema crea nuevo turno: `start_date = '2026-02-24'`
4. Usuario ve: "Día 1 de 10" ✅
5. Puede completar formulario del día 1
6. Ciclo comienza nuevamente

**Usuario del Turno B:**
- start_date: 2026-02-14 (sábado)
- Hoy: 2026-02-24 (martes)
- Días transcurridos: 10
- **Día actual: 11** 🏖️ EN DESCANSO
- Entra en período de descanso
- Próximo turno: 2026-03-06 (viernes)
