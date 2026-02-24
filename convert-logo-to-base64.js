// Script para convertir el logo AMECO a base64 y actualizar pdfTemplate.js
const fs = require('fs');
const path = require('path');

// Leer la imagen del logo
const logoPath = path.join(__dirname, 'public', 'images', 'ameco-logo.png');
console.log('Leyendo logo desde:', logoPath);

try {
    // Verificar que el archivo existe
    if (!fs.existsSync(logoPath)) {
        console.error('❌ Error: No se encontró el archivo ameco-logo.png');
        console.log('Por favor, asegúrate de que el archivo existe en: public/images/ameco-logo.png');
        process.exit(1);
    }

    // Leer la imagen y convertirla a base64
    const imageBuffer = fs.readFileSync(logoPath);
    const base64Image = imageBuffer.toString('base64');
    const base64DataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log('✅ Logo convertido a base64');
    console.log(`📊 Tamaño del archivo: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Tamaño del base64: ${(base64Image.length / 1024).toFixed(2)} KB`);

    // Leer el archivo pdfTemplate.js
    const templatePath = path.join(__dirname, 'pdfTemplate.js');
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Reemplazar el placeholder con el base64 real
    const updatedContent = templateContent.replace(
        'data:image/png;base64,LOGO_BASE64_PLACEHOLDER',
        base64DataUrl
    );

    // Verificar que se hizo el reemplazo
    if (updatedContent === templateContent) {
        console.log('⚠️  Advertencia: No se encontró el placeholder LOGO_BASE64_PLACEHOLDER');
        console.log('El archivo pdfTemplate.js puede que ya tenga el logo configurado');
    } else {
        // Guardar el archivo actualizado
        fs.writeFileSync(templatePath, updatedContent, 'utf8');
        console.log('✅ Archivo pdfTemplate.js actualizado correctamente');
        console.log('');
        console.log('🎉 ¡Listo! El logo AMECO ahora aparecerá en los PDFs generados');
        console.log('');
        console.log('Próximos pasos:');
        console.log('1. Verifica que el logo aparece correctamente generando un PDF de prueba');
        console.log('2. Haz commit de los cambios: git add pdfTemplate.js');
        console.log('3. Push a producción: git push origin main');
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
