const tablaTareas = document.querySelector("table tbody")
const inputTarea = document.querySelector("input#taskInput")
const btnAgregarTarea = document.querySelector("button#addTaskBtn")

const URL = "https://64de8e2d825d19d9bfb2b6ba.mockapi.io/api/v1/tasks"

const tareas = []

function armarFilaTarea(tarea) {
    return `<tr>
                <td>${tarea.descripcion}</td>
                <td><input type="checkbox" value="${tarea.completada}"></td>
                <td><button class="button-delete" id="${tarea.id}">🗑️</button></td>
            </tr>`
}

function retornarFechaActual() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    const formattedDate = `${year}-${month}-${day}`
    return formattedDate
}

function cargarTareasEnHTML() {
    if (tareas.length > 0) {
        tablaTareas.innerHTML = ""
        tareas.forEach(tarea => tablaTareas.innerHTML += armarFilaTarea(tarea))
    }
}

function cargarNuevaTarea() {

    if (!navigator.onLine) {
        console.error("No puedes agregar una tarea, porque has perdido conexión.")
        return 
    }

    if (inputTarea.value.trim() !== "") {
        let nuevaTarea = { descripcion: inputTarea.value.trim(),
                           fecha: retornarFechaActual(),
                           completada: false }
                        
                        fetch(URL, {method: "POST", 
                                    headers: {"Content-Type": "application/json"}, 
                                    body: JSON.stringify(nuevaTarea)
                                   })
                        .then(response => response.json())
                        .then(()=> recuperarTareas())
                        .then(()=> inputTarea.value = "")
    }
}

function almacenarTareasEnLS() {
    localStorage.setItem("misTareas", JSON.stringify(tareas))
}

function desactivarFuncionalidades() {
    const botones = document.querySelectorAll("button.button-delete")
    botones.length > 0 && botones.forEach(boton => boton.setAttribute("disabled", "true"))

    const checkboxes = document.querySelectorAll("input[type=checkbox]")
    checkboxes.length > 0 && checkboxes.forEach(check => check.setAttribute("disabled", "true"))
}

function advertirOffline() {
    const header = document.querySelector("header")
    const titulo = document.querySelector("h1")
    header.style.backgroundColor = "darkred"
    titulo.textContent = "Estás sin conexión"
}

function recuperarTareas() {
    if (navigator.onLine) {
        tareas.length = 0
        fetch(URL)
        .then(response => response.json())
        .then(data => tareas.push(...data))
        .then(()=> cargarTareasEnHTML())
        .catch(error => console.error(error))
    } else {
        const tareasOffline = JSON.parse(localStorage.getItem("misTareas")) || []
        if (tareasOffline.length > 0) {
            tareas.push(...tareasOffline)
            cargarTareasEnHTML()
            desactivarFuncionalidades()
            advertirOffline()
        }
    }
}
recuperarTareas()

// EVENTOS
btnAgregarTarea.addEventListener("click", ()=> cargarNuevaTarea() )

window.addEventListener("offline", ()=> {
    almacenarTareasEnLS()
    location.reload()
})

window.addEventListener("online", ()=> location.reload() )

UpUp.start({
    'content-url': 'index.html',
    'assets': ['images/task-64.png', 'js/tareas.js', 'css/styles.css', 'index.html', 'upup.min.js', 'upup.sw.min.js', 'manifest.json'],
    'service-worker-url': 'upup.sw.min.js'
})
