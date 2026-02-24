-- ============================================
-- Crear Usuario de Prueba para Cambio de Contraseña
-- ============================================

-- Eliminar usuario de prueba si existe
DELETE FROM users WHERE username = 'test-password';

-- Crear usuario de prueba que DEBE cambiar contraseña
INSERT INTO users (username, password, name, role, shift, first_login_completed)
VALUES ('test-password', 'Ameco@2025', 'Usuario Prueba Password', 'worker', 'A', FALSE);

-- Verificar
SELECT 
    id,
    username,
    name,
    role,
    shift,
    first_login_completed,
    password_changed_at
FROM users 
WHERE username = 'test-password';

-- ============================================
-- INSTRUCCIONES DE PRUEBA
-- ============================================
-- 
-- 1. Ejecuta este script en Supabase SQL Editor
-- 2. Inicia el servidor: npm start
-- 3. Abre http://localhost:3000
-- 4. Intenta hacer login con:
--    Usuario: test-password
--    Contraseña: Ameco@2025
-- 5. Deberías ver el modal de cambio de contraseña obligatorio
-- 6. Prueba diferentes contraseñas:
--    ❌ Contraseña débil: "123456"
--    ❌ Sin mayúsculas: "password123!"
--    ❌ Sin números: "Password!"
--    ❌ Sin caracteres especiales: "Password123"
--    ❌ Misma que la actual: "Ameco@2025"
--    ✅ Contraseña válida: "MiNueva@Pass123"
-- 7. Después de cambiar, verifica en audit_logs:
--    SELECT * FROM audit_logs WHERE user_name = 'Usuario Prueba Password' ORDER BY timestamp DESC;
