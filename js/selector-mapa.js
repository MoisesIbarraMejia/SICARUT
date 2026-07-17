// DESACTIVAR CONSOLE EN PRODUCCIÓN
console.log = function(){};
console.warn = function(){};
console.error = function(){};
console.info = function(){};
console.debug = function(){};


// Variable para controlar si el mapa está inicializado
window.mapaInicializado = false;

// Hacer la función mapa accesible globalmente
window.mapa = mapa;

// Función cerrarModalMapa debe ser global
window.cerrarModalMapa = cerrarModalMapa;

/*********************************************************************************
                      APARTADO DEl MAPA
**********************************************************************************/

// Variables globales del mapa
let mapaindex;
let nivelActual = "demarcaciones";
let poligonosActuales = [];
let demarcacionSeleccionada = null;
let distritoSeleccionado = null;
let tooltipActual = null;
let siguiendoMouse = false;
let tooltipListener = null;
let poligonoActivo = null;
let demarcacionNombreSeleccionada = null;
let historialDatos = {
    demarcacion: null,
    distrito: null,
    unidad: null
};

let marcadorUbicacionUsuario = null; // Pin de la ubicación del usuario


const API_PROXY_URL = './api-proxy.php';
// const API_PROXY_URL = '/dev_caracteristicas_UnidadesTerritoriales/api-proxy_local.php'


// Arrays para el buscador
const uts = [];
const seccionesUnicas = new Map();
const seccionesDuplicadas = new Map();

function mapa() {

    // Detectar si estamos en móvil
    const esMobile = window.innerWidth <= 768;

    // Seleccionar estilo dinámicamente
    const controlStyle = esMobile
        ? google.maps.MapTypeControlStyle.DROPDOWN_MENU
        : google.maps.MapTypeControlStyle.HORIZONTAL_BAR;

    // Seleccionar zoom dinámico
    const zoomInicial = esMobile ? 10 : 11;

    const centro = { lat: 19.336190823601026, lng: -99.14025476586043 };

    mapaindex = new google.maps.Map(document.getElementById('mapa'), {
        center: centro,
        tilt: 0,
        zoom: zoomInicial,
        gestureHandling: 'greedy',
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: controlStyle,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: ['roadmap', 'satellite']
        }
    });

    // mostrarModalMapa();
    crearControlesSuperiores(mapaindex);
    demarcaciones();
    inicializarBuscador();
    crearHistorialSeleccion(mapaindex);
}


// Función para cerrar el modal del mapa
function cerrarModalMapa() {
    const modal = document.getElementById('welcomeModalMapa');
    if (!modal) return;

    modal.style.animation = 'fadeOut 0.3s ease-out forwards';

    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.opacity = '';
        modal.style.animation = '';

        // NUEVO: mostrar burbuja de ayuda para el botón de ubicación
        mostrarBurbujaUbicacion();
    }, 300);
}



// Función para mostrar el modal del mapa
function mostrarModalMapa() {
    const modal = document.getElementById('welcomeModalMapa');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.style.opacity = '0';

    // Forzar reflow
    void modal.offsetWidth;

    modal.style.animation = 'fadeIn 0.4s ease-out forwards';
}




// Event listeners para el modal del mapa
document.addEventListener('DOMContentLoaded', function () {
    // Cerrar modal al hacer clic fuera de él
    const modal = document.getElementById('welcomeModalMapa');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                cerrarModalMapa();
            }
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('welcomeModalMapa');
            if (modal && modal.style.display !== 'none') {
                cerrarModalMapa();
            }
        }
    });
});


async function fetchFromApi(endpoint, params = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    // Construir URL del proxy
    const url = new URL(API_PROXY_URL, window.location.href);
    url.searchParams.append('endpoint', cleanEndpoint);

    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });

    try {
        const response = await fetch(url.href, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        console.error('Error al consultar la API:', error);
        throw error;
    }
}

// Función para crear y mostrar tooltip que sigue al mouse
function mostrarTooltip(nombre, posicionInicial, poligono = null) {
    // Cerrar tooltip anterior si existe
    if (tooltipActual) {
        tooltipActual.close();
        if (tooltipListener) {
            google.maps.event.removeListener(tooltipListener);
        }
    }

    // Crear nuevo tooltip sin botón de cerrar
    tooltipActual = new google.maps.InfoWindow({
        content: `<div style="font-family: Poppins, sans-serif; font-size: 14px; padding: 4px 8px; font-weight: bold; white-space: nowrap;">${nombre}</div>`,
        position: posicionInicial,
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -30),
        headerDisabled: true,
        closeOnClick: false
    });

    tooltipActual.open(mapaindex);
    siguiendoMouse = true;
    poligonoActivo = poligono;

    // Agregar listener para seguir el movimiento del mouse en toda la página
    tooltipListener = google.maps.event.addDomListener(document, 'mousemove', function (event) {
        if (siguiendoMouse && tooltipActual) {
            // Convertir coordenadas del mouse a coordenadas del mapa
            const mapDiv = mapaindex.getDiv();
            const bounds = mapDiv.getBoundingClientRect();

            // Calcular posición relativa del mouse dentro del mapa
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;

            // Verificar que el mouse esté dentro del área del mapa
            if (x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height) {
                // Obtener las coordenadas del mapa en la posición del mouse
                const overlay = new google.maps.OverlayView();
                overlay.draw = function () { };
                overlay.setMap(mapaindex);

                // Usar un método más directo para obtener las coordenadas
                const projection = mapaindex.getProjection();
                if (projection) {
                    const latLng = projection.fromContainerPixelToLatLng(new google.maps.Point(x, y));
                    if (latLng) {
                        tooltipActual.setPosition(latLng);
                    }
                }
            }
        }
    });
}

// Función alternativa usando eventos del polígono directamente
function mostrarTooltipPoligono(nombre, poligono) {
    // Cerrar tooltip anterior
    if (tooltipActual) {
        tooltipActual.close();
        if (tooltipListener) {
            google.maps.event.removeListener(tooltipListener);
        }
    }

    // Crear tooltip
    tooltipActual = new google.maps.InfoWindow({
        content: `<div style="font-family: Poppins, sans-serif; font-size: 14px; padding: 4px 8px; font-weight: bold; white-space: nowrap;">${nombre}</div>`,
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -30),
        headerDisabled: true,
        closeOnClick: false
    });

    siguiendoMouse = true;

    // Agregar listener directamente al polígono para seguir el mouse
    tooltipListener = google.maps.event.addListener(poligono, 'mousemove', function (event) {
        if (siguiendoMouse && tooltipActual) {
            tooltipActual.setPosition(event.latLng);
            if (!tooltipActual.getMap()) {
                tooltipActual.open(mapaindex);
            }
        }
    });

    // Obtener centro del polígono para posición inicial
    const bounds = new google.maps.LatLngBounds();
    poligono.getPath().forEach(function (latlng) {
        bounds.extend(latlng);
    });

    tooltipActual.setPosition(bounds.getCenter());
    tooltipActual.open(mapaindex);
}

// Función para ocultar tooltip y detener seguimiento
function ocultarTooltip() {
    siguiendoMouse = false;
    poligonoActivo = null;

    if (tooltipListener) {
        google.maps.event.removeListener(tooltipListener);
        tooltipListener = null;
    }

    if (tooltipActual) {
        tooltipActual.close();
        tooltipActual = null;
    }
}

// Función demarcaciones modificada con tooltips
async function demarcaciones() {
    limpiarPoligonos();
    nivelActual = "demarcaciones";
    toggleBotonRegresar(false);
    actualizarMensajeInformacion("demarcaciones");
    toggleBotonRegresar(false);
    toggleBotonUbicacion(true);   // vuelve a mostrarse al regresar a este nivel
    limpiarMarcadorUbicacion();   // por si venías de una búsqueda por ubicación

    try {
        const demarcaciones = await fetchFromApi('geometries/demarcacion', { limit: 16, offset: 0 });
        const datos = demarcaciones.features;

        datos.forEach(dato => {
            let numeroDemar = dato.properties.numero_dem;
            let latitud = dato.properties.latitud;
            let longitud = dato.properties.longitud;
            let nombreDemar = dato.properties.nombre;

            const coorDemar = dato.geometry.coordinates;
            const paths = coorDemar[0].map(coordenada => {
                return { lat: coordenada[1], lng: coordenada[0] };
            });

            const polyDemar = new google.maps.Polygon({
                paths: paths,
                strokeColor: '#520c8b',
                strokeOpacity: 0.8,
                strokeWeight: 5,
                fillColor: '#520c8b',
                fillOpacity: 0.0,
                latitud: latitud,
                longitud: longitud,
                nombre: nombreDemar,
                numDemar: numeroDemar
            });

            polyDemar.setMap(mapaindex);
            poligonosActuales.push(polyDemar);

            const originalColor = '#520c8b';
            const hoverColor = '#59227bcb';

            // Evento mouseover con tooltip que sigue al mouse
            google.maps.event.addListener(polyDemar, 'mouseover', function (event) {
                this.setOptions({
                    fillOpacity: 0.3,
                    fillColor: hoverColor,
                    strokeColor: hoverColor
                });

                // Usar la función específica para polígonos
                mostrarTooltipPoligono(this.nombre, this);
            });

            // Evento mouseout
            google.maps.event.addListener(polyDemar, 'mouseout', function () {
                this.setOptions({
                    fillOpacity: 0.0,
                    fillColor: originalColor,
                    strokeColor: originalColor
                });

                // Ocultar tooltip
                ocultarTooltip();
            });

            // Evento click
            google.maps.event.addListener(polyDemar, 'click', function () {
                const numberDemar = polyDemar.numDemar;
                const nombreDemar = this.nombre;

                demarcacionSeleccionada = numberDemar;
                demarcacionNombreSeleccionada = nombreDemar;

                toggleBotonUbicacion(false);   // <-- NUEVO
                limpiarMarcadorUbicacion();    // <-- NUEVO

                const bounds = new google.maps.LatLngBounds();
                this.getPath().forEach(function (latlng) {
                    bounds.extend(latlng);
                });
                mapaindex.fitBounds(bounds);

                unidadesT(numberDemar, nombreDemar);
            });
        });

        // Limpiar historial al regresar a demarcaciones
        historialDatos = {
            demarcacion: null,
            distrito: null,
            unidad: null
        };
        actualizarHistorial("demarcaciones");
    } catch (error) {
        console.error("Error al cargar demarcaciones:", error);
    }
}

// COMENTAMOS LA FUNCIÓN DE DISTRITOS COMPLETA 
// Función distritos modificada con tooltips
// async function distritos(numeroDemar, nombreDemarcacion = null) {
//     const demarNum = numeroDemar;
//     limpiarPoligonos();
//     nivelActual = "distritos";
//     demarcacionSeleccionada = numeroDemar;
//     toggleBotonRegresar(true);
//     actualizarMensajeInformacion("distritos");

//     try {
//         const distritos = await fetchFromApi('geometries/distritos_demarcacion', { limit: 39, offset: 0 });
//         let datosDttos = distritos.features;

//         const distritosFiltrados = [];
//         for (let i = 0; i < datosDttos.length; i++) {
//             const distrito = datosDttos[i];
//             if (Number(distrito.properties.numero_dem) == Number(demarNum)) {
//                 distritosFiltrados.push(distrito);
//             }
//         }

//         distritosFiltrados.forEach(dato => {
//             const props = dato.properties;
//             const geom = dato.geometry;

//             const nombre = props.name;
//             const latitud = props.latitud;
//             const longitud = props.longitud;
//             const numeroDemar = props.numero_dem;

//             const paths = geom.coordinates[0].map(coord => ({
//                 lat: coord[1],
//                 lng: coord[0]
//             }));

//             const polyDttos = new google.maps.Polygon({
//                 paths: paths,
//                 strokeColor: 'rgba(236, 164, 39, 0.929)',
//                 strokeOpacity: 0.8,
//                 strokeWeight: 5,
//                 fillColor: 'rgba(236, 164, 39, 0.929)',
//                 fillOpacity: 0.0,
//                 latitud: latitud,
//                 longitud: longitud,
//                 nombre: nombre,
//                 numDemar: numeroDemar
//             });

//             polyDttos.setMap(mapaindex);
//             poligonosActuales.push(polyDttos);

//             const originalColor = 'rgb(236, 164, 39)';
//             const hoverColor = 'rgb(236, 164, 39)';

//             // Evento mouseover con tooltip que sigue al mouse
//             google.maps.event.addListener(polyDttos, 'mouseover', function (event) {
//                 this.setOptions({
//                     fillOpacity: 0.3,
//                     fillColor: hoverColor,
//                     strokeColor: hoverColor
//                 });

//                 // Usar la función específica para polígonos
//                 mostrarTooltipPoligono(this.nombre, this);
//             });

//             // Evento mouseout
//             google.maps.event.addListener(polyDttos, 'mouseout', function () {
//                 this.setOptions({
//                     fillOpacity: 0.0,
//                     fillColor: originalColor,
//                     strokeColor: originalColor
//                 });

//                 // Ocultar tooltip
//                 ocultarTooltip();
//             });

//             // Evento click
//             google.maps.event.addListener(polyDttos, 'click', function() {
//                 const numberDemar = polyDttos.numDemar;
//                 const nombreDtto = polyDttos.nombre;

//                 const bounds = new google.maps.LatLngBounds();
//                 this.getPath().forEach(function (latlng) {
//                     bounds.extend(latlng);
//                 });
//                 mapaindex.fitBounds(bounds);

//                 unidadesT(numberDemar, nombreDtto, demarcacionNombreSeleccionada); // PASAR NOMBRE DEMARCACIÓN
//             });
//         });

//         // Actualizar historial con demarcación seleccionada
//         historialDatos.demarcacion = nombreDemarcacion || `DEMARCACIÓN TERRITORIAL ${numeroDemar}`;
//         historialDatos.distrito = null;
//         historialDatos.unidad = null;
//         actualizarHistorial("distritos", historialDatos);

//     } catch (error) {
//         console.error("Error al cargar distritos:", error);
//     }
// }

// Función unidadesT modificada con tooltips
// QUITAMOS EL PARAMTRO DISTRITO
// async function unidadesT(demarcacion, distrito, nombreDemarcacion = null) {


// async function unidadesT(demarcacion, nombreDemarcacion = null) {
//     limpiarPoligonos();
//     nivelActual = "unidades";
//     toggleBotonRegresar(true);
//     actualizarMensajeInformacion("unidades");

//     // COMENTAMOS VARIABLES DE DITRITOS 
//     // const numDtto = distrito;
//     // const eliminar = "DISTRITO ELECTORAL LOCAL ";
//     // const dttoNum = numDtto.replace(eliminar, "");
//     // const dtto = parseInt(dttoNum);

//     const demar_uts = demarcacion;


//     try {
//         const uts = await fetchFromApi('geometries/participacion_uts', { limit: 1851, offset: 0 });
//         let datosUTS = uts.features;

//         // // QUITAMOS EL FILTRO DE DISTRITO Y DEMARCACION 
//         // const utsFiltradas = datosUTS.filter(ut => 
//         //     parseInt(ut.properties.cve_demarc) === demar_uts &&
//         //     parseInt(ut.properties.dtto_loc_d) === dtto
//         // );

//         // CAMBIAMOS EL FILTRO A SOLO DEMARCACIÓN
//         const utsFiltradas = datosUTS.filter(ut =>
//             parseInt(ut.properties.cve_demarc) === demar_uts
//         );

//         const featureCollection = {
//             type: "FeatureCollection",
//             features: utsFiltradas
//         };

//         // Limpiar datos anteriores del mapa
//         mapaindex.data.forEach(f => mapaindex.data.remove(f));
        

//         // Agregar y guardar los nuevos features
//         const features = mapaindex.data.addGeoJson(featureCollection);
//         features.forEach(feature => {
//             poligonosActuales.push(feature);
//         });

//         mapaindex.data.setStyle(function (feature) {
//             return {
//                 fillColor: 'rgba(0, 0, 0, 0.668)',
//                 fillOpacity: 0.0,
//                 strokeColor: 'rgba(0, 0, 0, 0.668)',
//                 strokeWeight: 5
//             };
//         });

async function unidadesT(demarcacion, nombreDemarcacion = null) {
    limpiarPoligonos();
    nivelActual = "unidades";
    toggleBotonRegresar(true);
    actualizarMensajeInformacion("unidades");

    const demar_uts = demarcacion;

    try {
        // ANTES: geometries/participacion_uts (traía TODAS las 1851 UTs)
        // AHORA: filter_2/participacion_uts (el backend ya filtra por demarcación)
        const uts = await fetchFromApi('filter_2/participacion_uts', {
            cve_demarc: demar_uts
        });

        // Ya no hace falta filtrar en JS, el backend regresa solo lo necesario
        const utsFiltradas = uts.features;

        const featureCollection = {
            type: "FeatureCollection",
            features: utsFiltradas
        };

        // Limpiar datos anteriores del mapa
        mapaindex.data.forEach(f => mapaindex.data.remove(f));

        // Agregar y guardar los nuevos features
        const features = mapaindex.data.addGeoJson(featureCollection);
        features.forEach(feature => {
            poligonosActuales.push(feature);
        });

        mapaindex.data.setStyle(function (feature) {
            return {
                fillColor: 'rgba(0, 0, 0, 0.668)',
                fillOpacity: 0.0,
                strokeColor: 'rgba(0, 0, 0, 0.668)',
                strokeWeight: 5
            };
        });

        // Función especial para tooltips en map.data - CORREGIDA
        function mostrarTooltipData(nombre, eventoInicial) {
            // Cerrar tooltip anterior
            if (tooltipActual) {
                tooltipActual.close();
                if (tooltipListener) {
                    google.maps.event.removeListener(tooltipListener);
                }
            }

            // Crear tooltip
            tooltipActual = new google.maps.InfoWindow({
                content: `<div style="font-family: Poppins, sans-serif; font-size: 12px; padding: 4px 8px; font-weight: bold; white-space: nowrap;">${nombre}</div>`,
                disableAutoPan: true,
                pixelOffset: new google.maps.Size(0, -20),
                headerDisabled: true,
                closeOnClick: false
            });

            siguiendoMouse = true;

            // SOLUCIÓN: Usar mousemove en map.data directamente
            tooltipListener = mapaindex.data.addListener('mousemove', function (event) {
                if (siguiendoMouse && tooltipActual) {
                    tooltipActual.setPosition(event.latLng);
                    if (!tooltipActual.getMap()) {
                        tooltipActual.open(mapaindex);
                    }
                }
            });

            // Posición inicial del evento
            tooltipActual.setPosition(eventoInicial.latLng);
            tooltipActual.open(mapaindex);
        }

        // Evento mouseover con tooltip para map.data - CORREGIDO
        mapaindex.data.addListener('mouseover', function (event) {
            mapaindex.data.overrideStyle(event.feature, {
                fillOpacity: 0.3,
                strokeColor: 'rgba(0, 0, 0, 0.47)'
            });

            // Obtener nombre de la UT
            const nombreUt = event.feature.Eg?.nombre ||
                event.feature.getProperty('nombre') ||
                'UT Sin nombre';

            // Pasar el evento completo para obtener latLng inicial
            mostrarTooltipData(nombreUt, event);
        });

        // Evento mouseout
        mapaindex.data.addListener('mouseout', function (event) {
            mapaindex.data.revertStyle(event.feature);

            // Ocultar tooltip
            ocultarTooltip();
        });

        //NUEVAS UTS
        const utsNuevaCreacion = [
            "02-115", "03-171", "03-172", "03-173",
            "04-061", "06-065", "07-324", "07-325",
            "07-326", "07-327", "10-261", "10-262",
            "12-227", "12-228"
        ];            

        
        // Evento click
        mapaindex.data.addListener('click', function (event) {
            ocultarTooltip();
            infoWindowAbierto = true;

            

            const cve_demarc = event.feature.getProperty('cve_demarc');
            const clave = event.feature.getProperty('cve_ut');
            const esNuevaCreacion = utsNuevaCreacion.includes(clave);
            const demTerr = event.feature.getProperty('dem_terr');
            const dtto = event.feature.getProperty('dtto_loc');
            const nombreUt = event.feature.getProperty('nombre');
            const latitud = event.feature.getProperty('latitud');
            const longitud = event.feature.getProperty('longitud');
            const tipoUt = event.feature.getProperty('tipo_ut') || 'UT';
            const seccionesCom = event.feature.getProperty('secciones');
            const seccionesPar = event.feature.getProperty('secciones1');
            const listanom = event.feature.getProperty('ln_30_abr');
            const tot_particip = event.feature.getProperty('participacion');
            const particip_h = event.feature.getProperty('part_h');
            const particip_m = event.feature.getProperty('part_m');
            const particip_f = event.feature.getProperty('part_f');
            const proyecG_24 = event.feature.getProperty('pgn_24');
            const proyecG_25 = event.feature.getProperty('pgn_25');
            const monto = event.feature.getProperty('monto');

            const posicion = new google.maps.LatLng(latitud, longitud);
            mapaindex.setZoom(16);
            mapaindex.panTo(posicion);

            // UT que deben mostrar "(Antes ...)"
            const utsAntes = {
                "02-032": "HOGAR Y SEGURIDAD / NUEVA SANTA MARIA",
                "03-100": "SAN DIEGO CHURUBUSCO",
                "03-103": "SAN LUCAS (BARR)",
                "03-153": "TAXQUEÑA",
                "10-206": "TARANGO (U HAB)",
                "12-195": "VILLA OLIMPICA LIBERADOR MIGUEL HIDALGO (U HAB)",
                "02-079": "SAN JUAN TLIHUACA (PBLO)",
                "02-069": "SAN MIGUEL AMANTLA (PBLO)",
                "03-066": "LA MAGDALENA CULHUACAN (BARR)",
                "03-101": "SAN FRANCISCO CULHUACAN (PBLO)",
                "03-078": "PUEBLO DE LOS REYES HUEYTLILAC",
                "03-105": "SAN PABLO TEPETLAPA (PBLO)",
                "05-170": "SANTA ISABEL TOLA (PBLO)",
                "05-151": "SAN BARTOLO ATEPEHUACAN (PBLO)",
                "05-093": "LA CANDELARIA TICOMAN (BARR)",
                "05-104": "LA LAGUNA TICOMAN (BARR)",
                "05-111": "LA PURISIMA TICOMAN (BARR)",
                "05-169": "SAN RAFAEL TICOMAN (BARR)",
                "05-164": "SAN JUAN Y GUADALUPE TICOMÁN (BARR)",
                "05-033": "CUAUTEPEC DE MADERO",
                "05-034": "CUAUTEPEC EL ALTO (PBLO)",
                "06-032": "SANTA ANITA",
                "06-016": "LA ASUNCION (BARR)",
                "06-018": "LOS REYES (BARR)",
                "06-029": "SAN FCO XICALTONGO (BARR)",
                "06-030": "SAN MIGUEL (BARR)",
                "06-033": "SANTA CRUZ (BARR)",
                "06-034": "SANTIAGO NORTE (BARR)",
                "06-039": "ZAPOTLA (BARR)",
                "06-035": "SANTIAGO SUR (BARR)",
                "07-087": "GUADALUPE (BARR)",
                "07-177": "SAN ANTONIO (BARR)",
                "07-190": "SAN LORENZO TEZONCO (BARR)",
                "07-191": "SAN LORENZO TEZONCO (PBLO)",
                "09-012": "VILLA MILPA ALTA (PBLO)",
                "10-024": "AXOTLA",
                "10-200": "SANTA LUCIA",
                "12-020": "CHIMALCOYOC",
                "14-044": "SAN SIMON TICUMAC"
            };

            
            const utsConPDF = [
                "02-079", "02-069", "03-066", "03-101", "03-078", "03-105",
                "05-170", "05-151", "05-093", "05-104", "05-111", "05-169",
                "05-164", "05-033", "05-034", "06-032", "06-016", "06-018",
                "06-029", "06-030", "06-033", "06-034", "06-039", "06-035",
                "07-087", "07-177", "07-190", "07-191", "09-012", "10-024",
                "10-200", "12-020", "14-044"
            ];

            
            const iconoPDF = `
                <a href="javascript:void(0)"
                onclick="window.open('./IECM-ACU-CG-110-2025.pdf', '_blank')"
                style="display:flex; align-items:center; gap:6px; text-decoration:none; cursor:pointer;">
                    
                    <svg width="18" height="18" viewBox="0 0 24 24" stroke="#b30000" fill="none" stroke-width="2">
                        <path d="M6 2h9l5 5v13a2 2 0 
                                0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.1.9-2 
                                2-2z"/>
                        <path d="M14 2v6h6"/>
                        <text x="7" y="17" font-size="7" fill="#b30000">PDF</text>
                    </svg>

                    <span style="font-size:12px; color:#b30000; font-weight:600;">
                        Ver Acuerdo
                    </span>
                </a>
            `;

            const textoAhoraSEPI = 'de acuerdo con la información proporcionada por la SEPI';

            let nombreUtMostrado = nombreUt;

            
            let bloquePDF = "";

            if (utsConPDF.includes(clave)) {
                bloquePDF = iconoPDF;
            }


            if (utsAntes[clave]) {

                // Caso especial: UT con PDF → formato invertido
                if (utsConPDF.includes(clave)) {
                    nombreUtMostrado = `${utsAntes[clave]} <br><br> (Ahora ${nombreUt}, ${textoAhoraSEPI})`;
                } 
                // Caso normal → formato actual
                else {
                    nombreUtMostrado = `${nombreUt} (ANTES ${utsAntes[clave]})`;
                }
            }

            // Detectar si es móvil
            const isMobile = window.innerWidth <= 768;

            const contenidoUTNueva = `
                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    border: 2px solid rgba(153,102,204,0.3);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center; /* centrado vertical */
                    align-items: center;      /* centrado horizontal */
                    text-align: center;
                ">
                    <h3 style="color:#6B1985; font-size: 16px; font-weight:700;">
                        Unidad Territorial de Nueva Creación
                    </h3>

                    <p style="color:#444; font-size:13px; line-height:1.5; margin-top:10px;">
                        Esta Unidad Territorial es de nueva creación.  
                        Consulta más información en el siguiente enlace:
                    </p>

                    <a href="https://www.iecm.mx/www/taip/cg/acu/2025/IECM-ACU-CG-100-2025.pdf"
                    target="_blank"
                    style="
                            display:inline-block;
                            margin-top:14px;
                            padding:10px 18px;
                            background:#9129A2;
                            color:white;
                            font-size:13px;
                            font-weight:700;
                            border-radius:8px;
                            text-decoration:none;
                    ">
                        Consultar documento
                    </a>
                </div>
            `;


            const contenido = `
                    <style>
                        .gm-style .gm-style-iw-tc::after {
                            background: #ffffff00 !important;
                        }

                        /* Sobrescribir estilos de Google Maps InfoWindow */
                        .gm-style .gm-style-iw-c {
                            max-width: ${isMobile ? '80vw' : '800px'} !important;
                            max-height: none !important;
                            padding: 0 !important;
                            ${isMobile ? 'border-radius: 0 !important;' : ''}
                            z-index: 99998 !important; /*- Asegurar que esté sobre todo */
                        }
                        
                        .gm-style .gm-style-iw-d {
                            overflow: auto !important;
                            max-height: ${isMobile ? '60vh' : 'none'} !important;
                            overflow-x: hidden !important; /*- Eliminar scroll horizontal */
                        }

                        /*- Eliminar padding que causa scroll horizontal */
                        .gm-style .gm-style-iw-d::-webkit-scrollbar {
                            width: 6px; /* Scrollbar más delgado */
                        }

                        .gm-style .gm-style-iw-d::-webkit-scrollbar-thumb {
                            background: rgba(153, 102, 204, 0.5);
                            border-radius: 3px;
                        }

                        /* Asegurar z-index del contenedor padre */
                        .gm-style-iw-tc {
                            z-index: 99998 !important;
                        }
                        
                        .gm-style-iw {
                            max-width: ${isMobile ? '70vw' : '800px'} !important;
                        }

                        /* Botón de cerrar en móvil */
                    
                        
                        @keyframes infoWindowAppear {
                            from {
                                opacity: 0;
                                transform: ${isMobile ? 'translateY(100%)' : 'scale(0.8)'};
                            }
                            to {
                                opacity: 1;
                                transform: ${isMobile ? 'translateY(0)' : 'scale(1)'};
                            }
                        }
                    </style>
                    
                    <div style="
                        font-family: 'Poppins', sans-serif; 
                        width: ${isMobile ? '100%' : '760px'};  /* CAMBIAR de 100vw a 100% */
                        max-width: ${isMobile ? '100%' : '760px'};  /* CAMBIAR de 100vw a 100% */
                        background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
                        border-radius: ${isMobile ? '0' : '16px'};
                        overflow: visible;
                        box-shadow: ${isMobile ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.15)'};
                        border: none;
                        opacity: 0;
                        transform: ${isMobile ? 'translateY(100%)' : 'scale(0.8)'};
                        animation: infoWindowAppear 0.4s ease-out forwards;
                        box-sizing: border-box; /* NUEVO - Importante para el cálculo correcto */
                    ">
                        
                        <!-- Header con título principal -->
                        <div style="
                            background: linear-gradient(135deg, rgba(153, 102, 204, 0.95), #9129A2);
                            color: white;
                            padding: ${isMobile ? '16px 12px' : '14px 20px'};
                            text-align: center;
                            position: relative;
                        ">
                            <div style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                height: 3px;
                                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
                            "></div>
                            <h3 style="
                                margin: 0;
                                font-size: ${isMobile ? '13px' : '14px'};
                                font-weight: 700;
                                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                                letter-spacing: 0.5px;
                                line-height: 1.4;
                            ">DATOS GEOELECTORALES Y DE PARTICIPACIÓN CIUDADANA</h3>
                        </div>

                        <!-- Contenido principal -->
                        <div style="padding: ${isMobile ? '12px' : '16px 20px'};">
                            
                            <!-- Nombre de la UT -->
                            <div style="
                                text-align: center;
                                margin-bottom: ${isMobile ? '12px' : '14px'};
                                padding: ${isMobile ? '10px' : '12px'};
                                background: linear-gradient(135deg, rgba(153, 102, 204, 0.15), rgba(145, 41, 162, 0.15));
                                border-radius: 10px;
                                border: 2px solid rgba(153, 102, 204, 0.4);
                            ">
                                
                            <div style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                gap:8px;
                                font-size:${isMobile ? '15px' : '17px'};
                                color:#6B1985;
                                font-weight:700;
                                line-height:1.3;
                                flex-wrap:wrap;
                            ">
                                <span>${nombreUtMostrado}</span>
                                ${bloquePDF}
                            </div>

                            </div>

                            <!-- Grid 3 columnas: Demarcación, Distrito, Clave -->
                            <div style="
                                display: grid; 
                                grid-template-columns: ${isMobile ? '1fr' : 'repeat(3, 1fr)'}; 
                                gap: ${isMobile ? '8px' : '10px'}; 
                                margin-bottom: ${isMobile ? '12px' : '14px'};
                            ">
                                <div style="
                                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                                    padding: ${isMobile ? '12px' : '10px'};
                                    border-radius: 8px;
                                    border-bottom: 3px solid rgba(153, 102, 204, 0.9);
                                    text-align: center;
                                ">
                                    <div style="
                                        font-size: ${isMobile ? '10px' : '9px'}; 
                                        color: #666; 
                                        font-weight: 600; 
                                        margin-bottom: 5px; 
                                        text-transform: uppercase;
                                        letter-spacing: 0.3px;
                                    ">Demarcación</div>
                                    <div style="font-size: ${isMobile ? '14px' : '13px'}; color: #2c3e50; font-weight: 700; line-height: 1.2;">${demTerr}</div>
                                </div>

                                <div style="
                                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                                    padding: ${isMobile ? '12px' : '10px'};
                                    border-radius: 8px;
                                    border-bottom: 3px solid #9129A2;
                                    text-align: center;
                                ">
                                    <div style="
                                        font-size: ${isMobile ? '10px' : '9px'}; 
                                        color: #666; 
                                        font-weight: 600; 
                                        margin-bottom: 5px; 
                                        text-transform: uppercase;
                                        letter-spacing: 0.3px;
                                    ">Distrito Local</div>
                                    <div style="font-size: ${isMobile ? '14px' : '13px'}; color: #2c3e50; font-weight: 700;">${dtto}</div>
                                </div>

                                <div style="
                                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                                    padding: ${isMobile ? '12px' : '10px'};
                                    border-radius: 8px;
                                    border-bottom: 3px solid #6B1985;
                                    text-align: center;
                                ">
                                    <div style="
                                        font-size: ${isMobile ? '10px' : '9px'}; 
                                        color: #666; 
                                        font-weight: 600; 
                                        margin-bottom: 5px; 
                                        text-transform: uppercase;
                                        letter-spacing: 0.3px;
                                    ">Clave UT</div>
                                    <div style="font-size: ${isMobile ? '14px' : '13px'}; color: #2c3e50; font-weight: 700;">${clave}</div>
                                </div>
                            </div>

                            <!-- Grid 2 columnas: Información Electoral + Participación/Proyectos -->
                            <div style="
                                display: grid; 
                                grid-template-columns: ${isMobile ? '1fr' : '48% 50%'}; 
                                gap: ${isMobile ? '10px' : '2%'}; 
                                margin-bottom: ${isMobile ? '12px' : '14px'}; 
                                align-items: start;
                            ">
                                
                                <!-- Columna izquierda: Información Electoral + Monto -->
                                <div style="display: flex; flex-direction: column; gap: 10px; height: 100%;">
                                    
                                    <!-- Información Electoral -->
                                    <div style="
                                        background: linear-gradient(135deg, rgba(153, 102, 204, 0.08), rgba(145, 41, 162, 0.08));
                                        border-radius: 10px;
                                        padding: ${isMobile ? '10px' : '12px'};
                                        border: 1px solid rgba(153, 102, 204, 0.25);
                                    ">
                                        <div style="
                                            font-size: ${isMobile ? '11px' : '10px'};
                                            color: #6B1985;
                                            font-weight: 700;
                                            margin-bottom: 10px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.5px;
                                        ">
                                            INFORMACIÓN ELECTORAL
                                        </div>
                                        
                                        <!-- Secciones -->
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                                            <div style="
                                                background: white; 
                                                padding: ${isMobile ? '12px' : '10px'}; 
                                                border-radius: 6px; 
                                                border-left: 3px solid rgba(153, 102, 204, 0.9);
                                            ">
                                                <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600; text-align: center;">
                                                    Secciones Completas
                                                </div>
                                                <div style="
                                                    font-size: ${isMobile ? '13px' : '11px'}; 
                                                    color: rgba(153, 102, 204, 0.9); 
                                                    font-weight: 700;
                                                    text-align: center;
                                                    line-height: 1.4;
                                                    word-wrap: break-word;
                                                ">
                                                    ${seccionesCom ?? '--'}
                                                </div>
                                            </div>
                                            
                                            <div style="
                                                background: white; 
                                                padding: ${isMobile ? '12px' : '10px'}; 
                                                border-radius: 6px; 
                                                border-left: 3px solid #9129A2;
                                            ">
                                                <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600; text-align: center;">
                                                    Secciones Parciales
                                                </div>
                                                <div style="
                                                    font-size: ${isMobile ? '13px' : '11px'}; 
                                                    color: #9129A2; 
                                                    font-weight: 700;
                                                    text-align: center;
                                                    line-height: 1.4;
                                                    word-wrap: break-word;
                                                ">
                                                    ${seccionesPar ?? '--'}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Lista Nominal -->
                                        <div style="background: white; padding: ${isMobile ? '12px' : '10px'}; border-radius: 6px; text-align: center; border-left: 3px solid #6B1985;">
                                            <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600;">Lista Nominal (Corte al 30 de Abril de 2026)</div>
                                            <div style="font-size: ${isMobile ? '20px' : '18px'}; color: #6B1985; font-weight: 700;">${listanom ? Number(listanom).toLocaleString() : 'Sin registro'}</div>
                                        </div>
                                    </div>

                                    <!-- Monto Asignado -->
                                    <div style="
                                        background: linear-gradient(135deg, rgba(40, 167, 69, 0.08), rgba(25, 135, 84, 0.08));
                                        border-radius: 10px;
                                        padding: ${isMobile ? '10px' : '12px'};
                                        border: 1px solid rgba(40, 167, 69, 0.25);
                                        flex-grow: 1;
                                        display: flex;
                                        flex-direction: column;
                                    ">
                                        <div style="
                                            font-size: ${isMobile ? '11px' : '10px'};
                                            color: #198754;
                                            font-weight: 700;
                                            margin-bottom: 8px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.5px;
                                            text-align: center;
                                        ">
                                            MONTO ASIGNADO (2025)
                                        </div>
                                        
                                        <div style="
                                            background: white;
                                            padding: ${isMobile ? '14px' : '12px'};
                                            border-radius: 6px;
                                            text-align: center;
                                            border: 2px solid rgba(40, 167, 69, 0.4);
                                            flex-grow: 1;
                                            display: flex;
                                            flex-direction: column;
                                            justify-content: center;
                                        ">
                                            <div style="
                                                font-size: ${isMobile ? '22px' : '20px'}; 
                                                color: #198754; 
                                                font-weight: 700;
                                                line-height: 1.2;
                                            ">
                                                ${monto || 'Sin registro'}
                                            </div>
                                            <div style="
                                                font-size: ${isMobile ? '8px' : '7px'}; 
                                                color: #666; 
                                                margin-top: 3px; 
                                                font-weight: 500;
                                                text-transform: uppercase;
                                                letter-spacing: 0.3px;
                                            ">
                                                Presupuesto Participativo
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Columna derecha: Participación y Proyectos O Mensaje para PO -->
                                ${
                                    esNuevaCreacion
                                    ? contenidoUTNueva
                                    : (tipoUt === 'PO' ? `
                                    <!-- Mensaje especial para Pueblos Originarios -->
                                    <div style="
                                        display: flex;
                                        flex-direction: column;
                                        gap: 10px;
                                        height: 100%;
                                    ">
                                        <div style="
                                            background: linear-gradient(135deg, rgba(153, 102, 204, 0.08), rgba(107, 25, 133, 0.08));
                                            border-radius: 10px;
                                            padding: ${isMobile ? '14px' : '16px'};
                                            border: 2px solid rgba(153, 102, 204, 0.3);
                                            display: flex;
                                            flex-direction: column;
                                            justify-content: center;
                                            align-items: center;
                                            gap: 12px;
                                            flex: 1;
                                        ">
                                            <!-- Icono -->
                                            <div style="
                                                width: ${isMobile ? '45px' : '50px'};
                                                height: ${isMobile ? '45px' : '50px'};
                                                background: linear-gradient(135deg, rgba(153, 102, 204, 0.95), #9129A2);
                                                border-radius: 50%;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                box-shadow: 0 3px 12px rgba(153, 102, 204, 0.4);
                                            ">
                                                <svg style="width: ${isMobile ? '24px' : '26px'}; height: ${isMobile ? '24px' : '26px'}; fill: white;" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                                </svg>
                                            </div>

                                            <!-- Título -->
                                            <div style="
                                                font-size: ${isMobile ? '10.5px' : '11px'};
                                                color: #6B1985;
                                                font-weight: 700;
                                                text-align: center;
                                                text-transform: uppercase;
                                                letter-spacing: 0.6px;
                                                line-height: 1.4;
                                            ">
                                                UNIDAD TERRITORIAL INTEGRADA POR PUEBLO ORIGINARIO
                                            </div>

                                            <!-- Mensaje -->
                                            <div style="
                                                background: white;
                                                padding: ${isMobile ? '14px' : '12px'};
                                                border-radius: 8px;
                                                border-left: 3px solid rgba(153, 102, 204, 0.9);
                                                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
                                                width: 100%;
                                            ">
                                                <p style="
                                                    margin: 0 0 10px 0;
                                                    font-size: ${isMobile ? '10.5px' : '9.5px'};
                                                    color: #555;
                                                    line-height: 1.6;
                                                    text-align: justify;
                                                ">
                                                    La determinación del proyecto, se realiza por medio de sus Autoridades Tradicionales y/o Representativas, de conformidad con el método que consideren en apego a sus sistemas normativos, reglas y/o formas de organización internas y procedimientos, en cumplimiento al acuerdo IECM-ACU-CG-010-2025 del Consejo General del IECM.
                                                </p>
                                                
                                                <a href="https://www.iecm.mx/www/docs/consulta2025/Convocatoria-PO.pdf" 
                                                target="_blank"
                                                style="
                                                    display: inline-block;
                                                    width: 100%;
                                                    padding: ${isMobile ? '11px 14px' : '9px 14px'};
                                                    background: linear-gradient(135deg, rgba(153, 102, 204, 0.95), #9129A2);
                                                    color: white;
                                                    text-decoration: none;
                                                    border-radius: 5px;
                                                    font-size: ${isMobile ? '10px' : '9px'};
                                                    font-weight: 600;
                                                    text-align: center;
                                                    text-transform: uppercase;
                                                    letter-spacing: 0.5px;
                                                    transition: all 0.3s ease;
                                                    box-shadow: 0 2px 8px rgba(153, 102, 204, 0.3);
                                                    font-weight: bold;
                                                "
                                                onmouseover="
                                                    this.style.transform = 'translateY(-2px)';
                                                    this.style.boxShadow = '0 4px 12px rgba(153, 102, 204, 0.5)';
                                                "
                                                onmouseout="
                                                    this.style.transform = 'translateY(0)';
                                                    this.style.boxShadow = '0 2px 8px rgba(153, 102, 204, 0.3)';
                                                ">
                                                    CONSULTA AQUÍ PARA MÁS INFORMACIÓN
                                                </a>
                                            </div>

                                            <!-- Nota adicional 
                                            <div style="
                                                font-size: ${isMobile ? '9px' : '8px'};
                                                color: #7a7a7a;
                                                text-align: center;
                                                font-style: italic;
                                                line-height: 1.5;
                                                background: rgba(153, 102, 204, 0.05);
                                                border-radius: 5px;
                                                padding: ${isMobile ? '8px 10px' : '6px 10px'};
                                            ">
                                                Información de participación ciudadana y presupuesto participativo disponible en el enlace
                                            </div> -->
                                        </div>
                                    </div>
                                    ` : `
                                    <!-- Contenido normal para UT -->
                                    <div style="display: flex; flex-direction: column; gap: 10px; height: 100%;">
                                        
                                        <!-- Participación Ciudadana -->
                                        <div style="
                                            background: linear-gradient(135deg, rgba(204, 102, 153, 0.12), rgba(153, 102, 204, 0.12));
                                            border-radius: 10px;
                                            padding: ${isMobile ? '10px' : '12px'};
                                            border: 1px solid rgba(204, 102, 153, 0.3);
                                            flex: 1;
                                            display: flex;
                                            flex-direction: column;
                                        ">
                                            <div style="
                                                font-size: ${isMobile ? '11px' : '10px'};
                                                color: #9129A2;
                                                font-weight: 700;
                                                margin-bottom: 10px;
                                                text-transform: uppercase;
                                                letter-spacing: 0.3px;
                                            ">
                                                PARTICIPACIÓN 2025
                                            </div>
                                            
                                            <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '43% 55%'}; gap: ${isMobile ? '8px' : '2%'}; flex-grow: 1; align-items: center;">
                                                <!-- Total -->
                                                <div style="
                                                    background: white;
                                                    padding: ${isMobile ? '12px' : '10px'};
                                                    border-radius: 6px;
                                                    text-align: center;
                                                    border: 2px solid rgba(153, 102, 204, 0.3);
                                                    display: flex;
                                                    flex-direction: column;
                                                    justify-content: center;
                                                    height: 100%;
                                                ">
                                                    <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600;">Total</div>
                                                    <div style="font-size: ${isMobile ? '32px' : '28px'}; color: rgba(204, 102, 153, 0.9); font-weight: 700;">
                                                        ${tot_particip ? Number(tot_particip).toFixed(1) + '%' : '-'}
                                                    </div>
                                                </div>

                                                <!-- Desglose -->
                                                <div style="display: flex; flex-direction: column; gap: 6px; justify-content: center;">
                                                    <div style="background: white; padding: ${isMobile ? '10px' : '8px 10px'}; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                                        <span style="font-size: ${isMobile ? '10px' : '9px'}; color: #666; font-weight: 600;">Hombres</span>
                                                        <span style="font-size: ${isMobile ? '15px' : '13px'}; color: #4a90e2; font-weight: 700;">
                                                            ${particip_h ? Number(particip_h).toFixed(1) + '%' : '-'}
                                                        </span>
                                                    </div>
                                                    <div style="background: white; padding: ${isMobile ? '10px' : '8px 10px'}; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                                        <span style="font-size: ${isMobile ? '10px' : '9px'}; color: #666; font-weight: 600;">Mujeres</span>
                                                        <span style="font-size: ${isMobile ? '15px' : '13px'}; color: #e24a90; font-weight: 700;">
                                                            ${particip_m ? Number(particip_m).toFixed(1) + '%' : '-'}
                                                        </span>
                                                    </div>
                                                    <div style="background: white; padding: ${isMobile ? '10px' : '8px 10px'}; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                                        <span style="font-size: ${isMobile ? '10px' : '9px'}; color: #666; font-weight: 600;">Opinantes de otra ${isMobile ? '' : '<br>'} entidad de origen</span>
                                                        <span style="font-size: ${isMobile ? '15px' : '13px'}; color: #e2904a; font-weight: 700;">
                                                            ${particip_f ? Number(particip_f).toFixed(1) + '%' : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Proyectos Ganadores -->
                                        <div style="
                                            background: linear-gradient(135deg, rgba(107, 25, 133, 0.1), rgba(74, 16, 96, 0.1));
                                            border-radius: 10px;
                                            padding: ${isMobile ? '10px' : '12px'};
                                            border: 1px solid rgba(107, 25, 133, 0.3);
                                            flex: 1;
                                            display: flex;
                                            flex-direction: column;
                                        ">
                                            <div style="
                                                font-size: ${isMobile ? '11px' : '10px'};
                                                color: #6B1985;
                                                font-weight: 700;
                                                margin-bottom: 10px;
                                                text-transform: uppercase;
                                                letter-spacing: 0.5px;
                                            ">
                                                PRESUPUESTO PARTICIPATIVO
                                            </div>
                                            
                                            <div style="display: grid; gap: 10px; flex-grow: 1;">
                                                <!-- <div style="
                                                    grid-template-columns: 1fr 1fr; 
                                                    background: white;
                                                    padding: ${isMobile ? '10px' : '10px'};
                                                    border-radius: 6px;
                                                    border-left: 3px solid #6B1985;
                                                    display: flex;
                                                    flex-direction: column;
                                                    justify-content: center;
                                                ">
                                                    <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 6px; font-weight: 600;">
                                                        Ganador 2024
                                                    </div>
                                                    <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #6B1985; font-weight: 600; line-height: 1.3;">
                                                        ${proyecG_24 ?? 'Sin registro'}
                                                    </div>
                                                </div> -->

                                                <div style="
                                                    background: white;
                                                    padding: ${isMobile ? '10px' : '10px'};
                                                    border-radius: 6px;
                                                    border-left: 3px solid #9129A2;
                                                    display: flex;
                                                    flex-direction: column;
                                                    justify-content: center;
                                                ">
                                                <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 6px; font-weight: 600;">
                                                    Ganador 2025
                                                </div>
                                                <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #9129A2; font-weight: 600; line-height: 1.3;">
                                                    ${proyecG_25 ?? 'Sin registro'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            `)
                            }
                        </div>

                        <!-- Botón de acción -->
                        <button onclick="estadisticas('${clave}', '${cve_demarc}', '${demTerr}')" style="
                            width: 100%;
                            padding: ${isMobile ? '14px 20px' : '12px 20px'};
                            background: linear-gradient(180deg, rgba(153, 102, 204, 0.95), rgba(133, 82, 184, 0.95));
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: ${isMobile ? '13px' : '12px'};
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 10px rgba(0,0,0,0.25);
                        " 
                        onmouseover="
                            this.style.transform = 'translateY(-2px)';
                            this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px rgba(153, 102, 204, 0.5)';
                        " 
                        onmouseout="
                            this.style.transform = 'translateY(0)';
                            this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 10px rgba(0,0,0,0.25)';
                        " 
                        onmousedown="
                            this.style.transform = 'translateY(1px)';
                            this.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)';
                        " 
                        onmouseup="
                            this.style.transform = 'translateY(-2px)';
                            this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px rgba(153, 102, 204, 0.5)';
                        ">
                            Consultar Sociodemográficos
                        </button>
                    </div>
                </div>
            `;

            ocultarTooltip();
            // if (window.infoWindow) window.infoWindow.close();
            // window.infoWindow = new google.maps.InfoWindow({
            //     content: contenido,
            //     position: posicion,
            //     disableAutoPan: false,
            //     pixelOffset: new google.maps.Size(0, -10)
            // });

            if (window.infoWindow) window.infoWindow.close();
            window.infoWindow = new google.maps.InfoWindow({
                content: contenido,
                position: posicion,
                disableAutoPan: false,
                pixelOffset: new google.maps.Size(0, isMobile ? -5 : 300)

            });

            window.infoWindow.open(mapaindex);

            // Ajustar el mapa después de abrir el InfoWindow en móvil
            if (isMobile) {
                google.maps.event.addListenerOnce(window.infoWindow, 'domready', function () {
                    // Centrar el mapa considerando el espacio del InfoWindow
                    setTimeout(() => {
                        mapaindex.panTo(posicion);
                        mapaindex.panBy(0, -320); // Ajustar el centrado para que el InfoWindow no tape el punto
                    }, 100);
                });
            }

            google.maps.event.addListener(window.infoWindow, 'closeclick', function () {
                infoWindowAbierto = false;
            });

            window.infoWindow.open(mapaindex);

            // ACTUALIZAMOS EL HISTORIAL DE PROPIEDADES EXTRAIDO 
            historialDatos.demarcacion = nombreDemarcacion || `DEMARCACIÓN TERRITORIAL ${demarcacion}`;
            historialDatos.distrito = `DISTRITO ELECTORAL LOCAL ${dtto}`;
            historialDatos.unidad = nombreUt;
            actualizarHistorial("unidades", historialDatos);
        });

        // QUITAMOS EL HISTORIAL ANTERIOR Y AJUSTAMOS AL NUEVO
        // Actualizar historial con demarcación y distrito
        // historialDatos.demarcacion = nombreDemarcacion || `DEMARCACIÓN TERRITORIAL ${demarcacion}`;
        // historialDatos.distrito = distrito;
        // historialDatos.unidad = null;
        // actualizarHistorial("unidades", historialDatos);

        // AL FINAL de la función unidadesT(), REEMPLAZAR:
        historialDatos.demarcacion = nombreDemarcacion || `DEMARCACIÓN TERRITORIAL ${demarcacion}`;
        historialDatos.distrito = null; // Inicialmente null
        historialDatos.unidad = null;   // Inicialmente null
        actualizarHistorial("unidades", historialDatos);



    } catch (error) {
        console.error("Error al cargar unidades territoriales:", error);
    }
}

function estadisticas(cve, cve_demarcacion, demTerr) {

    if (cve !== null && cve_demarcacion !== null && demTerr !== null) {

        sessionStorage.setItem('NomDem', demTerr);
        sessionStorage.setItem('claveUT', cve);
        sessionStorage.setItem('claveDemarcacion', cve_demarcacion);
        window.open('vistas/estadisticas.html', '_blank');

    }

}

// Función para limpiar polígonos, tooltips y listeners
function limpiarPoligonos() {
    // Cerrar tooltip y detener seguimiento
    ocultarTooltip();

    poligonosActuales.forEach((p) => {
        if (p instanceof google.maps.Polygon) {
            p.setMap(null);
        } else if (p instanceof google.maps.Data.Feature) {
            mapaindex.data.remove(p);
        }
    });

    // Limpiar todos los features del data layer
    mapaindex.data.forEach(feature => {
        mapaindex.data.remove(feature);
    });

    poligonosActuales = [];
}


function ajustarZoomParaNivel(nivel) {
    const centro = { lat: 19.336190823601026, lng: -99.14025476586043 }; // Centro de CDMX

    switch (nivel) {
        case "demarcaciones":
            mapaindex.setCenter(centro);
            mapaindex.setZoom(11);
            break;
        // ELIMANOS EL NIVEL DE DISTRITOS
        // case "distritos":
        //     // Mantener el centro actual pero ajustar zoom para ver la demarcación completa
        //     mapaindex.setZoom(12);
        //     break;
        case "unidades":
            // El zoom ya se maneja individualmente en cada clic
            break;
    }
}

// 3. Función toggleBotonRegresar ACTUALIZADA (sin cambios, pero para asegurar compatibilidad)
function toggleBotonRegresar(mostrar) {
    const btn = document.getElementById("btnRegresar");
    if (btn) {
        btn.style.display = mostrar ? "block" : "none";
    }
}


// 2. Función actualizarMensajeInformacion ACTUALIZADA para la nueva estructura
function actualizarMensajeInformacion(nivel) {
    const infoDiv = document.getElementById('informacion-poligonos');
    if (infoDiv) {
        switch (nivel) {
            case "demarcaciones":
                infoDiv.innerText = "Selecciona tu Demarcación";
                break;
            case "distritos":
                infoDiv.innerText = "Selecciona tu Distrito Electoral Local";
                break;
            case "unidades":
                infoDiv.innerText = "Selecciona tu Unidad Territorial";
                break;
            case "ut-seleccionada":
            case "uts-duplicadas":
                infoDiv.innerText = "Selecciona tu Unidad Territorial";
                break;
            default:
                infoDiv.innerText = "Selecciona tu Demarcación";
        }
    }
}



/*********************************************************************************
                      APARTADO DEL BUSCADOR 
**********************************************************************************/

async function unidadesTerritoriales() {
    try {
        const Uts = await fetchFromApi('geometries/participacion_uts', { limit: 1851, offset: 0 });
        const datosUts = Uts.features;

        // Limpiar arrays
        uts.length = 0;
        seccionesUnicas.clear();
        seccionesDuplicadas.clear();

        datosUts.forEach(ut => {
            const props = ut.properties;

            // Almacenar UT completa (ya viene como GeoJSON Feature)
            uts.push(ut);

            // Procesar secciones y secciones1
            procesarSecciones(props.secciones, ut, 'secciones');
            procesarSecciones(props.secciones1, ut, 'secciones1');
        });

        // Clasificar secciones
        clasificarSecciones();

        // Llenar el datalist con nombres de UTs para secciones duplicadas
        llenarDatalistUTs();

    } catch (error) {
        console.error("Error al cargar unidades territoriales:", error);
    }
}

function procesarSecciones(seccionesStr, utFeature, tipo) {
    if (!seccionesStr) return;

    // Separar secciones por comas y limpiar espacios
    const secciones = seccionesStr.split(',').map(s => s.trim()).filter(s => s);

    secciones.forEach(seccion => {
        const utData = {
            feature: utFeature,
            tipo: tipo
        };

        if (!seccionesUnicas.has(seccion) && !seccionesDuplicadas.has(seccion)) {
            // Primera vez que aparece esta sección
            seccionesUnicas.set(seccion, utData);
        } else if (seccionesUnicas.has(seccion)) {
            // Segunda vez - mover a duplicadas
            const utExistente = seccionesUnicas.get(seccion);
            seccionesUnicas.delete(seccion);
            seccionesDuplicadas.set(seccion, [utExistente, utData]);
        } else if (seccionesDuplicadas.has(seccion)) {
            // Ya está en duplicadas - agregar más
            seccionesDuplicadas.get(seccion).push(utData);
        }
    });
}

function clasificarSecciones() {
    console.log(`Secciones únicas: ${seccionesUnicas.size}`);
    console.log(`Secciones duplicadas: ${seccionesDuplicadas.size}`);
}

function llenarDatalistUTs() {
    const datalist = document.getElementById("sugerencias-uts");
    if (!datalist) return;

    datalist.innerHTML = "";

    // Solo agregar nombres de UTs para secciones duplicadas
    const utsUnicas = new Set();
    seccionesDuplicadas.forEach((utsArray, seccion) => {
        utsArray.forEach(utData => {
            const nombreUT = utData.feature.properties.nombre;
            if (!utsUnicas.has(nombreUT)) {
                utsUnicas.add(nombreUT);
                const opcion = document.createElement("option");
                opcion.value = nombreUT;
                datalist.appendChild(opcion);
            }
        });
    });
}

// Función mostrarUTSeleccionada CORREGIDA
function mostrarUTSeleccionada(utFeature) {
    // Limpiar datos anteriores del mapa
    limpiarPoligonos();

    // Cambiar nivel actual
    nivelActual = "ut-seleccionada";
    toggleBotonRegresar(true);

    // ACTUALIZAR DIV A MENSAJE DE UNIDAD TERRITORIAL
    document.getElementById('informacion-poligonos').innerText = "Selecciona tu Unidad Territorial";

    // Usar map.data para cargar la UT
    const featureCollection = {
        type: "FeatureCollection",
        features: [utFeature]
    };

    const features = mapaindex.data.addGeoJson(featureCollection);

    // Guardar feature para limpieza posterior
    features.forEach(feature => {
        poligonosActuales.push(feature);
    });

    // Establecer estilo para la UT seleccionada
    mapaindex.data.setStyle(function (feature) {
        return {
            fillColor: '#e74c3c',
            fillOpacity: 0.4,
            strokeColor: '#c0392b',
            strokeWeight: 3,
            strokeOpacity: 0.8
        };
    });

    // Configurar eventos simples para UT única
    configurarEventosSimples();

    // USAR EL MISMO EFECTO QUE mostrarUTsDuplicadas()
    const bounds = new google.maps.LatLngBounds();
    const props = utFeature.properties;

    // Crear bounds usando las coordenadas de la BD (como en mostrarUTsDuplicadas)
    bounds.extend({ lat: props.latitud, lng: props.longitud });

    // Aplicar fitBounds primero (mismo efecto que mostrarUTsDuplicadas)
    mapaindex.fitBounds(bounds);

    // Ajustar a zoom 16 después de fitBounds (mismo timing)
    setTimeout(() => {
        mapaindex.setZoom(16);
    }, 500);

    // Actualizar historial con UT seleccionada
    historialDatos.unidad = props.nombre;
    actualizarHistorial("ut-seleccionada", historialDatos);

}


// Función mostrarUTsDuplicadas CORREGIDA
function mostrarUTsDuplicadas(seccion, utsArray) {
    // Limpiar datos anteriores
    limpiarPoligonos();

    nivelActual = "uts-duplicadas";
    toggleBotonRegresar(true);

    // ACTUALIZAR DIV A MENSAJE DE UNIDAD TERRITORIAL (NO MOSTRAR CONTEO)
    document.getElementById('informacion-poligonos').innerText = "Selecciona tu Unidad Territorial";

    // Crear FeatureCollection con todas las UTs duplicadas
    const features = utsArray.map(utData => utData.feature);
    const featureCollection = {
        type: "FeatureCollection",
        features: features
    };

    const addedFeatures = mapaindex.data.addGeoJson(featureCollection);

    // Guardar features para limpieza posterior
    addedFeatures.forEach(feature => {
        poligonosActuales.push(feature);
    });

    // Colores fijos y simples - sin mapeo dinámico
    const colores = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

    // Establecer estilos fijos simples
    mapaindex.data.setStyle(function (feature) {
        const index = addedFeatures.indexOf(feature);
        const color = colores[index % colores.length];

        return {
            fillColor: color,
            fillOpacity: 0.4,
            strokeColor: color,
            strokeWeight: 3,
            strokeOpacity: 0.8
        };
    });

    // Configurar eventos simples
    configurarEventosSimples();

    // Ajustar vista para mostrar todas las UTs con zoom 16
    const bounds = new google.maps.LatLngBounds();
    features.forEach(feature => {
        const props = feature.properties;
        bounds.extend({ lat: props.latitud, lng: props.longitud });
    });
    mapaindex.fitBounds(bounds);

    // Ajustar a zoom 16 después de fitBounds
    setTimeout(() => {
        mapaindex.setZoom(16);
    }, 500);

    // Para UTs duplicadas, mostrar que hay múltiples opciones
    historialDatos.unidad = `SECCIÓN ${seccion} (${utsArray.length} Unidades Territoriales)`;
    actualizarHistorial("uts-duplicadas", historialDatos);
}

// Función configurarEventosSimples SIMPLIFICADA (ya no cambia el div)
function configurarEventosSimples() {
    // Remover listeners anteriores si existen
    google.maps.event.clearListeners(mapaindex.data, 'mouseover');
    google.maps.event.clearListeners(mapaindex.data, 'mouseout');
    google.maps.event.clearListeners(mapaindex.data, 'click');

    // Función especial para tooltips en el buscador
    function mostrarTooltipData(nombre, eventoInicial) {
        // Cerrar tooltip anterior
        if (tooltipActual) {
            tooltipActual.close();
            if (tooltipListener) {
                google.maps.event.removeListener(tooltipListener);
            }
        }

        // Crear tooltip
        tooltipActual = new google.maps.InfoWindow({
            content: `<div style="font-family: Poppins, sans-serif; font-size: 12px; padding: 4px 8px; font-weight: bold; white-space: nowrap;">${nombre}</div>`,
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(0, -20),
            headerDisabled: true,
            closeOnClick: false
        });

        siguiendoMouse = true;

        // Usar mousemove en map.data directamente
        tooltipListener = mapaindex.data.addListener('mousemove', function (event) {
            if (siguiendoMouse && tooltipActual) {
                tooltipActual.setPosition(event.latLng);
                if (!tooltipActual.getMap()) {
                    tooltipActual.open(mapaindex);
                }
            }
        });

        // Posición inicial del evento
        tooltipActual.setPosition(eventoInicial.latLng);
        tooltipActual.open(mapaindex);
    }

    // Evento mouseover - SOLO mostrar tooltip (NO cambiar div)
    mapaindex.data.addListener('mouseover', function (event) {
        mapaindex.data.overrideStyle(event.feature, {
            fillOpacity: 0.7,
            strokeWeight: 5
        });

        // Obtener nombre de la UT
        const nombreUt = event.feature.getProperty('nombre') ||
            event.feature.Eg?.nombre ||
            'UT Sin nombre';

        // SOLO MOSTRAR TOOLTIP (el div se mantiene en "Selecciona tu Unidad Territorial")
        mostrarTooltipData(nombreUt, event);
    });

    // Evento mouseout - SOLO ocultar tooltip (NO cambiar div)
    mapaindex.data.addListener('mouseout', function (event) {
        mapaindex.data.revertStyle(event.feature);

        // SOLO OCULTAR TOOLTIP (el div se mantiene igual)
        ocultarTooltip();
    });

    //NUEVAS UTS
    const utsNuevaCreacion = [
        "02-115", "03-171", "03-172", "03-173",
        "04-061", "06-065", "07-324", "07-325",
        "07-326", "07-327", "10-261", "10-262",
        "12-227", "12-228"
    ];

    // Evento click para configurarEventosSimples - MEJORADO PARA MÓVILES
    mapaindex.data.addListener('click', function (event) {
        const props = event.feature;

        
        const clave = props.getProperty('cve_ut') || props.Eg?.cve_ut;
        const esNuevaCreacion = utsNuevaCreacion.includes(clave);
        const cve_demarc = props.getProperty('cve_demarc') || props.Eg?.cve_demarc;
        const demTerr = props.getProperty('dem_terr') || props.Eg?.dem_terr;
        const dtto = props.getProperty('dtto_loc') || props.Eg?.dtto_loc;
        const nombreUt = props.getProperty('nombre') || props.Eg?.nombre || 'UT Sin nombre';
        const latitud = props.getProperty('latitud') || props.Eg?.latitud;
        const longitud = props.getProperty('longitud') || props.Eg?.longitud;
        const tipoUt = props.getProperty('tipo_ut') || props.Eg?.tipo_ut || 'UT';
        const seccionesCom = props.getProperty('secciones'); props.Eg?.secciones;
        const seccionesPar = props.getProperty('secciones1'); props.Eg?.secciones1;
        const listanom = props.getProperty('ln_30_abr'); props.Eg?.ln_30_abr;
        const tot_particip = props.getProperty('participacion'); props.Eg?.participacion;
        const particip_h = props.getProperty('part_h'); props.Eg?.part_h;
        const particip_m = props.getProperty('part_m'); props.Eg?.part_m;
        const particip_f = props.getProperty('part_f'); props.Eg?.part_f;
        const proyecG_24 = props.getProperty('pgn_24'); props.Eg?.pgn_24;
        const proyecG_25 = props.getProperty('pgn_25'); props.Eg?.pgn_25;
        const monto = props.getProperty('monto'); props.Eg?.monto;

        const posicion = new google.maps.LatLng(latitud, longitud);
        mapaindex.setZoom(16);
        mapaindex.panTo(posicion);

        // UT que deben mostrar "(Antes ...)"
        const utsAntes = {
            "02-032": "HOGAR Y SEGURIDAD / NUEVA SANTA MARIA",
            "03-100": "SAN DIEGO CHURUBUSCO",
            "03-103": "SAN LUCAS (BARR)",
            "03-153": "TAXQUEÑA",
            "10-206": "TARANGO (U HAB)",
            "12-195": "VILLA OLIMPICA LIBERADOR MIGUEL HIDALGO (U HAB)",
            "02-079": "SAN JUAN TLIHUACA (PBLO)",
            "02-069": "SAN MIGUEL AMANTLA (PBLO)",
            "03-066": "LA MAGDALENA CULHUACAN (BARR)",
            "03-101": "SAN FRANCISCO CULHUACAN (PBLO)",
            "03-078": "PUEBLO DE LOS REYES HUEYTLILAC",
            "03-105": "SAN PABLO TEPETLAPA (PBLO)",
            "05-170": "SANTA ISABEL TOLA (PBLO)",
            "05-151": "SAN BARTOLO ATEPEHUACAN (PBLO)",
            "05-093": "LA CANDELARIA TICOMAN (BARR)",
            "05-104": "LA LAGUNA TICOMAN (BARR)",
            "05-111": "LA PURISIMA TICOMAN (BARR)",
            "05-169": "SAN RAFAEL TICOMAN (BARR)",
            "05-164": "SAN JUAN Y GUADALUPE TICOMÁN (BARR)",
            "05-033": "CUAUTEPEC DE MADERO",
            "05-034": "CUAUTEPEC EL ALTO (PBLO)",
            "06-032": "SANTA ANITA",
            "06-016": "LA ASUNCION (BARR)",
            "06-018": "LOS REYES (BARR)",
            "06-029": "SAN FCO XICALTONGO (BARR)",
            "06-030": "SAN MIGUEL (BARR)",
            "06-033": "SANTA CRUZ (BARR)",
            "06-034": "SANTIAGO NORTE (BARR)",
            "06-039": "ZAPOTLA (BARR)",
            "06-035": "SANTIAGO SUR (BARR)",
            "07-087": "GUADALUPE (BARR)",
            "07-177": "SAN ANTONIO (BARR)",
            "07-190": "SAN LORENZO TEZONCO (BARR)",
            "07-191": "SAN LORENZO TEZONCO (PBLO)",
            "09-012": "VILLA MILPA ALTA (PBLO)",
            "10-024": "AXOTLA",
            "10-200": "SANTA LUCIA",
            "12-020": "CHIMALCOYOC",
            "14-044": "SAN SIMON TICUMAC"
        };

        
        const utsConPDF = [
            "02-079", "02-069", "03-066", "03-101", "03-078", "03-105",
            "05-170", "05-151", "05-093", "05-104", "05-111", "05-169",
            "05-164", "05-033", "05-034", "06-032", "06-016", "06-018",
            "06-029", "06-030", "06-033", "06-034", "06-039", "06-035",
            "07-087", "07-177", "07-190", "07-191", "09-012", "10-024",
            "10-200", "12-020", "14-044"
        ];

        
        const iconoPDF = `
            <a href="javascript:void(0)"
            onclick="window.open('./IECM-ACU-CG-110-2025.pdf', '_blank')"
            style="display:flex; align-items:center; gap:6px; text-decoration:none; cursor:pointer;">
                
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="#b30000" fill="none" stroke-width="2">
                    <path d="M6 2h9l5 5v13a2 2 0 
                            0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.1.9-2 
                            2-2z"/>
                    <path d="M14 2v6h6"/>
                    <text x="7" y="17" font-size="7" fill="#b30000">PDF</text>
                </svg>

                <span style="font-size:12px; color:#b30000; font-weight:600;">
                    Ver Acuerdo
                </span>
            </a>
        `;

        const textoAhoraSEPI = 'de acuerdo con la información proporcionada por la SEPI';


        let nombreUtMostrado = nombreUt;

        
        let bloquePDF = "";

        if (utsConPDF.includes(clave)) {
            bloquePDF = iconoPDF;
        }

        if (utsAntes[clave]) {

            // Caso especial: UT con PDF → formato invertido
            if (utsConPDF.includes(clave)) {
                nombreUtMostrado = `${utsAntes[clave]} <br><br> (Ahora ${nombreUt}, ${textoAhoraSEPI})`;
            } 
            // Caso normal → formato actual
            else {
                nombreUtMostrado = `${nombreUt} (ANTES ${utsAntes[clave]})`;
            }
        }
        // Detectar si es móvil
        const isMobile = window.innerWidth <= 768;

        const contenidoUTNueva = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 12px;
                border: 2px solid rgba(153,102,204,0.3);
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center; /* centrado vertical */
                align-items: center;      /* centrado horizontal */
                text-align: center;
            ">
                <h3 style="color:#6B1985; font-size: 16px; font-weight:700;">
                    Unidad Territorial de Nueva Creación
                </h3>

                <p style="color:#444; font-size:13px; line-height:1.5; margin-top:10px;">
                    Esta Unidad Territorial es de nueva creación.  
                    Consulta más información en el siguiente enlace:
                </p>

                <a href="https://www.iecm.mx/www/taip/cg/acu/2025/IECM-ACU-CG-100-2025.pdf"
                target="_blank"
                style="
                        display:inline-block;
                        margin-top:14px;
                        padding:10px 18px;
                        background:#9129A2;
                        color:white;
                        font-size:13px;
                        font-weight:700;
                        border-radius:8px;
                        text-decoration:none;
                ">
                    Consultar documento
                </a>
            </div>
        `;

        const contenido = `
                <style>
                    .gm-style .gm-style-iw-tc::after {
                        background: #ffffff00 !important;
                    }

                    /* Sobrescribir estilos de Google Maps InfoWindow */
                    .gm-style .gm-style-iw-c {
                        max-width: ${isMobile ? '80vw' : '800px'} !important;
                        max-height: none !important;
                        padding: 0 !important;
                        ${isMobile ? 'border-radius: 0 !important;' : ''}
                        z-index: 99998 !important; /*- Asegurar que esté sobre todo */
                    }
                    
                    .gm-style .gm-style-iw-d {
                        overflow: auto !important;
                        max-height: ${isMobile ? '60vh' : 'none'} !important;
                        overflow-x: hidden !important; /*- Eliminar scroll horizontal */
                    }

                    /*- Eliminar padding que causa scroll horizontal */
                    .gm-style .gm-style-iw-d::-webkit-scrollbar {
                        width: 6px; /* Scrollbar más delgado */
                    }

                    .gm-style .gm-style-iw-d::-webkit-scrollbar-thumb {
                        background: rgba(153, 102, 204, 0.5);
                        border-radius: 3px;
                    }

                    /* Asegurar z-index del contenedor padre */
                    .gm-style-iw-tc {
                        z-index: 99998 !important;
                    }
                    
                    .gm-style-iw {
                        max-width: ${isMobile ? '70vw' : '800px'} !important;
                    }

                    /* Botón de cerrar en móvil */
                
                    
                    @keyframes infoWindowAppear {
                        from {
                            opacity: 0;
                            transform: ${isMobile ? 'translateY(100%)' : 'scale(0.8)'};
                        }
                        to {
                            opacity: 1;
                            transform: ${isMobile ? 'translateY(0)' : 'scale(1)'};
                        }
                    }
                </style>
                
                <div style="
                    font-family: 'Poppins', sans-serif; 
                    width: ${isMobile ? '100%' : '760px'};  /* CAMBIAR de 100vw a 100% */
                    max-width: ${isMobile ? '100%' : '760px'};  /* CAMBIAR de 100vw a 100% */
                    background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
                    border-radius: ${isMobile ? '0' : '16px'};
                    overflow: visible;
                    box-shadow: ${isMobile ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.15)'};
                    border: none;
                    opacity: 0;
                    transform: ${isMobile ? 'translateY(100%)' : 'scale(0.8)'};
                    animation: infoWindowAppear 0.4s ease-out forwards;
                    box-sizing: border-box; /* NUEVO - Importante para el cálculo correcto */
                ">
                    
                    <!-- Header con título principal -->
                    <div style="
                        background: linear-gradient(135deg, rgba(153, 102, 204, 0.95), #9129A2);
                        color: white;
                        padding: ${isMobile ? '16px 12px' : '14px 20px'};
                        text-align: center;
                        position: relative;
                    ">
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 3px;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
                        "></div>
                        <h3 style="
                            margin: 0;
                            font-size: ${isMobile ? '13px' : '14px'};
                            font-weight: 700;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                            letter-spacing: 0.5px;
                            line-height: 1.4;
                        ">DATOS GEOELECTORALES Y DE PARTICIPACIÓN CIUDADANA</h3>
                    </div>

                    <!-- Contenido principal -->
                    <div style="padding: ${isMobile ? '12px' : '16px 20px'};">
                        
                        <!-- Nombre de la UT -->
                        <div style="
                            text-align: center;
                            margin-bottom: ${isMobile ? '12px' : '14px'};
                            padding: ${isMobile ? '10px' : '12px'};
                            background: linear-gradient(135deg, rgba(153, 102, 204, 0.15), rgba(145, 41, 162, 0.15));
                            border-radius: 10px;
                            border: 2px solid rgba(153, 102, 204, 0.4);
                        ">
                            <div style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                gap:8px;
                                font-size:${isMobile ? '15px' : '17px'};
                                color:#6B1985;
                                font-weight:700;
                                line-height:1.3;
                                flex-wrap:wrap;
                            ">
                                <span>${nombreUtMostrado}</span>
                                ${bloquePDF}
                            </div>
                        </div>

                        <!-- Grid 3 columnas: Demarcación, Distrito, Clave -->
                        <div style="
                            display: grid; 
                            grid-template-columns: ${isMobile ? '1fr' : 'repeat(3, 1fr)'}; 
                            gap: ${isMobile ? '8px' : '10px'}; 
                            margin-bottom: ${isMobile ? '12px' : '14px'};
                        ">
                            <div style="
                                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                                padding: ${isMobile ? '12px' : '10px'};
                                border-radius: 8px;
                                border-bottom: 3px solid rgba(153, 102, 204, 0.9);
                                text-align: center;
                            ">
                                <div style="
                                    font-size: ${isMobile ? '10px' : '9px'}; 
                                    color: #666; 
                                    font-weight: 600; 
                                    margin-bottom: 5px; 
                                    text-transform: uppercase;
                                    letter-spacing: 0.3px;
                                ">Demarcación</div>
                                <div style="font-size: ${isMobile ? '14px' : '13px'}; color: #2c3e50; font-weight: 700; line-height: 1.2;">${demTerr}</div>
                            </div>

                            <div style="
                                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                                padding: ${isMobile ? '12px' : '10px'};
                                border-radius: 8px;
                                border-bottom: 3px solid #9129A2;
                                text-align: center;
                            ">
                                <div style="
                                    font-size: ${isMobile ? '10px' : '9px'}; 
                                    color: #666; 
                                    font-weight: 600; 
                                    margin-bottom: 5px; 
                                    text-transform: uppercase;
                                    letter-spacing: 0.3px;
                                ">Distrito Local</div>
                                <div style="font-size: ${isMobile ? '14px' : '13px'}; color: #2c3e50; font-weight: 700;">${dtto}</div>
                            </div>

                            <div style="
                                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                                padding: ${isMobile ? '12px' : '10px'};
                                border-radius: 8px;
                                border-bottom: 3px solid #6B1985;
                                text-align: center;
                            ">
                                <div style="
                                    font-size: ${isMobile ? '10px' : '9px'}; 
                                    color: #666; 
                                    font-weight: 600; 
                                    margin-bottom: 5px; 
                                    text-transform: uppercase;
                                    letter-spacing: 0.3px;
                                ">Clave UT</div>
                                <div style="font-size: ${isMobile ? '14px' : '13px'}; color: #2c3e50; font-weight: 700;">${clave}</div>
                            </div>
                        </div>

                        <!-- Grid 2 columnas: Información Electoral + Participación/Proyectos -->
                        <div style="
                            display: grid; 
                            grid-template-columns: ${isMobile ? '1fr' : '48% 50%'}; 
                            gap: ${isMobile ? '10px' : '2%'}; 
                            margin-bottom: ${isMobile ? '12px' : '14px'}; 
                            align-items: start;
                        ">
                            
                            <!-- Columna izquierda: Información Electoral + Monto -->
                            <div style="display: flex; flex-direction: column; gap: 10px; height: 100%;">
                                
                                <!-- Información Electoral -->
                                <div style="
                                    background: linear-gradient(135deg, rgba(153, 102, 204, 0.08), rgba(145, 41, 162, 0.08));
                                    border-radius: 10px;
                                    padding: ${isMobile ? '10px' : '12px'};
                                    border: 1px solid rgba(153, 102, 204, 0.25);
                                ">
                                    <div style="
                                        font-size: ${isMobile ? '11px' : '10px'};
                                        color: #6B1985;
                                        font-weight: 700;
                                        margin-bottom: 10px;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    ">
                                        INFORMACIÓN ELECTORAL
                                    </div>
                                    
                                    <!-- Secciones -->
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                                        <div style="
                                            background: white; 
                                            padding: ${isMobile ? '12px' : '10px'}; 
                                            border-radius: 6px; 
                                            border-left: 3px solid rgba(153, 102, 204, 0.9);
                                        ">
                                            <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600; text-align: center;">
                                                Secciones Completas
                                            </div>
                                            <div style="
                                                font-size: ${isMobile ? '13px' : '11px'}; 
                                                color: rgba(153, 102, 204, 0.9); 
                                                font-weight: 700;
                                                text-align: center;
                                                line-height: 1.4;
                                                word-wrap: break-word;
                                            ">
                                                ${seccionesCom ?? '--'}
                                            </div>
                                        </div>
                                        
                                        <div style="
                                            background: white; 
                                            padding: ${isMobile ? '12px' : '10px'}; 
                                            border-radius: 6px; 
                                            border-left: 3px solid #9129A2;
                                        ">
                                            <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600; text-align: center;">
                                                Secciones Parciales
                                            </div>
                                            <div style="
                                                font-size: ${isMobile ? '13px' : '11px'}; 
                                                color: #9129A2; 
                                                font-weight: 700;
                                                text-align: center;
                                                line-height: 1.4;
                                                word-wrap: break-word;
                                            ">
                                                ${seccionesPar ?? '--'}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Lista Nominal -->
                                    <div style="background: white; padding: ${isMobile ? '12px' : '10px'}; border-radius: 6px; text-align: center; border-left: 3px solid #6B1985;">
                                        <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600;">Lista Nominal (Corte al 30 de Abril de 2026)</div>
                                        <div style="font-size: ${isMobile ? '20px' : '18px'}; color: #6B1985; font-weight: 700;">${listanom ? Number(listanom).toLocaleString() : 'Sin registro'}</div>
                                    </div>
                                </div>

                                <!-- Monto Asignado -->
                                <div style="
                                    background: linear-gradient(135deg, rgba(40, 167, 69, 0.08), rgba(25, 135, 84, 0.08));
                                    border-radius: 10px;
                                    padding: ${isMobile ? '10px' : '12px'};
                                    border: 1px solid rgba(40, 167, 69, 0.25);
                                    flex-grow: 1;
                                    display: flex;
                                    flex-direction: column;
                                ">
                                    <div style="
                                        font-size: ${isMobile ? '11px' : '10px'};
                                        color: #198754;
                                        font-weight: 700;
                                        margin-bottom: 8px;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                        text-align: center;
                                    ">
                                        MONTO ASIGNADO (2025)
                                    </div>
                                    
                                    <div style="
                                        background: white;
                                        padding: ${isMobile ? '14px' : '12px'};
                                        border-radius: 6px;
                                        text-align: center;
                                        border: 2px solid rgba(40, 167, 69, 0.4);
                                        flex-grow: 1;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                    ">
                                        <div style="
                                            font-size: ${isMobile ? '22px' : '20px'}; 
                                            color: #198754; 
                                            font-weight: 700;
                                            line-height: 1.2;
                                        ">
                                            ${monto || 'Sin registro'}
                                        </div>
                                        <div style="
                                            font-size: ${isMobile ? '8px' : '7px'}; 
                                            color: #666; 
                                            margin-top: 3px; 
                                            font-weight: 500;
                                            text-transform: uppercase;
                                            letter-spacing: 0.3px;
                                        ">
                                            Presupuesto Participativo
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Columna derecha: Participación y Proyectos O Mensaje para PO -->
                            ${
                                esNuevaCreacion
                                ? contenidoUTNueva
                                : (tipoUt === 'PO' ? `
                                <!-- Mensaje especial para Pueblos Originarios -->
                                <div style="
                                    display: flex;
                                    flex-direction: column;
                                    gap: 10px;
                                    height: 100%;
                                ">
                                    <div style="
                                        background: linear-gradient(135deg, rgba(153, 102, 204, 0.08), rgba(107, 25, 133, 0.08));
                                        border-radius: 10px;
                                        padding: ${isMobile ? '14px' : '16px'};
                                        border: 2px solid rgba(153, 102, 204, 0.3);
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        align-items: center;
                                        gap: 12px;
                                        flex: 1;
                                    ">
                                        <!-- Icono -->
                                        <div style="
                                            width: ${isMobile ? '45px' : '50px'};
                                            height: ${isMobile ? '45px' : '50px'};
                                            background: linear-gradient(135deg, rgba(153, 102, 204, 0.95), #9129A2);
                                            border-radius: 50%;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            box-shadow: 0 3px 12px rgba(153, 102, 204, 0.4);
                                        ">
                                            <svg style="width: ${isMobile ? '24px' : '26px'}; height: ${isMobile ? '24px' : '26px'}; fill: white;" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                            </svg>
                                        </div>

                                        <!-- Título -->
                                        <div style="
                                            font-size: ${isMobile ? '10.5px' : '11px'};
                                            color: #6B1985;
                                            font-weight: 700;
                                            text-align: center;
                                            text-transform: uppercase;
                                            letter-spacing: 0.6px;
                                            line-height: 1.4;
                                        ">
                                            UNIDAD TERRITORIAL INTEGRADA POR PUEBLO ORIGINARIO
                                        </div>

                                        <!-- Mensaje -->
                                        <div style="
                                            background: white;
                                            padding: ${isMobile ? '14px' : '12px'};
                                            border-radius: 8px;
                                            border-left: 3px solid rgba(153, 102, 204, 0.9);
                                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
                                            width: 100%;
                                        ">
                                            <p style="
                                                margin: 0 0 10px 0;
                                                font-size: ${isMobile ? '10.5px' : '9.5px'};
                                                color: #555;
                                                line-height: 1.6;
                                                text-align: justify;
                                            ">
                                                La determinación del proyecto, se realiza por medio de sus Autoridades Tradicionales y/o Representativas, de conformidad con el método que consideren en apego a sus sistemas normativos, reglas y/o formas de organización internas y procedimientos, en cumplimiento al acuerdo IECM-ACU-CG-010-2025 del Consejo General del IECM.
                                            </p>
                                            
                                            <a href="https://www.iecm.mx/www/docs/consulta2025/Convocatoria-PO.pdf" 
                                            target="_blank"
                                            style="
                                                display: inline-block;
                                                width: 100%;
                                                padding: ${isMobile ? '11px 14px' : '9px 14px'};
                                                background: linear-gradient(135deg, rgba(153, 102, 204, 0.95), #9129A2);
                                                color: white;
                                                text-decoration: none;
                                                border-radius: 5px;
                                                font-size: ${isMobile ? '10px' : '9px'};
                                                font-weight: 600;
                                                text-align: center;
                                                text-transform: uppercase;
                                                letter-spacing: 0.5px;
                                                transition: all 0.3s ease;
                                                box-shadow: 0 2px 8px rgba(153, 102, 204, 0.3);
                                                font-weight: bold;
                                            "
                                            onmouseover="
                                                this.style.transform = 'translateY(-2px)';
                                                this.style.boxShadow = '0 4px 12px rgba(153, 102, 204, 0.5)';
                                            "
                                            onmouseout="
                                                this.style.transform = 'translateY(0)';
                                                this.style.boxShadow = '0 2px 8px rgba(153, 102, 204, 0.3)';
                                            ">
                                                CONSULTA AQUÍ PARA MÁS INFORMACIÓN
                                            </a>
                                        </div>

                                        <!-- Nota adicional 
                                        <div style="
                                            font-size: ${isMobile ? '9px' : '8px'};
                                            color: #7a7a7a;
                                            text-align: center;
                                            font-style: italic;
                                            line-height: 1.5;
                                            background: rgba(153, 102, 204, 0.05);
                                            border-radius: 5px;
                                            padding: ${isMobile ? '8px 10px' : '6px 10px'};
                                        ">
                                            Información de participación ciudadana y presupuesto participativo disponible en el enlace
                                        </div> -->
                                    </div>
                                </div>
                                ` : `
                                <!-- Contenido normal para UT -->
                                <div style="display: flex; flex-direction: column; gap: 10px; height: 100%;">
                                    
                                    <!-- Participación Ciudadana -->
                                    <div style="
                                        background: linear-gradient(135deg, rgba(204, 102, 153, 0.12), rgba(153, 102, 204, 0.12));
                                        border-radius: 10px;
                                        padding: ${isMobile ? '10px' : '12px'};
                                        border: 1px solid rgba(204, 102, 153, 0.3);
                                        flex: 1;
                                        display: flex;
                                        flex-direction: column;
                                    ">
                                        <div style="
                                            font-size: ${isMobile ? '11px' : '10px'};
                                            color: #9129A2;
                                            font-weight: 700;
                                            margin-bottom: 10px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.3px;
                                        ">
                                            PARTICIPACIÓN 2025
                                        </div>
                                        
                                        <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '43% 55%'}; gap: ${isMobile ? '8px' : '2%'}; flex-grow: 1; align-items: center;">
                                            <!-- Total -->
                                            <div style="
                                                background: white;
                                                padding: ${isMobile ? '12px' : '10px'};
                                                border-radius: 6px;
                                                text-align: center;
                                                border: 2px solid rgba(153, 102, 204, 0.3);
                                                display: flex;
                                                flex-direction: column;
                                                justify-content: center;
                                                height: 100%;
                                            ">
                                                <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 4px; font-weight: 600;">Total</div>
                                                <div style="font-size: ${isMobile ? '32px' : '28px'}; color: rgba(204, 102, 153, 0.9); font-weight: 700;">
                                                    ${tot_particip ? Number(tot_particip).toFixed(1) + '%' : '-'}
                                                </div>
                                            </div>

                                            <!-- Desglose -->
                                            <div style="display: flex; flex-direction: column; gap: 6px; justify-content: center;">
                                                <div style="background: white; padding: ${isMobile ? '10px' : '8px 10px'}; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                                    <span style="font-size: ${isMobile ? '10px' : '9px'}; color: #666; font-weight: 600;">Hombres</span>
                                                    <span style="font-size: ${isMobile ? '15px' : '13px'}; color: #4a90e2; font-weight: 700;">
                                                        ${particip_h ? Number(particip_h).toFixed(1) + '%' : '-'}
                                                    </span>
                                                </div>
                                                <div style="background: white; padding: ${isMobile ? '10px' : '8px 10px'}; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                                    <span style="font-size: ${isMobile ? '10px' : '9px'}; color: #666; font-weight: 600;">Mujeres</span>
                                                    <span style="font-size: ${isMobile ? '15px' : '13px'}; color: #e24a90; font-weight: 700;">
                                                        ${particip_m ? Number(particip_m).toFixed(1) + '%' : '-'}
                                                    </span>
                                                </div>
                                                <div style="background: white; padding: ${isMobile ? '10px' : '8px 10px'}; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                                    <span style="font-size: ${isMobile ? '10px' : '9px'}; color: #666; font-weight: 600;">Opinantes de otra ${isMobile ? '' : '<br>'} entidad de origen</span>
                                                    <span style="font-size: ${isMobile ? '15px' : '13px'}; color: #e2904a; font-weight: 700;">
                                                        ${particip_f ? Number(particip_f).toFixed(1) + '%' : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Proyectos Ganadores -->
                                    <div style="
                                        background: linear-gradient(135deg, rgba(107, 25, 133, 0.1), rgba(74, 16, 96, 0.1));
                                        border-radius: 10px;
                                        padding: ${isMobile ? '10px' : '12px'};
                                        border: 1px solid rgba(107, 25, 133, 0.3);
                                        flex: 1;
                                        display: flex;
                                        flex-direction: column;
                                    ">
                                        <div style="
                                            font-size: ${isMobile ? '11px' : '10px'};
                                            color: #6B1985;
                                            font-weight: 700;
                                            margin-bottom: 10px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.5px;
                                        ">
                                            PRESUPUESTO PARTICIPATIVO
                                        </div>
                                        
                                        <div style="display: grid; gap: 10px; flex-grow: 1;">
                                            <!-- <div style="
                                                grid-template-columns: 1fr 1fr;
                                                background: white;
                                                padding: ${isMobile ? '10px' : '10px'};
                                                border-radius: 6px;
                                                border-left: 3px solid #6B1985;
                                                display: flex;
                                                flex-direction: column;
                                                justify-content: center;
                                            ">
                                                <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 6px; font-weight: 600;">
                                                    Ganador 2024
                                                </div>
                                                <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #6B1985; font-weight: 600; line-height: 1.3;">
                                                    ${proyecG_24 ?? 'Sin registro'}
                                                </div>
                                            </div> -->

                                            <div style="
                                                background: white;
                                                padding: ${isMobile ? '10px' : '10px'};
                                                border-radius: 6px;
                                                border-left: 3px solid #9129A2;
                                                display: flex;
                                                flex-direction: column;
                                                justify-content: center;
                                        ">
                                            <div style="font-size: ${isMobile ? '9px' : '8px'}; color: #666; margin-bottom: 6px; font-weight: 600;">
                                                Ganador 2025
                                            </div>
                                            <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #9129A2; font-weight: 600; line-height: 1.3;">
                                                ${proyecG_25 ?? 'Sin registro'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        `)
                        }
                    </div>

                    <!-- Botón de acción -->
                    <button onclick="estadisticas('${clave}', '${cve_demarc}', '${demTerr}')" style="
                        width: 100%;
                        padding: ${isMobile ? '14px 20px' : '12px 20px'};
                        background: linear-gradient(180deg, rgba(153, 102, 204, 0.95), rgba(133, 82, 184, 0.95));
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: ${isMobile ? '13px' : '12px'};
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 10px rgba(0,0,0,0.25);
                    " 
                    onmouseover="
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px rgba(153, 102, 204, 0.5)';
                    " 
                    onmouseout="
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 10px rgba(0,0,0,0.25)';
                    " 
                    onmousedown="
                        this.style.transform = 'translateY(1px)';
                        this.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)';
                    " 
                    onmouseup="
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px rgba(153, 102, 204, 0.5)';
                    ">
                        Consultar Sociodemográficos
                    </button>
                </div>
            </div>
        `;

        ocultarTooltip();

        if (window.infoWindow) window.infoWindow.close();

        window.infoWindow = new google.maps.InfoWindow({
            content: contenido,
            position: posicion,
            disableAutoPan: false,
            pixelOffset: new google.maps.Size(0, isMobile ? -5 : 300)
        });

        window.infoWindow.open(mapaindex);

        // Ajustar el mapa después de abrir el InfoWindow en móvil
        if (isMobile) {
            google.maps.event.addListenerOnce(window.infoWindow, 'domready', function () {
                // Centrar el mapa considerando el espacio del InfoWindow
                setTimeout(() => {
                    mapaindex.panTo(posicion);
                    mapaindex.panBy(0, -320); // Ajustar el centrado para que el InfoWindow no tape el punto
                }, 100);
            });
        }
    });

}


// 2. Función crearControlesSuperiores MODIFICADA - botón de info movible
function crearControlesSuperiores(mapa) {
    // Crear contenedor principal para información + buscador
    const contenedorCompleto = document.createElement("div");
    contenedorCompleto.id = "Contenedor-com";
    contenedorCompleto.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 10px;
    `;

    // 1. Crear contenedor solo para información (sin botón por ahora)
    const contenedorInformacionCompleto = document.createElement("div");
    contenedorInformacionCompleto.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    // Crear div de información CON TUS MODIFICACIONES
    const divInformacion = document.createElement("div");
    divInformacion.id = "informacion-poligonos";
    divInformacion.innerText = "Selecciona tu Demarcación \n en el mapa";
    // Quitar salto de línea en dispositivos pequeños
    if (window.innerWidth <= 768) {
        divInformacion.innerText = "Selecciona tu Demarcación en el mapa";
    }


    Object.assign(divInformacion.style, {
        backgroundColor: "rgba(153, 102, 204, 0.9)",
        color: "#ffffff",
        // border: "2px solid #9b59b6",
        padding: "8px 10px",
        borderRadius: "10px",
        fontSize: "20px",
        fontWeight: "bold",
        fontFamily: "'Poppins', sans-serif",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease",
        textAlign: "center",
        minWidth: "320px",
        whiteSpace: "nowrap"
    });

    // // Efectos hover para información
    // divInformacion.onmouseenter = () => {
    //     divInformacion.innerText = "Selecciona tu Demarcación \n en el Mapa";
    //     divInformacion.style.transform = "translateY(-2px)";
    //     divInformacion.style.boxShadow = "0 6px 14px rgba(0, 0, 0, 0.3)";
    // };
    // divInformacion.onmouseleave = () => {
    //     divInformacion.innerText = "Selecciona tu Demarcación";
    //     divInformacion.style.transform = "translateY(0px)";
    //     divInformacion.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    // };

    // Crear botón de información estilo Google Maps
    const botonInfo = document.createElement("button");
    botonInfo.id = "boton-info"; // Agregar ID para poder moverlo
    botonInfo.innerHTML = "?";
    botonInfo.title = "Información del sistema";
    botonInfo.onclick = mostrarModalMapa;

    // Estilos que imitan los controles nativos de Google Maps
    Object.assign(botonInfo.style, {
        width: "40px",
        height: "40px",
        borderRadius: "2px",
        backgroundColor: "#ffffff",
        border: "none",
        color: "#9966cce6",
        borderRadius: "50px",
        fontSize: "20px",
        fontWeight: "500",
        fontFamily: "Roboto, Arial, sans-serif",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
        flexShrink: "0" // Evita que se reduzca
    });

    // Efectos hover que imitan Google Maps
    botonInfo.onmouseenter = () => {
        botonInfo.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 2px 8px -1px";
        botonInfo.style.backgroundColor = "#f8f9fa";
    };

    botonInfo.onmouseleave = () => {
        botonInfo.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px";
        botonInfo.style.backgroundColor = "#ffffff";
    };

    // Efecto de clic
    botonInfo.onmousedown = () => {
        botonInfo.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 1px 2px -1px";
        botonInfo.style.backgroundColor = "#e8eaed";
    };

    botonInfo.onmouseup = () => {
        botonInfo.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 2px 8px -1px";
        botonInfo.style.backgroundColor = "#f8f9fa";
    };

    // Crear botón de ubicación (mismo esquema visual que botonInfo)
    const botonUbicacion = document.createElement("button");
    botonUbicacion.id = "boton-ubicacion";
    botonUbicacion.title = "Buscar mi ubicación";
    botonUbicacion.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
    `;
    botonUbicacion.onclick = () => {
        ocultarBurbujaUbicacion();
        buscarPorUbicacion(botonUbicacion);
    };

    Object.assign(botonUbicacion.style, {
        width: "40px",
        height: "40px",
        backgroundColor: "#ffffff",
        border: "none",
        color: "#9966cce6",
        borderRadius: "50px",
        cursor: "pointer",
        boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
        flexShrink: "0"
    });

    botonUbicacion.onmouseenter = () => {
        botonUbicacion.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 2px 8px -1px";
        botonUbicacion.style.backgroundColor = "#f8f9fa";
    };
    botonUbicacion.onmouseleave = () => {
        botonUbicacion.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px";
        botonUbicacion.style.backgroundColor = "#ffffff";
    };
    botonUbicacion.onmousedown = () => {
        botonUbicacion.style.backgroundColor = "#e8eaed";
    };
    botonUbicacion.onmouseup = () => {
        botonUbicacion.style.backgroundColor = "#f8f9fa";
    };

    // Envolver el botón en un contenedor relativo para anclar la burbuja de ayuda
    const wrapperBotonUbicacion = document.createElement("div");
    wrapperBotonUbicacion.id = "wrapper-boton-ubicacion";
    wrapperBotonUbicacion.style.position = "relative";
    wrapperBotonUbicacion.style.display = "flex";
    wrapperBotonUbicacion.appendChild(botonUbicacion);

    // INICIALMENTE: Ensamblar información + botón de info
    contenedorInformacionCompleto.appendChild(divInformacion);
    contenedorInformacionCompleto.appendChild(botonInfo);
    // Se muestra solo en el nivel "demarcaciones"
    contenedorInformacionCompleto.appendChild(wrapperBotonUbicacion);

    // 2. Crear contenedor del buscador + botón regresar + botón info (cuando regresar esté visible)
    const contenedorBuscadorBoton = document.createElement("div");
    contenedorBuscadorBoton.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 10px;
        flex-wrap: wrap;
    `;

    // Contenedor del buscador con leyenda + input + botón de ayuda
    const contenedorBuscador = document.createElement("div");
    contenedorBuscador.id = "contenedor-buscador";

    // Contenedor para leyenda + botón de ayuda (lado a lado)
    const contenedorLeyendaAyuda = document.createElement("div");
    contenedorLeyendaAyuda.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
    `;

    // Leyenda del buscador CON TUS MODIFICACIONES
    const leyenda = document.createElement("div");
    leyenda.innerText = "Ingresa tu Sección Electoral";
    Object.assign(leyenda.style, {
        backgroundColor: "rgba(153, 102, 204, 0.9)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "4px 4px 0 0",
        fontSize: "16px", // TU MODIFICACIÓN: cambiado de "12px"
        fontWeight: "bold",
        textAlign: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        width: "320px",
        boxSizing: "border-box",
        flex: "1" // Permite que la leyenda ocupe el espacio disponible
    });

    // Input de búsqueda
    const inputBuscador = document.createElement("input");
    inputBuscador.id = "buscador";
    inputBuscador.type = "text";
    inputBuscador.placeholder = "Número de Sección Electoral";

    Object.assign(inputBuscador.style, {
        backgroundColor: "white",
        border: "1px solid gray",
        borderTop: "none",
        borderBottom: "none",
        padding: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        fontSize: "14px",
        width: "320px",
        outline: "none",
        boxSizing: "border-box"
    });

    inputBuscador.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarPorSeccion(inputBuscador.value);
        }
    });

    // Texto de ayuda sutil
    const textoAyuda = document.createElement("span");
    textoAyuda.textContent = "Presiona Enter ↵";
    textoAyuda.style.cssText = `
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 11px;
        color: #999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;

    // Wrapper para posicionar el texto dentro del input
    const wrapperInput = document.createElement("div");
    wrapperInput.style.cssText = `
        position: relative;
        width: 320px;
    `;

    // Mostrar/ocultar el texto de ayuda
    inputBuscador.addEventListener('input', () => {
        textoAyuda.style.opacity = inputBuscador.value.trim() !== "" ? "1" : "0";
    });

    inputBuscador.addEventListener('focus', () => {
        if (inputBuscador.value.trim() !== "") {
            textoAyuda.style.opacity = "1";
        }
    });

    inputBuscador.addEventListener('blur', () => {
        textoAyuda.style.opacity = "0";
    });

    // Nota informativa
    const notaInfo = document.createElement("div");
    notaInfo.id = "notainfo";
    notaInfo.innerHTML = `
        <span style="margin-right: 5px; font-weight: bold; color: #007acc;">ℹ</span>
        Encuentra tu Unidad Territorial a través de tu Sección Electoral que puedes consultar en la parte inferior de tu credencial para votar INE.
    `;

    Object.assign(notaInfo.style, {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        border: "1px solid gray",
        borderTop: "none",
        padding: "8px 12px",
        borderRadius: "0 0 4px 4px",
        fontSize: "11px",
        color: "#333",
        lineHeight: "1.3",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        width: "320px",
        boxSizing: "border-box"
    });

    // Dropdown container (comentado para deshabilitarlo)
    const contenedorDropdown = document.createElement("div");
    contenedorDropdown.id = "contenedor-dropdown";
    contenedorDropdown.style.cssText = `
        margin-top: 5px;
        display: none;
    `;

    // Botón regresar
    const btnRegresar = document.createElement("div");
    btnRegresar.id = "btnRegresar";
    btnRegresar.innerText = "⬅ Regresar";
    btnRegresar.onclick = regresar;

    // Object.assign(btnRegresar.style, {
    //     backgroundColor: "white",
    //     border: "1px solid gray",
    //     padding: "10px 15px",
    //     cursor: "pointer",
    //     boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    //     borderRadius: "4px",
    //     fontSize: "14px",
    //     fontWeight: "bold",
    //     display: "none",
    //     height: "42px",
    //     boxSizing: "border-box",
    //     whiteSpace: "nowrap",
    //     alignSelf: "flex-start"
    // });

    Object.assign(btnRegresar.style, {
        backgroundColor: "rgba(153, 102, 204, 0.9)",
        padding: "8px 10px",
        cursor: "pointer",
        boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 10px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "bold",
        display: "none",
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        alignSelf: "flex-start",
        color: "white"
    });

    // SOLO la leyenda va en el contenedor con botón de ayuda (inicialmente)
    contenedorLeyendaAyuda.appendChild(leyenda);
    contenedorLeyendaAyuda.appendChild(botonInfo); // Mover el botón aquí inicialmente

    // Ensamblar buscador
    contenedorBuscador.appendChild(contenedorLeyendaAyuda);
    // contenedorBuscador.appendChild(inputBuscador);
    wrapperInput.appendChild(inputBuscador);
    wrapperInput.appendChild(textoAyuda);
    contenedorBuscador.appendChild(wrapperInput);
    contenedorBuscador.appendChild(notaInfo);
    contenedorBuscador.appendChild(contenedorDropdown);


    contenedorBuscadorBoton.appendChild(contenedorBuscador);
    contenedorBuscadorBoton.appendChild(btnRegresar);

    // Ensamblar contenedor completo
    contenedorCompleto.appendChild(contenedorBuscadorBoton);       // Buscador + Botón Regresar + Botón Info
    contenedorCompleto.appendChild(contenedorInformacionCompleto); // Solo información (sin botón)

    // Datalist
    const datalist = document.createElement("datalist");
    datalist.id = "sugerencias-uts";
    document.body.appendChild(datalist);

    // Agregar al mapa
    mapa.controls[google.maps.ControlPosition.TOP_LEFT].push(contenedorCompleto);

    // Crear el historial de selección
    crearHistorialSeleccion(mapa);
}

function inyectarEstilosBurbujaUbicacion() {
    if (document.getElementById("estilos-burbuja-ubicacion")) return; // solo una vez

    const style = document.createElement("style");
    style.id = "estilos-burbuja-ubicacion";
    style.textContent = `
        @keyframes apareceBurbujaUbicacion {
            from { opacity: 0; transform: translateY(-50%) translateX(-6px); }
            to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        #burbuja-ubicacion {
            position: absolute;
            left: calc(100% + 14px);
            top: 50%;
            transform: translateY(-50%);
            background-color: #ffffff;
            color: #333333;
            padding: 10px 14px;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.4;

            min-width: 250px;
            max-width: 300px;

            border: 2px solid #9129A2;
            z-index: 2000;
            animation: apareceBurbujaUbicacion 0.35s ease-out;
            transition: opacity 0.4s ease;
        }
        #burbuja-ubicacion .burbuja-flecha-borde {
            position: absolute;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 9px solid transparent;
            border-bottom: 9px solid transparent;
            border-right: 9px solid #9129A2;
        }
        #burbuja-ubicacion .burbuja-flecha-relleno {
            position: absolute;
            left: -7px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 7px solid transparent;
            border-bottom: 7px solid transparent;
            border-right: 7px solid #ffffff;
        }
        #burbuja-ubicacion .burbuja-cerrar {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            background: #9129A2;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        @media (max-width: 768px) {
            #burbuja-ubicacion {
                left: auto;
                right: 0;
                top: calc(100% + 14px);
                transform: none;
            }
            #burbuja-ubicacion .burbuja-flecha-borde,
            #burbuja-ubicacion .burbuja-flecha-relleno {
                left: auto;
                right: 12px;
                top: -9px;
                border-right: 9px solid transparent;
                border-left: 9px solid transparent;
            }
            #burbuja-ubicacion .burbuja-flecha-borde {
                border-bottom: 9px solid #9129A2;
                border-top: none;
            }
            #burbuja-ubicacion .burbuja-flecha-relleno {
                top: -7px;
                border-bottom: 7px solid #ffffff;
                border-top: none;
            }
        }
    `;
    document.head.appendChild(style);
}

function mostrarBurbujaUbicacion() {
    const boton = document.getElementById("boton-ubicacion");
    const wrapper = document.getElementById("wrapper-boton-ubicacion");
    if (!boton || !wrapper) return;

    // Solo mostrar si el botón está visible (nivel "demarcaciones")
    if (getComputedStyle(boton).display === "none") return;

    // Evitar duplicados
    if (document.getElementById("burbuja-ubicacion")) return;

    inyectarEstilosBurbujaUbicacion();

    const burbuja = document.createElement("div");
    burbuja.id = "burbuja-ubicacion";
    burbuja.innerHTML = `
        <div class="burbuja-flecha-borde"></div>
        <div class="burbuja-flecha-relleno"></div>
        <div class="burbuja-cerrar">&times;</div>
        <span>📍 Mediante tu ubicación actual encuentra tu Unidad Territorial</span>
    `;

    wrapper.appendChild(burbuja);

    // Cerrar manualmente
    burbuja.querySelector(".burbuja-cerrar").onclick = (e) => {
        e.stopPropagation();
        ocultarBurbujaUbicacion();
    };

    // Auto-ocultar después de 40 segundos
    window._timeoutBurbujaUbicacion = setTimeout(() => {
        ocultarBurbujaUbicacion();
    }, 40000);
}

function ocultarBurbujaUbicacion() {
    if (window._timeoutBurbujaUbicacion) {
        clearTimeout(window._timeoutBurbujaUbicacion);
        window._timeoutBurbujaUbicacion = null;
    }
    const burbuja = document.getElementById("burbuja-ubicacion");
    if (!burbuja) return;

    burbuja.style.opacity = "0";
    setTimeout(() => {
        if (burbuja.parentNode) burbuja.remove();
    }, 400);
}
function toggleBotonUbicacion(mostrar) {
    const btn = document.getElementById("boton-ubicacion");
    if (btn) {
        btn.style.display = mostrar ? "flex" : "none";
    }
    if (!mostrar) {
        ocultarBurbujaUbicacion();
    }
}

function limpiarMarcadorUbicacion() {
    if (marcadorUbicacionUsuario) {
        marcadorUbicacionUsuario.setMap(null);
        marcadorUbicacionUsuario = null;
    }
}

async function buscarPorUbicacion(boton) {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
    }

    // Estado de carga en el botón
    const iconoOriginal = boton.innerHTML;
    boton.style.pointerEvents = "none";
    boton.style.opacity = "0.5";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const respuesta = await fetchFromApi('contains/demarcacion', { lat: lat, lon: lon });

                // Extraer propiedades sin importar si viene como FeatureCollection, Feature u objeto plano
                let props = null;
                if (respuesta?.features?.length > 0) {
                    props = respuesta.features[0].properties;
                } else if (respuesta?.properties) {
                    props = respuesta.properties;
                } else if (Array.isArray(respuesta) && respuesta.length > 0) {
                    props = respuesta[0].properties || respuesta[0];
                }

                if (!props || props.numero_dem === undefined) {
                    alert("No se encontró una demarcación en tu ubicación actual. Verifica que estés dentro de la CDMX.");
                    return;
                }

                const numeroDemar = props.numero_dem;
                const nombreDemar = props.nombre;

                // Limpiar pin anterior si existía
                limpiarMarcadorUbicacion();

                // Guardar selección igual que en el click de polígono
                demarcacionSeleccionada = numeroDemar;
                demarcacionNombreSeleccionada = nombreDemar;

                // Ocultar botón: ya no estamos en el nivel "demarcaciones"
                toggleBotonUbicacion(false);

                // Cargar las UTs de esa demarcación (limpiarPoligonos() se ejecuta dentro)
                await unidadesT(numeroDemar, nombreDemar);

                // Colocar el pin del usuario DESPUÉS de que unidadesT limpió el mapa
                const posicionUsuario = new google.maps.LatLng(lat, lon);
                marcadorUbicacionUsuario = new google.maps.Marker({
                    position: posicionUsuario,
                    map: mapaindex,
                    title: "Tu ubicación",
                    zIndex: 2000,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                                <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"
                                      fill="#9129A2" stroke="#ffffff" stroke-width="1.5"/>
                                <circle cx="12" cy="10" r="3" fill="#ffffff"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(36, 36),
                        anchor: new google.maps.Point(18, 34)
                    }
                });

                mapaindex.panTo(posicionUsuario);
                mapaindex.setZoom(14);

            } catch (error) {
                console.error("Error al consultar demarcación por ubicación:", error);
                alert("Ocurrió un error al buscar tu ubicación. Intenta nuevamente.");
            } finally {
                boton.style.pointerEvents = "auto";
                boton.style.opacity = "1";
                boton.innerHTML = iconoOriginal;
            }
        },
        (error) => {
            boton.style.pointerEvents = "auto";
            boton.style.opacity = "1";
            let mensaje = "No se pudo obtener tu ubicación.";
            if (error.code === error.PERMISSION_DENIED) {
                mensaje = "Debes permitir el acceso a tu ubicación para usar esta función.";
            } else if (error.code === error.TIMEOUT) {
                mensaje = "La búsqueda de ubicación tardó demasiado. Intenta de nuevo.";
            }
            alert(mensaje);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Función para actualizar el dropdown con posicionamiento correcto
function crearDropdownUTs(seccion, utsArray) {
    const contenedorDropdown = document.getElementById("contenedor-dropdown");

    // Limpiar contenido anterior
    contenedorDropdown.innerHTML = "";

    // Crear dropdown
    const dropdown = document.createElement("select");
    dropdown.id = "dropdown-uts";
    dropdown.style.cssText = `
        background-color: white;
        border: 1px solid gray;
        padding: 8px;
        border-radius: 4px;
        font-size: 14px;
        width: 320px;
        box-sizing: border-box;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;

    // Opción por defecto
    const opcionDefault = document.createElement("option");
    opcionDefault.value = "";
    opcionDefault.textContent = `Selecciona UT para sección ${seccion}`;
    dropdown.appendChild(opcionDefault);

    // Agregar opciones de UTs
    utsArray.forEach((utData, index) => {
        const opcion = document.createElement("option");
        opcion.value = index;
        opcion.textContent = utData.feature.properties.nombre;
        dropdown.appendChild(opcion);
    });

    // Event listener para selección - MODIFICADO
    dropdown.addEventListener('change', (e) => {
        if (e.target.value !== "") {
            // LIMPIAR historial antes de mostrar UT seleccionada del dropdown
            limpiarHistorial();

            const utSeleccionada = utsArray[parseInt(e.target.value)];
            mostrarUTSeleccionada(utSeleccionada.feature);
            contenedorDropdown.style.display = "none";
        }
    });

    contenedorDropdown.appendChild(dropdown);
    contenedorDropdown.style.display = "block";
}

function buscarPorSeccion(seccionInput) {
    const seccion = seccionInput.trim();

    if (!seccion) {
        alert("Por favor ingresa un número de sección");
        return;
    }

    // NORMALIZAR la sección: eliminar ceros a la izquierda
    const seccionNormalizada = normalizarSeccion(seccion);

    // AGREGAR: Limpiar historial al iniciar búsqueda por sección
    limpiarHistorial();

    // Ocultar dropdown si estaba visible
    const contenedorDropdown = document.getElementById("contenedor-dropdown");
    if (contenedorDropdown) {
        contenedorDropdown.style.display = "none";
    }

    // Verificar si es sección única (usando la versión NORMALIZADA)
    if (seccionesUnicas.has(seccionNormalizada)) {
        const utData = seccionesUnicas.get(seccionNormalizada);
        mostrarUTSeleccionada(utData.feature);
    }
    // Verificar si es sección duplicada (usando la versión NORMALIZADA)
    else if (seccionesDuplicadas.has(seccionNormalizada)) {
        const utsArray = seccionesDuplicadas.get(seccionNormalizada);
        mostrarUTsDuplicadas(seccionNormalizada, utsArray); // Pasar versión normalizada
        // crearDropdownUTs(seccionNormalizada, utsArray); // Pasar versión normalizada
    }
    // Sección no encontrada (mostrar versión NORMALIZADA en el error)
    else {
        alert(`Sección "${seccionNormalizada}" no encontrada. Verifica el número.`);
    }

    // Limpiar input
    document.getElementById("buscador").value = '';
}

// AÑADIR esta función de normalización (si no existe ya)
function normalizarSeccion(seccion) {
    if (typeof seccion !== 'string') {
        seccion = String(seccion);
    }
    // Eliminar ceros a la izquierda, pero mantener "0" si todos son ceros
    const normalizada = seccion.replace(/^0+/, '');
    return normalizada === '' ? '0' : normalizada;
}

// Función modificada para limpiar usando map.data
function limpiarPoligonos() {
    poligonosActuales.forEach((p) => {
        // Si es un polígono tradicional
        if (p instanceof google.maps.Polygon) {
            p.setMap(null);
        }
        // Si es un feature de map.data
        else if (p instanceof google.maps.Data.Feature) {
            mapaindex.data.remove(p);
        }
    });

    // También limpiar todos los features del data layer
    mapaindex.data.forEach(feature => {
        mapaindex.data.remove(feature);
    });

    poligonosActuales = [];
}

// Modificar función regresar - ACTUALIZAR LA LÓGICA DEL HISTORIAL
function regresar() {

    // Detectar si estamos en móvil
    const esMobile = window.innerWidth <= 768;

    // Seleccionar zoom dinámico
    const zoomInicial = esMobile ? 10 : 11;

    // Cerrar InfoWindow si está abierto
    if (window.infoWindow) {
        window.infoWindow.close();
        window.infoWindow = null;
    }
    // Ocultar dropdown si está visible
    const contenedorDropdown = document.getElementById("contenedor-dropdown");
    if (contenedorDropdown) {
        contenedorDropdown.style.display = "none";
    }

    if (nivelActual === "ut-seleccionada" || nivelActual === "uts-duplicadas") {
        // Regresar a demarcaciones y limpiar historial completamente
        demarcaciones();
        document.getElementById('informacion-poligonos').innerText = "Selecciona tu Demarcación";
        setTimeout(() => {
            mapaindex.setCenter({ lat: 19.336190823601026, lng: -99.14025476586043 });
            mapaindex.setZoom(zoomInicial);
        }, 500);
    }
    else if (nivelActual === "unidades") {
        // Regresar a demarcaciones, limpiar historial
        demarcaciones();
        document.getElementById('informacion-poligonos').innerText = "Selecciona tu Demarcación";
        setTimeout(() => ajustarZoomParaNivel("demarcaciones"), 500);
    }
}

// Función para inicializar el buscador
function inicializarBuscador() {
    unidadesTerritoriales();
}

// Función para crear el contenedor del historial de selección
function crearHistorialSeleccion(mapa) {
    // Crear contenedor principal del historial
    const contenedorHistorial = document.createElement("div");
    contenedorHistorial.id = "historial-seleccion";
    contenedorHistorial.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 400px;
        z-index: 1000;
        pointer-events: none;
    `;

    // Agregar al contenedor del mapa
    const mapaContainer = mapa.getDiv();
    mapaContainer.style.position = 'relative';
    mapaContainer.appendChild(contenedorHistorial);
}

// Función para actualizar el historial de selección
function actualizarHistorial(nivel, datos = {}) {
    const contenedorHistorial = document.getElementById("historial-seleccion");
    if (!contenedorHistorial) return;

    // Limpiar contenido anterior
    contenedorHistorial.innerHTML = "";

    // Crear elementos según el nivel actual
    switch (nivel) {
        case "demarcaciones":
            // No mostrar nada en el nivel inicial
            break;

        case "unidades":
            // Mostrar solo demarcación cuando se carga el nivel de unidades
            if (datos.demarcacion) {
                const elementoDemarcacion = crearElementoHistorial(
                    datos.demarcacion,
                    "demarcacion"
                );
                contenedorHistorial.appendChild(elementoDemarcacion);
            }
            // Mostrar distrito y unidad solo si están definidos (cuando se hace click en una UT)
            if (datos.distrito) {
                const elementoDistrito = crearElementoHistorial(
                    datos.distrito,
                    "distrito"
                );
                contenedorHistorial.appendChild(elementoDistrito);
            }
            if (datos.unidad) {
                const elementoUnidad = crearElementoHistorial(
                    datos.unidad,
                    "unidad"
                );
                contenedorHistorial.appendChild(elementoUnidad);
            }
            break;

        case "ut-seleccionada":
        case "uts-duplicadas":
            // Mostrar demarcación, distrito y unidad territorial
            if (datos.demarcacion) {
                const elementoDemarcacion = crearElementoHistorial(
                    datos.demarcacion,
                    "demarcacion"
                );
                contenedorHistorial.appendChild(elementoDemarcacion);
            }
            if (datos.distrito) {
                const elementoDistrito = crearElementoHistorial(
                    datos.distrito,
                    "distrito"
                );
                contenedorHistorial.appendChild(elementoDistrito);
            }
            if (datos.unidad) {
                const elementoUnidad = crearElementoHistorial(
                    datos.unidad,
                    "unidad"
                );
                contenedorHistorial.appendChild(elementoUnidad);
            }
            break;
    }
}

// QUITAMOS FUNCION PARA ELIMINAR EL CASO DE DISTRITOS
// function actualizarHistorial(nivel, datos = {}) {
//     const contenedorHistorial = document.getElementById("historial-seleccion");
//     if (!contenedorHistorial) return;

//     // Limpiar contenido anterior
//     contenedorHistorial.innerHTML = "";

//     // Crear elementos según el nivel actual
//     switch(nivel) {
//         case "demarcaciones":
//             // No mostrar nada en el nivel inicial
//             break;

//         case "distritos":
//             // Mostrar solo demarcación
//             if (datos.demarcacion) {
//                 const elementoDemarcacion = crearElementoHistorial(
//                     datos.demarcacion, 
//                     "demarcacion"
//                 );
//                 contenedorHistorial.appendChild(elementoDemarcacion);
//             }
//             break;

//         case "unidades":
//             // Mostrar demarcación y distrito
//             if (datos.demarcacion) {
//                 const elementoDemarcacion = crearElementoHistorial(
//                     datos.demarcacion, 
//                     "demarcacion"
//                 );
//                 contenedorHistorial.appendChild(elementoDemarcacion);
//             }
//             if (datos.distrito) {
//                 const elementoDistrito = crearElementoHistorial(
//                     datos.distrito, 
//                     "distrito"
//                 );
//                 contenedorHistorial.appendChild(elementoDistrito);
//             }
//             break;

//         case "ut-seleccionada":
//         case "uts-duplicadas":
//             // Mostrar demarcación, distrito y unidad territorial
//             if (datos.demarcacion) {
//                 const elementoDemarcacion = crearElementoHistorial(
//                     datos.demarcacion, 
//                     "demarcacion"
//                 );
//                 contenedorHistorial.appendChild(elementoDemarcacion);
//             }
//             if (datos.distrito) {
//                 const elementoDistrito = crearElementoHistorial(
//                     datos.distrito, 
//                     "distrito"
//                 );
//                 contenedorHistorial.appendChild(elementoDistrito);
//             }
//             if (datos.unidad) {
//                 const elementoUnidad = crearElementoHistorial(
//                     datos.unidad, 
//                     "unidad"
//                 );
//                 contenedorHistorial.appendChild(elementoUnidad);
//             }
//             break;
//     }
// }

// Función para crear un elemento individual del historial
function crearElementoHistorial(texto, tipo) {
    const elemento = document.createElement("div");

    // Colores según el tipo (usando los mismos de las funciones originales)
    let colorFondo, colorBorde;
    switch (tipo) {
        case "demarcacion":
            colorFondo = "#520c8b";
            colorBorde = "#520c8b";
            break;
        case "distrito":
            colorFondo = "rgba(236, 164, 39, 0.929)";
            colorBorde = "rgb(236, 164, 39)";
            break;
        case "unidad":
            colorFondo = "rgba(0, 0, 0, 0.668)";
            colorBorde = "rgba(0, 0, 0, 0.668)";
            break;
        default:
            colorFondo = "#520c8b";
            colorBorde = "#520c8b";
    }

    elemento.style.cssText = `
        background-color: ${colorFondo};
        color: white;
        padding: 8px 16px;
        border-radius: 0;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        position: relative;
        pointer-events: auto;
        cursor: default;
        border: 2px solid ${colorBorde};
        clip-path: polygon(0% 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 0% 100%, 15px 50%);
        padding-left: 24px;
        padding-right: 24px;
        min-height: 20px;
        display: flex;
        align-items: center;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
    `;

    // Efecto hover
    elemento.onmouseenter = () => {
        elemento.style.transform = "translateX(5px)";
        elemento.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    };

    elemento.onmouseleave = () => {
        elemento.style.transform = "translateX(0)";
        elemento.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
    };

    elemento.textContent = texto;
    return elemento;
}

// PASO 1: Agregar función de limpieza (ya incluida en el código anterior)
function limpiarHistorial() {
    historialDatos = {
        demarcacion: null,
        distrito: null,
        unidad: null
    };
    actualizarHistorial("demarcaciones", historialDatos);
}

