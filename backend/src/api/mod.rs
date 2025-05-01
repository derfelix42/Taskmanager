use axum::{extract::State, response::Html, routing::get, Router};
use chrono::Utc;

use crate::database::db;

mod categoryHandler;
use categoryHandler::category_router;

pub fn get_api_router(database: &db) -> Router {
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
        .with_state(database.clone())
}
