# Sistema de Derivación Masiva y Notificaciones a Prevencionistas

## Fecha de Implementación
18 de febrero de 2026

## Descripción General
Sistema mejorado de derivación que permite al supervisor marcar masivamente formularios como "NO requiere derivación" y gestionar casos especiales de "SÍ requiere derivación" con notas explicativas. Los prevencionistas reciben notificaciones automáticas de casos que requieren atención.

## Flujo Completo

### 1. Supervisor - Marcar Todos NO
**Ubicación:** Vista principal del supervisor, arriba de la lista de formularios

**Botón:** "✓ Marcar Todos NO (Derivación)"

**Acción:**
- Marca TODOS los formularios pendientes (no firmados) como "NO requiere derivación"
- Limpia cualquier nota previa
- Ahorra tiempo cuando la mayoría de casos son normales

**Endpoint:** `POST /api/supervisor/mark-all-derivation-no`

### 2. Supervisor - Editar Derivación Individual
**Ubicación:** Cada formulario en la lista tiene un botón de derivación

**Estados del botón:**
- 🟡 "⚠️ Marcar Derivación" - Sin marcar (pendiente)
- 🔴 "⚠️ SÍ (Editar)" - Marcado como SÍ requiere
- 🟢 "✓ NO (Editar)" - Marcado como NO requiere

**Modal de Derivación:**
- Radio buttons: NO / SÍ
- Campo de texto (obligatorio si marca SÍ)
- Validación: No permite guardar "SÍ" sin nota

**Endpoint:** `POST /api/supervisor/set-derivation/:shiftId/:dayNumber`

**Body:**
```json
{
  "requires_derivation": "si" | "no",
  "derivation_note": "Texto explicativo (obligatorio si es 'si')"
}
```

### 3. Notificación a Prevencionistas
**Trigger:** Cuando supervisor marca "SÍ requiere derivación"

**Método:** Server-Sent Events (SSE)

**Mensaje:**
```json
{
  "type": "derivation_required",
  "shiftId": 123,
  "dayNumber": 5,
  "timestamp": "2026-02-18T10:30:00Z"
}
```

**Función:** `notifyDerivationRequired(shiftId, dayNumber)`

### 4. Vista del Prevencionista (OHSEM)
**Pendiente de implementación:**
- Lista filtrada de formularios con "SÍ requiere derivación"
- Muestra: Operador, Turno, Día, Supervisor, Nota
- Badge de notificación con contador
- Opción de marcar como "Revisado"

## Cambios en Base de Datos

### Campo Agregado
```sql
ALTER TABLE daily_forms 
ADD COLUMN IF NOT EXISTS supervisor_derivation_note TEXT;
```

**Campos relacionados:**
- `supervisor_requires_derivation` (VARCHAR) - 'si', 'no', o NULL
- `supervisor_derivation_note` (TEXT) - Nota explicativa del supervisor

## Archivos Modificados

### Backend (server.js)
1. **Nuevo endpoint:** `/api/supervisor/mark-all-derivation-no`
   - Marca todos los pendientes como "NO"
   
2. **Nuevo endpoint:** `/api/supervisor/set-derivation/:shiftId/:dayNumber`
   - Guarda estado individual de derivación
   - Valida nota obligatoria para "SÍ"
   - Notifica a prevencionistas si es "SÍ"

3. **Nueva función:** `notifyDerivationRequired(shiftId, dayNumber)`
   - Envía notificación SSE a prevencionistas

4. **Modificado:** `authenticateToken` middleware
   - Ahora acepta tokens desde query params (para SSE)

### Frontend (public/app.js)
1. **Modificado:** `renderOrdersList()`
   - Agrega botón "Marcar Todos NO"
   - Muestra badges de estado de derivación
   - Agrega botón individual de derivación por formulario

2. **Nueva función:** `markAllDerivationNo()`
   - Llama al endpoint de marcado masivo
   - Recarga la lista

3. **Nueva función:** `openDerivationModal(shiftId, dayNumber, workerName)`
   - Abre modal con opciones SI/NO
   - Muestra/oculta campo de nota según selección
   - Carga estado actual si existe

4. **Nueva función:** `saveDerivationStatus(shiftId, dayNumber)`
   - Valida selección y nota
   - Guarda en backend
   - Recarga lista

### Base de Datos
- **Script:** `database/add_derivation_note_field.sql`
- Agrega campo `supervisor_derivation_note`

## Validaciones Implementadas

### Frontend
1. Debe seleccionar SI o NO
2. Si marca "SÍ", el campo de nota es obligatorio
3. Muestra error si intenta guardar "SÍ" sin nota

### Backend
1. Solo supervisores pueden acceder
2. Valida que existe nota si `requires_derivation === 'si'`
3. Retorna error 400 si falta nota en caso "SÍ"

## Próximos Pasos (Pendientes)

### Vista de Prevencionistas
1. Crear endpoint `/api/ohsem/derivations`
   - Retorna formularios con `supervisor_requires_derivation = 'si'`
   - Incluye datos del operador, supervisor, nota

2. Agregar sección en interfaz OHSEM
   - Lista de casos que requieren derivación
   - Badge con contador de casos pendientes
   - Filtros por turno, fecha, supervisor

3. Sistema de seguimiento
   - Campo `derivation_reviewed` (boolean)
   - Campo `derivation_reviewed_by` (nombre prevencionista)
   - Campo `derivation_reviewed_at` (timestamp)
   - Botón "Marcar como Revisado"

4. Historial de derivaciones
   - Vista de casos revisados
   - Estadísticas de derivaciones por turno/período

## Beneficios del Sistema

1. **Eficiencia:** Marcado masivo ahorra tiempo
2. **Trazabilidad:** Notas explicativas documentan decisiones
3. **Comunicación:** Notificaciones automáticas a prevencionistas
4. **Seguridad:** Validaciones evitan errores
5. **Visibilidad:** Estados claros con colores (verde/rojo/amarillo)

## Ejemplo de Uso

### Escenario Típico:
1. Supervisor entra a su vista (10 formularios pendientes)
2. Click en "Marcar Todos NO" → Todos marcados como NO
3. Revisa lista, nota que operador "Juan Pérez" reportó fatiga
4. Click en botón de derivación de Juan Pérez
5. Selecciona "SÍ requiere derivación"
6. Escribe nota: "Reportó fatiga extrema y dificultad para concentrarse"
7. Guarda → Prevencionistas reciben notificación automática
8. Firma todos los formularios con "Firmar Todos los Pendientes"

## Notas Técnicas

- SSE mantiene conexión abierta para notificaciones en tiempo real
- Tokens JWT válidos por query param para SSE
- Estados de derivación independientes de firmas
- Puede cambiar derivación antes de firmar
- Una vez firmado, no se puede cambiar derivación
