use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Extension, Json, Router,
};
use chrono::{NaiveDate, NaiveTime};
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast::Sender;

use crate::database::Db;

#[derive(Serialize)]
pub struct SimpleResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Deserialize)]
pub struct StartTask {
    name: String,
    category: Option<u64>,
}

#[derive(Deserialize)]
pub struct TaskNameOnly {
    name: String,
}

#[derive(Deserialize)]
pub struct CreateTaskRequest {
    title: String,
    description: String,
    due: NaiveDate,
    due_time: String,
    duration: String,
    priority: i64,
    category: i64,
    location: String,
}

#[derive(Serialize)]
pub struct CreatedTask {
    #[serde(rename = "ID")]
    pub id: i64,
}

#[derive(Serialize)]
pub struct CreateTaskResponse {
    pub status: &'static str,
    pub result: CreatedTask,
}

#[derive(Serialize)]
pub struct TaskResponse {
    pub id: i64,
    pub done_timestamp: Option<chrono::DateTime<chrono::Utc>>,
    pub title: String,
    pub description: String,
    pub due_date: chrono::NaiveDate,
    pub due_time: Option<chrono::NaiveTime>,
    pub day_of_week: i64,
    pub duration: Option<chrono::NaiveTime>,
    pub duration_in_hours: Option<f64>,
    pub priority: i64,
    pub difficulty: i64,
    pub color: String,
    pub category: i64,
    pub location: String,
    pub stats: TaskStats,
}

#[derive(Serialize)]
pub struct TaskStats {
    pub days_left: i64,
    pub time_spent: i64,
    pub active_start_time: Option<chrono::NaiveDateTime>,
}

// Get Tasks by Date:
// GET on /api/v2/task/by_date/:date[YYYY-MM-DD]
// runs SQL query and returns data as JSON
pub async fn get_tasks_by_date(
    State(database): State<Db>,
    Extension(events): Extension<Sender<String>>,
    Path(date): Path<NaiveDate>,
) -> Result<Json<Vec<TaskResponse>>, axum::http::StatusCode> {
    let tasks = database.get_tasks_by_date(date).await.map_err(|error| {
        tracing::error!(%error, "Could not load tasks by date");
        axum::http::StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let response = tasks
        .into_iter()
        .map(|task| TaskResponse {
            id: task.ID,
            done_timestamp: task.done,
            title: task.Name,
            description: task.description,
            due_date: task.due,
            due_time: task.due_time,
            color: task.color.unwrap_or("null".to_string()),
            category: task.category,
            location: task.location,
            priority: task.priority,
            difficulty: task.difficulty,
            day_of_week: task.dow,
            duration: task.duration,
            duration_in_hours: task.duration_in_hours,
            stats: TaskStats {
                days_left: task.days_left,
                time_spent: task.time_spent,
                active_start_time: task.active_start_time,
            },
        })
        .collect();

    let _ = events.send("get_tasks_by_date".to_string());

    Ok(Json(response))
}

pub fn get_tasks_by_category() {}

pub fn task_router() -> Router<Db> {
    Router::new()
        .route("/create", post(create_task))
        .route("/by_date/{date}", get(get_tasks_by_date))
        // .get(get_categories)
        // .post(start_task_by_name)
        .route("/current_task", get(get_current_task))
    // .get(stop_current_task_by_name)
    // .delete(delete_category)
}

pub async fn create_task(
    State(database): State<Db>,
    Extension(events): Extension<Sender<String>>,
    Json(payload): Json<CreateTaskRequest>,
) -> Result<Json<CreateTaskResponse>, StatusCode> {
    let due_time = parse_optional_time(&payload.due_time)?;
    let duration = parse_optional_time(&payload.duration)?;
    let id = database
        .create_task(
            &payload.title,
            &payload.description,
            payload.due,
            due_time,
            duration,
            payload.priority,
            payload.category,
            &payload.location,
        )
        .await
        .map_err(|error| {
            tracing::error!(%error, "Could not create task");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let _ = events.send("newTaskCreated".to_string());

    Ok(Json(CreateTaskResponse {
        status: "created",
        result: CreatedTask { id },
    }))
}

fn parse_optional_time(value: &str) -> Result<Option<NaiveTime>, StatusCode> {
    if value.is_empty() {
        return Ok(None);
    }

    NaiveTime::parse_from_str(value, "%H:%M")
        .or_else(|_| NaiveTime::parse_from_str(value, "%H:%M:%S"))
        .map(Some)
        .map_err(|_| StatusCode::BAD_REQUEST)
}

pub async fn start_task_by_name(
    State(database): State<Db>,
    Json(payload): Json<StartTask>,
) -> Json<SimpleResponse> {
    // payload.name

    Json(SimpleResponse {
        success: true,
        message: "Task started".to_string(),
    })
}

pub async fn get_current_task(
    State(database): State<Db>,
    // Json(payload): Json<TaskNameOnly>,
) -> Json<i32> {
    match database.get_active_task().await {
        Ok(task) => Json(task.unwrap_or(-1)),
        Err(_) => Json(-1),
    }
}

pub async fn stop_current_task_by_name(
    State(database): State<Db>,
    Json(payload): Json<TaskNameOnly>,
) -> Json<bool> {
    Json(false)
}

// pub async fn get_categories(State(database): State<Db>) -> Json<Vec<category>> {
//     match database.get_categories().await {
//         Ok(categories) => Json(categories),
//         Err(_) => Json(vec![]),
//     }
// }

// pub async fn create_category(
//     State(database): State<Db>,
//     Json(payload): Json<CreateCategory>,
// ) -> Json<SimpleResponse> {
//     let result = database
//         .create_category(&payload.Bezeichnung, &payload.color)
//         .await;

//     match result {
//         Ok(_) => Json(SimpleResponse {
//             success: true,
//             message: "Category created".to_string(),
//         }),
//         Err(e) => Json(SimpleResponse {
//             success: false,
//             message: format!("Error: {}", e),
//         }),
//     }
// }

// pub async fn delete_category(
//     State(database): State<Db>,
//     Json(payload): Json<DeleteCategory>,
// ) -> Json<SimpleResponse> {
//     let result = database.delete_category(payload.ID).await;

//     match result {
//         Ok(_) => Json(SimpleResponse {
//             success: true,
//             message: "Category deleted (display=0)".to_string(),
//         }),
//         Err(e) => Json(SimpleResponse {
//             success: false,
//             message: format!("Error: {}", e),
//         }),
//     }
// }
