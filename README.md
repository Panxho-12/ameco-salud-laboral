# AMECO - Sistema de Formularios de Salud Laboral

Sistema web para digitalizar los formularios de "Estándar de Salud en el Trabajo" de AMECO, diseñado para turnos de trabajo 10x10.

## Características

- **Sistema de turnos 10x10**: Cada trabajador completa formularios durante 10 días consecutivos
- **Dos formularios digitales**:
  - Registro de Denuncia por Condición de Salud del Trabajador
  - Cuestionario Breve de Detección de Fatiga y Somnolencia
- **Autenticación**: Login para 30 trabajadores + 4 supervisores
- **Persistencia de datos**: Los datos se van acumulando día a día
- **Firmas digitales**: Sistema de firmas de supervisores
- **Responsive**: Funciona en desktop, tablet y móvil

## Tecnologías

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: JWT

## Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos (Supabase)

1. Crear cuenta gratuita en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a Settings > Database y copiar la connection string
4. Ejecutar el script SQL en `database/schema.sql` en el SQL Editor de Supabase

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```env
DATABASE_URL=tu_connection_string_de_supabase
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=3000
```

### 4. Ejecutar la aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Usuarios por defecto

Todos los usuarios tienen contraseña: `123456`

### Supervisores:
- supervisor1 (Juan Pérez)
- supervisor2 (María García)  
- supervisor3 (Carlos López)
- supervisor4 (Ana Martínez)

### Trabajadores:
- trabajador01 (Roberto Silva)
- trabajador02 (Luis Rodríguez)
- ... hasta trabajador30

## Flujo de trabajo

### Sistema de Turnos 10x10

El sistema utiliza turnos rotativos:
- **Turno A**: 10 días trabajo, 10 días descanso
- **Turno B**: 10 días trabajo, 10 días descanso (alterna con Turno A)

**Ejemplo actual (17/02/2026):**
- Turno B: En faena (día 4), empezó 14/02, termina 23/02
- Turno A: En descanso, próximo turno empieza 24/02

### Flujo diario

1. **Login**: El trabajador ingresa con sus credenciales
2. **Verificación de turno**: 
   - Si está en período de trabajo (días 1-10): Accede a formularios
   - Si está en período de descanso (días 11-20): Ve mensaje de descanso
3. **Completar día**: El trabajador llena los formularios del día actual
4. **Progreso**: Los días anteriores aparecen pre-cargados y bloqueados
5. **Firmas secuenciales**: 
   - Trabajador → Supervisor → OHSEM (para operadores)
   - Supervisor → Jefe de Operaciones → OHSEM (para supervisores)
6. **Nuevo turno**: Al día 21, se crea automáticamente un nuevo turno

Ver [INSTRUCCIONES_TURNOS.md](INSTRUCCIONES_TURNOS.md) para más detalles.

## Estructura de la base de datos

- `users`: Trabajadores y supervisores
- `shifts`: Turnos de 10 días por trabajador
- `daily_forms`: Formularios diarios con respuestas en formato JSON

## Despliegue gratuito

### Opción 1: Vercel
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Opción 2: Netlify
1. Build command: `npm run build` (si es necesario)
2. Publish directory: `public`
3. Configurar variables de entorno

## Desarrollo

El proyecto está estructurado para ser simple y mantenible:

- `/public`: Frontend estático
- `/database`: Scripts SQL
- `server.js`: API backend
- `package.json`: Dependencias y scripts

## Soporte

Para estudiantes en práctica - todos los recursos utilizados son gratuitos:
- Supabase: 500MB gratis
- Vercel/Netlify: Hosting gratuito
- Node.js: Open source