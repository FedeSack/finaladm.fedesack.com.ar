<?php header("Access-Control-Allow-Origin: *");
include('conexion.php');

$datos = json_decode(@file_get_contents("php://input"));
	$ids = implode("," , $datos);
	eliminar_item($ids);
	echo get_listado( );
?>
