use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ForecastResponse {
    pub cod: String,
    pub message: f64,
    pub cnt: u32,
    pub list: Vec<ForecastItem>,
    pub city: City,
}

#[derive(Debug, Deserialize)]
pub struct ForecastItem {
    pub dt: i64,
    pub main: MainInfo,
    pub weather: Vec<WeatherInfo>,
    pub clouds: Clouds,
    pub wind: Wind,
    pub visibility: Option<u32>,
    pub pop: Option<f64>,
    pub rain: Option<PrecipitationVolume>,
    pub snow: Option<PrecipitationVolume>,
    pub sys: ForecastSys,
    pub dt_txt: String,
}

#[derive(Debug, Deserialize)]
pub struct MainInfo {
    pub temp: f64,
    pub feels_like: f64,
    pub temp_min: f64,
    pub temp_max: f64,
    pub pressure: u32,
    pub sea_level: Option<u32>,
    pub grnd_level: Option<u32>,
    pub humidity: u32,
    pub temp_kf: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct WeatherInfo {
    pub id: u32,
    pub main: String,
    pub description: String,
    pub icon: String,
}

#[derive(Debug, Deserialize)]
pub struct Clouds {
    pub all: u32,
}

#[derive(Debug, Deserialize)]
pub struct Wind {
    pub speed: f64,
    pub deg: u32,
    pub gust: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct PrecipitationVolume {
    #[serde(rename = "3h")]
    pub volume_3h: f64,
}

#[derive(Debug, Deserialize)]
pub struct ForecastSys {
    pub pod: String,
}

#[derive(Debug, Deserialize)]
pub struct City {
    pub id: u32,
    pub name: String,
    pub coord: Coord,
    pub country: String,
    pub population: Option<u64>,
    pub timezone: i64,
    pub sunrise: i64,
    pub sunset: i64,
}

#[derive(Debug, Deserialize)]
pub struct Coord {
    pub lat: f64,
    pub lon: f64,
}
