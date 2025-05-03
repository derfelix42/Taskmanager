use axum::{response::Html, routing::get, Router};
use chrono::Utc;

use crate::database::Db;

mod categoryHandler;
use categoryHandler::category_router;

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
        .with_state(database.clone())
}
