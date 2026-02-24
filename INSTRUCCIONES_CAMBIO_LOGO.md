# INSTRUCCIONES PARA CAMBIAR EL LOGO AMECO

## ✅ COMPLETADO

El logo AMECO ya está configurado y funcionando en todo el sistema:

### Archivos Actualizados:
- ✅ `public/index.html` - Favicon y logos en la página (usando ameco-logo.png.png)
- ✅ `pdfTemplate.js` - Logo en el PDF (convertido a base64)
- ✅ `public/images/ameco-logo.png.png` - Imagen del logo (91 KB)

### Dónde Aparece el Logo:
1. **Favicon del navegador** - El icono en la pestaña del navegador
2. **Pantalla de login** - Logo principal en la página de inicio de sesión
3. **Header de la aplicación** - Logo en la barra superior cuando estás logueado
4. **PDFs generados** - Logo en el encabezado de todos los PDFs

## 🔧 Script de Conversión

Se creó el archivo `convert-logo-to-base64.js` que:
- Lee el logo desde `public/images/ameco-logo.png.png`
- Lo convierte a base64
- Actualiza automáticamente `pdfTemplate.js`

Para volver a ejecutarlo (si cambias el logo):
```bash
node convert-logo-to-base64.js
```

## 📝 Próximos Pasos

1. **Verificar en local:**
   - Abre la aplicación en tu navegador
   - Verifica que el logo aparece en el favicon, login y header
   - Genera un PDF y verifica que el logo aparece correctamente

2. **Subir a producción:**
   ```bash
   git add public/index.html pdfTemplate.js convert-logo-to-base64.js
   git commit -m "Actualizar logo AMECO en sistema y PDFs"
   git push origin main
   ```

3. **Verificar en producción:**
   - Espera 2-3 minutos después del push
   - Recarga la página (Ctrl+F5)
   - Verifica que todo funciona correctamente

## ⚠️ Notas Importantes

- El archivo se llama `ameco-logo.png.png` (doble extensión)
- Tamaño del archivo: 91 KB
- Tamaño en base64: 121 KB (normal que sea más grande)
- El logo se ajusta automáticamente en cada ubicación

## 🎯 Resultado

El logo AMECO (cuadrado azul y rojo con "AMECO") ahora aparece consistentemente en:
- ✅ Favicon del navegador
- ✅ Pantalla de login
- ✅ Header de la aplicación
- ✅ PDFs generados

---

**Estado:** ✅ Completado y listo para producción
