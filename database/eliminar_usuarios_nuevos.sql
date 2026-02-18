-- Eliminar los usuarios que se agregaron con contraseña incorrecta
DELETE FROM users 
WHERE username IN (
  '8926751-K', '18501941-1', '13329070-2', '22867274-2', '19240429-0', '10414898-0',
  '20203059-9', '13875971-7', '15909800-1', '19948897-K', '17212700-2', '18985919-8',
  '10152982-7'
);

-- Verificar que se eliminaron
SELECT COUNT(*) as usuarios_eliminados FROM users 
WHERE username IN (
  '8926751-K', '18501941-1', '13329070-2', '22867274-2', '19240429-0', '10414898-0',
  '20203059-9', '13875971-7', '15909800-1', '19948897-K', '17212700-2', '18985919-8',
  '10152982-7'
);
