# 🚨 FIX URGENTE - Alice Turno A

## PROBLEMA
Alice (16733796-1) tiene 2 turnos en la base de datos:
- ❌ shift_id 74: status='active', start_date 2026-02-19 (INCORRECTO)
- ✅ shift_id 72: status='completed', start_date 2026-02-09 (CORRECTO)

El sistema toma el turno activo (74) en vez del completado (72), por eso Alice ve "Día 1" en vez de "En Descanso".

## SOLUCIÓN
Ejecutar el script: `database/eliminar_turno_74_alice.sql`

## PASOS PARA EJECUTAR

### Opción 1: Desde Supabase Dashboard (RECOMENDADO)
1. Ir a https://supabase.com/dashboard
2. Seleccionar el proyecto AMECO
3. Ir a "SQL Editor" en el menú lateral
4. Copiar y pegar el contenido de `database/eliminar_turno_74_alice.sql`
5. Click en "Run" o presionar Ctrl+Enter
6. Verificar que el resultado muestre solo 1 turno para Alice (shift_id 72)

### Opción 2: Desde terminal con psql
```bash
psql "postgresql://[TU_CONNECTION_STRING]" -f database/eliminar_turno_74_alice.sql
```

## VERIFICACIÓN
Después de ejecutar el script:
1. Iniciar sesión como Alice (16733796-1 / Ameco@2025)
2. Debería ver el mensaje: "En Descanso - Próximo turno inicia el [fecha]"
3. NO debería ver "Día 1 de 10"

## RESULTADO ESPERADO
```
username      | name                                    | shift_id | start_date | status
--------------+-----------------------------------------+----------+------------+-----------
16733796-1    | Pizarro Lopez Alice Estefania Elizabeth | 72       | 2026-02-09 | completed
```

## NOTA TÉCNICA
El problema ocurre en `server.js` línea 117-120:
```javascript
const { data: shifts, error } = await supabase
  .from('shifts')
  .select('*')
  .eq('user_id', req.user.id)
  .eq('status', 'active')  // ← Solo busca turnos activos
  .order('created_at', { ascending: false })
  .limit(1);
```

Al eliminar el shift_id 74 (activo incorrecto), el sistema no encontrará ningún turno activo para Alice, lo cual es correcto porque está en descanso. La lógica en `server.js` línea 123-145 creará un nuevo turno solo si es necesario, pero primero verificará si está en período de descanso.

## DESPUÉS DEL FIX
- Alice verá "En Descanso" ✅
- Campusano verá "Día 6 de 10" ✅
- Sistema funcionando correctamente ✅
