use axum::{
    http::{StatusCode, Uri},
    response::Html,
    routing::get,
    Router,
};
use chrono::Utc;

mod sleep_history_handler;
use sleep_history_handler::sleep_history_router;

use crate::database::Db;

mod category_handler;
use category_handler::category_router;

pub fn get_api_router(database: &Db) -> Router {
    Router::new()
        .route(
            "/api/v2",
            get(|| async {
                Html(format!(
                    "<h1>Hello, world!</h1>
                <p>Request processed at: {:?}</p>",
                    Utc::now().to_string()
                ))
            }),
        )
        .nest("/api/v2/category", category_router())
        .route("/api/v2/sleep_history", sleep_history_router())
        .with_state(database.clone())
        .fallback(fallback)
}

async fn fallback(uri: Uri) -> (StatusCode, String) {
    (StatusCode::NOT_FOUND, format!("No route for {uri}"))
}
