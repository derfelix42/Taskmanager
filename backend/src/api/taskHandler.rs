use axum::{
    extract::{Path, State},
    routing::get,
    Json, Router,
};
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

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

// Get Tasks by Date:
// GET on /api/v2/task/by_date/:date[YYYY-MM-DD]
// runs SQL query and returns data as JSON
pub async fn get_tasks_by_date(
    State(database): State<Db>,
    Path(date): Path<NaiveDate>,
) -> Result<Json<Vec<crate::models::task_by_date>>, axum::http::StatusCode> {
    database
        .get_tasks_by_date(date)
        .await
        .map(Json)
        .map_err(|error| {
            tracing::error!(%error, "Could not load tasks by date");
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        })
}

pub fn get_tasks_by_category() {}

pub fn task_router() -> Router<Db> {
    Router::new().route("/by_date/{date}", get(get_tasks_by_date))
    // .get(get_categories)
    // .post(start_task_by_name)
    // .get(get_current_task)
    // .get(stop_current_task_by_name)
    // .delete(delete_category)
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
    Json(payload): Json<TaskNameOnly>,
) -> Json<bool> {
    Json(false)
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
