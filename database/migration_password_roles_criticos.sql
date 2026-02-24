-- ============================================
-- MIGRACIÓN: Cambio de Contraseña para Roles Críticos
-- Solo Supervisores, Jefe de Operaciones y OHSEM
-- ============================================

-- 1. Agregar columnas para cambio de contraseña
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- 2. Marcar TODOS los usuarios como que ya completaron primer login
-- (para no molestar a nadie inicialmente)
UPDATE users 
SET first_login_completed = TRUE, 
    password_changed_at = NOW();

-- 3. Marcar SOLO roles críticos como que necesitan cambiar contraseña
UPDATE users 
SET first_login_completed = FALSE,
    password_changed_at = NULL
WHERE role IN ('supervisor', 'operations_manager', 'ohsem');

-- 4. Verificación
SELECT 
    role,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE first_login_completed = FALSE) as necesitan_cambio_password
FROM users 
GROUP BY role
ORDER BY role;

-- Resultado esperado:
-- worker: todos con first_login_completed = TRUE
-- supervisor: todos con first_login_completed = FALSE
-- operations_manager: todos con first_login_completed = FALSE
-- ohsem: todos con first_login_completed = FALSE
