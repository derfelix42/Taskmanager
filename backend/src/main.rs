use axum_server::Handle;
use tower_http::cors::{Any, CorsLayer};

mod api;
mod database;

#[tokio::main]
async fn main() -> Result<(), String> {
    let mut sub = tracing_subscriber::fmt();
    // sub = sub.with_max_level(tracing::Level::DEBUG);
    sub.init();

    let database = database::db::new().await;

    let address = "0.0.0.0:3000";

    tracing::info!("Hello, world!");

    tracing::info!("Starting up HTTP-Server");

    let cors = CorsLayer::new().allow_origin(Any);

    let router = api::get_api_router(&database);
    let handle = Handle::new();
    let server = axum_server::bind(address.parse().unwrap())
        .handle(handle)
        .serve(router.layer(cors).into_make_service());

    tracing::info!("Started Server on http://{}", address);
    server.await.unwrap();

    Ok(())
}
