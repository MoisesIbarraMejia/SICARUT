<?php
include 'modelo/conexion.php';

// conexion
$objetoConexion = new Conexion();
$conexion = $objetoConexion->conectar();

try {

    //aumentar el contador 
    $sqlUpdate = "UPDATE contador_visitas SET total = total + 1 WHERE id = 1";
    $stmtUpdate = $conexion->prepare($sqlUpdate);
    $stmtUpdate->execute();

    //consultar el nuevo valor
    $sqlSelect = "SELECT total FROM contador_visitas WHERE id = 1";
    $stmtSelect = $conexion->prepare($sqlSelect);
    $stmtSelect->execute();
    $resultado = $stmtSelect->fetch(PDO::FETCH_ASSOC);

    // devolver valor al frontend
    echo $resultado['total'];

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

// Cerrar conexión
$conexion = null;
?>
