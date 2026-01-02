use axum::{
    extract::Path,
    response::Html,
    routing::{get, MethodRouter},
    Router,
};
use chrono::Utc;
use icalendar::{Calendar, Component, Event, EventLike};

pub fn get_ical_router() -> Router {
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
        .route("/{category}", get(get_ical))
    // .with_state(database.clone())
}

pub fn ical_router() -> MethodRouter {
    MethodRouter::new().get(get_ical)
}

pub async fn get_ical(Path(category): Path<String>) -> String {
    let mut calendar = Calendar::default();
    calendar.name("Category");
    calendar.push(
        Event::new()
            .summary("[test] hallo 2")
            .description("")
            .starts(Utc::now()),
    );
    let output = format!("{calendar}");
    output
    // format!("Got: {category}")
}
