-- AMECO Health Forms Database Schema for Supabase
-- Sistema de Salud Laboral - Turnos 10x10

-- ============================================
-- TABLA: users
-- Almacena todos los usuarios del sistema
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL, -- RUT sin puntos, con guión
    password VARCHAR(255) NOT NULL, -- Contraseña (en producción usar hash)
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('worker', 'supervisor', 'operations_manager', 'ohsem')),
    shift VARCHAR(1) CHECK (shift IN ('A', 'B') OR shift IS NULL), -- NULL para operations_manager y ohsem
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_shift ON users(shift);

-- ============================================
-- TABLA: digital_signatures
-- Almacena las firmas digitales de los usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS digital_signatures (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signature_data TEXT NOT NULL, -- Base64 image data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Un usuario solo puede tener una firma
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_signatures_user_id ON digital_signatures(user_id);

-- ============================================
-- TABLA: shifts
-- Almacena los turnos de trabajo (ciclos de 10 días)
-- ============================================
CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_number INTEGER NOT NULL, -- Número de turno (1, 2, 3, etc.)
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Fecha de inicio del turno (día 1)
    supervisor_signature VARCHAR(255), -- Nombre del supervisor que firmó
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_shifts_user_id ON shifts(user_id);
CREATE INDEX idx_shifts_status ON shifts(status);

-- ============================================
-- TABLA: daily_forms
-- Almacena los formularios diarios completados
-- ============================================
CREATE TABLE IF NOT EXISTS daily_forms (
    id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 10),
    form_data JSONB NOT NULL, -- Almacena todas las respuestas del formulario
    
    -- Firmas y estados
    worker_signed BOOLEAN DEFAULT FALSE,
    supervisor_signed BOOLEAN DEFAULT FALSE,
    supervisor_signature VARCHAR(255),
    supervisor_signature_id BIGINT REFERENCES users(id),
    signed_at TIMESTAMP WITH TIME ZONE,
    
    operations_manager_signed BOOLEAN DEFAULT FALSE,
    operations_manager_signature VARCHAR(255),
    operations_manager_signature_id BIGINT REFERENCES users(id),
    operations_manager_signed_at TIMESTAMP WITH TIME ZONE,
    
    ohsem_signed BOOLEAN DEFAULT FALSE,
    ohsem_signature VARCHAR(255),
    ohsem_signature_id BIGINT REFERENCES users(id),
    ohsem_signed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Un usuario solo puede tener un formulario por día en un turno
    UNIQUE(shift_id, day_number)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_daily_forms_shift_id ON daily_forms(shift_id);
CREATE INDEX idx_daily_forms_day_number ON daily_forms(day_number);
CREATE INDEX idx_daily_forms_worker_signed ON daily_forms(worker_signed);
CREATE INDEX idx_daily_forms_supervisor_signed ON daily_forms(supervisor_signed);
CREATE INDEX idx_daily_forms_ohsem_signed ON daily_forms(ohsem_signed);
CREATE INDEX idx_daily_forms_created_at ON daily_forms(created_at);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signatures_updated_at BEFORE UPDATE ON digital_signatures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_forms_updated_at BEFORE UPDATE ON daily_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS EN LAS TABLAS
-- ============================================
COMMENT ON TABLE users IS 'Usuarios del sistema AMECO (operadores, supervisores, jefes, OHSEM)';
COMMENT ON TABLE digital_signatures IS 'Firmas digitales de los usuarios (base64)';
COMMENT ON TABLE shifts IS 'Turnos de trabajo de 10 días';
COMMENT ON TABLE daily_forms IS 'Formularios diarios de salud completados por los usuarios';

COMMENT ON COLUMN users.shift IS 'Turno A o B. NULL para operations_manager y ohsem (pueden ver ambos turnos)';
COMMENT ON COLUMN daily_forms.form_data IS 'JSON con todas las respuestas del formulario (condiciones de salud y fatiga)';
