// DESACTIVAR CONSOLE EN PRODUCCIÓN
console.log = function(){};
console.warn = function(){};
console.error = function(){};
console.info = function(){};
console.debug = function(){};


/*********************************************************************************
                      APARTADO DE LA PÁGINA UNIFICADA
**********************************************************************************/

// Variables globales
let impressInstance = null;
let impressInitialized = false;
let circlesShowing = false;
let currentActive = null;
let mostrarQuitarTexto;
let visitas = 0; // valor inicial del contador
let contadorIniciado = false; // evita que se reinicie

// Detectar si es dispositivo móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Mapeo entre data-info del círculo y el slug que aparecerá en la URL
const slugMap = {
    'uts': 'presentacion',
    'caracteristicas': 'marco-geografico',
    'metodologica': 'nota-metodologica',
    'glosario': 'glosario',
    'unidad-territorial': 'unidad-territorial',
    'referencias': 'referencias'
};
// Invertido para buscar por slug
const slugToInfo = Object.fromEntries(Object.entries(slugMap).map(([k,v]) => [v, k]));

// Datos de cada círculo
const circleData = {

    'uts': { 
        title: "Presentación", 
        // name: "Territoriales",
        //description: "El Marco Geográfico de Participación Ciudadana (MGPC) es una herramienta técnica en la que se realiza una representación cartográfica geoelectoral de aquella parte de la Ciudad de México, que se encuentra dividida en polígonos identificados como unidades territoriales; y que es útil en la organización de los procesos de participación ciudadana.",
        description: "El Instituto Electoral de la Ciudad de México (IECM) como organismo público encargado de organizar las elecciones en la Ciudad de México y los procedimientos de participación ciudadana, mantiene un trabajo continuo en la construcción de una ciudadanía más democrática y participativa, para ello ha desarrollado herramientas que contribuyan y faciliten la interlocución con los actores sociales y políticos en materia electoral y de participación ciudadana.",
        image: "imagenes/angel_iecm.png",
        buttonType: "uts",
        id: "uts"
    },
    'caracteristicas': { 
        title: "¿Qué es el Marco Geográfico", 
        name: " de Participación Ciudadana?",
        description: "El Instituto Electoral de la Ciudad de México (IECM), como parte de sus atribuciones en materia de Participación Ciudadana, mantiene un trabajo constante en la revisión de los mecanismos e instrumentos que posibilitan la construcción de una ciudadanía más democrática y participativa.",
        image: "imagenes/MGPC.jpg",
        buttonType: "carac",
        id: "caracteristicas"
    },
    'metodologica': { 
        title: "Nota", 
        name: "Metodológica",
        description: "Este apartado describe brevemente el proceso metodológico del Sistema de Características Geoelectorales y de Participación Ciudadana (Unidades Territoriales), desde las fuentes de información hasta el procesamiento de datos y la caracterización de sus indicadores.",
        image: "imagenes/azul.jpg",
        buttonType: "meto",
        id: "metodologica"
    },
    'glosario': { 
        title: "Glosario", 
        name: "",
        description: "Este apartado contiene conceptos y/o definiciones que facilitan la comprensión de la información incluida en el Sistema de Características Geoelectorales y de Participación Ciudadana (Unidades Territoriales).",
        image: "imagenes/glosario.png",
        buttonType: "glos",
        id: "glosario"
    },
    'unidad-territorial': { 
        title: "Conoce las Características", 
        name: "De tu Unidad Territorial",
        description: "Características Geoelectorales y de Participación Ciudadana es una plataforma digital de consulta que integra información por Unidad Territorial sobre tres dimensiones fundamentales: base territorial geoelectoral, participación ciudadana e indicadores sociodemográficos. El sistema ofrece once categorías de información derivadas del Censo de Población y Vivienda 2020 del INEGI y adaptadas al ámbito territorial del Marco Geográfico de Participación Ciudadana, como: población, territorio, vivienda, etnicidad, discapacidad, migración, economía, educación, hogares, salud y situación conyugal. Además, cuenta con funcionalidades especializadas como mapas de calor, mapas temáticos categorizados, gráficos y perfiles altimétricos. Una herramienta al servicio de la ciudadanía para promover la participación ciudadana. Porque solo podemos transformar aquello que conocemos, y conocer nuestro entorno territorial es el primer paso para transformarlo.",
        image: "imagenes/catalogo.jpg",
        buttonType: "mapa-boton",
        id:"mapa-boton"
    },

    'referencias': {
        title: "Referencias",
        name: "",
        description: "Fuentes de información utilizadas para la elaboración del Sistema de Características Geoelectorales y de Participación Ciudadana (Unidades Territoriales).",
        image: "imagenes/glosario.png",
        buttonType: "referencias",
        id: "referencias"
    }
};

// Función principal de inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarPaginaUnificada();
    setupModalImpress();
});


// Función para inicializar la página unificada
function inicializarPaginaUnificada() {

    // Configurar botón "Saber Más"
    const btnSaberMas = document.getElementById('btnSaberMas');
    if (btnSaberMas) {
        btnSaberMas.addEventListener('click', mostrarCirculosYHero);
    }
    
    // Preparar los círculos (pero mantenerlos ocultos)
    prepararCirculos();
    
    // Configurar event listeners para círculos colapsados
    configurarColapsoCerculos();

    // Leer URL al cargar: si hay un apartado en la URL, activarlo directamente
    const params = new URLSearchParams(window.location.search);
    const slugEnUrl = params.get('apartado');

    if (slugEnUrl && slugToInfo[slugEnUrl]) {
        const dataInfo = slugToInfo[slugEnUrl];
        const data = circleData[dataInfo];

        // 1. Mostrar círculos y hero sin animación de bienvenida
        mostrarCirculosYHero();

        setTimeout(() => {
            // 2. Marcar círculo activo
            const circulo = document.querySelector(`[data-info="${dataInfo}"]`);
            document.querySelectorAll('.circle-item').forEach(c => c.classList.remove('active'));
            if (circulo) circulo.classList.add('active');
            currentActive = dataInfo;

            // 3. Mostrar panel lateral (igual que al hacer click en círculo)
            mostrarContenidoDinamico(data);

            // 4. Simular click en "Saber Más" para abrir el div directamente
            setTimeout(() => {
                const panelButton = document.getElementById('panelButton');
                if (panelButton) panelButton.click();
            }, 200);

        }, 1000);
    }
}

window.addEventListener('popstate', (e) => {
    if (e.state?.apartado) {
        const data = circleData[e.state.apartado];
        document.querySelectorAll('.circle-item').forEach(c => c.classList.remove('active'));
        const circulo = document.querySelector(`[data-info="${e.state.apartado}"]`);
        if (circulo) circulo.classList.add('active');
        currentActive = e.state.apartado;
        mostrarContenidoDinamico(data);
    } else {
        // Sin estado = volver al hero
        document.querySelectorAll('.circle-item').forEach(c => c.classList.remove('active'));
        currentActive = null;
        mostrarHeroState();
    }
});

// Detectar si es dispositivo móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Ajustar posición del preview tooltip en móvil
function ajustarPreviewMobile(preview, circle) {

    if (isMobile()) {
        const rect = circle.getBoundingClientRect();
        preview.style.position = 'fixed';
        preview.style.bottom = '100px';
        preview.style.left = '50%';
        preview.style.transform = 'translateX(-50%)';
        preview.style.top = 'auto';
    }

}

function mostrarCirculosYHero() {

    const initialState = document.getElementById('initialState');
    const heroState = document.getElementById('heroState');
    const circlesContainer = document.getElementById('circlesContainer');
    const contadorElemento = document.getElementById('contador');

    //Mostramos el div del contador
    const divContador = document.getElementById('divContador');
    divContador.style.display = 'grid';
    
    // Transición de salida
    initialState.style.transition = 'opacity 0.8s ease-out';
    initialState.style.opacity = '0';
    
    setTimeout(() => {

        // Ocultar estado inicial
        initialState.classList.add('hidden');

        // aumentar contadro en BD
        fetch("contador.php")
        
            .then(response => response.text())
            .then(data => {
                contadorElemento.innerText = data;
            });

        // efectos
        heroState.classList.remove('hidden');
        heroState.style.transition = 'opacity 1s ease-in';
        heroState.style.opacity = '0';
        
        setTimeout(() => {
            heroState.style.opacity = '1';
        }, 100);
        
        // Mostrar círculos
        circlesContainer.classList.remove('hidden');
        circlesContainer.classList.add('show');
        circlesShowing = true;
        
        // if (!isMobile()) {
        //     setTimeout(() => {
        //         if (circlesContainer && circlesShowing && !circlesContainer.matches(':hover')) {
        //             circlesContainer.classList.add('collapsed');
        //         }
        //     }, 10000);
        // }

    }, 800);
}


// function mostrarCirculosYHero() {

//     const initialState = document.getElementById('initialState');
//     const heroState = document.getElementById('heroState');
//     const circlesContainer = document.getElementById('circlesContainer');
    
//     // Transición más suave y lenta
//     initialState.style.transition = 'opacity 0.8s ease-out';
//     initialState.style.opacity = '0';
    
//     setTimeout(() => {

//         // Ocultar estado inicial
//         initialState.classList.add('hidden');

//         iniciarContadorAcumulativo(1);
        
//         // Mostrar hero state con transición más suave
//         heroState.classList.remove('hidden');
//         heroState.style.transition = 'opacity 1s ease-in';
//         heroState.style.opacity = '0';
        
//         setTimeout(() => {
//             heroState.style.opacity = '1';
//         }, 100);
        
//         // Mostrar círculos con animación en cascada
//         circlesContainer.classList.remove('hidden');
//         circlesContainer.classList.add('show');
//         circlesShowing = true;
        
//         // Auto-colapsar SOLO si NO es móvil
//         if (!isMobile()) {
//             setTimeout(() => {
//                 if (circlesContainer && circlesShowing && !circlesContainer.matches(':hover')) {
//                     circlesContainer.classList.add('collapsed');
//                 }
//             }, 10000);
//         }
        
//     }, 800); // Aumentado de 300 a 800ms para transición más suave
// }

function configurarColapsoCerculos() {
    
    const circlesContainer = document.getElementById('circlesContainer');
    
    if (circlesContainer) {
        // Solo aplicar eventos de colapso si NO es móvil
        if (!isMobile()) {
            // Expandir al pasar el mouse (solo desktop)
            circlesContainer.addEventListener('mouseenter', function() {
                this.classList.remove('collapsed');                

                // Restaurar el estado actual después de expandir
                if (currentActive) {
                    const activeData = circleData[currentActive];
                    const panelBackground = document.getElementById('panelBackground');
                    
                    // Aplicar transición suave al restaurar
                    setTimeout(() => {
                        panelBackground.style.transition = 'background-image 0.8s ease-in-out, opacity 0.5s ease';
                        panelBackground.style.backgroundImage = `url('${activeData.image}')`;
                        panelBackground.style.opacity = '1';
                        
                    }, 100);
                }
            });
            
            // // Colapsar al quitar el mouse (solo desktop)
            // circlesContainer.addEventListener('mouseleave', function() {
            //     // Re-colapsar después de 3 segundos de quitar el mouse
            //     setTimeout(() => {
            //         if (!this.matches(':hover') && circlesShowing && !isMobile()) {
            //             this.classList.add('collapsed');
            //         }
            //     }, 3000);
            // });
        }
    }
}

// Función para preparar los círculos
function prepararCirculos() {

    const circleItems = document.querySelectorAll('.circle-item');
    const preview = document.getElementById('circlePreview');
    const previewTitle = preview?.querySelector('.preview-title');
    const previewName = preview?.querySelector('.preview-name');
    
    circleItems.forEach((circle) => {

        const dataInfo = circle.getAttribute('data-info');
        const data = circleData[dataInfo];
        
        if (data) {

            //Mostrar los demas botones del menu
            // Evento mouseenter
            circle.addEventListener('mouseenter', function(e) {
                
                if (!circlesShowing) return;
                
                // Mostrar preview tooltip
                if (preview && previewTitle && previewName) {

                    previewTitle.textContent = data.title;                   
                    previewName.textContent = data.name;

                    previewTitle.style.fontSize = "15px";
                    previewTitle.style.fontWeight = "bold";
                    previewTitle.style.textAlign = "center";

                    previewName.style.fontSize = "15px";
                    previewName.style.fontWeight = "bold";
                    previewName.style.textAlign = "center";
                    
                    if (isMobile()) {
                        // Posición fija para móvil
                        ajustarPreviewMobile(preview, circle);
                    } else {
                        // Posición normal para desktop
                        const rect = circle.getBoundingClientRect();                        
                        
                        // Ajustar tamaño dinámico según texto
                        preview.style.width = 'auto';
                        preview.style.minWidth = '150px';
                        preview.style.maxWidth = '300px';
                        preview.style.height = 'auto';
                        preview.style.display = 'block';
                        preview.style.padding = '12px 16px';
                        preview.style.whiteSpace = 'normal';
                        preview.style.wordBreak = 'break-word';
                        
                        // Posicionar el tooltip
                        preview.style.left = (rect.right + 15) + 'px';
                        preview.style.top = (rect.top + (rect.height / 2) - (preview.offsetHeight / 2)) + 'px';

                    }
                    
                    preview.classList.add('active');
                }
            });
            
            // Evento mouseleave
            circle.addEventListener('mouseleave', function() {
                if (preview) {
                    preview.classList.remove('active');
                }
            });
            
            // Evento click
            circle.addEventListener('click', function() {

                if (!circlesShowing) return;
                
                if (preview) {
                    preview.classList.remove('active');
                }
                
                if (currentActive === dataInfo) {

                    // Si es el mismo círculo, volver al hero
                    mostrarHeroState();
                } else {
                    // Desactivar círculo anterior
                    circleItems.forEach(c => c.classList.remove('active'));
                    
                    // Activar nuevo círculo
                    currentActive = dataInfo;
                    circle.classList.add('active');
                    
                    // Mostrar contenido dinámico
                    mostrarContenidoDinamico(data);
                }
            });
        }
    });
    
    // Iniciar animación aleatoria de los círculos
    iniciarAnimacionAleatoria();
}

// Función mejorada para mostrar contenido dinámico
function mostrarContenidoDinamico(data) {
    const heroState = document.getElementById('heroState');
    const dynamicState = document.getElementById('dynamicState');
    const panelBackground = document.getElementById('panelBackground');

    // Configurar transición del fondo
    panelBackground.style.transition = 'background-image 0.6s ease-in-out, opacity 0.4s ease-in-out';

    // Actualizar descripción
    document.getElementById('panelDescription').textContent = data.description;

    // Configurar botón
    const panelButton = document.getElementById('panelButton');
    if (data.buttonType) {
        panelButton.setAttribute('data-button-type', data.buttonType);
        panelButton.style.display = 'block';
        cargarPresentacion(data.id);
    } else {
        panelButton.style.display = 'none';
    }

    // Función auxiliar para cambiar fondo con transición limpia
    const cambiarFondo = (imagen) => {
        // Opacidad baja → cambio de imagen → restaurar opacidad
        panelBackground.style.opacity = '0.7'; 

        const onTransitionEnd = () => {
            panelBackground.removeEventListener('transitionend', onTransitionEnd);
            panelBackground.style.backgroundImage = `url('${imagen}')`;

            // Pequeño delay para asegurar carga visual
            requestAnimationFrame(() => {
                panelBackground.style.opacity = '1';
            });
        };

        panelBackground.addEventListener('transitionend', onTransitionEnd);
    };

    // Transición entre secciones
    if (!heroState.classList.contains('hidden')) {
        heroState.style.opacity = '0';
        setTimeout(() => {
            heroState.classList.add('hidden');
            dynamicState.classList.remove('hidden');
            cambiarFondo(data.image);
            dynamicState.style.opacity = '0';
            setTimeout(() => {
                dynamicState.style.opacity = '1';
            }, 100);
        }, 300);
    } else {
        // Solo actualizar contenido si ya está visible
        dynamicState.style.opacity = '0.5';
        setTimeout(() => {
            document.getElementById('panelDescription').textContent = data.description;
            cambiarFondo(data.image);
            dynamicState.style.opacity = '1';
        }, 200);
    }
}



// Función para volver al hero state
function mostrarHeroState() {

    const heroState = document.getElementById('heroState');
    const dynamicState = document.getElementById('dynamicState');
    const panelBackground = document.getElementById('panelBackground');
    
    dynamicState.style.opacity = '0';
    
    setTimeout(() => {
        dynamicState.classList.add('hidden');
        heroState.classList.remove('hidden');
        
        // Restaurar fondo hero
        panelBackground.style.backgroundImage = `url('imagenes/angel_iecm.png')`;
        panelBackground.style.transition = 'background-image 0.8s ease-in-out, opacity 0.5s ease';
        
        heroState.style.opacity = '0';
        setTimeout(() => {
            heroState.style.opacity = '1';
        }, 50);
    }, 300);
    
}

// Animación aleatoria de círculos
function iniciarAnimacionAleatoria() {

    const circleItems = document.querySelectorAll('.circle-item');
    let currentAnimating = null;
    
    function animateRandomCircle() {
        if (!circlesShowing) return;
        
        // Limpiar animaciones anteriores
        circleItems.forEach(circle => {
            circle.classList.remove('random-bounce');
        });
        currentAnimating = null;
        
        // Filtrar círculos disponibles
        const availableCircles = Array.from(circleItems).filter(circle => 
            !circle.classList.contains('active') && !circle.matches(':hover')
        );
        
        if (availableCircles.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCircles.length);
            const randomCircle = availableCircles[randomIndex];
            
            currentAnimating = randomCircle;
            randomCircle.classList.add('random-bounce');
            
            setTimeout(() => {
                if (currentAnimating === randomCircle) {
                    randomCircle.classList.remove('random-bounce');
                    currentAnimating = null;
                }
            }, 2000);
        }
    }
    
    // Primera animación después de 3 segundos
    setTimeout(animateRandomCircle, 3000);
    
    // Repetir cada 5-7 segundos
    setInterval(() => {
        if (!currentAnimating && circlesShowing) {
            animateRandomCircle();
        }
    }, Math.random() * 2000 + 5000);
}

function cargarPresentacion(idBotonMenu){

        // Configurar event listener del botón dinámico
        document.addEventListener('click', function(e) {

        if (e.target && e.target.id === 'panelButton') {

            const slug = slugMap[currentActive];
            if (slug) history.pushState({ apartado: currentActive }, '', `?apartado=${slug}`);

            e.preventDefault();
            e.stopPropagation();
            
            const buttonType = e.target.getAttribute('data-button-type');
            if (buttonType) {
                ejecutarAccionBoton(buttonType, idBotonMenu);
            }
        }
    });

}

/*************************************************************************************
 * FUNCIONES GLOSARIO
***************************************************************************************/

// Variables globales para el glosario
let glosarioScrollListener = null;
let glosarioLinksListeners = [];

// Función para inicializar el glosario
function inicializarGlosario() {
    // Limpiar listeners anteriores
    limpiarListenersGlosario();
    
    const indiceLetras = document.querySelectorAll('.indice-letra');
    const modal = document.getElementById('impress-modal-glosa');
    
    if (!indiceLetras.length || !modal) return;
    
    // Suavizar el scroll - Agregar listeners a los enlaces
    indiceLetras.forEach(link => {
        const clickHandler = function(e) {
            e.preventDefault();
            
            // Remover clase active de todas
            document.querySelectorAll('.indice-letra').forEach(l => l.classList.remove('active'));
            
            // Agregar clase active a la clickeada
            this.classList.add('active');
            
            // Scroll suave al elemento
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Usar el contenedor del modal para el scroll
                const modalContent = modal.querySelector('.step-glos');
                if (modalContent) {
                    const offsetTop = targetElement.offsetTop - modalContent.offsetTop - 100;
                    modalContent.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        };
        
        link.addEventListener('click', clickHandler);
        // Guardar referencia del listener para poder removerlo después
        glosarioLinksListeners.push({ element: link, handler: clickHandler });
    });
    
    // Detectar qué letra está visible mientras se hace scroll
    const modalContent = modal.querySelector('.step-glos');
    
    if (modalContent) {
        glosarioScrollListener = function() {
            const letras = document.querySelectorAll('.letra-seccion');
            
            letras.forEach(letra => {
                const rect = letra.getBoundingClientRect();
                const modalRect = modalContent.getBoundingClientRect();
                
                // Verificar si la letra está visible en el viewport del modal
                if (rect.top >= modalRect.top && rect.top <= modalRect.top + 200) {
                    const id = letra.getAttribute('id');
                    
                    // Remover active de todos
                    document.querySelectorAll('.indice-letra').forEach(l => l.classList.remove('active'));
                    
                    // Agregar active al correspondiente
                    const activeLink = document.querySelector(`a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        };
        
        modalContent.addEventListener('scroll', glosarioScrollListener);
    }
}

// Función para limpiar los listeners del glosario
function limpiarListenersGlosario() {
    // Remover listeners de los enlaces
    glosarioLinksListeners.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
    });
    glosarioLinksListeners = [];
    
    // Remover listener del scroll
    if (glosarioScrollListener) {
        const modal = document.getElementById('impress-modal-glosa');
        const modalContent = modal?.querySelector('.step-glos');
        if (modalContent) {
            modalContent.removeEventListener('scroll', glosarioScrollListener);
        }
        glosarioScrollListener = null;
    }
    
    // Limpiar clases active
    document.querySelectorAll('.indice-letra').forEach(l => l.classList.remove('active'));
}
function ejecutarAccionBoton(buttonType, id_menu_boton) {

    const dynamicState = document.getElementById('dynamicState');
    const circlesContainer = document.getElementById('circlesContainer');
    const socialMenu = document.querySelector('.social-menu');
    const modalUts = document.getElementById('impress-modal-uts');
    const modalCarac = document.getElementById('impress-modal-carac');
    const modalMeto = document.getElementById('impress-modal-meto');
    const modalGlos = document.getElementById('impress-modal-glosa');
    const modalRef = document.getElementById('impress-modal-referencias');
    const contadorDiv = document.getElementById('divContador');

    // Ocultar todo primero
    [modalUts, modalCarac, modalMeto, modalGlos, modalRef, contadorDiv].forEach(m => m.classList.add('hidden'));

    const panelButton = document.getElementById('panelButton');
    if (panelButton) panelButton.style.display = 'none';

    // OCULTAR SOCIAL-MENU CUANDO SE ABRE EL PANEL
    if (socialMenu) {
        socialMenu.classList.add('hidden');
    }

    //Presentacion
    if(buttonType === 'uts' && id_menu_boton === 'uts'){

        dynamicState.classList.add('hidden');
        circlesContainer.classList.add('hidden');
        modalUts.classList.remove('hidden');

        // MOSTRAMOS SPINNER
        const overlay = document.getElementById('overlay1');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add("hidden");
        }, 1000);

        // Intersection Observer para animaciones
        const blocks = document.querySelectorAll('.texto-infografia');
        const observer = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }

            });

        }, { threshold: 0.2 });

    blocks.forEach(block => observer.observe(block));

    }
    //Marco Geografico de Participacion Ciudadana
    else if(buttonType === 'carac' && id_menu_boton === 'caracteristicas'){

        dynamicState.classList.add('hidden');
        circlesContainer.classList.add('hidden');
        modalCarac.classList.remove('hidden');

        // MOSTRAMOS SPINNER
        const overlay = document.getElementById('overlay1');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add("hidden");
        }, 1000);

        // Seleccionamos todos los bloques
        const blocks = document.querySelectorAll('#impress-modal-carac .infografia-menu-lateral-mgpc');

        // Asigna entrada alternada (izquierda/derecha)
        blocks.forEach((block, index) => {
        block.classList.add(index % 2 === 0 ? "left" : "right");
        });

        const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            } else {
            // Ocultar para que también anime al volver a subir
            entry.target.classList.remove('visible');
            }
        });
        }, { threshold: 0.2 });

        blocks.forEach(block => observer.observe(block));

    }
    //Nota Metodologica
    else if (buttonType === 'meto' && id_menu_boton === 'metodologica') {

        dynamicState.classList.add('hidden');
        circlesContainer.classList.add('hidden');
    
        // MOSTRAMOS SPINNER
        const overlay = document.getElementById('overlay1');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add("hidden");
          }, 1000);
    
        // Hacemos la petición fetch
        fetch('vistas/notaMetodologica.html')

        .then(response => {

            if (!response.ok) {
                throw new Error("Error al cargar la vista");
            }
            return response.text();

        })
        .then(html => {

           // verificamos que exista un contenedor previo y  lo eliminamos
            const existingContainer = document.getElementById("contenedorNotaMetodologica");
            if (existingContainer) {
                existingContainer.remove();
            }

            // nuevo contenedor dinamico
            const contenedorNota = document.createElement('div');
            contenedorNota.id = "contenedorNotaMetodologica";
            contenedorNota.innerHTML = html;

            //insetar el contenedor despues de la vista original
            document.body.appendChild(contenedorNota);

            //evento click del boton cerrar
            const closeBtn = contenedorNota.querySelector('.close-modal-notaMetodologica');
            if (closeBtn) {

                closeBtn.addEventListener('click', () => {

                    contenedorNota.remove(); // eliminar el contenido dinamico
                    dynamicState.classList.remove('hidden'); // mostramos la vista original
                    circlesContainer.classList.remove('hidden'); // menu lateral
                    contadorDiv.classList.remove('hidden'); //contador

                    //MOSTRAR SOCIAL-MENU AL CERRAR NOTA METODOLÓGICA
                    const socialMenu = document.querySelector('.social-menu');
                    if (socialMenu) {
                        socialMenu.classList.remove('hidden');
                    }

                    history.pushState({}, '', window.location.pathname);
                    const panelButton = document.getElementById('panelButton');
                    if (panelButton) panelButton.style.display = 'block';

                });
            } 
            
            // ============================================
            // ANIMACIONES IZQUIERDA/DERECHA AL SCROLL
            // ============================================

            (function() {

                'use strict';
                
                // Esperar a que el DOM este listo
                const init = () => {

                
                    // ====== CONFIGURACION DEL OBSERVER ======
                    const observerOptions = {
                        threshold: 0.15, // 15% visible para activar
                        rootMargin: '0px 0px -100px 0px' // Margen inferior
                    };
                
                    // ====== CREAR INTERSECTION OBSERVER ======
                    const observer = new IntersectionObserver((entries) => {

                        entries.forEach((entry, index) => {

                            if (entry.isIntersecting) {

                                // entry.target.classList.add('visible');
                                
                                setTimeout(() => {

                                    entry.target.classList.add('visible');

                                }, index * 100); // Delay escalonado

                            } else {
                                
                                entry.target.classList.remove('visible');
                            }

                        });

                    }, observerOptions);
                
                    // ====== OBSERVAR TODAS LAS SECCIONES ======
                    const sections = document.querySelectorAll('.derecha, .top');
                    
                    if (sections.length === 0) {
                        console.warn('⚠️ No se encontraron secciones .derecha o .top');
                        return;
                    }
                
                    sections.forEach(section => {
                        observer.observe(section);
                    });
                    
                    const container = document.querySelector('.nota-metodologica');
                    // if (container) {
                    //     container.addEventListener('scroll', parallaxScroll);
                    // } else {
                    //     window.addEventListener('scroll', parallaxScroll);
                    // }
                    
                    };
                
                    // ====== INICIALIZAR ======
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', init);
                    } else {
                        init();
                    }
                
                    // Reintentar despues de que la pagina cargue completamente
                    window.addEventListener('load', () => {
                    setTimeout(init, 200);
                    });
            
                })();

            const secciones = document.querySelectorAll(".infografia .contenedor-texto p, .infografia blockquote");

            const observer = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                }
            });
            }, { threshold: 0.2 });

            secciones.forEach((sec) => observer.observe(sec));
            
        })
        .catch(error => {
            console.error("Hubo un problema con la carga:", error);
            dynamicState.innerHTML = "<p>Error al cargar el contenido</p>";
            dynamicState.classList.remove('hidden');
        })
        
            
    }    
    //Glosario
    else if(buttonType === 'glos' && id_menu_boton === 'glosario'){

        dynamicState.classList.add('hidden');
        circlesContainer.classList.add('hidden');
        modalGlos.classList.remove('hidden');

        // MOSTRAMOS SPINNER
        const overlay = document.getElementById('overlay1');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add("hidden");
            
            // INICIALIZAR EL GLOSARIO DESPUÉS DE QUE SE MUESTRE
            inicializarGlosario();
        }, 1000);

        // Intersection Observer para animaciones
        const glosarioBlocks = document.querySelectorAll('.infografia-menu-lateral');
        const observerGlosario = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.classList.remove('hide');
                } else {
                    entry.target.classList.remove('visible');
                    entry.target.classList.add('hide');
                }
            });
        }, { threshold: 0.3 });

        glosarioBlocks.forEach(block => observerGlosario.observe(block));
    }
    //REFERENCIAS
    else if (buttonType === 'referencias' && id_menu_boton === 'referencias') {
        dynamicState.classList.add('hidden');
        circlesContainer.classList.add('hidden');
        modalRef.classList.remove('hidden');
    
        // MOSTRAMOS SPINNER
        const overlay = document.getElementById('overlay1');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            overlay.classList.add("hidden");
          }, 1000);
    }
    //Mapa
    else if (buttonType === 'mapa-boton' && id_menu_boton === 'mapa-boton') {
        dynamicState.classList.add('hidden');
        circlesContainer.classList.add('hidden');
        abrirMapa();
    }


}

/*********************************************************************************
                      APARTADO DEl MAPA
**********************************************************************************/

// Función para abrir el mapa
function abrirMapa() {
    const mapaContainer = document.getElementById('mapa-container');

    if (mapaContainer) {
        // Mostrar contenedor con animación
        mapaContainer.classList.remove('hidden');
        mapaContainer.classList.add('showing');

        console.log("[DEBUG abrirMapa] Restableciendo navegación...");
        if (typeof regresar === "function") {
            regresar();  
        }

        // Mostrar modal siempe que se abre el mapa
        console.log("[DEBUG abrirMapa] mostrando modal");
        mostrarModalMapa();

        // Inicializar mapa SOLO la primera vez
        setTimeout(() => {
            if (typeof mapa === 'function' && !window.mapaInicializado) {
                console.log("[DEBUG abrirMapa] inicializando mapa por primera vez");
                mapa();
                window.mapaInicializado = true;
            }
        }, 300);
    }
}



function cerrarMapa() {
    const mapaContainer = document.getElementById('mapa-container');
    const dynamicState = document.getElementById('dynamicState');
    const circlesContainer = document.getElementById('circlesContainer');
    const socialMenu = document.querySelector('.social-menu');
    const welcomeModalMapa = document.getElementById('welcomeModalMapa');

    if (mapaContainer) {

        mapaContainer.style.opacity = '0';
        mapaContainer.style.transform = 'translateY(100%)';

        setTimeout(() => {
            dynamicState.classList.remove('hidden');
            circlesContainer.classList.remove('hidden');
            mapaContainer.classList.add('hidden');
            mapaContainer.classList.remove('showing');
            mapaContainer.style.opacity = '';
            mapaContainer.style.transform = '';

            if (socialMenu) {
                socialMenu.classList.remove('hidden');
            }

            // Restaurar URL y botón Saber Más al cerrar cualquier modal
            history.pushState({}, '', window.location.pathname);
            const panelButton = document.getElementById('panelButton');
            if (panelButton) panelButton.style.display = 'block';

            // OCUltar el modal cuando se cierra el mapa
            if (welcomeModalMapa) {
                welcomeModalMapa.style.display = 'none';
                welcomeModalMapa.style.opacity = '';
                welcomeModalMapa.style.animation = '';
            }

        }, 500);
    }
}


// Event listener para el botón de cerrar
document.addEventListener('DOMContentLoaded', () => {
    const btnCerrarMapa = document.getElementById('cerrar-mapa');
    if (btnCerrarMapa) {
        btnCerrarMapa.addEventListener('click', cerrarMapa);
    }
});

/*********************************************************************************
                      APARTADO DE IMPRESS.JS
**********************************************************************************/

function iniciarImpress(containerId, stepId = null) {

    // console.log('Ejecutando iniciarImpress en', containerId, 'con', stepId);
    if (typeof impress === 'function') {
        const impressInstance = impress(containerId);
        impressInstance.init();
        if (stepId) {
            impressInstance.goto(stepId);
        }
    } else {
        console.warn('La librería impress.js no está cargada.');
    }
}

function setupModalImpress() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close-modal');
        const contadorDiv = document.getElementById('divContador');
        const socialMenu = document.querySelector('.social-menu');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                
                // LIMPIAR GLOSARIO SI ES EL MODAL DEL GLOSARIO
                if (modal.id === 'impress-modal-glosa') {
                    limpiarListenersGlosario();
                }
                
                modal.classList.add('hidden');
                window.location.hash = '';

                // Limpiar instancia de impress
                if (impressInstance) {
                    impressInstance = null;
                    impressInitialized = false;
                    document.body.removeAttribute('style');
                    document.documentElement.removeAttribute('style');
                    const impressContainer = modal.querySelector('[id^="impress-"]');
                    if (impressContainer) {
                        impressContainer.removeAttribute('style');
                        impressContainer.classList.remove('impress-on');
                    }
                }

                // Restaurar círculos y dynamicState
                document.getElementById('dynamicState')?.classList.remove('hidden');
                document.getElementById('circlesContainer')?.classList.remove('hidden');
                contadorDiv.classList.remove('hidden');

                //Mostrar social-menu cuando se cierra el modal
                if (socialMenu) {
                    socialMenu.classList.remove('hidden');
                }

                // Restaurar URL y botón Saber Más al cerrar cualquier modal
                history.pushState({}, '', window.location.pathname);
                const panelButton = document.getElementById('panelButton');
                if (panelButton) panelButton.style.display = 'block';
            });
        }

        // Cerrar al hacer clic fuera del contenido del modal
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                const closeBtn = modal.querySelector('.close-modal');
                if (closeBtn) closeBtn.click();
                contadorDiv.classList.remove('hidden');

                //Mostrar social-menu al cerrar
                if (socialMenu) {
                    socialMenu.classList.remove('hidden');
                }

                // Restaurar URL y botón Saber Más al cerrar cualquier modal
                history.pushState({}, '', window.location.pathname);
                const panelButton = document.getElementById('panelButton');
                if (panelButton) panelButton.style.display = 'block';
            }
        });
    });
}

function mostrarDefinicion(el) {
    el.classList.add("activo");
}

function mostrarDefinicion1(el) {
    el.classList.add("activo1");
}

function showCustomAlert() {
    document.getElementById("customAlert").style.display = "flex";
}

function closeAlert() {

    document.getElementById("customAlert").style.display = "none";
    // Inicializa impress después de aceptar
    if (typeof impress === "function") {
        impress("impress-glos").init();
    }
}

// Detecta cuando se abre la modal del glosario
document.addEventListener("DOMContentLoaded", () => {
    const modalGlosa = document.getElementById("impress-modal-glosa");
    const closeBtn = modalGlosa.querySelector(".close-modal");
  
    // Cuando se abre la modal → muestra alerta
    const observer = new MutationObserver(() => {
      if (!modalGlosa.classList.contains("hidden")) {
        showCustomAlert();
      }
    });
    observer.observe(modalGlosa, { attributes: true, attributeFilter: ["class"] });
  
    // Cuando se cierra la modal → reinicia impress para próxima vez
    closeBtn.addEventListener("click", () => {
      if (typeof impress === "function") {
        impress("impress-glos").tear();
      }
    });
});

function showCustomAlertCarac() {
    document.getElementById("customAlertCarac").style.display = "flex";
}
  
function closeAlertCarac() {

    document.getElementById("customAlertCarac").style.display = "none";
    // Inicializa impress después de aceptar
    if (typeof impress === "function") {
        impress("impress-carac").init();
    }
}

  // Detecta cuando se abre la modal de características
  document.addEventListener("DOMContentLoaded", () => {
      
    const modalCarac = document.getElementById("impress-modal-carac");
    const closeBtnCarac = modalCarac.querySelector(".close-modal");
  
    // Cuando se abre la modal → muestra alerta
    const observerCarac = new MutationObserver(() => {
      if (!modalCarac.classList.contains("hidden")) {
        showCustomAlertCarac();
      }
    });
    observerCarac.observe(modalCarac, { attributes: true, attributeFilter: ["class"] });
  
    // Cuando se cierra la modal → reinicia impress
    closeBtnCarac.addEventListener("click", () => {
      if (typeof impress === "function") {
        impress("impress-carac").tear();
      }
    });
  });

// Agregar estilos CSS para animación random-bounce
const style = document.createElement('style');
style.textContent = `
    .circle-item.random-bounce {
        animation: randomBounce 2s ease-in-out;
    }
    
    @keyframes randomBounce {
        0%, 100% {
            transform: translateY(0) scale(1);
        }
        15% {
            transform: translateY(-8px) scale(1.05);
        }
        30% {
            transform: translateY(0) scale(1);
        }
        45% {
            transform: translateY(-5px) scale(1.03);
        }
        60% {
            transform: translateY(0) scale(1);
        }
        75% {
            transform: translateY(-3px) scale(1.02);
        }
        90% {
            transform: translateY(0) scale(1);
        }
    }
    
    .circle-item.random-bounce .circle-button {
        animation: randomPulse 2s ease-in-out;
    }
    
    @keyframes randomPulse {
        0%, 100% {
            box-shadow: 0 10px 30px rgba(224, 112, 219, 0.4);
        }
        50% {
            box-shadow: 
                0 10px 30px rgba(224, 112, 219, 0.4),
                0 0 0 8px rgba(224, 112, 219, 0.3);
        }
    }
`;
document.head.appendChild(style);

// Manejar cambios de orientación y resize
window.addEventListener('resize', () => {
    const circlesContainer = document.getElementById('circlesContainer');
    const preview = document.getElementById('circlePreview');
    
    // Ocultar preview al cambiar tamaño
    if (preview) {
        preview.classList.remove('active');
    }
    
    // Ajustar círculos si están visibles
    if (circlesContainer && circlesShowing) {
        if (isMobile()) {
            circlesContainer.style.flexDirection = 'row';
        } else {
            circlesContainer.style.flexDirection = 'column';
        }
    }
});

// Prevenir zoom en inputs en iOS
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

// Manejar cambios de orientación
let wasMobile = isMobile();

window.addEventListener('resize', () => {
    const isMobileNow = isMobile();
    const circlesContainer = document.getElementById('circlesContainer');
    
    // Si cambió de móvil a desktop o viceversa
    if (wasMobile !== isMobileNow) {
        wasMobile = isMobileNow;
        
        // Remover clase collapsed si es móvil
        if (isMobileNow && circlesContainer) {
            circlesContainer.classList.remove('collapsed');
        }
        
        // Re-configurar eventos de colapso
        configurarColapsoCerculos();
    }
});


/*****************************************************************************
 * FUNCION PARA MOSTRAR LOS POPUS CON LOS ARTICULOS O TEXTOS DE ACUERDO AL DIV
******************************************************************************/

function popUp(id) {

    if(id){

        const trigger = document.getElementById(id);

        //Marco geografico de Participacion Ciudadana
        if(id === 'step-1-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";

            popup.innerHTML += `

            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 40.</b>
                <br><br>
                Es voluntad del pueblo mexicano constituirse en una República representativa, democrática, laica y federal, compuesta por 
                Estados libres y soberanos en todo lo concerniente a su régimen interior, y por la Ciudad de México, unidos en una federación establecida según los 
                principios de esta ley fundamental (Constitución Política de los Estados Unidos Mexicanos; artículo 40; primer párrafo). 

            </p>  

            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);    

            // evento del botn de cierre
            const closeBtn = popup.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            });
            
            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });

        }
        else if(id === 'step-2-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";

            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 26
                <br><br>
                Democracia participativa</b>

                <br><br>

                A. Gestión, evaluación y control de la función pública 
                <br><br>

                1. Esta Constitución <u>reconoce la participación de las personas que habitan la Ciudad de México</u>, en sus más variadas formas, ámbitos y mecanismos que adopte la población de manera autónoma y solidaria, en los distintos planos de la democracia participativa: territorial, sectorial, temática, pueblos y barrios originarios y comunidades indígenas residentes. Las autoridades, en el ámbito de sus competencias, deberán respetar y apoyar sus formas de organización. 

                <br><br>
                2. Las autoridades de la Ciudad y las alcaldías establecerán <u>procedimientos y formas de gobierno abierto que garanticen la participación social</u> efectiva, amplia, directa, equitativa, democrática y accesible en el proceso de planeación, elaboración, aprobación, gestión, evaluación y control de planes, programas, políticas y presupuestos públicos, en los términos que establezca la ley. 
                <br><br>
                3. Los poderes públicos, los organismos autónomos y las alcaldías <u>están obligados a informar, consultar, realizar audiencias públicas deliberativas</u> y rendir cuentas ante las personas y sus comunidades sobre la administración de los recursos y la elaboración de las políticas públicas. 
                <br><br>
                4. La ley establecerá los procedimientos y formas institucionales que posibiliten el <u>diálogo entre las autoridades y la ciudadanía para el diseño presupuestal y de los planes, programas y políticas públicas, la gestión de los servicios y la ejecución de los programas sociales.</u> Entre otros, los de consulta ciudadana, colaboración ciudadana, rendición de cuentas, difusión pública, red de contralorías ciudadanas, audiencia pública, asamblea ciudadana, observatorios ciudadanos y presupuesto participativo. 
                <br><br>
                5. El Gobierno de la Ciudad, los organismos autónomos y las alcaldías tendrán, en todo momento, la <u>obligación de fortalecer la cultura ciudadana</u> mediante los programas, mecanismos y procedimientos que la ley establezca. 
                <br><br>
                B. Presupuesto participativo 
                <br><br>
                1. Las personas tienen <u>derecho a decidir</u> sobre el uso, administración y destino de los proyectos y recursos asignados al presupuesto participativo, al mejoramiento barrial y a la recuperación de espacios públicos en los ámbitos específicos de la Ciudad de México. Dichos recursos se sujetarán a los procedimientos de transparencia y rendición de cuentas. 
                <br><br>
                2. La ley <u>establecerá los porcentajes y procedimientos</u> para la determinación, organización, desarrollo, ejercicio, seguimiento y control del presupuesto participativo (Constitución Política de la Ciudad de México). 

            </p>     
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);    
            
            const closeBtn = popup.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });

        }
        else if (id === 'step-3-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();
            
            const popup = document.createElement("div");
            popup.className = "popup-box";

            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos" >

                <b>Artículo 3.</b>
                <br><br>
                La participación ciudadana es el conjunto de actividades mediante las cuales toda persona tiene el derecho individual o colectivo para intervenir en las decisiones públicas,
                deliberar, discutir y cooperar con las autoridades, así como para incidir en la formulación, ejecución y evaluación de las políticas y actos de gobierno de manera 
                efectiva, amplia, equitativa, democrática y accesible; y en el proceso de planeación, elaboración, aprobación, gestión, evaluación y control de planes, programas, políticas y 
                presupuestos públicos.” (Ley de Participación)

            </p>     
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {

                popup.remove();

            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });

        }
        else if (id === 'step-4-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";

            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 41.</b>
                <br>...<br>
                V. La organización de las elecciones es una función estatal que se realiza a través del Instituto Nacional Electoral y de los organismos públicos locales, en los términos que establece esta Constitución. 
                <br>...<br>
                Apartado C. En las entidades federativas, las elecciones locales y, en su caso, las consultas populares y los procesos de revocación de mandato, estarán a cargo de organismos públicos locales en los términos de esta Constitución, que ejercerán funciones en las siguientes materias: …
                <br><br>
                9. Organización, desarrollo, cómputo y declaración de resultados en los mecanismos de participación ciudadana que prevea la legislación local; … (Constitución Política de los Estados Unidos Mexicanos).

            </p>     
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {

                popup.remove();

            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });

        }
        else if (id === 'step-5-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";

            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 50</b>
                <br><br>
                1. La organización, desarrollo y vigilancia de los procesos electorales para las elecciones de Jefatura de Gobierno, 
                diputaciones al Congreso y alcaldías de la Ciudad de México, personas Magistradas y Juzgadoras integrantes del 
                Poder Judicial de la Ciudad de México, así como de los procesos de participación ciudadana en la Ciudad, mediante los cuales se ejerce la ciudadanía, 
                son funciones que se realizan a través del Instituto Electoral de la Ciudad de México. Asimismo, tendrá a su cargo el diseño e implementación de las estrategias, programas, materiales y demás acciones orientadas al 
                fomento de la educación cívica y la construcción de ciudadanía (Constitución Política de la Ciudad de México).

            </p>     
            `;
            

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {

                popup.remove();

            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });


        }
        else if (id === 'step-6-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";


            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 30.</b>
                <br><br>
                El Instituto Nacional y el Instituto Electoral son las autoridades electorales depositarias de la 
                función estatal de organizar las elecciones locales en la Ciudad de México; asimismo, el Tribunal Electoral es 
                el órgano jurisdiccional especializado para la solución de controversias en esta materia, 
                cuyas competencias se establecen en la Constitución Federal, las Leyes Generales, la Constitución Local, la Ley Procesal, este Código y 
                demás leyes aplicables a cada caso en concreto.

                <b>Artículo 36.</b>
                <br><br>
                A través del Instituto Electoral se realiza la organización, el desarrollo y la vigilancia de los procesos electorales para las elecciones de 
                Jefatura de Gobierno, diputaciones al Congreso, alcaldías, y de las personas juzgadoras del Poder Judicial de la Ciudad de México, 
                así como de los procesos de participación ciudadana; también tendrá a su cargo el diseño y la implementación de las estrategias, programas, materiales y 
                demás acciones orientadas al fomento de la educación cívica y la construcción de ciudadanía (Código de Instituciones y Procedimientos Electorales de la Ciudad de México).

            </p>     
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });


        }
        else if (id === 'step-7-mgpc'){

            const url = "https://scmgpc.iecm.mx/";
            const windowName = "_blank";

            // Centrar y darle tamaño a ls pantala
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const windowWidth = 400;
            const windowHeight = 300;
            const left = (screenWidth / 2) - (windowWidth / 2);
            const top = (screenHeight / 2) - (windowHeight / 2);

            const features = `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`;

            window.open(url, windowName, features);


        }
        else if (id === 'step-8-mgpc'){

            const url = "https://scmgpc.iecm.mx/#";
            const windowName = "_blank";

            // Centrar y darle tamaño a ls pantala
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const windowWidth = 400;
            const windowHeight = 300;
            const left = (screenWidth / 2) - (windowWidth / 2);
            const top = (screenHeight / 2) - (windowHeight / 2);

            const features = `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`;

            window.open(url, windowName, features);


        }
        else if (id === 'step-9-mgpc'){

            const url = "https://scmgpc.iecm.mx/documentos/CONDENSADO_UTS_PUEBLOS.pdf";
            const windowName = "_blank";

            // Centrar y darle tamaño a ls pantala
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const windowWidth = 400;
            const windowHeight = 300;
            const left = (screenWidth / 2) - (windowWidth / 2);
            const top = (screenHeight / 2) - (windowHeight / 2);

            const features = `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`;

            window.open(url, windowName, features);


        }
        else if (id === 'step-10-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";


            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 96.</b>
                <br><br>
                Las Comisiones de Participación Comunitaria serán electas cada tres años en una Jornada Electiva Única a realizarse el primer domingo de mayo, 
                misma fecha prevista para la respectiva Consulta Ciudadana sobre Presupuesto Participativo, con excepción de celebración de procesos electorales extraordinarios 
                en el que se elijan cargos de elección popular federal o local, causa fortuita o fuerza mayor, por lo que en estos supuestos el Congreso de la Ciudad de México 
                determinará la fecha de la jornada electiva. Las Comisiones de Participación Comunitaria tendrán una duración de tres años. El proceso electivo iniciará con la instalación
                del Consejo General del Instituto Electoral y la emisión de la convocatoria respectiva, en la primera quincena de enero. El Instituto Electoral fijará la fecha de toma 
                de protesta de quienes hayan sido elegidos para integrar las Comisiones de Participación Comunitaria para dar cumplimiento a lo establecido en la presente Ley.<br>

            </p><br>

            <p class="textoinfos">

                <b>Artículo 97. </b>
                <br><br>
                La coordinación y organización del proceso de elección de dichas Comisiones en cada demarcación territorial será realizada por el Instituto Electoral.
                <br>
                El Instituto Electoral a través de sus órganos internos se encargará de expedir la convocatoria, de instrumentar el proceso de registro, elaboración y entrega de material
                y documentación para la jornada electiva y de la publicación de los resultados en cada unidad territorial (Ley de Participación).

            </p>    
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });


        }
        else if (id === 'step-11-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";


            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 96.</b>
                <br><br>
                Artículo 96. Son atribuciones de la Dirección Ejecutiva de Organización Electoral y Geoestadística:
                        …

                        XI. Mantener actualizado el marco geográfico de la Ciudad de México para su utilización en los procedimientos de participación ciudadana, 
                        clasificado por Circunscripción, Demarcación territorial, Colonia y Sección Electoral;

            </p>   
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });


        }
        else if (id === 'step-12-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";


            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <br><br>
            <p class="textoinfos">

                <b>B) Causas que motivan la actualización del MGPC 2022</b>
                <br><br>
                1. <b>Mantenimiento permanente de la cartografía</b>. SSe refiere al impacto de las actualizaciones del Marco Geográfico Electoral (MGE) vigente, en las Unidades Territoriales.

                <br><br>
                2. <b>Petición de personas ciudadanas residentes, representaciones de comunidad indígena y/o afromexicana.</b> Se refiere a las peticiones de actualización que la poblacional formula ante los OD y/o las oficinas centrales.
                <br><br>
                3. <b>Propuesta de los Órganos de Representación Ciudadana</b>. Se refiere a las peticiones de actualización planteadas por parte de las personas integrantes de las COPACO en activo, que se hayan remitido a los OD o directamente en oficinas centrales. 
                <br><br>
                4. <b>Propuesta de los Órganos Desconcentrados del Instituto Electoral de la Ciudad de México (IECM)</b>. Se refiere a aquellos casos que el personal de los OD ha previsto la pertinencia de modificar la delimitación de las UT, derivado de los recorridos de campo y de la observación de la participación ciudadana. 
                <br><br>
                5. <b>Requerimientos de Instancias Jurisdiccionales</b>. Se refiere a la actualización de las UT que deriven del mandato de alguna resolución o sentencia, la cual se debe atender conforme a los términos que se indiquen. 
                <br><br>
                6. <b>Generadas por dependencias de la administración pública de la Ciudad de México</b>. Se refiere a las actualizaciones cartográficas que se deriven del ejercicio de la función administrativa que emita la SEPI o SEDUVI. 
                <br><br>
                <i>(Véase Documento Rector para la obtención del Marco Geográfico de Participación Ciudadana 2025, que aprobó el Consejo General del Instituto electoral, el 30 de abril de 2025, a través del Acuerdo IECM-ACU-CG-059-25).</i>
                
            </p>    
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });


        }
        else if (id === 'step-13-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";


            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>B) Causas que motivan la actualización del MGPC 2022</b>
                <br><br>
                1. Mantenimiento permanente de la cartografía. SSe refiere al impacto de las actualizaciones del Marco Geográfico Electoral (MGE) vigente, en las Unidades Territoriales.
                <br><br>
                2. <b>Petición de personas ciudadanas residentes, representaciones de comunidad indígena y/o afromexicana. Se refiere a las peticiones de actualización que la poblacional formula ante los OD y/o las oficinas centrales.</b>
                <br><br>
                3. <b>Propuesta de los Órganos de Representación Ciudadana. Se refiere a las peticiones de actualización planteadas por parte de las personas integrantes de las COPACO en activo, que se hayan remitido a los OD o directamente en oficinas centrales.</b> 
                <br><br>
                4. <b>Propuesta de los Órganos Desconcentrados del Instituto Electoral de la Ciudad de México (IECM). Se refiere a aquellos casos que el personal de los OD ha previsto la pertinencia de modificar la delimitación de las UT, derivado de los recorridos de campo y de la observación de la participación ciudadana.</b> 
                <br><br>
                5. Requerimientos de Instancias Jurisdiccionales. Se refiere a la actualización de las UT que deriven del mandato de alguna resolución o sentencia, la cual se debe atender conforme a los términos que se indiquen. 
                <br><br>
                6. Generadas por dependencias de la administración pública de la Ciudad de México. Se refiere a las actualizaciones cartográficas que se deriven del ejercicio de la función administrativa que emita la SEPI o SEDUVI. 
                <br><br>
                <i>(Véase Documento Rector para la obtención del Marco Geográfico de Participación Ciudadana 2025, que aprobó el Consejo General del Instituto electoral, el 30 de abril de 2025, a través del Acuerdo IECM-ACU-CG-059-25).</i>
                
            </p>      
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });


        }
        else if (id === 'step-14-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";


            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <br><br>
            <p class="textoinfos">

                Aviso por el que se da a conocer la procedencia de la inscripción de 50 pueblos originarios en el Sistema de Registro y Documentación de Pueblos y Barrios Originarios y Comunidades Indígenas Residentes de la Ciudad De México. 
                Recuperado de: 
                <a href="https://sepi.cdmx.gob.mx/storage/app/uploads/public/645/e68/80e/645e6880e50dc333102537.pdf" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               onclick="window.open('https://sepi.cdmx.gob.mx/storage/app/uploads/public/645/e68/80e/645e6880e50dc333102537.pdf', this.target, 'width=600,height=700,scrollbars=NO, location=NO, status=NO, menubar=NO','PDFS');return false;" 
                               style="color:#32215C; text-align: justify; text-decoration: none; font-size: 12px;">
                               <b>https://sepi.cdmx.gob.mx/storage/app/
                               uploads/public/645/e68/80e/645e6880e5
                               0dc333102537.pdf</b>
                </a>

            </p><br>

            <p class="textoinfos">

               Aviso por el que se da a conocer la procedencia de la inscripción de 5 pueblos originarios y 3 comunidades indígenas residentes en el Sistema de Registro y Documentación de Pueblos y Barrios Originarios y Comunidades Indígenas Residentes de la Ciudad de México (2024). 
               Recuperado de: 
               <a href="https://sepi.cdmx.gob.mx/storage/app/uploads/public/66b/213/1f8/66b2131f87c42919052048.pdf" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               onclick="window.open('https://sepi.cdmx.gob.mx/storage/app/uploads/public/66b/213/1f8/66b2131f87c42919052048.pdf', this.target, 'width=600,height=700,scrollbars=NO, location=NO, status=NO, menubar=NO','PDFS');return false;" 
                               style="color:#32215C; text-align: justify; text-decoration: none; font-size: 12px;">
                               <b>https://sepi.cdmx.gob.mx/storage/app/
                               uploads/public/66b/213/1f8/66b2131f87
                               c42919052048.pdf</b>
                </a>

            </p><br>

            <p class="textoinfos">

                Aviso por el que se da a conocer la procedencia de la inscripción de 1 pueblo originario en el Sistema de Registro y Documentación de Pueblos y Barrios Originarios y Comunidades Indígenas Residentes de la Ciudad de México. 
                Recuperado de: 
                <a href="https://data.consejeria.cdmx.gob.mx/portal_old/uploads/gacetas/aa9cac9ad13b209125f260cf1612f42a.pdf" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               onclick="window.open('https://data.consejeria.cdmx.gob.mx/portal_old/uploads/gacetas/aa9cac9ad13b209125f260cf1612f42a.pdf', this.target, 'width=600,height=700,scrollbars=NO, location=NO, status=NO, menubar=NO','PDFS');return false;" 
                               style="color:#32215C; text-align: justify; text-decoration: none; font-size: 12px;">
                               <b>https://data.consejeria.cdmx.gob.mx/
                               portal_old/uploads/gacetas/aa9cac9ad1
                               3b209125f260cf1612f42a.pdf</b>
                </a>

            </p>  
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);

            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })

            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });


        }
        else if (id === 'step-15-mgpc'){

            const url = "https://scmgpc.iecm.mx";
            const windowName = "_blank";

            // Centrar y darle tamaño a ls pantala
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            const windowWidth = 400;
            const windowHeight = 300;
            const left = (screenWidth / 2) - (windowWidth / 2);
            const top = (screenHeight / 2) - (windowHeight / 2);

            const features = `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`;

            window.open(url, windowName, features);


        }
        else if(id === 'step-16-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";

            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 116.</b>
                <br><br>
                El presupuesto participativo es el instrumento, mediante el cual la ciudadanía ejerce el derecho a decidir sobre la aplicación del recurso que otorga el 
                Gobierno de la Ciudad, para que sus habitantes optimicen su entorno, proponiendo proyectos de obras y servicios, equipamiento e infraestructura urbana, y, en general
                , cualquier mejora para sus unidades territoriales (primer párrafo).

            </p>     
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);   
            
            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })
            
            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });

        }
        else if(id === 'step-17-mgpc'){

            //Destruimos el pop-up si es que existe previamente
            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement("div");
            popup.className = "popup-box";

            popup.innerHTML += `
            <button class="popup-close-btn">&times;</button>
            <p class="textoinfos">

                <b>Artículo 117.</b>
                <br><br>
               El presupuesto participativo deberá estar orientado esencialmente al fortalecimiento del desarrollo comunitario, la convivencia y la acción comunitaria, que contribuya a
               la reconstrucción del tejido social y la solidaridad entre las personas vecinas y habitantes (primer párrafo).

            </p>     
            `;

            const rect = trigger.getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + 5 + window.scrollX}px`;

            document.body.appendChild(popup);   
            
            const closeBtn = document.querySelector(".popup-close-btn");
            closeBtn.addEventListener("click", () => {
                popup.remove();
            })
                        
            // Cancelar ocultar si el mouse entra al popup
            popup.addEventListener("mouseover", () => {

                //Cancelamod el esconder el texto
                clearTimeout(mostrarQuitarTexto);
            });

            // Ocultar cuando salga del popup
            popup.addEventListener("mouseout", () => {
                mostrarQuitarTexto = setTimeout(() => popup.remove(), 300);
            });

        }

    }
    else{

        // Cuando el mouse sale del teigger
        clearTimeout(mostrarQuitarTexto);
        mostrarQuitarTexto = setTimeout(() => {

            const existingPopup = document.querySelector(".popup-box");
            if (existingPopup) existingPopup.remove();

        }, 100);


    }
}



/*****************************************************************************
 * FUNCION PARA MOSTRAR LOS CREDITOS CON LOS EFECTOS DEL SPINNER
******************************************************************************/
document.getElementById("btn-credits").addEventListener("click", (e) => {

    e.preventDefault();
    const overlay = document.getElementById("overlay");
    const spinner = document.getElementById("spinner");
    const credits = document.getElementById("credits-content");
  
    overlay.classList.remove("hidden");
    spinner.classList.remove("hidden");
    credits.classList.add("hidden");
  
    setTimeout(() => {
      spinner.classList.add("hidden");
      credits.classList.remove("hidden");
    }, 1000);

});
  
function closeOverlay() {
    document.getElementById("overlay").classList.add("hidden");
}

/*****************************************************************************
 * FUNCION PARA ACTUALIZAR EL CONTADOR
******************************************************************************/
function iniciarContadorAcumulativo(numero) {

    // Acceder al span
    const contadorElemento = document.getElementById("contador");

    // Guardar en variables
    let contadorValor = parseInt(contadorElemento.innerText);
    const contadorTarget = parseInt(contadorElemento.getAttribute("data-target"));

    contadorValor++;
    contadorElemento.innerText = contadorValor;

    // Ejemplo: guardar en localStorage para que no se pierda
    localStorage.setItem("contadorVisitas", contadorValor);
        
    // Cargar desde localStorage si existe
    window.addEventListener("DOMContentLoaded", () => {
        const guardado = localStorage.getItem("contadorVisitas");
        if (guardado) {
            contadorValor = parseInt(guardado);
            contadorElemento.innerText = contadorValor;
        }
    });
    
}

/*************************************************************************************
 * FUNCIONES PARA MSOTRAR Y O QUITAR LA VISTA DE DESCARGAS
***************************************************************************************/

function descarga() {
    
    async function descargarExcelConFormato(workbookData) {
        
        const workbook = new ExcelJS.Workbook();

        // Recorrer todas las hojas a crear
        workbookData.hojas.forEach(hoja => {
            
            if (hoja.datos.length === 0) return; // Saltar si no hay datos

            const worksheet = workbook.addWorksheet(hoja.nombreHoja.substring(0, 30));
            
            // Obtener encabezados del primer objeto
            const headers = Object.keys(hoja.datos[0]);
            
            // ===== CONFIGURAR COLUMNAS CON ANCHO FIJO =====
            // Ancho fijo equivalente a ~2 celdas combinadas (aproximadamente 30-35 caracteres)
            worksheet.columns = headers.map(header => ({
                header: header,
                key: header,
                width: 35 // Ancho fijo para todas las columnas
            }));

            // ===== ESTILO DEL ENCABEZADO =====
            const headerRow = worksheet.getRow(1);
            headerRow.font = { 
                bold: true, 
                size: 12,
                color: { argb: 'FFFFFFFF' } // Blanco
            };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7030A0' } // Morado oscuro
            };
            headerRow.alignment = { 
                vertical: 'middle', 
                horizontal: 'center', // Centrado horizontal
                wrapText: true // Ajuste de línea automático
            };
            headerRow.height = 40; // Altura aumentada para permitir múltiples líneas

            // Bordes para el encabezado
            headerRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });

            // ===== AGREGAR DATOS =====
            hoja.datos.forEach(item => {
                const row = worksheet.addRow(item);
                
                // Estilo para las filas de datos
                row.font = { size: 11 };
                row.alignment = { 
                    vertical: 'middle', 
                    horizontal: 'center', // TODO CENTRADO
                    wrapText: true // AJUSTE DE LÍNEA AUTOMÁTICO
                };
                
                // Altura automática para permitir el contenido ajustado
                // row.height = 'auto'; // No funciona en ExcelJS, pero wrapText lo maneja
                
                // Bordes para cada celda de datos
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
                    };
                    
                    //Asegurar que cada celda tenga wrapText y centrado
                    cell.alignment = { 
                        vertical: 'middle', 
                        horizontal: 'center',
                        wrapText: true
                    };
                });
            });

            // Alternar color de filas (opcional)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1 && rowNumber % 2 === 0) { // Filas pares (excepto encabezado)
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' } // Gris claro
                    };
                }
            });
        });

        // ===== DESCARGAR ARCHIVO =====
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workbookData.nombreArchivo}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    //Funcion que muestra las demarcacuones
    function mostrarDemarcaciones(overlay) {

        // //Variable que almacena las opciones seleccionadas previamente
        // const prevSeleccionadas = JSON.parse(sessionStorage.getItem('Descargar demarcaciones') || "[]");

        //Arreglo de demarcaciones
        const demarcaciones = [

            "Álvaro Obregón",
            "Azcapotzalco",
            "Benito Juárez",
            "Coyoacán",
            "Cuajimalpa de Morelos",
            "Cuauhtémoc",
            "Gustavo A. Madero",
            "Iztacalco",
            "Iztapalapa",
            "Magdalena Contreras",
            "Miguel Hidalgo",
            "Milpa Alta",
            "Tláhuac",
            "Tlalpan",
            "Venustiano Carranza",
            "Xochimilco"

        ];

        //Iteramos sobre el arreglo y creamos las opciones
        //<input type="checkbox" value="${d}" ${prevSeleccionadas.includes(d) ? "checked" : ""}> DEMARCACIONES YA SELECCIONADAS PREVIAMENTE
        const checkboxesHTML = demarcaciones.map(d =>
            `<label class="checkbox-item">

                <input type="checkbox" value="${d}">
                <span>${d}</span>

            </label>`
        ).join("");

        overlay.querySelector("#descargas-demarcacion").innerHTML = `

            <h2>Selecciona las demarcaciones</h2>
            <div class="checkbox-grid">
                ${checkboxesHTML}
            </div>
            <button id="btnSeleccionar" class="btn-descargar">Siguiente</button>
            <button id="btnCerrar" class="btn-cerrar">Cerrar</button>

        `;

        overlay.querySelector("#btnCerrar").addEventListener("click", () => overlay.remove());

        overlay.querySelector("#btnSeleccionar").addEventListener("click", () => {

            //Insertamos en un arreglo las opciones seleccionadas
            const seleccionadas = Array.from(
                overlay.querySelectorAll("input[type=checkbox]:checked")
            ).map(cb => cb.value); //cb => cb.value transformar un arreglo de checkboxes en un arreglo de valores seleccionados ES6

            if (seleccionadas.length > 0) {

                //pasamos al sessionStorage
                sessionStorage.setItem('Descargar demarcaciones', JSON.stringify(seleccionadas));

                //llamamos a la funcion para mostrar las categorias mandanmos el overlay para no crearlo de nuevo
                mostrarCategorias(overlay);

            } else {

                //Swal.fire("Atención", "Debes seleccionar al menos una demarcación.", "warning");

            }

        });
    }

    //Funcion para descargar todos los datos de todas las demarcaciones
    async function descargarDatosDemarcaciones(){

        // traemos los datos de la api
        const indices = await fetchFromApi('properties/indices_mgpc', { limit: 1851, offset: 0 });
        const datos = indices.data;

        //Arreglo que almacenara las filas reconstruidas tipo objetos
        const registros = [];
        
        //Verifivcamoe si trae datos
        if(datos.length > 0){

            //Objeto sobre el cual vamos a comparar para extrare unicamente los datos con los que estamos trabajando
            const titulos = {

                //Demarcacion, UTS y Secciones
                'dem_territ': 'Demarcación Territorial',
                'dtto_loc_d': 'Distrito Local',
                'cve_demarc': 'Clave Demarcación',
                'clave_ut': 'Clave de la Unidad Territorial',
                'nombre': 'Nombre de la Unidad Territorial',
                'secciones': 'Secciones Completas',
                'secciones1': 'Secciones Parciales',

                //Distribuion Territorial
                'ind_sup1' : 'Superficie de la Unidad Territorial respecto a la Demarcación',
                'ind_sup2' : 'Densidad de Población (HAB/M2)',


                //Composición Poblacional
                //'ind_pob1' : 'Porcentaje de Población de la Unidad Territorial respecto a la Demarcacion',
                'pobtot': 'Población Total',
                'ind_pob2' : 'Relación Hombres-Mujeres',
                'ind_pob3' : 'Porcentaje de Mujeres',
                'ind_pob4' : 'Porcentaje de Hombres',
                'ind_pob5' : 'Población de 18 años y más',
                'ind_pob6' : 'Relación de Dependencia',
                'ind_pob7' : 'Indice de Envejecimiento',
                'ind_pob9' : 'Población de 0 17 años',
                // 'pobfem': 'Población Femenina',
                // 'pobmas': 'Población Masculina',
                // 'p_3ymas': 'Población 3+ años',
                // 'p_5ymas': 'Población 5+ años',
                // 'p_12ymas': 'Población 12+ años',
                // 'p_18ymas': 'Población 18+ años ',
                // 'pob0_14': 'Población 0 - 14 años', 
                // 'pob15_64': 'Población 0 - 15 años',
                // 'pob65_mas': 'Población 65 + más ',
        
                //Caracteristicas economicas
                'ind_ec1' : 'Población económicamente activa (PEA)',
                'ind_ec3' : 'Población Económicamente Activa Ocupada',
                'ind_ec2' : 'Población de 12 años y más No Económicamente Activa',
                'ind_ec4' : 'Población Económicamente Activa Desocupada',
                // 'pea': 'Población 12+ Económicamente Activa',
                // 'pe_inac': 'Población 12+ Económicamente Inactiva',
                // 'pocupada': 'Población 12+ Ocupada',
                // 'pdesocup': 'Población 12+ Desocupada',
        
                //Caracteristicas educativas
                'ind_edu1' : 'Porcentaje de Población con Rezago Educativo',
                'ind_edu2' : 'Porcentaje de población con educación posbásica',                
                // 'p15ym_se': 'Población 15+ Sin Escolaridad',
                // 'p15pri_in': 'Población 15+ Primaria Incompleta',
                // 'p18ym_pb': 'Población 18+ Educación Posbásica',
        
                //Hogares censales
                'ind_hog1' : 'Relación Mujer/Hombre Jefatura De Hogar',
                'ind_hog2' : 'Hogares con jefatura de hogar mujer',
                // 'tothog': 'Total de Hogares Censales',
                // 'hogjef_f': 'Hogares con Referencia Mujer',
                // 'hogjef_m': 'Hogares con Referencia Hombre',
                
                //Servicios de salud
                'ind_sal1' : 'Porcentaje de Población sin Afiliación a Servicios de Salud',
                'ind_sal2' : 'Porcentaje de Población Afiliada a Servicios de Salud',
                // 'psinder': 'Población sin Afiliación a Servicios de Salud',
                // 'pder_ss': 'Población afiliada a Servicios de Salud',
        
                //Situación Conyugal
                'ind_sitc1' : 'Porcentaje de Población Soltera',
                'ind_pob8' : 'Personas Casadas o Unidas',
                // 'p12ym_solt': 'Población 12+ Soltera o nunca unida',
                // 'p12ym_casa': 'Población 12+ Casada o unida',
        
                //Etnicidad
                'ind_etn1' : 'Población de 3 años y más que habla alguna lengua indígena',
                'ind_etn2' : 'Población que se considera afromexicana o afrodescendiente',
                // 'p3ym_hli': 'Población de 3 años y más que habla alguna lengua indígena',
                // 'pob_afro': 'Población que se considera afromexicana o afrodescendiente',
                // 'pob_afro_m': 'Población masculina que se considera afromexicana o afrodescendiente',
        
                //Migracion
                'ind_mig1' : 'Población no Nativa',
                'ind_mig2' : 'Población Migrante Estatal',
                // 'pnacoe': 'Pobación nacida en otra entidad',
                // 'presoe15': 'Población 5+ que reside en otra entidad',
                // 'presoe15_m': 'Población masculina 5+ que reside en otra entidad',

                //Discapacidad
                'ind_dis1' : 'Población con discapacidad',
                'ind_dis2' : 'Población con discapacidad para caminar, subir o bajar',
                'ind_dis3' : 'Población con discapacidad para ver, aun usando lentes',
                'ind_dis4' : 'Población con discapacidad para hablar o comunicarse',
                'ind_dis5' : 'Población con discapacidad para oír, aun usando aparato auditivo',
                'ind_dis6' : 'Población con discapacidad para vestirse, bañarse o comer',
                'ind_dis7' : 'Población con discapacidad para recordar o concentrarse',
                // 'ind_dis8' : 'Porcentaje de Población con limitación',
                // 'ind_dis9' : 'Porcentaje de Población con limitación para caminar, subir o bajar',
                // 'ind_dis10' : 'Porcentaje de Población con limitación para ver, aun usando lentes',
                // 'ind_dis11' : 'Porcentaje de Población con limitación para ver, aun usando lentes',
                // 'ind_dis12' : 'Porcentaje de Población con limitación para oír, aun usando aparato auditivo',
                // 'ind_dis13' : 'Porcentaje de Población con limitación para vestirse, bañarse o comer',
                // 'ind_dis14' : 'Porcentaje de Población con limitación para recordar o concentrarse',
                'ind_dis15' : 'Población con algún problema o condición mental',
                // 'ind_dis16' : 'Porcentaje de Población sin discapacidad, limitación, problema o condición mental',
                // 'pcon_disc': 'Población con discapacidad',
                // 'pcdisc_mot': 'Población con discapacidad para caminar, subir o bajar',
                // 'pcdisc_vis': 'Población con discapacidad para ver, aun usando lentes',
                // 'pcdisc_len': 'Población con discapacidad para hablar o comunicarse',
                // 'pcdisc_aud': 'Población con discapacidad para oír, aun usando aparato auditivo',
                // 'pcdisc_m_1': 'Población con discapacidad para vestirse, bañarse o comer',
                // 'pcdisc_men': 'Población con discapacidad para recordar o concentrarse',
                // 'pcon_limi': 'Población con limitación',
                // 'pclim_csb': 'Población con limitación para caminar, subir o bajar',
                // 'pclim_vis': 'Población con limitación para ver, aun usando lentes',
                // 'pclim_haco': 'Población con limitación para hablar o comunicarse',
                // 'pclim_oaud': 'Población con limitación para oír, aun usando aparato auditivo',
                // 'pclim_mot2': 'Población con limitación para vestirse, bañarse o comer',
                // 'pclim_re_c': 'Población con limitación para recordar o concentrarse',
                // 'pclim_pmen': 'Población con algún problema o condición mental',
                // 'psind_lim': 'Población sin discapacidad, limitación, problema o condición mental',

                //Vivienda
                'ind_viv1' : 'Promedio De Ocupantes Por Vivienda',
                'ind_viv2' : 'Porcentaje de Viviendas con Piso de Tierra',
                'ind_viv3' : 'Índice Disponibilidad de Servicios y Equipamiento',
                'ind_viv4' : 'Índice Disponibilidad de Bienes',
                'ind_viv5' : 'Índice Disponibilidad de Tecnologías de la Información y la Comunicación (TIC)',
                // 'tvivparhab': 'Total de viviendas particulares habitadas',
                // 'ocupvivpar': 'Ocupantes en viviendas particulares habitadas',
                // 'vph_pisoti': 'Viviendas particulares habitadas con piso de tierra',
                // 'vph_c_elec': 'Viviendas particulares habitadas que disponen de energía eléctrica',
                // 'vph_aguadv': 'Viviendas particulares habitadas que disponen de agua entubada en el ámbito de la vivienda',
                // 'vph_tinaco': 'Viviendas particulares habitadas que disponen de tinaco',
                // 'vph_cister': 'Viviendas particulares habitadas que disponen de cisterna o aljibe',
                // 'vph_excsa': 'Viviendas particulares habitadas que disponen de excusado o sanitario',
                // 'vph_drenaj': 'Viviendas particulares habitadas que disponen de drenaje',
                // 'vph_refri': 'Viviendas particulares habitadas que disponen de refrigerador',
                // 'vph_lavad': 'Viviendas particulares habitadas que disponen de lavadora',
                // 'vph_autom': 'Viviendas particulares habitadas que disponen de automóvil o camioneta',
                // 'vph_moto': 'Viviendas particulares habitadas que disponen de motocicleta o motoneta',
                // 'vph_bici': 'Viviendas particulares habitadas que disponen de bicicleta como medio de transporte',
                // 'vph_pc': 'Viviendas particulares habitadas que disponen de computadora, laptop o tablet',
                // 'vph_telef': 'Viviendas particulares habitadas que disponen de línea telefónica fija',
                // 'vph_cel': 'Viviendas particulares habitadas que disponen de teléfono celular',
                // 'vph_inter': 'Viviendas particulares habitadas que disponen de Internet',
                // 'vph_stvp': 'Viviendas particulares habitadas que disponen de servicio de televisión de paga'

                
            };
            
            //Obtenemos las columnas del primer elemento
            const columnas = Object.keys(datos[0]);

            //Filtrar columnas que están en titulos
            // const columnasFiltradas = columnas.filter(col => titulos.hasOwnProperty(col));
            const columnasFiltradas = columnas
                .filter(col => titulos.hasOwnProperty(col))
                .map(col => ({ clave: col, titulo: titulos[col] }));

            // console.log(columnasFiltradas);
            //Obtenemos los valores de las filas
            const filas = {};

            //Obtenemos las filas del primer elemento con las columnas filtradas
            columnasFiltradas.forEach(col => {

                filas[col.titulo] = datos.map(dato => dato[col.clave]);

            });
            
            //Total de filas 
            const totalFilas = datos.length;

            //Recorremos cada fila 
            for (let i = 0; i < totalFilas; i++) {

                //Objeto vacio que representa a cada fila 
                const fila = {};

                //Recorremos el arreglo columnas que contiene los nombres de todas las columnas
                columnasFiltradas.forEach(col => {

                    //fila[col] es el arreglo con los valores de cada columna
                    fila[col.titulo] = filas[col.titulo][i];

                });

                registros.push(fila);
            }

            //Condicion para saber si sereconstruyeron los datos correctamente 
            // if(registros){

            //     // Crear libro de Excel
            //     const libroExcel = XLSX.utils.book_new();

            //     // Convertir el arreglo de objetos a hoja
            //     const hojaExcel = XLSX.utils.json_to_sheet(registros);

            //     // Agregar hoja al libro
            //     XLSX.utils.book_append_sheet(libroExcel, hojaExcel, "Datos");

            //     // Descargar archivo
            //     XLSX.writeFile(libroExcel, "Datos_Completos.xlsx");

            //     Swal.fire("Datos descargados");

            // }
            if(registros.length > 0){

                // Usamos la funcion descargarExcelConFormato
                await descargarExcelConFormato({
                    nombreArchivo: 'Datos_Completos',
                    hojas: [
                        {
                            nombreHoja: 'Datos',
                            datos: registros
                        }
                    ]
                });

                Swal.fire("Datos descargados", "", "success");

            }
            else{                
                Swal.fire("Error", "No se pudo reconstruir la información.", "error");
            }

        }

    }

    //Funcion para mostrar las categorias en el overlay
    async function mostrarCategorias(overlay) {

        // traemos los datos de la api
        const indices = await fetchFromApi('properties/indices_mgpc', { limit: 1851, offset: 0 });
        const datos = indices.data;

        const categorias = [

            "Distribución Territorial",
            "Composición Poblacional",
            "Vivienda",
            "Discapacidad",
            "Etnicidad",
            "Migración",
            "Características Económicas",
            "Características Educativas",
            "Hogares Censales",
            "Afiliación a Servicios de Salud",
            "Situación Conyugal"

        ];

        const categoriasHTML = categorias.map(c =>

            `<label class="checkbox-item">
                <input type="checkbox" value="${c}">
                <span>${c}</span>
            </label>`

        ).join("");

        overlay.querySelector("#descargas-demarcacion").innerHTML = `
            <h2>Selecciona las categorías</h2>
            <div class="checkbox-grid">
                ${categoriasHTML}
            </div>
            <button id="btnDescargar" class="btn-descargar">Descargar</button>
            <button id="btnAtras" class="btn-cerrar">Atrás</button>
        `;

        // regresar al menu demarcaciones
        overlay.querySelector("#btnAtras").addEventListener("click", () => mostrarDemarcaciones(overlay));

        // boton descargar
        overlay.querySelector("#btnDescargar").addEventListener("click", async () => {

            //Arreglo de las categorias seleccionadas
            const categoriasSeleccionadas = Array.from(
                overlay.querySelectorAll("input[type=checkbox]:checked")
            ).map(cb => cb.value);

            if (categoriasSeleccionadas.length > 0) {

                try {

                    //guardamos las categorias seleccionadas
                    sessionStorage.setItem('Descargar categorias', JSON.stringify(categoriasSeleccionadas));

                    //obtenemos las demarcaciones seleccionadas
                    const seleccionadas = JSON.parse(sessionStorage.getItem('Descargar demarcaciones') || "[]");

                    //funcion para quitar acentos y vovler mayusculas
                    function normalizarTexto(texto) {
                        return texto
                            .normalize("NFD")//separa las letras de los acentos
                            .replace(/[\u0300-\u036f]/g, "")//eliminar acentos
                            .toUpperCase();//convierte todo a mayusculas
                    }

                    //filtramos los datos respecto a las demarcaciones seleccionadas
                    const indicesFiltrados = datos.filter(item =>

                        //Pasamos ambos valores a a mayusculas y no devuelva vacio el arreglo
                        seleccionadas.some(sel => normalizarTexto(sel) === normalizarTexto(item.dem_territ))
                        // seleccionadas.some(sel => sel.toUpperCase() === item.dem_territ.toUpperCase())

                    );
                    
                    // Generamos el arreglo cpon las demarcaciones selecionadas
                    const demarcaciones = indicesFiltrados.map(el => el.dem_territ);

                    // Eliminamos duplicados
                    const demar_unic = [...new Set(demarcaciones)];

                    //Generar un objeto de arreglos por demarcacion
                    const datosPordemar = indicesFiltrados.reduce((acumulador, item) => {

                        //Nomre de la demarcacion del registroa ctual
                        const dem = item.dem_territ;

                        //Condicion para verificar si existe una propiedad con el nobre de la demarcacion dentro del objeto acumulador
                        if (!acumulador[dem]) acumulador[dem] = [];
                        acumulador[dem].push(item);
                        return acumulador;
                        
                    }, {}) //{} es el valor inicial del objeto, un objeto vacio

                    // DEJAMOS DE USAR LA LIBRERIA XLSX
                    // //Generamos un archivo or cada categoria seleccionada
                    // categoriasSeleccionadas.forEach(categoria => {

                    //     //Creamos un nuevo libro de excel una sola vez
                    //     const libroExcel = XLSX.utils.book_new();

                    // ===== GENERAR UN ARCHIVO POR CATEGORÍA USANDO LA NUEVA FUNCION GENERADORA DE ESTILOS DE EXCEL=====
                    for (const categoria of categoriasSeleccionadas) {

                        const hojasParaWorkbook = [];

                        Object.entries(datosPordemar).forEach(([dem, registros]) => {

                            let datosHoja = [];

                            if (categoria === "Distribución Territorial") {

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,
                                    "Superficie de la Unidad Territorial respecto a la Demarcación": item.ind_sup1,
                                    // "Espacio por habitante (m²/hab)": item.ind_sup3
                                    

                                }));
                            } 

                            else if (categoria === "Composición Poblacional") {

                                datosHoja = registros.map(item => ({
                                    
                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,
                                    //"Porcentaje de Población de la Unidad Territorial respecto a la Demarcacion" : item.ind_pob1,
                                    "Población Total": item.pobtot,
                                    "Densidad de Población (HAB/HECT)": item.ind_sup2,
                                    "Relación Hombres-Mujeres" : item.ind_pob2,
                                    "Porcentaje de Mujeres" : item.ind_pob3,
                                    "Porcentaje de Hombres" : item.ind_pob4,
                                    "Población de 0 a 17 años" : item.ind_pob9,
                                    "Población de 18 años y más" : item.ind_pob5,
                                    "Relación de Dependencia" : item.ind_pob6,
                                    "Indice de Envejecimiento" : item.ind_pob7,
                                    // "Población Femenina": item.pobfem,
                                    // "Población Masculina": item.pobmas,
                                    // "Población 3+ años": item.p_3ymas,
                                    // "Población 5+ años": item.p_5ymas,
                                    // "Población 12+ años": item.p_12ymas,
                                    // "Población 18+ años": item.p_18ymas,
                                    // "Población 0 - 14 años": item.pob0_14,
                                    // "Población 0 - 15 años": item.pob15_64,
                                    // "Población 65 + más": item.pob65_mas

                                }));

                            }

                            else if( categoria === "Vivienda"){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,                                    
                                    "Promedio De Ocupantes Por Vivienda" : item.ind_viv1,                                    
                                    "Porcentaje de Viviendas con Piso de Tierra" : item.ind_viv2,                                    
                                    "Índice Disponibilidad de Servicios y Equipamiento" : item.ind_viv3,                                    
                                    "Índice Disponibilidad de Bienes" : item.ind_viv4,                                    
                                    "Índice Disponibilidad de Tecnologías de la Información y la Comunicación (TIC)" : item.ind_viv5,                       

                                }))

                            }

                            else if (categoria === 'Discapacidad'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,
                                    "Población con discapacidad": item.ind_dis1,
                                    "Población con discapacidad para caminar, subir o bajar": item.ind_dis2,
                                    "Población con discapacidad para ver, aun usando lentes": item.ind_dis3,
                                    "Población con discapacidad para hablar o comunicarse": item.ind_dis4,
                                    "Población con discapacidad para oír, aun usando aparato auditivo": item.ind_dis5,
                                    "Población con discapacidad para vestirse, bañarse o comer": item.ind_dis6,
                                    "Población con discapacidad para recordar o concentrarse": item.ind_dis7,
                                    // "Porcentaje de Población con limitación": item.ind_dis8,
                                    // "Porcentaje de Población con limitación para caminar, subir o bajar": item.ind_dis9,
                                    // "Porcentaje de Población con limitación para ver, aún usando lentes": item.ind_dis10,
                                    // "Porcentaje de Población con limitación para hablar o comunicarse": item.ind_dis11,
                                    // "Porcentaje de Población con limitación para oír, aun usando aparato auditivo": item.ind_dis12,
                                    // "Porcentaje de Población con limitación para vestirse, bañarse o comer": item.ind_dis13,
                                    // "Porcentaje de Población con limitación para recordar o concentrarse":item.ind_dis14,
                                    "Población con algún problema o condición mental":item.ind_dis15,
                                    // "Población sin discapacidad, limitación, problema o condición mental": item.ind_dis16

                                }));

                            }

                            else if(categoria === 'Etnicidad'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,
                                    "Población de 3 años y más que habla alguna lengua indígena": item.ind_etn1,
                                    "Población que se considera afromexicana o afrodescendiente": item.ind_etn2

                                }));

                            }
                            
                            else if(categoria === 'Migración'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,                                    
                                    "Población no Nativa" : item.ind_mig1,                                    
                                    "Población Migrante Estatal" : item.ind_mig2,
                                    // "Población nacida en otra entidad": item.pnacoe,
                                    // "Población 5+ que reside en otra entidad": item.presoe15,
                                    // "Población masculina 5+ que reside en otra entidad":item.presoe15_m

                                }));

                            }

                            else if(categoria === 'Características Económicas'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,
                                    
                                    "Población económicamente activa (PEA)" : item.ind_ec1,                                    
                                    "Población Económicamente Activa Ocupada" : item.ind_ec3,                                    
                                    "Población de 12 años y más No Económicamente Activa" : item.ind_ec2,                                    
                                    "Población Económicamente Activa Desocupada" : item.ind_ec4,
                                    // "Población 12+ Económicamente Activa": item.pea,
                                    // "Población 12+ Económicamente Inactiva": item.pe_inac,
                                    // "Población 12+ Ocupada":item.pocupada,
                                    // "Población 12+ Desocupada":item.pdesocup

                                }));

                            }

                            else if(categoria === 'Características Educativas'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,                                    
                                    "Porcentaje de Población con Rezago Educativo" : item.ind_edu1,                                    
                                    "Porcentaje de población con educación posbásica" : item.ind_edu2,
                                    // "Población 15+ Sin Escolaridad": item.p15ym_se,
                                    // "Población 15+ Primaria Incompleta": item.p15pri_in,
                                    // "Población 18+ Educación Posbásica":item.p18ym_pb

                                }));

                            }

                            else if(categoria === 'Hogares Censales'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,                                    
                                    "Relación Mujer/Hombre Jefatura De Hogar" : item.ind_hog1,                                    
                                    "Hogares con jefatura de hogar mujer" : item.ind_hog2,
                                    // "Total de Hogares Censales": item.tothog,
                                    // "Hogares con Referencia Mujer": item.hogjef_f,
                                    // "Hogares con Referencia Hombre":item.hogjef_m

                                }));

                            }

                            else if(categoria === 'Afiliación a Servicios de Salud'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,                                    
                                    "Porcentaje de Población sin Afiliación a Servicios de Salud" : item.ind_sal1,                                    
                                    "Porcentaje de Población Afiliada a Servicios de Salud" : item.ind_sal2,
                                    // "Población sin Afiliación a Servicios de Salud": item.psinder,
                                    // "Población afiliada a Servicios de Salud": item.pder_ss

                                }));

                            }

                            else if(categoria === 'Situación Conyugal'){

                                datosHoja = registros.map(item => ({

                                    "Nombre UT": item.nombre,
                                    "Clave UT": item.clave_ut,                                    
                                    "Porcentaje de Población Soltera" : item.ind_sitc1,
                                    "Personas Casadas o Unidas" : item.ind_pob8,
                                    // "Población 12+ Soltera o nunca unida": item.p12ym_solt,
                                    // "Población 12+ Casada o unida": item.p12ym_casa

                                }));

                            }

                            if (datosHoja.length > 0) {

                                // const hojaExcel = XLSX.utils.json_to_sheet(datosHoja);
                                // XLSX.utils.book_append_sheet(libroExcel, hojaExcel, dem.substring(0, 30));
                                hojasParaWorkbook.push({
                                    nombreHoja: dem,
                                    datos: datosHoja
                                });
                            }

                        });

                        
                        // Descargamos un archivo distinto por categoria
                        // XLSX.writeFile(libroExcel, `${categoria.replace(/\s+/g, "_")}.xlsx`);

                        // ===== USAR LA NUEVA FUNCIÓN =====
                        await descargarExcelConFormato({
                            nombreArchivo: categoria.replace(/\s+/g, "_"),
                            hojas: hojasParaWorkbook
                        });

                    }

                    // //Condicion para crear los csv de acuerdo a la demarcacion y las categorias
                    // if (datosPordemar && categoriasSeleccionadas.includes("Distribución Territorial")) {                     

                    //     // Creamos un nuevo libro de excel una sola vez
                    //     const libroExcel = XLSX.utils.book_new();
                    
                    //     // Recorremos todas las demarcaciones
                    //     Object.entries(datosPordemar).forEach(([dem, registros]) => {
                    
                    //         //Preparamos los datos en formato de objeto para excell
                    //         const datosHoja = registros.map(item => ({

                    //             "Clave UT": item.clave_ut,
                    //             "Superficie Entidad/Distrito": item.ind_sup1,
                    //             "Densidad de Población (hab/m²)": item.ind_sup2

                    //         }));
                    
                    //         //Convertimos los datos a hoja de excel y nobramos la hoja de acuerdo a la demarcacion
                    //         const hojaExcel = XLSX.utils.json_to_sheet(datosHoja);
                    
                    //         //Agregamos la hoja al libro (maximo 31 caracteres en el nombre)
                    //         XLSX.utils.book_append_sheet(libroExcel, hojaExcel, dem.substring(0, 30));

                    //     });
                    
                    //     //Gerneramos el archivo una sola vez y descargamos
                    //     XLSX.writeFile(libroExcel, "Distribucion_Territorial.xlsx");

                    // }
                    // else if(datosPordemar && categoriasSeleccionadas.includes("Composición Poblacional")){

                    //     // Creamos un nuevo libro de excel una sola vez
                    //     const libroExcel = XLSX.utils.book_new();
                    
                    //     // Recorremos todas las demarcaciones
                    //     Object.entries(datosPordemar).forEach(([dem, registros]) => {
                    
                    //         //Preparamos los datos en formato de objeto para excell
                    //         const datosHoja = registros.map(item => ({

                    //             "Clave UT": item.clave_ut,
                    //             "Población Total": item.pobtot,
                    //             "Población Femenina": item.pobfem,
                    //             "Población Masculina": item.pobmas,
                    //             "Población 3+ años": item.p_3ymas,
                    //             "Población 5+ años": item.p_5ymas,
                    //             "Población 12+ años": item.p_12ymas,
                    //             "Población 18+ años": item.p_18ymas,
                    //             "Población 0 - 14 años": item.pob0_14,
                    //             "Población 0 - 15 años": item.pob15_64,
                    //             "Población 65 + más": item.pob65_mas

                    //         }));
                    

                    //         //Convertimos los datos a hoja de excel y nobramos la hoja de acuerdo a la demarcacion
                    //         const hojaExcel = XLSX.utils.json_to_sheet(datosHoja);
                    
                    //         //Agregamos la hoja al libro (maximo 31 caracteres en el nombre)
                    //         XLSX.utils.book_append_sheet(libroExcel, hojaExcel, dem.substring(0, 30));

                    //     });
                    
                    //     //Gerneramos el archivo una sola vez y descargamos
                    //     XLSX.writeFile(libroExcel, "Composicion_Poblacional.xlsx");

                    // }

                    Swal.fire(
                        "Descarga iniciada",
                        `Se descargaron archivos para las categorías: ${categoriasSeleccionadas.join(", ")}`,
                        "success"
                    );
                    overlay.remove();

                } catch (error) {
                    console.error("Error al filtrar datos: ", error);
                    Swal.fire("Error", "No se pudo filtrar la información.", "error");
                }
            } else {
                Swal.fire("Atención", "Debes seleccionar al menos una categoría.", "warning");
            }
        });
    }
    Swal.fire({

        title: "Opciones de descarga",
        text: "Selecciona lo que deseas descargar:",
        icon: "info",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Por Demarcación",
        denyButtonText: "Todas las Demarcaciones",
        cancelButtonText: "Cerrar"

    }).then((result) => {

        if (result.isConfirmed) {

            const overlay = document.createElement("div");
            overlay.id = "overlay2";
            overlay.classList.add("overlay");

            overlay.innerHTML = `<div id="descargas-demarcacion"></div>`;
            document.body.appendChild(overlay);
            overlay.style.display = "flex";

            mostrarDemarcaciones(overlay);

        }
        else if (result.isDenied) {

            descargarDatosDemarcaciones();

        }
    });

}

function closeOverlayDescargas() {
    document.getElementById("overlay2").classList.add("hidden");
}


/*************************************************************************************
 * FUNCIONES PARA MSOTRAR Y QUITAR LA VISTA DE FUENTES
***************************************************************************************/

function fuentes(){

    const overlay = document.getElementById("overlay3");
    const spinner = document.getElementById("spinner");
    const fuentes = document.getElementById("fuentes-content");

    overlay.classList.remove("hidden");
    spinner.classList.remove("hidden");
    fuentes.classList.add("hidden");

    setTimeout(() => {
        spinner.classList.add("hidden");
        fuentes.classList.remove("hidden");
    }, 1000);


}
function closeOverlay3(){
    document.getElementById("overlay3").classList.add("hidden");
}

/*************************************************************************************
 * FUNCIONES GLOSARIO
***************************************************************************************/
// Suavizar el scroll
document.querySelectorAll('.indice-letra').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remover clase active de todas
        document.querySelectorAll('.indice-letra').forEach(l => l.classList.remove('active'));
        
        // Agregar clase active a la clickeada
        this.classList.add('active');
        
        // Scroll suave al elemento
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Detectar qué letra está visible mientras se hace scroll
window.addEventListener('scroll', function() {
    const letras = document.querySelectorAll('.letra-seccion');
    
    letras.forEach(letra => {
        const rect = letra.getBoundingClientRect();
        
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            const id = letra.getAttribute('id');
            
            // Remover active de todos
            document.querySelectorAll('.indice-letra').forEach(l => l.classList.remove('active'));
            
            // Agregar active al correspondiente
            document.querySelector(`a[href="#${id}"]`)?.classList.add('active');
        }
    });
});
