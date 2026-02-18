# Cambios en Vista del Prevencionista (OHSEM)

## Fecha: 18 de febrero de 2026

## Cambio Principal
La vista del prevencionista ahora SOLO muestra casos que requieren derivación (marcados como "SÍ" por el supervisor).

## Antes vs Después

### ANTES:
- Mostraba TODOS los formularios firmados por supervisor
- Tenía botón "Firmar" para cada formulario
- Botón "Firmar Todos los Pendientes"
- Prevencionista debía firmar todos los formularios

### DESPUÉS:
- Muestra SOLO formularios con `supervisor_requires_derivation = 'si'`
- Sin botón de firma (solo revisión)
- Sin botón de firma masiva
- Prevencionista solo revisa casos especiales

## Archivos Modificados

### 1. server.js
**Endpoint:** `GET /api/ohsem/orders`

**Cambio:**
```javascript
// Agregado filtro en la consulta
.eq('supervisor_requires_derivation', 'si')

// Solo muestra formularios de trabajadores
userRole === 'worker' && form.worker_signed && form.supervisor_signed
```

### 2. public/index.html
**Cambios:**
- Título: "Panel Profesional OHSEM - Casos con Derivación"
- Descripción: "Revisa los casos que requieren derivación marcados por los supervisores"
- Eliminado botón "Firmar Todos los Pendientes"
- Título de lista: "Casos que Requieren Derivación"
- Contador: "X casos encontrados" (en lugar de "órdenes")

### 3. public/app.js
**Función:** `renderOhsemInterface()`

**Cambios:**
- Mensaje vacío más claro: "No hay casos que requieran derivación"
- Borde rojo en cada caso (border-left: 4px solid #dc3545)
- Emoji ⚠️ antes del nombre
- Muestra nota del supervisor
- Eliminado botón "Firmar"
- Estado: "Revisado" en lugar de "Firmado"

## Nueva Interfaz del Prevencionista

### Cuando NO hay casos:
```
✅
No hay casos que requieran derivación
Todos los formularios están en orden. No hay casos marcados como "SÍ requiere derivación".
```

### Cuando HAY casos:
```
⚠️ Juan Pérez
Trabajador - Turno B - Día 5 de 10
Nota del Supervisor: Presenta síntomas de fatiga extrema

[👁️ Ver Detalle]
```

## Flujo Actualizado

### Flujo Completo del Sistema:

1. **Operador** llena formulario → Firma
2. **Supervisor** revisa formulario:
   - Marca derivación (NO/SÍ)
   - Si marca SÍ → Escribe nota obligatoria
   - Firma el formulario
3. **Si marcó SÍ:**
   - Prevencionista recibe notificación
   - Caso aparece en su lista
   - Puede ver detalle y nota del supervisor
4. **Si marcó NO:**
   - Formulario completado
   - No aparece en lista del prevencionista

## Beneficios

1. **Eficiencia:** Prevencionista solo ve casos que necesitan atención
2. **Claridad:** Lista vacía = todo en orden
3. **Contexto:** Nota del supervisor explica el caso
4. **Notificaciones:** Alerta en tiempo real de nuevos casos
5. **Simplicidad:** Sin firmas innecesarias

## Datos Mostrados por Caso

- Nombre del trabajador (con ⚠️)
- Rol (Trabajador/Supervisor)
- Turno (A/B)
- Día del ciclo (X de 10)
- Nota del supervisor (texto explicativo)
- Estado (Pendiente/Revisado)
- Botón "Ver Detalle"

## Próximas Mejoras Sugeridas

1. **Sistema de seguimiento:**
   - Botón "Marcar como Revisado"
   - Campo `derivation_reviewed_by`
   - Campo `derivation_reviewed_at`

2. **Acciones del prevencionista:**
   - Agregar notas propias
   - Marcar acciones tomadas
   - Cerrar caso

3. **Estadísticas:**
   - Casos por turno
   - Casos por período
   - Tipos de derivación más comunes

4. **Filtros adicionales:**
   - Por fecha
   - Por supervisor que marcó
   - Por tipo de síntoma (basado en nota)

## Notas Técnicas

- Query optimizada con filtro directo en Supabase
- Solo una consulta a la base de datos
- Renderizado condicional según cantidad de casos
- Borde rojo visual para destacar urgencia
- Sin funcionalidad de firma (solo lectura)

## Validaciones

- Solo usuarios con rol 'ohsem' pueden acceder
- Solo muestra formularios completamente firmados (operador + supervisor)
- Solo muestra casos con derivación = 'si'
- Nota del supervisor siempre visible
