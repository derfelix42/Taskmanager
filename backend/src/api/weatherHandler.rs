use axum::{
    extract::Query,
    routing::{get, MethodRouter},
    Json, Router,
};
use chrono::{DateTime, NaiveDate, TimeZone, Utc};
use serde::{Deserialize, Serialize};
use spa::{sunrise_and_set, StdFloatOps, SunriseAndSet};
use tracing_subscriber::fmt::format;

use crate::{
    api::{self, openweathermap::ForecastResponse},
    database::Db,
};

pub fn weather_router() -> Router<Db> {
    Router::new()
        .route("/forecast", get(get_forecast))
        .route("/current_temp", get(get_current_temp))
        .route("/sun_times", get(get_sun_times))
}

async fn get_forecast() -> Json<String> {
    //   global $apiKey, $cityId;
    //   $WeatherApiUrl = "http://api.openweathermap.org/data/2.5/forecast?id=" . $cityId . "&units=metric&appid=" . $apiKey;

    //   $ch = curl_init();

    //   curl_setopt($ch, CURLOPT_HEADER, 0);
    //   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    //   curl_setopt($ch, CURLOPT_URL, $WeatherApiUrl);
    //   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    //   curl_setopt($ch, CURLOPT_VERBOSE, 0);
    //   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    //   $response = curl_exec($ch);

    //   curl_close($ch);
    //   $data = json_decode($response);
    //   // echo "<script>console.log(".json_encode($data)."); console.log(JSON.parse('".json_encode($data)."').list[0].main.temp)</script>";

    //   $days = array();
    //   $date = date('Y-m-d', $data->list[0]->dt);
    //   $min = INF;
    //   $max = -999;
    //   $wind = 0;
    //   foreach($data->list as $pre) {
    //     $currdate = date('Y-m-d', $pre->dt);
    //     if($date != $currdate) {
    //       $days[$date] = array($date, $min, $max, $wind);
    //       $date = $currdate;
    //       $min = INF;
    //       $max = -999;
    //       $wind = 0;
    //     }

    //     if($pre->main->temp_min < $min) {
    //       $min = $pre->main->temp_min;
    //     }
    //     if($pre->main->temp_max > $max) {
    //       $max = $pre->main->temp_max;
    //     }
    //     if($pre->wind->speed > $wind) {
    //       $wind = $pre->wind->speed;
    //     }
    //   }

    //   return $days;
    Json("Test".to_string())
}

async fn get_current_temp() -> Json<f64> {
    //       global $apiKey, $cityId;
    //   $WeatherApiUrl = "http://api.openweathermap.org/data/2.5/forecast?id=" . $cityId . "&units=metric&appid=" . $apiKey;
    //   $ch = curl_init();

    //   curl_setopt($ch, CURLOPT_HEADER, 0);
    //   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    //   curl_setopt($ch, CURLOPT_URL, $WeatherApiUrl);
    //   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    //   curl_setopt($ch, CURLOPT_VERBOSE, 0);
    //   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    //   $response = curl_exec($ch);

    //   curl_close($ch);
    //   $data = json_decode($response);
    //   #echo "<script>console.log(".json_encode($data)."); console.log(JSON.parse('".json_encode($data)."').list[0].main.temp)</script>";

    //   $temp = $data->list[0]->main->temp;

    //   return $temp;
    let city_id = 2847666;
    let api_key = "1b2a80868267112dc62276dd6182af35";
    let url = format!(
        "http://api.openweathermap.org/data/2.5/forecast?id={}&units=metric&appid={}",
        city_id, api_key
    );

    if let Ok(weather_data) = reqwest::get(url).await {
        let data: ForecastResponse = weather_data.json().await.unwrap();
        let temp = data.list.first().map(|x| x.main.temp).unwrap_or(0.0f64);
        return Json(temp);
    }

    Json(0.0f64)
}

#[derive(Serialize)]
struct SunTimes {
    date: String,
    sunrise: String,
    sunset: String,
}

#[derive(Deserialize)]
struct SunTimesParams {
    date: Option<NaiveDate>,
}

/// Get sunrise, sunset and civil twilight for a given lat/long location
async fn get_sun_times(Query(params): Query<SunTimesParams>) -> Json<SunTimes> {
    let date = params.date.unwrap_or_else(|| Utc::now().date_naive());
    let date = Utc.from_utc_datetime(&date.and_hms_opt(0, 0, 0).unwrap());

    // async fn get_sun_times(date: DateTime<Utc>) -> Json<SunTimes> {
    let lat: f64 = std::env::var("SUNRISE_CORDS_LAT")
        .unwrap_or("0.0".to_string())
        .parse()
        .unwrap();
    let lon: f64 = std::env::var("SUNRISE_CORDS_LON")
        .unwrap_or("0.0".to_string())
        .parse()
        .unwrap();

    let (sunrise, sunset) = match sunrise_and_set::<StdFloatOps>(date, lat, lon) {
        Ok(SunriseAndSet::Daylight(rise, set)) => (rise.to_rfc3339(), set.to_rfc3339()),
        Ok(SunriseAndSet::PolarDay) => ("polar_day".into(), "polar_day".into()),
        Ok(SunriseAndSet::PolarNight) => ("polar_night".into(), "polar_night".into()),
        Err(e) => panic!("SPA error: {:?}", e),
    };

    Json(SunTimes {
        date: date.to_rfc3339(),
        sunrise,
        sunset,
    })
}
