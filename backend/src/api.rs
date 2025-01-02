use axum::{response::Html, routing::get, Router};
use chrono::Utc;

pub fn get_api_router() -> Router {
    Router::new().route(
        "/",
        get(|| async {
            Html(format!(
                "<h1>Hello, world!</h1>
                <p>Request processed at: {:?}</p>",
                Utc::now().to_string()
            ))
        }),
    )
}
