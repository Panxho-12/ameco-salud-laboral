# Sistema de Exportación a PDF - AMECO

## ✅ Implementación Completada

Se ha implementado un sistema profesional de generación de PDFs usando Puppeteer que crea documentos con el diseño corporativo de AMECO.

## Características del PDF

### Diseño Profesional:
- ✅ Logo y colores corporativos de AMECO (azul #004488)
- ✅ Encabezado con información del formulario
- ✅ Secciones claramente diferenciadas
- ✅ Respuestas con códigos de color (Sí/No)
- ✅ Firmas digitales con imágenes
- ✅ Pie de página con fecha y hora de generación

### Contenido Incluido:
- Información del usuario (nombre, tipo, turno, día)
- Todas las preguntas de Condiciones de Salud
- Todas las preguntas de Fatiga y Somnolencia
- Firmas digitales de todos los responsables:
  - Para Operadores: Trabajador, Supervisor, OHSEM
  - Para Supervisores: Supervisor, Jefe de Operaciones, OHSEM
- Imágenes de las firmas digitales (si existen)
- Nombres de los firmantes
- Estado de cada firma (Firmado/Pendiente)

## Cómo Usar

### 1. Acceder al Historial
- Haz clic en el botón "📚 Historial" en el header
- Selecciona el rango de fechas
- Filtra por usuario o tipo (si tienes permisos)
- Haz clic en "🔍 Buscar"

### 2. Exportar un Formulario Individual
- En la tabla de historial, encuentra el formulario que deseas exportar
- Haz clic en el botón "📄 PDF" en la columna de Acciones
- El PDF se generará y descargará automáticamente

### 3. Ver Detalle Antes de Exportar
- Haz clic en "👁️ Ver" para ver el detalle completo
- En el modal, haz clic en "📄 Exportar a PDF"
- El PDF se descargará con toda la información

### 4. Nombre del Archivo
El PDF se descarga con un nombre descriptivo:
```
AMECO_Formulario_Juan_Perez_Turno1_Dia3.pdf
```

## Permisos de Exportación

### Operadores:
- ✅ Pueden exportar solo sus propios formularios

### Supervisores:
- ✅ Pueden exportar sus propios formularios
- ✅ Pueden exportar formularios de operadores

### Jefe de Operaciones:
- ✅ Puede exportar todos los formularios

### Prevencionista (OHSEM):
- ✅ Puede exportar todos los formularios

## Ejemplo Visual del PDF

```
┌─────────────────────────────────────────────────────┐
│                      AMECO                          │
│                  SOUTH AMERICA                      │
│         Estándar de Salud en el Trabajo            │
│                                                     │
│        FORMULARIO DE SALUD LABORAL                  │
├─────────────────────────────────────────────────────┤
│  Usuario: Juan Pérez                                │
│  Tipo: Operador                                     │
│  Turno: #1 - A                                      │
│  Día: 3 de 10                                       │
│  Fecha: 16/02/2026                                  │
├─────────────────────────────────────────────────────┤
│  📋 Condiciones de Salud                            │
│                                                     │
│  ¿Se encuentra con conocimiento adecuado...?       │
│                                            [NO]     │
│                                                     │
│  ¿Padece de alguna enfermedad...?                  │
│                                            [NO]     │
├─────────────────────────────────────────────────────┤
│  😴 Fatiga y Somnolencia                            │
│                                                     │
│  ¿Ha tenido dificultades en lograr...?             │
│                                            [SÍ]     │
├─────────────────────────────────────────────────────┤
│  ✍️ Firmas Digitales                                │
│                                                     │
│  [Trabajador]    [Supervisor]    [OHSEM]           │
│  [Imagen firma]  [Imagen firma]  [Imagen firma]    │
│  Juan Pérez      Pedro López     María García      │
└─────────────────────────────────────────────────────┘
```

## Tecnología Utilizada

- **Puppeteer**: Genera PDFs de alta calidad desde HTML
- **HTML/CSS**: Diseño profesional con colores corporativos
- **Node.js**: Procesamiento en el servidor
- **Base64**: Imágenes de firmas embebidas en el PDF

## Ventajas de esta Implementación

1. ✅ **Profesional**: Diseño corporativo con logo y colores de AMECO
2. ✅ **Completo**: Incluye toda la información del formulario
3. ✅ **Seguro**: Respeta los permisos de cada usuario
4. ✅ **Automático**: Genera el PDF en segundos
5. ✅ **Portable**: Los PDFs se pueden compartir fácilmente
6. ✅ **Archivable**: Formato estándar para almacenamiento a largo plazo

## Solución de Problemas

### El PDF no se descarga:
- Verifica que el navegador permita descargas automáticas
- Revisa la consola del navegador para errores
- Asegúrate de tener conexión al servidor

### El PDF no tiene firmas:
- Verifica que los usuarios hayan firmado el formulario
- Confirma que las firmas digitales estén guardadas en la base de datos

### Error al generar PDF:
- Revisa los logs del servidor (`node server.js`)
- Verifica que Puppeteer esté instalado correctamente
- Asegúrate de tener suficiente memoria RAM

## Próximos Pasos (Opcional)

### Exportación Masiva:
- Actualmente preparado para seleccionar múltiples formularios
- Pendiente: Generar un ZIP con múltiples PDFs

### Envío por Email:
- Agregar funcionalidad para enviar PDFs por correo
- Notificar a supervisores cuando hay formularios pendientes

### Almacenamiento en la Nube:
- Guardar PDFs automáticamente en Supabase Storage
- Crear un archivo histórico permanente
