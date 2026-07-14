# SICARUT - Sistema de Características Geoelectorales y de Participación Ciudadana

Este proyecto es una implementación basada en el **SICARUT** del **Instituto Electoral de la Ciudad de México (IECM)**. Es una herramienta diseñada para consultar, visualizar y difundir información geoelectoral y de participación ciudadana correspondiente a las **Unidades Territoriales** que integran el Marco Geográfico de Participación Ciudadana de la CDMX.

El sistema convierte el espacio geográfico en conocimiento accesible para la ciudadanía, permitiendo transitar de la intuición a la propuesta fundamentada en los ejercicios de democracia directa.

---

## Características Principales

* **Visualización del Marco Geográfico (MGPC):** Delimitación técnico-cartográfica de las 1,851 Unidades Territoriales de la CDMX aprobadas por el Consejo General del IECM.
* **Búsqueda por Sección Electoral:** Localización inmediata de la Unidad Territorial utilizando la clave de la sección electoral que aparece en la credencial para votar.
* **Navegación Geográfica:** Exploración paso a paso de la distribución territorial desde la Demarcación Territorial (Alcaldía) hasta el nivel de colonia, unidad habitacional, pueblo o barrio originario.
* **Indicadores Sociodemográficos Integrados:** Consulta de datos estadísticos clave (derivados del Censo INEGI) organizados en los siguientes ejes temáticos:
  * Distribución territorial y características de vivienda.
  * Composición poblacional, hogares censales, etnicidad y migración.
  * Características económicas y educativas.
  * Afiliación a servicios de salud, discapacidad y situación conyugal.

## Tecnologías Utilizadas

* **Frontend / Backend:** *PHP, HTML, CSS, JAVASCRIPT*
* **Mapeo y SIG:** *API JAVASCRIPT GOOGLE MAPS - GEOJSON MEDIANTE SPATIAL API*
* **Base de Datos / Fuentes:** Censo INEGI, Marco Geoestadístico y Cartografía Electoral del IECM.

## Requisitos Previos

Antes de ejecutar el proyecto de forma local, asegúrate de contar con:
* *SEVIDOR APACHE: XAMP Y MYSQL*
* Git instalado en tu equipo.

## Instalación y Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com
   cd tu-proyecto-sicarut
   ```

2. **Instalar dependencias:**
   ```bash
   # Cambia este comando según el gestor de paquetes de tu tecnología
   npm install 
   ```

3. **Configurar el entorno:**
   * Crea un archivo de configuración local para tus variables o base de datos.
   * *Nota: Asegúrate de que los archivos locales confidenciales o scripts de desarrollo (como proxies locales) estén correctamente listados en el archivo `.gitignore`.*

4. **Ejecutar el proyecto:**
   ```bash
   # Cambia este comando según tu entorno de ejecución
   npm start
   ```

## Glosario de Conceptos Clave (IECM)

* **Unidades Territoriales (UT):** Ámbito territorial clasificado en colonias, unidades habitacionales, pueblos y barrios originarios que establece el IECM para efectos de participación ciudadana (elección de COPACO y Consultas de Presupuesto Participativo).
* **Marco Geográfico de Participación Ciudadana (MGPC):** Instrumento técnico-cartográfico donde se materializa territorialmente el derecho constitucional a la participación ciudadana en la CDMX.
* **Pueblo y/o Barrio Originario:** Poblaciones asentadas en el territorio de la CDMX desde antes de la colonización que conservan sus propias instituciones, sistemas normativos y tradición histórica.

## Créditos y Referencias Institucionales

Este desarrollo toma como referencia la metodología, el glosario y el marco técnico provisto por la **Dirección Ejecutiva de Organización Electoral y Geoestadística (DEOEyG)** del Instituto Electoral de la Ciudad de México (IECM). 

* Sitio web oficial de consulta: [https://iecm.mx](https://iecm.mx)
