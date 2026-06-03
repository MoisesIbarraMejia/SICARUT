<?php

/** Conexion a la BD**/
require_once "conexion.php";
$objetoConexion = new Conexion();
$conexion = $objetoConexion->conectar();


$conexion->exec("SET NAMES 'utf8mb4'");
$conexion->exec("SET CHARACTER SET utf8mb4");

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Datos json
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Validamos los datos
    $clave = $data['clave'] ?? null;
    $claveDem = $data['claveDem'] ?? null;
    $nombreDem = $data['nombreDem'] ?? null;

    if (!$clave || !$claveDem) {
        echo json_encode(["error" => "Faltan parámetros."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /** Consulta a la BD con ST_AsText (MySQL no tiene ST_AsKML nativo) **/
    $sql = "SELECT 
                entidad, 
                cve_demarc, 
                dem_territ, 
                dtto_loc, 
                cve_ut, 
                nombre, 
                secciones, 
                secciones1,
                ST_AsText(SHAPE) AS wkt_geom,
                ST_GeometryType(SHAPE) AS geom_type
            FROM participacion_uts 
            WHERE cve_ut = :clave 
              AND cve_demarc = :claveDem";

    $stmt = $conexion->prepare($sql);
    $stmt->bindParam(':clave', $clave, PDO::PARAM_STR);
    $stmt->bindParam(':claveDem', $claveDem, PDO::PARAM_STR);
    $stmt->execute();

    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$resultados || count($resultados) === 0) {
        error_log("No se encontraron registros para cve_ut=$clave y cve_demarc=$claveDem");
        echo json_encode(["error" => "No se encontraron registros."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    error_log("===== REGISTROS ENCONTRADOS: " . count($resultados) . " =====");
    foreach ($resultados as $row) {
        error_log("Tipo geometría: " . $row['geom_type']);
        error_log("Nombre: " . $row['nombre']);
    }

    /**
     * Función para escapar caracteres especiales en XML/KML
     */
    function xmlEscape($string) {
        if ($string === null || $string === '') {
            return '';
        }
        
        // Asegurar que sea UTF-8
        if (!mb_check_encoding($string, 'UTF-8')) {
            $string = mb_convert_encoding($string, 'UTF-8', 'auto');
        }
        
        // Escapar caracteres XML especiales
        $string = htmlspecialchars($string, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        
        return $string;
    }

    /**
     * Convierte WKT a KML optimizado para MySQL
     */
    function wktToKml($wkt) {
        $wkt = trim($wkt);
        
        // MULTIPOLYGON
        if (stripos($wkt, 'MULTIPOLYGON') === 0) {
            $wkt = preg_replace('/^MULTIPOLYGON\s*\(\s*/i', '', $wkt);
            $wkt = preg_replace('/\s*\)$/', '', $wkt);
            
            preg_match_all('/\(\(([^)]+(?:\)[^)]+)*)\)\)/', $wkt, $matches);
            
            if (empty($matches[1])) {
                error_log("ERROR: No se pudieron extraer polígonos del MULTIPOLYGON");
                return '';
            }
            
            $kml = "<MultiGeometry>\n";
            
            foreach ($matches[1] as $polygonContent) {
                $kml .= processPolygon($polygonContent);
            }
            
            $kml .= "</MultiGeometry>\n";
            
            return $kml;
        }
        
        // POLYGON simple
        if (stripos($wkt, 'POLYGON') === 0) {
            $wkt = preg_replace('/^POLYGON\s*\(\s*\(/i', '', $wkt);
            $wkt = preg_replace('/\)\s*\)$/', '', $wkt);
            
            return processPolygon($wkt);
        }
        
        error_log("ERROR: Tipo de geometría no soportado: " . substr($wkt, 0, 20));
        return '';
    }

    /**
     * Procesa un polígono individual (puede tener huecos)
     */
    function processPolygon($polygonContent) {
        $rings = preg_split('/\),\s*\(/', $polygonContent);
        
        $kml = "<Polygon>\n";
        
        // Primer anillo = exterior
        if (isset($rings[0])) {
            $kml .= "  <outerBoundaryIs>\n";
            $kml .= "    <LinearRing>\n";
            $kml .= "      <coordinates>\n        ";
            $kml .= processCoordinates($rings[0]);
            $kml .= "\n      </coordinates>\n";
            $kml .= "    </LinearRing>\n";
            $kml .= "  </outerBoundaryIs>\n";
        }
        
        // Anillos adicionales = huecos
        for ($i = 1; $i < count($rings); $i++) {
            $kml .= "  <innerBoundaryIs>\n";
            $kml .= "    <LinearRing>\n";
            $kml .= "      <coordinates>\n        ";
            $kml .= processCoordinates($rings[$i]);
            $kml .= "\n      </coordinates>\n";
            $kml .= "    </LinearRing>\n";
            $kml .= "  </innerBoundaryIs>\n";
        }
        
        $kml .= "</Polygon>\n";
        
        return $kml;
    }

    /**
     * Convierte coordenadas WKT a formato KML
     */
    function processCoordinates($coordString) {
        $coordString = trim($coordString);
        $pairs = preg_split('/\s*,\s*/', $coordString);
        
        $kmlCoords = [];
        
        foreach ($pairs as $pair) {
            $parts = preg_split('/\s+/', trim($pair));
            
            if (count($parts) >= 2) {
                $x = trim($parts[0]);
                $y = trim($parts[1]);
                $kmlCoords[] = "$x,$y,0";
            }
        }
        
        return implode(' ', $kmlCoords);
    }

    /** Generamos el contenido DEL KML **/
    $kml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $kml .= '<kml xmlns="http://www.opengis.net/kml/2.2">' . "\n";
    $kml .= '<Document>' . "\n";
    $kml .= '  <name>' . xmlEscape($clave) . '</name>' . "\n";

    /** Estilos de color **/
    $kml .= '
    <Style id="customStyle">
        <LineStyle>
            <color>ffff00aa</color>
            <width>5</width>
        </LineStyle>
        <PolyStyle>
            <color>4DFFFFFF</color>
            <fill>1</fill>
            <outline>1</outline>
        </PolyStyle>
    </Style>
    ';

    /** Creamos los Placemarks **/
    foreach ($resultados as $row) {

        // Convertir geometría WKT a KML
        $geom = wktToKml($row['wkt_geom']);
        
        if (empty($geom)) {
            error_log("ERROR: No se pudo convertir geometría para " . $row['cve_ut']);
            continue;
        }

        $kml .= "  <Placemark>\n";
        $kml .= "    <name>" . xmlEscape($row['nombre']) . "</name>\n";
        $kml .= "    <styleUrl>#customStyle</styleUrl>\n";
        
        $kml .= "    <ExtendedData>\n";
        $kml .= "      <Data name=\"Clave Unidad Territorial\">\n";
        $kml .= "        <value>" . xmlEscape($row['cve_ut']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "      <Data name=\"Demarcación\">\n";
        $kml .= "        <value>" . xmlEscape($row['dem_territ']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "      <Data name=\"Clave Demarcación\">\n";
        $kml .= "        <value>" . xmlEscape($row['cve_demarc']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "      <Data name=\"Secciones Completas\">\n";
        $kml .= "        <value>" . xmlEscape($row['secciones']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "      <Data name=\"Secciones Parciales\">\n";
        $kml .= "        <value>" . xmlEscape($row['secciones1']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "      <Data name=\"Nombre\">\n";
        $kml .= "        <value>" . xmlEscape($row['nombre']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "      <Data name=\"Entidad\">\n";
        $kml .= "        <value>" . xmlEscape($row['entidad']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "      <Data name=\"Distrito Local\">\n";
        $kml .= "        <value>" . xmlEscape($row['dtto_loc']) . "</value>\n";
        $kml .= "      </Data>\n";
        $kml .= "    </ExtendedData>\n";
        
        $kml .= $geom;
        $kml .= "  </Placemark>\n";
    }

    $kml .= '</Document>' . "\n";
    $kml .= '</kml>';

    /** Cabeceras para descargar el archivo **/
    header('Content-Type: application/vnd.google-earth.kml+xml; charset=utf-8');
    header('Content-Disposition: attachment; filename="territorio_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $clave) . '.kml"');
    
    echo $kml;
    exit;
}
?>