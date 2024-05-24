<?php
include_once("../includes/weatherApi.php");

$date = date("Y-m-d");
if (isset($_GET['date'])) {
    $date = $_GET['date'];
}




$sun_info = date_sun_info(strtotime($date), $sunrise_latitude, $sunrise_longitude);

$currentTemp = getCurrentTemp();
$forecast = getForecast();

echo "{\"curr_temp\": " . $currentTemp . ", \"sun_info\": {";

$sun_info_array = array();
array_push($sun_info_array, "\"date\": \"$date\"");
foreach ($sun_info as $key => $val) {
    array_push($sun_info_array, "\"$key\": \"" . date("H:i:s", $val) . "\"");
}
echo implode($sun_info_array, ", ");



echo "}, \"forecast\": [";

$forecasts = array();

foreach ($forecast as $value) {
    array_push($forecasts, "{\"date\": \"" . $value[0] . "\", \"min_temp\": " . $value[1] . ", \"max_temp\": " . $value[2] . ", \"wind\": " . $value[3] . "}");
}

echo implode($forecasts, ", ");

echo "]}";
?>