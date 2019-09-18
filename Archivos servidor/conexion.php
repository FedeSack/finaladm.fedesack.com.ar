<?php header("Access-Control-Allow-Origin: *");

$cnx = mysqli_connect('', '', '', '' ); // Datos de conexión eliminados para seguridad del servidor.


function eliminar_item( $id ){ 
	global $cnx;
	$c = "DELETE FROM balance WHERE id in ($id) ";
	mysqli_query($cnx, $c);
	
	return get_listado();
}

function guardar($monto, $descripcion, $categoria, $tipo, $fecha, $edicion, $falsoid ){
	global $cnx;	
    $c = "INSERT INTO balance VALUES ( null, '$monto','$descripcion','$categoria', '$tipo','$fecha','$edicion', '$falsoid') on duplicate key update monto = '$monto', descripcion = '$descripcion', categoria = '$categoria', tipo = '$tipo', edicion = '$edicion'";
   
   $retorno = mysqli_query($cnx, $c);
   echo mysqli_error($cnx);
   
	return get_listado();
}


function get_listado($cantidad = null ){
	global $cnx;
	$c = "SELECT * FROM balance ORDER BY fecha";
	if($cantidad != null){
		$c.=" limit $cantidad";
	}
	$f = mysqli_query($cnx, $c);
	$retorno = array( );
	
	while($a = mysqli_fetch_assoc($f)){
		$retorno[] = $a;
	}
	
	return json_encode($retorno);
	
}

?>
