# Instrucciones para Aplicar la Migración de Base de Datos

## Problema Resuelto
Las firmas digitales no se mostraban porque faltaban 3 columnas en la tabla `daily_forms`.

## Cambios Realizados

### 1. Archivos Actualizados
- ✅ `database/schema.sql` - Agregadas las columnas faltantes
- ✅ `public/app.js` - Corregido el mapeo de firmas de supervisor
- ✅ `database/migration_add_signature_ids.sql` - Script de migración creado

### 2. Aplicar la Migración en Supabase

**Opción A: Desde el Dashboard de Supabase (Recomendado)**

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto `yfjjprotwxgblvurknyg`
3. Ve a la sección "SQL Editor" en el menú lateral
4. Crea una nueva query
5. Copia y pega el contenido del archivo `database/migration_add_signature_ids.sql`
6. Haz clic en "Run" para ejecutar la migración
7. Verifica que aparezcan 3 filas en el resultado mostrando las nuevas columnas

**Opción B: Usando el CLI de Supabase**

```bash
# Si tienes el CLI instalado
supabase db push
```

### 3. Verificar que Funcionó

Después de ejecutar la migración, deberías ver:

```
column_name                          | data_type | is_nullable
-------------------------------------|-----------|------------
supervisor_signature_id              | bigint    | YES
operations_manager_signature_id      | bigint    | YES
ohsem_signature_id                   | bigint    | YES
```

### 4. Reiniciar el Servidor

```bash
# Detén el servidor si está corriendo (Ctrl+C)
# Luego reinicia:
node server.js
```

### 5. Probar el Sistema

1. Entra como operador y completa un formulario
2. Entra como supervisor y firma el formulario del operador
3. Entra como prevencionista (OHSEM) y abre el detalle del formulario
4. **AHORA DEBERÍAS VER LAS IMÁGENES DE LAS FIRMAS** en lugar de solo "✓ Firmado"

## ¿Qué se Arregló?

### Antes:
- ❌ Las firmas no se mostraban (solo texto "✓ Firmado")
- ❌ El código buscaba campos que no existían en la base de datos
- ❌ Las firmas de supervisor se mapeaban incorrectamente

### Después:
- ✅ Las firmas se muestran como imágenes
- ✅ La base de datos tiene los campos necesarios
- ✅ El mapeo de firmas es correcto para todos los roles

## Notas Importantes

- Las columnas son **nullable** para mantener compatibilidad con formularios antiguos
- Los formularios antiguos seguirán mostrando el nombre del firmante sin imagen
- Los formularios nuevos (después de la migración) mostrarán las imágenes de firma
- El código del servidor YA estaba guardando los IDs correctamente, solo faltaban las columnas

## ¿Necesitas Ayuda?

Si algo no funciona después de la migración, avísame y revisamos juntos.
