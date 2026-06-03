<?php

class Mapas {

    public function demarcaciones() {

        require_once "conexion.php";
        $objetoConexion = new Conexion();
        $conexion = $objetoConexion->conectar();

        try {

            $arreglo = [];
            $consulta = "
                SELECT 
                    nombre,
                    numero_dem,
                    latitud, 
                    longitud, 
                    ST_AsText(ST_GeomFromWKB(ST_AsWKB(SHAPE))) AS multipolygon 
                FROM demarcacion
            ";
            
            $resultado = $conexion->prepare($consulta);
            $resultado->execute();
            

            while ($poligono = $resultado->fetch(PDO::FETCH_ASSOC)) {

                //UTF-8 válido
                array_walk_recursive($poligono, function (&$item) {
                    if (is_string($item)) {
                        $item = mb_convert_encoding($item, 'UTF-8', 'ISO-8859-1');
                    }
                });
                $arreglo[] = $poligono;
                
            }

            return $arreglo;

        } catch (PDOException $e) {

            // Devuelve el error con claridad
            return [["error" => $e->getMessage()]];
        }

    }

    public function distritosLoc($demarcacion) {

        require_once "conexion.php";
        $objetoConexion = new Conexion();
        $conexion = $objetoConexion->conectar();
    
        try {
            
            $arreglo = [];
    
            $consulta = "
                SELECT 
                nombre, 
                name,
                latitud, 
                longitud,
                numero_dem,
                ST_AsText(ST_GeomFromWKB(ST_AsWKB(SHAPE))) AS multipolygon 

            FROM 
                distritos_demarcacion
            WHERE 
                numero_dem = ${demarcacion}
            ";
    
            $resultado = $conexion->prepare($consulta);
            //$resultado->bindParam(':demar', $demarcacion, PDO::PARAM_INT);
            $resultado->execute();
    
            while ($poligono = $resultado->fetch(PDO::FETCH_ASSOC)) {
                // Asegurar codificación UTF-8
                array_walk_recursive($poligono, function (&$item) {
                    if (is_string($item)) {
                        $item = mb_convert_encoding($item, 'UTF-8', 'ISO-8859-1');
                    }
                });
                $arreglo[] = $poligono;
            }
    
            return $arreglo;
    
        } catch (PDOException $e) {
            return [["error" => $e->getMessage()]];
        }
    }

    public function uts($distrito, $demarcacion){

        require_once "conexion.php";
        $objetoConexion = new Conexion();
        $conexion = $objetoConexion->conectar();

        try {
            
            $arreglo = [];
    
            $consulta = "

                SELECT
                cve_ut, 
                nombre,
                ST_AsText(ST_GeomFromWKB(ST_AsWKB(SHAPE))) AS multipolygon 

            FROM 
                uts_mgpc
            WHERE 
                dtto_loc_d = ${distrito} AND cve_demarc = ${demarcacion}
            ";
    
            $resultado = $conexion->prepare($consulta);
            //$resultado->bindParam(':demar', $demarcacion, PDO::PARAM_INT);
            $resultado->execute();
    
            while ($poligono = $resultado->fetch(PDO::FETCH_ASSOC)) {
                // Asegurar codificación UTF-8
                array_walk_recursive($poligono, function (&$item) {
                    if (is_string($item)) {
                        $item = mb_convert_encoding($item, 'UTF-8', 'ISO-8859-1');
                    }
                });
                $arreglo[] = $poligono;
            }
    
            return $arreglo;
    
        } catch (PDOException $e) {
            return [["error" => $e->getMessage()]];
        }
    

    }
    

}
