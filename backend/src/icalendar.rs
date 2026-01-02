use axum::{
    extract::{Path, State},
    response::Html,
    routing::{get, MethodRouter},
    Router,
};
use chrono::{Timelike, Utc};
use icalendar::{Calendar, Component, Event, EventLike};

use crate::database::Db;

pub fn get_ical_router(database: &Db) -> Router {
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
        .with_state(database.clone())
}

// pub fn ical_router() -> MethodRouter<Db> {
//     MethodRouter::new().get(get_ical)
// }

pub async fn get_ical(State(database): State<Db>, Path(category): Path<i64>) -> String {
    match database.get_categories().await {
        Ok(categories) => {
            let target = categories.iter().find(|c| c.ID == category);
            if target.is_some() {
                let target = target.unwrap();
                let mut calendar = Calendar::default();
                calendar.name(&target.Bezeichnung);

                println!("Got request for {:?}", calendar.get_name());

                let category_tasks = database.get_tasks_by_category(category).await;

                match category_tasks {
                    Ok(tasks) => {
                        println!("-> Found {} tasks in this category", tasks.len());
                        for task in tasks {
                            let mut event = Event::new();
                            event.summary(&task.Name).description(&task.description);

                            if task.due_time.is_some() && task.duration.is_some() {
                                let start_time = task.due.and_time(task.due_time.unwrap());
                                event.starts(start_time);
                                let duration_time = task.duration.unwrap();
                                let duration_seconds = duration_time.hour() * 3600
                                    + duration_time.minute() * 60
                                    + duration_time.second();
                                let duration = chrono::TimeDelta::seconds(duration_seconds as i64);
                                event.ends(start_time + duration);

                                println!("    - created event {} for defined duration", task.Name);
                            } else {
                                event.all_day(task.due);
                                println!("    - created event {} all day long", task.Name);
                            }

                            calendar.push(event);
                        }
                    }
                    Err(e) => {
                        return format!("SQL Error: {:?}", e);
                    }
                }

                let output = format!("{calendar}");
                return output;
            }
        }
        Err(_) => return "ERROR".to_string(),
    }

    "ERROR".to_string()
}
