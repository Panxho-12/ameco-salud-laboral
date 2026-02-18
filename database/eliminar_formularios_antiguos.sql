-- Eliminar formularios antiguos que pedían firma de prevencionista (OHSEM)
-- Estos formularios son del sistema anterior y ya no se usan

-- Ver cuántos formularios se van a eliminar
SELECT COUNT(*) as total_a_eliminar
FROM daily_forms
WHERE created_at < '2026-02-14';

-- Eliminar formularios anteriores al 14 de febrero de 2026
-- (Fecha de inicio del nuevo sistema de turnos)
DELETE FROM daily_forms
WHERE created_at < '2026-02-14';

-- Verificar que se eliminaron
SELECT COUNT(*) as total_restante
FROM daily_forms;

-- Ver los formularios que quedan
SELECT 
    df.id,
    df.day_number,
    df.created_at,
    u.name as usuario,
    u.role as rol,
    df.worker_signed,
    df.supervisor_signed
FROM daily_forms df
JOIN shifts s ON df.shift_id = s.id
JOIN users u ON s.user_id = u.id
ORDER BY df.created_at DESC;
