# Cambios Implementados - Sistema de Turnos A y B

**Fecha**: 17/02/2026  
**Objetivo**: Configurar correctamente los turnos A y B según la situación real de faena

## Situación Actual

- **Turno B**: En faena desde el sábado 14/02/2026 (actualmente día 4)
- **Turno A**: En descanso, último turno terminó el 13/02/2026, próximo turno empieza el 24/02/2026

## Cambios Realizados

### 1. Script SQL de Migración (`database/fix_turnos_A_B.sql`)

Actualiza las fechas de inicio de los turnos:

```sql
-- Turno B: start_date = 2026-02-14 (en faena, día 4)
-- Turno A: start_date = 2026-02-04 (en descanso, día 14)
```

**Ejecutar este script en Supabase SQL Editor**

### 2. Lógica del Servidor (`server.js`)

**Cambio en `/api/shift/current`:**

- Detecta cuando un usuario está en período de descanso (día 11-20)
- Detecta cuando un usuario completa el ciclo completo (día 21+)
- **NUEVO**: Crea automáticamente un nuevo turno cuando día > 20
- Completa el turno anterior automáticamente
- Calcula días de descanso restantes
- Calcula fecha del próximo turno
- Retorna `in_rest: true` cuando corresponde

**Transición automática de turnos:**
```javascript
// Si día > 20, crear nuevo turno automáticamente
if (calculatedDay > 20) {
  // 1. Completar turno anterior
  await supabase.update({ status: 'completed' })
  
  // 2. Crear nuevo turno con start_date = hoy
  const newShift = await supabase.insert({
    start_date: today,
    shift_number: nextNumber
  })
  
  // 3. Usuario ve "Día 1 de 10"
}
```

**Nuevos campos en respuesta:**
```javascript
{
  current_day: 0,           // 0 = en descanso, 1-10 = en faena
  in_rest: true,            // indica período de descanso
  rest_days_remaining: 7,   // días de descanso que faltan
  next_shift_start: '2026-02-24' // fecha del próximo turno
}
```

### 3. Frontend (`public/app.js`)

**Función `loadShiftData()`:**
- Lee el flag `in_rest` del servidor
- Almacena estado de descanso en `this.inRest`

**Función `updateUI()`:**
- Detecta si usuario está en descanso
- Muestra mensaje especial con:
  - Emoji de vacaciones 🏖️
  - Fecha del próximo turno
  - Días de descanso restantes
- Oculta formularios y botones de guardado
- Previene acceso a formularios durante descanso

### 4. Estilos CSS (`public/styles.css`)

**Nueva clase `.rest-period-message`:**
- Diseño atractivo con gradiente morado
- Centrado y responsive
- Información clara y visible
- Destaca fecha del próximo turno en dorado

### 5. Documentación

**Nuevo archivo: `INSTRUCCIONES_TURNOS.md`**
- Explica el sistema 10x10 completo
- Ejemplos de calendario
- Cálculo del día actual
- Estados del turno
- Scripts SQL de configuración
- Casos de uso prácticos

**Actualizado: `README.md`**
- Sección de flujo de trabajo actualizada
- Referencia a INSTRUCCIONES_TURNOS.md

## Resultado Esperado

### Turno B (Hoy 17/02/2026)
```
Usuario: Cualquier operador/supervisor del Turno B
Estado: EN FAENA
Día actual: 4
Interfaz: Formularios habilitados (solo día 4)
```

### Turno A (Hoy 17/02/2026)
```
Usuario: Cualquier operador/supervisor del Turno A
Estado: EN DESCANSO
Día actual: 14 (11-20 = descanso)
Interfaz: Mensaje de descanso
Próximo turno: 24/02/2026
Días restantes: 7
Formularios: ❌ Bloqueados (no visibles)
```

### Turno A (El 24/02/2026 - Vuelven a faena)
```
Usuario: Cualquier operador/supervisor del Turno A
Acción: Login
Sistema detecta: Día 21 (ciclo completo)
Sistema ejecuta:
  1. Completa turno anterior (status = 'completed')
  2. Crea nuevo turno (start_date = '2026-02-24')
  3. Muestra "Día 1 de 10"
Estado: EN FAENA
Interfaz: Formularios habilitados (día 1)
```

## Verificación

### 1. Ejecutar script SQL
```bash
# En Supabase SQL Editor
# Copiar y ejecutar: database/fix_turnos_A_B.sql
```

### 2. Reiniciar servidor
```bash
npm run dev
```

### 3. Probar con usuarios

**Usuario Turno B (ejemplo: operador del turno B):**
- Login exitoso
- Ve "Día 4 de 10"
- Puede completar formulario del día 4
- Días 1-3 bloqueados
- Días 5-10 bloqueados

**Usuario Turno A (ejemplo: operador del turno A):**
- Login exitoso
- Ve "En Descanso"
- Mensaje: "Período de Descanso"
- Próximo turno: 24/02/2026
- Días de descanso restantes: 7
- No puede acceder a formularios

## Notas Técnicas

### Cálculo de Días
```javascript
const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
const currentDay = daysDiff + 1;

if (currentDay > 10) {
  // Usuario en descanso
  in_rest = true;
  rest_days_remaining = 20 - daysDiff;
  next_shift_start = startDate + 20 días;
}
```

### Zona Horaria
- Todas las fechas se parsean a las 12:00 (mediodía)
- Evita problemas de conversión UTC
- Garantiza consistencia en el cálculo de días

### Roles Especiales
- Jefe de Operaciones: `shift = NULL`, ve ambos turnos
- OHSEM: `shift = NULL`, ve ambos turnos
- No están sujetos al sistema 10x10

## Próximos Pasos

1. ✅ Ejecutar script SQL en Supabase
2. ✅ Reiniciar servidor
3. ⏳ Probar con usuarios de ambos turnos
4. ⏳ **IMPORTANTE**: El 24/02/2026, verificar que:
   - Turno A: Se crea automáticamente nuevo turno (día 1)
   - Turno B: Entra en período de descanso (día 11)
5. ⏳ Verificar que el ciclo continúa correctamente

## Comportamiento Esperado el 24/02/2026

### Turno A (vuelve a faena)
1. Usuario hace login
2. Sistema detecta día 21 (2026-02-24 - 2026-02-04 + 1 = 21)
3. Sistema completa turno anterior automáticamente
4. Sistema crea nuevo turno con `start_date = '2026-02-24'`
5. Usuario ve "Turno #2, Día 1 de 10"
6. Puede completar formulario del día 1

### Turno B (entra en descanso)
1. Usuario hace login
2. Sistema detecta día 11 (2026-02-24 - 2026-02-14 + 1 = 11)
3. Usuario ve "En Descanso"
4. Próximo turno: 2026-03-06
5. No puede acceder a formularios

## Contacto

Si hay algún problema o ajuste necesario, revisar:
- `server.js` líneas 136-165 (cálculo de día actual)
- `public/app.js` líneas 450-490 (updateUI)
- `database/fix_turnos_A_B.sql` (configuración inicial)
