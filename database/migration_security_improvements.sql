-- ============================================
-- MIGRACIÓN: Mejoras de Seguridad y Funcionalidad
-- Fecha: 2026-02-24
-- ============================================

-- 1. Agregar columnas para cambio de contraseña obligatorio
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Crear índice para búsquedas de email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action_type VARCHAR(100) NOT NULL,
    action_details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_role ON audit_logs(user_role);

-- Comentarios
COMMENT ON TABLE audit_logs IS 'Registro inmutable de auditoría de todas las acciones importantes del sistema';
COMMENT ON COLUMN audit_logs.action_type IS 'Tipo de acción: login_success, login_failed, logout, worker_sign, supervisor_sign, derivation_marked, password_changed, pdf_generated';
COMMENT ON COLUMN audit_logs.action_details IS 'Detalles adicionales de la acción en formato JSON';

-- 3. Marcar usuarios existentes como que ya completaron primer login
-- (para que no se les pida cambiar contraseña a usuarios actuales)
UPDATE users 
SET first_login_completed = TRUE, 
    password_changed_at = NOW()
WHERE first_login_completed IS NULL OR first_login_completed = FALSE;

-- 4. Verificación
SELECT 'Migración completada exitosamente' AS status;
SELECT COUNT(*) AS total_users, 
       COUNT(*) FILTER (WHERE first_login_completed = TRUE) AS users_with_password_changed
FROM users;
