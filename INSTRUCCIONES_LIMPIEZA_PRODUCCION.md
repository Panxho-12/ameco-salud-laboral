# 🧹 Limpieza Completa para Producción

## ⚠️ IMPORTANTE
Este script elimina TODOS los formularios y firmas del sistema (Turno A y Turno B). Solo ejecutar cuando estés listo para poner el sistema en producción limpio.

## 📋 ¿Qué se elimina?
- ✅ TODOS los formularios del Turno A
- ✅ TODOS los formularios del Turno B
- ✅ TODAS las firmas digitales de todos los usuarios

## 🔒 ¿Qué NO se elimina?
- ✅ Usuarios (63 usuarios se mantienen)
- ✅ Turnos activos (configuración de turnos)
- ✅ Estructura de la base de datos
- ✅ Contraseñas de usuarios

## 🚀 Cómo ejecutar

### Paso 1: Ir a Supabase
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a SQL Editor

### Paso 2: Ejecutar el script
1. Copia el contenido de: `database/limpiar_todo_para_produccion.sql`
2. Pégalo en el SQL Editor
3. Click en "Run" o presiona Ctrl+Enter
4. Espera a que termine (verás mensajes de confirmación)

### Paso 3: Verificar
El script mostrará:
- Cantidad de formularios eliminados
- Cantidad de firmas eliminadas
- Cantidad de usuarios que se mantienen
- Cantidad de turnos activos

## ✅ Después de la limpieza

El sistema estará completamente limpio y listo para que:
1. Los usuarios creen sus propias firmas digitales
2. Los trabajadores completen sus formularios diarios
3. Los supervisores firmen los formularios
4. Los prevencionistas revisen derivaciones

## 📊 Estado después de la limpieza

- **Usuarios**: 63 (61 originales + 2 supervisores nuevos)
- **Turno A**: 34 usuarios
- **Turno B**: 29 usuarios
- **Formularios**: 0
- **Firmas**: 0
- **Turnos activos**: 63 (uno por usuario)

## 🔄 Si necesitas volver a probar

Si después de limpiar necesitas crear datos de prueba nuevamente:
1. Ejecuta `database/crear_datos_prueba_turno_B.sql`
2. Prueba las funcionalidades
3. Ejecuta `database/limpiar_datos_prueba.sql` (solo limpia Turno B)

O ejecuta `database/limpiar_todo_para_produccion.sql` para limpiar todo de nuevo.

## 📝 Notas

- Este script es seguro, no elimina usuarios ni turnos
- Puedes ejecutarlo múltiples veces sin problemas
- Los usuarios mantendrán sus contraseñas
- La configuración de turnos 10x10 se mantiene intacta

## 🎯 Fecha actual del sistema

- **Fecha**: 19/02/2026 (jueves)
- **Turno A**: Día 16 (descanso), próximo turno 24/02/2026
- **Turno B**: Día 6 (trabajando), descanso empieza 24/02/2026
