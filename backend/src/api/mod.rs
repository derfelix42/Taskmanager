use axum::{response::Html, routing::get, Router};
use chrono::Utc;
use sleepHistoryHandler::sleep_history_router;

use crate::database::Db;

mod categoryHandler;
use categoryHandler::category_router;

mod sleepHistoryHandler;

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
        .route("/api/v2/category", category_router())
        .route("/api/v2/sleep_history", sleep_history_router())
        .with_state(database.clone())
}
