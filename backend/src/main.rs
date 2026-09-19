use axum::routing::get;
use axum::Router;
use axum_server::Handle;
use tower_http::cors::{Any, CorsLayer};

use crate::websockets::websocket_handler;

mod api;
mod database;
mod icalendar;
mod models;
mod websockets;

#[tokio::main]
async fn main() -> Result<(), String> {
    let mut sub = tracing_subscriber::fmt();
    // sub = sub.with_max_level(tracing::Level::DEBUG);
    sub.init();

    let database = database::Db::new().await;

    let address = "0.0.0.0:3008";

    tracing::info!("Hello, world!");

    tracing::info!("Starting up HTTP-Server");

    let cors = CorsLayer::new().allow_origin(Any);

    let router = Router::new()
        .nest("/api/v2", api::get_api_router(&database))
        .nest("/ical", icalendar::get_ical_router(&database))
        .route("/websocket", get(websocket_handler));
    let handle = Handle::new();
    let server = axum_server::bind(address.parse().unwrap())
        .handle(handle)
        .serve(router.layer(cors).into_make_service());

    // let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await?;
    // axum::serve(listener, app).await?;
    tracing::info!("Started Server on http://{}", address);
    server.await.unwrap();

    Ok(())
}
