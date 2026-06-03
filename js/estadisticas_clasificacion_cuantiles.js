// DESACTIVAR CONSOLE EN PRODUCCIÓN
console.log = function(){};
console.warn = function(){};
console.error = function(){};
console.info = function(){};
console.debug = function(){};


// /*******************************************************
//  *  VARIABLES GLOBALES *
// *******************************************************/
const API_KEY = 'a1b2c3d4e5f6g7h8i9j0';
const API_BASE_URL = 'https://devsiga.iecm.mx/index.php';

const cve_demarcacion = sessionStorage.getItem('claveDemarcacion');
const clave = sessionStorage.getItem('claveUT');
const nomdem = sessionStorage.getItem('NomDem')

let heatmap = null;
let myChart = null;
let staticMap;
let latitud = 19.4326;
let longitud = -99.1332;
let indicador;

//Leyenda del mapa de calor
let legendDiv = null;
let mapaCalorTema;

//Variables Tematicos
let poligonosTematicos = [];
let tooltipPoligono = null;
// Variables para tooltips
let tooltipActivo = null;
let tooltipPoligonoGeoJSON = null;

// Variables globales para controlar el estado de los mapas
let estadoMapaCalor = false;
let estadoMapaTematico = false;
let datosActualesCalor = null;
let campoActual = null;

//Contador indices por demarcacion
// AGREGAR ESTA NUEVA VARIABLE:
let temporizadorRestauracion = null;

// Variables para distribución territorial
let distribucionTerritorial = null;
let curvaNivelesActivas = [];
let perfilAltimétricoActivo = false;

// Variable global para mantener consistencia de paleta por mapa
let paletaActualMapa = null;
let pastelLabelByIndex = [];        // etiquetas por índice

// Variables globales para la gráfica de líneas
let chartLineasTematico = null;
let datosGraficaLineas = [];
let indiceActualResaltado = null;
let puntoResaltadoDesdeMapaActivo = false; // Control para evitar conflictos

// Variables globales para el aside ampliado
let mapaGoogleDemarcacion = null;
let graficaLineasDemarcacion = null;
let datosActualesDemarcacion = null;
let campoActualDemarcacion = null;

//Mapas demarcaciones 
let capasGeoJSON = []; // Para guardar referencia a las capas
let poligonoSeleccionado = null; // Para tracking del polígono activo

// Variable global para almacenar las secciones
let seccionesLayer = null;

// Instancia global de InfoAdicional
let infoAdicional = null;

// Variables para navegación de menús
let categoriaActualMenu = null; // Nueva variable para recordar la categoría


// /*******************************************************
//  *  SUBTEMAS PARA EL SUBMENUS *
// *******************************************************/

//Datos mapas de calor
const menuDataCalor = {

    "Distribución Territorial": ["Superficie de la Unidad Territorial", "Perfil Altimétrico"],

    "Composición Poblacional": ["Población Total", "Población Femenina", "Población Masculina", "Personas de 3 años y más", "Personas de 5 años y más", "Personas de 12 años y más",
                                "Personas de 18 años y más", "Personas de 0 a 14 años de edad", "Personas de 15 a 64 años de edad", "Personas de 65 a 130 años de edad"],

    "Vivienda": ["Total de viviendas particulares habitadas", "Ocupantes en viviendas particulares habitadas", "Viviendas particulares habitadas con piso de tierra", "Viviendas particulares habitadas que disponen de energía eléctrica",
                "Viviendas particulares habitadas que disponen de agua entubada en el ámbito de la vivienda", "Viviendas particulares habitadas que disponen de tinaco", "Viviendas particulares habitadas que disponen de cisterna o aljibe",
                "Viviendas particulares habitadas que disponen de excusado o sanitario", "Viviendas particulares habitadas que disponen de drenaje", "Viviendas particulares habitadas que disponen de refrigerador", 
                "Viviendas particulares habitadas que disponen de lavadora", "Viviendas particulares habitadas que disponen de automóvil o camioneta", "Viviendas particulares habitadas que disponen de motocicleta o motoneta",
                "Viviendas particulares habitadas que disponen de bicicleta como medio de transporte", "Viviendas particulares habitadas que disponen de computadora, laptop o tablet", "Viviendas particulares habitadas que disponen de línea telefónica fija",
                "Viviendas particulares habitadas que disponen de teléfono celular", "Viviendas particulares habitadas que disponen de Internet", "Viviendas particulares habitadas que disponen de servicio de televisión de paga"],


    "Discapacidad": ["Población con Discapacidad", "Población con discapacidad para caminar, subir o bajar", "Población con discapacidad para ver, aún usando lentes", "Población con discapacidad para hablar o comunicarse",
                 "Población con discapacidad para oír, aún usando aparato auditivo", "Población con discapacidad para vestirse, bañarse o comer", "Población con discapacidad para recordar o concentrarse",
                 "Población con limitación", "Población con limitación para caminar, subir o bajar", "Población con limitación para ver, aún usando lentes", "Población con limitación para hablar o comunicarse", "Población con limitación para oír, aún usando aparato auditivo",
                 "Población con limitación para vestirse, bañarse o comer", "Población con limitación para recordar o concentrarse", "Población con algún problema o condición mental",
                 "Población sin discapacidad, limitación, problema o condición mental"],

    "Etnicidad": ["Población de 3 años y más que habla alguna lengua indígena", "Población que se considera afromexicana o afrodescendiente", "Población masculina que se considera afromexicana o afrodescendiente"],

    "Migración": ["Población nacida en otra entidad", "Población de 5 años y más residente en otra entidad en marzo de 2015",
                "Población masculina de 5 años y más residente en otra entidad en marzo de 2015"],

    "Características Económicas": ["Población económicamente activa (PEA)", "Población de 12 años y más No Económicamente Activa", "Población Económicamente Activa Ocupada", "Población Económicamente Activa Desocupada"],

    "Características Educativas": ["Población de 15 años y más sin escolaridad", "Población de 15 años y más con primaria incompleta", "Población de 18 años y más con educación posbásica",],

    "Hogares Censales": ["Total de hogares censales", "Hogares censales con persona de referencia mujer", "Hogares censales con persona de referencia hombre"],

    "Afiliación a Servicios de Salud": ["Población afiliada a servicios de salud", "Población sin afiliación a servicios de salud"],

    "Situación Conyugal": ["Población soltera", "Población casada o unida"],

    "Información Adicional": ["Zonas de Valor Ambiental", "Línea de Conservación Ecológica", "Área Natural Protegida", "Área de Conservación Patrimonial", "Autoridad de la Zona Patrimonio", "Áreas Verdes"]

};

//Datos indicadores
const menuDataIndicadores = {

    "Distribución Territorial": ["Superficie de la Unidad Territorial respecto a la Demarcación"],

    "Composición Poblacional": [ "Porcentaje de Población de la Unidad Territorial respecto a la Demarcacion", "Densidad de Población (HAB/M2)", "Relación Hombres-Mujeres", "Porcentaje de Mujeres", "Porcentaje de Hombres", "Población de 18 años y más",
                                "Relación de Dependencia", "Indice de Envejecimiento"],

    "Vivienda": ["Promedio De Ocupantes Por Vivienda", "Porcentaje de Viviendas con Piso de Tierra", "Índice Disponibilidad de Servicios y Equipamiento", "Índice Disponibilidad de Bienes", "Índice Disponibilidad de Tecnologías de la Información y la Comunicación (TIC)"],

    "Discapacidad": ["Población con Discapacidad", "Población con discapacidad para caminar, subir o bajar", "Población con discapacidad para ver, aún usando lentes", "Población con discapacidad para hablar o comunicarse",
                 "Población con discapacidad para oír, aún usando aparato auditivo", "Población con discapacidad para vestirse, bañarse o comer", "Población con discapacidad para recordar o concentrarse",
                 "Población con limitación", "Población con limitación para caminar, subir o bajar", "Población con limitación para ver, aún usando lentes", "Población con limitación para hablar o comunicarse", "Población con limitación para oír, aún usando aparato auditivo",
                 "Población con limitación para vestirse, bañarse o comer", "Población con limitación para recordar o concentrarse", "Población con algún problema o condición mental",
                 "Población sin discapacidad, limitación, problema o condición mental"],                   

    "Etnicidad": ["Población de 3 años y más que habla alguna lengua indígena", "Población que se considera afromexicana o afrodescendiente"],

    "Migración": ["Población No Nativa", "Población Migrante Estatal"],

    "Características Económicas": ["Población económicamente activa (PEA)", "Población de 12 años y más No Económicamente Activa", "Población Económicamente Activa Ocupada", "Población Económicamente Activa Desocupada"],

    "Características Educativas": ["Porcentaje de población con educación posbásica", "Porcentaje de población con rezago educativo"],

    "Hogares Censales": ["Relación Mujer/Hombre Jefatura De Hogar", "Hogares con jefatura de hogar mujer"],

    "Afiliación a Servicios de Salud": ["Porcentaje de Población afiliada a servicios de salud", "Porcentaje de Población sin afiliación a servicios de salud"],

    "Situación Conyugal": ["Porcentaje de Población soltera", "Personas Casadas o Unidas"],

    // "Información Adicional": ["Índice de Áreas Verdes"]

};


// /*******************************************************
//  *  FUNCIONES GLOBALES *
// *******************************************************/
async function fetchFromApi(endpoint, params = {}) {

    //Operador ternario
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    const url = new URL(`${API_BASE_URL}/${cleanEndpoint}`);

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-KEY': API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {

            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {}
            throw new Error(errorMessage);

        }

        return await response.json();

    } catch (error) {
        console.error('Error al consultar la API:', error);
        throw error;
    }

}

// Mostrar/Ocultar menú lateral
// function toggleSidebar(menuId) {
//     const menu = document.getElementById(menuId);
    
//     // Determinar menú opuesto usando los IDs reales de tu HTML
//     const menuOpuesto = menuId === 'menu-mapas-calor' ? 'menu-indicadores' : 'menu-mapas-calor';
//     const menuOpuestoElement = document.getElementById(menuOpuesto);
    
//     // Si el menú opuesto está abierto, cerrarlo primero
//     if (menuOpuestoElement && menuOpuestoElement.classList.contains('active')) {
//         menuOpuestoElement.classList.remove('active');
//         // Pequeña pausa para suavizar la transición
//         setTimeout(() => {
//             menu.classList.toggle('active');
//         }, 150);
//     } else {
//         menu.classList.toggle('active');
//     }
// }
// Nueva función para manejar sidebars con tabla
function toggleSidebar(menuId) {
    const menu = document.getElementById(menuId);
    const isCurrentlyActive = menu.classList.contains('active');
    
    // Cerrar todos los sidebars EXCEPTO el que se está abriendo
    document.querySelectorAll('.sidebar').forEach(sidebar => {
        if (sidebar.id !== menuId) {
            sidebar.classList.remove('active');
        }
    });
    
    // Toggle del sidebar actual
    if (isCurrentlyActive) {
        // Cerrando el sidebar
        menu.classList.remove('active');
        toggleTablaExterna(false);
    } else {
        // Abriendo el sidebar
        menu.classList.add('active');
        
        // AQUÍ AGREGAMOS LA LÓGICA DE SECCIONES
        if (menuId === 'menu-mapas-calor') {
            // Al abrir mapas, mostrar secciones
            setTimeout(() => {
                toggleTablaExterna(true);
                // cargarSecciones(); // NUEVA LÍNEA
            }, 150);
        } else if (menuId === 'menu-indicadores') {
            // Al abrir indicadores, ocultar secciones
            toggleTablaExterna(false);
            limpiarSecciones(); // NUEVA LÍNEA
        }
    }
}

function cerrarTodosLosMenus() {
    closeSidebar('menu-mapas-calor');
    closeSidebar('menu-indicadores');
}


// Cierra un menú
function closeSidebar(menuId) {

    document.getElementById(menuId).classList.remove('active');

}

// cargar menu principal mapas de calor
const menuMapasCalor = document.getElementById('menu-principal-calor');
Object.keys(menuDataCalor).forEach(categoria => {

    const div = document.createElement('div');
    div.classList.add('menu-item');
    div.textContent = categoria;
    div.onclick = () => abrirSubmenuCalor(categoria);
    menuMapasCalor.appendChild(div);

});

// cargar menu principak indicadores
const menuIndicadores = document.getElementById('menu-principal-indicadores');
Object.keys(menuDataIndicadores).forEach(categoria => {

    const div = document.createElement('div');
    div.classList.add('menu-item');
    div.textContent = categoria;
    div.onclick = () => abrirSubmenuIndicadores(categoria)
    menuIndicadores.appendChild(div);


})

// funcion para abrir un submenu de mapas de calor
function abrirSubmenuCalor(categoria) {
    categoriaActualMenu = categoria;
    document.getElementById('menu-principal-calor').style.display = 'none';
    document.getElementById('submenu-calor').style.display = 'block';
    document.getElementById('submenu-title-calor').textContent = categoria;
    
    // Guardar categoría actual
    categoriaActualMenu = categoria;
    
    const botonMenu = document.querySelector('h1.titulo-submenu-calor');
    const menuboton = botonMenu.textContent;

    const submenuItems = document.getElementById('submenu-items-calor');
    submenuItems.innerHTML = '';

    // Agregar variables del tema
    menuDataCalor[categoria].forEach(subtema => {
        const subDiv = document.createElement('div');
        subDiv.classList.add('submenu-item');
        subDiv.textContent = subtema;
        
        subDiv.setAttribute('data-subtema', subtema);
        
        subDiv.onclick = () => {
            resaltarSubtemaSeleccionado(subDiv, 'submenu-items-calor');
            seleccionarSubtema(menuboton, categoria, subtema);
        };
        submenuItems.appendChild(subDiv);
    });
    
    //Agregar botón de Indicadores por Demarcación si hay datos
    if (menuDataIndicadores[categoria] && menuDataIndicadores[categoria].length > 0) {
        agregarBotonIndicadoresDemarcacion(submenuItems, categoria);
    }
}


/**
 * Función para abrir el menú de Indicadores desde Mapas por UT
 */
function abrirIndicadoresDesdeMapas(categoria) {
    console.log('Abriendo indicadores para:', categoria);
    
    // 1. Cerrar menú de mapas
    const menuMapasCalor = document.getElementById('menu-mapas-calor');
    if (menuMapasCalor) {
        menuMapasCalor.classList.remove('active');
        console.log('Menu de mapas cerrado');
    }
    
    // 2. Abrir el menú de indicadores
    const menuIndicadores = document.getElementById('menu-indicadores');
    if (!menuIndicadores) {
        console.error('No se encontró menu-indicadores');
        return;
    }
    menuIndicadores.classList.add('active');
    console.log('Menu de indicadores abierto');
    
    // 3. Ocultar menú principal y mostrar submenu
    const menuPrincipal = document.getElementById('menu-principal-indicadores');
    const submenuIndicadores = document.getElementById('submenu-indicadores');
    
    if (menuPrincipal) {
        menuPrincipal.style.display = 'none';
    }
    
    if (submenuIndicadores) {
        submenuIndicadores.style.display = 'block';
    }
    
    // 4. Establecer la categoría en el subtítulo
    const submenuTitle = document.getElementById('submenu-title-indicadores');
    if (submenuTitle) {
        submenuTitle.textContent = categoria;
    }
    
    // 5. Limpiar y llenar los items
    const submenuItems = document.getElementById('submenu-items-indicadores');
    if (!submenuItems) {
        console.error('No se encontró submenu-items-indicadores');
        return;
    }
    
    submenuItems.innerHTML = '';
    
    
    // 7. Verificar si hay datos
    if (!menuDataIndicadores[categoria] || menuDataIndicadores[categoria].length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'menu-item';
        mensaje.style.textAlign = 'center';
        mensaje.style.color = '#999';
        mensaje.innerHTML = `
            <i class="fas fa-info-circle" style="font-size: 20px; display: block; margin-bottom: 8px;"></i>
            No hay indicadores disponibles
        `;
        submenuItems.appendChild(mensaje);
        return;
    }
    
    // 8. Agregar variables de indicadores
    menuDataIndicadores[categoria].forEach((subtema) => {
        const subDiv = document.createElement('div');
        subDiv.classList.add('submenu-item');
        subDiv.textContent = subtema;
        subDiv.setAttribute('data-subtema', subtema);
        
        subDiv.onclick = () => {
            resaltarSubtemaSeleccionado(subDiv, 'submenu-items-indicadores');
            seleccionarSubtema('Indicadores', categoria, subtema);
        };
        
        submenuItems.appendChild(subDiv);
    });
    
    console.log('Indicadores cargados:', menuDataIndicadores[categoria].length);
}
/**
 * Función para resaltar el subtema seleccionado
 */
function resaltarSubtemaSeleccionado(elementoSeleccionado, contenedorId) {
    // Remover clase 'seleccionado' de todos los elementos del contenedor
    const contenedor = document.getElementById(contenedorId);
    const todosLosItems = contenedor.querySelectorAll('.submenu-item');
    
    todosLosItems.forEach(item => {
        item.classList.remove('seleccionado');
    });
    
    // Agregar clase 'seleccionado' al elemento clickeado
    elementoSeleccionado.classList.add('seleccionado');
    
    console.log('Subtema resaltado:', elementoSeleccionado.textContent);
}


/**
 * Función para agregar botón de Indicadores por Demarcación
 */
function agregarBotonIndicadoresDemarcacion(contenedor, categoria) {
    console.log('Agregando botón de indicadores para:', categoria);
    
    // Verificar si hay datos
    if (!menuDataIndicadores[categoria] || menuDataIndicadores[categoria].length === 0) {
        console.log('No hay indicadores para esta categoría');
        return;
    }
    
    // Crear separador
    const separador = document.createElement('div');
    separador.style.cssText = `
        height: 1px;
        background: linear-gradient(to right, transparent, #667eea, transparent);
        margin: 20px 10px 15px 10px;
        opacity: 0.4;
    `;
    contenedor.appendChild(separador);
    
    // Crear botón de Indicadores usando el estilo de menu-item
    const botonIndicadores = document.createElement('div');
    botonIndicadores.classList.add('boton-indicadores-demarcacion');
    
    botonIndicadores.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-chart-bar" style="font-size: 18px; color: #667eea;"></i>
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #320547;">
                    Indicadores por Demarcación
                </div>
                <div style="font-size: 10px; color: #666; margin-top: 3px;">
                    Comparativo dentro de la demarcación
                </div>
            </div>
            <i class="fas fa-arrow-right" style="font-size: 12px; color: #667eea;"></i>
        </div>
    `;
    
    // Aplicar estilos base de menu-item más personalizaciones
    botonIndicadores.style.cssText = `
        background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
        margin: 5px 0;
        padding: 15px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    `;
    
    // Efectos hover
    botonIndicadores.onmouseenter = function() {
        this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.style.transform = 'translateX(3px)';
        this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        
        // Cambiar color de texto a blanco en hover
        const textos = this.querySelectorAll('div[style*="color"]');
        textos.forEach(t => {
            if (t.style.color !== 'white') {
                t.setAttribute('data-original-color', t.style.color);
                t.style.color = 'white';
            }
        });
        const iconos = this.querySelectorAll('i');
        iconos.forEach(i => i.style.color = 'white');
    };
    
    botonIndicadores.onmouseleave = function() {
        this.style.background = 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)';
        this.style.transform = 'translateX(0)';
        this.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.15)';
        
        // Restaurar colores originales
        const textos = this.querySelectorAll('div[data-original-color]');
        textos.forEach(t => {
            t.style.color = t.getAttribute('data-original-color');
            t.removeAttribute('data-original-color');
        });
        const iconos = this.querySelectorAll('i');
        iconos.forEach(i => i.style.color = i === iconos[0] ? '#667eea' : '#667eea');
    };
    
    // Click - abre indicadores
    botonIndicadores.onclick = function() {
        abrirIndicadoresDesdeMapas(categoria);
    };
    
    contenedor.appendChild(botonIndicadores);
    console.log('✓ Botón de indicadores agregado');
}



function limpiarTodoExceptoUT() {
    // Limpiar TODOS los tooltips primero
    limpiarTodosLosTooltips();
    
    // Limpiar mapa de calor
    if (heatmap) {
        heatmap.setMap(null);
        heatmap = null;
    }

     // Limpiar capas de información adicional
    if (infoAdicional) {
        infoAdicional.limpiarTodasLasCapas();
        // Limpiar tooltips adicionales por si acaso
        infoAdicional.limpiarTodosLosTooltips();
    }
    
    // Limpiar temáticos
    limpiarPoligonosTematicos();

    //LImpiar distribución territorial
    if (distribucionTerritorial) {
        distribucionTerritorial.limpiarTodo();
    }
    
    // Limpiar leyendas
    limpiarLeyendaTematica();
    limpiarLeyendaMapaCalor();
    limpiarEstadisticasDescriptivas();
    
    // Limpiar gráficas
    cerrarGraficaLineas();

    // Limpiar secciones
    limpiarSecciones();
    
    // Limpiar mensajes
    limpiarMensajeInstructivo();
    
    // OCULTAR BOTONES
    const controlesMapas = document.getElementById('controles-mapas');
    if (controlesMapas) {
        controlesMapas.style.display = 'none';
    }
    
    // Resetear estados
    estadoMapaCalor = false;
    estadoMapaTematico = false;
    cuantilSeleccionado = null;
    datosActualesCalor = null;
    campoActual = null;
    
    // Resetear paletas
    // resetearPaletaMapa();
    
    // Actualizar botones
    actualizarEstadoBotones();
    
    console.log('Todo limpiado excepto polígono de UT');
}
// Función para regresar al menú principal
function volverMenuPrincipal(idMenu) {
    
    if(idMenu == "calor"){
        // Limpiar todo antes de regresar al menú
        limpiarTodoExceptoUT();
        
        // Mostrar secciones nuevamente al regresar al menú
        cargarSecciones();
        
        document.getElementById('submenu-calor').style.display = 'none';
        document.getElementById('menu-principal-calor').style.display = 'block';
        
        // Resetear categoría actual
        categoriaActualMenu = null;
        
        console.log('Volviendo al menú principal de Mapas');
    }
    else if(idMenu == "indicadores"){
        // Verificar si venimos desde Mapas por UT
        if (categoriaActualMenu) {
            console.log('Regresando a Mapas por UT desde Indicadores');
            
            // Cerrar menú de indicadores
            const menuIndicadores = document.getElementById('menu-indicadores');
            if (menuIndicadores) {
                menuIndicadores.classList.remove('active');
            }
            
            // IMPORTANTE: Resetear el submenu de indicadores para la próxima vez
            const submenuIndicadores = document.getElementById('submenu-indicadores');
            const menuPrincipalIndicadores = document.getElementById('menu-principal-indicadores');
            
            if (submenuIndicadores) {
                submenuIndicadores.style.display = 'none';
            }
            if (menuPrincipalIndicadores) {
                menuPrincipalIndicadores.style.display = 'block';
            }
            
            // Abrir menú de mapas nuevamente
            const menuMapasCalor = document.getElementById('menu-mapas-calor');
            if (menuMapasCalor) {
                menuMapasCalor.classList.add('active');
            }
            
            // Mantener el submenu de la categoría abierto
            const submenuCalor = document.getElementById('submenu-calor');
            if (submenuCalor) {
                submenuCalor.style.display = 'block';
            }
            
            // NO resetear categoriaActualMenu aquí para poder volver de nuevo si quiere
            
        } else {
            // Venimos del menú principal de Indicadores (flujo normal)
            console.log('Volviendo al menú principal de Indicadores');
            
            limpiarTodoExceptoUT();
            cargarSecciones();
            
            document.getElementById('submenu-indicadores').style.display = 'none';
            document.getElementById('menu-principal-indicadores').style.display = 'block';
        }
    }
}
/**
 * Función para resetear completamente la navegación de menús
 */
function resetearNavegacionMenus() {
    categoriaActualMenu = null;
    
    // Cerrar todos los menús
    const menuMapas = document.getElementById('menu-mapas-calor');
    const menuIndicadores = document.getElementById('menu-indicadores');
    
    if (menuMapas) menuMapas.classList.remove('active');
    if (menuIndicadores) menuIndicadores.classList.remove('active');
    
    // Volver a menús principales
    document.getElementById('submenu-calor').style.display = 'none';
    document.getElementById('menu-principal-calor').style.display = 'block';
    document.getElementById('submenu-indicadores').style.display = 'none';
    document.getElementById('menu-principal-indicadores').style.display = 'block';
}

// /*******************************************************

//              * TABLA INFORMACION UTS *

// *******************************************************/
// Función para cargar los datos de la Unidad Territorial en la tabla
async function cargarDatosTablaUT() {
    const claveUT = sessionStorage.getItem('claveUT');
    const claveDemarcacion = sessionStorage.getItem('claveDemarcacion');
    
    if (!claveUT || !claveDemarcacion) {
        console.error('No se encontraron las claves necesarias en sessionStorage');
        mostrarErrorTablaUT();
        return;
    }

    try {
        // Usar el endpoint properties que devuelve directamente los datos
        const response = await fetchFromApi('properties/uts_mgpc', { limit: 1851, offset: 0 });
        
        // Verificar que la respuesta tenga la estructura esperada
        if (!response || !response.data || !Array.isArray(response.data)) {
            console.error('Estructura de respuesta inesperada:', response);
            mostrarErrorTablaUT();
            return;
        }
        
        console.log(`Se cargaron ${response.data.length} UTs. Buscando: ${claveUT} en demarcación ${claveDemarcacion}`);
        
        // Buscar la UT específica por clave - los datos están directamente en response.data
        const utEncontrada = response.data.find(ut => 
            ut.cve_ut === claveUT && 
            ut.cve_demarc == claveDemarcacion
        );
        
        if (utEncontrada) {
            console.log('UT encontrada:', utEncontrada);
            llenarTablaUT(utEncontrada);
        } else {
            console.error('No se encontró la UT con las claves proporcionadas');
            console.log('Claves buscadas:', { claveUT, claveDemarcacion });
            console.log('Primeras 3 UTs disponibles:', response.data.slice(0, 3));
            mostrarErrorTablaUT();
        }
        
    } catch (error) {
        console.error('Error al cargar datos de la UT:', error);
        mostrarErrorTablaUT();
    }
}

// Función para llenar la tabla con los datos de la UT (ajustada para la nueva estructura)
// function llenarTablaUT(ut) {
//     // Mapear tipo de UT
//     const tipoUT = ut.tipo_ut === 'PO' ? 'Integrada por Pueblos o Barrios Originarios' : 'Conformada por Colonias y Unidades Habitacionales';

//     // Formatear secciones - manejar valores null o undefined
//     const seccionesCompletas = ut.secciones || '';
//     const seccionesParciales = ut.secciones1 || '';
    
//     // Formatear lista nominal con separadores de miles
//     const listaNominal = ut.lista_30_j ? 
//         Number(ut.lista_30_j).toLocaleString('es-MX') : 'No disponible';
    
//     // Llenar cada campo de la tabla
//     // document.getElementById('dem-territ').textContent = ut.dem_territ || 'No disponible';
//     // document.getElementById('dtto-loc').textContent = ut.dtto_loc_d || 'No disponible';
//     document.getElementById('cve-ut').textContent = ut.cve_ut || 'No disponible';
//     document.getElementById('nombre-ut').textContent = ut.nombre || 'No disponible';
//     // 'tipo-ut', document.getElementById('tipo-ut').textContent = tipoUT;
//     // document.getElementById('secciones-completas').textContent = seccionesCompletas;
//     // document.getElementById('secciones-parciales').textContent = seccionesParciales;
//     // document.getElementById('lista-30').textContent = listaNominal;
    
//     // // Agregar efectos visuales para destacar el tipo de UT
//     // const tipoElement = document.getElementById('tipo-ut');
//     // if (ut.tipo_ut === 'PO') {
//     //     tipoElement.style.color = '#7C3AED';
//     //     tipoElement.style.fontWeight = '700';
//     // } else {
//     //     tipoElement.style.color = '#059669';
//     //     tipoElement.style.fontWeight = '600';
//     // }
    
//     console.log('Tabla llenada correctamente con los datos de:', ut.nombre);
// }

// Función para llenar la tabla con los datos de la UT (ajustada para la nueva estructura)
// Función para llenar la tabla con los datos de la UT (ajustada para la nueva estructura)
function llenarTablaUT(ut) {
    // Mapear tipo de UT
    const tipoUT = ut.tipo_ut === 'PO' ? 'Integrada por Pueblos o Barrios Originarios' : 'Conformada por Colonias y Unidades Habitacionales';

    // Formatear secciones - manejar valores null o undefined
    const seccionesCompletas = ut.secciones || '';
    const seccionesParciales = ut.secciones1 || '';
    
    // Formatear lista nominal con separadores de miles
    const listaNominal = ut.lista_30_j ? 
        Number(ut.lista_30_j).toLocaleString('es-MX') : 'No disponible';
    
    // Llenar cada campo de la tabla (código existente)
    const cveUtElement = document.getElementById('cve-ut');
    const nombreUtElement = document.getElementById('nombre-ut');
    
    if (cveUtElement) cveUtElement.textContent = ut.cve_ut || 'No disponible';
    if (nombreUtElement) nombreUtElement.textContent = ut.nombre || 'No disponible';
    
    // NUEVO: Actualizar el contenedor de información en el sidebar
    const infoClaveElement = document.getElementById('info-clave-ut');
    const infoNombreElement = document.getElementById('info-nombre-ut');
    
    if (infoClaveElement && infoNombreElement) {
        infoClaveElement.textContent = `UT ${ut.cve_ut}`;
        infoNombreElement.textContent = ut.nombre;
        console.log('Información de UT actualizada en sidebar:', ut.cve_ut, ut.nombre);
    } else {
        console.warn('No se encontraron los elementos info-clave-ut o info-nombre-ut en el DOM');
    }
    
    console.log('Tabla llenada correctamente con los datos de:', ut.nombre);
}

// Función para mostrar error en caso de que no se puedan cargar los datos
function mostrarErrorTablaUT() {
    const elementos = [
        'dem-territ', 'dtto-loc', 'cve-ut', 'nombre-ut', 
        'secciones-completas', 'secciones-parciales', 'lista-30'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = 'Error al cargar';
            elemento.style.color = '#DC2626';
            elemento.style.fontStyle = 'italic';
        }
    });
}

// Función para mostrar/ocultar la tabla externa junto con el sidebar
function toggleTablaExterna(show) {
    const tablaExterna = document.getElementById('tabla-ut-externa');
    if (tablaExterna) {
        if (show) {
            tablaExterna.style.display = 'block';
            // Pequeño delay para la animación
            setTimeout(() => {
                tablaExterna.classList.add('active');
            }, 50);
        } else {
            tablaExterna.classList.remove('active');
            setTimeout(() => {
                tablaExterna.style.display = 'none';
            }, 300);
        }
    }
}

/*******************************************************
* FUNCIONES PARA CREAR EL MAPA Y LAS GRAFICAS  *
*******************************************************/
async function initMap() {


    //AGREGAMOS EL POLIGONO
    try {

        //Obtenemos los datos de la ut y el poligono
        const uts = await fetchFromApi('geometries/uts_mgpc', { limit: 1851, offset: 0 });
        let datosUTS = uts.features;

        // Filtramos
        const utFiltrada = datosUTS.filter(ut => ut.properties.cve_ut == clave);

        //Datos de la UT
        let latitud = utFiltrada[0].properties.latitud;
        let longitud = utFiltrada[0].properties.longitud;
        let nombreUT = utFiltrada[0].properties.nombre;
            
        const centro = { lat: latitud, lng: longitud };

        //Crear el mapa
        staticMap = new google.maps.Map(document.getElementById('map'), {

            center: centro,
            zoom: 16,
            tilt: 0,
            mapTypeControl: true,
            mapTypeControlOptions: {

                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_CENTER,
            }

        });

        /********************************************************************************************************************************
                                            * BOTON Y FUNCIONES PARA DESCARGAR EL KML * 
        *********************************************************************************************************************************/
        const divBtn = document.createElement("div");
        divBtn.style.position = "absolute";
        divBtn.style.bottom = "10px";        // distancia desde el borde inferior
        divBtn.style.right = "60px";         // lo empuja a la izquierda del Street View (ajusta este valor)
        divBtn.style.zIndex = "1000";        // asegura que quede por encima

        const centerBtn = document.createElement("button");
        centerBtn.textContent = "Descargar KML";
        centerBtn.style.backgroundColor = 'white';
        centerBtn.style.color = "#580382";
        centerBtn.style.border = '2px solid #580382';
        centerBtn.style.borderRadius = '5px';
        centerBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        centerBtn.style.cursor = 'pointer';
        centerBtn.style.textAlign = 'center';
        centerBtn.style.padding = '8px 16px';

        // Evento de click
        centerBtn.addEventListener('click', () => {
            const valores = { clave, claveDem: cve_demarcacion, nombreDem: nomdem };
            fetch("../modelo/kml.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(valores),
            })
            .then(response => response.text())
            .then(kml => {
                const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${clave}.kml`;
                a.click();
                URL.revokeObjectURL(url);
            });
        });

        divBtn.appendChild(centerBtn);

        // Aquí usamos el contenedor principal del mapa para insertar el botón manualmente
        staticMap.getDiv().appendChild(divBtn);


        /****** TERMINA KML*********/


        if (!window.overlayTooltip) {
            window.overlayTooltip = new google.maps.OverlayView();
            window.overlayTooltip.onAdd = function () {};
            window.overlayTooltip.draw = function () {};
            window.overlayTooltip.onRemove = function () {};
            window.overlayTooltip.setMap(staticMap);
        }


        // Agrega los polígonos filtrados al mapa
        const featureCollection = {
            type: "FeatureCollection",
            features: utFiltrada
        };

        // Agrega y guarda los nuevos features
        const features = staticMap.data.addGeoJson(featureCollection);

        staticMap.data.setStyle({
            fillColor: 'rgba(255, 255, 255, 0)',
            fillOpacity: 0,
            strokeColor: 'black',
            strokeWeight: 5,
            clickable: true
        });

        const aside = document.createElement("aside");
        aside.id = 'asideMap';
        aside.style.width = "100%";
        aside.style.height = "100%";
        aside.style.background = "rgba(255, 255, 255)";
        aside.style.padding = "15px";
        aside.style.overflowY = "auto";
        aside.style.boxShadow = "-2px 0 5px rgba(0,0,0,0.3)";
        aside.style.display = "none";
        aside.innerHTML = `
 
            <div>

                <p class="texto-superior-grafica" id="descripcion-grafica">

                    La gráfica de barras presenta una selección de Unidades Territoriales (UT) en función de los valores obtenidos. 
                    Se destacan, por el lado izquierdo, las cinco UT con los valores más bajos y, por el lado derecho, las diez UT con los valores más altos. 
                    Los datos se organizan de manera ascendente, lo que permite observar de forma clara la progresión desde los valores mínimos hasta los máximos.
                    Esta representación facilita la comparación entre los dos grupos de interés, permitiendo identificar diferencias significativas y resaltar tanto las unidades con menor nivel de registro como aquellas que muestran los valores más elevados.

                </p>  

            </div>

            <p class="titulo-grafica" id="titulo-grafico"></p>

            <div class="graficas">
                <canvas id="myBarChart"></canvas>
            </div>

            <div>

                <p class="texto-inferior-grafica">

                    La gráfica de barras presenta una selección de Unidades Territoriales (UT) en función de los valores obtenidos. 
                    Se destacan, por el lado izquierdo, las cinco UT con los valores más bajos y, por el lado derecho, las diez UT con los valores más altos. 
                    Los datos se organizan de manera ascendente, lo que permite observar de forma clara la progresión desde los valores mínimos hasta los máximos.
                    Esta representación facilita la comparación entre los dos grupos de interés, permitiendo identificar diferencias significativas y resaltar tanto las unidades con menor nivel de registro como aquellas que muestran los valores más elevados.

                </p>  

            </div>
            
        `;
        
        // aside dentro del contenedor (hermano de #map)
        document.getElementById("map-container").appendChild(aside);

        //pantallas pequeñas
        if (window.innerWidth <= 768) {
            
            aside.style.width = "100%";
            aside.style.height = "40%";
            aside.style.top = "auto";
            aside.style.bottom = "0";

        }

        // Elemntos adicionales seciones e info
        cargarSecciones();
        infoAdicional = new InfoAdicional();



    } catch (error) {

    }



}

function chart(datos) {

    const ctx = document.getElementById('myBarChart').getContext('2d');

    //Array con los nuevos valores
    const data = [];

    //Valor de la UT
    const utActual = datos.find(elemento => elemento.cve_ut === clave);
    data.push(utActual);

    // Ordenar de menor a mayor 
    datos.sort((a, b) => a.datos - b.datos);

    //Valores maximos
    data.push(...datos.slice(0,5));

    //Valores minimos
    data.push(...datos.slice(-5));

    const dataSinduplicados = [...new Set(data)];

    // Ordenar de menor a mayor 
    dataSinduplicados.sort((a, b) => a.datos - b.datos);

    //Etiquetas y valores
    let etiquetas = dataSinduplicados.map(valor => valor.cve_ut);
    let valores = dataSinduplicados.map(valor => valor.datos);

    //Color dinamico
    let colores = dataSinduplicados.map(valor => 
        
        valor.cve_ut == clave ? "green" : "#2a0450"

    )

    if (myChart) {
        myChart.destroy();
    }

    myChart =  new Chart(ctx, {

        type: 'bar',
        data: {

            labels: etiquetas,
            datasets: [{

                label: 'Datos',
                data: valores,
                backgroundColor: colores,
                borderColor: "black",
                borderWidth: 1

            }]

        },
        options: {

            scales: {

                x: {
                    title: {

                        display: true,
                        text: 'Claves de Unidades Territoriales',
                        color: '#000000',
                        font: {
                            size: 15,
                            weight: 'bolder'
                    }
                }

            }
        },


            responsive: true,
            plugins: {

                legend: { display: false }

            }

        }
    });

}

//Regresar al mapa principal
// Función mejorada para regresar al mapa de selección
function regresarAlSelector() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.close();
    }
}

// /*******************************************************

//                   *CARGAR SECCIONES*

// *******************************************************/


async function cargarSecciones() {
    const claveUT = sessionStorage.getItem('claveUT');
    if (!claveUT) return;
    
    try {
        const response = await fetch(`https://devsiga.iecm.mx/index.php/filter/secciones_uts?api_key=a1b2c3d4e5f6g7h8i9j0&clave=${claveUT}&secc`);
        const data = await response.json();
        
        if (data && data.features) {
            mostrarSecciones(data);
        }
    } catch (error) {
        console.error('Error al cargar secciones:', error);
    }
}

function mostrarSecciones(geoJsonData) {
    // Limpiar secciones anteriores si existen
    limpiarSecciones();
    
    // Crear el layer de secciones usando el mapa existente
    seccionesLayer = new google.maps.Data();
    seccionesLayer.setMap(staticMap); // Usar tu variable staticMap existente
    
    // Agregar los datos GeoJSON
    seccionesLayer.addGeoJson(geoJsonData);
    
    // Estilo para las secciones con zIndex bajo
    seccionesLayer.setStyle({
        fillColor: '#f65c5cff',    // Lila claro
        fillOpacity: 0.1,          // Transparencia
        strokeColor: '#f65c5cff',// Borde lila más oscuro
        strokeWeight: 3,
        strokeOpacity: 0.8,
        zIndex: -1               //debajo de las otras capas
    });
    
    // Agregar etiquetas con el número de sección
    geoJsonData.features.forEach(feature => {
        if (feature.properties.secc && feature.geometry.coordinates) {
            crearEtiquetaSeccion(feature);
        }
    });
}


function crearEtiquetaSeccion(feature) {
    // Requiere: google maps geometry library cargada (&libraries=geometry)
    if (!feature || !feature.geometry) return;

    const geom = feature.geometry;
    let polygonsArray = [];

    if (geom.type === 'Polygon') {
        // coords: [ [ [lng,lat], ... ] , [hole...], ... ]
        polygonsArray = [geom.coordinates];
    } else if (geom.type === 'MultiPolygon') {
        // coords: [ [ [ [lng,lat], ... ] ], [ [ [lng,lat], ... ] ], ... ]
        polygonsArray = geom.coordinates;
    } else {
        // no es polígono
        return;
    }

    // Helper: area (shoelace) para escoger el polígono exterior más grande (si MultiPolygon)
    function ringArea(coords) {
        let a = 0;
        for (let i = 0, len = coords.length; i < len; i++) {
            const [x1, y1] = coords[i];
            const [x2, y2] = coords[(i + 1) % len];
            a += x1 * y2 - x2 * y1;
        }
        return a / 2;
    }

    // Helper: centroid para un anillo (x = lng, y = lat)
    function centroidOfRing(coords) {
        let A = 0, Cx = 0, Cy = 0;
        for (let i = 0, len = coords.length; i < len; i++) {
            const [x0, y0] = coords[i];
            const [x1, y1] = coords[(i + 1) % len];
            const cross = x0 * y1 - x1 * y0;
            A += cross;
            Cx += (x0 + x1) * cross;
            Cy += (y0 + y1) * cross;
        }
        A = A / 2;
        if (Math.abs(A) < 1e-12) {
            // Polígono degenerado -> usar promedio simple
            let sx = 0, sy = 0;
            coords.forEach(c => { sx += c[0]; sy += c[1]; });
            return { x: sx / coords.length, y: sy / coords.length };
        }
        const cx = Cx / (6 * A);
        const cy = Cy / (6 * A);
        return { x: cx, y: cy }; // x = lng, y = lat
    }

    // Helper: distancia mínima de un punto a los segmentos del anillo (planar, grados)
    function pointToRingMinDistSquared(lat, lng, ring) {
        let best = Infinity;
        for (let i = 0, len = ring.length; i < len; i++) {
            const [x1, y1] = ring[i];
            const [x2, y2] = ring[(i + 1) % len];
            // proyectamos punto P (lng,lat) sobre segmento (x1,y1)-(x2,y2)
            const vx = x2 - x1, vy = y2 - y1;
            const wx = lng - x1, wy = lat - y1;
            const c1 = vx * wx + vy * wy;
            const c2 = vx * vx + vy * vy;
            let t = c2 === 0 ? 0 : c1 / c2;
            t = Math.max(0, Math.min(1, t));
            const projX = x1 + t * vx;
            const projY = y1 + t * vy;
            const dx = projX - lng, dy = projY - lat;
            const d2 = dx * dx + dy * dy;
            if (d2 < best) best = d2;
        }
        return best;
    }

    // Elegir el polígono exterior más grande (si MultiPolygon)
    let bestOuterRing = polygonsArray[0][0]; // default
    let bestArea = -Infinity;
    polygonsArray.forEach(poly => {
        const outer = poly[0]; // primer anillo es el exterior
        const area = Math.abs(ringArea(outer));
        if (area > bestArea) {
            bestArea = area;
            bestOuterRing = outer;
        }
    });

    // Convertir outer ring a LatLng para google.maps.Polygon
    const outerLatLngs = bestOuterRing.map(c => ({ lat: c[1], lng: c[0] }));
    const tmpPolygon = new google.maps.Polygon({ paths: outerLatLngs });

    // Centroid matemático (lng,lat)
    const centro = centroidOfRing(bestOuterRing);
    const centroLatLng = new google.maps.LatLng(centro.y, centro.x);

    let puntoBueno = null;

    // Si el centroide cae dentro, úsalo (rápido y preferible)
    try {
        if (google.maps.geometry && google.maps.geometry.poly &&
            google.maps.geometry.poly.containsLocation(centroLatLng, tmpPolygon)) {
            puntoBueno = centroLatLng;
        }
    } catch (e) {
        // si falta la librería geometry, fallback al centroide sin check
        puntoBueno = centroLatLng;
    }

    // Si el centro no funciona, hacemos búsqueda por muestreo refinado
    if (!puntoBueno) {
        // Bounding box del anillo
        let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
        bestOuterRing.forEach(([lng, lat]) => {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
        });

        // Estrategia: 3 niveles de muestreo (coarse -> fine), y sesgo hacia el centro
        let bestCandidate = null;
        let bestDist2 = -1;

        // Si la librería geometry no está presente, usa sólo centroid fallback.
        const hasContains = google.maps && google.maps.geometry && google.maps.geometry.poly && typeof google.maps.geometry.poly.containsLocation === 'function';

        for (let level = 0; level < 3; level++) {
            const grid = level === 0 ? 8 : level === 1 ? 15 : 25;
            // ajustar rango de muestreo: en refinements lo hacemos más pequeño alrededor del mejorCandidate
            let sMinLat = minLat, sMaxLat = maxLat, sMinLng = minLng, sMaxLng = maxLng;
            if (bestCandidate) {
                // reducir caja al 40% centrada en candidato
                const latSpan = (maxLat - minLat) * 0.4;
                const lngSpan = (maxLng - minLng) * 0.4;
                sMinLat = bestCandidate.lat() - latSpan / 2;
                sMaxLat = bestCandidate.lat() + latSpan / 2;
                sMinLng = bestCandidate.lng() - lngSpan / 2;
                sMaxLng = bestCandidate.lng() + lngSpan / 2;
            }
            for (let i = 0; i < grid; i++) {
                for (let j = 0; j < grid; j++) {
                    // sample centered + bias hacia el centro (mezcla con centro)
                    const u = (i + 0.5) / grid;
                    const v = (j + 0.5) / grid;
                    // obtener punto en el sub-rectángulo
                    let lat = sMinLat + u * (sMaxLat - sMinLat);
                    let lng = sMinLng + v * (sMaxLng - sMinLng);
                    // bias hacia centroid (más central)
                    lat = (lat + centro.y * 2) / 3; // peso mayor al centro
                    lng = (lng + centro.x * 2) / 3;

                    const pLatLng = new google.maps.LatLng(lat, lng);

                    // comprobar si está dentro (si tenemos la función)
                    if (hasContains) {
                        if (!google.maps.geometry.poly.containsLocation(pLatLng, tmpPolygon)) continue;
                    } else {
                        // Si no hay geometry lib, hacemos simple punto dentro aproximado: saltar
                        continue;
                    }

                    // calcular distancia mínima al borde (en unidades "grados")
                    const d2 = pointToRingMinDistSquared(lat, lng, bestOuterRing);
                    if (d2 > bestDist2) {
                        bestDist2 = d2;
                        bestCandidate = pLatLng;
                    }
                }
            }

            if (bestCandidate) {
                // si encontramos candidato en nivel actual, continuamos para refinar
                // next iteration will shrink around bestCandidate
            } else {
                // si no se encontró nada, romper y fallback a centroide
                break;
            }
        }

        if (bestCandidate) puntoBueno = bestCandidate;
        else puntoBueno = centroLatLng; // fallback
    }

    // Finalmente, crear el marcador/label en punto elegido
    const labelText = (feature.properties && feature.properties.secc) ? String(feature.properties.secc) : '';

    const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="22">
    <rect x="0" y="0" width="45" height="22" rx="5" ry="5"
            fill="white" stroke="#DDD6FE" stroke-width="1"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial" font-size="12" font-weight="bold" fill="#4C1D95">
        ${labelText}
    </text>
    </svg>
    `;

    const marker = new google.maps.Marker({
    position: puntoBueno,
    map: staticMap,
    icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svgIcon),
        scaledSize: new google.maps.Size(45, 22) // más compacto
    },
    zIndex: 1000
    });

    if (!window.marcadoresSecciones) window.marcadoresSecciones = [];
    window.marcadoresSecciones.push(marker);


}


function limpiarSecciones() {
    // Limpiar layer de secciones
    if (seccionesLayer) {
        seccionesLayer.setMap(null);
        seccionesLayer = null;
    }
    
    // Limpiar marcadores de etiquetas
    if (window.marcadoresSecciones) {
        window.marcadoresSecciones.forEach(marker => marker.setMap(null));
        window.marcadoresSecciones = [];
    }
}

////////////////////////////////////////////////////////////////////////////////////////

        //         MAPAS LEAFLET E INDICADORES POR DEMARCACION

////////////////////////////////////////////////////////////////////////////////////////
// FUNCIÓN OPTIMIZADA PARA EL ASIDE
function ampliarAsideIndicadorOptimizado(datosCompletos) {
    console.log('Iniciando aside optimizado con:', datosCompletos.titulo);
    
    const aside = document.getElementById("asideMap");
    
    // Aplicar clase ampliada
    aside.classList.add("ampliado");
    
    // Crear nueva estructura
    crearEstructuraAmpliada(aside, datosCompletos.titulo, datosCompletos.valores);
    
    // Guardar datos actuales
    datosActualesDemarcacion = datosCompletos.valores;
    campoActualDemarcacion = datosCompletos.campo;
    
    // Inicializar componentes optimizados
    setTimeout(() => {
        inicializarComponentesOptimizados(datosCompletos);
    }, 100);
}

function inicializarComponentesOptimizados(datosCompletos) {
    try {
        console.log('Inicializando componentes optimizados...');
        console.log('Datos:', datosCompletos.valores.length, 'GeoJSON:', datosCompletos.geoJSON.features.length);
        
        // 1. Crear estadísticas
        crearEstadisticasLaterales(datosCompletos.valores);
        
        // 2. Crear gráfica
        crearGraficaLineasDemarcacion(datosCompletos.valores, datosCompletos.titulo, datosCompletos.sinPorcentaje);
        
        // 3. Inicializar mapa optimizado
        inicializarMapaOptimizado(datosCompletos);
        
        console.log('Componentes optimizados inicializados correctamente');
        
    } catch (error) {
        console.error('Error en inicialización optimizada:', error);
        mostrarErrorEnAside(error.message);
    }

    // Forzar distribución correcta
    setTimeout(() => {
        document.querySelector('.area-contenido').style.cssText = 'display: flex !important; flex-direction: row !important; height: 100% !important; width: 100% !important; padding: 10px !important; background: #ffffff !important; gap: 5px !important;';
        
        document.querySelector('.contenedor-mapa').style.cssText = 'flex: 0 0 60% !important; width: 60% !important; height: 100% !important; background: white !important; border: 2px solid #320547 !important; border-radius: 8px !important; padding: 15px !important; display: flex !important; flex-direction: column !important;';
        
        document.querySelector('.contenedor-grafica').style.cssText = 'flex: 0 0 40% !important; width: 40% !important; height: 100% !important; background: white !important; border: 3px solid #320547 !important; border-radius: 12px !important; padding: 20px !important; display: flex !important; flex-direction: column !important;';
        
        document.querySelector('.area-mapa').style.cssText = 'height: calc(100% - 40px) !important; width: 100% !important; flex: 1 !important;';
        
        document.querySelector('.area-grafica').style.cssText = 'height: calc(100% - 40px) !important; width: 100% !important; flex: 1 !important;';
    }, 200);
}

function inicializarMapaOptimizado(datosCompletos) {
    try {
        console.log('Inicializando mapa optimizado...');
        
        // Verificar Google Maps
        if (typeof google === 'undefined' || !google.maps) {
            throw new Error('Google Maps no está disponible');
        }
        
        const mapContainer = document.getElementById('mapaGoogleDemarcacion');
        if (!mapContainer) {
            throw new Error('Contenedor del mapa no encontrado');
        }

        mapContainer.addEventListener('mousemove', function(e) {
            const tooltip = document.getElementById('tooltip-mapa-custom');
            if (tooltip && tooltip.getAttribute('data-active') === 'true') {
                // Posicionar tooltip cerca del cursor
                const rect = this.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                
                // Ajustar posición para que no se salga de la pantalla
                let tooltipX = x + 15;
                let tooltipY = y - 200;
                
                // Si el tooltip se sale por la derecha, mostrarlo a la izquierda
                if (tooltipX + 250 > window.innerWidth) {
                    tooltipX = x - 265;
                }
                
                // Si el tooltip se sale por arriba, mostrarlo abajo
                if (tooltipY < 10) {
                    tooltipY = y + 20;
                }
                
                tooltip.style.left = tooltipX + 'px';
                tooltip.style.top = tooltipY + 'px';
            }
        });
        
        // Limpiar mapa anterior
        if (mapaGoogleDemarcacion) {
            limpiarMapaAnterior();
        }
        
        // Crear mapa nuevo
        mapaGoogleDemarcacion = new google.maps.Map(mapContainer, {
            center: { lat: 19.4326, lng: -99.1332 },
            zoom: 11,
            mapTypeId: 'roadmap',
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: true,
            fullscreenControl: false
        });
        
        // Procesar y cargar datos directamente
        procesarYCargarGeoJSON(datosCompletos);
        
    } catch (error) {
        console.error('Error inicializando mapa optimizado:', error);
        mostrarErrorMapa('Error al inicializar el mapa: ' + error.message);
    }
}

function procesarYCargarGeoJSON(datosCompletos) {
    try {
        const { valores, geoJSON, campo } = datosCompletos;
        console.log('Procesando GeoJSON con clasificación mejorada...');
        
        // Crear mapa de valores por UT
        const valoresPorUT = {};
        valores.forEach(item => {
            valoresPorUT[item.cve_ut] = Number(item.datos);
        });
        
        // Calcular rangos con el MISMO algoritmo de la leyenda
        const valoresNumericos = valores
            .map(item => Number(item.datos))
            .filter(v => !isNaN(v))
            .sort((a, b) => a - b);
        
        if (valoresNumericos.length === 0) {
            throw new Error('No hay valores numéricos válidos');
        }
        
        const min = valoresNumericos[0];
        const max = valoresNumericos[valoresNumericos.length - 1];
        const rango = max - min;
        
        console.log('Rangos calculados:', { min, max, rango });
        
        // Crear leyenda con la misma lógica
        crearLeyendaColores(min, max);
        
        // Enriquecer GeoJSON con clasificación consistente
        const geoJSONEnriquecido = {
            type: "FeatureCollection",
            features: geoJSON.features.map(feature => {
                const cveUT = feature.properties.clave_ut;
                const valor = valoresPorUT[cveUT];
                const colorInfo = obtenerColorYClasificacionMejorada(valor, min, max, rango);
                
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        valor_indicador: valor,
                        color_info: colorInfo,
                        campo_actual: campo,
                        clasificacion: colorInfo.nivel, // AGREGAR PARA EL CLICK
                        es_ut_consultada: cveUT === clave,
                        nombre: feature.properties.NOMGEO || feature.properties.nombre
                    }
                };
            })
        };
        
        // Cargar en el mapa GOOGLE MAPS (no Leaflet)
        const featuresCreadas = mapaGoogleDemarcacion.data.addGeoJson(geoJSONEnriquecido);
        console.log('Features cargadas:', featuresCreadas.length);
        
        // Aplicar estilos mejorados
        aplicarEstilosOptimizados();
        
        // Agregar eventos CORREGIDOS
        agregarEventosOptimizadosCorregidos(datosCompletos.sinPorcentaje);
        
        // Ajustar vista
        ajustarVistaOptimizada(geoJSON.features);
        
        console.log('GeoJSON procesado exitosamente con clasificación consistente');
        
    } catch (error) {
        console.error('Error procesando GeoJSON:', error);
        mostrarErrorMapa('Error procesando datos: ' + error.message);
    }
}

// AGREGAR ESTA FUNCIÓN QUE FALTA
function obtenerColorYClasificacionMejorada(valor, min, max, rango) {
    if (valor == null || isNaN(valor)) {
        return { color: '#cccccc', nivel: 'Sin datos', indice: -1 };
    }
    
    if (rango === 0) {
        return { color: '#7fcdbb', nivel: 'Único valor', indice: 2 };
    }
    
    const coloresClasificacion = [
        { color: '#d4eddad7', nivel: 'Muy Bajo', indice: 0 },
        { color: '#a8d5e8', nivel: 'Bajo', indice: 1 },
        { color: '#ffeaa7', nivel: 'Medio', indice: 2 },
        { color: '#fab1a0', nivel: 'Alto', indice: 3 },
        { color: '#e17055', nivel: 'Muy Alto', indice: 4 }
    ];
    
    // Usar la MISMA lógica de clasificación que la leyenda
    if (rango < 10) {
        const incremento = rango / 5;
        const indice = Math.min(4, Math.floor((valor - min) / incremento));
        return coloresClasificacion[indice];
    } else {
        const incremento = rango / 5;
        let indice = Math.floor((valor - min) / incremento);
        if (indice >= 5) indice = 4; // Asegurar que no exceda el índice
        return coloresClasificacion[indice];
    }
}

function destacarPuntoEnGraficaPorNombre(nombreUT) {
    if (!graficaLineasDemarcacion) return;
    
    const chart = graficaLineasDemarcacion;
    
    // Resetear todos los puntos primero
    chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        dataset.data.forEach((punto, puntoIndex) => {
            if (meta && meta.data && meta.data[puntoIndex] && meta.data[puntoIndex]._model) {
                // Restaurar tamaño original
                meta.data[puntoIndex]._model.radius = punto.x === clave ? 8 : 4;
                meta.data[puntoIndex]._model.backgroundColor = punto.x === clave ? '#ff0000' : dataset.borderColor;
                meta.data[puntoIndex]._model.borderColor = punto.x === clave ? '#ffffff' : '#333333';
                meta.data[puntoIndex]._model.borderWidth = punto.x === clave ? 3 : 2;
            }
        });
    });
    
    // Ahora destacar el punto específico
    chart.data.datasets.forEach((dataset, datasetIndex) => {
        dataset.data.forEach((punto, puntoIndex) => {
            if (punto.nombre === nombreUT || punto.x === nombreUT) {
                const meta = chart.getDatasetMeta(datasetIndex);
                if (meta && meta.data && meta.data[puntoIndex] && meta.data[puntoIndex]._model) {
                    meta.data[puntoIndex]._model.radius = 12;
                    meta.data[puntoIndex]._model.backgroundColor = '#ffff00';
                    meta.data[puntoIndex]._model.borderColor = '#000000';
                    meta.data[puntoIndex]._model.borderWidth = 4;
                }
            }
        });
    });
    
    chart.update('none');
}

function limpiarHighlightGrafica() {
    if (!graficaLineasDemarcacion) return;
    
    const chart = graficaLineasDemarcacion;
    
    chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        dataset.data.forEach((punto, puntoIndex) => {
            if (meta && meta.data && meta.data[puntoIndex] && meta.data[puntoIndex]._model) {
                // Restaurar valores originales
                meta.data[puntoIndex]._model.radius = punto.x === clave ? 8 : 4;
                meta.data[puntoIndex]._model.backgroundColor = punto.x === clave ? '#ff0000' : dataset.borderColor;
                meta.data[puntoIndex]._model.borderColor = punto.x === clave ? '#ffffff' : '#333333';
                meta.data[puntoIndex]._model.borderWidth = punto.x === clave ? 3 : 2;
            }
        });
    });
    
    chart.update('none');
}

// Función para aplicar estilos mejorados que resaltan la UT consultada
function agregarEventosOptimizadosCorregidos(sinPorcentaje = false) {
    // Limpiar eventos anteriores
    google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'click');
    google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseover');
    google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseout');
    
    // Click para filtrar gráfica
    mapaGoogleDemarcacion.data.addListener('click', function(event) {
        const feature = event.feature;
        const clasificacion = feature.getProperty('clasificacion');
        
        // Ocultar mensaje de ayuda después del primer click
        const mensajeAyuda = document.getElementById('mensaje-ayuda-mapa');
        if (mensajeAyuda) {
            mensajeAyuda.style.opacity = '0';
            setTimeout(() => {
                if (mensajeAyuda) {
                    mensajeAyuda.style.display = 'none';
                }
            }, 300);
        }
        
        filtrarGraficaPorClasificacion(clasificacion);
    });
    
    // Mouseover
    mapaGoogleDemarcacion.data.addListener('mouseover', function(event) {
        const feature = event.feature;
        const nombreUT = feature.getProperty('nombre') || feature.getProperty('NOMGEO');
        const esUTConsultada = feature.getProperty('es_ut_consultada');
        
        mostrarInfoWindowOptimizado(event, sinPorcentaje);
        
        if (!esUTConsultada) {
            mapaGoogleDemarcacion.data.overrideStyle(feature, {
                strokeWeight: 4,
                fillOpacity: 0.9,
                zIndex: 999
            });
        }
        
        // Destacar en gráfica
        if (nombreUT) {
            destacarPuntoEnGraficaPorNombre(nombreUT);
        }
    });
    
    // Mouseout - IMPORTANTE: limpiar highlights
    mapaGoogleDemarcacion.data.addListener('mouseout', function(event) {
        ocultarTooltip();
        
        if (!event.feature.getProperty('es_ut_consultada')) {
            mapaGoogleDemarcacion.data.revertStyle(event.feature);
        }
        
        // Limpiar highlight de gráfica
        limpiarHighlightGrafica();
    });
}

// MOVER ESTAS FUNCIONES FUERA, NO DENTRO DE onEachFeature
function filtrarGraficaPorClasificacion(clasificacionSeleccionada) {
    if (!graficaLineasDemarcacion) return;
    
    console.log('Filtrando por clasificación:', clasificacionSeleccionada);
    
    // Guardar configuración original
    if (!window.configuracionGraficaOriginal) {
        window.configuracionGraficaOriginal = {
            datasets: JSON.parse(JSON.stringify(graficaLineasDemarcacion.data.datasets))
        };
    }
    
    // Oscurecer polígonos del mapa (código existente)
    mapaGoogleDemarcacion.data.forEach(function(feature) {
        const clasificacion = feature.getProperty('clasificacion');
        const esUTConsultada = feature.getProperty('es_ut_consultada');
        
        if (clasificacion !== clasificacionSeleccionada) {
            mapaGoogleDemarcacion.data.overrideStyle(feature, {
                fillOpacity: 0.2,
                strokeOpacity: 0.3,
                strokeWeight: 1,
                zIndex: 1
            });
        } else {
            mapaGoogleDemarcacion.data.overrideStyle(feature, {
                fillOpacity: 0.9,
                strokeColor: esUTConsultada ? '#ff0000' : '#320547',
                strokeWeight: esUTConsultada ? 4 : 2,
                strokeOpacity: 1,
                zIndex: 100
            });
        }
    });
    
    // NUEVA LÓGICA: Obtener TODOS los datos de la clasificación seleccionada
    const coloresClasificacion = {
        'Muy Bajo': '#d4eddad7',
        'Bajo': '#a8d5e8',
        'Medio': '#ffeaa7',
        'Alto': '#fab1a0',
        'Muy Alto': '#e17055'
    };
    
    // Filtrar TODOS los datos originales de la clase seleccionada
    const datosClaseSeleccionada = datosActualesDemarcacion.filter(dato => {
        const valor = Number(dato.datos);
        const min = Math.min(...datosActualesDemarcacion.map(d => Number(d.datos)));
        const max = Math.max(...datosActualesDemarcacion.map(d => Number(d.datos)));
        const rango = max - min;
        
        const colorInfo = obtenerColorYClasificacionMejorada(valor, min, max, rango);
        return colorInfo.nivel === clasificacionSeleccionada;
    });
    
    console.log(`Mostrando TODOS los ${datosClaseSeleccionada.length} datos de clase ${clasificacionSeleccionada}`);
    
    // Crear nuevo dataset temporal con TODOS los datos
    const datasetTemporal = {
        label: `${clasificacionSeleccionada} (${datosClaseSeleccionada.length} UTs)`,
        data: datosClaseSeleccionada.map(d => ({ 
            x: d.cve_ut, 
            y: Number(d.datos),
            nombre: d.nombre_ut 
        })),
        borderColor: coloresClasificacion[clasificacionSeleccionada],
        backgroundColor: coloresClasificacion[clasificacionSeleccionada] + '80',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: datosClaseSeleccionada.map(d => 
            d.cve_ut === clave ? '#ff0000' : coloresClasificacion[clasificacionSeleccionada]
        ),
        pointBorderColor: datosClaseSeleccionada.map(d => 
            d.cve_ut === clave ? '#ffffff' : '#333333'
        ),
        pointBorderWidth: datosClaseSeleccionada.map(d => 
            d.cve_ut === clave ? 3 : 1
        ),
        tension: 0.3,
        fill: false
    };
    
    // Reemplazar datasets con solo el seleccionado
    graficaLineasDemarcacion.data.datasets = [datasetTemporal];
    
    // Actualizar escala de Y para ajustarse a los datos visibles
    const valores = datosClaseSeleccionada.map(d => Number(d.datos));
    if (valores.length > 0) {
        const minY = Math.min(...valores);
        const maxY = Math.max(...valores);
        
        graficaLineasDemarcacion.options.scales.y.min = minY * 0.95;
        graficaLineasDemarcacion.options.scales.y.max = maxY * 1.05;
    }
    
    // Actualizar título de la gráfica temporalmente
    const tituloGrafica = document.querySelector('.titulo-grafica');
    if (tituloGrafica) {
        const tituloBase = tituloGrafica.textContent.split(' - Clase:')[0];
        tituloGrafica.textContent = `${tituloBase} - Clase: ${clasificacionSeleccionada}`;
    }
    
    graficaLineasDemarcacion.update();
    
    // Cancelar temporizador anterior si existe
    if (temporizadorRestauracion) {
        clearTimeout(temporizadorRestauracion);
        console.log('Temporizador anterior cancelado');
    }
    
    // Restaurar después de 10 segundos
    temporizadorRestauracion = setTimeout(() => {
        restaurarVisualizacion();
        temporizadorRestauracion = null;
    }, 10000);
}

function restaurarVisualizacion() {
    // Restaurar estilos del mapa
    mapaGoogleDemarcacion.data.revertStyle();
    
    // Restaurar datasets originales
    if (window.configuracionGraficaOriginal) {
        // Restaurar los datasets originales guardados
        graficaLineasDemarcacion.data.datasets = JSON.parse(
            JSON.stringify(window.configuracionGraficaOriginal.datasets)
        );
        
        // Restaurar escala Y automática
        delete graficaLineasDemarcacion.options.scales.y.min;
        delete graficaLineasDemarcacion.options.scales.y.max;
        
        // Restaurar título original
        const tituloGrafica = document.querySelector('.titulo-grafica');
        if (tituloGrafica) {
            const tituloOriginal = tituloGrafica.textContent.split(' - Clase:')[0];
            tituloGrafica.textContent = tituloOriginal;
        }
        
        graficaLineasDemarcacion.update();
    }
}

// Nueva función para restaurar colores
function restaurarColoresGrafica() {
    if (!graficaLineasDemarcacion) return;
    
    const coloresOriginales = [
        '#d4edda', '#c3e6cb', '#ffeaa7', '#fab1a0', '#e17055'
    ];
    
    graficaLineasDemarcacion.data.datasets.forEach((dataset, index) => {
        dataset.hidden = false;
        dataset.borderColor = coloresOriginales[index] || '#999';
        dataset.backgroundColor = (coloresOriginales[index] || '#999') + '40';
        dataset.borderWidth = 2;
        dataset.pointRadius = dataset.data.map(d => d.x === clave ? 8 : 4);
        dataset.pointBackgroundColor = dataset.data.map(d => 
            d.x === clave ? '#ff0000' : coloresOriginales[index]
        );
    });
    
    graficaLineasDemarcacion.update();
}

function destacarPoligonoSeleccionadoGoogle(featureSeleccionado) {
    // Resetear estilo de todos los polígonos
    mapaGoogleDemarcacion.data.revertStyle();
    
    // Destacar el polígono seleccionado
    mapaGoogleDemarcacion.data.overrideStyle(featureSeleccionado, {
        strokeWeight: 5,
        strokeColor: '#ff0000',
        fillOpacity: 0.9,
        zIndex: 1001
    });
}

function destacarPuntoEnGraficaPorNombre(nombreUT) {
    if (!graficaLineasDemarcacion) return;
    
    const chart = graficaLineasDemarcacion;
    
    // Buscar en todos los datasets
    chart.data.datasets.forEach((dataset, datasetIndex) => {
        dataset.data.forEach((punto, puntoIndex) => {
            if (punto.nombre === nombreUT || punto.x === nombreUT) {
                // Obtener el elemento visual del punto
                const meta = chart.getDatasetMeta(datasetIndex);
                
                // VERIFICAR que el elemento existe antes de modificarlo
                if (meta && meta.data && meta.data[puntoIndex]) {
                    const element = meta.data[puntoIndex];
                    
                    // VERIFICAR que _model existe
                    if (element._model) {
                        // Destacar temporalmente
                        element._model.radius = 10;
                        element._model.backgroundColor = '#ffff00';
                        element._model.borderColor = '#ff0000';
                        element._model.borderWidth = 3;
                    }
                }
            }
        });
    });
    
    chart.update('none');
}
function limpiarHighlightGrafica() {
    if (!graficaLineasDemarcacion) return;
    
    // Restaurar estilos originales
    graficaLineasDemarcacion.data.datasets.forEach(dataset => {
        dataset.data.forEach((punto, index) => {
            const meta = graficaLineasDemarcacion.getDatasetMeta(dataset);
            if (meta.data[index]) {
                // Restaurar colores originales
                meta.data[index]._model.pointBackgroundColor = punto.x === clave ? '#ff0000' : dataset.borderColor;
                meta.data[index]._model.pointBorderColor = punto.x === clave ? '#ffffff' : '#333333';
                meta.data[index]._model.pointRadius = punto.x === clave ? 8 : 4;
            }
        });
    });
    
    graficaLineasDemarcacion.update('none');
}

function aplicarEstilosOptimizados() {
    mapaGoogleDemarcacion.data.setStyle(function(feature) {
        const colorInfo = feature.getProperty('color_info');
        const valor = feature.getProperty('valor_indicador');
        const tieneDatos = valor != null && !isNaN(valor);
        const esUTConsultada = feature.getProperty('es_ut_consultada');
        
        return {
            // Usar el color de clasificación para TODOS los polígonos
            fillColor: colorInfo ? colorInfo.color : '#cccccc',
            fillOpacity: tieneDatos ? 0.7 : 0.3,
            // Solo cambiar el borde para la UT consultada
            strokeColor: esUTConsultada ? '#ff0000' : '#320547',
            strokeWeight: esUTConsultada ? 4 : 2,
            strokeOpacity: 1,
            clickable: true,
            zIndex: esUTConsultada ? 1000 : 1
        };
    });
    
    console.log('Estilos aplicados con UT consultada resaltada solo en borde');
}

function destacarPoligonoEnMapaGoogle(nombreUT) {
    // Limpiar estilos anteriores
    mapaGoogleDemarcacion.data.revertStyle();
    
    // Buscar y destacar el feature correspondiente
    mapaGoogleDemarcacion.data.forEach(function(feature) {
        const nombreFeature = feature.getProperty('nombre') || feature.getProperty('NOMGEO');
        
        if (nombreFeature === nombreUT) {
            mapaGoogleDemarcacion.data.overrideStyle(feature, {
                strokeWeight: 4,
                strokeColor: '#ffff00',
                fillOpacity: 0.9,
                zIndex: 999
            });
        }
    });
}

function limpiarHighlightMapaGoogle() {
    mapaGoogleDemarcacion.data.revertStyle();
}
function agregarEventosOptimizados() {
    // Limpiar eventos anteriores
    google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'click');
    google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseover');
    google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseout');
    
    // Click
    mapaGoogleDemarcacion.data.addListener('click', function(event) {
        mostrarInfoWindowOptimizado(event);
    });
    
    // Hover
    mapaGoogleDemarcacion.data.addListener('mouseover', function(event) {
        mapaGoogleDemarcacion.data.overrideStyle(event.feature, {
            strokeWeight: 4,
            fillOpacity: 0.9,
            zIndex: 999
        });
    });
    
    mapaGoogleDemarcacion.data.addListener('mouseout', function(event) {
        mapaGoogleDemarcacion.data.revertStyle(event.feature);
    });
    
    console.log('Eventos optimizados agregados');
}

function mostrarInfoWindowOptimizado(event, sinPorcentaje = false) {
    const feature = event.feature;
    const cveUT = feature.getProperty('clave_ut');
    const nombreUT = feature.getProperty('nombre') || feature.getProperty('NOMGEO') || `UT ${cveUT}`;
    const valor = feature.getProperty('valor_indicador');
    const colorInfo = feature.getProperty('color_info');
    
    // Crear o obtener tooltip
    let tooltip = document.getElementById('tooltip-mapa-custom');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'tooltip-mapa-custom';
        tooltip.style.cssText = `
            position: fixed;
            background: white;
            border: 3px solid #320547;
            border-radius: 8px;
            padding: 15px;
            font-family: Arial, sans-serif;
            min-width: 250px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            z-index: 2147483647;
            pointer-events: none;
            transition: opacity 0.2s;
        `;
        document.body.appendChild(tooltip);
    }
    
    // Contenido del tooltip
    tooltip.innerHTML = `
        <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 2px solid #320547;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 25px; height: 20px; background: ${colorInfo ? colorInfo.color : '#cccccc'}; 
                            border: 2px solid #333; border-radius: 4px;"></div>
                <strong style="color: #320547; font-size: 16px;">UT: ${cveUT}</strong>
            </div>
        </div>
        <div style="margin-bottom: 8px;">
            <span style="color: #666;">Nombre:</span>
            <span style="margin-left: 10px; color: #333; font-weight: 500;">${nombreUT}</span>
        </div>
        <div style="margin-bottom: 8px;">
            <span style="color: #666;">Valor:</span>
            <span style="margin-left: 10px; color: #320547; font-weight: bold; font-size: 15px;">
                ${valor != null ? valor.toLocaleString() + (sinPorcentaje ? '' : '%') : 'Sin datos'}
            </span>
        </div>
        <div>
            <span style="color: #666;">Clasificación:</span>
            <span style="margin-left: 10px; padding: 2px 8px; background: ${colorInfo ? colorInfo.color : '#ccc'}; 
                       color: #333; font-weight: bold; border-radius: 4px;">
                ${colorInfo ? colorInfo.nivel : 'N/A'}
            </span>
        </div>
    `;
    
    // Guardar posición para el mousemove
    tooltip.setAttribute('data-active', 'true');
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
}

function ocultarTooltip() {
    console.log('Ocultando tooltip');
    const tooltip = document.getElementById('tooltip-mapa-custom');
    if (tooltip) {
        tooltip.style.display = 'none';
        tooltip.style.opacity = '0';
    }
}
function ajustarVistaOptimizada(features) {
    if (!features || features.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    let puntosAgregados = 0;
    
    features.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
            if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates[0]) {
                feature.geometry.coordinates[0].forEach(coord => {
                    if (coord.length >= 2) {
                        bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
                        puntosAgregados++;
                    }
                });
            }
        }
    });
    
    if (puntosAgregados > 0) {
        mapaGoogleDemarcacion.fitBounds(bounds);
        console.log('Vista ajustada con', puntosAgregados, 'puntos');
    }
}

function limpiarMapaAnterior() {
    try {
        mapaGoogleDemarcacion.data.forEach(function(feature) {
            mapaGoogleDemarcacion.data.remove(feature);
        });
        
        google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'click');
        google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseover');
        google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseout');
        
        console.log('Mapa anterior limpiado');
    } catch (error) {
        console.warn('Error limpiando mapa anterior:', error);
    }
}

function mostrarErrorEnAside(mensaje) {
    const container = document.getElementById('estadisticas-container');
    if (container) {
        container.innerHTML = `
            <div style="color: #dc3545; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #dc3545; text-align: center;">
                <h4 style="margin: 0 0 10px 0;">Error</h4>
                <p style="margin: 0;">${mensaje}</p>
            </div>
        `;
    }
}

// 2. Función crearEstructuraAmpliada (del código original)
function crearEstructuraAmpliada(aside, titulo, datos) {
     // Buscar el nombre de la UT consultada
    const NomDem = nomdem;
    const utConsultada = datos.find(d => d.cve_ut === clave);
    const nombreUTConsultada = utConsultada ? utConsultada.nombre_ut : '';
    
    console.log('UT Consultada encontrada:', {
        clave: clave,
        nombre: nombreUTConsultada,
        utCompleta: utConsultada
    });
    
    aside.innerHTML = `
        <!-- Header -->
        <div class="header-ampliado">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: baseline; gap: 15px;">
                    <h1 class="titulo-indicador" style="margin: 0;">${NomDem}</h1> 
                    <h2 class="titulo-indicador" style="margin: 0;">${titulo}</h2>
                    <span style="color: #ffffffbb; font-size: 16px; font-weight: normal;">
                        ${nombreUTConsultada ? `(${nombreUTConsultada})` : ''}
                    </span>
                </div>
                <button class="btn-cerrar-ampliado" onclick="cerrarAsideAmpliado()">
                    <i class="fa fa-arrow-left"></i> Regresar
                </button>

            </div>
        </div>
        
        <!-- Contenedor principal -->
        <div class="contenedor-principal">
            <!-- Leyenda lateral izquierda -->
            <div class="leyenda-lateral">
                <h3 class="leyenda-titulo">Información</h3>
                
                <!-- Leyenda de colores -->
                <div class="leyenda-colores">
                    <h4>Clasificación</h4>
                    <div id="leyenda-colores-container">
                        <!-- Se llena dinámicamente -->
                    </div>
                </div>

                <!-- Estadísticas generales -->
                <div class="estadisticas-leyenda">
                    <h4>Estadísticas Generales</h4>
                    <div id="estadisticas-container">
                        <!-- Se llena dinámicamente -->
                    </div>
                </div>
                
            </div>
            
            <!-- Área de contenido derecha -->
            <div class="area-contenido">
                <!-- Mapa de Google Maps (izquierda) -->
                <div class="contenedor-mapa">
                    <h4 class="titulo-mapa">Mapa Territorial</h4>
                    <div class="area-mapa">
                        <div id="mapaGoogleDemarcacion"></div>

                        <!-- MENSAJE FLOTANTE CORREGIDO -->
                        <div id="mensaje-ayuda-mapa" style="
                            position: absolute;
                            bottom: 15px;
                            left: 10px;
                            right: 350px;
                            margin: 0 auto;
                            max-width: 280px;
                            background: rgba(81, 0, 128, 0.43);
                            color: white;
                            padding: 8px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-family: 'Segoe UI', Arial, sans-serif;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            z-index: 1000;
                            pointer-events: none;
                            text-align: center;
                            transition: opacity 0.3s ease;
                            opacity: 0.9;
                        ">
                            Haz click en cualquier polígono para ver la gráfica de su clase
                        </div>
                    </div>
                </div>
                
                <!-- Gráfica de líneas (derecha) -->
                <div class="contenedor-grafica">
                    <h4 class="titulo-grafica">Distribución de ${titulo} por Unidades Territoriales</h4>
                    <div class="area-grafica">
                        <canvas id="graficaLineasDemarcacion"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar después de crear la estructura en crearEstructuraAmpliada
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulseSutil {
            0% { opacity: 0.9; }
            50% { opacity: 0.6; }
            100% { opacity: 0.9; }
        }
        
        #mensaje-ayuda-mapa {
            animation: pulseSutil 3s ease-in-out infinite;
        }
        
        #mensaje-ayuda-mapa:hover {
            animation: none;
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);

    // Agregar al final de crearEstructuraAmpliada o en inicializarComponentesOptimizados
    document.querySelector('.area-contenido').style.flexDirection = 'row';
    document.querySelector('.contenedor-mapa').style.cssText += 'flex: 0 0 60% !important; order: 1 !important;';
    document.querySelector('.contenedor-grafica').style.cssText += 'flex: 0 0 38% !important; order: 2 !important; min-height: 250px !important; max-height: none !important;';
}

// 3. Función crearEstadisticasLaterales (del código original)
function crearEstadisticasLaterales(datos) {
    const valores = datos
        .map(d => Number(d.datos)) 
        .filter(v => !isNaN(v));   
    
    if (valores.length === 0) {
        document.getElementById('estadisticas-container').innerHTML = '<p>Sin datos válidos</p>';
        return;
    }
    
    valores.sort((a, b) => a - b);
    const total = valores.length;
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const media = suma / total;

    let mediana;
    if (total % 2 === 0) {
        mediana = (valores[total / 2 - 1] + valores[total / 2]) / 2;
    } else {
        mediana = valores[Math.floor(total / 2)];
    }

    const min = valores[0];
    const max = valores[valores.length - 1];
    const varianza = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / total;
    const desviacion = Math.sqrt(varianza);

    const estadisticas = [
        { label: 'Total de UT', valor: total, tipo: 'count' },
        // { label: 'Mínimo', valor: min.toLocaleString(), tipo: 'value' },
        // { label: 'Máximo', valor: max.toLocaleString(), tipo: 'value' },
        { label: 'Media', valor: media.toFixed(2), tipo: 'decimal' },
        { label: 'Mediana', valor: mediana.toFixed(2), tipo: 'decimal' },
        // { label: 'Desv. Est.', valor: desviacion.toFixed(2), tipo: 'decimal' }
    ];
    
    const container = document.getElementById('estadisticas-container');
    container.innerHTML = '';
    
    estadisticas.forEach(stat => {
        const item = document.createElement('div');
        item.className = 'stat-item-mejorado';
        
        // Estilo mejorado con mejor espaciado
        item.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 10px 12px;
            background: ${stat.tipo === 'count' ? '#e8f5e8' : stat.tipo === 'value' ? '#fff3e0' : '#f3e5f5'};
            border-radius: 8px;
            border-left: 4px solid ${stat.tipo === 'count' ? '#4caf50' : stat.tipo === 'value' ? '#ff9800' : '#9c27b0'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        `;
        
        item.innerHTML = `
            <div class="stat-label-container" style="flex: 1;">
                <span class="stat-label" style="
                    font-weight: 600;
                    color: #333;
                    font-size: 13px;
                    display: block;
                ">${stat.label}</span>
            </div>
            <div class="stat-value-container">
                <span class="stat-value" style="
                    color: ${stat.tipo === 'count' ? '#2e7d32' : stat.tipo === 'value' ? '#f57c00' : '#7b1fa2'};
                    font-weight: 700;
                    font-size: 15px;
                    background: rgba(255,255,255,0.8);
                    padding: 4px 8px;
                    border-radius: 4px;
                ">${stat.valor}</span>
            </div>
        `;
        
        // Agregar efecto hover
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        });
        
        container.appendChild(item);
    });
}

// 4. Función crearGraficaLineasDemarcacion (del código original)
// function crearGraficaLineasDemarcacion(datos, titulo) {
//     const canvas = document.getElementById('graficaLineasDemarcacion');
//     const ctx = canvas.getContext('2d');
    
//     if (graficaLineasDemarcacion) {
//         graficaLineasDemarcacion.destroy();
//     }
    
//     // Ordenar datos y obtener valores para clasificación
//     const datosOrdenados = [...datos].sort((a, b) => a.datos - b.datos);
//     const valores = datosOrdenados.map(d => Number(d.datos)).filter(v => !isNaN(v));
    
//     if (valores.length === 0) {
//         console.warn('No hay datos válidos para la gráfica');
//         return;
//     }
    
//     const min = valores[0];
//     const max = valores[valores.length - 1];
    
//     // CLASIFICAR DATOS EN 5 GRUPOS para reducir puntos en la gráfica
//     const gruposClasificados = clasificarDatosEnGrupos(datosOrdenados, min, max);
    
//     // Crear datasets solo con datos representativos de cada clasificación
//     const datasets = [];
//     const colores = [
//         { color: '#d4edda', label: 'Muy Bajo' },
//         { color: '#c3e6cb', label: 'Bajo' },  
//         { color: '#ffeaa7', label: 'Medio' },
//         { color: '#fab1a0', label: 'Alto' },
//         { color: '#e17055', label: 'Muy Alto' }
//     ];
    
//     gruposClasificados.forEach((grupo, index) => {
//         if (grupo.datos.length > 0) {
//             // Reducir puntos: tomar cada 3er punto para evitar sobrecarga visual
//             const datosFiltrados = grupo.datos.filter((_, i) => i % Math.max(1, Math.ceil(grupo.datos.length / 15)) === 0);
            
//             datasets.push({
//                 label: `${colores[index].label} (${grupo.datos.length} UTs)`,
//                 data: datosFiltrados.map(d => ({ x: d.cve_ut, y: d.datos })),
//                 borderColor: colores[index].color,
//                 backgroundColor: colores[index].color + '40',
//                 borderWidth: 2,
//                 fill: false,
//                 tension: 0.3,
//                 pointBackgroundColor: datosFiltrados.map(d => 
//                     d.cve_ut === clave ? '#ff0000' : colores[index].color
//                 ),
//                 pointBorderColor: datosFiltrados.map(d => 
//                     d.cve_ut === clave ? '#ffffff' : '#333333'
//                 ),
//                 pointBorderWidth: datosFiltrados.map(d => 
//                     d.cve_ut === clave ? 4 : 2
//                 ),
//                 pointRadius: datosFiltrados.map(d => 
//                     d.cve_ut === clave ? 8 : 4
//                 ),
//                 pointHoverRadius: datosFiltrados.map(d => 
//                     d.cve_ut === clave ? 12 : 6
//                 )
//             });
//         }
//     });
    
//     graficaLineasDemarcacion = new Chart(ctx, {
//         type: 'line',
//         data: {
//             datasets: datasets
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     display: true,
//                     position: 'top',
//                     labels: {
//                         font: {
//                             family: 'Poppins',
//                             size: 11
//                         },
//                         usePointStyle: true,
//                         boxWidth: 12
//                     }
//                 },
//                 tooltip: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                     titleColor: '#fff',
//                     bodyColor: '#fff',
//                     borderColor: '#fff',
//                     borderWidth: 1,
//                     cornerRadius: 8,
//                     callbacks: {
//                         title: function(context) {
//                             const punto = context[0].raw;
//                             return `UT: ${punto.x}${punto.x === clave ? ' (Consultada)' : ''}`;
//                         },
//                         label: function(context) {
//                             const punto = context.raw;
//                             return [
//                                 `${titulo}: ${punto.y.toLocaleString()}`,
//                                 `Clasificación: ${context.dataset.label.split(' (')[0]}`
//                             ];
//                         }
//                     }
//                 }
//             },
//             scales: {
//                 x: {
//                     type: 'category',
//                     title: {
//                         display: true,
//                         text: 'Unidades Territoriales (por clasificación)',
//                         font: { weight: 'bold', size: 11 }
//                     },
//                     ticks: {
//                         maxRotation: 45,
//                         font: { size: 9 },
//                         maxTicksLimit: 20 // Limitar etiquetas para evitar saturación
//                     }
//                 },
//                 y: {
//                     title: {
//                         display: true,
//                         text: titulo,
//                         font: { weight: 'bold', size: 11 }
//                     },
//                     beginAtZero: false,
//                     grid: {
//                         color: 'rgba(0,0,0,0.1)'
//                     },
//                     ticks: {
//                         font: { size: 10 }
//                     }
//                 }
//             },
//             interaction: {
//                 intersect: false,
//                 mode: 'nearest'
//             }
//         }
//     });
    
//     console.log('Gráfica creada con datos clasificados, UT resaltada:', clave);
// }

function crearGraficaLineasDemarcacion(datos, titulo, clave, sinPorcentaje = false) {
    const container = document.getElementById('graficaContainer');
    const canvas = document.getElementById('graficaLineasDemarcacion');
    const ctx = canvas.getContext('2d');

    // Función para ajustar altura según el ancho
    function ajustarTamañoCanvas() {
        const ancho = container.clientWidth;
        const altura = Math.max(100, ancho * 0.2); // altura mínima 300px, 50% del ancho
        canvas.width = ancho;
        canvas.height = altura;
        if (graficaLineasDemarcacion) {
            graficaLineasDemarcacion.resize();
        }
    }

    // Ajustar tamaño al cargar
    ajustarTamañoCanvas();

    // Ajustar tamaño cuando cambie el tamaño de ventana
    window.addEventListener('resize', () => {
        ajustarTamañoCanvas();
    });

    // Destruir gráfica previa si existe
    if (graficaLineasDemarcacion) {
        graficaLineasDemarcacion.destroy();
    }

    // Ordenar y filtrar datos
    const datosOrdenados = [...datos].sort((a, b) => a.datos - b.datos);
    const valores = datosOrdenados.map(d => Number(d.datos)).filter(v => !isNaN(v));
    if (valores.length === 0) return console.warn('No hay datos válidos para la gráfica');

    const min = valores[0];
    const max = valores[valores.length - 1];

    // Clasificar datos en 5 grupos
    const gruposClasificados = clasificarDatosEnGrupos(datosOrdenados, min, max);

    // Crear datasets
    const datasets = [];
    const colores = [
        { color: '#d4edda', label: 'Muy Bajo' },
        { color: '#a8d5e8', label: 'Bajo' },
        { color: '#ffeaa7', label: 'Medio' },
        { color: '#fab1a0', label: 'Alto' },
        { color: '#e17055', label: 'Muy Alto' }
    ];

    gruposClasificados.forEach((grupo, index) => {
        if (grupo.datos.length > 0) {
            const datosFiltrados = grupo.datos.filter((_, i) => i % Math.max(1, Math.ceil(grupo.datos.length / 15)) === 0);
            datasets.push({
                label: `${colores[index].label} (${grupo.datos.length} UTs)`,
                // data: datosFiltrados.map(d => ({ x: d.cve_ut, y: d.datos })),
                data: datosFiltrados.map(d => ({ x: d.cve_ut, y: d.datos, nombre: d.nombre_ut })),
                borderColor: colores[index].color,
                backgroundColor: colores[index].color + '40',
                borderWidth: 2,
                fill: false,
                tension: 0.3,
                pointBackgroundColor: datosFiltrados.map(d => d.cve_ut === clave ? '#ff0000' : colores[index].color),
                pointBorderColor: datosFiltrados.map(d => d.cve_ut === clave ? '#ffffff' : '#333333'),
                pointBorderWidth: datosFiltrados.map(d => d.cve_ut === clave ? 4 : 2),
                pointRadius: datosFiltrados.map(d => d.cve_ut === clave ? 8 : 4),
                pointHoverRadius: datosFiltrados.map(d => d.cve_ut === clave ? 12 : 6)
            });
        }
    });

    // Crear gráfica
    graficaLineasDemarcacion = new Chart(ctx, {
        type: 'line',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { family: 'Poppins', size: 11 }, usePointStyle: true, boxWidth: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        title: function(context) {
                            const punto = context[0].raw;
                            // return `UT: ${punto.x}${punto.x === clave ? ' (Consultada)' : ''}`;
                            return `UT: ${punto.nombre || punto.x}${punto.x === clave ? ' (Consultada)' : ''}`;
                        },
                        label: function(context) {
                            const punto = context.raw;
                            return [
                                `${titulo}: ${punto.y.toLocaleString()}${sinPorcentaje ? '' : '%'}`,
                                `Clasificación: ${context.dataset.label.split(' (')[0]}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: { type: 'category', title: { display: true, text: 'Unidades Territoriales (por clasificación)', font: { weight: 'bold', size: 11 } }, ticks: { maxRotation: 45, font: { size: 9 }, maxTicksLimit: 20 } },
                y: { title: { display: true, text: titulo, font: { weight: 'bold', size: 11 } }, beginAtZero: false, grid: { color: 'rgba(0,0,0,0.1)' }, ticks: { font: { size: 10 } } }
            },
            interaction: { intersect: false, mode: 'nearest' },

            // En crearGraficaLineasDemarcacion, CAMBIAR el onHover por:
            onHover: function(event, activeElements) {
                if (activeElements.length > 0) {
                    const elementoActivo = activeElements[0];
                    const dataset = graficaLineasDemarcacion.data.datasets[elementoActivo.datasetIndex];
                    const punto = dataset.data[elementoActivo.index];
                    const nombreUT = punto.nombre; // Usa el nombre del punto
                    
                    // Destacar polígono correspondiente en Google Maps
                    destacarPoligonoEnMapaGoogle(nombreUT);
                } else {
                    // Limpiar highlight del mapa
                    limpiarHighlightMapaGoogle();
                }
            }
        }
    });

    

    console.log('Gráfica creada con datos clasificados, UT resaltada:', clave);
}

// Agregar estas funciones:
function destacarPoligonoEnMapa(nombreUT) {
    map.eachLayer(function(layer) {
        if (layer.feature) {
            const nombreLayer = layer.feature.properties.NOMGEO || layer.feature.properties.nombre;
            
            if (nombreLayer === nombreUT) {
                layer.setStyle({
                    weight: 3,
                    color: '#ffff00',
                    opacity: 1
                });
            } else {
                layer.setStyle({
                    weight: 1,
                    opacity: 0.8
                });
            }
        }
    });
}

function limpiarHighlightMapa() {
    map.eachLayer(function(layer) {
        if (layer.feature) {
            layer.setStyle({
                weight: 1,
                opacity: 0.8
            });
        }
    });
}


// Función auxiliar para clasificar datos en grupos
function clasificarDatosEnGrupos(datos, min, max) {
    const rango = max - min;
    const incremento = rango / 5;
    
    const grupos = [
        { datos: [], rango: [min, min + incremento] },
        { datos: [], rango: [min + incremento, min + (incremento * 2)] },
        { datos: [], rango: [min + (incremento * 2), min + (incremento * 3)] },
        { datos: [], rango: [min + (incremento * 3), min + (incremento * 4)] },
        { datos: [], rango: [min + (incremento * 4), max] }
    ];
    
    datos.forEach(dato => {
        const valor = Number(dato.datos);
        
        for (let i = 0; i < grupos.length; i++) {
            if (i === 4) { // Último grupo incluye el máximo
                if (valor >= grupos[i].rango[0] && valor <= grupos[i].rango[1]) {
                    grupos[i].datos.push(dato);
                    break;
                }
            } else {
                if (valor >= grupos[i].rango[0] && valor < grupos[i].rango[1]) {
                    grupos[i].datos.push(dato);
                    break;
                }
            }
        }
    });
    
    return grupos;
}

// 5. Función crearLeyendaColores (del código original)
function crearLeyendaColores(min, max) {
    console.log('Creando leyenda con valores:', { min, max });
    
    min = Number(min);
    max = Number(max);

    if (isNaN(min) || isNaN(max)) {
        console.error("min o max no son números:", min, max);
        return;
    }

    // ALGORITMO MEJORADO PARA CLASIFICACIÓN
    const rango = max - min;
    let rangos = [];
    
    if (rango === 0) {
        // Si todos los valores son iguales
        rangos = [{
            color: '#7fcdbb', 
            nivel: 'Único valor', 
            rango: `${min.toFixed(0)}`,
            min: min,
            max: min
        }];
    } else if (rango < 10) {
        // Para rangos muy pequeños (menos de 10), usar incrementos de 1 o decimales
        const incremento = rango / 5;
        for (let i = 0; i < 5; i++) {
            const rangoMin = min + (incremento * i);
            const rangoMax = i === 4 ? max : min + (incremento * (i + 1)) - 0.01;
            
            rangos.push({
                color: obtenerColorPorIndice(i),
                nivel: obtenerNivelPorIndice(i),
                rango: rango < 5 ? 
                    `${rangoMin.toFixed(2)} - ${rangoMax.toFixed(2)}` : 
                    `${rangoMin.toFixed(1)} - ${rangoMax.toFixed(1)}`,
                min: rangoMin,
                max: rangoMax
            });
        }
    } else {
        // Para rangos normales, usar enteros redondeados
        const incremento = rango / 5;
        for (let i = 0; i < 5; i++) {
            const rangoMin = i === 0 ? min : Math.ceil(min + (incremento * i));
            const rangoMax = i === 4 ? max : Math.floor(min + (incremento * (i + 1)));
            
            rangos.push({
                color: obtenerColorPorIndice(i),
                nivel: obtenerNivelPorIndice(i),
                rango: `${Math.round(rangoMin)} - ${Math.round(rangoMax)}`,
                min: rangoMin,
                max: rangoMax
            });
        }
    }
    
    const container = document.getElementById('leyenda-colores-container');
    container.innerHTML = '';
    
    // Mostrar rangos de mayor a menor (Muy Alto primero)
    rangos.reverse().forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-leyenda-mejorada';
        div.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px 10px;
            background: rgba(255,255,255,0.9);
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        div.innerHTML = `
            <div class="color-box-mejorado" style="
                width: 18px;
                height: 18px;
                background-color: ${item.color};
                border: 2px solid #333;
                margin-right: 12px;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                flex-shrink: 0;
            "></div>
            <div class="legend-text-container" style="flex: 1;">
                <div class="nivel-texto-mejorado" style="
                    font-weight: 600;
                    font-size: 13px;
                    color: #333;
                    margin-bottom: 2px;
                ">${item.nivel}</div>
                <div class="rango-texto" style="
                    font-size: 11px; 
                    color: #666;
                    font-weight: 500;
                ">${item.rango}</div>
            </div>
        `;
        
        // Efectos hover mejorados
        div.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            this.style.background = 'rgba(255,255,255,1)';
        });
        
        div.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            this.style.background = 'rgba(255,255,255,0.9)';
        });
        
        container.appendChild(div);
    });
    
    console.log('Leyenda creada con rangos:', rangos);
}

// Funciones auxiliares para la leyenda mejorada
function obtenerColorPorIndice(indice) {
    const colores = [
        '#d4eddad7', // Muy Bajo - verde claro
        '#a8d5e8',   // Bajo - azul cielo pastel (NUEVO)
        '#ffeaa7',   // Medio - amarillo
        '#fab1a0',   // Alto - naranja claro
        '#e17055'    // Muy Alto - naranja oscuro
    ];
    return colores[indice] || '#cccccc';
}

function obtenerNivelPorIndice(indice) {
    const niveles = ['Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto'];
    return niveles[indice] || 'Sin clasificar';
}

// 6. Función cerrarAsideAmpliado (del código original)
function cerrarAsideAmpliado() {
    const aside = document.getElementById("asideMap");
    
    if (mapaGoogleDemarcacion) {
        mapaGoogleDemarcacion.data.forEach(function(feature) {
            mapaGoogleDemarcacion.data.remove(feature);
        });
        
        google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'click');
        google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseover');
        google.maps.event.clearListeners(mapaGoogleDemarcacion.data, 'mouseout');
        
        mapaGoogleDemarcacion = null;
    }
    
    if (window.infoWindowDemarcacion) {
        window.infoWindowDemarcacion.close();
    }
    
    if (graficaLineasDemarcacion) {
        graficaLineasDemarcacion.destroy();
        graficaLineasDemarcacion = null;
    }
    
    aside.classList.remove("ampliado");
    aside.style.display = "none";
    
    datosActualesDemarcacion = null;
    campoActualDemarcacion = null;
    
    console.log('Aside con Google Maps cerrado correctamente');
}

function mostrarErrorMapa(mensaje) {
    const mapContainer = document.getElementById('mapaGoogleDemarcacion');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="
                display: flex; 
                flex-direction: column;
                justify-content: center; 
                align-items: center; 
                height: 100%; 
                background: #f8f9fa; 
                color: #dc3545;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                border: 2px dashed #dc3545;
                border-radius: 8px;
            ">
                <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                <h4 style="margin: 0 0 10px 0;">Error en el mapa</h4>
                <p style="margin: 0 0 15px 0; max-width: 300px;">${mensaje}</p>
                <button onclick="location.reload()" style="
                    background: #320547; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 4px; 
                    cursor: pointer;
                ">Recargar página</button>
            </div>
        `;
    }
}


/*********************************************************************************
 *   * FUNCIÓN PARA CREAR CONTROLES DE MAPAS *
**********************************************************************************/

function crearControlesMapas() {

    // Verificar si ya existen los controles
    if (document.getElementById('controles-mapas')) {
        return;
    }

    // Crear contenedor principal de controles
    const contenedorControles = document.createElement('div');
    contenedorControles.id = 'controles-mapas';
    contenedorControles.style.cssText = `
        position: absolute;
        top: 10px;
        left: 320px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1500;
    `;

    // Crear botón para mapa de calor
    const botonCalor = document.createElement('button');
    botonCalor.id = 'btn-mapa-calor';
    botonCalor.innerHTML = `
        <i class="fas fa-fire"></i>
        <span>Mapa de Calor</span>
    `;
    botonCalor.onclick = () => toggleMapaCalor();
    
    // Crear botón para mapa temático
    const botonTematico = document.createElement('button');
    botonTematico.id = 'btn-mapa-tematico';
    botonTematico.innerHTML = `
        <i class="fas fa-map"></i>
        <span>Mapa Temático</span>
    `;
    botonTematico.onclick = () => toggleMapaTematico();

    // Crear botón para limpiar todo
    const botonLimpiar = document.createElement('button');
    botonLimpiar.id = 'btn-limpiar-mapas';
    botonLimpiar.innerHTML = `
        <i class="fas fa-eraser"></i>
        <span>Limpiar Todo</span>
    `;
    botonLimpiar.onclick = () => limpiarTodosLosMapas();

    // Aplicar estilos a los botones
    [botonCalor, botonTematico, botonLimpiar].forEach(boton => {
        boton.style.cssText = `
            background: white;
            border: 2px solid #320547;
            border-radius: 8px;
            padding: 10px 15px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-size: 12px;
            font-weight: bold;
            color: #320547;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            min-width: 150px;
            justify-content: flex-start;
        `;
    });

    // Estilos específicos para el botón de limpiar
    botonLimpiar.style.borderColor = '#dc3545';
    botonLimpiar.style.color = '#dc3545';

    // Agregar botones al contenedor
    contenedorControles.appendChild(botonCalor);
    contenedorControles.appendChild(botonTematico);
    contenedorControles.appendChild(botonLimpiar);

    // Agregar al mapa
    document.getElementById('map').appendChild(contenedorControles);

    // Actualizar estados iniciales
    actualizarEstadoBotones();
}

/*********************************************************************************
 *   * FUNCIONES DE CONTROL DE MAPAS *
**********************************************************************************/

function toggleMapaCalor() {

    if (!datosActualesCalor || !campoActual) {
        alert('Primero selecciona un tipo de mapa de calor desde el menú');
        return;
    }

    if (estadoMapaCalor) {
        // Apagar mapa de calor
        if (heatmap) {
            heatmap.setMap(null);
        }
        estadoMapaCalor = false;
    } else {
        // Encender mapa de calor (apagar temático si está activo)
        if (estadoMapaTematico) {
            limpiarMensajeInstructivo();
            limpiarPoligonosTematicos();
            estadoMapaTematico = false;
        }
        
        mapaCalor(datosActualesCalor);
        estadoMapaCalor = true;
    }

    actualizarEstadoBotones();
}

function toggleMapaTematico() {
    if (!campoActual) {
        alert('Primero selecciona un tipo de mapa desde el menú');
        return;
    }

    if (estadoMapaTematico) {
        // Apagar mapa temático
        limpiarPoligonosTematicos();
        estadoMapaTematico = false;
    } else {
        // Encender mapa temático (apagar calor si está activo)
        if (estadoMapaCalor) {
            if (heatmap) {
                heatmap.setMap(null);
            }
            limpiarLeyendaMapaCalor();
            estadoMapaCalor = false;
        }
        
        mapaTematicoPoligonos(campoActual);
        estadoMapaTematico = true;
    }

    actualizarEstadoBotones();
}

function limpiarTodosLosMapas() {
    // Limpiar mapa de calor
    if (heatmap) {
        heatmap.setMap(null);
    }

    //Limpiar DistribucionTerritorial
    if (distribucionTerritorial) {
        distribucionTerritorial.limpiarTodo();
    }
    
    // Limpiar mapa temático
    limpiarPoligonosTematicos();

    limpiarLeyendaMapaCalor();
    limpiarMensajeInstructivo();
    
    // Resetear estados
    estadoMapaCalor = false;
    estadoMapaTematico = false;

    // Limpiar paletas de colores actuales
    // resetearPaletaMapa();
    
    // Actualizar botones
    actualizarEstadoBotones();
}

/*********************************************************************************
 *   * FUNCIÓN PARA ACTUALIZAR ESTADOS VISUALES DE BOTONES *
**********************************************************************************/

function actualizarEstadoBotones() {

    const botonCalor = document.getElementById('btn-mapa-calor');
    const botonTematico = document.getElementById('btn-mapa-tematico');
    
    if (!botonCalor || !botonTematico) return;

    // Actualizar botón de mapa de calor
    if (estadoMapaCalor) {
        botonCalor.style.background = '#320547';
        botonCalor.style.color = 'white';
        botonCalor.querySelector('span').textContent = 'Ocultar Calor';
    } else {
        botonCalor.style.background = 'white';
        botonCalor.style.color = '#320547';
        botonCalor.querySelector('span').textContent = 'Mapa de Calor';
    }

    // Actualizar botón de mapa temático
    if (estadoMapaTematico) {
        botonTematico.style.background = '#320547';
        botonTematico.style.color = 'white';
        botonTematico.querySelector('span').textContent = 'Ocultar Temático';
    } else {
        botonTematico.style.background = 'white';
        botonTematico.style.color = '#320547';
        botonTematico.querySelector('span').textContent = 'Mapa Temático';
    }

    // Actualizar disponibilidad de botones
    const hayDatos = datosActualesCalor && campoActual;
    botonCalor.style.opacity = hayDatos ? '1' : '0.5';
    botonTematico.style.opacity = hayDatos ? '1' : '0.5';
    botonCalor.style.pointerEvents = hayDatos ? 'auto' : 'none';
    botonTematico.style.pointerEvents = hayDatos ? 'auto' : 'none';
}

// /*********************************************************************************
//  *   * FUNCIÓN PARA MAPA TEMÁTICO DE POLÍGONOS POR TEMA POBLACIÓN *
// **********************************************************************************/
async function mapaTematicoPoligonos(campo) {
    try {
        // Limpiar polígonos anteriores si existen
        limpiarPoligonosTematicos();

        const cve_UT = clave;
        
        // Obtener los polígonos de manzanas filtrados por UT con el campo 
        const response = await fetchFromApi(`filter/poligonos_manzanas?ut_cve_ut=${cve_UT}&${campo}`, {});
        let datosPoligonos = response.features;

        if (!datosPoligonos || datosPoligonos.length === 0) {
            console.warn('No se encontraron polígonos para la UT:', cve_UT, 'y campo:', campo);
            return;
        }

        // Extraer valores para clasificación del campo 
        const valores = datosPoligonos
            .map(item => item.properties[campo]) 
            .filter(val => val !== null && val !== undefined && !isNaN(val))
            .sort((a, b) => a - b);

        if (valores.length === 0) {
            console.warn(`No se encontraron valores válidos para el campo: ${campo}`);
            return;
        }

        // Calcular quintiles para clasificación
        const quintiles = calcularQuintiles(valores);
        
        // Calcular áreas, clasificar y asignar z-index en una pasada
        const poligonosConAreaYZIndex = calcularAreaYAsignarZIndex(datosPoligonos, campo, quintiles);

        //Agrar indice para tooltip y eventos
        poligonosConAreaYZIndex.forEach((f, i) => {
            if (!f.properties) f.properties = {};
            f.properties.chart_index = i;
        });

        // Crear GeoJSON FeatureCollection con todos los polígonos ya ordenados
        const featureCollection = {
            type: "FeatureCollection",
            features: poligonosConAreaYZIndex
        };

        // UNA SOLA CARGA - Agregar GeoJSON al mapa
        const features = staticMap.data.addGeoJson(featureCollection);
        poligonosTematicos = features;


        // Aplicar estilos después de cargar
        aplicarEstilosYEventos(campo, quintiles);

        // Funcion Estadistica Descriptiva
        crearEstadisticasDescriptivas(valores, campo);

        // Crear leyenda con el campo correcto
        crearLeyendaTematica(quintiles, campo);

        // Crear gráfica de líneas con los datos ya procesados
        crearGraficaLineas(quintiles, campo, poligonosConAreaYZIndex);  

        mostrarMensajeInstructivo();

        const conteoGrandes = poligonosConAreaYZIndex.filter(p => p.properties.es_grande).length;
        const conteoPequeños = poligonosConAreaYZIndex.length - conteoGrandes;
        
        console.log(`Mapa temático creado en UNA carga: ${conteoGrandes} grandes (z:100-199) + ${conteoPequeños} pequeños (z:200-299+)`);

        // Al final después del console.log:
        const controlesMapas = document.getElementById('controles-mapas');
        if (controlesMapas) {
            controlesMapas.style.display = 'flex';
        }

    } catch (error) {
        console.error('Error al crear mapa temático:', error);
    }
}


// async function mapaTematicoPoligonos(campo) {
//     try {
//         // Limpiar polígonos anteriores si existen
//         limpiarPoligonosTematicos();

//         const cve_UT = clave;
        
//         // Obtener los polígonos de manzanas filtrados por UT con el campo 
//         const response = await fetchFromApi(`filter/poligonos_manzanas?ut_cve_ut=${cve_UT}&${campo}`, {});
//         let datosPoligonos = response.features;

//         if (!datosPoligonos || datosPoligonos.length === 0) {
//             console.warn('No se encontraron polígonos para la UT:', cve_UT, 'y campo:', campo);
//             return;
//         }

//         // Extraer valores para clasificación del campo 
//         const valores = datosPoligonos
//             .map(item => item.properties[campo]) 
//             .filter(val => val !== null && val !== undefined && !isNaN(val))
//             .sort((a, b) => a - b);

//         if (valores.length === 0) {
//             console.warn(`No se encontraron valores válidos para el campo: ${campo}`);
//             return;
//         }

//         // Calcular quintiles para clasificación
//         const quintiles = calcularQuintiles(valores);
        
//         // ✅ CAMBIO: Clasificar polígonos SIN calcular áreas
//         const poligonosClasificados = clasificarPoligonosPorValor(datosPoligonos, campo, quintiles);

//         // Agregar índice para tooltip y eventos
//         poligonosClasificados.forEach((f, i) => {
//             if (!f.properties) f.properties = {};
//             f.properties.chart_index = i;
//         });

//         // Crear GeoJSON FeatureCollection
//         const featureCollection = {
//             type: "FeatureCollection",
//             features: poligonosClasificados
//         };

//         // Agregar GeoJSON al mapa
//         const features = staticMap.data.addGeoJson(featureCollection);
//         poligonosTematicos = features;

//         // Aplicar estilos después de cargar
//         aplicarEstilosYEventos(campo, quintiles);

//         // Función Estadística Descriptiva
//         crearEstadisticasDescriptivas(valores, campo);

//         // Crear leyenda con el campo correcto
//         crearLeyendaTematica(quintiles, campo);

//         // Crear gráfica de líneas con los datos ya procesados
//         crearGraficaLineas(quintiles, campo, poligonosClasificados);  

//         mostrarMensajeInstructivo();

//         console.log(`Mapa temático creado: ${poligonosClasificados.length} polígonos clasificados`);

//         // Mostrar controles de mapas
//         const controlesMapas = document.getElementById('controles-mapas');
//         if (controlesMapas) {
//             controlesMapas.style.display = 'flex';
//         }

//     } catch (error) {
//         console.error('Error al crear mapa temático:', error);
//     }
// }
// function clasificarPoligonosPorValor(poligonos, campo, quintiles) {
//     console.log('Clasificando polígonos por valor del campo:', campo);
    
//     const poligonosClasificados = [];

//     poligonos.forEach(feature => {
//         const valor = feature.properties[campo];
        
//         // Solo procesar polígonos con datos válidos
//         if (valor === null || valor === undefined || isNaN(valor)) {
//             return;
//         }

//         // Clasificar el valor en quintiles
//         const clasificacion = clasificarValor(valor, quintiles);
//         const color = obtenerColorPorClasificacion(clasificacion);
        
//         // Agregar propiedades al feature (SIN área ni z-index)
//         feature.properties.clasificacion = clasificacion;
//         feature.properties.color_fill = color.fill;
//         feature.properties.color_stroke = color.stroke;
//         feature.properties.valor_campo = valor;
//         feature.properties.campo_actual = campo;
        
//         poligonosClasificados.push(feature);
//     });
    
//     console.log(`Clasificación completada: ${poligonosClasificados.length} polígonos`);
    
//     return poligonosClasificados;
// }
// function aplicarEstilosYEventos(campo, quintiles) {
//     // Limpiar eventos previos
//     limpiarTodosLosEventos();
    
//     // Aplicar estilos
//     staticMap.data.setStyle((feature) => {
//         const clasificacion = feature.getProperty('clasificacion');
        
//         // Polígono de UT original (sin clasificación)
//         if (!clasificacion) {
//             return {
//                 fillColor: 'rgba(255, 255, 255, 0)',
//                 fillOpacity: 0,
//                 strokeColor: 'black',
//                 strokeWeight: 5,
//                 clickable: true,
//                 cursor: 'pointer'
//             };
//         }
        
//         // Polígonos temáticos (con clasificación)
//         const colorFill = feature.getProperty('color_fill');
//         const colorStroke = feature.getProperty('color_stroke');
        
//         return {
//             fillColor: colorFill || '#cccccc',
//             fillOpacity: 0.7,  // Opacidad uniforme
//             strokeColor: colorStroke || '#999999',
//             strokeOpacity: 0.9,
//             strokeWeight: 1.5,  // Grosor uniforme
//             clickable: true,
//             cursor: 'pointer'
//         };
//     });

//     // Agregar eventos con un pequeño delay
//     setTimeout(() => {
//         agregarEventosGeoJSONMejorados(campo, quintiles);
//         console.log('Eventos agregados para campo:', campo);
//     }, 100);
// }
/*********************************************************************************
 *   * FUNCIÓN PARA CREAR GRAFICAS  *
**********************************************************************************/
/**
 * Función principal - MODIFICADA para funcionar solo cuando se hace click
 * Ya no crea automáticamente la gráfica, solo guarda los datos
 */
function crearGraficaLineas(quintiles, campo, poligonosConAreaYZIndex) {
    try {
        console.log('Preparando datos para gráfica selectiva por cuantil...');
        
        poligonosOriginales = poligonosConAreaYZIndex;
        
        //Preparar datos usando las clasificaciones YA ASIGNADAS
        const datosPreparados = prepararDatosLineasPorCuantil(poligonosConAreaYZIndex, campo, quintiles);
        
        // Agregar evento de click
        agregarEventoClickPoligonos(datosPreparados, campo, quintiles);
        
        console.log('Sistema de gráfica selectiva preparado');
        
    } catch (error) {
        console.error('Error al preparar gráfica selectiva:', error);
    }
}

/**
 * Agregar evento de click a los polígonos para mostrar gráfica selectiva
 */
function agregarEventoClickPoligonos(datosPorCuantil, campo, quintiles) {
    // Guardar los datos ya preparados para reutilizar
    window.datosGraficaPorCuantil = datosPorCuantil;
    
    staticMap.data.addListener('click', function(event) {
        const feature = event.feature;
        const clasificacion = feature.getProperty('clasificacion');
        
        if (clasificacion) {
            if (window.cuantilSeleccionado === clasificacion) {
                cerrarGraficaLineas();
                restaurarTodosLosPoligonos();
                window.cuantilSeleccionado = null;
            } else {
                mostrarGraficaPorCuantil(clasificacion, window.datosGraficaPorCuantil, campo, quintiles);
                oscurecerPoligonosExceptoCuantil(clasificacion);
                window.cuantilSeleccionado = clasificacion;
            }
        }
    });
}
/**
 * REAJUSTAR CONTRASTE COLORES CLAROS
 */
function mejorarContrasteColor(color) {
    // Convertir hex a RGB para evaluar luminosidad
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminosidad
    const luminosidad = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si es muy claro (luminosidad > 0.7), oscurecerlo
    if (luminosidad > 0.7) {
        return `rgb(${Math.max(r - 60, 0)}, ${Math.max(g - 60, 0)}, ${Math.max(b - 60, 0)})`;
    }
    
    return color;
}

/**
 * Mostrar gráfica solo para un cuantil específico
 */
function mostrarGraficaPorCuantil(cuantil, datosPorCuantil, campo, quintiles) {
    // Cerrar gráfica anterior si existe
    if (chartLineasTematico) {
        chartLineasTematico.destroy();
        chartLineasTematico = null;
    }
    
    // Crear contenedor
    crearContenedorGraficaLineas();
    
    // Crear dataset solo para el cuantil seleccionado
    const datosDelCuantil = datosPorCuantil[cuantil] || [];
    const nombreCuantil = obtenerNombreClasificacion(cuantil);
    const coloresCuantiles = obtenerColoresCuantiles();
    const colorCuantil = coloresCuantiles[cuantil];
    
    const datasets = [{
        label: `${nombreCuantil} (${datosDelCuantil.length} poligonos)`,
        data: datosDelCuantil,
        borderColor: mejorarContrasteColor(colorCuantil),
        pointBackgroundColor: mejorarContrasteColor(colorCuantil),  
        borderWidth: 4, // Aumentar de 3 a 4
        fill: false,
        tension: 0.3,
        pointBackgroundColor: colorCuantil,
        pointBorderColor: '#333333', // Cambiar de '#fff' a gris oscuro
        pointBorderWidth: 3, // Aumentar de 2 a 3
        pointRadius: 7, // Aumentar de 6 a 7
        pointHoverRadius: 11, // Aumentar de 10 a 11
        pointHoverBackgroundColor: colorCuantil,
        pointHoverBorderColor: '#000000', // Negro para mejor contraste
        pointHoverBorderWidth: 4, // Aumentar de 3 a 4
        parsing: {
            xAxisKey: 'x',
            yAxisKey: 'y'
        }
    }];
    
    // Crear gráfica solo con este cuantil
    crearGraficoLineasChartSelectivo(datasets, campo, quintiles, nombreCuantil);
}

/**
 * Crear gráfica selectiva (solo un cuantil)
 */
function crearGraficoLineasChartSelectivo(datasets, campo, quintiles, nombreCuantil) {
    const canvas = document.getElementById('canvas-lineas-tematico');
    const ctx = canvas.getContext('2d');

    chartLineasTematico = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'point'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Poppins',
                            size: 12
                        },
                        color: '#333',
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const dataPoint = context[0].raw;
                            return `Poligono ${dataPoint.manzana}`;
                        },
                        label: function(context) {
                            const dataPoint = context.raw;
                            
                            return [
                                `${nombreCuantil}`,
                                `${obtenerTituloCampo(campo)}: ${dataPoint.valor.toLocaleString()}`,
                                `Porcentaje: ${dataPoint.porcentaje}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: `${obtenerTituloCampo(campo)} - ${nombreCuantil}`,
                        color: '#333',
                        font: {
                            family: 'Poppins',
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Poppins',
                            size: 10
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Poligonos',
                        color: '#333',
                        font: {
                            family: 'Poppins',
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Poppins',
                            size: 10
                        },
                        stepSize: 1
                    }
                }
            },
            onHover: function(event, elements) {
                // Mantener hover desde la gráfica
                if (elements.length > 0 && !puntoResaltadoDesdeMapaActivo) {
                    const element = elements[0];
                    const dataPoint = element.element.$context.raw;
                    resaltarManzanaEnMapa(dataPoint.chartIndex);
                } else if (elements.length === 0 && !puntoResaltadoDesdeMapaActivo) {
                    limpiarResaltadoMapa();
                }
            },
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    const element = elements[0];
                    const dataPoint = element.element.$context.raw;
                    enfocarManzanaEnMapa(dataPoint.chartIndex);
                }
            }
        }
    });
}

/**
 * Oscurecer polígonos excepto los del cuantil seleccionado
 */
function oscurecerPoligonosExceptoCuantil(cuantilSeleccionado) {
    staticMap.data.setStyle((feature) => {
        const clasificacion = feature.getProperty('clasificacion');
        
        // Polígono de la UT original (sin clasificación)
        if (!clasificacion) {
            return {
                fillColor: 'rgba(255, 255, 255, 0)',
                fillOpacity: 0,
                strokeColor: 'black',
                strokeWeight: 5,
                clickable: true
            };
        }
        
        // Obtener propiedades originales
        const colorFill = feature.getProperty('color_fill');
        const colorStroke = feature.getProperty('color_stroke');
        const zIndex = feature.getProperty('z_index') || 1;
        const esGrande = feature.getProperty('es_grande');
        
        // Si pertenece al cuantil seleccionado - MANTENER ESTILO ORIGINAL EXACTO
        if (clasificacion === cuantilSeleccionado) {
            return {
                fillColor: colorFill || '#cccccc',
                fillOpacity: 0.65,  // ← MISMO valor que aplicarEstilosYEventos
                strokeColor: colorStroke || '#999999',
                strokeOpacity: 0.9, // ← MISMO valor que aplicarEstilosYEventos
                strokeWeight: esGrande ? 1 : 2, // ← MISMO valor que aplicarEstilosYEventos
                zIndex: zIndex,     // ← NO aumentar z-index
                clickable: true,
                cursor: 'pointer'
            };
        } else {
            // Oscurecer los demás cuantiles
            return {
                fillColor: '#999999',
                fillOpacity: 0.2,   // Muy transparente
                strokeColor: '#777777',
                strokeOpacity: 0.3,
                strokeWeight: 1,
                zIndex: zIndex - 50, // Bajar z-index para que estén atrás
                clickable: true,
                cursor: 'pointer'
            };
        }
    });
}

/**
 * Restaurar todos los polígonos a su estado original
 */
function restaurarTodosLosPoligonos() {
    staticMap.data.setStyle((feature) => {
        const clasificacion = feature.getProperty('clasificacion');
        
        // Polígono de la UT original
        if (!clasificacion) {
            return {
                fillColor: 'rgba(255, 255, 255, 0)',
                fillOpacity: 0,
                strokeColor: 'black',
                strokeWeight: 5,
                clickable: true
            };
        }
        
        // Restaurar estilo original de polígonos temáticos
        const colorFill = feature.getProperty('color_fill');
        const colorStroke = feature.getProperty('color_stroke');
        const zIndex = feature.getProperty('z_index') || 1;
        const esGrande = feature.getProperty('es_grande');
        
        return {
            fillColor: colorFill || '#cccccc',
            fillOpacity: 0.65,  // ← DEBE SER EXACTAMENTE 0.65
            strokeColor: colorStroke || '#999999',
            strokeOpacity: 0.9, // ← DEBE SER EXACTAMENTE 0.9
            strokeWeight: esGrande ? 1 : 2, // ← DEBE SER IGUAL
            zIndex: zIndex,     // ← Sin modificaciones
            clickable: true,
            cursor: 'pointer'
        };
    });
}
function prepararDatosLineasPorCuantil(poligonosConAreaYZIndex, campo, quintiles) {
    const datosPorCuantil = {
        1: [], 2: [], 3: [], 4: [], 5: []
    };
    
    poligonosConAreaYZIndex.forEach((poligono, index) => {
        const valor = poligono.properties[campo] || 0;
        // USAR LA CLASIFICACIÓN YA GUARDADA, NO RECALCULAR
        const clasificacion = poligono.properties.clasificacion;
        const chartIndex = poligono.properties.chart_index;
        
        const datoPunto = {
            x: valor,
            y: index + 1,
            chartIndex: chartIndex,
            porcentaje: calcularPorcentaje(valor, quintiles),
            manzana: index + 1,
            valor: valor,
            clasificacion: clasificacion
        };
        
        if (clasificacion >= 1 && clasificacion <= 5) {
            datosPorCuantil[clasificacion].push(datoPunto);
        }
    });

    // Ordenar cada cuantil
    Object.keys(datosPorCuantil).forEach(cuantil => {
        datosPorCuantil[cuantil].sort((a, b) => a.x - b.x);
    });

    return datosPorCuantil;
}

/**
 * Calcula el porcentaje que representa un valor del total
 */
function calcularPorcentaje(valor, quintiles) {
    const rango = quintiles.max - quintiles.min;
    if (rango === 0) return 0;
    
    const porcentaje = ((valor - quintiles.min) / rango) * 100;
    return Math.round(porcentaje * 100) / 100; // Redondear a 2 decimales
}

/**
 * Crea el contenedor HTML para la gráfica de líneas
 */
function crearContenedorGraficaLineas() {
    // Remover contenedor existente si existe
    const contenedorExistente = document.getElementById('contenedor-grafica-lineas');
    if (contenedorExistente) {
        contenedorExistente.remove();
    }

    // Crear nuevo contenedor
    const contenedor = document.createElement('div');
    contenedor.id = 'contenedor-grafica-lineas';
    contenedor.style.cssText = `
        position: absolute;
        bottom: 70px;
        right: 10px;
        width: 40vw;
        height: 80vh;
        max-width: 800px;
        max-height: 900px;
        min-width: 400px;
        min-height: 400px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        z-index: 1000;
        font-family: 'Poppins', sans-serif;
    `;

    contenedor.innerHTML = `
        <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
        ">
            <h4 style="
                margin: 0; 
                color: #333; 
                font-size: 14px;
                font-weight: 600;
            ">Distribución por Cuantiles</h4>
            <button onclick="cerrarGraficaLineas()" style="
                background: #ff4757;
                border: none;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            ">×</button>
        </div>
        <div style="position: relative; height: calc(100% - 60px); background-color: #f8f9fa; border-radius: 8px;">
            <canvas id="canvas-lineas-tematico" style="width: 100%; height: 100%;"></canvas>
        </div>
    `;

    document.getElementById('map').appendChild(contenedor);
}

/**
 * Crea la gráfica de líneas con 5 datasets (uno por cuantil)
 * X = Población, Y = Manzanas
 */
function crearGraficoLineasChart(datosPorCuantil, campo, quintiles) {
    const canvas = document.getElementById('canvas-lineas-tematico');
    const ctx = canvas.getContext('2d');

    // Obtener colores de la paleta actual para cada cuantil
    const coloresCuantiles = obtenerColoresCuantiles();
    
    // Crear datasets para cada cuantil
    const datasets = [];
    
    for (let cuantil = 1; cuantil <= 5; cuantil++) {
        const datosCuantil = datosPorCuantil[cuantil] || [];
        const nombreCuantil = obtenerNombreClasificacion(cuantil);
        const colorCuantil = coloresCuantiles[cuantil];
        
        if (datosCuantil.length > 0) {
            datasets.push({
                label: `${nombreCuantil} (${datosCuantil.length})`,
                data: datosCuantil,
                borderColor: colorCuantil,
                backgroundColor: colorCuantil + '40',
                borderWidth: 3,
                fill: false,
                tension: 0.3,
                pointBackgroundColor: colorCuantil,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: colorCuantil,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3,
                parsing: {
                    xAxisKey: 'x',
                    yAxisKey: 'y'
                }
            });
        }
    }

    chartLineasTematico = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            indexAxis: 'y', // ESTO INVIERTE LOS EJES
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'point'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Poppins',
                            size: 10
                        },
                        color: '#333',
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const dataPoint = context[0].raw;
                            return `Poligono ${dataPoint.manzana}`;
                        },
                        label: function(context) {
                            const dataPoint = context.raw;
                            const nombreCuantil = obtenerNombreClasificacion(dataPoint.clasificacion);
                            
                            return [
                                `${nombreCuantil}`,
                                `${obtenerTituloCampo(campo)}: ${dataPoint.valor.toLocaleString()}`,
                                `Porcentaje: ${dataPoint.porcentaje}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: `${obtenerTituloCampo(campo)} por Cuantiles`,
                        color: '#333',
                        font: {
                            family: 'Poppins',
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Poppins',
                            size: 10
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Poligono',
                        color: '#333',
                        font: {
                            family: 'Poppins',
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Poppins',
                            size: 10
                        },
                        stepSize: 1
                    }
                }
            },
            onHover: function(event, elements) {
                // Solo procesar hover desde la gráfica si no hay punto resaltado desde mapa
                if (elements.length > 0 && !puntoResaltadoDesdeMapaActivo) {
                    const element = elements[0];
                    const dataPoint = element.element.$context.raw;
                    resaltarManzanaEnMapa(dataPoint.chartIndex);
                } else if (elements.length === 0 && !puntoResaltadoDesdeMapaActivo) {
                    limpiarResaltadoMapa();
                }
            },
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    const element = elements[0];
                    const dataPoint = element.element.$context.raw;
                    enfocarManzanaEnMapa(dataPoint.chartIndex);
                }
            }
        }
    });
}


/**
 * Obtiene los colores de cada cuantil de la paleta actual
 */
function obtenerColoresCuantiles() {
    if (!paletaActualMapa) {
        // Colores por defecto si no hay paleta
        return {
            1: '#ffffcc',
            2: '#c7e9b4', 
            3: '#7fcdbb',
            4: '#41b6c4',
            5: '#253494'
        };
    }
    
    return {
        1: paletaActualMapa[1].fill,
        2: paletaActualMapa[2].fill,
        3: paletaActualMapa[3].fill,
        4: paletaActualMapa[4].fill,
        5: paletaActualMapa[5].fill
    };
}

/**
 * Obtiene el título legible del campo
 */
function obtenerTituloCampo(campo) {
    const titulos = {

        //Composición Poblacional
        'pobtot': 'Población Total',
        'pobfem': 'Población Femenina',
        'pobmas': 'Población Masculina',
        'p_3ymas': 'Población 3+ años',
        'p_5ymas': 'Población 5+ años',
        'p_12ymas': 'Población 12+ años',
        'p_18ymas': 'Población 18+ años ',
        'pob0_14': 'Población 0 - 14 años', 
        'pob15_64': 'Población 0 - 15 años',
        'pob65_mas': 'Población 65 + más ',

        //Caracteristicas economicas
        'pea': 'Población 12+ Económicamente Activa',
        'pe_inac': 'Población 12+ Económicamente Inactiva',
        'pocupada': 'Población 12+ Ocupada',
        'pdesocup': 'Población 12+ Desocupada',

        //Caracteristicas educativas
        'p15ym_se': 'Población 15+ Sin Escolaridad',
        'p15pri_in': 'Población 15+ Primaria Incompleta',
        'p18ym_pb': 'Población 18+ Educación Posbásica',

        //Hogares censales
        'tothog': 'Total de Hogares Censales',
        'hogjef_f': 'Hogares con Referencia Mujer',
        'hogjef_m': 'Hogares con Referencia Hombre',
        
        //Servicios de salud
        'psinder': 'Población sin Afiliación a Servicios de Salud',
        'pder_ss': 'Población afiliada a Servicios de Salud',

        //Situación Conyugal
        'p12ym_solt': 'Población 12+ Soltera o nunca unida',
        'p12ym_casa': 'Población 12+ Casada o unida',

        //Etnicidad
        'p3ym_hli': 'Población de 3 años y más que habla alguna lengua indígena',
        'pob_afro': 'Población que se considera afromexicana o afrodescendiente',
        'pob_afro_m': 'Población masculina que se considera afromexicana o afrodescendiente',

        //Migracion
        'pnacoe': 'Pobación nacida en otra entidad',
        'presoe15': 'Población 5+ que reside en otra entidad',
        'presoe15_m': 'Población masculina 5+ que reside en otra entidad',

        //Disacapacidad
        'pcon_disc': 'Población con discapacidad',
        'pcdisc_mot': 'Población con discapacidad para caminar, subir o bajar',
        'pcdisc_vis': 'Población con discapacidad para ver, aun usando lentes',
        'pcdisc_len': 'Población con discapacidad para hablar o comunicarse',
        'pcdisc_aud': 'Población con discapacidad para oír, aun usando aparato auditivo',
        'pcdisc_m_1': 'Población con discapacidad para vestirse, bañarse o comer',
        'pcdisc_men': 'Población con discapacidad para recordar o concentrarse',
        'pcon_limi': 'Población con limitación',
        'pclim_csb': 'Población con limitación para caminar, subir o bajar',
        'pclim_vis': 'Población con limitación para ver, aun usando lentes',
        'pclim_haco': 'Población con limitación para hablar o comunicarse',
        'pclim_oaud': 'Población con limitación para oír, aun usando aparato auditivo',
        'pclim_mot2': 'Población con limitación para vestirse, bañarse o comer',
        'pclim_re_c': 'Población con limitación para recordar o concentrarse',
        'pclim_pmen': 'Población con algún problema o condición mental',
        'psind_lim': 'Población sin discapacidad, limitación, problema o condición mental',

        //Vivienda
        'tvivparhab': 'Total de viviendas particulares habitadas',
        'ocupvivpar': 'Ocupantes en viviendas particulares habitadas',
        'vph_pisoti': 'Viviendas particulares habitadas con piso de tierra',
        'vph_c_elec': 'Viviendas particulares habitadas que disponen de energía eléctrica',
        'vph_aguadv': 'Viviendas particulares habitadas que disponen de agua entubada en el ámbito de la vivienda',
        'vph_tinaco': 'Viviendas particulares habitadas que disponen de tinaco',
        'vph_cister': 'Viviendas particulares habitadas que disponen de cisterna o aljibe',
        'vph_excsa': 'Viviendas particulares habitadas que disponen de excusado o sanitario',
        'vph_drenaj': 'Viviendas particulares habitadas que disponen de drenaje',
        'vph_refri': 'Viviendas particulares habitadas que disponen de refrigerador',
        'vph_lavad': 'Viviendas particulares habitadas que disponen de lavadora',
        'vph_autom': 'Viviendas particulares habitadas que disponen de automóvil o camioneta',
        'vph_moto': 'Viviendas particulares habitadas que disponen de motocicleta o motoneta',
        'vph_bici': 'Viviendas particulares habitadas que disponen de bicicleta como medio de transporte',
        'vph_pc': 'Viviendas particulares habitadas que disponen de computadora, laptop o tablet',
        'vph_telef': 'Viviendas particulares habitadas que disponen de línea telefónica fija',
        'vph_cel': 'Viviendas particulares habitadas que disponen de teléfono celular',
        'vph_inter': 'Viviendas particulares habitadas que disponen de Internet',
        'vph_stvp': 'Viviendas particulares habitadas que disponen de servicio de televisión de paga'
    };
    
    return titulos[campo] || campo;
}

/**
 * Función para resaltar una manzana en el mapa cuando se pasa el mouse sobre la gráfica
 */
function resaltarManzanaEnMapa(chartIndex) {
    if (indiceActualResaltado === chartIndex) return;
    
    // Limpiar resaltado anterior
    limpiarResaltadoMapa();
    
    // Buscar la feature correspondiente al índice
    let featureEncontrada = null;
    
    staticMap.data.forEach(function(feature) {
        const featureChartIndex = feature.getProperty('chart_index');
        if (featureChartIndex === chartIndex) {
            featureEncontrada = feature;
        }
    });
    
    if (featureEncontrada) {
        // Aplicar estilo de resaltado
        staticMap.data.overrideStyle(featureEncontrada, {
            fillOpacity: 0.9,
            strokeWeight: 4,
            strokeColor: '#ff4757',
            strokeOpacity: 1.0,
            zIndex: 9999
        });
        
        indiceActualResaltado = chartIndex;
    }
}

/**
 * Función para limpiar el resaltado del mapa
 */
function limpiarResaltadoMapa() {
    if (indiceActualResaltado !== null) {
        staticMap.data.forEach(function(feature) {
            const featureChartIndex = feature.getProperty('chart_index');
            if (featureChartIndex === indiceActualResaltado) {
                // Restaurar estilo original
                staticMap.data.revertStyle(feature);
            }
        });
        indiceActualResaltado = null;
    }
}

/**
 * Función para enfocar una manzana específica en el mapa
 */
function enfocarManzanaEnMapa(chartIndex) {
    let featureEncontrada = null;
    
    staticMap.data.forEach(function(feature) {
        const featureChartIndex = feature.getProperty('chart_index');
        if (featureChartIndex === chartIndex) {
            featureEncontrada = feature;
        }
    });
    
    if (featureEncontrada) {
        // Obtener bounds de la feature
        const bounds = new google.maps.LatLngBounds();
        
        // Si es un polígono, usar las coordenadas
        featureEncontrada.getGeometry().forEachLatLng(function(latLng) {
            bounds.extend(latLng);
        });
        
        // Hacer zoom al área
        staticMap.fitBounds(bounds);
        
        // Mostrar tooltip
        const valor = featureEncontrada.getProperty('valor_campo');
        const clasificacion = featureEncontrada.getProperty('clasificacion');
        const center = bounds.getCenter();
        
        mostrarTooltipSigueMouse(center, valor, clasificacion, campoActual, chartIndex);
    }
}

/**
 * Función actualizada para zoom desde el mapa hacia la gráfica
 * Esta función es llamada desde mostrarTooltipSigueMouse
 * SOLO colorea el div, NO interfiere con selecciones de la gráfica
 */
function zoomManzanaEnGrafica(chartIndex) {
    if (!chartLineasTematico || chartIndex === undefined || chartIndex === null) {
        return;
    }
    
    // Activar flag para evitar conflictos con hover de la gráfica
    puntoResaltadoDesdeMapaActivo = true;
    
    // SOLO mostrar el indicador del punto, SIN colorear el contenedor
    const contenedor = document.getElementById('contenedor-grafica-lineas');
    if (contenedor) {
        // Encontrar el punto correspondiente y crear indicador visual
        encontrarYMarcarPuntoEnGrafica(chartIndex);
        
        // Limpiar después de 2 segundos
        setTimeout(() => {
            limpiarMarcadorPunto();
            puntoResaltadoDesdeMapaActivo = false;
        }, 2000);
    }
}

/**
 * Encuentra y marca visualmente un punto específico en la gráfica
 */
function encontrarYMarcarPuntoEnGrafica(chartIndex) {
    const canvas = document.getElementById('canvas-lineas-tematico');
    if (!canvas || !chartLineasTematico) return;
    
    // Buscar el punto en los datos
    let puntoEncontrado = null;
    let datasetIndex = -1;
    let pointIndex = -1;
    
    chartLineasTematico.data.datasets.forEach((dataset, dsIndex) => {
        dataset.data.forEach((punto, pIndex) => {
            if (punto.chartIndex === chartIndex) {
                puntoEncontrado = punto;
                datasetIndex = dsIndex;
                pointIndex = pIndex;
            }
        });
    });
    
    if (puntoEncontrado && datasetIndex >= 0 && pointIndex >= 0) {
        // Obtener posición del punto en el canvas
        const meta = chartLineasTematico.getDatasetMeta(datasetIndex);
        const pointElement = meta.data[pointIndex];
        
        if (pointElement) {
            // Crear indicador visual temporal
            crearIndicadorPuntoTemporal(pointElement.x, pointElement.y, canvas);
        }
    }
}

/**
 * Crea un indicador visual temporal sobre un punto específico
 */
function crearIndicadorPuntoTemporal(x, y, canvas) {
    // Crear div indicador
    const indicador = document.createElement('div');
    indicador.id = 'indicador-punto-temporal';
    indicador.style.cssText = `
        position: absolute;
        left: ${x - 8}px;
        top: ${y - 8}px;
        width: 16px;
        height: 16px;
        background: #ff4757;
        border: 3px solid #fff;
        border-radius: 50%;
        z-index: 1001;
        animation: pulso 1s infinite;
        pointer-events: none;
    `;
    
    // Agregar animación CSS
    if (!document.getElementById('animacion-pulso-styles')) {
        const styles = document.createElement('style');
        styles.id = 'animacion-pulso-styles';
        styles.textContent = `
            @keyframes pulso {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Posicionar relativo al canvas
    const canvasRect = canvas.getBoundingClientRect();
    const contenedor = canvas.parentElement;
    contenedor.style.position = 'relative';
    contenedor.appendChild(indicador);
}

/**
 * Limpia el marcador de punto temporal
 */
function limpiarMarcadorPunto() {
    const indicador = document.getElementById('indicador-punto-temporal');
    if (indicador) {
        indicador.remove();
    }
}

/**
 * Función para resaltar sector desde tooltip del mapa
 * SOLO efectos visuales, no interfiere con la gráfica
 */
function resaltarSectorGraficaLineas(clasificacion) {
    const contenedor = document.getElementById('contenedor-grafica-lineas');
    if (contenedor) {
        // Sin efectos visuales en el borde - solo el indicador de punto
        // El efecto se maneja completamente por encontrarYMarcarPuntoEnGrafica()
        console.log(`Resaltando cuantil ${clasificacion}`);
    }
}

/**
 * Función para cerrar la gráfica de líneas - ACTUALIZADA
 */
function cerrarGraficaLineas() {
    const contenedor = document.getElementById('contenedor-grafica-lineas');
    if (contenedor) {
        contenedor.remove();
    }
    
    if (chartLineasTematico) {
        chartLineasTematico.destroy();
        chartLineasTematico = null;
    }
    
    // Restaurar polígonos y resetear estado
    restaurarTodosLosPoligonos();
    cuantilSeleccionado = null;
    
    // Limpiar datos globales
    datosGraficaLineas = [];
    indiceActualResaltado = null;
    puntoResaltadoDesdeMapaActivo = false;
    
    console.log('Gráfica de líneas cerrada y polígonos restaurados');
}

/**
 * Función para limpiar gráficas al cambiar de tema
 */
function limpiarGraficasLineas() {
    cerrarGraficaLineas();
}

// FUNCIÓN AUXILIAR: Actualizar la función existente limpiarPoligonosTematicos 
// para incluir limpieza de gráficas
function limpiarPoligonosTematicosConGraficas() {
    // Llamar a la función original de limpieza
    limpiarPoligonosTematicos();
    
    // Limpiar gráfica de líneas
    limpiarGraficasLineas();
}


/**
 * Función para obtener nombre de clasificación (debe existir en tu código)
 */
function obtenerNombreClasificacion(clasificacion) {
    const nombres = {
        1: 'Muy Bajo',
        2: 'Bajo', 
        3: 'Medio',
        4: 'Alto',
        5: 'Muy Alto'
    };
    return nombres[clasificacion] || 'Sin clasificar';
}

/*********************************************************************************
 *   * FUNCIÓN PARA CALCULAR EL ÁREA DE UN POLÍGONO *
**********************************************************************************/
function calcularAreaYAsignarZIndex(poligonos, campo, quintiles) {
    console.log('Calculando áreas y clasificando polígonos...');
    
    // PASO 1: Calcular área para todos los polígonos
    const poligonosConArea = poligonos.map(feature => {
        const area = calcularAreaPoligonoMejorado(feature.geometry);
        return {
            ...feature,
            areaCalculada: area
        };
    });

    // PASO 2: Determinar umbral para separar grandes y pequeños (percentil 70)
    const areasOrdenadas = poligonosConArea.map(p => p.areaCalculada).sort((a, b) => a - b);
    const umbralGrandesPequeños = areasOrdenadas[Math.floor(areasOrdenadas.length * 0.5)];
    
    console.log(`Umbral área: ${umbralGrandesPequeños.toFixed(2)} (percentil 50)`);

    // PASO 3: Clasificar en grandes y pequeños y asignar propiedades
    const poligonosGrandes = [];
    const poligonosPequeños = [];

    poligonosConArea.forEach(item => {
        const valor = item.properties[campo];
        
        // Solo procesar polígonos con datos válidos
        if (valor === null || valor === undefined || isNaN(valor)) {
            return;
        }

        // Clasificar el valor en quintiles
        const clasificacion = clasificarValor(valor, quintiles);
        const color = obtenerColorPorClasificacion(clasificacion);
        
        // Determinar si es grande o pequeño
        const esGrande = item.areaCalculada >= umbralGrandesPequeños;
        
        // Agregar propiedades al feature
        item.properties.clasificacion = clasificacion;
        item.properties.color_fill = color.fill;
        item.properties.color_stroke = color.stroke;
        item.properties.valor_campo = valor;
        item.properties.campo_actual = campo;
        item.properties.area = item.areaCalculada;
        item.properties.es_grande = esGrande;
        
        // Separar en arrays para ordenamiento
        if (esGrande) {
            poligonosGrandes.push(item);
        } else {
            poligonosPequeños.push(item);
        }
    });

    // PASO 4: Ordenar cada grupo por área y asignar z-index
    // Grandes: ordenar de mayor a menor área, z-index 100-199
    poligonosGrandes.sort((a, b) => b.areaCalculada - a.areaCalculada);
    poligonosGrandes.forEach((item, index) => {
        item.properties.z_index = 100 + index;
    });

    // Pequeños: ordenar de menor a mayor área, z-index 200+ (los más pequeños encima)
    poligonosPequeños.sort((a, b) => a.areaCalculada - b.areaCalculada);
    poligonosPequeños.forEach((item, index) => {
        item.properties.z_index = 200 + index;
    });

    // PASO 5: Combinar arrays - grandes primero, pequeños después
    const todosPoligonos = [...poligonosGrandes, ...poligonosPequeños];
    
    console.log(`Clasificación completada: ${poligonosGrandes.length} grandes, ${poligonosPequeños.length} pequeños`);
    
    return todosPoligonos;
}

// function aplicarEstilosYEventos(campo, quintiles) {

//     limpiarTodosLosEventos();
//     // Aplicar estilos a cada feature
//     staticMap.data.setStyle((feature) => {
//         const clasificacion = feature.getProperty('clasificacion');
        
//         // Si NO tiene clasificación, es el polígono de la UT original
//         if (!clasificacion) {
//             return {
//                 fillColor: 'rgba(255, 255, 255, 0)',
//                 fillOpacity: 0,
//                 strokeColor: 'black',
//                 strokeWeight: 5,
//                 clickable: true
//             };
//         }
        
//         // Si SÍ tiene clasificación, es un polígono temático
//         const colorFill = feature.getProperty('color_fill');
//         const colorStroke = feature.getProperty('color_stroke');
//         const zIndex = feature.getProperty('z_index') || 1;
//         const esGrande = feature.getProperty('es_grande');
        
//         return {
//             fillColor: colorFill || '#cccccc',
//             fillOpacity: esGrande ? 0.6 : 0.8,  // ← Restaurar el relleno para polígonos temáticos
//             strokeColor: colorStroke || '#999999',
//             strokeOpacity: 0.9,
//             strokeWeight: esGrande ? 1 : 2,
//             zIndex: zIndex,
//             clickable: true
//         };
//     });

//     // Agregar eventos mejorados
//     // agregarEventosGeoJSONMejorados(campo, quintiles);
//     // Finalmente agregar eventos (con un pequeño delay para asegurar que los estilos estén aplicados)
//     setTimeout(() => {
//         agregarEventosGeoJSONMejorados(campo, quintiles);
//     }, 100);
// }
function aplicarEstilosYEventos(campo, quintiles) {
    // Limpiar eventos previos
    limpiarTodosLosEventos();
    
    // Aplicar estilos
    staticMap.data.setStyle((feature) => {
        const clasificacion = feature.getProperty('clasificacion');
        
        if (!clasificacion) {
            return {
                fillColor: 'rgba(255, 255, 255, 0)',
                fillOpacity: 0,
                strokeColor: 'black',
                strokeWeight: 5,
                clickable: true,
                cursor: 'pointer'
            };
        }
        
        const colorFill = feature.getProperty('color_fill');
        const colorStroke = feature.getProperty('color_stroke');
        const zIndex = feature.getProperty('z_index') || 1;
        const esGrande = feature.getProperty('es_grande');
        
        return {
            fillColor: colorFill || '#cccccc',
            fillOpacity: 0.65,  // ← Opacidad uniforme para todos
            strokeColor: colorStroke || '#999999',
            strokeOpacity: 0.9,
            strokeWeight: esGrande ? 1 : 2,
            zIndex: zIndex,
            clickable: true,
            cursor: 'pointer'
        };
    });

    // Agregar eventos con un pequeño delay
    setTimeout(() => {
        agregarEventosGeoJSONMejorados(campo, quintiles);
        console.log('Eventos agregados para campo:', campo);
    }, 100);
}
function calcularAreaPoligonoMejorado(geometry) {
    if (!geometry || !geometry.coordinates) {
        return 0;
    }

    try {
        // Método 1: Google Maps Geometry Library (más preciso)
        if (google.maps.geometry && google.maps.geometry.spherical) {
            if (geometry.type === 'Polygon') {
                return calcularAreaPolygonSimple(geometry);
            } else if (geometry.type === 'MultiPolygon') {
                return calcularAreaMultiPolygon(geometry);
            }
        }
        
        // Método 2: Fallback mejorado con múltiples factores
        return calcularAreaMejoradaConFactores(geometry);
        
    } catch (error) {
        console.warn('Error calculando área, usando método básico:', error);
        return calcularAreaBasica(geometry);
    }
}

function calcularAreaPolygonSimple(geometry) {
    try {
        const coordinates = geometry.coordinates[0]; // Anillo exterior
        if (coordinates.length < 4) return 0; // Polígono inválido
        
        const path = coordinates.map(coord => new google.maps.LatLng(coord[1], coord[0]));
        return google.maps.geometry.spherical.computeArea(path);
    } catch (error) {
        return calcularAreaPorBbox(geometry.coordinates);
    }
}

function calcularAreaMultiPolygon(geometry) {
    try {
        let totalArea = 0;
        geometry.coordinates.forEach(polygon => {
            if (polygon.length > 0 && polygon[0].length >= 4) {
                const coordinates = polygon[0]; // Anillo exterior de cada polígono
                const path = coordinates.map(coord => new google.maps.LatLng(coord[1], coord[0]));
                totalArea += google.maps.geometry.spherical.computeArea(path);
            }
        });
        return totalArea;
    } catch (error) {
        return calcularAreaPorBbox(geometry.coordinates);
    }
}

function calcularAreaMejoradaConFactores(geometry) {
    // Método híbrido: bbox + conteo de vértices + factor de forma
    let totalVertices = 0;
    let totalAnillos = 0;
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    function analizarGeometria(coords, nivel = 0) {
        if (nivel > 5) return; // Prevenir recursión infinita
        
        if (Array.isArray(coords)) {
            if (coords.length === 2 && typeof coords[0] === 'number') {
                // Es una coordenada [lng, lat]
                const [lng, lat] = coords;
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
                totalVertices++;
            } else {
                // Es un array de coordenadas o anillos
                coords.forEach((item, index) => {
                    if (Array.isArray(item)) {
                        // Contar anillos (solo en el nivel correcto)
                        if (nivel === 2 || (nivel === 1 && geometry.type === 'Polygon')) {
                            totalAnillos++;
                        }
                        analizarGeometria(item, nivel + 1);
                    }
                });
            }
        }
    }
    
    analizarGeometria(geometry.coordinates);
    
    // Calcular área del bounding box en metros cuadrados aproximados
    const deltaLat = maxLat - minLat;
    const deltaLng = maxLng - minLng;
    const latMedia = (minLat + maxLat) / 2;
    
    // Factor de corrección por latitud
    const factorLatitud = Math.cos(latMedia * Math.PI / 180);
    
    // Conversión aproximada a metros (111320 metros por grado de latitud)
    const areaBboxMetros = deltaLat * deltaLng * factorLatitud * 111320 * 111320;
    
    // Factores de corrección
    const factorComplejidad = Math.min(totalVertices / 50, 3);
    const factorAnillos = Math.max(totalAnillos, 1);
    const factorForma = Math.min(deltaLat / deltaLng, deltaLng / deltaLat);
    
    return areaBboxMetros * factorComplejidad * Math.sqrt(factorAnillos) * factorForma;
}

function calcularAreaBasica(geometry) {
    // Método más simple para casos de emergencia
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    let puntos = 0;
    
    function procesarCoordenada(coord) {
        if (Array.isArray(coord) && coord.length >= 2) {
            if (typeof coord[0] === 'number') {
                const [lng, lat] = coord;
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
                puntos++;
            } else {
                coord.forEach(procesarCoordenada);
            }
        }
    }
    
    procesarCoordenada(geometry.coordinates);
    
    const deltaLat = maxLat - minLat;
    const deltaLng = maxLng - minLng;
    
    return deltaLat * deltaLng * Math.max(puntos / 10, 1) * 10000000000;
}

function calcularAreaPorBbox(coordinates) {
    // Método de respaldo por bounding box
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    function extraerBbox(coords) {
        if (Array.isArray(coords)) {
            if (coords.length === 2 && typeof coords[0] === 'number') {
                const [lng, lat] = coords;
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
            } else {
                coords.forEach(extraerBbox);
            }
        }
    }
    
    extraerBbox(coordinates);
    
    const deltaLat = maxLat - minLat;
    const deltaLng = maxLng - minLng;
    return deltaLat * deltaLng * 12350000000;
}

/*********************************************************************************
 *   * FUNCIÓN PARA AGREGAR EVENTOS A LOS FEATURES GEOJSON *
**********************************************************************************/
function limpiarTodosLosTooltips() {

    // Limpiar tooltip personalizado
    limpiarTooltipPersonalizado();
    // Lista de tooltips a limpiar
    const tooltips = [
        window.tooltipActivo,
        window.tooltipPoligono,
        window.tooltipPoligonoGeoJSON,
        typeof tooltipActivo !== 'undefined' ? tooltipActivo : null,
        typeof tooltipPoligono !== 'undefined' ? tooltipPoligono : null,
        typeof tooltipPoligonoGeoJSON !== 'undefined' ? tooltipPoligonoGeoJSON : null
    ];

    // Cerrar cada tooltip si existe
    tooltips.forEach(tooltip => {
        if (tooltip && tooltip.close) {
            tooltip.close();
        }
    });

    // Limpiar referencias
    window.tooltipActivo = null;
    window.tooltipPoligono = null;
    window.tooltipPoligonoGeoJSON = null;
    
    if (typeof tooltipActivo !== 'undefined') tooltipActivo = null;
    if (typeof tooltipPoligono !== 'undefined') tooltipPoligono = null;
    if (typeof tooltipPoligonoGeoJSON !== 'undefined') tooltipPoligonoGeoJSON = null;

    // Limpiar tooltip de distribución territorial si existe
    if (typeof distribucionTerritorial !== 'undefined' && 
        distribucionTerritorial && 
        distribucionTerritorial.tooltipCurva) {
        distribucionTerritorial.tooltipCurva.close();
        distribucionTerritorial.tooltipCurva = null;
    }
}
function limpiarTodosLosEventos() {
    // Primero limpiar tooltips
    limpiarTodosLosTooltips();
    
    // Luego limpiar listeners
    if (staticMap && staticMap.data) {
        google.maps.event.clearListeners(staticMap.data, 'mousemove');
        google.maps.event.clearListeners(staticMap.data, 'mouseout');  
        google.maps.event.clearListeners(staticMap.data, 'mouseover');
        google.maps.event.clearListeners(staticMap.data, 'click');
    }
    
    if (staticMap) {
        google.maps.event.clearListeners(staticMap, 'mousemove');
    }
}
function agregarEventosGeoJSONMejorados(campo, quintiles) {
    let featureActual = null;

    // Limpiar eventos previos
    limpiarTodosLosEventos();
    
    // LISTENER DE CLICK PARA MOSTRAR LA GRÁFICA
    staticMap.data.addListener('click', function(event) {
        const feature = event.feature;
        const clasificacion = feature.getProperty('clasificacion');
        
        if (clasificacion) {
            if (!window.datosGraficaPorCuantil) {
                const poligonos = [];
                staticMap.data.forEach(f => {
                    const props = {};
                    f.forEachProperty((value, key) => props[key] = value);
                    if (props.valor_campo !== undefined) {
                        poligonos.push({ properties: props });
                    }
                });
                window.datosGraficaPorCuantil = prepararDatosLineasPorCuantil(poligonos, campo, quintiles);
            }
            
            if (window.cuantilSeleccionado === clasificacion) {
                cerrarGraficaLineas();
                restaurarTodosLosPoligonos();
                window.cuantilSeleccionado = null;
            } else {
                mostrarGraficaPorCuantil(clasificacion, window.datosGraficaPorCuantil, campo, quintiles);
                oscurecerPoligonosExceptoCuantil(clasificacion);
                window.cuantilSeleccionado = clasificacion;
            }
        }
    });
    
    // MOUSEOVER - Detecta entrada al feature
    staticMap.data.addListener('mouseover', function(event) {
        const feature = event.feature;
        const valor = feature.getProperty('valor_campo');
        
        if (valor !== null && valor !== undefined) {
            if (featureActual && featureActual !== feature) {
                staticMap.data.revertStyle(featureActual);
            }
            
            featureActual = feature;
            
            staticMap.data.overrideStyle(feature, {
                strokeWeight: 4,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                fillOpacity: 0.75,  // ← Solo un poco más opaco en hover
                cursor: 'pointer'
            });
            
            const clasificacion = feature.getProperty('clasificacion');
            const chartIndex = feature.getProperty('chart_index');
            
            mostrarTooltipSigueMouse(event.latLng, valor, clasificacion, campo, chartIndex);
        }
    });
    
    // MOUSEMOVE - Actualiza posición continuamente
    staticMap.data.addListener('mousemove', function(event) {
        const feature = event.feature;
        const valor = feature.getProperty('valor_campo');
        
        if (valor !== null && valor !== undefined) {
            // Si cambió de feature
            if (feature !== featureActual) {
                if (featureActual) {
                    staticMap.data.revertStyle(featureActual);
                }
                
                featureActual = feature;
                
                staticMap.data.overrideStyle(feature, {
                    strokeWeight: 4,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    fillOpacity: 0.9,
                    cursor: 'pointer'
                });
                
                const clasificacion = feature.getProperty('clasificacion');
                const chartIndex = feature.getProperty('chart_index');
                
                mostrarTooltipSigueMouse(event.latLng, valor, clasificacion, campo, chartIndex);
            } else {
                // Mismo feature, solo actualizar posición
                if (window.actualizarTooltipPosicion) {
                    window.actualizarTooltipPosicion(event.latLng);
                }
            }
        }
    });
    
    // MOUSEOUT - Limpia cuando sale
    staticMap.data.addListener('mouseout', function(event) {
        const feature = event.feature;
        
        if (feature) {
            staticMap.data.revertStyle(feature);
        }
        
        limpiarTooltipPersonalizado();
        featureActual = null;
    });
    
    // Limpia cuando el mouse sale del mapa completamente
    staticMap.addListener('mouseout', function() {
        if (featureActual) {
            staticMap.data.revertStyle(featureActual);
            featureActual = null;
        }
        limpiarTooltipPersonalizado();
    });
}
// function agregarEventosGeoJSONMejorados(campo, quintiles) {
//     let featureActual = null;
//     let timeoutLimpieza = null;

//     // Limpiar eventos previos
//     limpiarTodosLosEventos();
    
//     // LISTENER DE CLICK CORREGIDO PARA MOSTRAR LA GRÁFICA
//     staticMap.data.addListener('click', function(event) {
//         const feature = event.feature;
//         const chartIndex = feature.getProperty('chart_index');
//         const clasificacion = feature.getProperty('clasificacion');
//         const valor = feature.getProperty('valor_campo');
        
//         console.log('Click en polígono:', {
//             índice: chartIndex,
//             clasificación: clasificacion,
//             valor: valor
//         });
        
//         // MOSTRAR LA GRÁFICA DEL CUANTIL SELECCIONADO
//         if (clasificacion >= 1 && clasificacion <= 5) {
//             // Preparar datos si no están listos
//             if (!window.datosGraficaPorCuantil) {
//                 // Obtener los datos de los polígonos
//                 const poligonos = [];
//                 staticMap.data.forEach(function(f) {
//                     const props = {};
//                     f.forEachProperty(function(value, key) {
//                         props[key] = value;
//                     });
//                     if (props.valor_campo !== undefined) {
//                         poligonos.push({ properties: props });
//                     }
//                 });
                
//                 // Preparar datos por cuantil
//                 window.datosGraficaPorCuantil = prepararDatosLineasPorCuantil(
//                     poligonos, 
//                     campo, 
//                     quintiles
//                 );
//             }
            
//             // LLAMAR A LA FUNCIÓN QUE MUESTRA LA GRÁFICA
//             if (typeof mostrarGraficaPorCuantil === 'function') {
//                 mostrarGraficaPorCuantil(
//                     clasificacion, 
//                     window.datosGraficaPorCuantil, 
//                     campo, 
//                     quintiles
//                 );
//             }
            
//             // Hacer zoom al punto específico después de mostrar la gráfica
//             setTimeout(() => {
//                 if (typeof zoomManzanaEnGrafica === 'function') {
//                     zoomManzanaEnGrafica(chartIndex);
//                 }
//             }, 300);
//         }
//     });
    
//     // LISTENER MOUSEMOVE (tu código existente)
//     staticMap.data.addListener('mousemove', function(event) {
//         if (timeoutLimpieza) clearTimeout(timeoutLimpieza);
        
//         let featureDetectado = null;
//         let mejorZIndex = -1;
        
//         staticMap.data.forEach(function(feature) {
//             const valor = feature.getProperty('valor_campo');
//             if (valor === null || valor === undefined) return;
            
//             if (esPuntoEnFeature(event.latLng, feature)) {
//                 const zIndex = feature.getProperty('z_index') || 1;
//                 if (zIndex > mejorZIndex) {
//                     mejorZIndex = zIndex;
//                     featureDetectado = feature;
//                 }
//             }
//         });
        
//         if (featureDetectado && featureDetectado !== featureActual) {
//             if (featureActual) {
//                 staticMap.data.revertStyle(featureActual);
//             }
            
//             featureActual = featureDetectado;
            
//             staticMap.data.overrideStyle(featureActual, {
//                 strokeWeight: 4,
//                 strokeColor: '#FF0000',
//                 strokeOpacity: 1.0,
//                 fillOpacity: 0.9,
//                 zIndex: 99999,
//                 cursor: 'pointer'
//             });
            
//             const valor = featureActual.getProperty('valor_campo');
//             const clasificacion = featureActual.getProperty('clasificacion');
//             const chartIndex = featureActual.getProperty('chart_index');
            
//             mostrarTooltipSigueMouse(event.latLng, valor, clasificacion, campo, chartIndex);
            
//         } else if (featureDetectado && window.actualizarTooltipPosicion) {
//             window.actualizarTooltipPosicion(event.latLng);
//         } else if (!featureDetectado) {
//             timeoutLimpieza = setTimeout(() => {
//                 if (featureActual) {
//                     staticMap.data.revertStyle(featureActual);
//                     featureActual = null;
//                 }
//                 limpiarTooltipPersonalizado();
//             }, 200);
//         }
//     });
    
//     // Listener para cuando el mouse sale del mapa
//     staticMap.addListener('mouseout', function() {
//         limpiarTooltipPersonalizado();
//     });
// }
// function agregarEventosGeoJSONMejorados(campo, quintiles) {
//     let featureActual = null;
//     let timeoutLimpieza = null;

//     // Limpiar eventos previos
//     limpiarTodosLosEventos();
    
//     // LISTENER DE CLICK CORREGIDO PARA MOSTRAR LA GRÁFICA
//     staticMap.data.addListener('click', function(event) {
//         const feature = event.feature;
//         const clasificacion = feature.getProperty('clasificacion');
        
//         // Solo procesar clicks en polígonos con clasificación
//         if (clasificacion) {
//             // Preparar datos si no existen
//             if (!window.datosGraficaPorCuantil) {
//                 const poligonos = [];
//                 staticMap.data.forEach(f => {
//                     const props = {};
//                     f.forEachProperty((value, key) => props[key] = value);
//                     if (props.valor_campo !== undefined) {
//                         poligonos.push({ properties: props });
//                     }
//                 });
//                 window.datosGraficaPorCuantil = prepararDatosLineasPorCuantil(poligonos, campo, quintiles);
//             }
            
//             // Si es el mismo cuantil, cerrar
//             if (window.cuantilSeleccionado === clasificacion) {
//                 cerrarGraficaLineas();
//                 restaurarTodosLosPoligonos();
//                 window.cuantilSeleccionado = null;
//             } else {
//                 // LLAMAR LAS FUNCIONES ORIGINALES
//                 mostrarGraficaPorCuantil(clasificacion, window.datosGraficaPorCuantil, campo, quintiles);
//                 oscurecerPoligonosExceptoCuantil(clasificacion);
//                 window.cuantilSeleccionado = clasificacion;
//             }
//         }
//     });
    
//     // LISTENER MOUSEMOVE (tu código existente)
//     staticMap.data.addListener('mousemove', function(event) {
//         if (timeoutLimpieza) clearTimeout(timeoutLimpieza);
        
//         let featureDetectado = null;
//         let mejorZIndex = -1;
        
//         staticMap.data.forEach(function(feature) {
//             const valor = feature.getProperty('valor_campo');
//             if (valor === null || valor === undefined) return;
            
//             if (esPuntoEnFeature(event.latLng, feature)) {
//                 const zIndex = feature.getProperty('z_index') || 1;
//                 if (zIndex > mejorZIndex) {
//                     mejorZIndex = zIndex;
//                     featureDetectado = feature;
//                 }
//             }
//         });
        
//         if (featureDetectado && featureDetectado !== featureActual) {
//             if (featureActual) {
//                 staticMap.data.revertStyle(featureActual);
//             }
            
//             featureActual = featureDetectado;
            
//             staticMap.data.overrideStyle(featureActual, {
//                 strokeWeight: 4,
//                 strokeColor: '#FF0000',
//                 strokeOpacity: 1.0,
//                 fillOpacity: 0.9,
//                 zIndex: 99999,
//                 cursor: 'pointer'
//             });
            
//             const valor = featureActual.getProperty('valor_campo');
//             const clasificacion = featureActual.getProperty('clasificacion');
//             const chartIndex = featureActual.getProperty('chart_index');
            
//             mostrarTooltipSigueMouse(event.latLng, valor, clasificacion, campo, chartIndex);
            
//         } else if (featureDetectado && window.actualizarTooltipPosicion) {
//             window.actualizarTooltipPosicion(event.latLng);
//         } else if (!featureDetectado) {
//             timeoutLimpieza = setTimeout(() => {
//                 if (featureActual) {
//                     staticMap.data.revertStyle(featureActual);
//                     featureActual = null;
//                 }
//                 limpiarTooltipPersonalizado();
//             }, 200);
//         }
//     });
    
//     // Listener para cuando el mouse sale del mapa
//     staticMap.addListener('mouseout', function() {
//         limpiarTooltipPersonalizado();
//     });
// }
function esPuntoEnFeature(punto, feature) {
    try {
        const bounds = new google.maps.LatLngBounds();
        feature.getGeometry().forEachLatLng(function(latlng) {
            bounds.extend(latlng);
        });
        
        const center = bounds.getCenter();
        const distance = google.maps.geometry.spherical.computeDistanceBetween(punto, center);
        const boundsDiagonal = google.maps.geometry.spherical.computeDistanceBetween(
            bounds.getSouthWest(), 
            bounds.getNorthEast()
        );
        
        // Detección más sensible
        return distance < (boundsDiagonal / 2);
        
    } catch (error) {
        console.error('Error detectando feature:', error);
        return false;
    }
}

// Función para mostrar tooltip - DEBE ESTAR FUERA
// function mostrarTooltipSigueMouse(posicion, valor, clasificacion, campo, chartIndex) {
//     // Limpiar tooltip anterior si existe
//     if (window.tooltipDiv) {
//         window.tooltipDiv.remove();
//         window.tooltipDiv = null;
//     }
    
//     // Validar datos
//     if (valor === null || valor === undefined) return;
    
//     // Asegurar paleta de colores
//     if (!paletaActualMapa) {
//         seleccionarNuevaPaletaMapa();
//     }
    
//     // Obtener colores de la clasificación
//     const colores = obtenerColorPorClasificacion(clasificacion);
    
//     // Títulos completos (mantener los que ya tienes)
//     const titulos = {
//         // Composición Poblacional
//         'pobtot': 'Población Total',
//         'pobfem': 'Población Femenina',
//         'pobmas': 'Población Masculina',
//         'p_3ymas': 'Población 3+ años',
//         'p_5ymas': 'Población 5+ años',
//         'p_12ymas': 'Población 12+ años',
//         'p_18ymas': 'Población 18+ años',
//         'pob0_14': 'Población 0 - 14 años',
//         'pob15_64': 'Población 15 - 64 años',
//         'pob65_mas': 'Población 65+ años',
        
//         // Características económicas
//         'pea': 'Población 12+ Económicamente Activa',
//         'pe_inac': 'Población 12+ Económicamente Inactiva',
//         'pocupada': 'Población 12+ Ocupada',
//         'pdesocup': 'Población 12+ Desocupada',
        
//         // Características educativas
//         'p15ym_se': 'Población 15+ Sin Escolaridad',
//         'p15pri_in': 'Población 15+ Primaria Incompleta',
//         'p18ym_pb': 'Población 18+ Educación Posbásica',
        
//         // Hogares censales
//         'tothog': 'Total de Hogares Censales',
//         'hogjef_f': 'Hogares con Referencia Mujer',
//         'hogjef_m': 'Hogares con Referencia Hombre',
        
//         // Servicios de salud
//         'psinder': 'Población sin Afiliación a Servicios de Salud',
//         'pder_ss': 'Población afiliada a Servicios de Salud',
        
//         // Situación Conyugal
//         'p12ym_solt': 'Población 12+ Soltera o nunca unida',
//         'p12ym_casa': 'Población 12+ Casada o unida',
        
//         // Etnicidad
//         'p3ym_hli': 'Población 3+ que habla lengua indígena',
//         'pob_afro': 'Población afromexicana o afrodescendiente',
//         'pob_afro_m': 'Población masculina afrodescendiente',
        
//         // Migración
//         'pnacoe': 'Población nacida en otra entidad',
//         'presoe15': 'Población 5+ que reside en otra entidad',
//         'presoe15_m': 'Población masculina 5+ que reside en otra entidad'
//     };
    
//     // Crear div del tooltip
//     const tooltipDiv = document.createElement('div');
//     tooltipDiv.id = 'tooltip-personalizado';
    
//     // Aplicar estilos mejorados
//     tooltipDiv.style.cssText = `
//         position: fixed;
//         background: rgba(255, 255, 255, 0.98);
//         border: 3px solid ${colores.stroke};
//         border-radius: 12px;
//         padding: 10px 14px;
//         box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
//         z-index: 9999999;
//         pointer-events: none;
//         font-family: 'Poppins', sans-serif;
//         font-size: 13px;
//         min-width: 220px;
//         max-width: 320px;
//         backdrop-filter: blur(3px);
//     `;
    
//     // Contenido del tooltip (mantener tu HTML)
//     tooltipDiv.innerHTML = `
//         <div style="
//             display: flex; 
//             align-items: center; 
//             margin-bottom: 10px;
//             padding-bottom: 8px;
//             border-bottom: 2px solid ${colores.stroke};
//         ">
//             <div style="
//                 width: 16px; 
//                 height: 16px; 
//                 background: ${colores.fill};
//                 border: 2px solid ${colores.stroke};
//                 border-radius: 4px;
//                 margin-right: 10px;
//                 box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//             "></div>
//             <strong style="
//                 color: #333; 
//                 font-size: 14px;
//                 font-weight: 600;
//             ">
//                 ${titulos[campo] || campo}
//             </strong>
//         </div>
        
//         <div style="
//             margin-bottom: 6px;
//             display: flex;
//             align-items: center;
//         ">
//             <span style="
//                 font-weight: 500; 
//                 color: #666;
//                 margin-right: 8px;
//             ">Valor:</span>
//             <span style="
//                 font-weight: bold; 
//                 color: #333; 
//                 font-size: 14px;
//             ">${valor.toLocaleString('es-MX')}</span>
//         </div>
        
//         <div style="
//             display: flex;
//             align-items: center;
//         ">
//             <span style="
//                 font-weight: 500; 
//                 color: #666;
//                 margin-right: 8px;
//             ">Nivel:</span>
//             <span style="
//                 font-weight: bold; 
//                 color: ${colores.stroke}; 
//                 font-size: 14px;
//                 text-transform: uppercase;
//                 letter-spacing: 0.5px;
//             ">${obtenerNombreClasificacion(clasificacion)}</span>
//         </div>
//     `;
    
//     // Añadir al body
//     document.body.appendChild(tooltipDiv);
//     window.tooltipDiv = tooltipDiv;
    
//     // NUEVA función mejorada para actualizar posición
//     const actualizarPosicion = function(latLng) {
//         const projection = staticMap.getProjection();
//         if (!projection) return;
        
//         const zoom = staticMap.getZoom();
//         const scale = 1 << zoom;
//         const worldCoordinate = projection.fromLatLngToPoint(latLng);
//         const pixelCoordinate = new google.maps.Point(
//             Math.floor(worldCoordinate.x * scale),
//             Math.floor(worldCoordinate.y * scale)
//         );
        
//         const mapDiv = staticMap.getDiv();
//         const mapRect = mapDiv.getBoundingClientRect();
//         const bounds = staticMap.getBounds();
        
//         if (!bounds) return;
        
//         const ne = bounds.getNorthEast();
//         const sw = bounds.getSouthWest();
        
//         const topRight = projection.fromLatLngToPoint(ne);
//         const bottomLeft = projection.fromLatLngToPoint(sw);
        
//         const scale2 = 1 << zoom;
//         const worldWidth = (topRight.x - bottomLeft.x) * scale2;
//         const worldHeight = (bottomLeft.y - topRight.y) * scale2;
        
//         // Calcular posición relativa en el viewport
//         const relativeX = ((worldCoordinate.x - bottomLeft.x) * scale2) / worldWidth;
//         const relativeY = ((worldCoordinate.y - topRight.y) * scale2) / worldHeight;
        
//         // Posición en píxeles de pantalla
//         let x = mapRect.left + (relativeX * mapRect.width) + 10; // 10px a la derecha del cursor
//         let y = mapRect.top + (relativeY * mapRect.height) - tooltipDiv.offsetHeight - 10; // Arriba del cursor
        
//         // Ajustar si se sale de los límites
//         if (x + tooltipDiv.offsetWidth > window.innerWidth - 10) {
//             x = mapRect.left + (relativeX * mapRect.width) - tooltipDiv.offsetWidth - 10;
//         }
        
//         if (y < 10) {
//             y = mapRect.top + (relativeY * mapRect.height) + 20; // Abajo si no hay espacio arriba
//         }
        
//         tooltipDiv.style.left = x + 'px';
//         tooltipDiv.style.top = y + 'px';
//     };
    
//     // Actualizar posición inicial
//     actualizarPosicion(posicion);
    
//     // Guardar función para actualizaciones
//     window.actualizarTooltipPosicion = actualizarPosicion;
    
//     // Integrar con gráfica si existe
//     if (typeof chartIndex === 'number' && typeof zoomManzanaEnGrafica === 'function') {
//         zoomManzanaEnGrafica(chartIndex);
//     }
// }
function mostrarTooltipSigueMouse(posicion, valor, clasificacion, campo, chartIndex) {
    // 1. LIMPIAR TOOLTIPS ANTERIORES
    if (window.tooltipDiv) {
        window.tooltipDiv.remove();
        window.tooltipDiv = null;
    }
    if (window.tooltipActivo) {
        window.tooltipActivo.close();
        window.tooltipActivo = null;
    }
    
    // Validar datos
    if (valor === null || valor === undefined) return;
    
    // // Asegurar paleta
    // if (!paletaActualMapa) {
    //     seleccionarNuevaPaletaMapa();
    // }
    
    const colores = obtenerColorPorClasificacion(clasificacion);
    const titulos = {

        //Composición Poblacional
        'pobtot': 'Población Total',
        'pobfem': 'Población Femenina',
        'pobmas': 'Población Masculina',
        'p_3ymas': 'Población 3+ años',
        'p_5ymas': 'Población 5+ años',
        'p_12ymas': 'Población 12+ años',
        'p_18ymas': 'Población 18+ años ',
        'pob0_14': 'Población 0 - 14 años', 
        'pob15_64': 'Población 0 - 15 años',
        'pob65_mas': 'Población 65 + más ',

        //Caracteristicas economicas
        'pea': 'Población 12+ Económicamente Activa',
        'pe_inac': 'Población 12+ Económicamente Inactiva',
        'pocupada': 'Población 12+ Ocupada',
        'pdesocup': 'Población 12+ Desocupada',

        //Caracteristicas educativas
        'p15ym_se': 'Población 15+ Sin Escolaridad',
        'p15pri_in': 'Población 15+ Primaria Incompleta',
        'p18ym_pb': 'Población 18+ Educación Posbásica',

        //Hogares censales
        'tothog': 'Total de Hogares Censales',
        'hogjef_f': 'Hogares con Referencia Mujer',
        'hogjef_m': 'Hogares con Referencia Hombre',
        
        //Servicios de salud
        'psinder': 'Población sin Afiliación a Servicios de Salud',
        'pder_ss': 'Población afiliada a Servicios de Salud',

        //Situación Conyugal
        'p12ym_solt': 'Población 12+ Soltera o nunca unida',
        'p12ym_casa': 'Población 12+ Casada o unida',

        //Etnicidad
        'p3ym_hli': 'Población de 3 años y más que habla alguna lengua indígena',
        'pob_afro': 'Población que se considera afromexicana o afrodescendiente',
        'pob_afro_m': 'Población masculina que se considera afromexicana o afrodescendiente',

        //Migracion
        'pnacoe': 'Pobación nacida en otra entidad',
        'presoe15': 'Población 5+ que reside en otra entidad',
        'presoe15_m': 'Población masculina 5+ que reside en otra entidad',

        //Disacapacidad
        'pcon_disc': 'Población con discapacidad',
        'pcdisc_mot': 'Población con discapacidad para caminar, subir o bajar',
        'pcdisc_vis': 'Población con discapacidad para ver, aun usando lentes',
        'pcdisc_len': 'Población con discapacidad para hablar o comunicarse',
        'pcdisc_aud': 'Población con discapacidad para oír, aun usando aparato auditivo',
        'pcdisc_m_1': 'Población con discapacidad para vestirse, bañarse o comer',
        'pcdisc_men': 'Población con discapacidad para recordar o concentrarse',
        'pcon_limi': 'Población con limitación',
        'pclim_csb': 'Población con limitación para caminar, subir o bajar',
        'pclim_vis': 'Población con limitación para ver, aun usando lentes',
        'pclim_haco': 'Población con limitación para hablar o comunicarse',
        'pclim_oaud': 'Población con limitación para oír, aun usando aparato auditivo',
        'pclim_mot2': 'Población con limitación para vestirse, bañarse o comer',
        'pclim_re_c': 'Población con limitación para recordar o concentrarse',
        'pclim_pmen': 'Población con algún problema o condición mental',
        'psind_lim': 'Población sin discapacidad, limitación, problema o condición mental',

        //Vivienda
        'tvivparhab': 'Total de viviendas particulares habitadas',
        'ocupvivpar': 'Ocupantes en viviendas particulares habitadas',
        'vph_pisoti': 'Viviendas particulares habitadas con piso de tierra',
        'vph_c_elec': 'Viviendas particulares habitadas que disponen de energía eléctrica',
        'vph_aguadv': 'Viviendas particulares habitadas que disponen de agua entubada en el ámbito de la vivienda',
        'vph_tinaco': 'Viviendas particulares habitadas que disponen de tinaco',
        'vph_cister': 'Viviendas particulares habitadas que disponen de cisterna o aljibe',
        'vph_excsa': 'Viviendas particulares habitadas que disponen de excusado o sanitario',
        'vph_drenaj': 'Viviendas particulares habitadas que disponen de drenaje',
        'vph_refri': 'Viviendas particulares habitadas que disponen de refrigerador',
        'vph_lavad': 'Viviendas particulares habitadas que disponen de lavadora',
        'vph_autom': 'Viviendas particulares habitadas que disponen de automóvil o camioneta',
        'vph_moto': 'Viviendas particulares habitadas que disponen de motocicleta o motoneta',
        'vph_bici': 'Viviendas particulares habitadas que disponen de bicicleta como medio de transporte',
        'vph_pc': 'Viviendas particulares habitadas que disponen de computadora, laptop o tablet',
        'vph_telef': 'Viviendas particulares habitadas que disponen de línea telefónica fija',
        'vph_cel': 'Viviendas particulares habitadas que disponen de teléfono celular',
        'vph_inter': 'Viviendas particulares habitadas que disponen de Internet',
        'vph_stvp': 'Viviendas particulares habitadas que disponen de servicio de televisión de paga'
    };
    
    // 2. CREAR TOOLTIP DIV VISIBLE
    const tooltipDiv = document.createElement('div');
    tooltipDiv.id = 'tooltip-personalizado';
    tooltipDiv.style.cssText = `
        position: fixed;
        background: rgba(255, 255, 255, 0.98);
        border: 3px solid ${colores.stroke};
        border-radius: 12px;
        padding: 10px 14px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        z-index: 9999999;
        pointer-events: none;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        min-width: 220px;
        max-width: 320px;
    `;
    
    tooltipDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid ${colores.stroke};">
            <div style="width: 16px; height: 16px; background: ${colores.fill}; border: 2px solid ${colores.stroke}; border-radius: 4px; margin-right: 10px;"></div>
            <strong style="color: #333; font-size: 14px;">${titulos[campo] || campo}</strong>
        </div>
        <div style="margin-bottom: 6px;">
            <span style="color: #666;">Valor:</span>
            <strong style="color: #333; margin-left: 8px;">${valor.toLocaleString('es-MX')}</strong>
        </div>
        <div>
            <span style="color: #666;">Nivel:</span>
            <strong style="color: ${colores.stroke}; margin-left: 8px;">${obtenerNombreClasificacion(clasificacion)}</strong>
        </div>
    `;
    
    document.body.appendChild(tooltipDiv);
    window.tooltipDiv = tooltipDiv;
    
    // 3. CREAR INFOWINDOW INVISIBLE PARA FUNCIONALIDAD
    window.tooltipActivo = new google.maps.InfoWindow({
        content: '<div style="display:none;"></div>',
        position: posicion,
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, 0)
    });
    
    // Abrir InfoWindow invisible
    window.tooltipActivo.open(staticMap);
    
    // Ocultar el InfoWindow visualmente
    setTimeout(() => {
        const infoWindows = document.querySelectorAll('.gm-style-iw-c');
        infoWindows.forEach(iw => {
            iw.style.display = 'none';
        });
    }, 10);
    
    // 4. FUNCIÓN PARA ACTUALIZAR POSICIÓN DEL DIV
    const actualizarPosicion = function(latLng) {
        const projection = staticMap.getProjection();
        if (!projection) return;
        
        const zoom = staticMap.getZoom();
        const scale = 1 << zoom;
        const worldCoordinate = projection.fromLatLngToPoint(latLng);
        
        const mapDiv = staticMap.getDiv();
        const mapRect = mapDiv.getBoundingClientRect();
        const bounds = staticMap.getBounds();
        
        if (!bounds) return;
        
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        const topRight = projection.fromLatLngToPoint(ne);
        const bottomLeft = projection.fromLatLngToPoint(sw);
        
        const worldWidth = (topRight.x - bottomLeft.x) * scale;
        const worldHeight = (bottomLeft.y - topRight.y) * scale;
        
        const relativeX = ((worldCoordinate.x - bottomLeft.x) * scale) / worldWidth;
        const relativeY = ((worldCoordinate.y - topRight.y) * scale) / worldHeight;
        
        let x = mapRect.left + (relativeX * mapRect.width) - (tooltipDiv.offsetWidth / 2);
        let y = mapRect.top + (relativeY * mapRect.height) - tooltipDiv.offsetHeight - 40;
        
        if (x + tooltipDiv.offsetWidth > window.innerWidth - 10) {
            x = mapRect.left + (relativeX * mapRect.width) - tooltipDiv.offsetWidth - 10;
        }
        
        if (y < 10) {
            y = mapRect.top + (relativeY * mapRect.height) + 20;
        }
        
        tooltipDiv.style.left = x + 'px';
        tooltipDiv.style.top = y + 'px';
        
        // Actualizar también la posición del InfoWindow invisible
        if (window.tooltipActivo) {
            window.tooltipActivo.setPosition(latLng);
        }
    };
    
    actualizarPosicion(posicion);
    window.actualizarTooltipPosicion = actualizarPosicion;
    
    // 5. LLAMAR A LA FUNCIÓN DE GRÁFICA
    if (typeof chartIndex === 'number' && typeof zoomManzanaEnGrafica === 'function') {
        zoomManzanaEnGrafica(chartIndex);
    }
}

// Función auxiliar para limpiar el tooltip personalizado
function limpiarTooltipPersonalizado() {
    if (window.tooltipDiv) {
        window.tooltipDiv.remove();
        window.tooltipDiv = null;
    }
    if (window.tooltipActivo) {
        window.tooltipActivo.close();
        window.tooltipActivo = null;
    }
    window.actualizarTooltipPosicion = null;
}

function probarInfoWindow() {
    // Obtener el centro del mapa
    const centro = staticMap.getCenter();
    
    // Crear un InfoWindow de prueba
    const infoWindowPrueba = new google.maps.InfoWindow({
        content: '<div style="padding: 10px;">¡InfoWindow de prueba funciona!</div>',
        position: centro
    });
    
    infoWindowPrueba.open(staticMap);
    
    setTimeout(() => {
        infoWindowPrueba.close();
    }, 3000);
    
    console.log('InfoWindow de prueba mostrado en el centro del mapa');
}


/*********************************************************************************
 *   * FUNCIONES AUXILIARES PARA CLASIFICACIÓN *
**********************************************************************************/

function calcularQuintiles(valores) {
    const n = valores.length;
    return {
        q1: valores[Math.floor(n * 0.2)] || 0,
        q2: valores[Math.floor(n * 0.4)] || 0,
        q3: valores[Math.floor(n * 0.6)] || 0,
        q4: valores[Math.floor(n * 0.8)] || 0,
        max: valores[n - 1] || 0,
        min: valores[0] || 0
    };
}

function clasificarValor(valor, quintiles) {
    if (valor <= quintiles.q1) return 1;
    if (valor <= quintiles.q2) return 2;
    if (valor <= quintiles.q3) return 3;
    if (valor <= quintiles.q4) return 4;
    return 5;
}

function obtenerColorPorClasificacion(clasificacion) {
    const colores = {
        1: { fill: '#e8e3f0', stroke: '#d4c5e8' }, // Muy bajo - lavanda muy claro
        2: { fill: '#c8b5e0', stroke: '#b399d9' }, // Bajo - lavanda medio
        3: { fill: '#9b7ac7', stroke: '#8560ba' }, // Medio - morado claro
        4: { fill: '#7147a8', stroke: '#5d3a8f' }, // Alto - morado intenso
        5: { fill: '#4a1f7a', stroke: '#341557' }  // Muy alto - morado muy oscuro
    };
    
    return colores[clasificacion] || colores[3];
}

// function obtenerColorPorClasificacion(clasificacion) {
//     const colores = {
//         1: { fill: '#00FFFF', stroke: '#00CCCC' }, // Muy bajo - cian
//         2: { fill: '#00FF00', stroke: '#00CC00' }, // Bajo - verde
//         3: { fill: '#FFFF00', stroke: '#CCCC00' }, // Medio - amarillo
//         4: { fill: '#FFA500', stroke: '#CC8400' }, // Alto - naranja
//         5: { fill: '#FF0000', stroke: '#CC0000' }  // Muy alto - rojo
//     };

//     return colores[clasificacion] || colores[3];
// }

// /**
//  * Función para obtener colores por clasificación con paleta consistente
//  * @param {number} clasificacion - Nivel de clasificación (1-5)
//  * @returns {Object} Objeto con colores fill y stroke 
//  */
// function obtenerColorPorClasificacion(clasificacion) {
//     // Si no hay paleta seleccionada para este mapa, seleccionar una aleatoriamente
//     if (!paletaActualMapa) {
//         seleccionarNuevaPaletaMapa();
//     }
    
//     // Validar clasificación
//     if (clasificacion < 1 || clasificacion > 5) {
//         clasificacion = 3; // Valor por defecto
//     }
    
//     return paletaActualMapa[clasificacion] || paletaActualMapa[3];
// }

// function seleccionarNuevaPaletaMapa() {
//     // 5 paletas de colores diferentes para clasificación temática
//     const paletas = [
//         // Paleta 1: Azul-Verde (Secuencia fría)
//         {
//             1: { fill: '#f7fcf0', stroke: '#e5f5e0' }, // Muy bajo - verde muy claro
//             2: { fill: '#c7e9b4', stroke: '#a1d99b' }, // Bajo - verde claro  
//             3: { fill: '#7fcdbb', stroke: '#41b6c4' }, // Medio - verde azulado
//             4: { fill: '#41b6c4', stroke: '#2c7fb8' }, // Alto - azul claro
//             5: { fill: '#253494', stroke: '#081d58' }  // Muy alto - azul oscuro
//         },
        
//         // Paleta 2: Cálida (Secuencia amarillo-rojo)
//         {
//             1: { fill: '#ffffcc', stroke: '#ffeda0' }, // Muy bajo - amarillo muy claro
//             2: { fill: '#fed976', stroke: '#feb24c' }, // Bajo - amarillo
//             3: { fill: '#fd8d3c', stroke: '#fc4e2a' }, // Medio - naranja
//             4: { fill: '#e31a1c', stroke: '#bd0026' }, // Alto - rojo
//             5: { fill: '#800026', stroke: '#4d0013' }  // Muy alto - rojo oscuro
//         },
        
//         // Paleta 3: Púrpura (Secuencia monocromática)
//         {
//             1: { fill: '#f2f0f7', stroke: '#e1dbe6' }, // Muy bajo - púrpura muy claro
//             2: { fill: '#cbc9e2', stroke: '#9e9ac8' }, // Bajo - púrpura claro
//             3: { fill: '#9e9ac8', stroke: '#756bb1' }, // Medio - púrpura medio
//             4: { fill: '#756bb1', stroke: '#54278f' }, // Alto - púrpura
//             5: { fill: '#54278f', stroke: '#2d004b' }  // Muy alto - púrpura oscuro
//         },
        
//         // Paleta 4: Tierra (Secuencia beige-marrón)
//         {
//             1: { fill: '#fff7ec', stroke: '#fee8c8' }, // Muy bajo - beige muy claro
//             2: { fill: '#fdd49e', stroke: '#fdbb84' }, // Bajo - beige
//             3: { fill: '#fc8d59', stroke: '#ef6548' }, // Medio - naranja tierra
//             4: { fill: '#d7301f', stroke: '#b30000' }, // Alto - rojo tierra
//             5: { fill: '#7f0000', stroke: '#4d0000' }  // Muy alto - marrón oscuro
//         },
        
//         // Paleta 5: Viridis (Secuencia perceptualmente uniforme)
//         {
//             1: { fill: '#fde725', stroke: '#f0e442' }, // Muy bajo - amarillo viridis
//             2: { fill: '#5dc863', stroke: '#4ac16d' }, // Bajo - verde claro viridis
//             3: { fill: '#21908c', stroke: '#2a788e' }, // Medio - verde azulado viridis
//             4: { fill: '#3b528b', stroke: '#472d7b' }, // Alto - azul viridis
//             5: { fill: '#440154', stroke: '#2d0845' }  // Muy alto - púrpura viridis
//         }
//     ];
    
//     // Seleccionar paleta aleatoria
//     const indiceAleatorio = Math.floor(Math.random() * paletas.length);
//     paletaActualMapa = paletas[indiceAleatorio];
    
//     // Nombres de las paletas para debugging
//     const nombresPaletas = ['Azul-Verde', 'Cálida', 'Púrpura', 'Tierra', 'Viridis'];
//     console.log(`Paleta seleccionada para este mapa: ${nombresPaletas[indiceAleatorio]}`);
// }

// /**
//  * Resetea la paleta actual (para forzar nueva selección en el próximo mapa)
//  * Llamar esta función cuando se limpie el mapa o se cambie de tema
//  */
// function resetearPaletaMapa() {
//     paletaActualMapa = null;
// }

// /**
//  * Fuerza el cambio de paleta (útil para botón de cambiar paleta)
//  */
// function cambiarPaletaMapa() {
//     const paletaAnterior = paletaActualMapa ? 'existente' : 'ninguna';
//     seleccionarNuevaPaletaMapa();
//     return paletaActualMapa;
// }
/*********************************************************************************
 *   * EVENTOS Y INTERACCIONES *
**********************************************************************************/

function ocultarTooltipPoligono() {
    // Si existe esta variable global, mantenerla:
    if (tooltipPoligono) {
        tooltipPoligono.close();
        tooltipPoligono = null;
    }
    
    //  AGREGAR - Para manejar también el tooltip de GeoJSON
    if (typeof tooltipPoligonoGeoJSON !== 'undefined' && tooltipPoligonoGeoJSON) {
        tooltipPoligonoGeoJSON.close();
        tooltipPoligonoGeoJSON = null;
    }
}

/*********************************************************************************
 *   * LEYENDA TEMÁTICA *
**********************************************************************************/
function crearEstadisticasDescriptivas(valores, campo) {
    // Eliminar estadísticas anteriores si existen
    const estadisticasAnteriores = document.getElementById('estadisticas-descriptivas');
    if (estadisticasAnteriores) {
        estadisticasAnteriores.remove();
    }

    // Calcular estadísticas descriptivas
    const n = valores.length;
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const media = suma / n;
    
    // Mediana
    const valoresOrdenados = [...valores].sort((a, b) => a - b);
    const mediana = n % 2 === 0 
        ? (valoresOrdenados[n/2 - 1] + valoresOrdenados[n/2]) / 2
        : valoresOrdenados[Math.floor(n/2)];
    
    // Desviación estándar
    const varianza = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / n;
    const desviacionEstandar = Math.sqrt(varianza);
    
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    const rango = maximo - minimo;

    const contenedor = document.createElement('div');
    contenedor.id = 'estadisticas-descriptivas';
    contenedor.style.cssText = `
        position: absolute;
        bottom: 240px;
        left: 320px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: 'Poppins', sans-serif;
        font-size: 11px;
        z-index: 1000;
        max-width: 300px;
    `;

    const titulo = document.createElement('div');
    titulo.style.cssText = `
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        font-size: 13px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    `;
    titulo.textContent = 'Resumen Estadístico';

    contenedor.appendChild(titulo);

    const estadisticas = [
        // { label: 'Media', valor: media.toFixed(2) },
        // { label: 'Mediana', valor: mediana.toFixed(2) },
        { label: 'Total de la UT', valor: suma },
        // { label: 'Desv. Estándar', valor: desviacionEstandar.toFixed(2) },
        // { label: 'Mínimo', valor: minimo },
        // { label: 'Máximo', valor: maximo },
        // { label: 'Rango', valor: rango },
        // { label: 'No. Poligonos', valor: n }
    ];

    estadisticas.forEach(stat => {
        const elemento = document.createElement('div');
        elemento.style.cssText = `
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            padding: 2px 0;
        `;

        const etiqueta = document.createElement('span');
        etiqueta.style.cssText = `
            font-weight: 500;
            color: #555;
        `;
        etiqueta.textContent = stat.label + ':';

        const valor = document.createElement('span');
        valor.style.cssText = `
            color: #333;
            font-weight: 600;
        `;
        valor.textContent = stat.valor;

        elemento.appendChild(etiqueta);
        elemento.appendChild(valor);
        contenedor.appendChild(elemento);
    });

    document.getElementById('map').appendChild(contenedor);
}

function limpiarEstadisticasDescriptivas() {
    const estadisticas = document.getElementById('estadisticas-descriptivas');
    if (estadisticas) {
        estadisticas.remove();
    }
}

function crearLeyendaTematica(quintiles, campo) {

    // Eliminar leyenda anterior si existe
    const leyendaAnterior = document.getElementById('leyenda-tematica');
    if (leyendaAnterior) {
        leyendaAnterior.remove();
    }

    const leyenda = document.createElement('div');
    leyenda.id = 'leyenda-tematica';
    leyenda.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 320px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: 'Poppins', sans-serif;
        font-size: 12px;
        z-index: 1000;
        max-width: 300px;
    `;

    const titulo = document.createElement('div');
    titulo.style.cssText = `
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        font-size: 17px;
        color: #333;
    `;
    titulo.textContent = obtenerTituloCampo(campo);

    leyenda.appendChild(titulo);

    // Crear elementos de la leyenda
    const rangos = [
        { nivel: 5, rango: `${quintiles.q4 + 1} - ${quintiles.max}`, nombre: 'Muy Alto' },
        { nivel: 4, rango: `${quintiles.q3 + 1} - ${quintiles.q4}`, nombre: 'Alto' },
        { nivel: 3, rango: `${quintiles.q2 + 1} - ${quintiles.q3}`, nombre: 'Medio' },
        { nivel: 2, rango: `${quintiles.q1 + 1} - ${quintiles.q2}`, nombre: 'Bajo' },
        { nivel: 1, rango: `${quintiles.min} - ${quintiles.q1}`, nombre: 'Muy Bajo' }
    ];

    rangos.forEach(item => {
        const elemento = document.createElement('div');
        elemento.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 4px;
        `;

        const color = obtenerColorPorClasificacion(item.nivel);
        
        const cuadro = document.createElement('div');
        cuadro.style.cssText = `
            width: 20px;
            height: 15px;
            background-color: ${color.fill};
            border: 1px solid ${color.stroke};
            margin-right: 8px;
            border-radius: 2px;
        `;

        const texto = document.createElement('span');
        texto.style.cssText = `
            font-size: 15px;
            color: #555;
        `;
        texto.textContent = `${item.nombre}: ${item.rango}`;

        elemento.appendChild(cuadro);
        elemento.appendChild(texto);
        leyenda.appendChild(elemento);
    });

    // Agregar al mapa
    document.getElementById('map').appendChild(leyenda);
}

function mostrarMensajeInstructivo() {
    // Remover mensaje anterior si existe
    const mensajeAnterior = document.getElementById('mensaje-instructivo');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    const mensaje = document.createElement('div');
    mensaje.id = 'mensaje-instructivo';
    mensaje.style.cssText = `
        position: absolute;
        bottom: 10px;                 /* parte inferior */
        left: 50%;                    /* centrado horizontal */
        transform: translateX(-50%);  /* ajustar al centro */
        background: rgba(50, 5, 71, 0.45); /* morado translúcido */
        color: white;
        padding: 8px 20px;
        border-radius: 15px;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        z-index: 2000;
        text-align: center;
        pointer-events: none; /* no bloquea clicks sobre el mapa */
    `;

    mensaje.textContent = "Haz click en cualquier polígono para ver la gráfica de su clase";

    document.getElementById('map').appendChild(mensaje);
}

function limpiarMensajeInstructivo() {
    const mensaje = document.getElementById('mensaje-instructivo');
    if (mensaje) {
        mensaje.remove();
    }
}

function obtenerTituloCampo(campo) {

    const titulos = {

        //Composición Poblacional
        'pobtot': 'Población Total',
        'pobfem': 'Población Femenina',
        'pobmas': 'Población Masculina',
        'p_3ymas': 'Población 3+ años',
        'p_5ymas': 'Población 5+ años',
        'p_12ymas': 'Población 12+ años',
        'p_18ymas': 'Población 18+ años ',
        'pob0_14': 'Población 0 - 14 años', 
        'pob15_64': 'Población 0 - 15 años',
        'pob65_mas': 'Población 65 + más ',

        //Caracteristicas economicas
        'pea': 'Población 12+ Económicamente Activa',
        'pe_inac': 'Población 12+ Económicamente Inactiva',
        'pocupada': 'Población 12+ Ocupada',
        'pdesocup': 'Población 12+ Desocupada',

        //Caracteristicas educativas
        'p15ym_se': 'Población 15+ Sin Escolaridad',
        'p15pri_in': 'Población 15+ Primaria Incompleta',
        'p18ym_pb': 'Población 18+ Educación Posbásica',

        //Hogares censales
        'tothog': 'Total de Hogares Censales',
        'hogjef_f': 'Hogares con Referencia Mujer',
        'hogjef_m': 'Hogares con Referencia Hombre',
        
        //Servicios de salud
        'psinder': 'Población sin Afiliación a Servicios de Salud',
        'pder_ss': 'Población afiliada a Servicios de Salud',

        //Situación Conyugal
        'p12ym_solt': 'Población 12+ Soltera o nunca unida',
        'p12ym_casa': 'Población 12+ Casada o unida',

        //Etnicidad
        'p3ym_hli': 'Población de 3 años y más que habla alguna lengua indígena',
        'pob_afro': 'Población que se considera afromexicana o afrodescendiente',
        'pob_afro_m': 'Población masculina que se considera afromexicana o afrodescendiente',

        //Migracion
        'pnacoe': 'Pobación nacida en otra entidad',
        'presoe15': 'Población 5+ que reside en otra entidad',
        'presoe15_m': 'Población masculina 5+ que reside en otra entidad',

        //Disacapacidad
        'pcon_disc': 'Población con discapacidad',
        'pcdisc_mot': 'Población con discapacidad para caminar, subir o bajar',
        'pcdisc_vis': 'Población con discapacidad para ver, aun usando lentes',
        'pcdisc_len': 'Población con discapacidad para hablar o comunicarse',
        'pcdisc_aud': 'Población con discapacidad para oír, aun usando aparato auditivo',
        'pcdisc_m_1': 'Población con discapacidad para vestirse, bañarse o comer',
        'pcdisc_men': 'Población con discapacidad para recordar o concentrarse',
        'pcon_limi': 'Población con limitación',
        'pclim_csb': 'Población con limitación para caminar, subir o bajar',
        'pclim_vis': 'Población con limitación para ver, aun usando lentes',
        'pclim_haco': 'Población con limitación para hablar o comunicarse',
        'pclim_oaud': 'Población con limitación para oír, aun usando aparato auditivo',
        'pclim_mot2': 'Población con limitación para vestirse, bañarse o comer',
        'pclim_re_c': 'Población con limitación para recordar o concentrarse',
        'pclim_pmen': 'Población con algún problema o condición mental',
        'psind_lim': 'Población sin discapacidad, limitación, problema o condición mental',

        //Vivienda
        'tvivparhab': 'Total de viviendas particulares habitadas',
        'ocupvivpar': 'Ocupantes en viviendas particulares habitadas',
        'vph_pisoti': 'Viviendas particulares habitadas con piso de tierra',
        'vph_c_elec': 'Viviendas particulares habitadas que disponen de energía eléctrica',
        'vph_aguadv': 'Viviendas particulares habitadas que disponen de agua entubada en el ámbito de la vivienda',
        'vph_tinaco': 'Viviendas particulares habitadas que disponen de tinaco',
        'vph_cister': 'Viviendas particulares habitadas que disponen de cisterna o aljibe',
        'vph_excsa': 'Viviendas particulares habitadas que disponen de excusado o sanitario',
        'vph_drenaj': 'Viviendas particulares habitadas que disponen de drenaje',
        'vph_refri': 'Viviendas particulares habitadas que disponen de refrigerador',
        'vph_lavad': 'Viviendas particulares habitadas que disponen de lavadora',
        'vph_autom': 'Viviendas particulares habitadas que disponen de automóvil o camioneta',
        'vph_moto': 'Viviendas particulares habitadas que disponen de motocicleta o motoneta',
        'vph_bici': 'Viviendas particulares habitadas que disponen de bicicleta como medio de transporte',
        'vph_pc': 'Viviendas particulares habitadas que disponen de computadora, laptop o tablet',
        'vph_telef': 'Viviendas particulares habitadas que disponen de línea telefónica fija',
        'vph_cel': 'Viviendas particulares habitadas que disponen de teléfono celular',
        'vph_inter': 'Viviendas particulares habitadas que disponen de Internet',
        'vph_stvp': 'Viviendas particulares habitadas que disponen de servicio de televisión de paga'
    };
    return titulos[campo] || 'Población';

}

/*********************************************************************************
 *   * FUNCIÓN DE LIMPIEZA *
**********************************************************************************/
function limpiarPoligonosTematicos() {
    try {
        // Limpiar eventos del mapa
        google.maps.event.clearListeners(staticMap, 'mousemove');
        
        // Método 1: Si poligonosTematicos contiene features de data layer
        if (Array.isArray(poligonosTematicos) && poligonosTematicos.length > 0) {
            console.log(`Limpiando ${poligonosTematicos.length} features`);
            
            poligonosTematicos.forEach(feature => {
                try {
                    staticMap.data.remove(feature);
                } catch (e) {
                    console.warn('Error removiendo feature individual:', e);
                }
            });
        }
        
        // Método 2: Limpiar todo el data layer relacionado con temáticos
        if (staticMap && staticMap.data) {
            // Remover todos los listeners del data layer
            google.maps.event.clearListeners(staticMap.data, 'mouseover');
            google.maps.event.clearListeners(staticMap.data, 'mouseout');
            google.maps.event.clearListeners(staticMap.data, 'click');
            
            // Obtener todas las features y remover las temáticas
            const allFeatures = [];
            staticMap.data.forEach(feature => {
                if (feature.getProperty('clasificacion') !== undefined || 
                    feature.getProperty('valor_campo') !== undefined) {
                    allFeatures.push(feature);
                }
            });
            
            allFeatures.forEach(feature => {
                try {
                    staticMap.data.remove(feature);
                } catch (e) {
                    console.warn('Error removiendo feature:', e);
                }
            });
        }
        
        // Limpiar array
        poligonosTematicos = [];

        // Remover leyenda
        const leyenda = document.getElementById('leyenda-tematica');
        if (leyenda) {
            leyenda.remove();
        }

        // Cerrar tooltip si está abierto
        ocultarTooltipPoligono();
        limpiarEstadisticasDescriptivas();
        limpiarGraficasLineas();
        limpiarMensajeInstructivo();
        limpiarLeyendaMapaCalor();
        
        console.log('Polígonos temáticos limpiados correctamente');
        
    } catch (error) {
        console.error('Error en limpieza de polígonos:', error);
        
        // Limpieza de emergencia
        try {
            if (staticMap && staticMap.data) {
                google.maps.event.clearListeners(staticMap.data, 'mouseover');
                google.maps.event.clearListeners(staticMap.data, 'mouseout');
                google.maps.event.clearListeners(staticMap.data, 'click');
                google.maps.event.clearListeners(staticMap, 'mousemove');
                
                const toRemove = [];
                staticMap.data.forEach(feature => toRemove.push(feature));
                toRemove.forEach(feature => {
                    try {
                        staticMap.data.remove(feature);
                    } catch (e) {
                        // Ignorar errores individuales
                    }
                });
            }
        } catch (e) {
            console.error('Error en limpieza de emergencia:', e);
        }
    }
}
/*********************************************************************************
 *   * FUNCIÓN PARA MANEJAR EVENTOS DE HOVER EN BOTONES *
**********************************************************************************/

// Agregar efectos hover después de crear los controles
function agregarEfectosHover(){

    const botones = ['btn-mapa-calor', 'btn-mapa-tematico', 'btn-limpiar-mapas'];
    
    botones.forEach(id => {

        const boton = document.getElementById(id);
        if (!boton) return;
        
        const esLimpiar = id === 'btn-limpiar-mapas';
        const colorHover = esLimpiar ? '#dc3545' : '#320547';
        const colorNormal = esLimpiar ? '#dc3545' : '#320547';
        
        boton.addEventListener('mouseenter', function() {

            if (!this.style.background.includes('rgb(50, 5, 71)') && !this.style.background.includes('rgb(220, 53, 69)')) {
                this.style.background = `${colorHover}15`;
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }
        });
        
        boton.addEventListener('mouseleave', function() {
            if (!this.style.background.includes('rgb(50, 5, 71)') && !this.style.background.includes('rgb(220, 53, 69)')) {
                this.style.background = 'white';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
        });
    });

}

// Llamar después de crear los controles
setTimeout(agregarEfectosHover, 300);

/*********************************************************************************
 *   * FUNCIÓN INTEGRADA PARA MAPA DE CALOR + TEMÁTICO *
**********************************************************************************/
function mapaCalor_Tematico(datos, campo) {

    // Guardar datos para los controles
    datosActualesCalor = datos;
    campoActual = campo; // ASEGURAR QUE SE GUARDE EL CAMPO CORRECTO
    
    // Limpiar mapas anteriores
    limpiarTodosLosMapas();
    
    // Crear controles si no existen
    crearControlesMapas();
    
    // Por defecto, mostrar solo el mapa temático CON EL CAMPO CORRECTO
    setTimeout(() => {
        mapaTematicoPoligonos(campo); // PASAR EL CAMPO CORRECTO
        estadoMapaTematico = true;
        actualizarEstadoBotones();
    }, 200);

    limpiarMensajeSinDatosCalor();

}

/*********************************************************************************
 *   * FUNCIONES MAPAS DE CALOR Y TEMATICOS POR TEMA *
**********************************************************************************/
// Función para limpiar tanto mapas de calor como temáticos
function limpiarMapasCompletos() {
    // Limpiar mapa de calor existente
    if (heatmap) {
        heatmap.setMap(null);
        heatmap = null;
    }
    
    // Limpiar polígonos temáticos
    limpiarPoligonosTematicos();

    // Limipar mensaje sin datos de calor
    limpiarMensajeSinDatosCalor();
}

function mapaCalor(datos) {
    // Limpiar leyenda temática si existe
    limpiarLeyendaTematica();
    limpiarEstadisticasDescriptivas();

    // --- Clasificación en 3 grupos por percentiles ---
    const valores = datos.map(d => d.datos).sort((a,b) => a-b);
    const max = valores[valores.length - 1];
    
    // Si el valor máximo es 0, significa que todos son 0
    if (max === 0) {
        mostrarMensajeSinDatosCalor();
        return; // Salir de la función sin crear el mapa
    }
    const q1 = valores[Math.floor(valores.length * 0.33)];
    const q2 = valores[Math.floor(valores.length * 0.66)];      

    const heatData = datos.map((item) => {
        let weight = 1;
        if (item.datos > q1 && item.datos <= q2) weight = 3;
        else if (item.datos > q2) weight = 5;
        return {
            location: new google.maps.LatLng(item.latitud, item.longitud),
            weight
        };
    });

    const gradientes = [
        "rgba(0, 0, 255, 0)",
        "rgba(0, 0, 255, 1)",
        "rgba(0, 255, 255, 1)",
        "rgba(0, 255, 0, 1)",
        "rgba(255, 255, 0, 1)",
        "rgba(255, 165, 0, 1)",
        "rgba(255, 0, 0, 1)"
    ];

    if (heatmap) heatmap.setMap(null);
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatData,
        radius: 50,
        gradient: gradientes
    });
    heatmap.setMap(staticMap);

    const controlesMapas = document.getElementById('controles-mapas');
    if (controlesMapas) {
        controlesMapas.style.display = 'flex';
    }
    // Crear leyenda mejorada en la misma posición
    crearLeyendaMapaCalor(valores, q1, q2, campoActual);
}
function mostrarMensajeSinDatosCalor() {
    // Limpiar mapa de calor anterior si existe
    if (heatmap) {
        heatmap.setMap(null);
        heatmap = null;
    }
    
    // Crear mensaje
    const mensaje = document.createElement('div');
    mensaje.id = 'mensaje-sin-datos-calor';
    mensaje.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 3px solid #dc3545;
        border-radius: 12px;
        padding: 30px 40px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        font-family: 'Poppins', sans-serif;
        text-align: center;
        z-index: 1000;
        max-width: 400px;
    `;
    
    mensaje.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px; color: #dc3545;">
            📊
        </div>
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">
            Sin Datos para Mapa de Calor
        </h3>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.5;">
            No hay información suficiente para generar el mapa de calor en este indicador.
            <br><br>
            <strong>Sugerencia:</strong> Prueba con el <strong>Mapa Temático</strong> para visualizar los datos.
        </p>
        <button id="btn-cerrar-mensaje-calor" style="
            background: #320547;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        ">
            Entendido
        </button>
    `;
    
    document.getElementById('map').appendChild(mensaje);
    
    // Agregar evento al botón
    document.getElementById('btn-cerrar-mensaje-calor').addEventListener('click', function() {
        limpiarMensajeSinDatosCalor();
    });
    
    // Efecto hover al botón
    const boton = document.getElementById('btn-cerrar-mensaje-calor');
    boton.addEventListener('mouseenter', function() {
        this.style.background = '#4a0668';
        this.style.transform = 'scale(1.05)';
    });
    boton.addEventListener('mouseleave', function() {
        this.style.background = '#320547';
        this.style.transform = 'scale(1)';
    });
    
    // Ocultar controles de mapas si no hay datos
    const controlesMapas = document.getElementById('controles-mapas');
    if (controlesMapas) {
        // Deshabilitar solo el botón de mapa de calor
        const btnCalor = controlesMapas.querySelector('button:first-child');
        if (btnCalor) {
            btnCalor.disabled = true;
            btnCalor.style.opacity = '0.5';
            btnCalor.style.cursor = 'not-allowed';
        }
    }
}
function limpiarMensajeSinDatosCalor() {
    const mensaje = document.getElementById('mensaje-sin-datos-calor');
    if (mensaje) {
        mensaje.remove();
    }
    
    // Rehabilitar botón de mapa de calor
    const controlesMapas = document.getElementById('controles-mapas');
    if (controlesMapas) {
        const btnCalor = controlesMapas.querySelector('button:first-child');
        if (btnCalor) {
            btnCalor.disabled = false;
            btnCalor.style.opacity = '1';
            btnCalor.style.cursor = 'pointer';
        }
    }
}
function crearLeyendaMapaCalor(valores, q1, q2, campo) {
    const leyenda = document.createElement('div');
    leyenda.id = 'leyenda-mapa-calor';
    leyenda.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 320px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: 'Poppins', sans-serif;
        font-size: 12px;
        z-index: 1000;
        max-width: 300px;
    `;

    const titulo = document.createElement('div');
    titulo.style.cssText = `
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        font-size: 17px;
        color: #333;
    `;
    titulo.textContent = obtenerTituloCampo(campo);

    leyenda.appendChild(titulo);

    // Gradiente visual que coincida exactamente con el heatmap
    const gradienteDiv = document.createElement('div');
    gradienteDiv.style.cssText = `
        width: 100%;
        height: 20px;
        background: linear-gradient(to right, 
            rgba(0, 0, 255, 1),
            rgba(0, 255, 255, 1),
            rgba(0, 255, 0, 1),
            rgba(255, 255, 0, 1),
            rgba(255, 165, 0, 1),
            rgba(255, 0, 0, 1)
        );
        border-radius: 4px;
        margin: 8px 0;
        border: 1px solid #ccc;
    `;
    leyenda.appendChild(gradienteDiv);

    // Rangos que coincidan exactamente con los pesos del heatmap
    // Weight 1 = Azul (0,0,255), Weight 3 = Verde/Amarillo, Weight 5 = Rojo (255,0,0)
    const rangos = [
        { 
            nivel: 'Alta Densidad', 
            rango: `${(q2 + 0.1).toFixed(1)} - ${valores[valores.length - 1]}`, 
            color: 'rgba(255, 0, 0, 1)', // Rojo - Weight 5
            peso: 'Weight: 5'
        },
        { 
            nivel: 'Media Densidad', 
            rango: `${(q1 + 0.1).toFixed(1)} - ${q2.toFixed(1)}`, 
            color: 'rgba(255, 255, 0, 1)', // Amarillo - Weight 3
            peso: 'Weight: 3'
        },
        { 
            nivel: 'Baja Densidad', 
            rango: `${valores[0]} - ${q1.toFixed(1)}`, 
            color: 'rgba(0, 0, 255, 1)', // Azul - Weight 1
            peso: 'Weight: 1'
        }
    ];

    rangos.forEach(item => {
        const elemento = document.createElement('div');
        elemento.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 6px;
        `;

        const cuadro = document.createElement('div');
        cuadro.style.cssText = `
            width: 20px;
            height: 15px;
            background: ${item.color};
            border: 1px solid #333;
            margin-right: 8px;
            border-radius: 2px;
        `;

        const contenidoTexto = document.createElement('div');
        contenidoTexto.style.cssText = `
            display: flex;
            flex-direction: column;
            font-size: 13px;
        `;

        const textoNivel = document.createElement('span');
        textoNivel.style.cssText = `
            color: #333;
            font-weight: 600;
        `;
        textoNivel.textContent = item.nivel;

        const textoRango = document.createElement('span');
        textoRango.style.cssText = `
            color: #666;
            font-size: 12px;
        `;
        textoRango.textContent = `Valores: ${item.rango}`;

        contenidoTexto.appendChild(textoNivel);
        contenidoTexto.appendChild(textoRango);

        elemento.appendChild(cuadro);
        elemento.appendChild(contenidoTexto);
        leyenda.appendChild(elemento);
    });

    document.getElementById('map').appendChild(leyenda);
}
function limpiarLeyendaMapaCalor() {
    const leyenda = document.getElementById('leyenda-mapa-calor');
    if (leyenda) {
        leyenda.remove();
    }
    limpiarMensajeSinDatosCalor();
}

function limpiarLeyendaTematica() {
    const leyenda = document.getElementById('leyenda-tematica');
    if (leyenda) {
        leyenda.remove();
    }
    limpiarMensajeSinDatosCalor();
}
/*********************************************************************************
 *   * FUNCION PARA INSTANCIAR CLASES Y TREAR FUNCIONES DE MAPAS Y GRAFICOS  *
**********************************************************************************/
function seleccionarSubtema(idBoton, categoria, subtema) {

    // NUEVA LÍNEA - Limpiar secciones al seleccionar cualquier tema
    limpiarSecciones();

    // LIMPIAR TODO ANTES DE CAMBIAR
    limpiarTodosLosMapas();

    // Si es Distribución Territorial, asegurar que existe la instancia
    if (categoria === 'Distribución Territorial') {
        // Crear o recuperar instancia única
        if (!distribucionTerritorial) {
            distribucionTerritorial = new DistribucionTerritorial();
        } else {
            // Limpiar datos previos si existe
            distribucionTerritorial.limpiarTodo();
        }
    } else {
        // Para otras categorías, limpiar DT si existe
        if (distribucionTerritorial) {
            distribucionTerritorial.limpiarTodo();
        }
    }

    /*********************************************************************************
     *   * Condicion para separar clases y funciones de acuerdo al id del boton *
    **********************************************************************************/

    if(idBoton === "Indicadores"){
        
        // Separar por categoria
        if(categoria === 'Distribución Territorial'){
            switch (subtema) {
                case 'Superficie de la Unidad Territorial respecto a la Demarcación':
                    distribucionTerritorial.graficaPorcentajesup();    
                    break;
                
                default:
                    break;
            }
        }
        else if( categoria === 'Composición Poblacional'){
            const poblacion = new Poblacion();

            switch (subtema) { 
                case 'Porcentaje de Población de la Unidad Territorial respecto a la Demarcacion':
                    poblacion.graficaPorcentajePob();
                    break;
                case 'Densidad de Población (HAB/M2)':
                    poblacion.graficaPorcentajeDenPob();
                    break;
                case 'Relación Hombres-Mujeres':
                    poblacion.graficaRelHomMuj();
                    break;
                case 'Porcentaje de Mujeres':
                    poblacion.graficaPorcMuj();
                    break;
                case 'Porcentaje de Hombres':
                    poblacion.graficaPorcHom();
                    break;
                case 'Población de 18 años y más':
                    poblacion.graficaPob18Mas();
                    break;
                case 'Relación de Dependencia':
                    poblacion.graficaRelDep();
                    break;
                case 'Indice de Envejecimiento':
                    poblacion.graficaIndiceEnve();
                    break;
                default:
                    break; 
            }        
        }
        else if (categoria === 'Migración'){
            const migracion = new Migracion();

            switch (subtema){
                case 'Población No Nativa':
                    migracion.graficaPobNoNati();
                    break; 
                case 'Población Migrante Estatal':
                    migracion.graficaPobMigrEsta();
                    break;
            }
        }
        else if(categoria === 'Etnicidad'){
            const etnicidad = new Etnicidad();

            switch (subtema) {
                case 'Población de 3 años y más que habla alguna lengua indígena':
                    etnicidad.graficaPob3masLenguaInd();                    
                    break;
                case 'Población que se considera afromexicana o afrodescendiente':
                    etnicidad.graficaPobAfromex();
                    break;
                default:
                    break;
            }
        }
        else if(categoria === 'Discapacidad'){
            const discapacidad = new Discapacidad();

            switch(subtema){
                case 'Población con Discapacidad':
                    discapacidad.graficaPobDisc();
                    break;
                case 'Población con discapacidad para caminar, subir o bajar': 
                    discapacidad.graficaPobDiscCamin();
                    break;
                case 'Población con discapacidad para ver, aún usando lentes': 
                    discapacidad.graficaPobDiscVer();
                    break;
                case 'Población con discapacidad para hablar o comunicarse': 
                    discapacidad.graficaPobDiscHablar();
                    break;
                case 'Población con discapacidad para oír, aún usando aparato auditivo': 
                    discapacidad.graficaPobDiscOir();
                    break;
                case 'Población con discapacidad para vestirse, bañarse o comer': 
                    discapacidad.graficaPobDiscVest();
                    break;
                case 'Población con discapacidad para recordar o concentrarse': 
                    discapacidad.PobDiscRecordar();
                    break;
                case 'Población con limitación': 
                    discapacidad.graficaPobLimi();
                    break;
                case 'Población con limitación para caminar, subir o bajar': 
                    discapacidad.graficaPobLimCamin();
                    break;
                case 'Población con limitación para ver, aún usando lentes':  
                    discapacidad.graficaPobLimVer();
                    break;
                case 'Población con limitación para hablar o comunicarse': 
                    discapacidad.graficaPobLimHablr();
                    break;
                case 'Población con limitación para oír, aún usando aparato auditivo': 
                    discapacidad.graficaPobLimOir();
                    break;
                case 'Población con limitación para vestirse, bañarse o comer': 
                    discapacidad.graficaPobLimVestir();
                    break;
                case 'Población con limitación para recordar o concentrarse': 
                    discapacidad.graficaPobLimRecordConc();
                    break;
                case 'Población con algún problema o condición mental':
                    discapacidad.graficaPobProblCondiMen();
                    break;
                case 'Población sin discapacidad, limitación, problema o condición mental':
                    discapacidad.graficaPobSinDiscapacidad();
                    break;
                default:
                    break;
            }
        }
        else if(categoria === 'Características Económicas'){
            const economicas = new CaracteristicasEconomicas();
        
            switch(subtema){
                case 'Población económicamente activa (PEA)':
                    economicas.graficaPEA();
                    break;
                case 'Población de 12 años y más No Económicamente Activa':
                    economicas.graficaPNOEA();
                    break;
                case 'Población Económicamente Activa Ocupada':
                    economicas.graficaPPEA();
                    break;
                case 'Población Económicamente Activa Desocupada':
                    economicas.graficaPDESOC();
                    break;
                default:
                    break;
            }    
        }
        else if (categoria === 'Características Educativas'){
            const educativas = new CaracteristicasEducativas();

            switch(subtema){
                case 'Porcentaje de población con educación posbásica':
                    educativas.graficaEDUPOSB();
                    break;
                case 'Porcentaje de población con rezago educativo':
                    educativas.graficaREZEDU();
                    break;
                default:
                    break;
            }
        }
        else if (categoria === 'Hogares Censales'){
            const hogaresc = new HogaresCensales();

            switch(subtema){
                case 'Relación Mujer/Hombre Jefatura De Hogar':
                    hogaresc.graficaRELHM();
                    break;
                case 'Hogares con jefatura de hogar mujer':
                    hogaresc.graficaJEFM();
                    break;
                default:
                    break;
            }
        }
        else if (categoria === 'Afiliación a Servicios de Salud'){
            const salud = new Salud();

            switch(subtema){
                case 'Porcentaje de Población afiliada a servicios de salud':
                    salud.graficaPASS();
                    break;
                case 'Porcentaje de Población sin afiliación a servicios de salud':
                    salud.graficaPSINASS();
                    break;
                default:
                    break;
            }
        }
        else if (categoria === 'Situación Conyugal'){
            const conyugal = new SituacionConyugal();

            switch(subtema){
                case 'Porcentaje de Población soltera':
                    conyugal.graficaPPBSOL();
                    break;
                case 'Personas Casadas o Unidas':
                    conyugal.graficaCasadasUnidas();
                    break;
                default:
                    break;
            }
        }
        else if (categoria === 'Vivienda'){
            const vivienda = new Vivienda();

            switch(subtema){
                case 'Promedio De Ocupantes Por Vivienda':
                    vivienda.graficaPROMOCVIV();
                    break;
                case 'Porcentaje de Viviendas con Piso de Tierra':
                    vivienda.graficaPVIVPITI();
                    break;
                case 'Índice Disponibilidad de Servicios y Equipamiento':
                    vivienda.graficaINDDSYEQP();
                    break;
                case 'Índice Disponibilidad de Bienes':
                    vivienda.graficaINDDISVIEN();
                    break;
                case 'Índice Disponibilidad de Tecnologías de la Información y la Comunicación (TIC)':
                    vivienda.graficaINDTIC();
                default:
                    break;
            }
        }
        // else if(categoria === 'Información Adicional'){
            
        //     const infoAdicional = new InfoAdicional();
            
        //     switch(subtema){
        //         case 'Índice de Áreas Verdes':
        //             infoAdicional.graficaAREAVERDE();
        //             break;
        //         default:
        //             break;
        //     }
        // }

    }

    //MAPAS DE CALOR
    else if (idBoton === "Subtemas"){

        //Separar por categoria
        if(categoria === 'Distribución Territorial'){

            // Ocultar controles de mapas para Información Adicional
            const controlesMapas = document.getElementById('controles-mapas');
            if (controlesMapas) {
                controlesMapas.style.display = 'none';
            }
            
                      
            switch (subtema) {
                case 'Superficie de la Unidad Territorial':
                    distribucionTerritorial.cargarCurvasNivel();
                    break; 
                
                case 'Perfil Altimétrico':
                    distribucionTerritorial.activarPerfilAltimétrico();
                    break;
            }

            return; // Salir para evitar ejecutar código adicional

        }

        else if(categoria === 'Composición Poblacional'){

            //Instanciamos la clase
            const poblacion = new Poblacion();
            mapaCalorTema = subtema;

            switch (subtema) {
                
                case 'Población Total':

                    //Funcion de la clase
                    poblacion.mapaPobTotal();
                    break;
                
                case 'Población Femenina':

                    //Funcion de la clase
                    poblacion.mapaPobFem();
                    break;  
                    
                case 'Población Masculina':

                    //Funcion de la clase
                    poblacion.mapaPobMasc();
                    break;
                
                case 'Personas de 3 años y más':

                    //Funcion de la clase
                    poblacion.mapa3mas();
                    break;

                case 'Personas de 5 años y más':

                    //Funcion de la clase
                    poblacion.mapa5mas();
                    break;

                case 'Personas de 12 años y más':

                    //Funcion de la clase
                    poblacion.mapa12mas();
                    break;

                case 'Personas de 18 años y más':

                    //Funcion de la clase
                    poblacion.mapa18mas();
                    break;
            
                case 'Personas de 0 a 14 años de edad':

                    //Funcion de la clase
                    poblacion.mapa0_14();
                    break;

                case 'Personas de 15 a 64 años de edad':

                    //Funcion de la clase
                    poblacion.mapa15a64();
                    break;

                case 'Personas de 65 a 130 años de edad':

                    //Funcion de la clase
                    poblacion.mapa65mas();
                    break;

                default:
                    
                    break; 

            }                           

        }

        else if(categoria === 'Migración'){

            //Insatanciamos la clase
            const migracion = new Migracion();
            mapaCalorTema = subtema;

            switch (subtema){

                case 'Población nacida en otra entidad':
                    migracion.mapaPobOtraEnti();
                    break;
                
                case 'Población de 5 años y más residente en otra entidad en marzo de 2015':
                    migracion.mapaPob5años();
                    break;

                case 'Población masculina de 5 años y más residente en otra entidad en marzo de 2015':
                    migracion.mapaPobMasc5añosOtraEn();
                    break;

            }            

        }

        else if(categoria === 'Discapacidad'){

            //Instanciamos la clase
            const discapacidad = new Discapacidad();
            mapaCalorTema = subtema;

            switch(subtema){
                case 'Población con Discapacidad':
                    discapacidad.mapaPobDiscapa();
                    break;

                case 'Población con discapacidad para caminar, subir o bajar':
                    discapacidad.mapaPobDiscapaCaminSubirBajar();
                    break;

                case 'Población con discapacidad para ver, aún usando lentes':
                    discapacidad.mapaPobDiscVerAunLentes();
                    break;
                
                case 'Población con discapacidad para hablar o comunicarse':
                    discapacidad.mapaPobDiscHablaComuni();
                    break;
                                    
                case 'Población con discapacidad para oír, aún usando aparato auditivo':
                    discapacidad.mapaPobDiscOirAunAparato();
                    break;
                
                case 'Población con discapacidad para vestirse, bañarse o comer':
                    discapacidad.mapaPobDiscVesBaCom();
                    break;

                case 'Población con discapacidad para recordar o concentrarse':
                    discapacidad.mapaPobDiscRecordConcentr();
                    break;

                case 'Población con limitación':
                    discapacidad.mapaPobLimitacion();
                    break;

                case 'Población con limitación para caminar, subir o bajar':
                    discapacidad.mapaPobLimCaminSubirBajar();
                    break;

                case 'Población con limitación para ver, aún usando lentes':
                    discapacidad.mapaPobLimVerUsanLentes();
                    break;

                case 'Población con limitación para hablar o comunicarse':
                    discapacidad.mapaPobLimHablarComuni();
                    break;

                case 'Población con limitación para oír, aún usando aparato auditivo':
                    discapacidad.mapaPobLimOirAparatoAudi();
                    break;

                case 'Población con limitación para vestirse, bañarse o comer':
                    discapacidad.mapaPobLimVestiBañarComer();
                    break;

                case 'Población con limitación para recordar o concentrarse':
                    discapacidad.mapaPobLimRecordarConcentrar();
                    break;

                case 'Población con algún problema o condición mental':
                    discapacidad.mapaPobProbCondiciMental();
                    break;

                case 'Población sin discapacidad, limitación, problema o condición mental':
                    discapacidad.mapaPobSinDiscapacidad();
                    break;


            }

        }
        
        else if(categoria === 'Etnicidad'){
            
            //Instanciamos la clase
            const etnicidad = new Etnicidad();
            mapaCalorTema = subtema;

            switch(subtema){

                case 'Población de 3 años y más que habla alguna lengua indígena':
                    etnicidad.mapaPob3masLengInd();
                    break;

                case 'Población que se considera afromexicana o afrodescendiente':
                    etnicidad.mapaPobAfroMex();
                    break;
                
                case 'Población masculina que se considera afromexicana o afrodescendiente':
                    etnicidad.mapaPobAfroMexMasc();
                    break;

            }

        }

        else if(categoria === 'Características Económicas'){
            //Instanciamos la clase
            const economicas = new CaracteristicasEconomicas();
            mapaCalorTema = subtema;
            switch(subtema){
                case 'Población económicamente activa (PEA)':
                    economicas.mapaPEA();
                    break;

                case 'Población de 12 años y más No Económicamente Activa':
                    economicas.mapaINAC();
                    break;
                case 'Población Económicamente Activa Ocupada':
                    economicas.mapaOCUP();
                    break;
                case 'Población Económicamente Activa Desocupada':
                    economicas.mapaDESOCUP();   
                    break;
                default:
            }    
        }

        else if(categoria === 'Características Educativas'){
            //Instanciamos la clase 
            const educativas = new CaracteristicasEducativas();
            mapaCalorTema = subtema;
            switch(subtema){
                case 'Población de 15 años y más sin escolaridad':
                    educativas.mapaPSESC();
                    break;
                case 'Población de 15 años y más con primaria incompleta':
                    educativas.mapaPPRIMIN();
                    break;
                case 'Población de 18 años y más con educación posbásica':
                    educativas.mapaPEDPOS();
                    break;
                default:
                    break;
            }
        }

        else if(categoria === 'Hogares Censales'){
            //Instanciamos la clase 
            const hogaresc = new HogaresCensales();
            mapaCalorTema = subtema;
            switch(subtema){
                case 'Total de hogares censales':
                    hogaresc.mapaHOGTOT();
                    break;
                case 'Hogares censales con persona de referencia mujer':
                    hogaresc.mapaHOGFEM();
                    break;
                case 'Hogares censales con persona de referencia hombre':
                    hogaresc.mapaHOGMAS();
                    break;
                default:
                    break;
            }
        }

        else if(categoria === 'Afiliación a Servicios de Salud'){
            //Instanciamos la clase 
            const salud = new Salud();
            mapaCalorTema = subtema;
            switch(subtema){
                case 'Población afiliada a servicios de salud':
                    salud.mapaPASS();
                    break;
                case 'Población sin afiliación a servicios de salud':
                    salud.mapaPSINASS();
                    break;
                default:
                    break;
            }
        }

        else if(categoria === 'Situación Conyugal'){
            //Instanciamos la clase 
            const conyugal = new SituacionConyugal();
            mapaCalorTema = subtema;
            switch(subtema){
                case 'Población soltera':
                    conyugal.mapaPSOLT();
                    break;
                case 'Población casada o unida':
                    conyugal.mapaPCAS();
                    break;
                default:
                    break;
            }
        }

        else if(categoria === 'Vivienda'){
            //Instanciamos la clase 
            const vivienda = new Vivienda();
            mapaCalorTema = subtema;
            switch(subtema){
                case 'Total de viviendas particulares habitadas':
                    vivienda.mapaTOTVIV();
                    break;

                case 'Ocupantes en viviendas particulares habitadas':
                    vivienda.mapaOCUPVIV();
                    break;

                case 'Viviendas particulares habitadas con piso de tierra':
                    vivienda.mapaVIVTIERRA();
                    break;

                case 'Viviendas particulares habitadas que disponen de energía eléctrica':
                    vivienda.mapaVIVENELC();
                    break;
                
                case 'Viviendas particulares habitadas que disponen de agua entubada en el ámbito de la vivienda':
                    vivienda.mapaVIVAGUAEN();
                    break;
                
                case 'Viviendas particulares habitadas que disponen de tinaco':
                    vivienda.mapaVIVAGUATIN();
                    break;

                case 'Viviendas particulares habitadas que disponen de cisterna o aljibe':
                    vivienda.mapaVIVCISTERN();
                    break;

                case 'Viviendas particulares habitadas que disponen de excusado o sanitario':
                    vivienda.mapaVIVSANITARIO();
                    break;

                case 'Viviendas particulares habitadas que disponen de drenaje':
                    vivienda.mapaVIVDRENAJE();
                    break;

                case 'Viviendas particulares habitadas que disponen de refrigerador':
                    vivienda.mapaVIVREFRI();
                    break;

                case 'Viviendas particulares habitadas que disponen de lavadora':
                    vivienda.mapaVIVLAVADORA();
                    break;

                case 'Viviendas particulares habitadas que disponen de automóvil o camioneta':
                    vivienda.mapaVIVAUTO();
                    break;

                case 'Viviendas particulares habitadas que disponen de motocicleta o motoneta':
                    vivienda.mapaVIVMOTO();
                    break;

                case 'Viviendas particulares habitadas que disponen de bicicleta como medio de transporte':
                    vivienda.mapaVIVBICI();
                    break;

                case 'Viviendas particulares habitadas que disponen de computadora, laptop o tablet':
                    vivienda.mapaVIVPC();
                    break;

                case 'Viviendas particulares habitadas que disponen de línea telefónica fija':
                    vivienda.mapaVIVTELEF();
                    break;

                case 'Viviendas particulares habitadas que disponen de teléfono celular':
                    vivienda.mapaVIVCELULAR();
                    break;

                case 'Viviendas particulares habitadas que disponen de Internet':
                    vivienda.mapaVIVINTERNET();
                    break;

                case 'Viviendas particulares habitadas que disponen de servicio de televisión de paga':
                    vivienda.mapaVIVSTV();
                    break;

                default:
                    break;
            }
        }

        else if(categoria === 'Información Adicional'){
            // Limpiar capas anteriores
            if (infoAdicional) {
                infoAdicional.limpiarTodasLasCapas();
            }

            // Ocultar controles de mapas para Información Adicional
            const controlesMapas = document.getElementById('controles-mapas');
            if (controlesMapas) {
                controlesMapas.style.display = 'none';
            }
            
            mapaCalorTema = subtema;
            
            switch(subtema){
                case 'Zonas de Valor Ambiental':
                    infoAdicional.cargarCapaPatrimonial('zonas_valor_ambiental');
                    break;
                case 'Línea de Conservación Ecológica':
                    infoAdicional.cargarCapaPatrimonial('linea_conservacion_ecologica');
                    break;
                case 'Área Natural Protegida':
                    infoAdicional.cargarCapaPatrimonial('area_natural_protegida');
                    break;
                case 'Área de Conservación Patrimonial':
                    infoAdicional.cargarCapaPatrimonial('zona_patrimonial');
                    break;
                case 'Autoridad de la Zona Patrimonio':
                    infoAdicional.cargarCapaPatrimonial('autoridad_zona_patrimonio');
                    break;
                case 'Áreas Verdes':
                    infoAdicional.cargarCapaPatrimonial('area_verde');
                    break;
                default:
                    break;
            }

            return; // Salir para no mostrar controles de mapas
        }

    }

    const controlesMapas = document.getElementById('controles-mapas');
    if (controlesMapas) {
        controlesMapas.style.display = 'flex';
    }
}
/*********************************************************************************
                      * CLASE DISTRIBUCIÓN TERRITORIAL  *
**********************************************************************************/

class DistribucionTerritorial {
    
    constructor() {
        // Singleton pattern
        if (distribucionTerritorial) {
            return distribucionTerritorial;
        }
        
        // Propiedades para curvas de nivel
        this.curvaNiveles = [];
        this.tooltipHTML = null;
        this.elevacionMinGlobal = 0;
        this.elevacionMaxGlobal = 100;
        
        // Propiedades para perfil altimétrico
        this.altimetriaActiva = false;
        this.puntosAltimetria = [];
        this.lineaAltimetria = null;
        this.marcadoresAltimetria = [];
        this.chartAltimetria = null;
        this.listenerAltimetria = null;
        
        // Estado actual
        this.modoActual = null;
        
        // Listener para eventos de curvas
        this.listenerCurvasClick = null;
        this.listenerCurvasMouseMove = null;
        
        distribucionTerritorial = this;
    }

    /********************************
     *    MÉTODO PRINCIPAL DE LIMPIEZA    *
     ********************************/
    limpiarTodo() {
        // 1. Limpiar curvas de nivel
        this.limpiarCurvasDeNivel();
        
        // 2. Limpiar perfil altimétrico
        this.limpiarPerfilAltimétrico();
        
        // 3. Limpiar todas las leyendas
        this.limpiarTodasLasLeyendas();
        
        // 4. Restaurar estado del mapa
        this.restaurarEstadoMapa();
        
        // 5. Resetear modo actual
        this.modoActual = null;
    }

    /********************************
     *    LIMPIEZA DE CURVAS DE NIVEL MEJORADA    *
     ********************************/
    limpiarCurvasDeNivel() {
        // Limpiar tooltip HTML
        this.ocultarTooltipHTML();
        
        // Remover listeners de eventos
        if (this.listenerCurvasClick) {
            google.maps.event.removeListener(this.listenerCurvasClick);
            this.listenerCurvasClick = null;
        }
        if (this.listenerCurvasMouseMove) {
            google.maps.event.removeListener(this.listenerCurvasMouseMove);
            this.listenerCurvasMouseMove = null;
        }
        
        // Limpiar polylines de neón
        if (this.curvaNiveles && Array.isArray(this.curvaNiveles)) {
            this.curvaNiveles.forEach((elemento) => {
                try {
                    if (elemento.setMap) {
                        elemento.setMap(null);
                    }
                } catch (error) {}
            });
        }
        
        // Limpiar features del data layer que sean curvas
        staticMap.data.forEach((feature) => {
            if (feature.getProperty('elevacion')) {
                staticMap.data.remove(feature);
            }
        });
        
        this.curvaNiveles = [];
    }

    /********************************
     *    LIMPIEZA DE PERFIL ALTIMÉTRICO    *
     ********************************/
    limpiarPerfilAltimétrico() {
        // 1. Remover listener del mapa
        if (this.listenerAltimetria) {
            google.maps.event.removeListener(this.listenerAltimetria);
            this.listenerAltimetria = null;
        }
        
        // 2. Limpiar marcadores
        if (this.marcadoresAltimetria && this.marcadoresAltimetria.length > 0) {
            this.marcadoresAltimetria.forEach(marcador => {
                google.maps.event.clearInstanceListeners(marcador);
                marcador.setMap(null);
            });
            this.marcadoresAltimetria = [];
        }
        
        // 3. Limpiar línea
        if (this.lineaAltimetria) {
            google.maps.event.clearInstanceListeners(this.lineaAltimetria);
            this.lineaAltimetria.setMap(null);
            this.lineaAltimetria = null;
        }
        
        // 4. Destruir gráfico
        if (this.chartAltimetria) {
            try {
                this.chartAltimetria.destroy();
                this.chartAltimetria = null;
            } catch (error) {}
        }
        
        // 5. Remover contenedor
        const contenedor = document.getElementById('altimetria-container');
        if (contenedor) {
            contenedor.remove();
        }
        
        // 6. Remover instrucciones
        const instrucciones = document.getElementById('instrucciones-altimetria');
        if (instrucciones) {
            instrucciones.remove();
        }
        
        // 7. Resetear estado
        this.altimetriaActiva = false;
        this.puntosAltimetria = [];
    }

    /********************************
     *    LIMPIEZA DE LEYENDAS    *
     ********************************/
    limpiarTodasLasLeyendas() {
        const leyendasIds = [
            'leyenda-curvas',
            'leyenda-mapa-calor',
            'leyenda-elevacion',
            'leyenda-tematica',
            'info-superficie-ut'
        ];
        
        leyendasIds.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.remove();
            }
        });
    }

    /********************************
     *    RESTAURAR ESTADO DEL MAPA    *
     ********************************/
    restaurarEstadoMapa() {
        if (staticMap) {
            // Restaurar tipo de mapa
            staticMap.setMapTypeId('roadmap');
            
            // Restaurar cursor
            staticMap.setOptions({ 
                draggableCursor: 'grab',
                clickableIcons: true
            });
            
            // Restaurar estilo de datos
            staticMap.data.setStyle({
                fillColor: 'rgba(255, 255, 255, 0)',
                fillOpacity: 0.5,
                strokeColor: 'black',
                strokeWeight: 5,
                clickable: true
            });
        }
    }

    /********************************
                *GRAFICAS*
    ********************************/    

    async graficaPorcentajesup(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_sup1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_sup1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_sup1',
                titulo: '% Superficie de la UT respecto a la Demarcación Territorial'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    

    /********************************
     *    CARGAR CURVAS DE NIVEL DIRECTAMENTE    *
     ********************************/
    async cargarCurvasNivel() {
        // Limpiar todo antes de empezar
        this.limpiarTodo();
        
        // Establecer modo actual
        this.modoActual = 'curvas';
        
        // Cambiar a mapa normal
        staticMap.setMapTypeId('roadmap');
        
        try {
            const cve_UT = clave;
            const response = await fetchFromApi(`filter/curvas_uts?cve_ut=${cve_UT}&elev`, {});
            
            if (!response.features || response.features.length === 0) {
                alert('No se encontraron curvas de nivel para esta UT');
                return;
            }
            
            this.curvaNiveles = [];
            const curvas = response.features;
            
            // Calcular rango de elevaciones
            const elevaciones = curvas
                .map(curva => {
                    let elev = curva.properties.elev;
                    return typeof elev === 'string' ? parseFloat(elev) : elev;
                })
                .filter(elev => elev !== null && !isNaN(elev))
                .sort((a, b) => a - b);
            
            if (elevaciones.length === 0) {
                alert('No se encontraron datos válidos de elevación');
                return;
            }
            
            const elevacionMin = elevaciones[0];
            const elevacionMax = elevaciones[elevaciones.length - 1];
            
            this.elevacionMinGlobal = elevacionMin;
            this.elevacionMaxGlobal = elevacionMax;
            
            console.log(`Cargando curvas: ${curvas.length} curvas, elevación ${elevacionMin}m - ${elevacionMax}m`);
            
            // Preparar GeoJSON
            const curvasGeoJSON = {
                type: "FeatureCollection",
                features: curvas.map(curva => ({
                    type: "Feature",
                    geometry: curva.geometry,
                    properties: {
                        ...curva.properties,
                        elevacion: typeof curva.properties.elev === 'string' ? 
                                parseFloat(curva.properties.elev) : curva.properties.elev
                    }
                }))
            };

            // Cargar GeoJSON
            const featuresCreadas = staticMap.data.addGeoJson(curvasGeoJSON);

            // Estilizar features
            staticMap.data.setStyle((feature) => {
                const elevacion = feature.getProperty('elevacion');
                
                // Si NO tiene elevación, es el polígono UT
                if (isNaN(elevacion) || elevacion === null || elevacion === undefined) {
                    return {
                        fillColor: 'transparent',
                        fillOpacity: 0,
                        strokeColor: 'black',
                        strokeWeight: 5,
                        strokeOpacity: 1,
                        zIndex: 1000,
                        clickable: false // No clickable el polígono
                    };
                }
                
                // Si SÍ tiene elevación, es curva
                const estiloCurva = this.obtenerEstiloPorElevacion(
                    elevacion, 
                    elevacionMin, 
                    elevacionMax
                );
                
                // Crear efecto neón SOLO visual
                this.crearEfectoNeonParaFeature(feature, estiloCurva);
                
                return {
                    strokeColor: estiloCurva.color,
                    strokeOpacity: estiloCurva.opacity,
                    strokeWeight: estiloCurva.weight,
                    zIndex: 100, // Z-index alto para curva principal
                    clickable: true // IMPORTANTE: hacer clickable la curva principal
                };
            });
            
            // Guardar referencias
            this.curvaNiveles = [...this.curvaNiveles, ...featuresCreadas];

            // Configurar eventos
            this.configurarEventosCurvas();

            // Crear leyenda
            this.crearLeyendaCurvasNivel(elevacionMin, elevacionMax);

            //Cargar info superficie
            this.crearInfoSuperficie();
            
            console.log('Curvas de nivel cargadas correctamente');
            
        } catch (error) {
            console.error('Error cargando curvas:', error);
            alert('Error al cargar curvas de nivel: ' + error.message);
        }
    }

    /********************************
     *    CONFIGURAR EVENTOS DE CURVAS MEJORADO    *
     ********************************/
    configurarEventosCurvas() {
        const self = this;
        
        console.log('Configurando eventos de curvas con hover...');
        
        // Evento mouseover - mostrar tooltip SIN resaltar
        staticMap.data.addListener('mouseover', function(event) {
            const feature = event.feature;
            const elevacion = feature.getProperty('elevacion');
            
            if (!isNaN(elevacion) && elevacion !== null) {
                const estilo = self.obtenerEstiloPorElevacion(
                    elevacion, 
                    self.elevacionMinGlobal, 
                    self.elevacionMaxGlobal
                );
                
                // Solo mostrar tooltip, sin cambiar estilo
                self.mostrarTooltipHTML(event.latLng, elevacion, estilo.clasificacion, event);
            }
        });
        
        // Evento mousemove - actualizar posición del tooltip
        staticMap.data.addListener('mousemove', function(event) {
            const feature = event.feature;
            const elevacion = feature.getProperty('elevacion');
            
            if (!isNaN(elevacion) && elevacion !== null && self.tooltipHTML) {
                self.actualizarPosicionTooltip(event);
            }
        });
        
        // Evento mouseout - solo ocultar tooltip
        staticMap.data.addListener('mouseout', function(event) {
            self.ocultarTooltipHTML();
        });
        
        console.log('Eventos de curvas configurados para hover');
    }
    /********************************
     *    MOSTRAR TOOLTIP HTML MEJORADO    *
     ********************************/
    async obtenerAreaUT() {
        try {
            const cve_UT = clave; // Variable global que ya tienes
            const response = await fetchFromApi(`filter/indices_mgpc?clave_ut=${cve_UT}&area_ut`, {});
            
            if (response.features && response.features.length > 0) {
                const area = response.features[0].properties.area_ut;
                // Convertir a hectáreas o km² según prefieras
                const areaHectareas = (area / 10000).toFixed(2);
                const areaKm2 = (area / 1000000).toFixed(3);
                
                return {
                    metros: area,
                    hectareas: areaHectareas,
                    km2: areaKm2
                };
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo área de UT:', error);
            return null;
        }
    }
    async crearInfoSuperficie() {
        const areaData = await this.obtenerAreaUT();
        
        if (!areaData) return;
        
        // Remover div anterior si existe
        const divAnterior = document.getElementById('info-superficie-ut');
        if (divAnterior) {
            divAnterior.remove();
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.id = 'info-superficie-ut';
        infoDiv.style.cssText = `
            position: absolute;
            bottom: 320px;  /* Arriba de la leyenda de curvas */
            left: 330px;
            background: white;
            border: 2px solid #2E7D32;
            border-radius: 8px;
            padding: 10px 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: 'Poppins', sans-serif;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
            animation: slideInLeft 0.3s ease-out;
        `;
        
        infoDiv.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                padding-bottom: 6px;
                border-bottom: 1px solid #e0e0e0;
            ">
                <span style="font-size: 18px; margin-right: 8px;"></span>
                <strong style="color: #2E7D32; font-size: 13px;">Superficie de la UT</strong>
            </div>
            <div style="margin: 4px 0;">
                <strong>${areaData.km2}</strong> km²
            </div>
            <div style="margin: 4px 0; color: #666; font-size: 11px;">
                ${areaData.hectareas} hectáreas
            </div>
            <div style="margin: 4px 0; color: #888; font-size: 10px;">
                ${parseInt(areaData.metros).toLocaleString('es-MX')} m²
            </div>
        `;
        
        document.getElementById('map').appendChild(infoDiv);
    }
    mostrarTooltipHTML(latLng, elevacion, clasificacion, event) {
        console.log('Mostrando tooltip - Elevación:', elevacion, 'Clasificación:', clasificacion);
        
        // Limpiar tooltip anterior
        this.ocultarTooltipHTML();

        // Obtener estilo para colores
        const estilo = this.obtenerEstiloPorElevacion(
            elevacion, 
            this.elevacionMinGlobal, 
            this.elevacionMaxGlobal
        );

        // Crear tooltip HTML
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip-curva-personalizado';
        
        // Aplicar estilos inline para mayor prioridad
        tooltip.style.cssText = `
            position: fixed !important;
            font-family: 'Poppins', sans-serif;
            font-size: 12px;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.98);
            border: 3px solid ${estilo.color};
            border-radius: 10px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.3);
            z-index: 9999999 !important;
            pointer-events: none;
            max-width: 200px;
            color: #333;
            line-height: 1.4;
            backdrop-filter: blur(5px);
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;

        tooltip.innerHTML = `
            <div style="
                color: ${estilo.color}; 
                font-weight: bold; 
                margin-bottom: 6px; 
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <div style="
                    width: 14px; 
                    height: ${estilo.weight + 1}px; 
                    background-color: ${estilo.color};
                    border-radius: 2px;
                    opacity: ${estilo.opacity};
                "></div>
                🗻 Curva de Nivel
            </div>
            
            <div style="
                margin-bottom: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span style="font-weight: 600; color: #666;">Elevación:</span> 
                <span style="
                    color: ${estilo.color}; 
                    font-weight: bold;
                    background: rgba(${this.hexToRgb(estilo.color).r}, ${this.hexToRgb(estilo.color).g}, ${this.hexToRgb(estilo.color).b}, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                ">${elevacion}m</span>
            </div>
            
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span style="font-weight: 600; color: #666;">Nivel:</span> 
                <span style="
                    color: ${estilo.color}; 
                    font-weight: bold;
                    background: rgba(${this.hexToRgb(estilo.color).r}, ${this.hexToRgb(estilo.color).g}, ${this.hexToRgb(estilo.color).b}, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                ">${clasificacion}</span>
            </div>
        `;

        // Posicionar usando coordenadas del mouse
        if (event && event.domEvent) {
            const mouseX = event.domEvent.clientX || event.domEvent.pageX;
            const mouseY = event.domEvent.clientY || event.domEvent.pageY;
            
            tooltip.style.left = (mouseX + 15) + 'px';
            tooltip.style.top = (mouseY - 40) + 'px';
        } else {
            // Posición por defecto
            const projection = staticMap.getProjection();
            const point = projection.fromLatLngToPoint(latLng);
            const scale = Math.pow(2, staticMap.getZoom());
            const worldCoordinate = new google.maps.Point(point.x * scale, point.y * scale);
            const pixelCoordinate = worldCoordinate;
            
            tooltip.style.left = '50%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        }

        // Agregar al body con máxima prioridad
        document.body.appendChild(tooltip);
        
        // Forzar render
        tooltip.offsetHeight;
        
        // Guardar referencia
        this.tooltipHTML = tooltip;
        
        console.log('Tooltip HTML creado y mostrado');
    }

    /**
     * Actualizar posición del tooltip siguiendo el mouse
     */
    actualizarPosicionTooltip(event) {
        if (this.tooltipHTML && event && event.domEvent) {
            const mouseX = event.domEvent.clientX || event.domEvent.pageX;
            const mouseY = event.domEvent.clientY || event.domEvent.pageY;
            
            if (mouseX && mouseY) {
                this.tooltipHTML.style.left = (mouseX + 15) + 'px';
                this.tooltipHTML.style.top = (mouseY - 40) + 'px';
            }
        }
    }

    /**
     * Ocultar tooltip HTML
     */
    ocultarTooltipHTML() {
        if (this.tooltipHTML) {
            if (this.tooltipHTML.parentNode) {
                this.tooltipHTML.parentNode.removeChild(this.tooltipHTML);
            }
            this.tooltipHTML = null;
        }
        
        // También buscar por ID por seguridad
        const tooltipPorId = document.getElementById('tooltip-curva-personalizado');
        if (tooltipPorId) {
            tooltipPorId.remove();
        }
    }

    /********************************
     *    CREAR EFECTO NEÓN MEJORADO    *
     ********************************/
    crearEfectoNeonParaFeature(feature, estilo) {
        const colorBase = estilo.color;
        const rgb = this.hexToRgb(colorBase);
        
        // Procesar geometría
        const geometry = feature.getGeometry();
        
        if (geometry.getType() === 'MultiLineString') {
            geometry.getArray().forEach(lineString => {
                const paths = lineString.getArray();
                if (paths.length > 1) {
                    this.crearCapasNeonParaPath(paths, estilo, rgb);
                }
            });
        } else if (geometry.getType() === 'LineString') {
            const paths = geometry.getArray();
            if (paths.length > 1) {
                this.crearCapasNeonParaPath(paths, estilo, rgb);
            }
        }
    }

    crearCapasNeonParaPath(paths, estilo, rgb) {
        // Reducir número de capas neón para mejor rendimiento
        const capasNeon = [
            { weight: estilo.weight + 30, opacity: 0.02 },
            { weight: estilo.weight + 20, opacity: 0.04 },
            { weight: estilo.weight + 12, opacity: 0.06 },
            { weight: estilo.weight + 6, opacity: 0.08 }
        ];
        
        capasNeon.forEach((capa, index) => {
            const lineaNeon = new google.maps.Polyline({
                path: paths,
                geodesic: false,
                strokeColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${capa.opacity})`,
                strokeOpacity: 1,
                strokeWeight: capa.weight,
                zIndex: 10 + index, // Z-index bajo para estar detrás
                clickable: false, // IMPORTANTE: no clickable para no bloquear eventos
                map: staticMap
            });
            
            this.curvaNiveles.push(lineaNeon);
        });
    }

    /********************************
     *    OBTENER ESTILO POR ELEVACIÓN    *
     ********************************/
    obtenerEstiloPorElevacion(elevacion, min, max) {
        const rango = max - min;
        const porcentaje = rango > 0 ? (elevacion - min) / rango : 0.5;
        
        let clasificacion, color, weight, opacity;
        
        if (porcentaje <= 0.2) {
            clasificacion = 'Muy Bajo';
            color = '#2E7D32';
            weight = 2;
            opacity = 0.7;
        } else if (porcentaje <= 0.4) {
            clasificacion = 'Bajo';
            color = '#689F38';
            weight = 3;
            opacity = 0.75;
        } else if (porcentaje <= 0.6) {
            clasificacion = 'Medio';
            color = '#FBC02D';
            weight = 3;
            opacity = 0.8;
        } else if (porcentaje <= 0.8) {
            clasificacion = 'Alto';
            color = '#FF8F00';
            weight = 4;
            opacity = 0.85;
        } else {
            clasificacion = 'Muy Alto';
            color = '#5D4037';
            weight = 5;
            opacity = 0.9;
        }

        return {
            color: color,
            weight: weight,
            opacity: opacity,
            clasificacion: clasificacion
        };
    }

    /**
     * Función auxiliar para convertir hex a RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }

    /********************************
     *    CREAR LEYENDA CURVAS DE NIVEL    *
     ********************************/
    crearLeyendaCurvasNivel(elevacionMin, elevacionMax) {
        // Remover leyenda anterior
        const leyendaAnterior = document.getElementById('leyenda-curvas');
        if (leyendaAnterior) {
            leyendaAnterior.remove();
        }

        const leyenda = document.createElement('div');
        leyenda.id = 'leyenda-curvas';
        leyenda.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 330px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: 'Poppins', sans-serif;
            font-size: 11px;
            z-index: 1000;
            max-width: 200px;
            border-left: 4px solid #5D4037;
        `;

        const titulo = document.createElement('div');
        titulo.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            text-align: center;
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
        `;
        titulo.textContent = 'Curvas de Nivel';

        leyenda.appendChild(titulo);

        // Información del rango
        const infoRango = document.createElement('div');
        infoRango.style.cssText = `
            margin-bottom: 10px;
            padding: 5px;
            background: #f5f5f5;
            border-radius: 4px;
            text-align: center;
        `;
        infoRango.innerHTML = `
            <strong>Rango:</strong> ${Math.round(elevacionMin)}m - ${Math.round(elevacionMax)}m
        `;
        leyenda.appendChild(infoRango);

        // Calcular rangos
        const rango = elevacionMax - elevacionMin;
        const rangos = [
            { 
                nivel: 'Muy Alto', 
                color: '#5D4037', 
                weight: 5,
                rango: `${Math.round(elevacionMin + rango * 0.8)} - ${Math.round(elevacionMax)}m`
            },
            { 
                nivel: 'Alto', 
                color: '#FF8F00', 
                weight: 4,
                rango: `${Math.round(elevacionMin + rango * 0.6)} - ${Math.round(elevacionMin + rango * 0.8)}m`
            },
            { 
                nivel: 'Medio', 
                color: '#FBC02D', 
                weight: 3,
                rango: `${Math.round(elevacionMin + rango * 0.4)} - ${Math.round(elevacionMin + rango * 0.6)}m`
            },
            { 
                nivel: 'Bajo', 
                color: '#689F38', 
                weight: 3,
                rango: `${Math.round(elevacionMin + rango * 0.2)} - ${Math.round(elevacionMin + rango * 0.4)}m`
            },
            { 
                nivel: 'Muy Bajo', 
                color: '#2E7D32', 
                weight: 2,
                rango: `${Math.round(elevacionMin)} - ${Math.round(elevacionMin + rango * 0.2)}m`
            }
        ];

        rangos.forEach(item => {
            const elemento = document.createElement('div');
            elemento.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                padding: 3px 0;
                cursor: pointer;
                transition: background 0.2s;
            `;
            
            // Hover effect
            elemento.onmouseover = () => {
                elemento.style.background = '#f0f0f0';
            };
            elemento.onmouseout = () => {
                elemento.style.background = 'transparent';
            };

            const linea = document.createElement('div');
            linea.style.cssText = `
                width: 25px;
                height: ${item.weight}px;
                background-color: ${item.color};
                margin-right: 10px;
                border-radius: 1px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            `;

            const texto = document.createElement('div');
            texto.style.cssText = `
                font-size: 11px;
                color: #555;
                line-height: 1.3;
            `;
            texto.innerHTML = `<strong style="color: ${item.color};">${item.nivel}</strong><br>${item.rango}`;

            elemento.appendChild(linea);
            elemento.appendChild(texto);
            leyenda.appendChild(elemento);
        });

        document.getElementById('map').appendChild(leyenda);
    }

    /********************************
     *    ACTIVAR PERFIL ALTIMÉTRICO    *
     ********************************/
    activarPerfilAltimétrico() {
        
        // Limpiar todo antes de empezar
        this.limpiarTodo();
        
        // Establecer modo actual
        this.modoActual = 'perfil';
        
        // Configurar mapa para altimetría
        staticMap.setMapTypeId('roadmap');
        staticMap.setOptions({ 
            draggableCursor: 'crosshair',
            clickableIcons: false
        });
        
        // Deshabilitar interacción con polígonos
        staticMap.data.setStyle({
            fillColor: 'rgba(255, 255, 255, 0)',
            fillOpacity: 0.3,
            strokeColor: 'black',
            strokeWeight: 3,
            clickable: false,
            zIndex: 0
        });
        
        // Activar modo
        this.altimetriaActiva = true;
        this.puntosAltimetria = [];
        
        // Agregar listener
        this.listenerAltimetria = google.maps.event.addListener(staticMap, 'click', (event) => {
            event.stop && event.stop();
            this.agregarPuntoAltimetria(event.latLng);
        });
        
        // Mostrar instrucciones
        this.mostrarInstruccionesAltimetria();
    }

    obtenerEstiloPorElevacion(elevacion, min, max) {
        const rango = max - min;
        const porcentaje = rango > 0 ? (elevacion - min) / rango : 0.5;
        
        // Clasificar en 5 niveles
        let clasificacion, color, weight, opacity;
        
        if (porcentaje <= 0.2) {
            // Muy Bajo (0-20%)
            clasificacion = 'Muy Bajo';
            color = '#2E7D32'; // Verde oscuro
            weight = 1;
            opacity = 0.7;
        } else if (porcentaje <= 0.4) {
            // Bajo (20-40%)
            clasificacion = 'Bajo';
            color = '#689F38'; // Verde claro
            weight = 2;
            opacity = 0.75;
        } else if (porcentaje <= 0.6) {
            // Medio (40-60%)
            clasificacion = 'Medio';
            color = '#FBC02D'; // Amarillo
            weight = 2;
            opacity = 0.8;
        } else if (porcentaje <= 0.8) {
            // Alto (60-80%)
            clasificacion = 'Alto';
            color = '#FF8F00'; // Naranja
            weight = 3;
            opacity = 0.85;
        } else {
            // Muy Alto (80-100%)
            clasificacion = 'Muy Alto';
            color = '#5D4037'; // Marrón
            weight = 4;
            opacity = 0.9;
        }

        return {
            color: color,
            weight: weight,
            opacity: opacity,
            clasificacion: clasificacion
        };
    }

    agregarEventosCurva(lineaCurva) {
        // Guardar referencia de la instancia
        const self = this;
        
        // Evento mouseover
        google.maps.event.addListener(lineaCurva, 'mouseover', function(event) {
            const elevacion = this.get('elevacion');
            const clasificacion = this.get('clasificacion');
            const pesoOriginal = this.get('strokeWeight');
            
            this.setOptions({
                strokeWeight: pesoOriginal + 2,
                strokeOpacity: 1.0,
                zIndex: 1000
            });
            
            self.mostrarTooltipCurva(event.latLng, elevacion, clasificacion);
        });

        // Evento mouseout
        google.maps.event.addListener(lineaCurva, 'mouseout', function() {
            const elevacion = this.get('elevacion');
            
            // Calcular estilo original
            const estiloOriginal = self.obtenerEstiloPorElevacion(
                elevacion, 
                self.elevacionMinGlobal || 0, 
                self.elevacionMaxGlobal || 100
            );
            
            this.setOptions({
                strokeWeight: estiloOriginal.weight,
                strokeOpacity: estiloOriginal.opacity,
                zIndex: 10
            });
            
            self.ocultarTooltipHTML();
        });
    }

    mostrarTooltipCurva(posicion, elevacion, clasificacion) {
        if (this.tooltipCurva) {
            this.tooltipCurva.close();
        }

        const contenido = `
            <div style="
                font-family: 'Poppins', sans-serif; 
                font-size: 12px; 
                padding: 6px; 
                text-align: center;
                white-space: nowrap;
            ">
                <strong>Curva de Nivel</strong><br>
                <strong>Elevación:</strong> ${elevacion}m s.n.m.<br>
                <strong>Nivel:</strong> ${clasificacion}
            </div>
        `;

        this.tooltipCurva = new google.maps.InfoWindow({
            content: contenido,
            position: posicion,
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(0, -10),
            headerDisabled: true,
            closeOnClick: false
        });

        this.tooltipCurva.open(staticMap);
    }

    ocultarTooltipCurva() {
        if (this.tooltipCurva) {
            this.tooltipCurva.close();
            this.tooltipCurva = null;
        }
    }

    crearLeyendaMapaCalor(elevacionMin, elevacionMax) {
        // Remover leyenda anterior si existe
        const leyendaAnterior = document.getElementById('leyenda-mapa-calor');
        if (leyendaAnterior) {
            leyendaAnterior.remove();
        }

        const leyenda = document.createElement('div');
        leyenda.id = 'leyenda-mapa-calor';
        leyenda.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 200px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: 'Poppins', sans-serif;
            font-size: 11px;
            z-index: 1000;
            max-width: 200px;
            border-left: 4px solid #FF8F00;
        `;

        const titulo = document.createElement('div');
        titulo.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            text-align: center;
            font-size: 12px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
        `;
        titulo.textContent = 'Densidad de Elevación';

        leyenda.appendChild(titulo);

        // Crear gradiente visual
        const gradienteVisual = document.createElement('div');
        gradienteVisual.style.cssText = `
            width: 100%;
            height: 20px;
            background: linear-gradient(to right, 
                rgba(46, 125, 50, 0.8), 
                rgba(104, 159, 56, 0.8), 
                rgba(251, 192, 45, 0.8), 
                rgba(255, 143, 0, 0.9), 
                rgba(93, 64, 55, 1.0)
            );
            border-radius: 10px;
            margin: 8px 0;
            border: 1px solid #ddd;
        `;

        leyenda.appendChild(gradienteVisual);

        // Etiquetas de valores
        const etiquetas = document.createElement('div');
        etiquetas.style.cssText = `
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #666;
            margin-bottom: 8px;
        `;

        const etiquetaMin = document.createElement('span');
        etiquetaMin.textContent = `${Math.round(elevacionMin)}m`;
        etiquetaMin.style.fontWeight = 'bold';

        const etiquetaMax = document.createElement('span');
        etiquetaMax.textContent = `${Math.round(elevacionMax)}m`;
        etiquetaMax.style.fontWeight = 'bold';

        etiquetas.appendChild(etiquetaMin);
        etiquetas.appendChild(etiquetaMax);
        leyenda.appendChild(etiquetas);

        // Calcular rangos y crear elementos descriptivos
        const rango = elevacionMax - elevacionMin;
        const rangosDescriptivos = [
            { 
                color: '#5D4037', 
                nivel: 'Muy Alto', 
                rango: `${Math.round(elevacionMin + rango * 0.8)} - ${Math.round(elevacionMax)}m`
            },
            { 
                color: '#FF8F00', 
                nivel: 'Alto', 
                rango: `${Math.round(elevacionMin + rango * 0.6)} - ${Math.round(elevacionMin + rango * 0.8)}m`
            },
            { 
                color: '#FBC02D', 
                nivel: 'Medio', 
                rango: `${Math.round(elevacionMin + rango * 0.4)} - ${Math.round(elevacionMin + rango * 0.6)}m`
            },
            { 
                color: '#689F38', 
                nivel: 'Bajo', 
                rango: `${Math.round(elevacionMin + rango * 0.2)} - ${Math.round(elevacionMin + rango * 0.4)}m`
            },
            { 
                color: '#2E7D32', 
                nivel: 'Muy Bajo', 
                rango: `${Math.round(elevacionMin)} - ${Math.round(elevacionMin + rango * 0.2)}m`
            }
        ];

        rangosDescriptivos.forEach(item => {
            const elemento = document.createElement('div');
            elemento.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 4px;
                padding: 2px 0;
            `;

            const circulo = document.createElement('div');
            circulo.style.cssText = `
                width: 12px;
                height: 12px;
                background-color: ${item.color};
                border-radius: 50%;
                margin-right: 8px;
                border: 1px solid rgba(0,0,0,0.2);
            `;

            const texto = document.createElement('div');
            texto.style.cssText = `
                font-size: 10px;
                color: #555;
                line-height: 1.3;
            `;
            texto.innerHTML = `<strong>${item.nivel}:</strong> ${item.rango}`;

            elemento.appendChild(circulo);
            elemento.appendChild(texto);
            leyenda.appendChild(elemento);
        });

        document.getElementById('map').appendChild(leyenda);
    }

    crearLeyendaCurvasNivel(elevacionMin, elevacionMax) {
        // Remover leyenda anterior si existe
        const leyendaAnterior = document.getElementById('leyenda-curvas');
        if (leyendaAnterior) {
            leyendaAnterior.remove();
        }

        const leyenda = document.createElement('div');
        leyenda.id = 'leyenda-curvas';
        leyenda.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 330px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: 'Poppins', sans-serif;
            font-size: 11px;
            z-index: 1000;
            max-width: 180px;
            border-left: 4px solid #5D4037;
        `;

        const titulo = document.createElement('div');
        titulo.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            text-align: center;
            font-size: 17px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
        `;
        titulo.textContent = 'Curvas de Nivel';

        leyenda.appendChild(titulo);

        // Calcular rangos
        const rango = elevacionMax - elevacionMin;
        const rangos = [
            { 
                nivel: 'Muy Alto', 
                color: '#5D4037', 
                weight: 4,
                rango: `${Math.round(elevacionMin + rango * 0.8)} - ${Math.round(elevacionMax)}m`
            },
            { 
                nivel: 'Alto', 
                color: '#FF8F00', 
                weight: 3,
                rango: `${Math.round(elevacionMin + rango * 0.6)} - ${Math.round(elevacionMin + rango * 0.8)}m`
            },
            { 
                nivel: 'Medio', 
                color: '#FBC02D', 
                weight: 2,
                rango: `${Math.round(elevacionMin + rango * 0.4)} - ${Math.round(elevacionMin + rango * 0.6)}m`
            },
            { 
                nivel: 'Bajo', 
                color: '#689F38', 
                weight: 2,
                rango: `${Math.round(elevacionMin + rango * 0.2)} - ${Math.round(elevacionMin + rango * 0.4)}m`
            },
            { 
                nivel: 'Muy Bajo', 
                color: '#2E7D32', 
                weight: 1,
                rango: `${Math.round(elevacionMin)} - ${Math.round(elevacionMin + rango * 0.2)}m`
            }
        ];

        rangos.forEach(item => {
            const elemento = document.createElement('div');
            elemento.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                padding: 2px 0;
            `;

            const linea = document.createElement('div');
            linea.style.cssText = `
                width: 25px;
                height: ${item.weight}px;
                background-color: ${item.color};
                margin-right: 8px;
                border-radius: 1px;
            `;

            const texto = document.createElement('div');
            texto.style.cssText = `
                font-size: 15px;
                color: #555;
                line-height: 1.2;
            `;
            texto.innerHTML = `<strong>${item.nivel}</strong><br>${item.rango}`;

            elemento.appendChild(linea);
            elemento.appendChild(texto);
            leyenda.appendChild(elemento);
        });

        document.getElementById('map').appendChild(leyenda);
    }

    agregarPuntoAltimetria(latLng) {
        console.log(`Agregando punto ${this.puntosAltimetria.length + 1}:`, latLng.toString());
        
        if (this.puntosAltimetria.length >= 2) {
            // Reiniciar si ya hay 2 puntos - LIMPIAR SOLO PUNTOS, NO RESETEAR CURSOR
            this.limpiarPuntosAltimetria();
        }

        this.puntosAltimetria.push(latLng);

        // Crear marcador con mayor z-index
        const marcador = new google.maps.Marker({
            position: latLng,
            map: staticMap,
            title: `Punto ${this.puntosAltimetria.length}`,
            zIndex: 1000, // Z-index alto para estar encima de todo
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="14" cy="14" r="12" fill="${this.puntosAltimetria.length === 1 ? '#ff0000' : '#0000ff'}" stroke="#fff" stroke-width="3"/>
                        <text x="14" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${this.puntosAltimetria.length}</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(28, 28)
            }
        });

        this.marcadoresAltimetria.push(marcador);

        if (this.puntosAltimetria.length === 2) {
            this.crearLineaAltimetria();
            this.calcularPerfilAltimétrico();
        }
    }

    crearLineaAltimetria() {
        // Crear línea entre puntos con z-index alto
        this.lineaAltimetria = new google.maps.Polyline({
            path: this.puntosAltimetria,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 4,
            zIndex: 999 // Alto z-index
        });

        this.lineaAltimetria.setMap(staticMap);
    }

    async calcularPerfilAltimétrico() {
        try {
            console.log('Calculando perfil altimétrico con Google ElevationService...');

            const punto1 = this.puntosAltimetria[0];
            const punto2 = this.puntosAltimetria[1];

            // Mostrar indicador de carga
            this.mostrarIndicadorCarga();

            // Usar Google ElevationService
            const perfilDatos = await this.obtenerDatosAltimetriaGoogle(punto1, punto2);
            
            this.mostrarGraficoAltimetria(perfilDatos);

        } catch (error) {
            console.error('Error al calcular perfil altimétrico:', error);
            alert('Error al obtener datos de elevación: ' + error.message);
        }
    }

    async obtenerDatosAltimetriaGoogle(punto1, punto2) {
        return new Promise((resolve, reject) => {
            // Crear servicio de elevación de Google
            const elevationService = new google.maps.ElevationService();
            
            // Calcular puntos intermedios (100 puntos para mayor precisión)
            const numPuntos = 200;
            const puntos = [];
            
            for (let i = 0; i <= numPuntos; i++) {
                const progreso = i / numPuntos;
                const lat = punto1.lat() + (punto2.lat() - punto1.lat()) * progreso;
                const lng = punto1.lng() + (punto2.lng() - punto1.lng()) * progreso;
                puntos.push(new google.maps.LatLng(lat, lng));
            }

            // Solicitar elevaciones a Google
            elevationService.getElevationForLocations({
                locations: puntos
            }, (results, status) => {
                if (status === 'OK' && results) {
                    console.log(`Recibidos ${results.length} puntos de elevación de Google`);
                    
                    const distanciaTotal = this.calcularDistancia(punto1, punto2);
                    const datos = [];

                    results.forEach((result, index) => {
                        const progreso = index / (results.length - 1);
                        const distancia = progreso * distanciaTotal;
                        
                        datos.push({
                            distancia: Math.round(distancia),
                            elevacion: Math.round(result.elevation),
                            lat: result.location.lat(),
                            lng: result.location.lng()
                        });
                    });

                    resolve(datos);
                } else {
                    console.error('Error en ElevationService:', status);
                    reject(new Error(`Error del servicio de elevación: ${status}`));
                }
            });
        });
    }

    calcularDistancia(punto1, punto2) {
        // Usar Google Maps Geometry Library para mayor precisión
        if (google.maps.geometry && google.maps.geometry.spherical) {
            return google.maps.geometry.spherical.computeDistanceBetween(punto1, punto2);
        }
        
        // Fallback: fórmula haversine manual
        const R = 6371000; // Radio de la Tierra en metros
        const dLat = (punto2.lat() - punto1.lat()) * Math.PI / 180;
        const dLng = (punto2.lng() - punto1.lng()) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(punto1.lat() * Math.PI / 180) * Math.cos(punto2.lat() * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    mostrarGraficoAltimetria(datos) {
        console.log('Creando gráfico de altimetría...');
        
        // Obtener el canvas
        let ctx = document.getElementById('altimetria-chart');
        
        if (!ctx) {
            console.log('Canvas no encontrado, creando contenedor...');
            this.crearContenedorAltimetria();
            return setTimeout(() => this.mostrarGraficoAltimetria(datos), 100);
        }

        // DESTRUIR GRÁFICO ANTERIOR DE FORMA SEGURA
        if (this.chartAltimetria) {
            try {
                console.log('Destruyendo gráfico anterior...');
                this.chartAltimetria.destroy();
                this.chartAltimetria = null;
                console.log('Gráfico anterior destruido correctamente');
            } catch (error) {
                console.warn('Error al destruir gráfico anterior:', error);
                this.chartAltimetria = null;
            }
        }

        // VERIFICAR QUE EL CANVAS ESTÉ LIMPIO
        const context = ctx.getContext('2d');
        context.clearRect(0, 0, ctx.width, ctx.height);

        // Reducir número de etiquetas para mejor visualización
        const labels = datos.filter((_, index) => index % 5 === 0).map(d => `${d.distancia}m`);
        const elevaciones = datos.map(d => d.elevacion);
        const elevacionesFiltradas = datos.filter((_, index) => index % 5 === 0).map(d => d.elevacion);

        // Calcular estadísticas
        const elevacionMin = Math.min(...elevaciones);
        const elevacionMax = Math.max(...elevaciones);
        const diferencia = elevacionMax - elevacionMin;
        const distanciaTotal = Math.max(...datos.map(d => d.distancia));

        try {
            console.log('Creando nuevo gráfico...');
            
            this.chartAltimetria = new Chart(context, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Elevación (m s.n.m.)',
                        data: elevacionesFiltradas,
                        borderColor: '#FF0000',
                        backgroundColor: 'rgba(255, 0, 0, 0.15)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 1,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#FF0000',
                        pointBorderColor: '#FFFFFF',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Perfil Altimétrico - Distancia: ${(distanciaTotal/1000).toFixed(2)}km - Desnivel: ${diferencia.toFixed(1)}m`,
                            font: { size: 16, weight: 'bold' },
                            color: '#333'
                        },
                        legend: {
                            display: true,
                            position: 'bottom'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Distancia (metros)',
                                font: { weight: 'bold', size: 14 },
                                color: '#666'
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Elevación (m s.n.m.)',
                                font: { weight: 'bold', size: 14 },
                                color: '#666'
                            },
                            beginAtZero: false,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    elements: {
                        point: {
                            hitRadius: 10
                        }
                    }
                }
            });

            console.log(`Gráfico creado exitosamente: ${datos.length} puntos, desnivel: ${diferencia.toFixed(1)}m`);
            
        } catch (error) {
            console.error('Error al crear gráfico:', error);
            
            // Si hay error, recrear el canvas completamente
            console.log('Recreando canvas debido a error...');
            this.recrearCanvas();
            
            // Intentar de nuevo después de recrear
            setTimeout(() => this.mostrarGraficoAltimetria(datos), 200);
        }
    }

    crearContenedorAltimetria() {
        // CONTENEDOR MÁS GRANDE Y MEJOR DISTRIBUIDO
        const contenedor = document.createElement('div');
        contenedor.id = 'altimetria-container';
        contenedor.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 550px;
            height: 350px;
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            z-index: 1500;
            border: 3px solid #FF0000;
            display: flex;
            flex-direction: column;
        `;

        // HEADER CON BOTONES
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        `;

        const titulo = document.createElement('div');
        titulo.style.cssText = `
            font-family: 'Poppins', sans-serif;
            font-size: 16px;
            font-weight: bold;
            color: #FF0000;
        `;
        titulo.textContent = 'Perfil Altimétrico';

        const botonesContainer = document.createElement('div');
        botonesContainer.style.cssText = `
            display: flex;
            gap: 10px;
        `;

        // BOTÓN NUEVO PERFIL CON REFERENCIA CORRECTA
        const botonNuevo = document.createElement('button');
        botonNuevo.innerHTML = 'Nuevo';
        botonNuevo.title = 'Crear nuevo perfil';
        botonNuevo.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        botonNuevo.onmouseover = () => botonNuevo.style.background = '#45a049';
        botonNuevo.onmouseout = () => botonNuevo.style.background = '#4CAF50';
        
        // USAR ARROW FUNCTION PARA MANTENER EL CONTEXTO 'this'
        botonNuevo.onclick = () => {
            console.log('Botón Nuevo presionado');
            this.limpiarPuntosAltimetria();
        };

        // BOTÓN CERRAR CON REFERENCIA CORRECTA
        const botonCerrar = document.createElement('button');
        botonCerrar.innerHTML = '✕';
        botonCerrar.title = 'Cerrar perfil altimétrico';
        botonCerrar.style.cssText = `
            background: #FF0000;
            color: white;
            border: none;
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        botonCerrar.onmouseover = () => botonCerrar.style.background = '#cc0000';
        botonCerrar.onmouseout = () => botonCerrar.style.background = '#FF0000';
        
        // USAR ARROW FUNCTION PARA MANTENER EL CONTEXTO 'this'
        botonCerrar.onclick = () => {
            console.log('Botón Cerrar presionado');
            this.limpiarPerfilAltimétrico(true); // true = resetear cursor completamente
        };

        botonesContainer.appendChild(botonNuevo);
        botonesContainer.appendChild(botonCerrar);
        header.appendChild(titulo);
        header.appendChild(botonesContainer);

        // CONTENEDOR DEL GRÁFICO (FLEXIBLE)
        const chartContainer = document.createElement('div');
        chartContainer.style.cssText = `
            flex: 1;
            position: relative;
            min-height: 0;
        `;

        const canvas = document.createElement('canvas');
        canvas.id = 'altimetria-chart';
        canvas.style.cssText = `
            width: 100% !important;
            height: 100% !important;
        `;

        chartContainer.appendChild(canvas);
        contenedor.appendChild(header);
        contenedor.appendChild(chartContainer);
        document.getElementById('map').appendChild(contenedor);

        // Mostrar mensaje inicial
        this.mostrarMensajeEspera();
        
        console.log('Contenedor de altimetría creado con botones funcionales');
    }

    ajustarCanvasParaDPI(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Ajusta tamaño real en pixeles
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr); // Escala el contexto

        return ctx;
    }

    mostrarMensajeEspera() {
        const canvas = document.getElementById('altimetria-chart');
        if (canvas) {
            const ctx = this.ajustarCanvasParaDPI(canvas);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '16px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                'Selecciona 2 puntos en el mapa para crear el perfil',
                canvas.getBoundingClientRect().width / 2,
                canvas.getBoundingClientRect().height / 2
            );
        }
    }

    mostrarIndicadorCarga() {
        const canvas = document.getElementById('altimetria-chart');
        if (canvas) {
            const ctx = this.ajustarCanvasParaDPI(canvas);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 18px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                'Calculando perfil...',
                canvas.getBoundingClientRect().width / 2,
                canvas.getBoundingClientRect().height / 2
            );
        }
    }

    mostrarInstruccionesAltimetria() {
        // INSTRUCCIONES MEJORADAS
        const instrucciones = document.createElement('div');
        instrucciones.id = 'instrucciones-altimetria';
        instrucciones.style.cssText = `
            position: absolute;
            top: 120px;
            right: 20px;
            background: linear-gradient(135deg, rgba(255, 0, 0, 0.76), rgba(200, 0, 0, 0.51));
            color: white;
            padding: 18px 22px;
            border-radius: 12px;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            z-index: 1500;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.3);
            max-width: 320px;
        `;
        instrucciones.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 22px; margin-right: 10px;">📏</span>
                <strong style="font-size: 16px;">Perfil Altimétrico</strong>
            </div>
            <div style="font-size: 13px; line-height: 1.5; margin-bottom: 8px;">
                • Haz clic en 2 puntos dentro de la UT<br>
                • Puedes crear múltiples perfiles<br>
                • Usa el botón "Nuevo" para reiniciar
            </div>
            <div style="
                background: rgba(255,255,255,0.2);
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                text-align: center;
                margin-top: 8px;
            ">
                Modo activo - cursor en forma de cruz
            </div>
        `;

        document.getElementById('map').appendChild(instrucciones);

        // Remover después de 10 segundos
        setTimeout(() => {
            if (instrucciones.parentNode) {
                instrucciones.parentNode.removeChild(instrucciones);
            }
        }, 10000);
    }

    // MÉTODO PARA LIMPIAR SOLO PUNTOS DE ALTIMETRÍA
    limpiarPuntosAltimetria() {
        console.log('Limpiando puntos de altimetría...');
        
        // Limpiar marcadores
        this.marcadoresAltimetria.forEach(marcador => {
            google.maps.event.clearInstanceListeners(marcador);
            marcador.setMap(null);
        });
        this.marcadoresAltimetria = [];

        // Limpiar línea
        if (this.lineaAltimetria) {
            google.maps.event.clearInstanceListeners(this.lineaAltimetria);
            this.lineaAltimetria.setMap(null);
            this.lineaAltimetria = null;
        }

        // Limpiar gráfico
        if (this.chartAltimetria) {
            try {
                this.chartAltimetria.destroy();
                this.chartAltimetria = null;
            } catch (error) {
                console.warn('Error al destruir gráfico:', error);
            }
        }

        // Limpiar array de puntos
        this.puntosAltimetria = [];
        
        // Mostrar mensaje en el contenedor del gráfico
        this.mostrarMensajeEspera();
        
        console.log('Puntos de altimetría limpiados - modo sigue activo');
    }
    
    // MÉTODO PARA RECREAR CANVAS
    recrearCanvas() {
        console.log('Recreando canvas completamente...');
        
        const contenedor = document.getElementById('altimetria-container');
        if (!contenedor) return;
        
        // Remover canvas anterior
        const canvasAnterior = document.getElementById('altimetria-chart');
        if (canvasAnterior) {
            canvasAnterior.remove();
        }
        
        // Crear nuevo canvas
        const nuevoCanvas = document.createElement('canvas');
        nuevoCanvas.id = 'altimetria-chart';
        nuevoCanvas.style.cssText = `
            width: 100% !important;
            height: 100% !important;
        `;
        
        // Encontrar el contenedor del gráfico
        const chartContainer = contenedor.querySelector('div:last-child');
        if (chartContainer) {
            chartContainer.appendChild(nuevoCanvas);
        }
        
        console.log('Canvas recreado exitosamente');
    }
    
    // MÉTODO ADICIONAL PARA LIMPIAR PERFIL CON PARÁMETRO
    limpiarPerfilAltimétrico(resetearCursor = true) {
        console.log('Limpiando perfil altimétrico...');
        
        // Usar el método existente
        this.limpiarPerfilAltimetrico();
        
        // Si se pide resetear cursor, hacerlo
        if (resetearCursor) {
            if (staticMap) {
                staticMap.setOptions({ 
                    draggableCursor: 'grab',
                    clickableIcons: true
                });
            }
        }
    }

    limpiarPerfilAltimetrico() {
        // 1. Remover listener del mapa
        if (this.listenerAltimetria) {
            google.maps.event.removeListener(this.listenerAltimetria);
            this.listenerAltimetria = null;
        }
        
        // 2. Limpiar marcadores
        if (this.marcadoresAltimetria && this.marcadoresAltimetria.length > 0) {
            this.marcadoresAltimetria.forEach(marcador => {
                google.maps.event.clearInstanceListeners(marcador);
                marcador.setMap(null);
            });
            this.marcadoresAltimetria = [];
        }
        
        // 3. Limpiar línea
        if (this.lineaAltimetria) {
            google.maps.event.clearInstanceListeners(this.lineaAltimetria);
            this.lineaAltimetria.setMap(null);
            this.lineaAltimetria = null;
        }
        
        // 4. Destruir gráfico
        if (this.chartAltimetria) {
            try {
                this.chartAltimetria.destroy();
                this.chartAltimetria = null;
            } catch (error) {
            }
        }
        
        // 5. Remover contenedor
        const contenedor = document.getElementById('altimetria-container');
        if (contenedor) {
            contenedor.remove();
        }
        
        // 6. Remover instrucciones
        const instrucciones = document.getElementById('instrucciones-altimetria');
        if (instrucciones) {
            instrucciones.remove();
        }
        
        // 7. Resetear estado
        this.altimetriaActiva = false;
        this.puntosAltimetria = [];
    }

}



/*******************************************************
 *           * COMPOSICION POBLACIONAL  *
*******************************************************/
class Poblacion {
    
    /********************************
                *GRAFICAS*
    ********************************/    

    async graficaPorcentajePob(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob1',
                titulo: 'Porcentaje de Población de la Unidad Territorial respecto a la Demarcacion'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPorcentajeDenPob(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_sup2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_sup2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_sup2',
                titulo: 'Densidad de Población (HAB/M2)',
                sinPorcentaje: true //Solo las funciones que no son porcentaje
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaRelHomMuj(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob2',
                titulo: 'Relación Hombres-Mujeres'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPorcMuj(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob3&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob3,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob3',
                titulo: 'Porcentaje de Mujeres'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }
    
    async graficaPorcHom(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob4&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob4,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob4',
                titulo: 'Porcentaje de Hombres'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPob18Mas(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob5&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob5,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob5',
                titulo: 'Población de 18 años y más'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaRelDep(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob6&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob6,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob6',
                titulo: 'Relación de Dependencia'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaIndiceEnve(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob7&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob7,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob7',
                titulo: 'Indice de Envejecimiento'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    
    
    /********************************
                *MAPAS*
    ********************************/  

    async mapaPobTotal() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pobtot', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pobtot,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pobtot');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaPobFem(){
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pobfem', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pobfem,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pobfem');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaPobMasc(){
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor  
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pobmas', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pobmas,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pobmas');

        } catch (error) {
            console.log(error);
        }
    }

    async mapa3mas(){

        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p_3ymas', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 
                    'datos' : item.properties.p_3ymas,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });

            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p_3ymas');

        } catch (error) {
            console.log(error);
        }
    }

    async mapa5mas(){

        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p_5ymas', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 
                    'datos' : item.properties.p_5ymas,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });

            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p_5ymas');

        } catch (error) {
            console.log(error);
        }

    }

    async mapa12mas(){

        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p_12ymas', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 
                    'datos' : item.properties.p_12ymas,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });

            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p_12ymas');

        } catch (error) {
            console.log(error);
        }


    }

    async mapa18mas(){

        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p_18ymas', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 
                    'datos' : item.properties.p_18ymas,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });

            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p_18ymas');

        } catch (error) {
            console.log(error);
        }        


    }

    async mapa0_14(){
        
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pob0_14', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 
                    'datos' : item.properties.pob0_14,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });

            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pob0_14');

        } catch (error) {
            console.log(error);
        }  
        
    }

    async mapa15a64(){

        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pob15_64', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 
                    'datos' : item.properties.pob15_64,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });

            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pob15_64');

        } catch (error) {
            console.log(error);
        }  

    }

    async mapa65mas(){

        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pob65_mas', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 
                    'datos' : item.properties.pob65_mas,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });

            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pob65_mas');

        } catch (error) {
            console.log(error);
        }  

    }

}

// /*******************************************************
//  *              * MIGRACION  *
// *******************************************************/
class Migracion {

    /********************************
                *GRAFICAS*
    ********************************/  
    async graficaPobNoNati(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_mig1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_mig1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_mig1',
                titulo: 'Porcentaje de Población no Nativa'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobMigrEsta(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_mig2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_mig2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_mig2',
                titulo: 'Porcentaje de Población Migrante Estatal'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 

    async mapaPobOtraEnti(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pnacoe', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pnacoe  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pnacoe');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPob5años(){
        
        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&presoe15', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.presoe15  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'presoe15');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPobMasc5añosOtraEn(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&presoe15_m', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.presoe15_m  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'presoe15_m');

        }catch (error) {

            console.log(error)

        }

    }

}

// /*******************************************************
//  *              * ETNICIDAD  *
// *******************************************************/
class Etnicidad {


    /********************************
            *GRAFICAS*
    ********************************/
    async graficaPob3masLenguaInd(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_etn1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_etn1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_etn1',
                titulo: 'Porcentaje de Población de 3 años y más que habla alguna lengua indígena'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobAfromex(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_etn2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_etn2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_etn2',
                titulo: 'Porcentaje de Población que se considera afromexicana o afrodescendiente'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
            *MAPAS*
    ********************************/ 

    async mapaPob3masLengInd(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p3ym_hli', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.p3ym_hli  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'p3ym_hli');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPobAfroMex(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pob_afro', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pob_afro ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pob_afro');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPobAfroMexMasc(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pob_afro_m', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pob_afro_m ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pob_afro_m');

        }catch (error) {

            console.log(error)

        }


    }


}

// /*******************************************************
//  *              * DISCAPACIDAD *
// *******************************************************/
class Discapacidad {

    /********************************
            *GRAFICAS*
    ********************************/
    async graficaPobDisc(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis1',
                titulo: 'Porcentaje de Población con alguna discapacidad'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobDiscCamin(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis2',
                titulo: 'Porcentaje de Población con discapacidad para caminar, subir o bajar'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobDiscVer(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis3&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis3,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis3',
                titulo: 'Porcentaje de Población con discapacidad para ver, aun usando lentes'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobDiscHablar(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis4&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis4,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis4',
                titulo: 'Porcentaje de Población con discapacidad para hablar o comunicarse'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobDiscOir(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis5&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis5,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis5',
                titulo: 'Porcentaje de Población con discapacidad para oír, aun usando aparato auditivo'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobDiscVest(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis6&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis6,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis6',
                titulo: 'Porcentaje de Población con discapacidad para vestirse, bañarse o comer'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async PobDiscRecordar(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis7&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis7,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis7',
                titulo: 'Porcentaje de Población con discapacidad para recordar o concentrarse'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobLimi(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis8&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis8,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis8',
                titulo: 'Porcentaje de Población con limitación'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobLimCamin(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis9&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis9,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis9',
                titulo: 'Porcentaje de Población con limitación para caminar, subir o bajar'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobLimVer(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis10&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis10,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis10',
                titulo: 'Porcentaje de Población con limitación para ver, aun usando lentes'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobLimHablr(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis11&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis11,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis11',
                titulo: 'Porcentaje de Población con limitación para ver, aun usando lentes'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobLimOir(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis12&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis12,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis12',
                titulo: 'Porcentaje de Población con limitación para oír, aun usando aparato auditivo'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobLimVestir(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis13&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis13,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis13',
                titulo: 'Porcentaje de Población con limitación para vestirse, bañarse o comer'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobLimRecordConc(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis14&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis14,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis14',
                titulo: 'Porcentaje de Población con limitación para recordar o concentrarse'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobProblCondiMen(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis15&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis15,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis15',
                titulo: 'Porcentaje de Población con algún problema o condición mental'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPobSinDiscapacidad(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_dis16&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_dis16,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_dis16',
                titulo: 'Porcentaje de Población sin discapacidad, limitación, problema o condición mental'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 

    async mapaPobDiscapa(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcon_disc', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcon_disc  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcon_disc');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPobDiscapaCaminSubirBajar(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcdisc_mot', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcdisc_mot  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcdisc_mot');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPobDiscVerAunLentes(){


        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcdisc_vis', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcdisc_vis ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcdisc_vis');

        }catch (error) {

            console.log(error)

        }
            
        
    }

    async mapaPobDiscHablaComuni(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcdisc_len', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcdisc_len ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcdisc_len');

        }catch (error) {

            console.log(error)

        }
            
        
    }

    async mapaPobDiscOirAunAparato(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcdisc_aud', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcdisc_aud ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcdisc_aud');

        }catch (error) {

            console.log(error)

        }
            
        
    }

    async mapaPobDiscVesBaCom(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcdisc_m_1', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcdisc_m_1  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcdisc_m_1');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPobDiscRecordConcentr(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcdisc_men', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcdisc_men ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcdisc_men');

        } catch (error) {

            console.log(error);
            
        }

    }

    async mapaPobLimitacion(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pcon_limi', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pcon_limi ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pcon_limi');

        }catch (error) {

            console.log(error)

        }
            
        
    }

    async mapaPobLimCaminSubirBajar(){

        try {

            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pclim_csb', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pclim_csb  ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pclim_csb');

        }catch (error) {

            console.log(error)

        }

    }

    async mapaPobLimVerUsanLentes(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pclim_vis', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pclim_vis ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pclim_vis');

        } catch (error) {

            console.log(error);
            
        }

    }

    async mapaPobLimHablarComuni(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pclim_haco', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pclim_haco ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pclim_haco');

        } catch (error) {

            console.log(error);
            
        }

    }

    async mapaPobLimOirAparatoAudi(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pclim_oaud', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pclim_oaud ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pclim_oaud');

        } catch (error) {

            console.log(error);
            
        }

    }
    
    async mapaPobLimVestiBañarComer(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut 
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pclim_mot2', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pclim_mot2 ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pclim_mot2');

        } catch (error) {

            console.log(error);
            
        }

    }

    async mapaPobLimRecordarConcentrar(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut 
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pclim_re_c', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pclim_re_c ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pclim_re_c');

        } catch (error) {

            console.log(error);
            
        }

    }

    async mapaPobProbCondiciMental(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut 
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pclim_pmen', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.pclim_pmen ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'pclim_pmen');

        } catch (error) {

            console.log(error);
            
        }

    }

    async mapaPobSinDiscapacidad(){

        try {
                        
            const cve_UT = clave;

            //Obtenemos los datos de la ut 
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&psind_lim', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {

                datos.push({ 'datos' : item.properties.psind_lim ,  'latitud' : item.geometry.coordinates[1] , 'longitud' : item.geometry.coordinates[0] })

            });

            mapaCalor_Tematico(datos, 'psind_lim');

        } catch (error) {

            console.log(error);
            
        }

    }



}

// /*******************************************************
//  *        * CARACTERISTICAS ECONOMICAS *
// *******************************************************/
class CaracteristicasEconomicas {   

    /********************************
                *GRAFICAS*
    ********************************/ 
    async graficaPEA(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_ec1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_ec1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_ec1',
                titulo: 'Porcentaje de Poblacion de 12 Años y mas Economicamente Activa'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPNOEA(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_ec3&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_ec3,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_ec3',
                titulo: 'Porcentaje de Poblacion de 12 Años y mas no Economicamente Activa'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPPEA(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_ec2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_ec2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_ec2',
                titulo: 'Porcentaje de Poblacion de 12 Años y mas Economicamente Activa Ocupada'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPDESOC(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_ec4&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_ec4,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_ec4',
                titulo: 'Porcentaje De Poblacion de 12 Años y mas Desocupada'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 
    async mapaPEA() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pea', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pea,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pea');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaINAC() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pe_inac', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pe_inac,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pe_inac');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaOCUP() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pocupada', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pocupada,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pocupada');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaDESOCUP() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pdesocup', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pdesocup,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pdesocup');

        } catch (error) {
            console.log(error);
        }
    }

    
}

// /*******************************************************
//  *        * CARACTERISTICAS EDUCATIVAS *
// *******************************************************/
class CaracteristicasEducativas {

    /********************************
                *GRAFICAS*
    ********************************/ 
    async graficaEDUPOSB(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_edu2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_edu2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_edu2',
                titulo: 'Porcentaje de Población de 18 Años y más con Educación Posbásica'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaREZEDU(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_edu1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_edu1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_edu1',
                titulo: 'Porcentaje de Población con Rezago Educativo'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 

    async mapaPSESC() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p15ym_se', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.p15ym_se,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p15ym_se');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaPPRIMIN() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p15pri_in', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.p15pri_in,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p15pri_in');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaPEDPOS() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p18ym_pb', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.p18ym_pb,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p18ym_pb');

        } catch (error) {
            console.log(error);
        }
    }

}

// /*******************************************************
//  *        * HOGARES CENSALES*
// *******************************************************/
class HogaresCensales {

    /********************************
                *GRAFICAS*
    ********************************/ 

    async graficaRELHM(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_hog1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_hog1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_hog1',
                titulo: 'Relacion Mujeres-Hombres con Jefatura en Hogares Censales'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaJEFM(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_hog2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_hog2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_hog2',
                titulo: 'Porcentaje de Hogares con Jefa Mujer'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 
    async mapaHOGTOT() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&tothog', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.tothog,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'tothog');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaHOGFEM() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&hogjef_f', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.hogjef_f,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'hogjef_f');

        } catch (error) {
            console.log(error);
        }
    }

     async mapaHOGMAS() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&hogjef_m', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.hogjef_m,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'hogjef_m');

        } catch (error) {
            console.log(error);
        }
    }

}

// /*******************************************************
//  *        * SALUD*
// *******************************************************/
class Salud {

    /********************************
                *GRAFICAS*
    ********************************/ 
    async graficaPSINASS(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_sal1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_sal1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_sal1',
                titulo: 'Porcentaje de Población sin Afiliación a Servicios de Salud'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPASS(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_sal2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_sal2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_sal2',
                titulo: 'Porcentaje de Población Afiliada a Servicios de Salud'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 
    async mapaPSINASS() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&psinder', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.psinder,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'psinder');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaPASS() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&pder_ss', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.pder_ss,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'pder_ss');

        } catch (error) {
            console.log(error);
        }
    }


}

// /*******************************************************
//  *        * SITUACION CONYUGAL*
// *******************************************************/
class SituacionConyugal {

    /********************************
                *GRAFICAS*
    ********************************/ 
   async graficaPPBSOL(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_sitc1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_sitc1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_sitc1',
                titulo: 'Porcentaje de Población Soltera'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaCasadasUnidas(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_pob8&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_pob8,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_pob8',
                titulo: 'Personas Casadas o Unidas'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 
    async mapaPSOLT() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p12ym_solt', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.p12ym_solt,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p12ym_solt');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaPCAS() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&p12ym_casa', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.p12ym_casa,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'p12ym_casa');

        } catch (error) {
            console.log(error);
        }
    }


}

// /*******************************************************
//  *        * VIVIENDA *
// *******************************************************/
class Vivienda {

    /********************************
                *GRAFICAS*
    ********************************/ 

    async graficaPROMOCVIV(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_viv1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_viv1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_viv1',
                titulo: 'Promedio De Ocupantes Por Vivienda'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaPVIVPITI(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_viv2&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_viv2,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_viv2',
                titulo: 'Porcentaje de Viviendas con Piso de Tierra'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaINDDSYEQP(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_viv3&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_viv3,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_viv3',
                titulo: 'Índice Disponibilidad de Servicios y Equipamiento'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaINDDISVIEN(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_viv4&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_viv4,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_viv4',
                titulo: 'Índice Disponibilidad de Bienes'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    async graficaINDTIC(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_viv5&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_viv5,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_viv5',
                titulo: 'Índice Disponibilidad de Tecnologías de la Información y la Comunicación (TIC)'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }

    /********************************
                *MAPAS*
    ********************************/ 
    async mapaTOTVIV() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&tvivparhab', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.tvivparhab,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'tvivparhab');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaOCUPVIV() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&ocupvivpar', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.ocupvivpar,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'ocupvivpar');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVTIERRA() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_pisoti', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_pisoti,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_pisoti');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVENELC() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_c_elec', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_c_elec,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_c_elec');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVAGUAEN() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_aguadv', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_aguadv,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_aguadv');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVAGUATIN() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_tinaco', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_tinaco,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_tinaco');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVCISTERN() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_cister', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_cister,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_cister');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVSANITARIO() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_excsa', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_excsa,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_excsa');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVDRENAJE() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_drenaj', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_drenaj,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_drenaj');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVREFRI() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_refri', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_refri,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_refri');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVLAVADORA() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_lavad', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_lavad,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_lavad');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVAUTO() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_autom', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_autom,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_autom');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVMOTO() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_moto', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_moto,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_moto');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVBICI() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_bici', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_bici,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_bici');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVPC() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_pc', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_pc,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_pc');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVTELEF() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_telef', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_telef,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_telef');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVCELULAR() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_cel', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_cel,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_cel');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVINTERNET() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_inter', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_inter,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_inter');

        } catch (error) {
            console.log(error);
        }
    }

    async mapaVIVSTV() {
        try {
            const cve_UT = clave;

            //Obtenemos los datos de la ut para el mapa de calor
            const uts = await fetchFromApi('filter/centroides_manzanas?ut_cve_ut=' + cve_UT +'&vph_stvp', {});
            let datosUTS = uts.features;

            const datos = [];
            datosUTS.map((item) => {
                datos.push({ 
                    'datos' : item.properties.vph_stvp,  
                    'latitud' : item.geometry.coordinates[1], 
                    'longitud' : item.geometry.coordinates[0] 
                });
            });

            // LLAMAR A LA FUNCIÓN INTEGRADA (temático + calor)
            mapaCalor_Tematico(datos, 'vph_stvp');

        } catch (error) {
            console.log(error);
        }
    }




}
// /*******************************************************
//  *        * IFORMACION ADICIONAL *
// *******************************************************/
class InfoAdicional {

    async graficaAREAVERDE(){
        try {
            const cveDemar = cve_demarcacion;

            // Obtener datos completos de la API (YA incluye geometrías)
            const response = await fetchFromApi('filter/indices_mgpc?cve_demarc=' + cveDemar +'&ind_viv1&clave_ut&nombre', {});
            
            // Verificar respuesta
            if (!response.features || response.features.length === 0) {
                console.error('No se encontraron datos para la demarcación:', cveDemar);
                return;
            }

            // Crear objeto optimizado con todo lo necesario
            const datosCompletos = {
                // Datos para estadísticas y gráfica
                valores: response.features.map(item => ({
                    datos: item.properties.ind_viv1,
                    cve_ut: item.properties.clave_ut,
                    nombre_ut: item.properties.nombre
                })),
                
                // GeoJSON completo para el mapa
                geoJSON: {
                    type: "FeatureCollection",
                    features: response.features
                },
                
                // Campo y metadatos
                campo: 'ind_viv1',
                titulo: 'Índice de Áreas Verdes'
            };

            // Llamar al aside optimizado
            ampliarAsideIndicadorOptimizado(datosCompletos);

        } catch (error) {
            console.error('Error en graficaDencidadPob:', error);
        }
    }
    
    constructor() {
        const cve_UT = clave;
        // Capas disponibles con sus configuraciones
        this.capas = {
            'zonas_valor_ambiental': {
                endpoint: 'filter/valor_ambiental?cve_ut=' + cve_UT + '&nombre&alcaldia&fuente',
                titulo: 'ZONAS DE VALOR AMBIENTAL',
                parametros: {},
                estilo: {
                    fillColor: '#d5b43c',
                    fillOpacity: 0.3,
                    strokeColor: '#d5b43c',
                    strokeWeight: 2,
                    strokeOpacity: 0.8
                },
                camposTooltip: {
                    'nombre': '',
                    'alcaldia': '', 
                    'fuente': ''
                },
                zIndex: 1000
            },

            'linea_conservacion_ecologica': {
                endpoint: 'filter/suelo_conservacion?cve_ut=' + cve_UT + '&fenomen&categor&fuente&magn_nm',
                titulo: 'LÍNEA DE CONSERVACÓN ECOLÓGICA',
                parametros: {},
                estilo: {
                    fillColor: '#ff6a68',
                    fillOpacity: 0.3,
                    strokeColor: '#ff6a68',
                    strokeWeight: 2,
                    strokeOpacity: 0.8
                },
                camposTooltip: {
                    'fenomen': '',
                    'categor': 'Categoría:', 
                    'fuente': 'Fuente:',
                    'magn_nm': 'Ha:'
                },
                zIndex: 1000
            },

            'area_natural_protegida': {
                endpoint: 'filter/anp?cve_ut=' + cve_UT + '&categor&suelo&nombre&fuente&magn_nm',
                titulo: 'ÁREA NATURAL PROTEGIDA',
                parametros: {},
                estilo: {
                    fillColor: '#85b66f',
                    fillOpacity: 0.3,
                    strokeColor: '#85b66f',
                    strokeWeight: 2,
                    strokeOpacity: 0.8
                },
                camposTooltip: {
                    'categor': 'Área Natrual Protegida:', 
                    'suelo': 'Tipo:',
                    'nombre': 'Nombre',
                    'fuente': 'Fuente:',
                    'magn_nm': 'Ha:'
                },
                zIndex: 1000
            },

            'zona_patrimonial': {
                endpoint: 'filter/zona_patrimonal?cve_ut=' + cve_UT + '&area_conse&alcaldia&superficie&fuente',
                titulo: 'ÁREA DE CONSERVACIÓN PATRIMONIAL',
                parametros: {},
                estilo: {
                    fillColor: '#c43c39',
                    fillOpacity: 0.3,
                    strokeColor: '#c43c39',
                    strokeWeight: 2,
                    strokeOpacity: 0.8
                },
                camposTooltip: {
                    'area_conse': '',
                    'alcaldia': '', 
                    'superficie': '',
                    'fuente': ''
                },
                zIndex: 1000
            },

            'autoridad_zona_patrimonio': {
                endpoint: 'filter/zona_autoridad?cve_ut=' + cve_UT + '&nombre',
                titulo: 'AUTORIDAD DE LA ZONA DE PATRIMONIO',
                parametros: {},
                estilo: {
                    fillColor: '#91522d',
                    fillOpacity: 0.3,
                    strokeColor: '#91522d',
                    strokeWeight: 2,
                    strokeOpacity: 0.8
                },
                camposTooltip: {
                    'nombre': '',
                    'fuente': 'Fuente:'
                },
                zIndex: 1000
            },

            'area_verde': {
                endpoint: 'filter/area_verde_ut?cve_ut=' + cve_UT + '&categoria_&subcat_sed&superficie&fuente',
                titulo: 'ÁREAS VERDES',
                parametros: {},
                estilo: {
                    fillColor: '#987db7',
                    fillOpacity: 0.3,
                    strokeColor: '#987db7',
                    strokeWeight: 2,
                    strokeOpacity: 0.8
                },
                camposTooltip: {
                    'categoria_': 'Categoria:',
                    'subcat_sed': 'Sub Categoria:',
                    'superficie': 'Superficie:',
                    'fuente': 'Fuente:'
                },
                zIndex: 1000
            },

        };

        // Almacenar referencias a capas activas
        this.capasActivas = new Map();
        this.marcadoresInfo = [];
    }

    /**
     * Carga una capa específica en el mapa
     * @param {string} nombreCapa - Nombre de la capa a cargar
     */
    async cargarCapaPatrimonial(nombreCapa = 'zona_patrimonial') {
        try {
            const configCapa = this.capas[nombreCapa];
            if (!configCapa) {
                console.error(`Capa '${nombreCapa}' no configurada`);
                return;
            }

            // Limpiar capa anterior si existe
            this.limpiarCapa(nombreCapa);

            console.log(`Cargando capa: ${nombreCapa}`);
            
            // Hacer petición a la API
            const response = await fetchFromApi(configCapa.endpoint, {
                api_key: 'a1b2c3d4e5f6g7h8i9j0',
                ...configCapa.parametros
            });

            if (response && response.features && response.features.length > 0) {
                this.mostrarCapaEnMapa(nombreCapa, response, configCapa);
                console.log(`Capa '${nombreCapa}' cargada exitosamente con ${response.features.length} elementos`);
            } else {
                // NUEVO: Mostrar mensaje cuando no hay datos
                this.mostrarMensajeSinDatos(nombreCapa, configCapa.titulo);
                console.warn(`No se encontraron datos para la capa '${nombreCapa}'`);
            }

        } catch (error) {
            console.error(`Error al cargar capa '${nombreCapa}':`, error);
            // NUEVO: Mostrar mensaje de error
            this.mostrarMensajeError(nombreCapa);
        }
    }

    /**
     * Muestra la capa en el mapa con sus estilos y tooltips
     */
    mostrarCapaEnMapa(nombreCapa, geoJsonData, configCapa) {
        // Crear layer de datos para esta capa
        const dataLayer = new google.maps.Data();
        dataLayer.setMap(staticMap);

        // Agregar datos GeoJSON
        dataLayer.addGeoJson(geoJsonData);

        // Aplicar estilos
        dataLayer.setStyle({
            ...configCapa.estilo,
            zIndex: configCapa.zIndex || 1000
        });

        // Agregar eventos para tooltips
        this.agregarEventosTooltip(dataLayer, configCapa, nombreCapa);

        // Guardar referencia a la capa
        this.capasActivas.set(nombreCapa, dataLayer);
    }

    /**
     * Agrega eventos de mouse para mostrar tooltips
     */
    agregarEventosTooltip(dataLayer, configCapa, nombreCapa) {
        let tooltipActivo = false;
        
        // Evento mouseover
        dataLayer.addListener('mouseover', (event) => {
            if (!tooltipActivo) {
                const feature = event.feature;
                
                // Aplicar hover al polígono con rojo intenso
                dataLayer.overrideStyle(feature, {
                    fillOpacity: 0.6,
                    strokeWeight: 3,
                    strokeColor: '#FF0000',
                    fillColor: '#FF0000',
                    zIndex: 10000
                });
                
                // Pasar el título de la capa
                const contenidoTooltip = this.crearContenidoTooltip(
                    feature, 
                    configCapa.camposTooltip, 
                    configCapa.estilo.strokeColor,
                    configCapa.titulo // Agregar título
                );
                this.mostrarTooltipHTML(event.domEvent, contenidoTooltip, nombreCapa, configCapa.estilo.strokeColor);
                tooltipActivo = true;
            }
        });

        // Evento mouseout
        dataLayer.addListener('mouseout', (event) => {
            if (tooltipActivo) {
                const feature = event.feature;
                
                // Restaurar estilo original del polígono
                dataLayer.revertStyle(feature);
                
                this.ocultarTooltipHTML();
                tooltipActivo = false;
            }
        });

        // Evento mousemove para seguir el cursor
        dataLayer.addListener('mousemove', (event) => {
            if (tooltipActivo && event.domEvent) {
                this.actualizarPosicionTooltip(event.domEvent);
            }
        });
    }

    /**
     * Muestra mensaje cuando no hay datos para la UT
     */
    // mostrarMensajeSinDatos(nombreCapa, tituloCapa) {
    //     // Crear elemento del mensaje
    //     const mensaje = document.createElement('div');
    //     mensaje.id = 'mensaje-sin-datos-' + nombreCapa;
    //     mensaje.className = 'mensaje-sin-datos';
        
    //     // Contenido del mensaje
    //     mensaje.innerHTML = `
    //         <div style="
    //             position: fixed;
    //             top: 50%;
    //             left: 50%;
    //             transform: translate(-50%, -50%);
    //             background: rgba(255, 255, 255, 0.95);
    //             border: 2px solid #be49f8ff;
    //             border-radius: 12px;
    //             padding: 20px 30px;
    //             font-family: 'Poppins', sans-serif;
    //             text-align: center;
    //             max-width: 400px;
    //             box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    //             z-index: 999999;
    //             backdrop-filter: blur(3px);
    //         ">
    //             <div style="
    //                 background: #be49f8ff; 
    //                 color: white; 
    //                 margin: -20px -30px 15px -30px; 
    //                 padding: 12px 30px; 
    //                 border-radius: 10px 10px 0 0; 
    //                 font-weight: bold; 
    //                 font-size: 14px;
    //             ">
    //                 ${tituloCapa}
    //             </div>
    //             <div style="color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 500;">
    //                 ℹ️ Sin información disponible
    //             </div>
    //             <div style="color: #666; font-size: 13px; line-height: 1.4; margin-bottom: 20px;">
    //                 No se encontraron datos de <strong>${tituloCapa.toLowerCase()}</strong> para esta Unidad Territorial.
    //             </div>
                
    //             <button onclick="document.getElementById('mensaje-sin-datos-${nombreCapa}').remove()" 
    //                 style="
    //                     background: #be49f8ff;
    //                     color: white;
    //                     border: none;
    //                     padding: 8px 20px;
    //                     border-radius: 6px;
    //                     cursor: pointer;
    //                     font-family: 'Poppins', sans-serif;
    //                     font-weight: 500;
    //                     transition: background 0.2s ease;
    //                 " 
    //                 onmouseover="this.style.background='#a800fcff'"
    //                 onmouseout="this.style.background='#be49f8ff'">
    //                 Entendido
    //             </button>
    //         </div>
    //     `;
        
    //     // Agregar al body
    //     document.body.appendChild(mensaje);
        
    //     // Auto-remover después de 8 segundos
    //     setTimeout(() => {
    //         if (mensaje.parentNode) {
    //             mensaje.remove();
    //         }
    //     }, 8000);
        
    //     console.log(`Mensaje de sin datos mostrado para: ${nombreCapa}`);
    // }

    mostrarMensajeSinDatos(nombreCapa, tituloCapa) {
        // Crear elemento del mensaje
        const mensaje = document.createElement('div');
        mensaje.id = 'mensaje-sin-datos-' + nombreCapa;
        mensaje.className = 'mensaje-sin-datos';

        // 🔹 Determinar la fuente según la capa
        let textoFuente = '';
        switch (nombreCapa) {
            case 'zonas_valor_ambiental':
                textoFuente = 'Fuente: Secretaría del Medio Ambiente';
                break;
            case 'linea_conservacion_ecologica':
                textoFuente = 'Fuente: SEDEMA, DGCORENA 2018';
                break;
            case 'area_natural_protegida':
                textoFuente = 'Fuente: SEDEMA, 2018';
                break;
            case 'zona_patrimonial':
                textoFuente = 'Fuente: Dirección de Patrimonio Cultural Urbano y de Espacio Público, SEDUVI';
                break;
            case 'autoridad_zona_patrimonio':
                textoFuente = 'Fuente: Publicado en la Gaceta Oficial del Distrito Federal el 11 de Diciembre de 2012';
                break;
            case 'area_verde':
                textoFuente = 'Fuente: SEDEMA: CDMX Áreas Verdes 2017';
                break;
            default:
                textoFuente = ''; // Si no coincide ninguna capa
        }

        // Contenido del mensaje
        mensaje.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #be49f8ff;
                border-radius: 12px;
                padding: 20px 30px;
                font-family: 'Poppins', sans-serif;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                z-index: 999999;
                backdrop-filter: blur(3px);
            ">
                <div style="
                    background: #be49f8ff; 
                    color: white; 
                    margin: -20px -30px 15px -30px; 
                    padding: 12px 30px; 
                    border-radius: 10px 10px 0 0; 
                    font-weight: bold; 
                    font-size: 14px;
                ">
                    ${tituloCapa}
                </div>
                <div style="color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 500;">
                    Sin información disponible
                </div>
                <div style="color: #666; font-size: 13px; line-height: 1.4; margin-bottom: 10px;">
                    No se encontraron datos de <strong>${tituloCapa.toLowerCase()}</strong> para esta Unidad Territorial.
                </div>
                ${textoFuente ? `<div style="color:#444; font-size:12px; margin-top:10px;">${textoFuente}</div>` : ''}
                
                <button onclick="document.getElementById('mensaje-sin-datos-${nombreCapa}').remove()" 
                    style="
                        background: #be49f8ff;
                        color: white;
                        border: none;
                        padding: 8px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: 'Poppins', sans-serif;
                        font-weight: 500;
                        transition: background 0.2s ease;
                        margin-top: 15px;
                    " 
                    onmouseover="this.style.background='#a800fcff'"
                    onmouseout="this.style.background='#be49f8ff'">
                    Entendido
                </button>
            </div>
        `;

        // Agregar al body
        document.body.appendChild(mensaje);

        // Auto-remover después de 8 segundos
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.remove();
            }
        }, 8000);

        console.log(`Mensaje de sin datos mostrado para: ${nombreCapa}`);
    }


    /**
     * Muestra mensaje de error en la carga
     */
    mostrarMensajeError(nombreCapa) {
        const mensaje = document.createElement('div');
        mensaje.id = 'mensaje-error-' + nombreCapa;
        mensaje.className = 'mensaje-error';
        
        mensaje.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #f44336;
                border-radius: 12px;
                padding: 20px 30px;
                font-family: 'Poppins', sans-serif;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                z-index: 999999;
                backdrop-filter: blur(3px);
            ">
                <div style="
                    background: #f44336; 
                    color: white; 
                    margin: -20px -30px 15px -30px; 
                    padding: 12px 30px; 
                    border-radius: 10px 10px 0 0; 
                    font-weight: bold; 
                    font-size: 14px;
                ">
                    ERROR AL CARGAR DATOS
                </div>
                <div style="color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 500;">
                    ⚠️ Error de conexión
                </div>
                <div style="color: #666; font-size: 13px; line-height: 1.4; margin-bottom: 20px;">
                    No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo nuevamente.
                </div>
                <button onclick="document.getElementById('mensaje-error-${nombreCapa}').remove()" 
                    style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 8px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: 'Poppins', sans-serif;
                        font-weight: 500;
                        transition: background 0.2s ease;
                    " 
                    onmouseover="this.style.background='#d32f2f'"
                    onmouseout="this.style.background='#f44336'">
                    Cerrar
                </button>
            </div>
        `;
        
        document.body.appendChild(mensaje);
        
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.remove();
            }
        }, 10000);
    }

    /**
     * Muestra tooltip HTML personalizado
     */
    mostrarTooltipHTML(mouseEvent, contenido, nombreCapa, colorCapa) {
        // Limpiar TODOS los tooltips anteriores primero
        this.limpiarTodosLosTooltips();
        
        // Crear elemento tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip-info-adicional';
        tooltip.className = 'tooltip-info-adicional';
        tooltip.innerHTML = contenido;
        
        // Estilos del tooltip con color de la capa
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(255, 255, 255, 0.98);
            border: 2px solid ${colorCapa};
            border-radius: 12px;
            padding: 12px;
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            max-width: 350px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            backdrop-filter: blur(2px);
            border-left: 5px solid ${colorCapa};
        `;
        
        // Agregar al body
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        this.posicionarTooltip(tooltip, mouseEvent);
        
        // Mostrar con animación
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.style.opacity = '1';
            }
        }, 10);
        
        console.log(`Tooltip HTML mostrado para capa: ${nombreCapa}`);
    }

    /**
     * Posiciona el tooltip cerca del cursor
     */
    posicionarTooltip(tooltip, mouseEvent) {
        const x = mouseEvent.clientX;
        const y = mouseEvent.clientY;
        
        // Offset para que no tape el cursor
        let tooltipX = x + 15;
        let tooltipY = y - 10;
        
        // Ajustar si se sale de la pantalla por la derecha
        if (tooltipX + 350 > window.innerWidth) {
            tooltipX = x - 365; // Mostrar a la izquierda
        }
        
        // Ajustar si se sale por arriba
        if (tooltipY < 10) {
            tooltipY = y + 20; // Mostrar abajo
        }
        
        // Ajustar si se sale por abajo
        if (tooltipY + 200 > window.innerHeight) {
            tooltipY = window.innerHeight - 210;
        }
        
        tooltip.style.left = tooltipX + 'px';
        tooltip.style.top = tooltipY + 'px';
    }

    /**
     * Actualiza la posición del tooltip al mover el mouse
     */
    actualizarPosicionTooltip(mouseEvent) {
        const tooltip = document.getElementById('tooltip-info-adicional');
        if (tooltip) {
            this.posicionarTooltip(tooltip, mouseEvent);
        }
    }

    /**
     * Oculta y elimina el tooltip HTML
     */
    ocultarTooltipHTML() {
        this.limpiarTodosLosTooltips();
    }

    /**
     * Limpia todos los tooltips que puedan existir
     */
    limpiarTodosLosTooltips() {
        // Método 1: Por ID específico
        const tooltipById = document.getElementById('tooltip-info-adicional');
        if (tooltipById) {
            tooltipById.remove();
        }
        
        // Método 2: Por clase (por si hay múltiples)
        const tooltipsByClass = document.querySelectorAll('.tooltip-info-adicional');
        tooltipsByClass.forEach(tooltip => {
            tooltip.remove();
        });
        
        // Método 3: Buscar cualquier tooltip que empiece con nuestro patrón
        const allDivs = document.querySelectorAll('div[id*="tooltip-info"]');
        allDivs.forEach(div => {
            div.remove();
        });
    }

    /**
     * Crea el contenido HTML del tooltip - VERSION MEJORADA
     */
    crearContenidoTooltip(feature, camposTooltip, colorCapa, tituloCapa = 'INFORMACIÓN PATRIMONIAL') {
        let contenido = `
            <div style="line-height: 1.4;">
                <div style="background: ${colorCapa}; color: white; margin: -12px -12px 10px -12px; padding: 8px 12px; border-radius: 6px 6px 0 0; font-weight: bold; font-size: 12px;">
                    ${tituloCapa}
                </div>
        `;
        
        Object.entries(camposTooltip).forEach(([campo, etiqueta]) => {
            let valor = feature.getProperty(campo);

            // 🔹 Redondear y añadir unidad si el campo es 'superficie'
            if (campo === 'superficie' && valor) {
                const num = parseFloat(valor);
                if (!isNaN(num)) {
                    valor = `${num.toFixed(2)} m²`;
                }
            }

            if (valor) {
                if (etiqueta && etiqueta.trim() !== '') {
                    contenido += `
                        <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f0f0f0;">
                            <span style="color: #333; font-weight: 500; display: block;">${etiqueta} ${valor}</span>
                        </div>
                    `;
                } else {
                    contenido += `
                        <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f0f0f0;">
                            <span style="color: #333; font-weight: 500; display: block;">${valor}</span>
                        </div>
                    `;
                }
            }
        });
        
        contenido += '</div>';
        return contenido;
    }

    /**
     * Limpia una capa específica del mapa
     */
    limpiarCapa(nombreCapa) {
        const capa = this.capasActivas.get(nombreCapa);
        if (capa) {
            capa.setMap(null);
            this.capasActivas.delete(nombreCapa);
            console.log(`Capa '${nombreCapa}' limpiada`);
        }
    }

    /**
     * Limpia todas las capas activas
     */
    limpiarTodasLasCapas() {
        // Limpiar TODOS los tooltips primero
        this.limpiarTodosLosTooltips();
        
        // Limpiar mensajes de sin datos y errores
        this.limpiarMensajes();
        
        this.capasActivas.forEach((capa, nombreCapa) => {
            // Limpiar estilos aplicados antes de remover la capa
            capa.forEach(feature => {
                capa.revertStyle(feature);
            });
            
            capa.setMap(null);
            console.log(`Capa '${nombreCapa}' limpiada`);
        });
        this.capasActivas.clear();
        
        // Limpiar marcadores si los hay
        this.marcadoresInfo.forEach(marcador => marcador.setMap(null));
        this.marcadoresInfo = [];
    }

    /**
     * Limpia todos los mensajes de información
     */
    limpiarMensajes() {
        // Limpiar mensajes de sin datos
        const mensajesSinDatos = document.querySelectorAll('.mensaje-sin-datos');
        mensajesSinDatos.forEach(mensaje => mensaje.remove());
        
        // Limpiar mensajes de error
        const mensajesError = document.querySelectorAll('.mensaje-error');
        mensajesError.forEach(mensaje => mensaje.remove());
    }

    /**
     * Verifica si una capa está activa
     */
    estaCapaActiva(nombreCapa) {
        return this.capasActivas.has(nombreCapa);
    }

    /**
     * Método para agregar nuevas capas dinámicamente
     */
    agregarConfiguracionCapa(nombreCapa, configuracion) {
        this.capas[nombreCapa] = configuracion;
        console.log(`Configuración de capa '${nombreCapa}' agregada`);
    }
}

