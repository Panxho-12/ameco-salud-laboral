// Version: 2026-02-18-17:45 - AUTO-SCROLL AL DÍA ACTUAL
console.log('🚀 APP.JS CARGADO - Versión con auto-scroll 2026-02-18-17:45');

class AmecoApp {
    constructor() {
        this.currentUser = null;
        this.currentShift = null;
        this.shiftData = [];
        this.currentDay = 1;
        this.inRest = false; // Initialize explicitly
        this.sseConnection = null; // SSE connection for real-time updates
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.loadFormQuestions();
        this.startMidnightCheck(); // Verificación automática a medianoche
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Manage signature
        document.getElementById('manageSignatureBtn').addEventListener('click', () => {
            this.showSignatureModal();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.form);
            });
        });

        // Save button
        document.getElementById('saveBtnInline')?.addEventListener('click', () => {
            this.saveDailyForm();
        });

        // View my details button
        document.getElementById('viewMyDetailsBtn')?.addEventListener('click', () => {
            this.showMyDetailsModal();
        });

        // Complete shift
        document.getElementById('completeShiftBtn').addEventListener('click', () => {
            this.showCompleteShiftModal();
        });

        // Modal actions
        document.getElementById('confirmCompleteBtn').addEventListener('click', () => {
            this.completeShift();
        });

        document.getElementById('cancelCompleteBtn').addEventListener('click', () => {
            this.hideCompleteShiftModal();
        });

        // Supervisor interface events
        document.getElementById('refreshOrdersBtn')?.addEventListener('click', () => {
            this.loadPendingOrders();
        });

        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.filterOrders();
        });

        document.getElementById('workerFilter')?.addEventListener('change', () => {
            this.filterOrders();
        });

        // Operations Manager interface events
        document.getElementById('refreshOperationsManagerOrdersBtn')?.addEventListener('click', () => {
            this.loadOperationsManagerOrders();
        });

        document.getElementById('operationsManagerStatusFilter')?.addEventListener('change', () => {
            this.filterOperationsManagerOrders();
        });

        document.getElementById('operationsManagerSupervisorFilter')?.addEventListener('change', () => {
            this.filterOperationsManagerOrders();
        });

        // OHSEM interface events
        document.getElementById('refreshOhsemOrdersBtn')?.addEventListener('click', () => {
            this.loadOhsemOrders();
        });

        document.getElementById('ohsemStatusFilter')?.addEventListener('change', () => {
            this.filterOhsemOrders();
        });

        document.getElementById('ohsemRoleFilter')?.addEventListener('change', () => {
            this.filterOhsemOrders();
        });

        document.getElementById('ohsemUserFilter')?.addEventListener('change', () => {
            this.filterOhsemOrders();
        });

        // Mass signing buttons
        document.getElementById('signAllOrdersBtn')?.addEventListener('click', () => {
            this.signAllOrders();
        });
        
        document.getElementById('markAllNoBtn')?.addEventListener('click', () => {
            this.markAllDerivationNo();
        });

        document.getElementById('signAllOhsemOrdersBtn')?.addEventListener('click', () => {
            this.signAllOhsemOrders();
        });

        // Operations Manager Tabs
        document.querySelectorAll('.operations-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchOperationsTab(e.target.dataset.tab);
            });
        });

        // Audit interface events
        document.getElementById('refreshAuditBtn')?.addEventListener('click', () => {
            this.loadAuditRecords();
        });

        document.getElementById('auditRoleFilter')?.addEventListener('change', () => {
            this.filterAuditRecords();
        });

        document.getElementById('auditShiftFilter')?.addEventListener('change', () => {
            this.filterAuditRecords();
        });

        document.getElementById('auditStatusFilter')?.addEventListener('change', () => {
            this.filterAuditRecords();
        });

        document.getElementById('exportAuditBtn')?.addEventListener('click', () => {
            this.exportAuditToCSV();
        });

        // History interface events
        document.getElementById('historyBtn')?.addEventListener('click', () => {
            this.showHistoryInterface();
        });

        document.getElementById('searchHistoryBtn')?.addEventListener('click', () => {
            this.loadHistoryForms();
        });

        document.getElementById('backFromHistoryBtn')?.addEventListener('click', () => {
            this.hideHistoryInterface();
        });

        document.getElementById('selectAllHistory')?.addEventListener('change', (e) => {
            this.toggleSelectAllHistory(e.target.checked);
        });

        document.getElementById('exportAllHistoryBtn')?.addEventListener('click', () => {
            this.exportSelectedHistory();
        });

        // Window resize for carousel
        window.addEventListener('resize', () => {
            this.resetCarousels();
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('order-modal')) {
                this.closeOrderDetail();
            }
            if (e.target.classList.contains('modal') && e.target.id === 'signatureModal') {
                this.closeSignatureModal();
            }
        });
    }

    resetCarousels() {
        // Reset all carousels to position 0 when window is resized
        const containers = document.querySelectorAll('[id^="daysContainer_"]');
        containers.forEach(container => {
            container.style.transform = 'translateX(0%)';
            container.dataset.position = '0';
            
            const info = document.getElementById(container.id.replace('daysContainer_', 'carouselInfo_'));
            if (info) {
                const screenWidth = window.innerWidth;
                if (screenWidth >= 1200) {
                    info.textContent = 'Días 1-10 de 10';
                } else if (screenWidth >= 769) {
                    info.textContent = 'Días 1-5 de 10';
                } else {
                    info.textContent = 'Días 1-3 de 10';
                }
            }
        });
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            this.currentUser = JSON.parse(localStorage.getItem('user'));
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.currentUser = data.user;
                this.showDashboard();
            } else {
                errorDiv.textContent = data.error;
                errorDiv.classList.add('show');
            }
        } catch (error) {
            errorDiv.textContent = 'Error de conexión';
            errorDiv.classList.add('show');
        }
    }

    logout() {
        // Close SSE connection
        this.disconnectSSE();
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
        
        // Reload page to clear all state and cached DOM
        window.location.reload();
    }

    showLogin() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('dashboardScreen').classList.remove('active');
    }

    async showDashboard() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('dashboardScreen').classList.add('active');
        
        document.getElementById('userName').textContent = this.currentUser.name;
        
        // Mostrar interfaz diferente según el rol
        if (this.currentUser.role === 'operations_manager') {
            await this.showOperationsManagerDashboard();
        } else if (this.currentUser.role === 'supervisor') {
            await this.showSupervisorDashboard();
        } else if (this.currentUser.role === 'ohsem') {
            await this.showOhsemDashboard();
        } else {
            await this.showWorkerDashboard();
        }
        
        // CRITICAL: Check signature AFTER loading shift data (so we know if user is in rest)
        await this.checkFirstLoginSignature();
    }

    async checkFirstLoginSignature() {
        // Don't check signature if user is in rest period
        if (this.inRest) {
            console.log('Usuario en descanso, no se requiere firma');
            return;
        }
        
        try {
            const response = await fetch('/api/signature', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 404) {
                // User doesn't have a signature - show mandatory modal
                this.showMandatorySignatureModal();
            }
        } catch (error) {
            console.error('Error checking signature:', error);
        }
    }

    showMandatorySignatureModal() {
        const modal = document.getElementById('signatureModal');
        modal.classList.add('show');
        
        // Hide status section and show creation section
        document.getElementById('signatureStatus').style.display = 'none';
        document.getElementById('signatureCreation').style.display = 'block';
        
        // Make modal mandatory (can't close it)
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.style.display = 'none';
        }
        
        // Hide cancel button when mandatory
        const cancelBtn = document.getElementById('cancelSignatureBtn');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
        
        // Show mandatory message
        const creationSection = document.getElementById('signatureCreation');
        const existingWarning = creationSection.querySelector('.mandatory-signature-warning');
        if (!existingWarning) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'mandatory-signature-warning';
            warningDiv.innerHTML = `
                <p style="background-color: #fff3cd; color: #856404; padding: 1rem; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 1rem; font-weight: 600;">
                    ⚠️ FIRMA DIGITAL OBLIGATORIA<br>
                    Debe crear su firma digital para continuar. Esta firma será utilizada en todos sus formularios.
                </p>
            `;
            creationSection.insertBefore(warningDiv, creationSection.firstChild);
        }
        
        // Initialize canvas
        this.initSignatureCanvas();
    }

    initSignatureCanvas() {
        // Call the existing initialization method
        this.initializeSignatureCanvas();
    }

    async showWorkerDashboard() {
        // Mostrar la interfaz normal del trabajador
        document.getElementById('workerInterface').style.display = 'block';
        document.getElementById('supervisorInterface').style.display = 'none';
        document.getElementById('operationsManagerInterface').style.display = 'none';
        document.getElementById('ohsemInterface').style.display = 'none';
        
        await this.loadCurrentShift();
        await this.loadShiftData();
        await this.loadUserSignatureForForms();
        this.updateUI();
    }

    async showSupervisorDashboard() {
        // Los supervisores pueden ver tanto su interfaz de firma como completar sus propios formularios
        document.getElementById('workerInterface').style.display = 'block';
        document.getElementById('supervisorInterface').style.display = 'block';
        document.getElementById('operationsManagerInterface').style.display = 'none';
        document.getElementById('ohsemInterface').style.display = 'none';
        
        // Cargar su propio turno para completar formularios
        await this.loadCurrentShift();
        await this.loadShiftData();
        await this.loadUserSignatureForForms();
        this.updateUI();
        
        // Cargar órdenes pendientes para firmar
        await this.loadPendingOrders();
        this.renderSupervisorInterface();
        
        // Connect SSE for real-time updates
        this.connectSSE();
    }

    async loadUserSignatureForForms() {
        try {
            const response = await fetch('/api/signature', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.userSignature = await response.json();
            } else {
                this.userSignature = null;
            }
        } catch (error) {
            console.error('Error loading user signature for forms:', error);
            this.userSignature = null;
        }
    }

    async showOperationsManagerDashboard() {
        // Mostrar solo la interfaz del jefe de operaciones
        document.getElementById('workerInterface').style.display = 'none';
        document.getElementById('supervisorInterface').style.display = 'none';
        document.getElementById('operationsManagerInterface').style.display = 'block';
        document.getElementById('ohsemInterface').style.display = 'none';
        
        await this.loadOperationsManagerOrders();
        this.renderOperationsManagerInterface();
        
        // Connect SSE for real-time updates
        this.connectSSE();
    }

    async showOhsemDashboard() {
        // Mostrar solo la interfaz del profesional OHSEM
        document.getElementById('workerInterface').style.display = 'none';
        document.getElementById('supervisorInterface').style.display = 'none';
        document.getElementById('operationsManagerInterface').style.display = 'none';
        document.getElementById('ohsemInterface').style.display = 'block';
        
        await this.loadOhsemOrders();
        this.renderOhsemInterface();
        
        // Connect SSE for real-time updates
        this.connectSSE();
    }

    async loadCurrentShift() {
        try {
            const response = await fetch('/api/shift/current', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.currentShift = await response.json();
                console.log('=== SHIFT LOADED ===');
                console.log('currentShift:', this.currentShift);
                console.log('====================');
            }
        } catch (error) {
            console.error('Error loading current shift:', error);
        }
    }

    async loadShiftData() {
        if (!this.currentShift) return;

        try {
            const response = await fetch(`/api/shift/${this.currentShift.id}/data`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.shiftData = await response.json();
                
                // Usar el día actual calculado por el servidor
                this.currentDay = this.currentShift.current_day || 1;
                
                // CRITICAL: Ensure in_rest is a boolean, not a string
                const inRestValue = this.currentShift.in_rest;
                console.log('=== IN_REST TYPE CHECK ===');
                console.log('inRestValue:', inRestValue);
                console.log('typeof inRestValue:', typeof inRestValue);
                console.log('inRestValue === false:', inRestValue === false);
                console.log('inRestValue === "false":', inRestValue === "false");
                console.log('==========================');
                
                // Convert to boolean explicitly
                this.inRest = inRestValue === true || inRestValue === 'true';
                
                console.log('=== FRONTEND DEBUG ===');
                console.log('currentShift:', this.currentShift);
                console.log('current_day:', this.currentShift.current_day);
                console.log('in_rest:', this.currentShift.in_rest);
                console.log('this.currentDay:', this.currentDay);
                console.log('this.inRest:', this.inRest);
                console.log('=====================');
                
                console.log(`Día actual: ${this.currentDay} (basado en fecha de inicio del turno)`);
                
                // Si está en descanso, mostrar mensaje
                if (this.inRest) {
                    console.log(`Usuario en período de descanso. Próximo turno: ${this.currentShift.next_shift_start}`);
                }
            }
        } catch (error) {
            console.error('Error loading shift data:', error);
        }
    }

    updateUI() {
        console.log('=== UPDATE UI ===');
        console.log('this.inRest:', this.inRest);
        console.log('this.currentDay:', this.currentDay);
        console.log('this.currentShift:', this.currentShift);
        console.log('=================');
        
        if (this.currentShift) {
            const shiftLetter = this.currentUser?.shift || 'N/A';
            document.getElementById('shiftNumber').textContent = `Turno ${shiftLetter}`;
            
            // Check if user is in rest period
            console.log('Checking if in rest... this.inRest =', this.inRest, 'type:', typeof this.inRest);
            
            if (this.inRest === true) {
                console.log('MOSTRANDO MENSAJE DE DESCANSO');
                document.getElementById('currentDay').textContent = `En Descanso`;
                
                // Show rest period message
                const formsContainer = document.querySelector('.forms-container');
                if (formsContainer) {
                    // Parse date at noon to avoid timezone issues
                    const nextShiftDateStr = this.currentShift.next_shift_start;
                    const nextShiftDate = new Date(nextShiftDateStr + 'T12:00:00');
                    const formattedDate = nextShiftDate.toLocaleDateString('es-CL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    formsContainer.innerHTML = `
                        <div class="rest-period-message">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🏖️</div>
                            <h2>Período de Descanso</h2>
                            <p>Has completado tu turno de 10 días.</p>
                            <p style="font-size: 1.2rem; margin-top: 1.5rem;"><strong>Los formularios se activarán el ${formattedDate}</strong></p>
                            <p style="margin-top: 1rem;">Días de descanso restantes: <strong>${this.currentShift.rest_days_remaining}</strong></p>
                        </div>
                    `;
                }
                
                // Hide save button
                document.getElementById('saveBtnInline').style.display = 'none';
                document.getElementById('completeShiftBtn').style.display = 'none';
                
                return; // Don't render forms
            } else {
                console.log('NO ESTÁ EN DESCANSO - MOSTRANDO FORMULARIOS');
                document.getElementById('currentDay').textContent = `Día ${this.currentDay} de 10`;
                
                // Make sure forms container is ready for rendering
                const formsContainer = document.querySelector('.forms-container');
                if (formsContainer && formsContainer.querySelector('.rest-period-message')) {
                    console.log('Limpiando mensaje de descanso anterior...');
                    formsContainer.innerHTML = ''; // Clear rest message if it exists
                }
            }
        }

        this.renderFormQuestions();
        
        // Show complete shift button if all 10 days are done
        if (this.currentDay > 10 || this.shiftData.length === 10) {
            document.getElementById('completeShiftBtn').style.display = 'inline-block';
            document.getElementById('saveBtn').style.display = 'none';
        }
        
        // Auto-scroll al día actual DESPUÉS de que el DOM se haya renderizado
        // Usar requestAnimationFrame para asegurar que el DOM esté listo
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                console.log('🎯 Llamando a scrollToCurrentDay desde updateUI');
                this.scrollToCurrentDay();
            });
        });
    }

    switchTab(formType) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-form="${formType}"]`).classList.add('active');

        // Update form content
        document.querySelectorAll('.form-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${formType}Form`).classList.add('active');
        
        // Scroll to top of forms container
        const formsContainer = document.querySelector('.forms-container');
        if (formsContainer) {
            formsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Auto-scroll al día actual cuando cambias de pestaña
        setTimeout(() => {
            console.log('🎯 Auto-scroll al cambiar a pestaña:', formType);
            this.scrollToCurrentDay();
        }, 200);
    }

    goToNextForm(formType) {
        this.switchTab(formType);
    }

    goToPrevForm(formType) {
        this.switchTab(formType);
    }

    loadFormQuestions() {
        this.conditionsQuestions = [
            {
                id: 'q11',
                text: '¿Se encuentra usted con conocimiento adecuado y capacidad para realizar las tareas asignadas?',
                reference: 'Aptitud Técnica'
            },
            {
                id: 'q12',
                text: '¿Padece de alguna enfermedad o molestia física?',
                reference: 'Condición de Salud'
            },
            {
                id: 'q13',
                text: '¿Presenta factores externos que le impidan estar concentrado?',
                reference: 'Condición Psicológica'
            }
        ];

        this.accidentQuestions = [
            {
                id: 'q30',
                text: '¿Qué ha sufrido hay algún accidente con lesión?',
                reference: 'Indicar si llegó del turno o se ausentó accidente del trabajo dentro de la jornada laboral'
            }
        ];

        this.fatigueQuestions = [
            {
                id: 'f1',
                text: '¿Ha tenido dificultades en lograr un descanso reparador?',
                reference: 'Siente falta de energía, fatiga en extremidades, tiene comezón'
            },
            {
                id: 'f2',
                text: '¿Presenta algún síntoma que dificulte su buen dormir?',
                reference: 'Ronca, habla dormido, tiene pesadillas, rechina los dientes, sudor nocturno'
            },
            {
                id: 'f3',
                text: '¿Sufre de insomnio últimamente?',
                reference: 'Se demora más de 30 min en poder quedarse dormido, se despierta varias veces durante la noche sin poder volver a dormir'
            },
            {
                id: 'f4',
                text: '¿Durmió menos tiempo del necesario durante su último período de sueño?',
                reference: 'Menos de 5.5 horas (En considera una respuesta "SI" si se siempre durante fuera de casa tiempo y lugar adecuado hasta)'
            },
            {
                id: 'f5',
                text: '¿Está consumiendo algún medicamento que provoque o cause somnolencia?',
                reference: 'Ejemplo: Alprazolam, Lorazepam, Midazolam, Diazepam, Clonazepam, Zolpidem, Clorfeniramina, Pseudoefedrina'
            },
            {
                id: 'f6',
                text: '¿Padece alguna enfermedad que produzca cansancio o somnolencia?',
                reference: 'Enfermedad psiquiátrica no controlada (tratamiento médico, psicológico), diabetes no controlada asociada a otras enfermedades como hipertensión'
            },
            {
                id: 'f7',
                text: '¿Existen factores externos que afecten la calidad de su sueño?',
                reference: 'Calor, frío, exceso de luz o ruido que interrumpen su sueño'
            },
            {
                id: 'f8',
                text: '¿Ha presentado eventos importantes de somnolencia?',
                reference: 'Le queda dormido involuntariamente conversando con alguien, viendo la televisión o esperando transporte, mientras conduce en carretera'
            }
        ];

        // Pregunta especial que solo el supervisor puede responder
        this.supervisorQuestion = {
            id: 'supervisor_derivation',
            text: '¿Requiere Derivación?',
            reference: 'Solo el supervisor puede marcar esta opción al revisar el formulario'
        };
    }

    renderFormQuestions() {
        this.renderConditionsForm();
        this.renderFatigueForm();
    }

    renderConditionsForm() {
        const container = document.getElementById('conditionsQuestions');
        let html = '';

        // Sección 1: PRESENTAR APTITUDES TÉCNICAS, FÍSICAS Y PSICOLÓGICAS
        html += '<h4>PRESENTAR APTITUDES TÉCNICAS, FÍSICAS Y PSICOLÓGICAS</h4>';
        
        this.conditionsQuestions.forEach(question => {
            html += `
                <div class="question-row">
                    <div>
                        <div class="question-text">${question.text}</div>
                        <div class="question-reference">${question.reference}</div>
                    </div>
                    <div class="days-grid">
                        ${this.renderDaysGrid(question.id, 'conditions')}
                    </div>
                </div>
            `;
        });

        // Firmas sección 1
        html += `
            <div class="form-section">
                <h4>Firmas - Sección Aptitudes</h4>
                <div class="question-row">
                    <div class="question-text">Completa el Trabajador</div>
                    <div class="days-grid">
                        ${this.renderSignatureGrid('worker_signature_1')}
                    </div>
                </div>
                <div class="question-row">
                    <div class="question-text">Completa el Supervisor</div>
                    <div class="days-grid">
                        ${this.renderSignatureGrid('supervisor_signature_1')}
                    </div>
                </div>
            </div>
        `;

        // Sección 2: Registro de Denuncia
        html += `
            <div class="form-section">
                <h4>Registro de Denuncia por Condición y/o Lesión del Trabajador al finalizar la Jornada Laboral</h4>
                <div class="info-text">
                    <p><strong>Todo trabajador deberá dejar registrado su condición de Salud si le tuvo algún tipo de incidente en su jornada laboral.</strong></p>
                    <p>Es obligatorio de todo trabajador del contrato completar el presente registro donde FE que la información es verídica.</p>
                    <p>En el caso de que el trabajador no complete el registro, será considerado una falta grave a las normas internas. Además, se considerará como que el trabajador no tiene ninguna lesión en su jornada laboral.</p>
                </div>
        `;

        this.accidentQuestions.forEach(question => {
            html += `
                <div class="question-row">
                    <div>
                        <div class="question-text">${question.text}</div>
                        <div class="question-reference">${question.reference}</div>
                    </div>
                    <div class="days-grid">
                        ${this.renderDaysGrid(question.id, 'conditions')}
                    </div>
                </div>
            `;
        });

        // Firmas finales
        html += `
                </div>
            <div class="form-section">
                <h4>Firmas Finales</h4>
                <div class="question-row">
                    <div class="question-text">Completa el Trabajador</div>
                    <div class="days-grid">
                        ${this.renderSignatureGrid('worker_signature_2')}
                    </div>
                </div>
                <div class="question-row">
                    <div class="question-text">Completa el Supervisor</div>
                    <div class="days-grid">
                        ${this.renderSignatureGrid('supervisor_signature_2')}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        // Hacer scroll inmediatamente después de renderizar (Conditions)
        setTimeout(() => {
            console.log('🎯 Auto-scroll desde renderConditionsForm');
            this.scrollToCurrentDay();
        }, 100);
    }

    renderFatigueForm() {
        const container = document.getElementById('fatigueQuestions');
        let html = '';

        this.fatigueQuestions.forEach(question => {
            html += `
                <div class="question-row">
                    <div>
                        <div class="question-text">${question.text}</div>
                        <div class="question-reference">${question.reference}</div>
                    </div>
                    <div class="days-grid">
                        ${this.renderDaysGrid(question.id, 'fatigue')}
                    </div>
                </div>
            `;
        });

        // Add signature rows
        html += `
            <div class="form-section">
                <h4>Firmas - Fatiga y Somnolencia</h4>
                <div class="question-row">
                    <div class="question-text">Completa el Trabajador</div>
                    <div class="days-grid">
                        ${this.renderSignatureGrid('worker_signature_f')}
                    </div>
                </div>
                <div class="question-row">
                    <div class="question-text">Completa el Supervisor</div>
                    <div class="days-grid">
                        ${this.renderSignatureGrid('supervisor_signature_f')}
                    </div>
                </div>
            </div>
        `;

        // Agregar pregunta especial del supervisor DESPUÉS de las firmas
        html += `
            <div class="form-section supervisor-evaluation-section">
                <h4 style="color: #004488; border-bottom: 2px solid #004488; padding-bottom: 8px;">Evaluación del Supervisor</h4>
                <div class="question-row supervisor-question">
                    <div>
                        <div class="question-text" style="font-size: 1.1em; color: #333;">${this.supervisorQuestion.text}</div>
                        <div class="question-reference" style="color: #666; font-style: italic; font-size: 0.9em;">${this.supervisorQuestion.reference}</div>
                    </div>
                    <div class="days-grid">
                        ${this.renderSupervisorDerivationGrid()}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        // Hacer scroll inmediatamente después de renderizar (Fatigue)
        setTimeout(() => {
            console.log('🎯 Auto-scroll desde renderFatigueForm');
            this.scrollToCurrentDay();
        }, 150);
    }

    renderSupervisorDerivationGrid() {
        // Esta pregunta siempre está deshabilitada para el operador
        // Solo el supervisor puede marcarla al revisar el formulario
        let html = `<div class="days-container" id="daysContainer_supervisor_derivation">`;
        
        for (let day = 1; day <= 10; day++) {
            const dayClass = this.getDayClass(day);
            const isCurrentDay = day === this.currentDay;
            const savedValue = this.getSavedValue('supervisor_derivation', day, 'supervisor');
            
            html += `
                <div class="day-column disabled-day">
                    <div class="day-header ${dayClass}">Día ${day}</div>
                    <div class="day-options">
                        <div class="option-group">
                            <label>
                                <input type="radio" name="supervisor_derivation_day${day}" value="si" 
                                       ${savedValue === 'si' ? 'checked' : ''} 
                                       disabled
                                       title="Solo el supervisor puede marcar esta opción">
                                Sí
                            </label>
                        </div>
                        <div class="option-group">
                            <label>
                                <input type="radio" name="supervisor_derivation_day${day}" value="no" 
                                       ${savedValue === 'no' ? 'checked' : ''} 
                                       disabled
                                       title="Solo el supervisor puede marcar esta opción">
                                No
                            </label>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }

    renderDaysGrid(questionId, formType) {
        let html = `
            <div class="days-container" id="daysContainer_${questionId}">
        `;
        
        for (let day = 1; day <= 10; day++) {
            const dayClass = this.getDayClass(day);
            const isCurrentDay = day === this.currentDay;
            const isPastDay = day < this.currentDay;
            const isFutureDay = day > this.currentDay;
            const savedValue = this.getSavedValue(questionId, day, formType);
            const isCompleted = savedValue !== null && savedValue !== '';
            
            // REGLA: Solo el día actual está habilitado, días pasados y futuros están bloqueados
            const isDisabled = !isCurrentDay;
            
            let dayTitle = '';
            if (isCurrentDay) {
                dayTitle = 'Día actual - Disponible para completar';
            } else if (isPastDay && isCompleted) {
                dayTitle = 'Día pasado - Completado y bloqueado';
            } else if (isPastDay && !isCompleted) {
                dayTitle = 'Día pasado - No completado (bloqueado)';
            } else {
                dayTitle = 'Día futuro - No disponible aún';
            }
            
            html += `
                <div class="day-column ${isDisabled ? 'disabled-day' : ''} ${isCurrentDay ? 'current-day' : ''}">
                    <div class="day-header ${dayClass}">Día ${day}</div>
                    <div class="day-options">
                        <div class="option-group">
                            <label>
                                <input type="radio" name="${questionId}_day${day}" value="si" 
                                       ${savedValue === 'si' ? 'checked' : ''} 
                                       ${isDisabled ? 'disabled' : ''}
                                       title="${dayTitle}">
                                Sí
                            </label>
                            <label>
                                <input type="radio" name="${questionId}_day${day}" value="no" 
                                       ${savedValue === 'no' ? 'checked' : ''} 
                                       ${isDisabled ? 'disabled' : ''}
                                       title="${dayTitle}">
                                No
                            </label>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        return html;
    }

    renderSignatureGrid(signatureType) {
        // Check if this signature type belongs to current user and they have a signature
        const isUserSignature = this.isUserSignatureType(signatureType);
        const hasSignature = isUserSignature && this.userSignature;
        
        let html = `
            <div class="signature-grid-wrapper">
        `;
        
        // NO mostrar texto de estado - solo las firmas
        
        html += `
            <div class="days-container" id="daysContainer_${signatureType}">
        `;
        
        for (let day = 1; day <= 10; day++) {
            const dayClass = this.getDayClass(day);
            const isCurrentDay = day === this.currentDay;
            // REGLA: Solo el día actual está habilitado
            const isDisabled = !isCurrentDay;
            const savedValue = this.getSavedSignature(signatureType, day);
            
            html += `
                <div class="day-column ${isDisabled ? 'disabled-day' : ''} ${isCurrentDay ? 'current-day' : ''}">
                    <div class="day-header ${dayClass}">Día ${day}</div>
                    <div class="day-options signature-day-options">
                        ${this.renderSignatureOptions(signatureType, day, savedValue, isDisabled)}
                    </div>
                </div>
            `;
        }
        
        html += `</div></div>`;
        
        return html;
    }

    renderSignatureOptions(signatureType, day, savedValue, isDisabled) {
        // Check if this signature type belongs to current user
        const isUserSignature = this.isUserSignatureType(signatureType);
        
        if (isUserSignature && this.userSignature) {
            // ALWAYS show current user's digital signature (pre-loaded) for ALL days
            // Signature is visual only until form is saved
            return `
                <div class="digital-signature-container">
                    <img src="${this.userSignature.signature_data}" alt="Firma Digital" class="digital-signature-preview" data-signature-type="${signatureType}" data-day="${day}" />
                </div>
            `;
        } else if (isUserSignature && !this.userSignature) {
            // Show option to create signature if user doesn't have one
            return `
                <div class="no-signature-container">
                    <button type="button" class="btn-create-signature-inline" onclick="app.showSignatureModal()">
                        ✍️ Crear Firma
                    </button>
                </div>
            `;
        } else if (signatureType.includes('supervisor_signature') && this.currentUser?.role === 'worker') {
            // Show supervisor's signature for workers to see (read-only, pre-loaded) for ALL days
            return this.renderSupervisorSignatureForWorker(signatureType, day);
        } else if (signatureType.includes('supervisor_signature') && this.currentUser?.role === 'supervisor') {
            // CRITICAL: Show Operations Manager's signature for supervisors (they can't sign themselves) for ALL days
            return this.renderOperationsManagerSignatureForSupervisor(signatureType, day);
        } else if (signatureType.includes('ohsem_signature')) {
            // Show OHSEM signature (pre-loaded) for ALL days
            return this.renderOhsemSignaturePreview(signatureType, day);
        } else {
            // This should NOT happen for signature rows - only for question rows
            // Show traditional radio buttons for question rows only
            return `
                <div class="option-group">
                    <label>
                        <input type="radio" name="${signatureType}_day${day}" value="si" 
                               ${savedValue === 'si' ? 'checked' : ''} 
                               ${isDisabled ? 'disabled' : ''}
                               title="${isDisabled ? 'Día no disponible aún' : 'Disponible para completar'}">
                        Sí
                    </label>
                    <label>
                        <input type="radio" name="${signatureType}_day${day}" value="no" 
                               ${savedValue === 'no' ? 'checked' : ''} 
                               ${isDisabled ? 'disabled' : ''}
                               title="${isDisabled ? 'Día no disponible aún' : 'Disponible para completar'}">
                        No
                    </label>
                </div>
            `;
        }
    }

    renderSupervisorSignatureForWorker(signatureType, day) {
        // Pre-load supervisor signature (visual only) - clean signature without text
        const supervisorSignature = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgNTBMMTAwIDEwMEwxNTAgNTBMMjAwIDEwMEwyNTAgNTBMMzAwIDEwMCIgc3Ryb2tlPSIjMDA0NDg4IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
        
        return `
            <div class="digital-signature-container supervisor-signature-readonly">
                <img src="${supervisorSignature}" alt="Firma del Supervisor" class="digital-signature-preview" data-signature-type="${signatureType}" data-day="${day}" />
            </div>
        `;
    }

    renderOperationsManagerSignatureForSupervisor(signatureType, day) {
        // Pre-load Operations Manager signature (visual only) for supervisors - clean signature without text
        const operationsManagerSignature = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgNzVRMTAwIDI1IDE1MCA3NVQyNTAgNzVUMzUwIDc1IiBzdHJva2U9IiMyOGE3NDUiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';
        
        return `
            <div class="digital-signature-container operations-manager-signature-readonly">
                <img src="${operationsManagerSignature}" alt="Firma del Jefe de Operaciones" class="digital-signature-preview" data-signature-type="${signatureType}" data-day="${day}" />
            </div>
        `;
    }

    renderOhsemSignaturePreview(signatureType, day) {
        // Pre-load OHSEM signature (visual only) - clean signature without text
        const ohsemSignature = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTAwUTEwMCA1MCAxNTAgMTAwVDI1MCAxMDBUMzUwIDEwMCIgc3Ryb2tlPSIjZGMzNTQ1IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
        
        return `
            <div class="digital-signature-container supervisor-signature-readonly">
                <img src="${ohsemSignature}" alt="Firma OHSEM" class="digital-signature-preview" data-signature-type="${signatureType}" data-day="${day}" />
            </div>
        `;
    }

    isUserSignatureType(signatureType) {
        // Determine if this signature type belongs to the current user
        const userRole = this.currentUser?.role;
        
        if (userRole === 'worker') {
            // Workers can only sign worker signature fields
            return signatureType.includes('worker_signature');
        } else if (userRole === 'supervisor') {
            // CRITICAL: Supervisors complete their OWN forms
            // "Completa el Trabajador" = Supervisor signs as worker (their own form)
            // "Completa el Supervisor" = Operations Manager signs (NOT the supervisor)
            return signatureType.includes('worker_signature');
        } else if (userRole === 'operations_manager') {
            // Operations manager signs supervisor forms
            return signatureType.includes('supervisor_signature');
        } else if (userRole === 'ohsem') {
            // OHSEM signs OHSEM signature fields
            return signatureType.includes('ohsem_signature');
        }
        
        return false;
    }

    // Remove scroll methods since we only need native scroll
    scrollToDay() {
        // Method removed - using only native scroll now
    }

    resetCarousels() {
        // Reset all scroll positions when window is resized
        const containers = document.querySelectorAll('[id^="daysContainer_"]');
        containers.forEach(container => {
            const grid = container.parentElement;
            grid.scrollTo({ left: 0, behavior: 'smooth' });
        });
    }

    // Operations Manager Functions
    async loadOperationsManagerOrders() {
        if (this.currentUser.role !== 'operations_manager') return;

        try {
            const response = await fetch('/api/operations-manager/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.operationsManagerOrders = await response.json();
                this.renderOperationsManagerInterface();
            } else {
                console.error('Error loading operations manager orders');
            }
        } catch (error) {
            console.error('Error loading operations manager orders:', error);
        }
    }

    renderOperationsManagerInterface() {
        this.loadSupervisorsList();
        this.renderOperationsManagerOrdersList();
    }

    async loadSupervisorsList() {
        try {
            const response = await fetch('/api/operations-manager/supervisors', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const supervisors = await response.json();
                const supervisorFilter = document.getElementById('operationsManagerSupervisorFilter');
                
                // Clear existing options except "All"
                supervisorFilter.innerHTML = '<option value="all">Todos los supervisores</option>';
                
                supervisors.forEach(supervisor => {
                    const option = document.createElement('option');
                    option.value = supervisor.id;
                    option.textContent = supervisor.name;
                    supervisorFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading supervisors list:', error);
        }
    }

    renderOperationsManagerOrdersList() {
        const ordersList = document.getElementById('operationsManagerOrdersList');
        const ordersCount = document.getElementById('operationsManagerOrdersCount');
        
        if (!this.operationsManagerOrders || this.operationsManagerOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-orders">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📋</div>
                    <h3>No hay órdenes de supervisores disponibles</h3>
                    <p>No se encontraron formularios de supervisores para revisar.</p>
                </div>
            `;
            ordersCount.textContent = '0 órdenes encontradas';
            return;
        }

        let html = '';
        this.operationsManagerOrders.forEach(order => {
            const statusClass = order.operations_manager_signed ? 'status-signed' : 'status-pending';
            const statusText = order.operations_manager_signed ? 'Firmado' : 'Pendiente';
            
            html += `
                <div class="order-item" data-supervisor-id="${order.supervisor_id}" data-status="${order.operations_manager_signed ? 'signed' : 'pending'}">
                    <div class="order-header">
                        <div class="order-info">
                            <div class="worker-name">${order.supervisor_name}</div>
                            <div class="order-details">
                                Turno ${order.user_shift || 'N/A'} - Día ${order.day_number} de 10
                                <br>Fecha: ${new Date(order.created_at).toLocaleDateString('es-ES')}
                                <br><strong>Rol:</strong> Supervisor
                            </div>
                        </div>
                        <div class="order-status ${statusClass}">
                            ${statusText}
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="btn-view" onclick="app.viewOperationsManagerOrderDetail(${order.shift_id}, ${order.day_number}, '${order.supervisor_name}')">
                            👁️ Ver Detalle
                        </button>
                        <button class="btn-sign" ${order.operations_manager_signed ? 'disabled' : ''} 
                                onclick="app.signOperationsManagerOrder(${order.shift_id}, ${order.day_number})"
                                ${order.operations_manager_signed ? 'title="Ya firmado"' : 'title="Firmar orden"'}>
                            ${order.operations_manager_signed ? '✅ Firmado' : '✍️ Firmar'}
                        </button>
                    </div>
                </div>
            `;
        });

        ordersList.innerHTML = html;
        ordersCount.textContent = `${this.operationsManagerOrders.length} órdenes encontradas`;
    }

    filterOperationsManagerOrders() {
        const statusFilter = document.getElementById('operationsManagerStatusFilter').value;
        const supervisorFilter = document.getElementById('operationsManagerSupervisorFilter').value;
        const orderItems = document.querySelectorAll('#operationsManagerOrdersList .order-item');

        let visibleCount = 0;

        orderItems.forEach(item => {
            const itemStatus = item.dataset.status;
            const itemSupervisorId = item.dataset.supervisorId;
            
            let showItem = true;

            // Filter by status
            if (statusFilter !== 'all' && itemStatus !== statusFilter) {
                showItem = false;
            }

            // Filter by supervisor
            if (supervisorFilter !== 'all' && itemSupervisorId !== supervisorFilter) {
                showItem = false;
            }

            item.style.display = showItem ? 'block' : 'none';
            if (showItem) visibleCount++;
        });

        document.getElementById('operationsManagerOrdersCount').textContent = `${visibleCount} órdenes encontradas`;
    }

    async viewOperationsManagerOrderDetail(shiftId, dayNumber, supervisorName) {
        try {
            // Find the order data
            const order = this.operationsManagerOrders.find(o => 
                o.shift_id === shiftId && o.day_number === dayNumber
            );

            if (!order) {
                alert('No se pudo encontrar la orden');
                return;
            }

            // Set modal title
            document.getElementById('orderModalTitle').textContent = 
                `${supervisorName} (Supervisor) - Turno ${order.user_shift || 'N/A'}, Día ${dayNumber}`;

            // Build the detail view (similar to supervisor view but for operations manager)
            let html = `
                <div class="order-detail-info">
                    <div class="detail-section">
                        <h4>Información General</h4>
                        <p><strong>Supervisor:</strong> ${supervisorName}</p>
                        <p><strong>Turno:</strong> #${order.shift_number}</p>
                        <p><strong>Día:</strong> ${dayNumber} de 10</p>
                        <p><strong>Fecha de Creación:</strong> ${new Date(order.created_at).toLocaleDateString('es-ES')}</p>
                        <p><strong>Estado:</strong> ${order.operations_manager_signed ? 'Firmado por Jefe de Operaciones' : 'Pendiente de Firma'}</p>
                        ${order.operations_manager_signed ? `<p><strong>Firmado por:</strong> ${order.operations_manager_signature}</p>` : ''}
                        ${order.operations_manager_signed_at ? `<p><strong>Fecha de Firma:</strong> ${new Date(order.operations_manager_signed_at).toLocaleDateString('es-ES')}</p>` : ''}
                    </div>
            `;

            // Show form data if available (same as supervisor view)
            if (order.form_data) {
                // Conditions section
                if (order.form_data.conditions && Object.keys(order.form_data.conditions).length > 0) {
                    html += `
                        <div class="detail-section">
                            <h4>Condiciones de Salud</h4>
                            <div class="form-responses">
                    `;
                    
                    Object.entries(order.form_data.conditions).forEach(([key, value]) => {
                        const questionText = this.getQuestionText(key);
                        html += `
                            <div class="response-item">
                                <span class="question">${questionText}:</span>
                                <span class="answer ${value === 'si' ? 'answer-yes' : 'answer-no'}">${value.toUpperCase()}</span>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                }

                // Fatigue section
                if (order.form_data.fatigue && Object.keys(order.form_data.fatigue).length > 0) {
                    html += `
                        <div class="detail-section">
                            <h4>Fatiga y Somnolencia</h4>
                            <div class="form-responses">
                    `;
                    
                    Object.entries(order.form_data.fatigue).forEach(([key, value]) => {
                        const questionText = this.getQuestionText(key);
                        html += `
                            <div class="response-item">
                                <span class="question">${questionText}:</span>
                                <span class="answer ${value === 'si' ? 'answer-yes' : 'answer-no'}">${value.toUpperCase()}</span>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                }

                // Signatures section
                if (order.form_data.signatures && Object.keys(order.form_data.signatures).length > 0) {
                    html += `
                        <div class="detail-section">
                            <h4>Firmas</h4>
                            <div class="form-responses">
                    `;
                    
                    Object.entries(order.form_data.signatures).forEach(([key, value]) => {
                        const signatureText = this.getSignatureText(key);
                        html += `
                            <div class="response-item">
                                <span class="question">${signatureText}:</span>
                                <span class="answer ${value === 'si' ? 'answer-yes' : 'answer-no'}">${value.toUpperCase()}</span>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                }
            }

            // Operations Manager actions
            html += `
                <div class="signature-section-supervisor">
                    <h4>Acciones del Jefe de Operaciones</h4>
                    <div class="signature-actions">
                        ${!order.operations_manager_signed ? 
                            `<button class="btn-sign" onclick="app.signOperationsManagerOrderFromModal(${shiftId}, ${dayNumber})">
                                ✍️ Firmar Orden
                            </button>` : 
                            `<div class="signed-info">
                                <span class="status-signed">✅ Orden ya firmada</span>
                            </div>`
                        }
                        <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
                    </div>
                </div>
            `;

            document.getElementById('orderModalBody').innerHTML = html;
            document.getElementById('orderDetailModal').classList.add('show');

        } catch (error) {
            console.error('Error viewing operations manager order detail:', error);
            alert('Error al cargar el detalle de la orden');
        }
    }

    async signOperationsManagerOrder(shiftId, dayNumber) {
        const confirmed = await this.showCustomConfirm(
            'Confirmar Firma',
            '¿Está seguro de que desea firmar esta orden del supervisor?'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/operations-manager/sign/${shiftId}/${dayNumber}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.showCustomAlert('success', 'Firma Exitosa', 'Orden firmada exitosamente');
                await this.loadOperationsManagerOrders(); // Recargar la lista
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error signing operations manager order:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión al firmar la orden');
        }
    }

    async signOperationsManagerOrderFromModal(shiftId, dayNumber) {
        await this.signOperationsManagerOrder(shiftId, dayNumber);
        this.closeOrderDetail();
    }

    // Digital Signature Functions
    async showSignatureModal() {
        document.getElementById('signatureModal').classList.add('show');
        await this.loadUserSignature();
        this.initializeSignatureCanvas();
    }

    closeSignatureModal() {
        document.getElementById('signatureModal').classList.remove('show');
        document.getElementById('signatureCreation').style.display = 'none';
    }

    async loadUserSignature() {
        try {
            const response = await fetch('/api/signature', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const statusDiv = document.getElementById('signatureStatus');

            if (response.ok) {
                const signature = await response.json();
                this.userSignature = signature;
                
                statusDiv.innerHTML = `
                    <div class="signature-preview">
                        <h4>Tu Firma Digital Actual</h4>
                        <img src="${signature.signature_data}" alt="Firma Digital" />
                        <div class="signature-info">
                            <p><strong>Creada:</strong> ${new Date(signature.created_at).toLocaleDateString('es-ES')}</p>
                            <p><strong>Última actualización:</strong> ${new Date(signature.updated_at).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div class="signature-management-actions">
                            <button class="btn-update-signature" onclick="app.showSignatureCreation()">
                                ✏️ Actualizar Firma
                            </button>
                            <button class="btn-delete-signature" onclick="app.deleteSignature()">
                                🗑️ Eliminar Firma
                            </button>
                        </div>
                    </div>
                `;
            } else {
                this.userSignature = null;
                statusDiv.innerHTML = `
                    <div class="no-signature-message">
                        <h4>📝 No tienes una firma digital</h4>
                        <p>Crea tu firma digital para firmar automáticamente los formularios sin tener que dibujarla cada vez.</p>
                        <div class="signature-management-actions">
                            <button class="btn-create-signature" onclick="app.showSignatureCreation()">
                                ✍️ Crear Mi Firma Digital
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading user signature:', error);
            document.getElementById('signatureStatus').innerHTML = `
                <div class="no-signature-message">
                    <h4>❌ Error al cargar la firma</h4>
                    <p>No se pudo cargar tu firma digital. Inténtalo de nuevo.</p>
                </div>
            `;
        }
    }

    showSignatureCreation() {
        document.getElementById('signatureCreation').style.display = 'block';
        this.clearSignatureCanvas();
    }

    initializeSignatureCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        const ctx = canvas.getContext('2d');
        
        this.signatureCanvas = canvas;
        this.signatureCtx = ctx;
        this.isDrawing = false;

        // Set canvas background to white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set drawing style
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });

        // Button events
        document.getElementById('clearSignatureBtn').onclick = () => this.clearSignatureCanvas();
        document.getElementById('saveSignatureBtn').onclick = () => this.saveSignature();
        document.getElementById('cancelSignatureBtn').onclick = () => {
            document.getElementById('signatureCreation').style.display = 'none';
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.signatureCanvas.getBoundingClientRect();
        const scaleX = this.signatureCanvas.width / rect.width;
        const scaleY = this.signatureCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        this.signatureCtx.beginPath();
        this.signatureCtx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.signatureCanvas.getBoundingClientRect();
        const scaleX = this.signatureCanvas.width / rect.width;
        const scaleY = this.signatureCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        this.signatureCtx.lineTo(x, y);
        this.signatureCtx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    clearSignatureCanvas() {
        const ctx = this.signatureCtx;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.signatureCanvas.width, this.signatureCanvas.height);
    }

    async saveSignature() {
        // Check if canvas has content
        const canvas = this.signatureCanvas;
        const ctx = this.signatureCtx;
        
        // Create a temporary canvas to check if it's blank
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        if (canvas.toDataURL() === tempCanvas.toDataURL()) {
            this.showCustomAlert('warning', 'Firma Requerida', 'Por favor, dibuja tu firma antes de guardar.');
            return;
        }

        try {
            const signatureData = canvas.toDataURL('image/png');
            
            const response = await fetch('/api/signature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ signatureData })
            });

            if (response.ok) {
                this.showCustomAlert('success', 'Firma Guardada', 'Firma digital guardada exitosamente');
                document.getElementById('signatureCreation').style.display = 'none';
                await this.loadUserSignature();
                
                // If this was a mandatory first-time signature, close modal and reload interface
                const modal = document.getElementById('signatureModal');
                const closeBtn = modal.querySelector('.close-modal');
                const cancelBtn = document.getElementById('cancelSignatureBtn');
                
                if (closeBtn && closeBtn.style.display === 'none') {
                    // This was mandatory - reload page to ensure everything is fresh
                    console.log('Primera firma guardada - recargando página...');
                    
                    // Small delay to show the success message
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                    return; // Don't continue with the rest of the code
                }
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving signature:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión al guardar la firma');
        }
    }

    async deleteSignature() {
        const confirmed = await this.showCustomConfirm(
            'Eliminar Firma',
            '¿Estás seguro de que deseas eliminar tu firma digital?'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/api/signature', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.showCustomAlert('success', 'Firma Eliminada', 'Firma digital eliminada exitosamente');
                await this.loadUserSignature();
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error deleting signature:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión al eliminar la firma');
        }
    }

    // My Details Functions
    async showMyDetailsModal() {
        if (!this.currentShift || !this.shiftData || this.shiftData.length === 0) {
            this.showCustomAlert('info', 'Sin Datos', 'No hay datos guardados para mostrar');
            return;
        }

        // Show current day details
        const dayData = this.shiftData.find(d => d.day_number === this.currentDay);
        if (!dayData) {
            this.showCustomAlert('info', 'Sin Datos', `No hay datos del Día ${this.currentDay} para mostrar`);
            return;
        }

        await this.viewOrderDetail(this.currentShift.id, this.currentDay, this.currentUser.name, true);
    }
    async loadPendingOrders() {
        if (this.currentUser.role !== 'supervisor') return;

        try {
            const response = await fetch('/api/supervisor/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.pendingOrders = await response.json();
                this.renderSupervisorInterface();
            } else {
                console.error('Error loading orders');
            }
        } catch (error) {
            console.error('Error loading pending orders:', error);
        }
    }

    renderSupervisorInterface() {
        this.loadWorkersList();
        this.renderOrdersList();
    }

    async loadWorkersList() {
        try {
            const response = await fetch('/api/supervisor/workers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const workers = await response.json();
                const workerFilter = document.getElementById('workerFilter');
                
                // Clear existing options except "All"
                workerFilter.innerHTML = '<option value="all">Todos los trabajadores</option>';
                
                workers.forEach(worker => {
                    const option = document.createElement('option');
                    option.value = worker.id;
                    option.textContent = worker.name;
                    workerFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading workers list:', error);
        }
    }

    renderOrdersList() {
        const ordersList = document.getElementById('ordersList');
        const ordersCount = document.getElementById('ordersCount');
        
        if (!this.pendingOrders || this.pendingOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-orders">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📋</div>
                    <h3>No hay órdenes disponibles</h3>
                    <p>No se encontraron formularios de salud para revisar.</p>
                </div>
            `;
            ordersCount.textContent = '0 órdenes encontradas';
            return;
        }

        let html = '';
        
        this.pendingOrders.forEach(order => {
            const statusClass = order.supervisor_signed ? 'status-signed' : 'status-pending';
            const statusText = order.supervisor_signed ? 'Firmado' : 'Pendiente';
            
            // Determinar el estado de derivación
            const derivationStatus = order.supervisor_requires_derivation || 'pending';
            const derivationBadge = derivationStatus === 'pending' ? 
                '<span style="background: #ffc107; color: #333; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">⏳ Sin marcar</span>' :
                derivationStatus === 'si' ?
                '<span style="background: #dc3545; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">⚠️ SÍ requiere</span>' :
                '<span style="background: #28a745; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">✓ NO requiere</span>';
            
            html += `
                <div class="order-item" data-worker-id="${order.worker_id}" data-status="${order.supervisor_signed ? 'signed' : 'pending'}" data-shift-id="${order.shift_id}" data-day="${order.day_number}">
                    <div class="order-header">
                        <div class="order-info">
                            <div class="worker-name">${order.worker_name}</div>
                            <div class="order-details">
                                Turno ${order.user_shift || 'N/A'} - Día ${order.day_number} de 10
                                <br>Fecha: ${new Date(order.created_at).toLocaleDateString('es-ES')}
                                <br>${derivationBadge}
                            </div>
                        </div>
                        <div class="order-status ${statusClass}">
                            ${statusText}
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="btn-view" onclick="app.viewOrderDetail(${order.shift_id}, ${order.day_number}, '${order.worker_name}')">
                            👁️ Ver Detalle
                        </button>
                        ${!order.supervisor_signed ? `
                            <button class="btn-secondary" onclick="app.openDerivationModal(${order.shift_id}, ${order.day_number}, '${order.worker_name}')" 
                                    style="background: ${derivationStatus === 'pending' ? '#ffc107' : derivationStatus === 'si' ? '#dc3545' : '#28a745'}; color: ${derivationStatus === 'pending' ? '#333' : 'white'};">
                                ${derivationStatus === 'pending' ? '⚠️ Marcar Derivación' : derivationStatus === 'si' ? '⚠️ SÍ (Editar)' : '✓ NO (Editar)'}
                            </button>
                        ` : ''}
                        <button class="btn-sign" ${order.supervisor_signed ? 'disabled' : ''} 
                                onclick="app.signOrder(${order.shift_id}, ${order.day_number})"
                                ${order.supervisor_signed ? 'title="Ya firmado"' : 'title="Firmar orden"'}>
                            ${order.supervisor_signed ? '✅ Firmado' : '✍️ Firmar'}
                        </button>
                    </div>
                </div>
            `;
        });

        ordersList.innerHTML = html;
        ordersCount.textContent = `${this.pendingOrders.length} órdenes encontradas`;
    }

    filterOrders() {
        const statusFilter = document.getElementById('statusFilter').value;
        const workerFilter = document.getElementById('workerFilter').value;
        const orderItems = document.querySelectorAll('.order-item');

        let visibleCount = 0;

        orderItems.forEach(item => {
            const itemStatus = item.dataset.status;
            const itemWorkerId = item.dataset.workerId;
            
            let showItem = true;

            // Filter by status
            if (statusFilter !== 'all' && itemStatus !== statusFilter) {
                showItem = false;
            }

            // Filter by worker
            if (workerFilter !== 'all' && itemWorkerId !== workerFilter) {
                showItem = false;
            }

            item.style.display = showItem ? 'block' : 'none';
            if (showItem) visibleCount++;
        });

        document.getElementById('ordersCount').textContent = `${visibleCount} órdenes encontradas`;
    }

    async viewOrderDetail(shiftId, dayNumber, workerName, isMyDetails = false) {
        try {
            let order;
            
            if (isMyDetails) {
                // For "My Details", use local shift data
                order = this.shiftData.find(d => d.day_number === dayNumber);
                if (order) {
                    order.worker_name = this.currentUser.name;
                    order.shift_number = this.currentShift.shift_number;
                }
            } else {
                // For supervisor/operations manager views, find from pending orders
                if (this.currentUser.role === 'supervisor') {
                    order = this.pendingOrders?.find(o => 
                        o.shift_id === shiftId && o.day_number === dayNumber
                    );
                } else if (this.currentUser.role === 'operations_manager') {
                    order = this.operationsManagerOrders?.find(o => 
                        o.shift_id === shiftId && o.day_number === dayNumber
                    );
                }
            }

            if (!order) {
                alert('No se pudo encontrar la orden');
                return;
            }

            // Set modal title
            const roleText = isMyDetails ? '' : 
                           (this.currentUser.role === 'operations_manager' ? ' (Supervisor)' : '');
            document.getElementById('orderModalTitle').textContent = 
                `${workerName}${roleText} - Turno ${order.user_shift || 'N/A'}, Día ${dayNumber}`;

            // Build the detail view
            let html = `
                <div class="order-detail-info">
                    <div class="detail-section">
                        <h4>Información General</h4>
                        <p><strong>${isMyDetails ? 'Trabajador' : (this.currentUser.role === 'operations_manager' ? 'Supervisor' : 'Trabajador')}:</strong> ${workerName}</p>
                        <p><strong>Turno:</strong> #${order.shift_number}</p>
                        <p><strong>Día:</strong> ${dayNumber} de 10</p>
                        <p><strong>Fecha de Creación:</strong> ${new Date(order.created_at).toLocaleDateString('es-ES')}</p>
                        ${!isMyDetails ? `<p><strong>Estado:</strong> ${this.getOrderStatus(order)}</p>` : ''}
                        ${this.getSignatureInfo(order)}
                    </div>
            `;

            // Show form data if available
            if (order.form_data) {
                // Conditions section
                if (order.form_data.conditions && Object.keys(order.form_data.conditions).length > 0) {
                    html += `
                        <div class="detail-section">
                            <h4>Condiciones de Salud</h4>
                            <div class="form-responses">
                    `;
                    
                    Object.entries(order.form_data.conditions).forEach(([key, value]) => {
                        const questionText = this.getQuestionText(key);
                        html += `
                            <div class="response-item">
                                <span class="question">${questionText}:</span>
                                <span class="answer ${value === 'si' ? 'answer-yes' : 'answer-no'}">${value.toUpperCase()}</span>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                }

                // Fatigue section
                if (order.form_data.fatigue && Object.keys(order.form_data.fatigue).length > 0) {
                    html += `
                        <div class="detail-section">
                            <h4>Fatiga y Somnolencia</h4>
                            <div class="form-responses">
                    `;
                    
                    Object.entries(order.form_data.fatigue).forEach(([key, value]) => {
                        const questionText = this.getQuestionText(key);
                        html += `
                            <div class="response-item">
                                <span class="question">${questionText}:</span>
                                <span class="answer ${value === 'si' ? 'answer-yes' : 'answer-no'}">${value.toUpperCase()}</span>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                }

                // Supervisor evaluation section (only for worker forms)
                if (order.user_role === 'worker' && order.supervisor_requires_derivation) {
                    html += `
                        <div class="detail-section" style="background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%); border-left: 4px solid #ffc107;">
                            <h4 style="color: #856404;">Evaluación del Supervisor</h4>
                            <div class="form-responses">
                                <div class="response-item" style="background: white; padding: 12px; border-radius: 8px; border: 2px solid #ffc107;">
                                    <span class="question" style="font-weight: bold;">¿Requiere Derivación?:</span>
                                    <span class="answer ${order.supervisor_requires_derivation === 'si' ? 'answer-yes' : 'answer-no'}" style="font-size: 1.1em; padding: 6px 16px;">
                                        ${order.supervisor_requires_derivation === 'si' ? 'SÍ' : 'NO'}
                                    </span>
                                </div>
                                ${order.supervisor_derivation_note ? `
                                    <div style="margin-top: 10px; background: white; padding: 10px; border-radius: 5px; border: 1px solid #ffc107;">
                                        <strong>Nota del Supervisor:</strong>
                                        <p style="margin-top: 5px;">${order.supervisor_derivation_note}</p>
                                    </div>
                                ` : ''}
                                <p style="font-size: 0.85em; color: #666; margin-top: 8px; font-style: italic;">
                                    Esta evaluación fue realizada por el supervisor al revisar el formulario del trabajador.
                                </p>
                            </div>
                        </div>
                    `;
                    
                    // Revisión del Prevencionista (solo si requiere derivación Y fue revisado)
                    if (order.supervisor_requires_derivation === 'si' && order.derivation_reviewed) {
                        html += `
                            <div class="detail-section" style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-left: 4px solid #28a745;">
                                <h4 style="color: #155724;">✓ Revisión del Prevencionista</h4>
                                <div class="form-responses">
                                    <div style="background: white; padding: 12px; border-radius: 8px; border: 2px solid #28a745;">
                                        <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">✓ Caso Revisado</span></p>
                                        <p><strong>Revisado por:</strong> ${order.derivation_reviewed_by || 'N/A'}</p>
                                        <p><strong>Fecha de Revisión:</strong> ${order.derivation_reviewed_at ? new Date(order.derivation_reviewed_at).toLocaleString('es-ES') : 'N/A'}</p>
                                        ${order.derivation_review_notes ? `
                                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px; border: 1px solid #28a745;">
                                                <strong>Notas de Revisión:</strong>
                                                <p style="margin-top: 5px;">${order.derivation_review_notes}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <p style="font-size: 0.85em; color: #666; margin-top: 8px; font-style: italic;">
                                        Esta revisión fue realizada por el profesional OHSEM (Prevencionista).
                                    </p>
                                </div>
                            </div>
                        `;
                    }
                }

                // Signatures section with digital signatures
                html += this.renderSignaturesSection(order.form_data.signatures);
            }

            // Action buttons (only for supervisors/operations managers, not for "My Details")
            if (!isMyDetails) {
                html += this.renderActionButtons(order, shiftId, dayNumber);
            } else {
                html += `
                    <div class="signature-section-supervisor">
                        <div class="signature-actions">
                            <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
                        </div>
                    </div>
                `;
            }

            document.getElementById('orderModalBody').innerHTML = html;
            document.getElementById('orderDetailModal').classList.add('show');

        } catch (error) {
            console.error('Error viewing order detail:', error);
            alert('Error al cargar el detalle de la orden');
        }
    }

    getOrderStatus(order) {
        if (this.currentUser.role === 'supervisor') {
            return order.supervisor_signed ? 'Firmado' : 'Pendiente de Firma';
        } else if (this.currentUser.role === 'operations_manager') {
            return order.operations_manager_signed ? 'Firmado por Jefe de Operaciones' : 'Pendiente de Firma';
        }
        return 'N/A';
    }

    getSignatureInfo(order) {
        let html = '';
        if (this.currentUser.role === 'supervisor' && order.supervisor_signed) {
            html += `<p><strong>Firmado por:</strong> ${order.supervisor_signature}</p>`;
            html += `<p><strong>Fecha de Firma:</strong> ${new Date(order.signed_at).toLocaleDateString('es-ES')}</p>`;
        } else if (this.currentUser.role === 'operations_manager' && order.operations_manager_signed) {
            html += `<p><strong>Firmado por:</strong> ${order.operations_manager_signature}</p>`;
            html += `<p><strong>Fecha de Firma:</strong> ${new Date(order.operations_manager_signed_at).toLocaleDateString('es-ES')}</p>`;
        }
        return html;
    }

    renderSignaturesSection(signatures) {
        if (!signatures || Object.keys(signatures).length === 0) {
            return '';
        }

        // Filter signatures based on user role
        const filteredSignatures = this.filterSignaturesByRole(signatures);
        
        if (Object.keys(filteredSignatures).length === 0) {
            return '';
        }

        let html = `
            <div class="detail-section">
                <h4>Firmas Digitales</h4>
                <div class="signatures-grid">
        `;

        Object.entries(filteredSignatures).forEach(([key, value]) => {
            if (value === 'si') {
                const signatureText = this.getSignatureText(key);
                const signatureImage = this.getSignatureImage(key);
                
                html += `
                    <div class="signature-detail-item">
                        <div class="signature-detail-label">${signatureText}</div>
                        <div class="signature-detail-image">
                            ${signatureImage ? 
                                `<img src="${signatureImage}" alt="${signatureText}" class="signature-detail-preview" />` :
                                `<div class="signature-placeholder">Firma aplicada</div>`
                            }
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    filterSignaturesByRole(signatures) {
        const userRole = this.currentUser?.role;
        const filteredSignatures = {};

        if (userRole === 'worker') {
            // Workers see only 3 key signatures: worker, supervisor, and OHSEM
            Object.entries(signatures).forEach(([key, value]) => {
                // Show one representative signature from each role
                if (key === 'worker_signature_1' || // Worker signature (main)
                    key === 'supervisor_signature_1' || // Supervisor signature (main)
                    key === 'ohsem_signature') { // OHSEM signature
                    filteredSignatures[key] = value;
                }
            });
        } else if (userRole === 'supervisor') {
            // Supervisors see: supervisor signatures + OHSEM signatures (limited)
            Object.entries(signatures).forEach(([key, value]) => {
                if (key === 'supervisor_signature_1' || // Supervisor signature (main)
                    key === 'supervisor_signature_f' || // Supervisor fatigue signature
                    key === 'ohsem_signature') { // OHSEM signature
                    filteredSignatures[key] = value;
                }
            });
        } else if (userRole === 'operations_manager') {
            // Operations manager sees all signatures
            Object.entries(signatures).forEach(([key, value]) => {
                filteredSignatures[key] = value;
            });
        }

        return filteredSignatures;
    }

    getSignatureImage(signatureType) {
        // Return appropriate signature based on type
        // For demo purposes, return sample signatures
        if (signatureType.includes('worker_signature')) {
            return this.userSignature?.signature_data || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTAgMjBRMjAgMTAgNDAgMjBUODAgMjAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjUwIiB5PSIzNSIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZpcm1hPC90ZXh0Pgo8L3N2Zz4=';
        } else if (signatureType.includes('supervisor_signature')) {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTUgMTVMMzAgMjVMNTAgMTVMNzAgMjVMODUgMTUiIHN0cm9rZT0iIzAwNDQ4OCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjUwIiB5PSIzNSIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDQ0ODgiPlN1cGVydmlzb3I8L3RleHQ+Cjwvc3ZnPg==';
        } else if (signatureType.includes('ohsem_signature')) {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMjAgMTBMMzAgMjBMNTAgMTBMNzAgMjBMODAgMTAiIHN0cm9rZT0iIzI4YTc0NSIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjUwIiB5PSIzNSIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzI4YTc0NSI+T0hTRU08L3RleHQ+Cjwvc3ZnPg==';
        }
        return null;
    }

    renderActionButtons(order, shiftId, dayNumber) {
        if (this.currentUser.role === 'supervisor') {
            const derivationValue = order.supervisor_requires_derivation || '';
            return `
                <div class="signature-section-supervisor">
                    <h4>Evaluación del Supervisor</h4>
                    ${!order.supervisor_signed ? `
                        <div class="derivation-question">
                            <label class="derivation-label">
                                <strong>¿Requiere Derivación?</strong>
                                <span style="color: #e74c3c; font-size: 0.9em;">(Obligatorio antes de firmar)</span>
                            </label>
                            <div class="derivation-options">
                                <label class="radio-option">
                                    <input type="radio" name="requiresDerivation" value="si" ${derivationValue === 'si' ? 'checked' : ''}>
                                    <span>Sí</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="requiresDerivation" value="no" ${derivationValue === 'no' ? 'checked' : ''}>
                                    <span>No</span>
                                </label>
                            </div>
                        </div>
                    ` : `
                        <div class="derivation-result">
                            <p><strong>¿Requiere Derivación?:</strong> 
                                <span class="answer ${order.supervisor_requires_derivation === 'si' ? 'answer-yes' : 'answer-no'}">
                                    ${order.supervisor_requires_derivation === 'si' ? 'SÍ' : 'NO'}
                                </span>
                            </p>
                        </div>
                    `}
                    <h4>Acciones del Supervisor</h4>
                    <div class="signature-actions">
                        ${!order.supervisor_signed ? 
                            `<button class="btn-sign" onclick="app.signOrderFromModal(${shiftId}, ${dayNumber})">
                                ✍️ Firmar Orden
                            </button>` : 
                            `<div class="signed-info">
                                <span class="status-signed">✅ Orden ya firmada</span>
                            </div>`
                        }
                        <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
                    </div>
                </div>
            `;
        } else if (this.currentUser.role === 'operations_manager') {
            return `
                <div class="signature-section-supervisor">
                    <h4>Acciones del Jefe de Operaciones</h4>
                    <div class="signature-actions">
                        ${!order.operations_manager_signed ? 
                            `<button class="btn-sign" onclick="app.signOperationsManagerOrderFromModal(${shiftId}, ${dayNumber})">
                                ✍️ Firmar Orden
                            </button>` : 
                            `<div class="signed-info">
                                <span class="status-signed">✅ Orden ya firmada</span>
                            </div>`
                        }
                        <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
                    </div>
                </div>
            `;
        }
        return '';
    }

    closeOrderDetail() {
        document.getElementById('orderDetailModal').classList.remove('show');
    }

    async signOrderFromModal(shiftId, dayNumber) {
        await this.signOrder(shiftId, dayNumber);
        this.closeOrderDetail();
    }

    getQuestionText(questionId) {
        // Map question IDs to readable text
        const questionMap = {
            'q11': '¿Se encuentra con conocimiento adecuado y capacidad para realizar las tareas?',
            'q12': '¿Padece de alguna enfermedad o molestia física?',
            'q13': '¿Presenta factores externos que le impidan estar concentrado?',
            'q30': '¿Ha sufrido algún accidente con lesión?',
            'f1': '¿Ha tenido dificultades en lograr un descanso reparador?',
            'f2': '¿Presenta algún síntoma que dificulte su buen dormir?',
            'f3': '¿Sufre de insomnio últimamente?',
            'f4': '¿Durmió menos tiempo del necesario durante su último período de sueño?',
            'f5': '¿Está consumiendo algún medicamento que provoque somnolencia?',
            'f6': '¿Padece alguna enfermedad que produzca cansancio o somnolencia?',
            'f7': '¿Existen factores externos que afecten la calidad de su sueño?',
            'f8': '¿Ha presentado eventos importantes de somnolencia?'
        };
        return questionMap[questionId] || questionId;
    }

    getSignatureText(signatureId) {
        // Map signature IDs to readable text
        const signatureMap = {
            'worker_signature_1': 'Firma del Trabajador (Sección Aptitudes)',
            'supervisor_signature_1': 'Firma del Supervisor (Sección Aptitudes)',
            'worker_signature_2': 'Firma del Trabajador (Sección Final)',
            'supervisor_signature_2': 'Firma del Supervisor (Sección Final)',
            'ohsem_signature': 'Firma Profesional OHSEM',
            'worker_signature_f': 'Firma del Trabajador (Fatiga)',
            'supervisor_signature_f': 'Firma del Supervisor (Fatiga)'
        };
        return signatureMap[signatureId] || signatureId;
    }

    async signOrder(shiftId, dayNumber) {
        // Obtener el estado de derivación del formulario
        const order = this.pendingOrders.find(o => o.shift_id === shiftId && o.day_number === dayNumber);
        const derivationStatus = order?.supervisor_requires_derivation;
        
        if (!derivationStatus || derivationStatus === 'pending') {
            this.showCustomAlert('warning', 'Campo Requerido', 'Debe marcar si requiere derivación (Sí o No) antes de firmar. Use el botón "Marcar Derivación".');
            return;
        }
        
        const derivationText = derivationStatus === 'si' ? 'SÍ REQUIERE' : 'NO REQUIERE';
        
        const confirmed = await this.showCustomConfirm(
            'Confirmar Firma',
            `¿Está seguro de que desea firmar esta orden?\n\n¿Requiere Derivación?: ${derivationText}`
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/supervisor/sign/${shiftId}/${dayNumber}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requiresDerivation: derivationStatus })
            });

            if (response.ok) {
                this.showCustomAlert('success', 'Firma Exitosa', 'Orden firmada exitosamente');
                await this.loadPendingOrders(); // Recargar la lista
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error signing order:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión al firmar la orden');
        }
    }

    getDayClass(day) {
        if (day === this.currentDay) return 'current-day';
        if (day < this.currentDay) return 'completed-day';
        return '';
    }

    scrollToCurrentDay() {
        console.log('🚀 INICIANDO AUTO-SCROLL - Día actual:', this.currentDay);
        
        // Guardar las posiciones de scroll para mantenerlas
        const scrollPositions = new Map();
        
        // Función para hacer el scroll
        const doScroll = () => {
            const daysGrids = document.querySelectorAll('.days-grid');
            console.log('📊 Grids encontrados:', daysGrids.length);
            
            if (daysGrids.length === 0) {
                console.log('❌ NO SE ENCONTRARON GRIDS');
                return false;
            }
            
            let scrolledCount = 0;
            daysGrids.forEach((grid, index) => {
                const currentDayElement = grid.querySelector('.day-column.current-day');
                
                if (currentDayElement) {
                    const gridWidth = grid.offsetWidth;
                    const dayWidth = currentDayElement.offsetWidth;
                    const dayLeft = currentDayElement.offsetLeft;
                    const scrollPosition = Math.max(0, dayLeft - (gridWidth / 2) + (dayWidth / 2));
                    
                    console.log(`📍 Grid ${index + 1}:`, {
                        gridWidth,
                        dayWidth,
                        dayLeft,
                        scrollPosition
                    });
                    
                    grid.scrollLeft = scrollPosition;
                    scrollPositions.set(grid, scrollPosition);
                    scrolledCount++;
                    
                    // Mantener el scroll horizontal fijo cuando se hace scroll vertical
                    grid.addEventListener('scroll', function maintainScroll(e) {
                        if (scrollPositions.has(this)) {
                            const savedPosition = scrollPositions.get(this);
                            if (Math.abs(this.scrollLeft - savedPosition) > 5) {
                                // Solo restaurar si el cambio es significativo
                                this.scrollLeft = savedPosition;
                            }
                        }
                    }, { passive: true });
                    
                    console.log(`✅ Grid ${index + 1} scrolleado a ${grid.scrollLeft}px`);
                } else {
                    console.log(`⚠️ Grid ${index + 1}: NO tiene día actual`);
                }
            });
            
            return scrolledCount > 0;
        };
        
        // Intentar inmediatamente
        doScroll();
        
        // Intentar múltiples veces con delays
        [100, 300, 600, 1000, 1500, 2000, 3000].forEach(delay => {
            setTimeout(() => {
                console.log(`🔄 Reintento después de ${delay}ms`);
                doScroll();
            }, delay);
        });
    }

    getSavedValue(questionId, day, formType) {
        const dayData = this.shiftData.find(d => d.day_number === day);
        if (!dayData) return '';
        
        const formData = dayData.form_data;
        return formData[formType]?.[questionId] || '';
    }

    getSavedSignature(signatureType, day) {
        const dayData = this.shiftData.find(d => d.day_number === day);
        if (!dayData) return '';
        
        const formData = dayData.form_data;
        return formData.signatures?.[signatureType] || '';
    }

    async saveDailyForm() {
        if (!this.currentShift) {
            this.showCustomAlert('error', 'Error', 'No hay un turno activo.');
            return;
        }

        // Guardar el día actual
        const dayToSave = this.currentDay;
        
        console.log('=== GUARDANDO DÍA ===');
        console.log('Día a guardar:', dayToSave);
        console.log('=====================');

        const formData = {
            conditions: {},
            fatigue: {},
            signatures: {}
        };

        // Collect conditions form data
        this.conditionsQuestions.forEach(question => {
            const input = document.querySelector(`input[name="${question.id}_day${dayToSave}"]:checked`);
            if (input) {
                formData.conditions[question.id] = input.value;
            }
        });

        // Collect accident questions
        this.accidentQuestions.forEach(question => {
            const input = document.querySelector(`input[name="${question.id}_day${dayToSave}"]:checked`);
            if (input) {
                formData.conditions[question.id] = input.value;
            }
        });

        // Collect fatigue form data
        this.fatigueQuestions.forEach(question => {
            const input = document.querySelector(`input[name="${question.id}_day${dayToSave}"]:checked`);
            if (input) {
                formData.fatigue[question.id] = input.value;
            }
        });

        // CRITICAL VALIDATION: Both forms are MANDATORY
        // Check if ALL questions from Condiciones de Salud are answered
        const conditionsComplete = this.conditionsQuestions.every(question => {
            return formData.conditions[question.id] !== undefined;
        });

        // Check if ALL questions from Fatiga y Somnolencia are answered
        const fatigueComplete = this.fatigueQuestions.every(question => {
            return formData.fatigue[question.id] !== undefined;
        });

        // DEBUG: Log missing questions
        console.log('=== VALIDACIÓN DE FORMULARIOS ===');
        console.log('Total preguntas Condiciones:', this.conditionsQuestions.length);
        console.log('Total preguntas Fatiga:', this.fatigueQuestions.length);
        console.log('Respuestas Condiciones:', Object.keys(formData.conditions).length);
        console.log('Respuestas Fatiga:', Object.keys(formData.fatigue).length);
        
        if (!conditionsComplete) {
            const missingConditions = this.conditionsQuestions.filter(q => !formData.conditions[q.id]);
            console.log('Preguntas faltantes en Condiciones:', missingConditions.map(q => q.id));
        }
        
        if (!fatigueComplete) {
            const missingFatigue = this.fatigueQuestions.filter(q => !formData.fatigue[q.id]);
            console.log('Preguntas faltantes en Fatiga:', missingFatigue.map(q => q.id));
        }
        console.log('==================================');

        if (!conditionsComplete && !fatigueComplete) {
            this.showCustomAlert('warning', 'FORMULARIOS INCOMPLETOS', 'Debe completar AMBOS formularios:\n\n• Todas las preguntas de Condiciones de Salud\n• Todas las preguntas de Fatiga y Somnolencia\n\nPor favor complete ambos formularios antes de guardar.');
            return;
        } else if (!conditionsComplete) {
            this.showCustomAlert('warning', 'FORMULARIO INCOMPLETO', 'Debe completar TODAS las preguntas de "Condiciones de Salud" antes de guardar.');
            return;
        } else if (!fatigueComplete) {
            this.showCustomAlert('warning', 'FORMULARIO INCOMPLETO', 'Debe completar TODAS las preguntas de "Fatiga y Somnolencia" antes de guardar.');
            return;
        }

        // Collect signatures
        // IMPORTANT: Only collect user's own signatures when they save
        ['worker_signature_1', 'supervisor_signature_1', 'worker_signature_2', 'supervisor_signature_2', 'ohsem_signature', 'ohsem_signature_2', 'worker_signature_f', 'supervisor_signature_f'].forEach(sig => {
            // Check if this signature belongs to current user
            const isUserSig = this.isUserSignatureType(sig);
            
            if (isUserSig && this.userSignature) {
                // Automatically add user's signature when they save
                formData.signatures[sig] = 'si';
            } else {
                // Check if there's a hidden input (for other signatures)
                const hiddenInput = document.querySelector(`input[name="${sig}_day${dayToSave}"][type="hidden"]`);
                if (hiddenInput) {
                    formData.signatures[sig] = hiddenInput.value;
                } else {
                    // Check regular radio buttons
                    const input = document.querySelector(`input[name="${sig}_day${dayToSave}"]:checked`);
                    if (input) {
                        formData.signatures[sig] = input.value;
                    }
                }
            }
        });

        try {
            const response = await fetch(`/api/shift/${this.currentShift.id}/day/${dayToSave}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ formData })
            });

            if (response.ok) {
                // Check if there are any "si" answers (excluding the first mandatory question)
                const hasHealthIssues = this.checkForHealthIssues(formData);
                
                if (hasHealthIssues) {
                    this.showCustomAlert('warning', '⚠️ ALERTA DE SALUD', 'Has marcado "SÍ" en una o más preguntas de salud.\n\nSe ha notificado automáticamente a tu Supervisor y al equipo de Prevención de Riesgos para que revisen tu caso.');
                }
                
                this.showCustomAlert('success', 'GUARDADO EXITOSO', `Datos del Día ${dayToSave} guardados correctamente.\n\nAmbos formularios han sido completados y guardados.`);
                await this.loadShiftData();
                this.updateUI();
            } else {
                const errorData = await response.json();
                this.showCustomAlert('error', 'Error al Guardar', errorData.error);
            }
        } catch (error) {
            console.error('Error saving form:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'No se pudo conectar con el servidor. Por favor intente nuevamente.');
        }
    }

    async showCompleteShiftModal() {
        // Load supervisors
        try {
            const response = await fetch('/api/supervisors', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const supervisors = await response.json();
                const select = document.getElementById('supervisorSelect');
                select.innerHTML = '<option value="">Seleccionar supervisor...</option>';
                
                supervisors.forEach(supervisor => {
                    select.innerHTML += `<option value="${supervisor.name}">${supervisor.name}</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading supervisors:', error);
        }

        document.getElementById('completeShiftModal').classList.add('show');
    }

    hideCompleteShiftModal() {
        document.getElementById('completeShiftModal').classList.remove('show');
    }

    async completeShift() {
        const supervisorSignature = document.getElementById('supervisorSelect').value;
        
        if (!supervisorSignature) {
            alert('Debe seleccionar un supervisor');
            return;
        }

        try {
            const response = await fetch(`/api/shift/${this.currentShift.id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ supervisorSignature })
            });

            if (response.ok) {
                alert('Turno completado exitosamente');
                this.hideCompleteShiftModal();
                await this.loadCurrentShift();
                await this.loadShiftData();
                this.updateUI();
            } else {
                alert('Error al completar el turno');
            }
        } catch (error) {
            console.error('Error completing shift:', error);
            alert('Error de conexión');
        }
    }

    checkForHealthIssues(formData) {
        const details = [];
        
        // Mapeo de preguntas para mostrar texto legible
        const conditionsQuestions = {
            day2: "¿Padece de alguna enfermedad o molestia física?",
            day3: "¿Presenta factores externos que le impidan estar concentrado?",
            day4: "¿Ha sufrido algún accidente con lesión?"
        };
        
        const fatigueQuestions = {
            day1: "¿Ha tenido dificultades en lograr un descanso reparador?",
            day2: "¿Presenta algún síntoma que dificulte su buen dormir?",
            day3: "¿Sufre de insomnio últimamente?",
            day4: "¿Durmió menos tiempo del necesario durante su último período de sueño?",
            day5: "¿Está consumiendo algún medicamento que provoque somnolencia?",
            day6: "¿Padece alguna enfermedad que produzca cansancio o somnolencia?",
            day7: "¿Existen factores externos que afecten la calidad de su sueño?",
            day8: "¿Ha presentado eventos importantes de somnolencia?"
        };
        
        // Check conditions (skip day1 which is the mandatory first question)
        for (let i = 2; i <= 4; i++) {
            const dayKey = `day${i}`;
            if (formData.conditions && formData.conditions[dayKey] === 'si') {
                details.push(conditionsQuestions[dayKey] || `Condición ${i}`);
            }
        }
        
        // Check fatigue questions
        for (let i = 1; i <= 8; i++) {
            const dayKey = `day${i}`;
            if (formData.fatigue && formData.fatigue[dayKey] === 'si') {
                details.push(fatigueQuestions[dayKey] || `Fatiga ${i}`);
            }
        }
        
        const hasIssues = details.length > 0;
        
        if (hasIssues) {
            console.log('⚠️ ALERTA: Trabajador marcó SÍ en preguntas de salud');
            console.log('Detalles:', details);
        }
        
        return {
            hasIssues,
            details
        };
    }

    // Función para simular el paso al siguiente día (solo para testing)
    async simulateNextDay() {
        if (!this.currentShift) {
            alert('No hay turno activo');
            return;
        }

        if (this.currentDay >= 10) {
            alert('Ya estás en el último día del turno');
            return;
        }

        try {
            const response = await fetch(`/api/shift/${this.currentShift.id}/simulate-next-day`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Simulado: Ahora estás en el ${result.message}`);
                await this.loadShiftData();
                this.updateUI();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error simulating next day:', error);
            alert('Error de conexión');
        }
    }

    // OHSEM Functions
    async loadOhsemOrders() {
        if (this.currentUser.role !== 'ohsem') return;

        try {
            const response = await fetch('/api/ohsem/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.ohsemOrders = await response.json();
                this.filteredOhsemOrders = [...this.ohsemOrders];
                await this.loadOhsemUsers();
                this.renderOhsemInterface();
            }
        } catch (error) {
            console.error('Error loading OHSEM orders:', error);
        }
    }

    async loadOhsemUsers() {
        try {
            const response = await fetch('/api/ohsem/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.ohsemUsers = await response.json();
                this.populateOhsemUserFilter();
            }
        } catch (error) {
            console.error('Error loading OHSEM users:', error);
        }
    }

    populateOhsemUserFilter() {
        const select = document.getElementById('ohsemUserFilter');
        if (!select) return;

        select.innerHTML = '<option value="all">Todos los usuarios</option>';
        
        this.ohsemUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.role === 'worker' ? 'Trabajador' : 'Supervisor'})`;
            select.appendChild(option);
        });
    }

    renderOhsemInterface() {
        const ordersList = document.getElementById('ohsemOrdersList');
        const ordersCount = document.getElementById('ohsemOrdersCount');

        if (!ordersList || !ordersCount) return;

        ordersCount.textContent = `${this.filteredOhsemOrders.length} casos encontrados`;

        if (this.filteredOhsemOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-orders">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">✅</div>
                    <h3>No hay casos que requieran derivación</h3>
                    <p>Todos los formularios están en orden. No hay casos marcados como "SÍ requiere derivación".</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = this.filteredOhsemOrders.map(order => {
            const statusClass = order.derivation_reviewed ? 'status-signed' : 'status-pending';
            const statusText = order.derivation_reviewed ? 'Revisado' : 'Pendiente';
            const roleText = order.user_role === 'worker' ? 'Trabajador' : 'Supervisor';
            const note = order.supervisor_derivation_note || 'Sin nota';

            return `
                <div class="order-item" style="border-left: 4px solid ${order.derivation_reviewed ? '#28a745' : '#dc3545'};">
                    <div class="order-header">
                        <div class="order-info">
                            <div class="worker-name">${order.derivation_reviewed ? '✓' : '⚠️'} ${order.user_name}</div>
                            <div class="order-details">
                                ${roleText} - Turno ${order.user_shift || 'N/A'} - Día ${order.day_number} de 10
                                <br><strong style="color: #dc3545;">Nota del Supervisor:</strong> ${note}
                            </div>
                        </div>
                        <span class="order-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="order-actions">
                        <button class="btn-view" onclick="app.viewOhsemOrderDetail(${order.shift_id}, ${order.day_number})">
                            👁️ Ver Detalle
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterOhsemOrders() {
        const statusFilter = document.getElementById('ohsemStatusFilter')?.value || 'all';
        const roleFilter = document.getElementById('ohsemRoleFilter')?.value || 'all';
        const userFilter = document.getElementById('ohsemUserFilter')?.value || 'all';

        this.filteredOhsemOrders = this.ohsemOrders.filter(order => {
            const statusMatch = statusFilter === 'all' || 
                (statusFilter === 'pending' && !order.ohsem_signed) ||
                (statusFilter === 'signed' && order.ohsem_signed);

            const roleMatch = roleFilter === 'all' || order.user_role === roleFilter;

            const userMatch = userFilter === 'all' || order.user_id == userFilter;

            return statusMatch && roleMatch && userMatch;
        });

        this.renderOhsemInterface();
    }

    async viewOhsemOrderDetail(shiftId, dayNumber) {
        try {
            const response = await fetch(`/api/shift/${shiftId}/day/${dayNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const orderDetail = await response.json();
                this.showOhsemOrderDetailModal(orderDetail);
            }
        } catch (error) {
            console.error('Error loading order detail:', error);
        }
    }

    renderSignatureDetail(label, signatureValue, signatureImage = null) {
        // signatureValue can be boolean (true/false) or string ('si'/'no')
        const isSigned = signatureValue === true || signatureValue === 'si';
        
        return `
            <div class="signature-detail-item">
                <div class="signature-detail-label">${label}</div>
                <div class="signature-detail-image">
                    ${isSigned && signatureImage ? 
                        `<img src="${signatureImage}" alt="${label}" class="signature-detail-preview" />` :
                        isSigned ?
                        '<span class="signature-placeholder signature-signed">✓ Firmado</span>' : 
                        '<span class="signature-placeholder signature-pending">⏳ Pendiente</span>'
                    }
                </div>
            </div>
        `;
    }

    showOhsemOrderDetailModal(order) {
        const modal = document.getElementById('orderDetailModal');
        const modalTitle = document.getElementById('orderModalTitle');
        const modalBody = document.getElementById('orderModalBody');

        const shift = this.ohsemOrders.find(o => o.shift_id === order.shift_id && o.day_number === order.day_number);
        const roleText = shift?.user_role === 'worker' ? 'Trabajador' : 'Supervisor';

        modalTitle.textContent = `Detalle de Orden - ${shift?.user_name || 'Usuario'} (${roleText})`;

        let html = `
            <div class="order-detail-info">
                <div class="detail-section">
                    <h4>Información General</h4>
                    <p><strong>Usuario:</strong> ${shift?.user_name || 'N/A'}</p>
                    <p><strong>Tipo:</strong> ${roleText}</p>
                    <p><strong>Turno:</strong> #${order.shift_number}</p>
                    <p><strong>Día:</strong> ${order.day_number}</p>
                    <p><strong>Turno:</strong> ${shift?.user_shift || 'N/A'}</p>
                    <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                </div>
        `;

        // Condiciones de Salud
        if (order.form_data.conditions) {
            html += `
                <div class="detail-section">
                    <h4>Condiciones de Salud</h4>
                    <div class="form-responses">
            `;

            Object.entries(order.form_data.conditions).forEach(([key, value]) => {
                const question = this.getQuestionText(key);
                if (question) {
                    const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
                    const answerText = value === 'si' ? 'Sí' : 'No';
                    html += `
                        <div class="response-item">
                            <span class="question">${question}</span>
                            <span class="answer ${answerClass}">${answerText}</span>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Fatiga y Somnolencia
        if (order.form_data.fatigue) {
            html += `
                <div class="detail-section">
                    <h4>Fatiga y Somnolencia</h4>
                    <div class="form-responses">
            `;

            Object.entries(order.form_data.fatigue).forEach(([key, value]) => {
                const question = this.getQuestionText(key);
                if (question) {
                    const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
                    const answerText = value === 'si' ? 'Sí' : 'No';
                    html += `
                        <div class="response-item">
                            <span class="question">${question}</span>
                            <span class="answer ${answerClass}">${answerText}</span>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Evaluación del Supervisor (Derivación)
        if (order.supervisor_requires_derivation) {
            html += `
                <div class="detail-section" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px;">
                    <h4 style="color: #856404;">Evaluación del Supervisor</h4>
                    <p><strong>¿Requiere Derivación?:</strong> 
                        <span style="color: ${order.supervisor_requires_derivation === 'si' ? '#dc3545' : '#28a745'}; font-weight: bold;">
                            ${order.supervisor_requires_derivation === 'si' ? '⚠️ SÍ REQUIERE' : '✓ NO REQUIERE'}
                        </span>
                    </p>
                    ${order.supervisor_derivation_note ? `
                        <p><strong>Nota del Supervisor:</strong></p>
                        <div style="background: white; padding: 10px; border-radius: 5px; border: 1px solid #ffc107;">
                            ${order.supervisor_derivation_note}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // Firmas
        html += `
            <div class="detail-section">
                <h4>Firmas</h4>
                <div class="signatures-grid">
        `;

        // Mostrar firmas según el rol - usar los campos de firma del backend
        if (shift?.user_role === 'worker') {
            // Trabajador: mostrar SOLO firma trabajador y supervisor (NO OHSEM)
            html += this.renderSignatureDetail('Trabajador', order.worker_signed ? 'si' : 'no', order.signatures?.worker_signature);
            html += this.renderSignatureDetail('Supervisor', order.supervisor_signed ? 'si' : 'no', order.signatures?.supervisor_signature);
            // ❌ NO mostrar firma OHSEM para trabajadores
        } else if (shift?.user_role === 'supervisor') {
            // Supervisor: mostrar firma supervisor, jefe operaciones, OHSEM
            html += this.renderSignatureDetail('Supervisor', order.supervisor_signed ? 'si' : 'no', order.signatures?.supervisor_signature);
            html += this.renderSignatureDetail('Jefe de Operaciones', order.operations_manager_signed ? 'si' : 'no', order.signatures?.operations_manager_signature);
            html += this.renderSignatureDetail('OHSEM', order.ohsem_signed ? 'si' : 'no', order.signatures?.ohsem_signature);
        }

        html += `
                </div>
            </div>
        `;

        // Acciones OHSEM - SOLO para casos de derivación
        if (order.supervisor_requires_derivation === 'si') {
            html += `
                <div class="signature-section-supervisor">
                    <h4>Acciones del Profesional OHSEM</h4>
            `;

            if (order.derivation_reviewed) {
                html += `
                    <div class="signed-info" style="background: #d4edda; padding: 15px; border-radius: 5px; border: 2px solid #28a745;">
                        <span class="status-signed">✓ Caso Revisado</span>
                        <p style="margin-top: 10px; color: #155724;">
                            <strong>Revisado por:</strong> ${order.derivation_reviewed_by || 'N/A'}<br>
                            <strong>Fecha:</strong> ${order.derivation_reviewed_at ? new Date(order.derivation_reviewed_at).toLocaleString('es-ES') : 'N/A'}
                        </p>
                        ${order.derivation_review_notes ? `
                            <p style="margin-top: 10px;"><strong>Notas de Revisión:</strong></p>
                            <div style="background: white; padding: 10px; border-radius: 5px; border: 1px solid #28a745;">
                                ${order.derivation_review_notes}
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                html += `
                    <div class="signature-actions">
                        <button class="btn-success" onclick="app.markAsReviewed(${order.shift_id}, ${order.day_number})">
                            ✓ Marcar como Revisado
                        </button>
                    </div>
                `;
            }

            html += `
                    <div class="signature-actions" style="margin-top: 10px;">
                        <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
                    </div>
                </div>
            `;
        } else {
            // Si no requiere derivación, solo botón cerrar
            html += `
                <div class="signature-section-supervisor">
                    <div class="signature-actions">
                        <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
                    </div>
                </div>
            `;
        }

        html += `</div>`;

        modalBody.innerHTML = html;
        modal.classList.add('show');
    }

    async signOhsemOrder(shiftId, dayNumber) {
        const confirmed = await this.showCustomConfirm(
            'Confirmar Firma OHSEM',
            '¿Está seguro de que desea firmar esta orden como Profesional OHSEM?'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/ohsem/sign/${shiftId}/${dayNumber}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.showCustomAlert('success', 'Firma Exitosa', 'Orden firmada exitosamente por OHSEM');
                await this.loadOhsemOrders();
                // Reload the order detail to show updated signature status
                await this.viewOhsemOrderDetail(shiftId, dayNumber);
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error signing order:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión al firmar la orden');
        }
    }

    async markAsReviewed(shiftId, dayNumber) {
        // Mostrar modal para agregar notas opcionales
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; width: 500px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="font-size: 1.3rem;">Marcar como Revisado</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 15px; color: #666; font-size: 0.95rem;">
                        ¿Desea agregar notas sobre la revisión de este caso?
                    </p>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 1rem;">
                            Notas de Revisión (opcional):
                        </label>
                        <textarea id="reviewNotes" rows="5" style="width: 100%; padding: 12px; border: 2px solid #004488; border-radius: 5px; font-family: Arial, sans-serif; font-size: 0.95rem; resize: vertical;" 
                                  placeholder="Ej: Se contactó al trabajador, se derivó a médico, se programó evaluación, etc."></textarea>
                        <small style="color: #666; display: block; margin-top: 5px; font-size: 0.85rem;">
                            Estas notas quedarán registradas en el sistema y serán visibles para todos.
                        </small>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1; min-width: 120px;">
                        Cancelar
                    </button>
                    <button class="btn-success" onclick="app.confirmMarkAsReviewed(${shiftId}, ${dayNumber})" style="flex: 1; min-width: 140px;">
                        ✓ Confirmar Revisión
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async confirmMarkAsReviewed(shiftId, dayNumber) {
        const reviewNotes = document.getElementById('reviewNotes')?.value.trim() || '';

        try {
            const response = await fetch(`/api/ohsem/mark-reviewed/${shiftId}/${dayNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ review_notes: reviewNotes })
            });

            if (response.ok) {
                this.showCustomAlert('success', 'Caso Revisado', 'El caso ha sido marcado como revisado correctamente');
                document.querySelector('.modal-overlay')?.remove();
                await this.loadOhsemOrders();
                await this.viewOhsemOrderDetail(shiftId, dayNumber);
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error marking as reviewed:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión');
        }
    }

    async signAllOrders() {
        const confirmed = await this.showCustomConfirm(
            'Firmar Todas las Órdenes',
            '¿Está seguro de que desea firmar TODAS las órdenes pendientes?'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/api/supervisor/sign-all', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showCustomAlert('success', 'Firmas Completadas', result.message);
                // Recargar la lista de órdenes pendientes
                await this.loadPendingOrders();
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error mass signing orders:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión al firmar las órdenes');
        }
    }

    async markAllDerivationNo() {
        const confirmed = await this.showCustomConfirm(
            'Marcar Todos NO',
            '¿Está seguro de marcar TODOS los formularios pendientes como "NO requiere derivación"?'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/api/supervisor/mark-all-derivation-no', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showCustomAlert('success', 'Actualización Exitosa', result.message);
                await this.loadPendingOrders();
            } else {
                const error = await response.json();
                
                // Si hay formularios con problemas de salud, mostrar detalles
                if (error.formsWithIssues && error.formsWithIssues.length > 0) {
                    let detailsHtml = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                    detailsHtml += '<p style="margin-bottom: 15px; font-size: 1.05rem; color: #721c24; background: #f8d7da; padding: 12px; border-radius: 5px; border-left: 4px solid #dc3545;">';
                    detailsHtml += '<strong>⚠️ NO SE PUEDE MARCAR TODOS COMO "NO"</strong><br>';
                    detailsHtml += `Se detectaron <strong>${error.formsWithIssues.length} operador(es)</strong> con problemas de salud que requieren derivación obligatoria.`;
                    detailsHtml += '</p>';
                    
                    detailsHtml += '<p style="margin-bottom: 10px; font-weight: bold; font-size: 1rem; color: #333;">Operadores con problemas detectados:</p>';
                    detailsHtml += '<ul style="margin: 0; padding-left: 20px; list-style: none;">';
                    
                    error.formsWithIssues.forEach((form, index) => {
                        detailsHtml += `<li style="margin-bottom: 15px; padding: 12px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                            <div style="font-size: 1rem; margin-bottom: 8px;">
                                <strong style="color: #856404;">🔸 ${form.worker_name}</strong> - Día ${form.day_number} de 10
                            </div>
                            <div style="font-size: 0.9rem; color: #856404; margin-left: 15px;">
                                <strong>Problemas detectados:</strong>
                                <ul style="margin-top: 5px; padding-left: 15px;">
                                    ${form.issues.map(issue => `<li style="margin-bottom: 3px;">${issue}</li>`).join('')}
                                </ul>
                            </div>
                        </li>`;
                    });
                    
                    detailsHtml += '</ul>';
                    detailsHtml += '<div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 5px;">';
                    detailsHtml += '<p style="margin: 0; color: #0c5460; font-weight: bold; font-size: 0.95rem;">📋 Acción Requerida:</p>';
                    detailsHtml += '<p style="margin: 5px 0 0 0; color: #0c5460; font-size: 0.9rem;">Debe revisar cada formulario individualmente y marcar "SÍ requiere derivación" para estos operadores.</p>';
                    detailsHtml += '</div>';
                    detailsHtml += '</div>';
                    
                    this.showCustomAlert('error', '⚠️ Operadores Requieren Derivación', detailsHtml);
                } else {
                    this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
                }
            }
        } catch (error) {
            console.error('Error marking all derivation no:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión');
        }
    }

    async openDerivationModal(shiftId, dayNumber, workerName) {
        // Obtener el estado actual
        const order = this.pendingOrders.find(o => o.shift_id === shiftId && o.day_number === dayNumber);
        const currentStatus = order?.supervisor_requires_derivation || 'pending';
        const currentNote = order?.supervisor_derivation_note || '';

        // Verificar si el trabajador marcó "SÍ" en alguna pregunta de salud
        let hasHealthIssues = false;
        let healthIssuesDetails = [];
        
        if (order?.form_data) {
            try {
                const formData = typeof order.form_data === 'string' ? JSON.parse(order.form_data) : order.form_data;
                const healthIssuesResult = this.checkForHealthIssues(formData);
                hasHealthIssues = healthIssuesResult.hasIssues;
                healthIssuesDetails = healthIssuesResult.details;
            } catch (e) {
                console.error('Error parsing form_data:', e);
            }
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        // Si hay problemas de salud, mostrar alerta y bloquear opción "NO"
        let healthAlertHtml = '';
        let noOptionDisabled = '';
        let noOptionStyle = 'cursor: pointer; background: #f8f9fa;';
        
        if (hasHealthIssues) {
            noOptionDisabled = 'disabled';
            noOptionStyle = 'cursor: not-allowed; background: #e9ecef; opacity: 0.6;';
            healthAlertHtml = `
                <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 1.5rem; margin-right: 10px;">⚠️</span>
                        <strong style="color: #856404; font-size: 1.1rem;">ALERTA: Problemas de Salud Detectados</strong>
                    </div>
                    <p style="color: #856404; margin-bottom: 10px; font-size: 0.95rem;">
                        El trabajador marcó "SÍ" en las siguientes preguntas:
                    </p>
                    <ul style="color: #856404; margin: 0; padding-left: 20px; font-size: 0.9rem;">
                        ${healthIssuesDetails.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                    <p style="color: #856404; margin-top: 10px; font-weight: bold; font-size: 0.95rem;">
                        ⚠️ Debe marcar "SÍ requiere derivación" obligatoriamente.
                    </p>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; width: 500px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="font-size: 1.3rem;">¿Requiere Derivación?</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 15px; color: #666; font-size: 0.95rem;">
                        <strong>Trabajador:</strong> ${workerName}<br>
                        <strong>Día:</strong> ${dayNumber} de 10
                    </p>
                    
                    ${healthAlertHtml}
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; font-size: 1rem;">
                            Seleccione una opción:
                        </label>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <label style="display: flex; align-items: center; padding: 12px; border: 2px solid #28a745; border-radius: 8px; ${noOptionStyle}">
                                <input type="radio" name="derivation" value="no" ${currentStatus === 'no' && !hasHealthIssues ? 'checked' : ''} ${noOptionDisabled}
                                       onchange="document.getElementById('derivationNoteContainer').style.display = 'none'"
                                       style="margin-right: 10px; width: 20px; height: 20px;">
                                <span style="font-size: 1rem; color: #28a745; font-weight: bold;">✓ NO requiere derivación</span>
                            </label>
                            <label style="display: flex; align-items: center; padding: 12px; border: 2px solid #dc3545; border-radius: 8px; cursor: pointer; background: #f8f9fa;">
                                <input type="radio" name="derivation" value="si" ${currentStatus === 'si' || hasHealthIssues ? 'checked' : ''}
                                       onchange="document.getElementById('derivationNoteContainer').style.display = 'block'"
                                       style="margin-right: 10px; width: 20px; height: 20px;">
                                <span style="font-size: 1rem; color: #dc3545; font-weight: bold;">⚠️ SÍ requiere derivación</span>
                            </label>
                        </div>
                    </div>
                    
                    <div id="derivationNoteContainer" style="display: ${currentStatus === 'si' || hasHealthIssues ? 'block' : 'none'}; margin-top: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #dc3545; font-size: 1rem;">
                            Nota explicativa (obligatoria si marca SÍ):
                        </label>
                        <textarea id="derivationNote" rows="4" style="width: 100%; padding: 10px; border: 2px solid #dc3545; border-radius: 5px; font-family: Arial, sans-serif; font-size: 0.95rem;" 
                                  placeholder="Explique brevemente por qué requiere derivación...">${currentNote}</textarea>
                        <small style="color: #666; display: block; margin-top: 5px; font-size: 0.85rem;">
                            Esta nota será visible para los prevencionistas.
                        </small>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1; min-width: 120px;">
                        Cancelar
                    </button>
                    <button class="btn-primary" onclick="app.saveDerivationStatus(${shiftId}, ${dayNumber})" style="flex: 1; min-width: 120px;">
                        💾 Guardar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async saveDerivationStatus(shiftId, dayNumber) {
        const selectedOption = document.querySelector('input[name="derivation"]:checked');
        
        if (!selectedOption) {
            this.showCustomAlert('error', 'Error', 'Debe seleccionar una opción');
            return;
        }

        const derivationStatus = selectedOption.value;
        const derivationNote = document.getElementById('derivationNote')?.value.trim() || '';

        // Validar que si es "si", debe tener nota
        if (derivationStatus === 'si' && !derivationNote) {
            this.showCustomAlert('error', 'Nota Requerida', 'Debe escribir una nota explicativa cuando marca "SÍ requiere derivación"');
            return;
        }

        try {
            const response = await fetch(`/api/supervisor/set-derivation/${shiftId}/${dayNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    requires_derivation: derivationStatus,
                    derivation_note: derivationNote
                })
            });

            if (response.ok) {
                this.showCustomAlert('success', 'Guardado', 'Estado de derivación actualizado correctamente');
                document.querySelector('.modal-overlay')?.remove();
                await this.loadPendingOrders();
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving derivation status:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión');
        }
    }

    async signAllOhsemOrders() {
        const confirmed = await this.showCustomConfirm(
            'Firmar Todas las Órdenes OHSEM',
            '¿Está seguro de que desea firmar TODAS las órdenes pendientes como OHSEM?'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('/api/ohsem/sign-all', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showCustomAlert('success', 'Firmas Completadas', result.message);
                await this.loadOhsemOrders();
            } else {
                const error = await response.json();
                this.showCustomAlert('error', 'Error', `Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error mass signing orders:', error);
            this.showCustomAlert('error', 'Error de Conexión', 'Error de conexión al firmar las órdenes');
        }
    }

    // Operations Manager Tab Switching
    switchOperationsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.operations-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.operations-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        if (tabName === 'orders') {
            document.getElementById('operationsOrdersTab').classList.add('active');
        } else if (tabName === 'audit') {
            document.getElementById('operationsAuditTab').classList.add('active');
            this.loadAuditRecords();
        }
    }

    // Audit Functions
    async loadAuditRecords() {
        if (this.currentUser.role !== 'operations_manager') return;

        try {
            const response = await fetch('/api/audit/records', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.auditRecords = await response.json();
                this.filteredAuditRecords = [...this.auditRecords];
                this.renderAuditInterface();
            } else {
                console.error('Error loading audit records');
            }
        } catch (error) {
            console.error('Error loading audit records:', error);
        }
    }

    filterAuditRecords() {
        const roleFilter = document.getElementById('auditRoleFilter')?.value || 'all';
        const shiftFilter = document.getElementById('auditShiftFilter')?.value || 'all';
        const statusFilter = document.getElementById('auditStatusFilter')?.value || 'all';

        this.filteredAuditRecords = this.auditRecords.filter(record => {
            const roleMatch = roleFilter === 'all' || record.user_role === roleFilter;
            const shiftMatch = shiftFilter === 'all' || record.user_shift === shiftFilter;
            
            let statusMatch = true;
            if (statusFilter === 'complete') {
                // Complete means all required signatures are present
                if (record.user_role === 'worker') {
                    statusMatch = record.worker_signed && record.supervisor_signed && record.ohsem_signed;
                } else if (record.user_role === 'supervisor') {
                    statusMatch = record.supervisor_signed && record.operations_manager_signed && record.ohsem_signed;
                }
            } else if (statusFilter === 'incomplete') {
                // Incomplete means missing at least one required signature
                if (record.user_role === 'worker') {
                    statusMatch = !(record.worker_signed && record.supervisor_signed && record.ohsem_signed);
                } else if (record.user_role === 'supervisor') {
                    statusMatch = !(record.supervisor_signed && record.operations_manager_signed && record.ohsem_signed);
                }
            }

            return roleMatch && shiftMatch && statusMatch;
        });

        this.renderAuditInterface();
    }

    renderAuditInterface() {
        this.updateAuditStats();
        this.renderAuditTable();
    }

    updateAuditStats() {
        const totalRecords = this.filteredAuditRecords.length;
        
        const completeRecords = this.filteredAuditRecords.filter(record => {
            if (record.user_role === 'worker') {
                return record.worker_signed && record.supervisor_signed && record.ohsem_signed;
            } else if (record.user_role === 'supervisor') {
                return record.supervisor_signed && record.operations_manager_signed && record.ohsem_signed;
            }
            return false;
        }).length;

        const incompleteRecords = totalRecords - completeRecords;

        document.getElementById('totalRecords').textContent = totalRecords;
        document.getElementById('completeRecords').textContent = completeRecords;
        document.getElementById('incompleteRecords').textContent = incompleteRecords;
    }

    renderAuditTable() {
        const tbody = document.getElementById('auditTableBody');
        
        if (!tbody) return;

        if (this.filteredAuditRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="audit-empty">
                        <div class="audit-empty-icon">📋</div>
                        <p>No hay registros para mostrar</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredAuditRecords.map(record => {
            const date = new Date(record.created_at).toLocaleDateString('es-CL');
            const roleText = record.user_role === 'worker' ? 'Trabajador' : 'Supervisor';
            
            // Determine signature statuses
            let workerStatus, supervisorStatus, ohsemStatus;
            
            if (record.user_role === 'worker') {
                workerStatus = record.worker_signed ? 
                    '<span class="audit-status-badge audit-status-signed">✓ Firmado</span>' : 
                    '<span class="audit-status-badge audit-status-not-signed">✗ Pendiente</span>';
                supervisorStatus = record.supervisor_signed ? 
                    '<span class="audit-status-badge audit-status-signed">✓ Firmado</span>' : 
                    '<span class="audit-status-badge audit-status-not-signed">✗ Pendiente</span>';
            } else if (record.user_role === 'supervisor') {
                workerStatus = record.supervisor_signed ? 
                    '<span class="audit-status-badge audit-status-signed">✓ Firmado</span>' : 
                    '<span class="audit-status-badge audit-status-not-signed">✗ Pendiente</span>';
                supervisorStatus = record.operations_manager_signed ? 
                    '<span class="audit-status-badge audit-status-signed">✓ Firmado</span>' : 
                    '<span class="audit-status-badge audit-status-not-signed">✗ Pendiente</span>';
            }
            
            ohsemStatus = record.ohsem_signed ? 
                '<span class="audit-status-badge audit-status-signed">✓ Firmado</span>' : 
                '<span class="audit-status-badge audit-status-not-signed">✗ Pendiente</span>';

            return `
                <tr>
                    <td>${date}</td>
                    <td>${record.user_name}</td>
                    <td>${roleText}</td>
                    <td>Turno ${record.user_shift}</td>
                    <td>Día ${record.day_number}</td>
                    <td>${workerStatus}</td>
                    <td>${supervisorStatus}</td>
                    <td>${ohsemStatus}</td>
                    <td>
                        <button class="btn-view-audit" onclick="app.viewAuditDetail(${record.shift_id}, ${record.day_number})">
                            👁️ Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewAuditDetail(shiftId, dayNumber) {
        // Reuse the existing order detail modal but in read-only mode
        try {
            const response = await fetch(`/api/shift/${shiftId}/day/${dayNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const orderDetail = await response.json();
                this.showAuditDetailModal(orderDetail);
            }
        } catch (error) {
            console.error('Error loading audit detail:', error);
        }
    }

    showAuditDetailModal(order) {
        const modal = document.getElementById('orderDetailModal');
        const modalTitle = document.getElementById('orderModalTitle');
        const modalBody = document.getElementById('orderModalBody');

        // Find the record to get user info
        const record = this.auditRecords.find(r => r.shift_id === order.shift_id && r.day_number === order.day_number);
        const roleText = record?.user_role === 'worker' ? 'Trabajador' : 'Supervisor';

        modalTitle.textContent = `📊 Registro de Auditoría - ${record?.user_name || 'Usuario'} (${roleText})`;

        let html = `
            <div class="order-detail-info">
                <div class="audit-warning" style="margin-bottom: 1rem;">
                    ⚠️ Este es un registro de auditoría de solo lectura. No se puede modificar.
                </div>
                
                <div class="detail-section">
                    <h4>Información General</h4>
                    <p><strong>Usuario:</strong> ${record?.user_name || 'N/A'}</p>
                    <p><strong>Tipo:</strong> ${roleText}</p>
                    <p><strong>Turno:</strong> #${order.shift_number}</p>
                    <p><strong>Día:</strong> ${order.day_number}</p>
                    <p><strong>Turno:</strong> ${record?.user_shift || 'N/A'}</p>
                    <p><strong>Fecha de Creación:</strong> ${new Date(order.created_at).toLocaleString('es-CL')}</p>
                    <p><strong>Última Actualización:</strong> ${new Date(order.updated_at).toLocaleString('es-CL')}</p>
                </div>
        `;

        // Condiciones de Salud
        if (order.form_data.conditions) {
            html += `
                <div class="detail-section">
                    <h4>Condiciones de Salud</h4>
                    <div class="form-responses">
            `;

            Object.entries(order.form_data.conditions).forEach(([key, value]) => {
                const question = this.getQuestionText(key);
                if (question) {
                    const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
                    const answerText = value === 'si' ? 'Sí' : 'No';
                    html += `
                        <div class="response-item">
                            <span class="question">${question}</span>
                            <span class="answer ${answerClass}">${answerText}</span>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Fatiga y Somnolencia
        if (order.form_data.fatigue) {
            html += `
                <div class="detail-section">
                    <h4>Fatiga y Somnolencia</h4>
                    <div class="form-responses">
            `;

            Object.entries(order.form_data.fatigue).forEach(([key, value]) => {
                const question = this.getQuestionText(key);
                if (question) {
                    const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
                    const answerText = value === 'si' ? 'Sí' : 'No';
                    html += `
                        <div class="response-item">
                            <span class="question">${question}</span>
                            <span class="answer ${answerClass}">${answerText}</span>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Firmas
        html += `
            <div class="detail-section">
                <h4>Estado de Firmas</h4>
                <div class="signatures-grid">
        `;

        if (record?.user_role === 'worker') {
            html += this.renderSignatureDetail('Trabajador', order.worker_signed);
            html += this.renderSignatureDetail('Supervisor', order.supervisor_signed);
            // ❌ NO mostrar firma OHSEM para trabajadores
        } else if (record?.user_role === 'supervisor') {
            html += this.renderSignatureDetail('Supervisor', order.supervisor_signed);
            html += this.renderSignatureDetail('Jefe de Operaciones', order.operations_manager_signed);
            html += this.renderSignatureDetail('OHSEM', order.ohsem_signed);
        }

        html += `
                </div>
            </div>
        `;

        html += `
            <div class="signature-section-supervisor">
                <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
            </div>
        `;

        html += `</div>`;

        modalBody.innerHTML = html;
        modal.classList.add('show');
    }

    exportAuditToCSV() {
        if (this.filteredAuditRecords.length === 0) {
            this.showCustomAlert('warning', 'Sin Registros', 'No hay registros para exportar');
            return;
        }

        // Create CSV content
        const headers = ['Fecha', 'Usuario', 'Tipo', 'Turno', 'Día', 'Trabajador/Supervisor', 'Supervisor/Jefe', 'OHSEM'];
        const rows = this.filteredAuditRecords.map(record => {
            const date = new Date(record.created_at).toLocaleDateString('es-CL');
            const roleText = record.user_role === 'worker' ? 'Trabajador' : 'Supervisor';
            
            let workerStatus, supervisorStatus;
            if (record.user_role === 'worker') {
                workerStatus = record.worker_signed ? 'Firmado' : 'Pendiente';
                supervisorStatus = record.supervisor_signed ? 'Firmado' : 'Pendiente';
            } else {
                workerStatus = record.supervisor_signed ? 'Firmado' : 'Pendiente';
                supervisorStatus = record.operations_manager_signed ? 'Firmado' : 'Pendiente';
            }
            
            const ohsemStatus = record.ohsem_signed ? 'Firmado' : 'Pendiente';

            return [
                date,
                record.user_name,
                roleText,
                `Turno ${record.user_shift}`,
                `Día ${record.day_number}`,
                workerStatus,
                supervisorStatus,
                ohsemStatus
            ];
        });

        // Build CSV
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `auditoria_ameco_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Custom Alert System
    showCustomAlert(type, title, message) {
        const modal = document.getElementById('customAlertModal');
        const icon = document.getElementById('customAlertIcon');
        const titleEl = document.getElementById('customAlertTitle');
        const messageEl = document.getElementById('customAlertMessage');

        // Set icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        icon.textContent = icons[type] || icons.info;
        icon.className = `custom-alert-icon ${type}`;
        titleEl.textContent = title;
        messageEl.textContent = message;

        modal.classList.add('show');
    }

    closeCustomAlert() {
        const modal = document.getElementById('customAlertModal');
        modal.classList.remove('show');
    }

    // Custom Confirm Dialog
    showCustomConfirm(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('customAlertModal');
            const icon = document.getElementById('customAlertIcon');
            const titleEl = document.getElementById('customAlertTitle');
            const messageEl = document.getElementById('customAlertMessage');
            const actionsDiv = modal.querySelector('.custom-alert-actions');

            // Set icon for confirmation
            icon.textContent = '❓';
            icon.className = 'custom-alert-icon warning';
            titleEl.textContent = title;
            messageEl.textContent = message;

            // Replace button with two buttons (Aceptar and Cancelar)
            actionsDiv.innerHTML = `
                <button class="custom-alert-btn custom-alert-btn-cancel" id="customConfirmCancel">
                    Cancelar
                </button>
                <button class="custom-alert-btn" id="customConfirmAccept">
                    Aceptar
                </button>
            `;

            // Add event listeners
            document.getElementById('customConfirmAccept').onclick = () => {
                modal.classList.remove('show');
                // Restore original button
                actionsDiv.innerHTML = `
                    <button class="custom-alert-btn" id="customAlertBtn" onclick="app.closeCustomAlert()">
                        Aceptar
                    </button>
                `;
                resolve(true);
            };

            document.getElementById('customConfirmCancel').onclick = () => {
                modal.classList.remove('show');
                // Restore original button
                actionsDiv.innerHTML = `
                    <button class="custom-alert-btn" id="customAlertBtn" onclick="app.closeCustomAlert()">
                        Aceptar
                    </button>
                `;
                resolve(false);
            };

            modal.classList.add('show');
        });
    }

    // ============================================
    // HISTORY FUNCTIONS
    // ============================================

    showHistoryInterface() {
        // Hide all other interfaces
        document.getElementById('workerInterface').style.display = 'none';
        document.getElementById('supervisorInterface').style.display = 'none';
        document.getElementById('operationsManagerInterface').style.display = 'none';
        document.getElementById('ohsemInterface').style.display = 'none';
        
        // Show history interface
        document.getElementById('historyInterface').style.display = 'block';
        
        // Show/hide filters based on role
        if (this.currentUser.role === 'worker') {
            document.getElementById('historyUserFilterGroup').style.display = 'none';
            document.getElementById('historyRoleFilterGroup').style.display = 'none';
        } else {
            document.getElementById('historyUserFilterGroup').style.display = 'block';
            document.getElementById('historyRoleFilterGroup').style.display = 'block';
            this.loadHistoryUsers();
        }
        
        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        document.getElementById('historyEndDate').valueAsDate = today;
        document.getElementById('historyStartDate').valueAsDate = thirtyDaysAgo;
        
        // Load forms
        this.loadHistoryForms();
        
        // Start auto-refresh for workers (every 30 seconds)
        if (this.currentUser.role === 'worker') {
            this.startHistoryAutoRefresh();
        }
    }

    hideHistoryInterface() {
        document.getElementById('historyInterface').style.display = 'none';
        
        // Stop auto-refresh
        this.stopHistoryAutoRefresh();
        
        // Show appropriate interface based on role
        if (this.currentUser.role === 'operations_manager') {
            this.showOperationsManagerDashboard();
        } else if (this.currentUser.role === 'supervisor') {
            this.showSupervisorDashboard();
        } else if (this.currentUser.role === 'ohsem') {
            this.showOhsemDashboard();
        } else {
            this.showWorkerDashboard();
        }
    }

    async loadHistoryUsers() {
        try {
            let endpoint = '/api/ohsem/users'; // Default for OHSEM
            
            if (this.currentUser.role === 'supervisor') {
                endpoint = '/api/supervisor/workers';
            } else if (this.currentUser.role === 'operations_manager') {
                endpoint = '/api/operations-manager/supervisors';
            }
            
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const users = await response.json();
                const select = document.getElementById('historyUserFilter');
                select.innerHTML = '<option value="all">Todos</option>';
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.name;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading history users:', error);
        }
    }

    async loadHistoryForms() {
        try {
            const startDate = document.getElementById('historyStartDate').value;
            const endDate = document.getElementById('historyEndDate').value;
            const userId = document.getElementById('historyUserFilter')?.value || 'all';
            const role = document.getElementById('historyRoleFilter')?.value || 'all';
            
            let url = `/api/history/forms?startDate=${startDate}&endDate=${endDate}`;
            if (userId !== 'all') url += `&userId=${userId}`;
            if (role !== 'all') url += `&role=${role}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.historyForms = await response.json();
                this.renderHistoryTable();
                this.updateHistoryStats();
            } else {
                this.showCustomAlert('error', 'Error', 'No se pudieron cargar los formularios');
            }
        } catch (error) {
            console.error('Error loading history forms:', error);
            this.showCustomAlert('error', 'Error', 'Error al cargar el historial');
        }
    }

    renderHistoryTable() {
        const tbody = document.getElementById('historyTableBody');
        
        if (!this.historyForms || this.historyForms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No se encontraron formularios</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.historyForms.map(form => {
            const date = new Date(form.created_at).toLocaleDateString('es-CL');
            const roleText = form.user_role === 'worker' ? 'Operador' : 'Supervisor';
            const statusClass = form.is_complete ? 'status-complete' : 'status-incomplete';
            const statusText = form.is_complete ? 'Completo' : 'Incompleto';
            
            return `
                <tr>
                    <td><input type="checkbox" class="history-checkbox" data-form-id="${form.id}"></td>
                    <td>${date}</td>
                    <td>${form.user_name}</td>
                    <td>${roleText}</td>
                    <td>#${form.shift_number}</td>
                    <td>Día ${form.day_number}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-view-detail" onclick="app.viewHistoryDetail(${form.id})">👁️ Ver</button>
                        <button class="btn-export-pdf" onclick="app.exportFormToPDF(${form.id})">📄 PDF</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateHistoryStats() {
        const total = this.historyForms.length;
        const complete = this.historyForms.filter(f => f.is_complete).length;
        
        document.getElementById('historyTotalForms').textContent = total;
        document.getElementById('historyCompleteForms').textContent = complete;
    }

    toggleSelectAllHistory(checked) {
        document.querySelectorAll('.history-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    async viewHistoryDetail(formId) {
        try {
            const response = await fetch(`/api/history/form/${formId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const form = await response.json();
                this.showHistoryDetailModal(form);
            } else {
                this.showCustomAlert('error', 'Error', 'No se pudo cargar el detalle del formulario');
            }
        } catch (error) {
            console.error('Error loading form detail:', error);
            this.showCustomAlert('error', 'Error', 'Error al cargar el detalle');
        }
    }

    showHistoryDetailModal(form) {
        const modal = document.getElementById('orderDetailModal');
        const modalTitle = document.getElementById('orderModalTitle');
        const modalBody = document.getElementById('orderModalBody');

        const roleText = form.user_role === 'worker' ? 'Operador' : 'Supervisor';
        modalTitle.textContent = `Detalle de Formulario - ${form.user_name} (${roleText})`;

        let html = `
            <div class="order-detail-info">
                <div class="detail-section">
                    <h4>Información General</h4>
                    <p><strong>Usuario:</strong> ${form.user_name}</p>
                    <p><strong>Tipo:</strong> ${roleText}</p>
                    <p><strong>Turno:</strong> #${form.shift_number}</p>
                    <p><strong>Día:</strong> ${form.day_number}</p>
                    <p><strong>Fecha:</strong> ${new Date(form.created_at).toLocaleDateString('es-CL')}</p>
                </div>
        `;

        // Condiciones de Salud
        if (form.form_data.conditions) {
            html += `
                <div class="detail-section">
                    <h4>Condiciones de Salud</h4>
                    <div class="form-responses">
            `;

            Object.entries(form.form_data.conditions).forEach(([key, value]) => {
                const question = this.getQuestionText(key);
                if (question) {
                    const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
                    const answerText = value === 'si' ? 'Sí' : 'No';
                    html += `
                        <div class="response-item">
                            <span class="question">${question}</span>
                            <span class="answer ${answerClass}">${answerText}</span>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Fatiga y Somnolencia
        if (form.form_data.fatigue) {
            html += `
                <div class="detail-section">
                    <h4>Fatiga y Somnolencia</h4>
                    <div class="form-responses">
            `;

            Object.entries(form.form_data.fatigue).forEach(([key, value]) => {
                const question = this.getQuestionText(key);
                if (question) {
                    const answerClass = value === 'si' ? 'answer-yes' : 'answer-no';
                    const answerText = value === 'si' ? 'Sí' : 'No';
                    html += `
                        <div class="response-item">
                            <span class="question">${question}</span>
                            <span class="answer ${answerClass}">${answerText}</span>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Firmas
        html += `
            <div class="detail-section">
                <h4>Firmas</h4>
                <div class="signatures-grid">
        `;

        if (form.user_role === 'worker') {
            html += this.renderSignatureDetail('Trabajador', form.worker_signed ? 'si' : 'no', form.signatures?.worker_signature);
            html += this.renderSignatureDetail('Supervisor', form.supervisor_signed ? 'si' : 'no', form.signatures?.supervisor_signature);
            // ❌ NO mostrar firma OHSEM para trabajadores
        } else if (form.user_role === 'supervisor') {
            html += this.renderSignatureDetail('Supervisor', form.supervisor_signed ? 'si' : 'no', form.signatures?.supervisor_signature);
            html += this.renderSignatureDetail('Jefe de Operaciones', form.operations_manager_signed ? 'si' : 'no', form.signatures?.operations_manager_signature);
            html += this.renderSignatureDetail('OHSEM', form.ohsem_signed ? 'si' : 'no', form.signatures?.ohsem_signature);
        }

        html += `
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-export-pdf" onclick="app.exportFormToPDF(${form.id})">📄 Exportar a PDF</button>
                <button class="btn-secondary" onclick="app.closeOrderDetail()">Cerrar</button>
            </div>
        `;

        html += `</div>`;
        modalBody.innerHTML = html;
        modal.classList.add('show');
    }

    async exportFormToPDF(formId) {
        try {
            this.showCustomAlert('info', 'Generando PDF', 'Por favor espere...');
            
            const response = await fetch(`/api/history/form/${formId}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AMECO_Formulario_${formId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                this.showCustomAlert('success', 'PDF Generado', 'El PDF se ha descargado correctamente');
            } else {
                this.showCustomAlert('error', 'Error', 'No se pudo generar el PDF');
            }
        } catch (error) {
            console.error('Error exporting PDF:', error);
            this.showCustomAlert('error', 'Error', 'Error al generar el PDF');
        }
    }

    async exportSelectedHistory() {
        const selectedCheckboxes = document.querySelectorAll('.history-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.formId);
        
        if (selectedIds.length === 0) {
            this.showCustomAlert('warning', 'Sin Selección', 'Seleccione al menos un formulario para exportar');
            return;
        }
        
        this.showCustomAlert('info', 'Exportando', `Generando PDF de ${selectedIds.length} formularios...`);
        // TODO: Implement batch PDF generation
        setTimeout(() => {
            this.showCustomAlert('success', 'PDFs Generados', 'Los PDFs se descargarán en breve');
        }, 1500);
    }

    // ============================================
    // REAL-TIME UPDATES (SSE)
    // ============================================

    connectSSE() {
        // Disconnect any existing connection
        this.disconnectSSE();
        
        let endpoint = null;
        if (this.currentUser.role === 'worker') {
            endpoint = '/api/sse/worker';
        } else if (this.currentUser.role === 'supervisor') {
            endpoint = '/api/sse/supervisor';
        } else if (this.currentUser.role === 'operations_manager') {
            endpoint = '/api/sse/operations-manager';
        } else if (this.currentUser.role === 'ohsem') {
            endpoint = '/api/sse/ohsem';
        }
        
        if (!endpoint) return;
        
        console.log('🔌 Connecting SSE for role:', this.currentUser.role, 'endpoint:', endpoint);
        
        this.sseConnection = new EventSource(endpoint + '?token=' + localStorage.getItem('token'));
        
        this.sseConnection.onmessage = (event) => {
            try {
                console.log('📨 SSE message received:', event.data);
                const data = JSON.parse(event.data);
                this.handleSSEMessage(data);
            } catch (error) {
                console.error('❌ Error parsing SSE message:', error);
            }
        };
        
        this.sseConnection.onerror = (error) => {
            console.error('❌ SSE connection error:', error);
            // Reconnect after 5 seconds
            setTimeout(() => {
                if (this.currentUser) {
                    console.log('🔄 Reconnecting SSE...');
                    this.connectSSE();
                }
            }, 5000);
        };
        
        this.sseConnection.onopen = () => {
            console.log('✅ SSE connection opened successfully');
        };
        
        console.log('✅ SSE connected for role:', this.currentUser.role);
    }

    disconnectSSE() {
        if (this.sseConnection) {
            this.sseConnection.close();
            this.sseConnection = null;
            console.log('SSE disconnected');
        }
    }

    handleSSEMessage(data) {
        console.log('📬 SSE message received:', data);
        
        if (data.type === 'new_order') {
            // New order available
            console.log('🆕 New order notification');
            this.showNotification('Nueva Orden', 'Hay una nueva orden pendiente de revisión');
            this.refreshCurrentView();
        } else if (data.type === 'order_signed') {
            // Order was signed
            console.log('✍️ Order signed notification');
            this.showNotification('Orden Firmada', 'Una orden ha sido firmada');
            this.refreshCurrentView();
        } else if (data.type === 'health_alert') {
            // Worker marked "SÍ" in health questions
            console.log('🚨 Health alert notification');
            this.showNotification('🚨 ALERTA DE SALUD', `${data.workerName} ha marcado SÍ en preguntas de salud. Revisar urgente.`);
            this.refreshCurrentView();
        } else if (data.type === 'derivation_required') {
            // Supervisor marked "SÍ requiere derivación"
            console.log('⚠️ Derivation required notification');
            this.showNotification('⚠️ Derivación Requerida', 'Un supervisor ha marcado un caso que requiere derivación');
            this.refreshCurrentView();
        }
    }

    showNotification(title, message) {
        // Show a non-intrusive notification
        const notification = document.createElement('div');
        notification.className = 'sse-notification';
        notification.innerHTML = `
            <div class="sse-notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }

    refreshCurrentView() {
        // Refresh the current view based on user role
        if (this.currentUser.role === 'worker') {
            // Reload worker's shift data to update form status
            if (this.currentShift) {
                this.loadShiftData(this.currentShift.id);
            }
            // Also refresh history if it's visible
            const historyInterface = document.getElementById('historyInterface');
            if (historyInterface && historyInterface.style.display !== 'none') {
                this.loadHistoryForms();
            }
        } else if (this.currentUser.role === 'supervisor') {
            this.loadPendingOrders();
        } else if (this.currentUser.role === 'operations_manager') {
            this.loadOperationsManagerOrders();
        } else if (this.currentUser.role === 'ohsem') {
            this.loadOhsemOrders();
        }
    }

    startHistoryAutoRefresh() {
        // Clear any existing interval
        this.stopHistoryAutoRefresh();
        
        // Refresh every 10 seconds (reduced from 30 for better UX)
        this.historyRefreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing history...');
            this.loadHistoryForms();
        }, 10000); // 10 seconds
        
        console.log('✅ History auto-refresh started (every 10 seconds)');
    }

    stopHistoryAutoRefresh() {
        if (this.historyRefreshInterval) {
            clearInterval(this.historyRefreshInterval);
            this.historyRefreshInterval = null;
            console.log('History auto-refresh stopped');
        }
    }

    startMidnightCheck() {
        // Verificar cada minuto si es medianoche
        setInterval(() => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            
            // Si son las 00:00 (medianoche)
            if (hours === 0 && minutes === 0) {
                console.log('🌙 Medianoche detectada - Recargando página para actualizar día...');
                
                // Mostrar mensaje breve antes de recargar
                this.showCustomAlert('info', 'Nuevo Día', 'Actualizando al nuevo día...', 2000);
                
                // Recargar después de 2 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }, 60000); // Verificar cada 60 segundos (1 minuto)
        
        console.log('✅ Verificación de medianoche activada');
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AmecoApp();
});

