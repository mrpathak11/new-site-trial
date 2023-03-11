<?php
if(isset($_POST['latitude']) && isset($_POST['longitude'])) {
    $latitude = $_POST['latitude'];
    $longitude = $_POST['longitude'];
    $filename = 'location.txt';
    $data = $latitude . ',' . $longitude . PHP_EOL;
    file_put_contents($filename, $data, FILE_APPEND);
    echo 'Location saved';
} else {
    echo 'Location not provided';
}
?>
