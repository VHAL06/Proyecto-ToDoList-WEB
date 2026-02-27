const API_URL = 'http://localhost:3000/api';

const inputTarea = document.getElementById('NuevaTar');
const botonAgregar = document.getElementById('AgregarTarbtn');
const listaContainer = document.getElementById('listaTareasContainer');
const contadorSpan = document.getElementById('contadorPendientes');

let tareas = [];
let filtroActual = 'all';

async function cargarTareas() {
    try {
        listaContainer.innerHTML = '<div class="loading-message">Cargando tareas...</div>';
        
        const url = filtroActual === 'all' 
            ? `${API_URL}/todos`
            : `${API_URL}/todos?status=${filtroActual}`;
            
        const respuesta = await fetch(url);
        const responseData = await respuesta.json();
        
        tareas = (responseData.data || [])
            .map(t => ({
                id: t.id,
                titulo: t.title,
                completada: t.completed === 1
            }))
            .sort((a, b) => a.id - b.id);
        
        renderizarTareas();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar las tareas');
    }
}

async function crearTarea(titulo) {
    try {
        const respuesta = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titulo })
        });
        
        const responseData = await respuesta.json();
        
        if (!respuesta.ok) {
            throw new Error(responseData.error?.message || 'Error al crear');
        }
        
        const nuevaTarea = {
            id: responseData.data.id,
            titulo: responseData.data.title,
            completada: responseData.data.completed === 1
        };
        
        tareas.push(nuevaTarea);
        tareas.sort((a, b) => a.id - b.id);
        renderizarTareas();
        inputTarea.value = '';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear la tarea');
    }
}

async function actualizarTarea(tarea) {
    try {
        const respuesta = await fetch(`${API_URL}/todos/${tarea.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: tarea.titulo,
                completed: tarea.completada
            })
        });
        
        if (!respuesta.ok && respuesta.status !== 204) {
            const responseData = await respuesta.json();
            throw new Error(responseData.error?.message || 'Error al actualizar');
        }
        
        if (respuesta.status !== 204) {
            const responseData = await respuesta.json();
            if (responseData.data) {
                tarea.titulo = responseData.data.title;
                tarea.completada = responseData.data.completed === 1;
            }
        }
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        alert('Error al guardar los cambios');
    }
}

async function eliminarTarea(id) {
    try {
        const respuesta = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (!respuesta.ok && respuesta.status !== 204) {
            const responseData = await respuesta.json();
            throw new Error(responseData.error?.message || 'Error al eliminar');
        }
        
        tareas = tareas.filter(t => t.id !== id);
        renderizarTareas();
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        alert('Error al eliminar la tarea');
    }
}

async function limpiarCompletadas() {
    const completadas = tareas.filter(t => t.completada);

    if (completadas.length === 0) {
        alert('No hay tareas completadas');
        return;
    }

    if (!confirm(`¿Eliminar ${completadas.length} tarea(s) completada(s)?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/todos/completed`, {
            method: 'DELETE'
        });

        const responseData = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(responseData.error?.message || 'Error al limpiar');
        }

        await cargarTareas();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al limpiar tareas completadas');
    }
}

function renderizarTareas() {
    listaContainer.innerHTML = '';
    
    let tareasFiltradas = tareas;
    
    if (filtroActual === 'active') {
        tareasFiltradas = tareas.filter(t => !t.completada);
    } else if (filtroActual === 'completed') {
        tareasFiltradas = tareas.filter(t => t.completada);
    }
    
    if (tareasFiltradas.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = filtroActual === 'all' ? 'No hay tareas' : 
                                   filtroActual === 'active' ? 'No hay tareas pendientes' : 
                                   'No hay tareas completadas';
        listaContainer.appendChild(emptyMessage);
    } else {
        tareasFiltradas.forEach(tarea => {
            const item = document.createElement('div');
            item.className = 'caja-item';
            if (tarea.completada) item.classList.add('completada');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'item-checkbox';
            checkbox.checked = tarea.completada;
            
            checkbox.addEventListener('change', async function() {
                tarea.completada = checkbox.checked;
                await actualizarTarea(tarea);
                renderizarTareas();
            });
            
            const texto = document.createElement('span');
            texto.className = 'item-texto';
            texto.textContent = tarea.titulo;
            
            texto.addEventListener('dblclick', function() {
                editarTarea(tarea, texto);
            });
            
            const acciones = document.createElement('div');
            acciones.className = 'item-acciones';
            
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
            
            btnEliminar.addEventListener('click', function() {
                if (confirm('¿Eliminar esta tarea?')) {
                    eliminarTarea(tarea.id);
                }
            });
            
            acciones.appendChild(btnEliminar);
            
            item.appendChild(checkbox);
            item.appendChild(texto);
            item.appendChild(acciones);
            
            listaContainer.appendChild(item);
        });
    }
    
    actualizarContador();
}

function editarTarea(tarea, elementoTexto) {
    const inputEdit = document.createElement('input');
    inputEdit.type = 'text';
    inputEdit.value = tarea.titulo;
    inputEdit.className = 'edit-input';
    
    elementoTexto.parentNode.replaceChild(inputEdit, elementoTexto);
    inputEdit.focus();
    
    async function guardarEdicion() {
        const nuevoTexto = inputEdit.value.trim();
        if (nuevoTexto !== '') {
            tarea.titulo = nuevoTexto;
            await actualizarTarea(tarea);
        }
        renderizarTareas();
    }
    
    inputEdit.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') guardarEdicion();
    });
    
    inputEdit.addEventListener('blur', guardarEdicion);
}

function actualizarContador() {
    const pendientes = tareas.filter(t => !t.completada).length;
    
    if (pendientes === 1) {
        contadorSpan.textContent = '1 tarea pendiente';
    } else {
        contadorSpan.textContent = `${pendientes} tareas pendientes`;
    }
}

function agregarTarea() {
    const texto = inputTarea.value.trim();
    
    if (texto === '') {
        alert('No puedes agregar una tarea vacía');
        return;
    }
    
    crearTarea(texto);
}

function mostrarError(mensaje) {
    listaContainer.innerHTML = `<div class="error-message">${mensaje}</div>`;
}

async function marcarTodas() {
    if (tareas.length === 0) return;
    
    const algunaPendiente = tareas.some(t => !t.completada);
    
    for (const tarea of tareas) {
        tarea.completada = algunaPendiente;
        await actualizarTarea(tarea);
    }
    
    renderizarTareas();
}

botonAgregar.addEventListener('click', agregarTarea);

inputTarea.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') agregarTarea();
});

const filtros = document.querySelectorAll('.filtro');
filtros.forEach(boton => {
    boton.addEventListener('click', function() {
        filtros.forEach(btn => btn.classList.remove('activo'));
        this.classList.add('activo');
        filtroActual = this.dataset.filtro;
        cargarTareas();
    });
});

const btnMarcarTodas = document.querySelector('.btn-marcar');
if (btnMarcarTodas) {
    btnMarcarTodas.addEventListener('click', marcarTodas);
}

const btnLimpiar = document.getElementById('limpiarCompletadas');
if (btnLimpiar) {
    btnLimpiar.addEventListener('click', limpiarCompletadas);
}

cargarTareas();