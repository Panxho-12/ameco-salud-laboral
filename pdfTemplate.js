// PDF Template Generator for AMECO Health Forms
// Generates professional HTML for PDF conversion

function generateFormPDF(formData) {
    const {
        user_name,
        user_role,
        shift_number,
        day_number,
        created_at,
        user_shift,
        form_data,
        signatures,
        worker_signed,
        supervisor_signed,
        operations_manager_signed,
        ohsem_signed,
        supervisor_signature,
        operations_manager_signature,
        ohsem_signature,
        supervisor_requires_derivation,
        supervisor_derivation_note,
        derivation_reviewed,
        derivation_reviewed_by,
        derivation_reviewed_at,
        derivation_review_notes
    } = formData;

    const roleText = user_role === 'worker' ? 'Operador' : 'Supervisor';
    const date = new Date(created_at).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Question texts mapping
    const questionTexts = {
        'q11': '&iquest;Se encuentra usted con conocimiento adecuado y capacidad para realizar las tareas asignadas?',
        'q12': '&iquest;Padece de alguna enfermedad o molestia f&iacute;sica?',
        'q13': '&iquest;Presenta factores externos que le impidan estar concentrado?',
        'q30': '&iquest;Qu&eacute; ha sufrido hay alg&uacute;n accidente con lesi&oacute;n?',
        'f1': '&iquest;Ha tenido dificultades en lograr un descanso reparador?',
        'f2': '&iquest;Presenta alg&uacute;n s&iacute;ntoma que dificulte su buen dormir?',
        'f3': '&iquest;Sufre de insomnio &uacute;ltimamente?',
        'f4': '&iquest;Durmi&oacute; menos tiempo del necesario durante su &uacute;ltimo per&iacute;odo de sue&ntilde;o?',
        'f5': '&iquest;Est&aacute; consumiendo alg&uacute;n medicamento que provoque o cause somnolencia?',
        'f6': '&iquest;Padece alguna enfermedad que produzca cansancio o somnolencia?',
        'f7': '&iquest;Existen factores externos que afecten la calidad de su sue&ntilde;o?',
        'f8': '&iquest;Ha presentado eventos importantes de somnolencia?'
    };

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            padding: 12px;
            background: white;
            color: #333;
            font-size: 10px;
        }
        
        .header {
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: 2px solid #004488;
            padding-bottom: 8px;
            margin-bottom: 12px;
            text-align: center;
        }
        
        .logo-container {
            margin-bottom: 8px;
        }
        
        .header-content {
            width: 100%;
        }
        
        .title {
            font-size: 13px;
            color: #004488;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .subtitle {
            font-size: 12px;
            color: #004488;
            font-weight: bold;
        }
        
        .info-section {
            background: #f8f9fa;
            padding: 6px 10px;
            border-radius: 3px;
            margin-bottom: 10px;
            border-left: 2px solid #004488;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 9.5px;
        }
        
        .info-label {
            font-weight: bold;
            color: #004488;
        }
        
        .info-value {
            color: #333;
        }
        
        .section {
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        
        .section-title {
            background: #004488;
            color: white;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 3px;
            margin-bottom: 6px;
        }
        
        .question-item {
            background: white;
            border: 1px solid #dee2e6;
            padding: 5px 8px;
            margin-bottom: 4px;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .question-text {
            flex: 1;
            color: #333;
            font-size: 9px;
        }
        
        .answer {
            padding: 3px 12px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 9px;
            min-width: 38px;
            text-align: center;
        }
        
        .answer-yes {
            background: #d4edda;
            color: #155724;
            border: 1px solid #28a745;
        }
        
        .answer-no {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #dc3545;
        }
        
        .signatures-section {
            margin-top: 12px;
            page-break-inside: avoid;
        }
        
        .signatures-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 8px;
        }
        
        .signature-box {
            border: 1px solid #004488;
            border-radius: 3px;
            padding: 6px;
            text-align: center;
            background: #f8f9fa;
        }
        
        .signature-label {
            font-weight: bold;
            color: #004488;
            margin-bottom: 4px;
            font-size: 10px;
        }
        
        .signature-image {
            max-width: 100%;
            max-height: 40px;
            margin: 4px 0;
            border: 1px solid #dee2e6;
            background: white;
            padding: 2px;
        }
        
        .signature-name {
            font-size: 8px;
            color: #666;
            margin-top: 3px;
        }
        
        .signature-status {
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 8px;
            font-weight: bold;
            display: inline-block;
            margin-top: 3px;
        }
        
        .status-signed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background: #f8d7da;
            color: #721c24;
        }
        
        @media print {
            body {
                padding: 10px;
            }
            
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            <img src="data:image/png;base64,LOGO_BASE64_PLACEHOLDER" style="max-width: 200px; height: auto;" alt="AMECO Logo">
        </div>
        <div class="header-content">
            <div class="title">Estándar de Salud en el Trabajo</div>
            <div class="subtitle">FORMULARIO DE SALUD LABORAL</div>
        </div>
    </div>
    
    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Usuario:</span>
            <span class="info-value">${user_name}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tipo:</span>
            <span class="info-value">${roleText}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Turno:</span>
            <span class="info-value">${user_shift || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">D&iacute;a:</span>
            <span class="info-value">${day_number} de 10</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${date}</span>
        </div>
    </div>
    
    ${form_data.conditions ? `
    <div class="section">
        <div class="section-title">Condiciones de Salud</div>
        ${Object.entries(form_data.conditions).map(([key, value]) => {
            const questionText = questionTexts[key];
            if (!questionText) return '';
            const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
            const answerText = value === 'si' ? 'SÍ' : 'NO';
            return `
                <div class="question-item">
                    <div class="question-text">${questionText}</div>
                    <div class="answer ${answerClass}">${answerText}</div>
                </div>
            `;
        }).join('')}
    </div>
    ` : ''}
    
    ${form_data.fatigue ? `
    <div class="section">
        <div class="section-title">Fatiga y Somnolencia</div>
        ${Object.entries(form_data.fatigue).map(([key, value]) => {
            const questionText = questionTexts[key];
            if (!questionText) return '';
            const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
            const answerText = value === 'si' ? 'SÍ' : 'NO';
            return `
                <div class="question-item">
                    <div class="question-text">${questionText}</div>
                    <div class="answer ${answerClass}">${answerText}</div>
                </div>
            `;
        }).join('')}
    </div>
    ` : ''}
    
    ${user_role === 'worker' && supervisor_requires_derivation ? `
    <div class="section">
        <div class="section-title">Evaluaci&oacute;n del Supervisor</div>
        <div class="question-item">
            <div class="question-text" style="font-weight: bold;">&iquest;Requiere Derivaci&oacute;n?</div>
            <div class="answer ${supervisor_requires_derivation === 'si' ? 'answer-yes' : 'answer-no'}">
                ${supervisor_requires_derivation === 'si' ? 'SÍ' : 'NO'}
            </div>
        </div>
        ${supervisor_derivation_note ? `
            <div style="background: #f8f9fa; padding: 6px; border-radius: 3px; margin-top: 5px; border: 1px solid #dee2e6;">
                <div style="font-size: 8px; font-weight: bold; color: #004488; margin-bottom: 3px;">Nota del Supervisor:</div>
                <div style="font-size: 8px; color: #333;">${supervisor_derivation_note}</div>
            </div>
        ` : ''}
        <div style="font-size: 8px; color: #666; margin-top: 3px; padding: 3px;">
            <em>Evaluaci&oacute;n realizada por el supervisor.</em>
        </div>
    </div>
    ` : ''}
    
    ${user_role === 'worker' && supervisor_requires_derivation === 'si' && derivation_reviewed ? `
    <div class="section">
        <div class="section-title" style="background: #28a745;">✓ Revisi&oacute;n del Prevencionista</div>
        <div style="background: #d4edda; padding: 8px; border-radius: 3px; border: 1px solid #28a745;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div style="font-size: 8px;">
                    <strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">✓ Caso Revisado</span>
                </div>
            </div>
            <div style="font-size: 8px; margin-bottom: 3px;">
                <strong>Revisado por:</strong> ${derivation_reviewed_by || 'N/A'}
            </div>
            <div style="font-size: 8px; margin-bottom: 5px;">
                <strong>Fecha:</strong> ${derivation_reviewed_at ? new Date(derivation_reviewed_at).toLocaleString('es-CL') : 'N/A'}
            </div>
            ${derivation_review_notes ? `
                <div style="background: white; padding: 6px; border-radius: 3px; margin-top: 5px; border: 1px solid #28a745;">
                    <div style="font-size: 8px; font-weight: bold; color: #155724; margin-bottom: 3px;">Notas de Revisi&oacute;n:</div>
                    <div style="font-size: 8px; color: #333;">${derivation_review_notes}</div>
                </div>
            ` : ''}
        </div>
        <div style="font-size: 7px; color: #666; margin-top: 3px; padding: 3px;">
            <em>Revisi&oacute;n realizada por el profesional OHSEM (Prevencionista).</em>
        </div>
    </div>
    ` : ''}
    
    <div class="signatures-section">
        <div class="section-title">Firmas Digitales</div>
        <div class="signatures-grid">
            ${user_role === 'worker' ? `
                <div class="signature-box">
                    <div class="signature-label">Trabajador</div>
                    ${signatures?.worker_signature ? 
                        `<img src="${signatures.worker_signature}" class="signature-image" alt="Firma Trabajador">` :
                        `<div class="signature-status ${worker_signed ? 'status-signed' : 'status-pending'}">
                            ${worker_signed ? '✓ Firmado' : '⏳ Pendiente'}
                        </div>`
                    }
                    <div class="signature-name">${user_name}</div>
                </div>
                
                <div class="signature-box">
                    <div class="signature-label">Supervisor</div>
                    ${signatures?.supervisor_signature ? 
                        `<img src="${signatures.supervisor_signature}" class="signature-image" alt="Firma Supervisor">` :
                        `<div class="signature-status ${supervisor_signed ? 'status-signed' : 'status-pending'}">
                            ${supervisor_signed ? '✓ Firmado' : '⏳ Pendiente'}
                        </div>`
                    }
                    <div class="signature-name">${signatures?.supervisor_name || supervisor_signature || 'Pendiente'}</div>
                </div>
            ` : `
                <div class="signature-box">
                    <div class="signature-label">Supervisor</div>
                    ${signatures?.supervisor_signature ? 
                        `<img src="${signatures.supervisor_signature}" class="signature-image" alt="Firma Supervisor">` :
                        `<div class="signature-status ${supervisor_signed ? 'status-signed' : 'status-pending'}">
                            ${supervisor_signed ? '✓ Firmado' : '⏳ Pendiente'}
                        </div>`
                    }
                    <div class="signature-name">${user_name}</div>
                </div>
                
                <div class="signature-box">
                    <div class="signature-label">Jefe de Operaciones</div>
                    ${signatures?.operations_manager_signature ? 
                        `<img src="${signatures.operations_manager_signature}" class="signature-image" alt="Firma Jefe Operaciones">` :
                        `<div class="signature-status ${operations_manager_signed ? 'status-signed' : 'status-pending'}">
                            ${operations_manager_signed ? '✓ Firmado' : '⏳ Pendiente'}
                        </div>`
                    }
                    <div class="signature-name">${signatures?.operations_manager_name || operations_manager_signature || 'Pendiente'}</div>
                </div>
            `}
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = { generateFormPDF };
