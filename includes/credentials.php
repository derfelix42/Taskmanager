<?php
include_once($_SERVER['DOCUMENT_ROOT']."/Taskmanager/includes/dotenv.php");
(new DotEnv($_SERVER['DOCUMENT_ROOT']."/Taskmanager/.env"))->load();

$username = getenv('MYSQL_USERNAME');
$password = getenv('MYSQL_PASSWORD');

# Weather API
$apiKey = getenv('WEATHER_API_KEY');
$samplesApiKey = getenv('WEATHER_SAMPLE_API_KEY');
$cityId = getenv('WEATHER_CITY_ID');

# Bahn API
$first_station_id = getenv('BAHN_API_FROM_ID');
$second_station_id = getenv('BAHN_API_TO_ID');

# StayFree - UUID
$SF_uuid = getenv('STAY_FREE_UUID');


?>