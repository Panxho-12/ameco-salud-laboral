-- Insertar todos los usuarios reales de AMECO
-- Contraseña universal: Ameco@2025

INSERT INTO users (id, username, password, name, role, shift) VALUES
-- JEFES DE OPERACIONES (2) - Sin turno específico
(1, '15675209-6', 'Ameco@2025', 'Portilla Pizarro Patricio Javier', 'operations_manager', NULL),
(2, '17661693-8', 'Ameco@2025', 'Zeballos Ramos Christopher Andre', 'operations_manager', NULL),

-- SUPERVISORES TURNO A (2)
(3, '18317813-K', 'Ameco@2025', 'Barraza Muñoz Juan Carlos', 'supervisor', 'A'),
(4, '15979438-5', 'Ameco@2025', 'Nilo Gonzalez Didier Andres', 'supervisor', 'A'),

-- SUPERVISORES TURNO B (2)
(5, '10457848-9', 'Ameco@2025', 'Cifuentes Gomez Victor', 'supervisor', 'B'),
(6, '17175193-4', 'Ameco@2025', 'Duran Zepeda Rodrigo Alejandro', 'supervisor', 'B'),

-- PREVENCIONISTAS OHSEM (4) - Sin turno específico
(7, '17846732-8', 'Ameco@2025', 'Alvarez Alvarez Felipe Ismael', 'ohsem', NULL),
(8, '15580584-6', 'Ameco@2025', 'Bicz Herrera Brian Gustavo', 'ohsem', NULL),
(9, '15389479-5', 'Ameco@2025', 'Carcamo Cordova Cecira Aurora', 'ohsem', NULL),
(10, '16248532-6', 'Ameco@2025', 'Lemus Olazo Karen Denise', 'ohsem', NULL),

-- OPERADORES TURNO A (18)
(11, '12576933-0', 'Ameco@2025', 'Araos Ibacache Sergio Rufino', 'worker', 'A'),
(12, '15027395-1', 'Ameco@2025', 'Astudillo Navea Claudio Alex', 'worker', 'A'),
(13, '10133158-K', 'Ameco@2025', 'Cardenas Pasten Ricardo Luis', 'worker', 'A'),
(14, '11937700-5', 'Ameco@2025', 'Cortes Andrade Victor John', 'worker', 'A'),
(15, '14586697-9', 'Ameco@2025', 'Cortes Nuñez Humberto Enrique', 'worker', 'A'),
(16, '17071941-7', 'Ameco@2025', 'Escobar Gaete Cristian Andres', 'worker', 'A'),
(17, '12802399-2', 'Ameco@2025', 'Jeldes Delgado James Jose', 'worker', 'A'),
(18, '17715271-4', 'Ameco@2025', 'Marcial Marcial Victor Alejandro', 'worker', 'A'),
(19, '9404604-1', 'Ameco@2025', 'Moraga Sanhueza Camilo Enrique', 'worker', 'A'),
(20, '11383880-9', 'Ameco@2025', 'Muñoz Rojas Rodrigo Antonio', 'worker', 'A'),
(21, '16094281-9', 'Ameco@2025', 'Opazo Fuentes Francisco Javier', 'worker', 'A'),
(22, '19698218-3', 'Ameco@2025', 'Pasten Zarate Francisco Andres', 'worker', 'A'),
(23, '14544827-1', 'Ameco@2025', 'Rojas Astorga Hernan Javier', 'worker', 'A'),
(24, '12843400-3', 'Ameco@2025', 'Rojas Castro Daniel Antonio', 'worker', 'A'),
(25, '11474301-1', 'Ameco@2025', 'Santelices Arriagada Sergio Freddy', 'worker', 'A'),
(26, '13750792-7', 'Ameco@2025', 'Tapia Arriaza Mauricio Fabian', 'worker', 'A'),
(27, '13530886-2', 'Ameco@2025', 'Ugalde Sepulveda Luis Hernán', 'worker', 'A'),
(28, '18968602-1', 'Ameco@2025', 'Veliz Godoy Alexander Ramiro', 'worker', 'A'),

-- OPERADORES TURNO B (20)
(29, '16505089-4', 'Ameco@2025', 'Araya Olivares Josue Daniel', 'worker', 'B'),
(30, '13177799-K', 'Ameco@2025', 'Berrios Torres Darwin Daniel', 'worker', 'B'),
(31, '15733736-K', 'Ameco@2025', 'Castillo Cortes Patricio Antonio', 'worker', 'B'),
(32, '11416789-4', 'Ameco@2025', 'Figueroa Soto Juan Enrique', 'worker', 'B'),
(33, '9155555-7', 'Ameco@2025', 'Flores Navarro Ruben Francisco', 'worker', 'B'),
(34, '13614948-2', 'Ameco@2025', 'Fuenzalida Hernandez Roberto Alexis', 'worker', 'B'),
(35, '13180110-6', 'Ameco@2025', 'Gomez Araya Glen Eliseo', 'worker', 'B'),
(36, '10280345-0', 'Ameco@2025', 'Guerra Figueroa Jorge Enrique', 'worker', 'B'),
(37, '14099343-3', 'Ameco@2025', 'León Muñoz Pablo Alejandro', 'worker', 'B'),
(38, '15467463-1', 'Ameco@2025', 'Maino Sepulveda Leonardo Cristobal', 'worker', 'B'),
(39, '14665853-9', 'Ameco@2025', 'Mendoza Miranda Richard Cristian', 'worker', 'B'),
(40, '15044869-7', 'Ameco@2025', 'Michea Michea Hector Alejandro', 'worker', 'B'),
(41, '13285591-9', 'Ameco@2025', 'Murillo Serey Hugo Adolfo', 'worker', 'B'),
(42, '16826395-3', 'Ameco@2025', 'Muñoz Ahumada Fernando Andres', 'worker', 'B'),
(43, '18823928-5', 'Ameco@2025', 'Pizarro Olguin Joaquin Ignacio', 'worker', 'B'),
(44, '17827726-K', 'Ameco@2025', 'Pizarro Olguin Sebastian Patricio', 'worker', 'B'),
(45, '15029143-7', 'Ameco@2025', 'Plaza Rubina Patricio Rogers', 'worker', 'B'),
(46, '17112739-4', 'Ameco@2025', 'Rojas Pizarro Angelo Antonio', 'worker', 'B'),
(47, '17368016-3', 'Ameco@2025', 'Rossel Guerra Jonnathan Alexander', 'worker', 'B'),
(48, '16613983-K', 'Ameco@2025', 'Marin Mondaca Gian Carlo', 'worker', 'B');

-- Actualizar la secuencia para que el próximo ID sea 49
SELECT setval('users_id_seq', 48, true);
