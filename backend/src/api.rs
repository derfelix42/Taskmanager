use axum::{extract::State, response::Html, routing::get, Json, Router};
use chrono::Utc;

use crate::database::{category, db};

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
        .route("/category", get(get_categories))
        .with_state(database.clone())
}

pub async fn get_categories(State(database): State<db>) -> Json<Vec<category>> {
    let categories = database.get_categories().await;
    Json(categories)
}
