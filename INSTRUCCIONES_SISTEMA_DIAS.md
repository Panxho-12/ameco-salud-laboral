# Sistema de Días Automático - Turnos 10x10

## ¿Qué se implementó?

Ahora el sistema avanza automáticamente de día en día basado en la fecha de calendario. Los turnos 10x10 funcionan así:

- **Día 1**: El primer día que el usuario entra y crea su turno
- **Día 2**: 24 horas después (al día siguiente)
- **Día 3**: 48 horas después
- ... y así hasta el **Día 10**

## Cambios Realizados

### 1. Base de Datos
- ✅ Agregado campo `start_date` a la tabla `shifts`
- ✅ El campo guarda la fecha de inicio del turno (Día 1)

### 2. Backend (server.js)
- ✅ Al crear un turno nuevo, se guarda la fecha actual como `start_date`
- ✅ El servidor calcula automáticamente el día actual basado en la diferencia de fechas
- ✅ Solo permite completar el formulario del día actual
- ✅ Validación: no puedes completar días futuros ni modificar días pasados

### 3. Frontend (app.js)
- ✅ El día actual se obtiene del servidor (no está hardcodeado)
- ✅ Solo el día actual está habilitado para editar
- ✅ Días pasados completados se muestran bloqueados
- ✅ Días futuros se muestran deshabilitados
- ✅ El día actual se resalta visualmente con color amarillo

### 4. Estilos (styles.css)
- ✅ Día actual resaltado con fondo amarillo claro y borde amarillo
- ✅ Header del día actual en amarillo con texto negro

## Aplicar la Migración

### Paso 1: Ejecutar en Supabase

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Abre el "SQL Editor"
3. Copia y pega el contenido de `database/migration_add_start_date.sql`
4. Ejecuta el script
5. Verifica que aparezca la columna `start_date` en el resultado

### Paso 2: Reiniciar el Servidor

El servidor ya está actualizado con el nuevo código. Solo necesitas reiniciarlo:

```bash
# Si está corriendo, detenerlo (Ctrl+C)
# Luego reiniciar:
node server.js
```

## Cómo Funciona

### Ejemplo de Uso:

**Lunes 16 de Febrero (Hoy):**
- Usuario entra por primera vez
- Sistema crea turno con `start_date = 2026-02-16`
- Día actual = 1 ✅ (puede completar)
- Días 2-10 = deshabilitados ❌

**Martes 17 de Febrero (Mañana):**
- Usuario entra al sistema
- Sistema calcula: hoy - start_date = 1 día
- Día actual = 2 ✅ (puede completar)
- Día 1 = completado y bloqueado 🔒
- Días 3-10 = deshabilitados ❌

**Miércoles 18 de Febrero:**
- Día actual = 3 ✅
- Días 1-2 = completados y bloqueados 🔒
- Días 4-10 = deshabilitados ❌

... y así hasta el Día 10

**Viernes 27 de Febrero (Día 10):**
- Día actual = 10 ✅ (último día del turno)
- Días 1-9 = completados y bloqueados 🔒
- Después de completar el Día 10, el turno se puede cerrar

## Validaciones Implementadas

### En el Servidor:
1. ✅ Solo puedes guardar el formulario del día actual
2. ✅ Si intentas guardar un día futuro: error "Solo puede completar el formulario del Día X"
3. ✅ Solo un checklist por día (no puedes hacer dos formularios el mismo día)
4. ✅ No puedes modificar días pasados ya completados

### En el Frontend:
1. ✅ Solo el día actual tiene los campos habilitados
2. ✅ Días pasados completados se muestran pero están bloqueados
3. ✅ Días futuros están completamente deshabilitados
4. ✅ El día actual se resalta visualmente

## Notas Importantes

### Para Turnos Existentes:
- Los turnos que ya existen se les asignará `start_date = fecha de creación`
- Esto significa que el cálculo de días será correcto desde el momento de la migración

### Zona Horaria:
- El sistema usa la fecha del servidor (UTC por defecto en Supabase)
- Los cálculos se hacen a medianoche (00:00:00)
- El cambio de día ocurre a las 00:00 hora del servidor

### Turnos 10x10:
- Este sistema es perfecto para turnos 10x10 (10 días trabajando, 10 días descansando)
- Después del Día 10, el usuario puede cerrar el turno
- Al crear un nuevo turno, el ciclo comienza de nuevo desde el Día 1

## Probar el Sistema

1. Entra como operador
2. Verás que solo el Día 1 está habilitado (resaltado en amarillo)
3. Completa el formulario del Día 1
4. Mañana cuando entres, verás que el Día 2 está habilitado
5. El Día 1 estará bloqueado (ya completado)

## ¿Necesitas Cambiar la Fecha de Inicio?

Si necesitas ajustar manualmente la fecha de inicio de un turno (por ejemplo, para pruebas):

```sql
-- Cambiar la fecha de inicio de un turno específico
UPDATE shifts 
SET start_date = '2026-02-10'  -- Cambia esta fecha
WHERE id = 1;  -- ID del turno
```

Esto hará que el sistema calcule los días basándose en la nueva fecha.
