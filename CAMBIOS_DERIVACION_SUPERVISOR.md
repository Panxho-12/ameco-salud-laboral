# 📋 CAMBIOS: Pregunta "¿Requiere Derivación?" - Solo Supervisor

## 🎯 OBJETIVO
Mover la pregunta "¿Requiere Derivación?" al final de "Fatiga y Somnolencia" y que solo el supervisor pueda marcarla al revisar el formulario del operador.

## ✅ CAMBIOS IMPLEMENTADOS

### 1. BASE DE DATOS
**Archivo**: `database/add_supervisor_derivation_field.sql`

- ✅ Agregado campo `supervisor_requires_derivation` a la tabla `daily_forms`
- Tipo: TEXT (valores: 'si', 'no', o NULL)
- Solo el supervisor puede llenar este campo

**Ejecutar en Supabase**:
```sql
ALTER TABLE daily_forms 
ADD COLUMN IF NOT EXISTS supervisor_requires_derivation TEXT;
```

### 2. FRONTEND - Formulario del Operador
**Archivo**: `public/app.js`

#### Cambios en `loadFormQuestions()`:
- ✅ Agregada pregunta especial `supervisorQuestion` con ID `supervisor_derivation`
- Texto: "¿Requiere Derivación?"
- Referencia: "Solo el supervisor puede marcar esta opción al revisar el formulario"

#### Cambios en `renderFatigueForm()`:
- ✅ Agregada la pregunta del supervisor al final de "Fatiga y Somnolencia"
- ✅ Muestra etiqueta "(Solo Supervisor)" en rojo
- ✅ Llama a `renderSupervisorDerivationGrid()` para mostrar los días

#### Nueva función `renderSupervisorDerivationGrid()`:
- ✅ Renderiza la pregunta para los 10 días
- ✅ Todos los días están **deshabilitados** para el operador
- ✅ Muestra tooltip: "Solo el supervisor puede marcar esta opción"
- ✅ Si hay valor guardado, lo muestra (pero deshabilitado)

### 3. FRONTEND - Vista del Supervisor
**Archivo**: `public/app.js`

#### Cambios en `renderActionButtons()`:
- ✅ Agregada sección "Evaluación del Supervisor"
- ✅ Muestra pregunta "¿Requiere Derivación?" con opciones Sí/No
- ✅ Etiqueta obligatoria: "(Obligatorio antes de firmar)"
- ✅ Si ya firmó, muestra el resultado con badge de color

#### Cambios en `signOrder()`:
- ✅ Valida que el supervisor haya marcado Sí o No
- ✅ Si no marcó, muestra alerta: "Debe marcar si requiere derivación"
- ✅ Muestra confirmación con la respuesta seleccionada
- ✅ Envía `requiresDerivation` al backend en el body

### 4. BACKEND - Endpoint de Firma
**Archivo**: `server.js`

#### Cambios en `/api/supervisor/sign/:shiftId/:dayNumber`:
- ✅ Recibe `requiresDerivation` del body
- ✅ Valida que sea 'si' o 'no'
- ✅ Si no está presente, retorna error 400
- ✅ Guarda `supervisor_requires_derivation` en la base de datos
- ✅ Retorna la respuesta en el JSON de respuesta

### 5. ESTILOS CSS
**Archivo**: `public/styles.css`

Agregados estilos para:
- ✅ `.derivation-question` - Fondo amarillo claro con borde
- ✅ `.derivation-options` - Opciones de radio estilizadas
- ✅ `.radio-option` - Botones de radio con hover y estados
- ✅ `.derivation-result` - Resultado con fondo verde
- ✅ `.supervisor-question` - Pregunta destacada en el formulario

## 🔄 FLUJO COMPLETO

### PASO 1: Operador completa su formulario
1. Operador completa "Condiciones de Salud"
2. Operador completa "Fatiga y Somnolencia"
3. Operador ve "¿Requiere Derivación?" pero está **deshabilitada**
4. Operador firma su formulario

### PASO 2: Supervisor revisa el formulario
1. Supervisor abre el formulario del operador
2. Ve toda la información completada
3. Ve la pregunta "¿Requiere Derivación?" **habilitada**
4. Marca Sí o No (obligatorio)
5. Firma el formulario
6. Se guarda su respuesta en `supervisor_requires_derivation`

### PASO 3: Visualización
1. En detalles del formulario: Se muestra la respuesta del supervisor
2. En PDF: Se mostrará la respuesta (pendiente de implementar)
3. En historial: Se puede ver si requiere derivación

## 📊 DATOS GUARDADOS

Tabla `daily_forms`:
```
- worker_signed: true (firmado por operador)
- supervisor_signed: true (firmado por supervisor)
- supervisor_signature_id: ID del supervisor
- supervisor_requires_derivation: 'si' o 'no' (respuesta del supervisor)
- signed_at: fecha de firma
```

## 🎨 DISEÑO VISUAL

### Para el Operador:
```
┌─────────────────────────────────────────────┐
│ ¿Requiere Derivación? (Solo Supervisor)    │
│ [Solo el supervisor puede marcar...]       │
│                                             │
│ Día 1  Día 2  Día 3  Día 4  Día 5          │
│ ⊗ Sí   ⊗ Sí   ⊗ Sí   ⊗ Sí   ⊗ Sí          │
│ ⊗ No   ⊗ No   ⊗ No   ⊗ No   ⊗ No          │
│ (Todos deshabilitados)                      │
└─────────────────────────────────────────────┘
```

### Para el Supervisor:
```
┌─────────────────────────────────────────────┐
│ Evaluación del Supervisor                   │
│                                             │
│ ¿Requiere Derivación?                       │
│ (Obligatorio antes de firmar)               │
│                                             │
│ ┌─────┐  ┌─────┐                           │
│ │ ○ Sí│  │ ○ No│                           │
│ └─────┘  └─────┘                           │
│                                             │
│ [✍️ Firmar Orden]  [Cerrar]                │
└─────────────────────────────────────────────┘
```

## 📄 DISEÑO DEL PDF

El PDF ahora incluye una sección especial "Evaluación del Supervisor" que aparece después de "Fatiga y Somnolencia" y antes de las firmas:

```
┌─────────────────────────────────────────────┐
│ Fatiga y Somnolencia                        │
│ [Todas las preguntas...]                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Evaluación del Supervisor                   │
│ (Fondo amarillo, destacado)                 │
│                                             │
│ ¿Requiere Derivación?           [SÍ/NO]    │
│                                             │
│ Esta evaluación fue realizada por el        │
│ supervisor al revisar el formulario.        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Firmas Digitales                            │
│ [Trabajador] [Supervisor]                   │
└─────────────────────────────────────────────┘
```

### Características del PDF:
- ✅ Sección con fondo amarillo (#fff3cd) y borde dorado
- ✅ Título "Evaluación del Supervisor" en color dorado
- ✅ Respuesta destacada con badge de color (verde=NO, amarillo=SÍ)
- ✅ Nota explicativa en letra pequeña
- ✅ Solo aparece en PDFs de operadores (no en supervisores)
- ✅ Solo se muestra si el supervisor ya marcó la respuesta

## ⚠️ PENDIENTE

1. ✅ Actualizar PDF para mostrar la respuesta del supervisor
2. ❌ Mostrar en historial si requiere derivación
3. ❌ Agregar filtro en historial por derivación (Sí/No/Todos)

## 🧪 PRUEBAS RECOMENDADAS

1. ✅ Operador completa formulario y ve pregunta deshabilitada
2. ✅ Supervisor intenta firmar sin marcar → Error
3. ✅ Supervisor marca Sí y firma → Se guarda correctamente
4. ✅ Supervisor marca No y firma → Se guarda correctamente
5. ✅ Ver detalles después de firmar → Muestra respuesta
6. ✅ Generar PDF → Muestra respuesta del supervisor

## 📝 NOTAS IMPORTANTES

- La pregunta solo aparece en formularios de **operadores**
- Los supervisores no tienen esta pregunta en sus propios formularios
- El campo es **obligatorio** antes de firmar
- Una vez firmado, no se puede cambiar la respuesta
- La respuesta se guarda en la base de datos permanentemente
