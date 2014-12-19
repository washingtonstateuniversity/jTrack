<?php

$callback=$_GET['callback'];
$load = $_GET['load'];

$data='{}';
if(file_exists($load.'.txt')){
	$data = file_get_contents($load.'.txt');
}
echo $callback . '(' . $data . ')';
