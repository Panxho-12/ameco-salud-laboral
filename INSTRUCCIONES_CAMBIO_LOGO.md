# INSTRUCCIONES PARA CAMBIAR EL LOGO AMECO

## 📋 Pasos a Seguir

### 1. Guardar la Imagen del Logo
1. Guarda la imagen del logo AMECO (la que me mostraste) como `ameco-logo.png`
2. Colócala en la carpeta: `public/images/ameco-logo.png`

### 2. Verificar los Cambios
Los siguientes archivos ya fueron actualizados para usar el nuevo logo:

✅ `public/index.html` - Favicon y logos en la página
✅ `pdfTemplate.js` - Logo en el PDF (pendiente de imagen base64)

### 3. Actualizar el Logo en el PDF

Para que el logo aparezca en el PDF, necesitas convertir la imagen a base64:

#### Opción A: Usando Node.js (Recomendado)
```javascript
const fs = require('fs');
const path = require('path');

// Leer la imagen y convertirla a base64
const imagePath = path.join(__dirname, 'public', 'images', 'ameco-logo.png');
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');

console.log('data:image/png;base64,' + base64Image);
```

#### Opción B: Usando herramienta online
1. Ve a: https://www.base64-image.de/
2. Sube `ameco-logo.png`
3. Copia el resultado que empieza con `data:image/png;base64,...`

### 4. Reemplazar el Placeholder en pdfTemplate.js

Busca en `pdfTemplate.js` la línea:
```html
<img src="data:image/png;base64,LOGO_BASE64_PLACEHOLDER" ...>
```

Reemplaza `LOGO_BASE64_PLACEHOLDER` con el string base64 completo.

### 5. Hacer Commit y Push
```bash
git add public/images/ameco-logo.png public/index.html pdfTemplate.js
git commit -m "Actualizar logo AMECO en sistema y PDFs"
git push origin main
```

### 6. Verificar en Producción
Después de 2-3 minutos:
1. Recargar la página (Ctrl+F5)
2. Verificar que el nuevo logo aparece en:
   - Favicon del navegador
   - Pantalla de login
   - Header de la aplicación
3. Generar un PDF y verificar que el logo aparece correctamente

## 📝 Archivos Modificados

- `public/index.html` - Referencias al logo actualizadas
- `pdfTemplate.js` - Template del PDF actualizado (pendiente base64)
- `public/images/ameco-logo.png` - Nueva imagen (pendiente de agregar)

## ⚠️ Notas Importantes

- La imagen debe ser PNG para mejor calidad
- Tamaño recomendado: 400x200px o similar (proporción 2:1)
- El logo se ajustará automáticamente en el PDF
- NO se modificó la estructura de la página ni del PDF, solo las referencias a la imagen

## 🎯 Resultado Esperado

Después de completar estos pasos:
- ✅ Favicon del navegador mostrará el nuevo logo
- ✅ Pantalla de login mostrará el nuevo logo
- ✅ Header de la aplicación mostrará el nuevo logo
- ✅ PDFs generados mostrarán el nuevo logo en el encabezado

---

**¿Necesitas ayuda?** Si tienes problemas con la conversión a base64, avísame y te ayudo.
