<?php

include 'datosConexion.php';
//PDO (PHP DATA OBJECTS) define una interfaz para acceder a BD con php
class Conexion{
     
    function conectar() {
        
        try{
            $conexion = new PDO("mysql:host=".SERVER.";port=".PORT.";dbname=".DBNAME, USER, PASSWORD);
            //echo "conectado";
            return $conexion;

          
        } catch(Exception $error){
            
            die("El error de conexión es: ".$error->getMessage());
        }

    }

    function cerrar(){
        $this->conexion->close();
    }

}

$objetoConexion = new Conexion();
$conexion = $objetoConexion -> conectar();

?>