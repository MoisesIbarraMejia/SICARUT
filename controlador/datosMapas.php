<?php

require '../modelo/modeloMapas.php';

$query = new Mapas();

// Para ver si el valor llega bien y no está vacío
if (isset($_POST['valor']) && $_POST['valor'] == "demarcaciones") {

    $consulta = $query->demarcaciones();

    // Si la consulta devolvió resultados
    if ($consulta && is_array($consulta)) {

        echo json_encode($consulta);
        
    } else {
        echo json_encode(["error" => "Consulta vacía o inválida"]);
    }

} 

else if(isset($_POST['valor']) && isset($_POST['demarcacion']) && $_POST['valor'] == "distritos-locales"){

    //Variable que mandamos por POST
    $demarcacion = $_POST['demarcacion'];

    $consulta = $query->distritosLoc($demarcacion);

    // Si la consulta devolvió resultados
    if ($consulta && is_array($consulta)) {

        echo json_encode($consulta);
        
    } else {
        
        echo json_encode(["error" => "Consulta vacía o inválida"]);
        
    }

}

else if(isset($_POST['valor']) && isset($_POST['distrito']) && $_POST['demarcacion'] && $_POST['valor'] == "uts-distrito"){

    //Variables que mandamos por POST
    $distrito = $_POST['distrito'];
    $demarcacion = $_POST['demarcacion'];

    $consulta = $query->uts($distrito, $demarcacion);

    // Si la consulta devolvió resultados
    if ($consulta && is_array($consulta)) {

        echo json_encode($consulta);
        
    } else {
        
        echo json_encode(["error" => "Consulta vacía o inválida"]);
        
    }

}

else {
    echo json_encode(["error" => "POST 'valor' no recibido o incorrecto"]);
}