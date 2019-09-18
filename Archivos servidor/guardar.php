<?php header("Access-Control-Allow-Origin: *"); 
include('conexion.php');

$datos = json_decode(@file_get_contents("php://input"));

if ($datos){
	foreach($datos as $dato_actual){
	$monto = $dato_actual->monto;
	$descripcion = $dato_actual->descripcion;
	$categoria = $dato_actual->categoria;
	$tipo = $dato_actual->tipo;
	$fecha = $dato_actual->fecha ;
	$edicion = $dato_actual->edicion;
	$falsoid = $dato_actual->falsoid;

$ultimos_balances = guardar($monto, $descripcion, $categoria, $tipo, $fecha, $edicion, $falsoid );//Ejecuta la funcion, sea insert o update
	}

echo($ultimos_balances); 

}else{
	echo json_encode( array( ) );
}

?>
