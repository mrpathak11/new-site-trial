<?php
if (isset($_GET["lat"]) && isset($_GET["lon"])) {
  $lat = $_GET["lat"];
  $lon = $_GET["lon"];
  $filename = "location.txt";
  $file = fopen($filename, "a");
  fwrite($file, $lat . "," . $lon . "\n");
  fclose($file);
  echo "Location saved successfully.";
} else {
  echo "Error: Latitude and longitude coordinates not provided.";
}
?>
