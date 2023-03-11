<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$latitude = $_POST['latitude'];
	$longitude = $_POST['longitude'];
	$file = fopen('location.txt', 'a');
	fwrite($file, "$latitude,$longitude\n");
	fclose($file);
}
?>
