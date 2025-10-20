CREATE DATABASE IF NOT EXISTS finance_manager;
USE finance_manager;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fch_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo ENUM('ingreso', 'gasto') NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50) DEFAULT 'category',
    usuario_id INT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de transacciones
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('ingreso', 'gasto') NOT NULL,
    descripcion TEXT,
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    categoria_id INT NOT NULL,
    usuario_id INT NOT NULL,  
    FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Tabla de presupuestos
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estado BOOLEAN DEFAULT TRUE,
    nombre TEXT NOT NULL,
    periodo ENUM('semanal', 'mensual', 'anual') DEFAULT 'mensual',
    inicio DATE NOT NULL,
    fin DATE NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    categoria_id INT NOT NULL,
    usuario_id INT NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de metas (ahorros u objetivos financieros)
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,                     -- Ej: "Nuevo celular", "Vacaciones"
    descripcion TEXT,                                 -- Opcional: detalles del objetivo
    monto_objetivo DECIMAL(10, 2) NOT NULL,           -- Cuánto se quiere alcanzar
    monto_actual DECIMAL(10, 2) DEFAULT 0.00,         -- Cuánto lleva acumulado
    estado ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
    fecha_inicio DATE DEFAULT (CURRENT_DATE),
    fecha_meta DATE,                                  -- Fecha esperada para cumplirlo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,                          -- Usuario propietario
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE goal_contributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

ALTER TABLE goal_contributions ADD COLUMN nro_contribution INT NOT NULL;

ALTER TABLE goal_contributions 
ADD UNIQUE INDEX idx_goal_contrib (goal_id, nro_contribution);




-- Insertar categorías predeterminadas
INSERT INTO categories (nombre, descripcion, tipo, color, icon, is_default) VALUES
-- Categorías de gastos
('Alimentación', 'Gastos en comida y bebidas', 'gasto', '#ff6b6b', 'restaurant', TRUE),
('Transporte', 'Gastos en transporte público, combustible, etc.', 'gasto', '#4ecdc4', 'directions_car', TRUE),
('Vivienda', 'Alquiler, servicios, mantenimiento del hogar', 'gasto', '#45b7d1', 'home', TRUE),
('Entretenimiento', 'Cine, salidas, hobbies', 'gasto', '#96ceb4', 'movie', TRUE),
('Salud', 'Medicamentos, consultas médicas', 'gasto', '#feca57', 'local_hospital', TRUE),
('Otros gastos', 'Gastos varios no categorizados', 'gasto', '#6c757d', 'category', TRUE),

-- Categorías de ingresos
('Salario', 'Ingresos por trabajo', 'ingreso', '#54a0ff', 'work', TRUE),
('Freelance', 'Trabajos independientes', 'ingreso', '#5f27cd', 'computer', TRUE),
('Otros ingresos', 'Ingresos varios', 'ingreso', '#2ed573', 'attach_money', TRUE);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_transactions_user_date ON transactions(usuario_id, fecha);
CREATE INDEX idx_transactions_category ON transactions(categoria_id);
CREATE INDEX idx_budgets_user_active ON budgets(usuario_id, estado);
CREATE INDEX idx_categories_user_type ON categories(usuario_id, tipo);