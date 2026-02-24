# 📋 Instrucciones: Prueba de Firma Masiva y Derivación

## 🎯 Objetivo
Probar las funcionalidades de:
1. Firma masiva de supervisor
2. Botón "Marcar Todos NO requiere derivación"
3. Generación de PDFs

## 📝 Pasos para la Prueba

### PASO 1: Crear Datos de Prueba

1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de: `database/crear_datos_prueba_turno_B.sql`
3. Click en "Run" o presiona Ctrl+Enter
4. Espera a que termine (verás mensajes de confirmación)

**¿Qué hace este script?**
- Crea firmas genéricas para todos los usuarios del Turno B (29 usuarios)
- Crea formularios completos del día 6 para todos los trabajadores del Turno B (26 trabajadores)
- Marca los formularios como firmados por el trabajador
- Los formularios tienen todas las respuestas en "NO" (trabajadores saludables)

### PASO 2: Probar como Supervisor

1. Inicia sesión como supervisor del Turno B:
   - Usuario: `18970956-0` (Campusano Alarcon Diego Enrique)
   - Contraseña: `Ameco@2025`

2. Deberías ver 26 formularios pendientes de firma

3. **Prueba 1: Marcar Todos NO requiere derivación**
   - Click en el botón "✓ Marcar Todos NO"
   - Verifica que todos los formularios se marquen como "NO requiere derivación"

4. **Prueba 2: Firma Masiva**
   - Click en el botón "🔥 Firmar Todos los Pendientes"
   - Verifica que todos los formularios se firmen correctamente

5. **Prueba 3: Generar PDFs**
   - Click en "Ver" en cualquier formulario
   - Click en el botón "📄 PDF"
   - Verifica que el PDF se descargue correctamente

### PASO 3: Limpiar Datos de Prueba

**IMPORTANTE: Ejecuta esto DESPUÉS de terminar las pruebas**

1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de: `database/limpiar_datos_prueba.sql`
3. Click en "Run" o presiona Ctrl+Enter
4. Espera a que termine

**¿Qué hace este script?**
- Elimina TODOS los formularios del Turno B (todos los días, no solo día 6)
- Elimina todas las firmas digitales del Turno B
- Deja la base de datos limpia para uso real

## ✅ Verificación

Después de limpiar, verifica que:
- Los usuarios del Turno B no tienen firmas digitales
- No hay formularios del Turno B en el sistema (ningún día)
- Los usuarios pueden crear sus propias firmas
- Los usuarios pueden completar sus formularios reales

## 📊 Datos del Turno B

**Total usuarios**: 29
- Supervisores: 3
- Trabajadores: 26

**Día actual**: 6 de 10
**Fecha inicio turno**: 14/02/2026
**Fecha actual**: 19/02/2026

## 🔄 Repetir Pruebas

Si necesitas repetir las pruebas:
1. Ejecuta `limpiar_datos_prueba.sql`
2. Ejecuta `crear_datos_prueba_turno_B.sql`
3. Repite las pruebas

## ⚠️ Notas Importantes

- Los datos de prueba son SOLO para el Turno B
- El Turno A no se ve afectado
- Las firmas genéricas son imágenes de 1x1 pixel (invisibles pero válidas)
- Los formularios tienen todas las respuestas en "NO"
- Después de las pruebas, SIEMPRE ejecuta el script de limpieza

## 🎓 Supervisores del Turno B

Puedes usar cualquiera de estos usuarios para probar:

1. **Campusano Alarcon Diego Enrique**
   - Usuario: `18970956-0`
   - Contraseña: `Ameco@2025`

2. **Gonzalez Rojas Cristian Andres**
   - Usuario: `17654321-0`
   - Contraseña: `Ameco@2025`

3. **Fernandez Silva Roberto Carlos**
   - Usuario: `16789012-3`
   - Contraseña: `Ameco@2025`
