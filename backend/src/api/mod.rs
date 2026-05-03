use axum::{response::Html, routing::get, Router};
use chrono::Utc;

use crate::database::Db;

mod categoryHandler;
use categoryHandler::category_router;

mod taskHandler;
use taskHandler::task_router;

mod weatherHandler;
use weatherHandler::weather_router;

mod openweathermap;

pub fn get_api_router(database: &Db) -> Router {
    Router::new()
        .route(
            "/",
            get(|| async {
                Html(format!(
                    "<h1>Hello, world!</h1>
                <p>Request processed at: {:?}</p>",
                    Utc::now().to_string()
                ))
            }),
        )
        .route("/category", category_router())
        .route("/task", task_router())
        .nest("/weather", weather_router())
        .with_state(database.clone())
}
