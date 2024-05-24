<?php
include_once("credentials.php");

function getForecast() {
  global $apiKey, $cityId;
  $WeatherApiUrl = "http://api.openweathermap.org/data/2.5/forecast?id=" . $cityId . "&units=metric&appid=" . $apiKey;

  $ch = curl_init();

  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_URL, $WeatherApiUrl);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_VERBOSE, 0);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  $response = curl_exec($ch);

  curl_close($ch);
  $data = json_decode($response);
  // echo "<script>console.log(".json_encode($data)."); console.log(JSON.parse('".json_encode($data)."').list[0].main.temp)</script>";

  $days = array();
  $date = date('Y-m-d', $data->list[0]->dt);
  $min = INF;
  $max = -999;
  $wind = 0;
  foreach($data->list as $pre) {
    $currdate = date('Y-m-d', $pre->dt);
    if($date != $currdate) {
      $days[$date] = array($date, $min, $max, $wind);
      $date = $currdate;
      $min = INF;
      $max = -999;
      $wind = 0;
    }

    if($pre->main->temp_min < $min) {
      $min = $pre->main->temp_min;
    }
    if($pre->main->temp_max > $max) {
      $max = $pre->main->temp_max;
    }
    if($pre->wind->speed > $wind) {
      $wind = $pre->wind->speed;
    }
  }

  return $days;
}

function getCurrentTemp() {
  global $apiKey, $cityId;
  $WeatherApiUrl = "http://api.openweathermap.org/data/2.5/forecast?id=" . $cityId . "&units=metric&appid=" . $apiKey;
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_URL, $WeatherApiUrl);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_VERBOSE, 0);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  $response = curl_exec($ch);

  curl_close($ch);
  $data = json_decode($response);
  #echo "<script>console.log(".json_encode($data)."); console.log(JSON.parse('".json_encode($data)."').list[0].main.temp)</script>";

  $temp = $data->list[0]->main->temp;

  return $temp;
}

?>
