<?php
include( 'header.php' );

if( $_GET['portfolio'] )
	include('portfolio/' . $_GET['portfolio'] . '.html');
else
	include('home.html');

include( 'footer.php' );
?>