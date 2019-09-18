<?php 
	header('Access-Control-Allow-Origin: *');
	include('conexion.php');
	
	echo get_listado( );
?>
