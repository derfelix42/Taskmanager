<?php
include_once("../includes/weatherApi.php");

$sunrise = date_sunrise(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 90, 1);
$sunset = date_sunset(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 90, 1);
$sunset_dark = date_sunset(strtotime($DueDate), SUNFUNCS_RET_STRING, 50.620721, 6.960079, 102, 1);


$currentTemp = getCurrentTemp();
$forecast = getForecast();

echo "{\"curr_temp\": ".$currentTemp.", \"sun_today\": {\"sunrise\": \"$sunrise\", \"sunset\": \"$sunset\", \"sunset_dark\": \"$sunset_dark\"}, ";
    
echo "\"forecast\": [";

$forecasts = array();

foreach ($forecast as $value) {
    array_push($forecasts, "{\"date\": \"".$value[0]."\", \"min_temp\": ". $value[1].", \"max_temp\": ".  $value[2].", \"wind\": ".  $value[3]."}");
}

echo implode($forecasts, ", ");

echo "]}";
?>