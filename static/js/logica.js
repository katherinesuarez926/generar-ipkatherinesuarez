const $ = id => document.getElementById(id);
const btnValidar = $('btnValidar');
const btnGenerar = $('btnGenerar');
const btnBorrar = $('btnBorrar');
const btnSalir = $('btnSalir');
const resultsBody = $('resultsBody');
const cantidadInput = $('cantidad');

let ipValidada = false;
let currentData = {};
const rangos = {
    A: { inicio: "1.0.0.0", fin: "126.255.255.255" },
    B: { inicio: "128.0.0.0", fin: "191.255.255.255" },
    C: { inicio: "192.0.0.0", fin: "223.255.255.255" }
};

function showMessage(msg, type = 'success') {
    let overlay = document.querySelector('.message-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'message-overlay';
        document.body.appendChild(overlay);
    }
    const div = document.createElement('div');
    div.className = `console-message ${type}`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { overlay.classList.add('show'); div.classList.add('show'); }, 10);
    setTimeout(() => {
        div.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => div.remove(), 300);
    }, 2000);
}

function actualizarEstadoValidar() {
    const o1 = $('o1');
    const o2 = $('o2');
    const o3 = $('o3');
    const o4 = $('o4');
    
    if (!o1 || !o2 || !o3 || !o4) {
        btnValidar.disabled = true;
        return;
    }
    
    const v1 = o1.value ? o1.value.trim() : '';
    const v2 = o2.value ? o2.value.trim() : '';
    const v3 = o3.value ? o3.value.trim() : '';
    const v4 = o4.value ? o4.value.trim() : '';
    
    const allValid = v1 !== '' && v2 !== '' && v3 !== '' && v4 !== '' &&
                     !isNaN(parseInt(v1)) && parseInt(v1) >= 0 && parseInt(v1) <= 255 &&
                     !isNaN(parseInt(v2)) && parseInt(v2) >= 0 && parseInt(v2) <= 255 &&
                     !isNaN(parseInt(v3)) && parseInt(v3) >= 0 && parseInt(v3) <= 255 &&
                     !isNaN(parseInt(v4)) && parseInt(v4) >= 0 && parseInt(v4) <= 255;
    
    btnValidar.disabled = !allValid;
}

function getClaseReal(o1) {
    if (o1 >= 1 && o1 <= 126) return 'A';
    if (o1 >= 128 && o1 <= 191) return 'B';
    if (o1 >= 192 && o1 <= 223) return 'C';
    return 'E';
}

function limpiarTodo() {
    const octetos = ['o1', 'o2', 'o3', 'o4'];
    octetos.forEach(id => {
        const input = $(id);
        if (input) {
            input.value = '';
            input.disabled = true;
            input.classList.remove('error', 'correcto');
        }
    });
    
    const indicators = ['error-o1', 'error-o2', 'error-o3', 'error-o4'];
    indicators.forEach(id => {
        const el = $(id);
        if (el) el.classList.remove('show');
    });
    
    const clases = ['claseA', 'claseB', 'claseC'];
    clases.forEach(id => {
        const r = $(id);
        if (r) r.checked = false;
    });
    
    const rangoInicio = $('rangoInicio');
    const rangoFin = $('rangoFin');
    
    if (rangoInicio) rangoInicio.value = '';
    if (rangoFin) rangoFin.value = '';
    if (cantidadInput) {
        cantidadInput.value = '';
        cantidadInput.disabled = true;
    }
    
    if (btnValidar) btnValidar.disabled = true;
    if (btnGenerar) btnGenerar.disabled = true;
    if (resultsBody) resultsBody.innerHTML = '';
    
    ipValidada = false;
    currentData = {};
}

function validarOctetosAntesDeGenerar() {
    const octetos = ['o1', 'o2', 'o3', 'o4'];
    let hayError = false;
    let primerErrorIndex = -1;

    octetos.forEach((id, index) => {
        const input = $(id);
        if (!input) return;
        
        const valor = input.value ? input.value.trim() : '';
        const err = $(`error-${id}`);
        
        input.classList.remove('error', 'correcto');
        if(err) err.classList.remove('show');

        if (valor === '') {
            input.classList.add('error');
            if(err) { err.textContent = "VACÍO"; err.classList.add('show'); }
            hayError = true;
            if (primerErrorIndex === -1) primerErrorIndex = index;
        } else {
            const num = parseInt(valor);
            if (isNaN(num) || num < 0 || num > 255) {
                input.classList.add('error');
                if(err) { err.textContent = "FUERA RANGO"; err.classList.add('show'); }
                hayError = true;
                if (primerErrorIndex === -1) primerErrorIndex = index;
            } else {
                input.classList.add('correcto');
            }
        }
    });

    if (hayError) {
        if (primerErrorIndex !== -1) {
            const primerInput = $(octetos[primerErrorIndex]);
            if (primerInput && (!primerInput.value || primerInput.value.trim() === '')) {
                showMessage('No se puede dejar el octeto vacio', 'error');
            } else {
                showMessage(`ERROR: OCTETO ${primerErrorIndex + 1} FUERA DE RANGO (0-255)`, 'error');
            }
        }
        return false;
    }
    return true;
}

['o1','o2','o3','o4'].forEach(id => {
    const input = $(id);
    if (!input) return;
    
    input.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        
        const val = this.value;
        const err = $(`error-${id}`);
        this.classList.remove('error','correcto');
        if(err) err.classList.remove('show');
        
        if (val === '') { 
            actualizarEstadoValidar(); 
            return; 
        }
        
        const num = parseInt(val);
        if (num > 255) {
            this.classList.add('error');
            if(err) { err.textContent = "FUERA RANGO"; err.classList.add('show'); }
            setTimeout(() => { 
                this.value = ''; 
                this.classList.remove('error'); 
                if(err) err.classList.remove('show'); 
                actualizarEstadoValidar(); 
            }, 600);
            return;
        }
        
        this.classList.add('correcto');
        actualizarEstadoValidar();
    });
    
    input.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const clean = text.replace(/[^0-9]/g, '');
        document.execCommand('insertText', false, clean);
    });
});

document.querySelectorAll('input[name="clase"]').forEach(r => {
    r.addEventListener('change', function() {
        const c = this.value;
        
        const octetos = ['o1', 'o2', 'o3', 'o4'];
        octetos.forEach(id => {
            const i = $(id);
            if (i) {
                i.disabled = false;
                i.value = '';
                i.classList.remove('error','correcto');
            }
        });
        
        const indicators = ['error-o1', 'error-o2', 'error-o3', 'error-o4'];
        indicators.forEach(id => {
            const e = $(id);
            if (e) e.classList.remove('show');
        });
        
        const rangoInicio = $('rangoInicio');
        const rangoFin = $('rangoFin');
        if (rangoInicio && rangos[c]) rangoInicio.value = rangos[c].inicio;
        if (rangoFin && rangos[c]) rangoFin.value = rangos[c].fin;
        
        ipValidada = false;
        if (btnGenerar) btnGenerar.disabled = true;
        if (btnValidar) btnValidar.disabled = true;
        
        if (cantidadInput) {
            cantidadInput.disabled = true;
            cantidadInput.value = '';
        }
        
        if (resultsBody) resultsBody.innerHTML = '';
        
        showMessage(`CLASE ${c} SELECCIONADA`, 'info');
        
        const o1 = $('o1');
        if (o1) o1.focus();
    });
});

if (btnValidar) {
    btnValidar.addEventListener('click', () => {
        const o1Val = $('o1');
        const o2Val = $('o2');
        const o3Val = $('o3');
        const o4Val = $('o4');
        
        if (!o1Val || !o2Val || !o3Val || !o4Val) return;
        
        const o1 = parseInt(o1Val.value);
        const o2 = parseInt(o2Val.value);
        const o3 = parseInt(o3Val.value);
        const o4 = parseInt(o4Val.value);
        
        const claseRadio = document.querySelector('input[name="clase"]:checked');
        const clase = claseRadio ? claseRadio.value : null;
        
        if (!clase) {
            showMessage('Seleccione una clase de IP', 'error');
            return;
        }
        
        const real = getClaseReal(o1);
        if(real !== clase) {
            showMessage(`ERROR: IP ES CLASE ${real}. CAMPOS LIMPIADOS`, 'error');
            limpiarTodo();
            return;
        }
        
        const octetos = ['o1', 'o2', 'o3', 'o4'];
        octetos.forEach(id => {
            const i = $(id);
            if (i) {
                i.disabled = true;
                i.classList.remove('error','correcto');
            }
        });
        
        const indicators = ['error-o1', 'error-o2', 'error-o3', 'error-o4'];
        indicators.forEach(id => {
            const e = $(id);
            if (e) e.classList.remove('show');
        });
        
        if (btnValidar) btnValidar.disabled = true;
        
        if (cantidadInput) cantidadInput.disabled = false;
        if (btnGenerar) btnGenerar.disabled = false;
        
        ipValidada = true;
        currentData = {o1, o2, o3, o4, clase};
        showMessage(`IP VALIDADA: ${o1}.${o2}.${o3}.${o4}`, 'success');
        
        if (cantidadInput) cantidadInput.focus();
    });
}

if (btnGenerar) {
    btnGenerar.addEventListener('click', async () => {
        if(!ipValidada) { 
            showMessage('ERROR: PRIMERO VALIDE UNA IP', 'error'); 
            return; 
        }
        
        if(!validarOctetosAntesDeGenerar()) {
            return;
        }
        
        const cant = cantidadInput ? parseInt(cantidadInput.value) : 0;
        
        if(!cant || cant < 1) { 
            showMessage('ERROR: CANTIDAD INVALIDA', 'error'); 
            return; 
        }
        
        btnGenerar.disabled = true;
        showMessage('PROCESANDO...', 'info');
        
        try {
            const res = await fetch('/generate', { 
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body:JSON.stringify({...currentData, cantidad:cant}) 
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.error);
            
            if (resultsBody) {
                resultsBody.innerHTML = '';
                data.results.forEach(r => {
                    resultsBody.innerHTML += `<tr><td>${r.num}</td><td>${r.subnet}</td><td>${r.mask}</td><td>${r.first}</td><td>${r.last}</td><td>${r.broadcast}</td></tr>`;
                });
            }
            showMessage(`EXITO: ${data.generated} SUBREDES GENERADAS`, 'success');
            
            // 🔒 BLOQUEAR DESPUÉS DE GENERAR
            if (cantidadInput) cantidadInput.disabled = true;
            btnGenerar.disabled = true;
            
        } catch(e) { 
            showMessage(`ERROR: ${e.message}`, 'error');
            // Si hay error, desbloquear para permitir corrección
            if (cantidadInput) cantidadInput.disabled = false;
            btnGenerar.disabled = false;
        }
    });
}

if (btnBorrar) {
    btnBorrar.addEventListener('click', () => {
        limpiarTodo();
        showMessage('SISTEMA REINICIADO', 'info');
    });
}

if (btnSalir) {
    btnSalir.addEventListener('click', () => {
        // Redirigir a una página en blanco para "salir" de la aplicación
        window.location.href = "about:blank";
    });
}