use axum::{extract::State, routing::get, Json, Router};
use serde::Deserialize;

use crate::{database::Db, models::SleepHistoryEntry};

pub fn sleep_history_router() -> Router<Db> {
    Router::new()
        .route("/", get(get_sleep_history))
        .route("/week", get(get_sleep_history_week))
}

#[derive(Deserialize)]
pub struct SleepHistoryPaginationParams {
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

pub async fn get_sleep_history(
    State(database): State<Db>,
    Json(payload): Json<SleepHistoryPaginationParams>,
) -> Json<Vec<SleepHistoryEntry>> {
    match database
        .get_sleep_history_page(payload.limit, payload.offset)
        .await
    {
        Ok(history) => Json(history),
        Err(_) => Json(vec![]),
    }
}

#[derive(Deserialize)]
pub struct SleepHistoryWeekParam {
    pub week: String,
}

pub async fn get_sleep_history_week(
    State(database): State<Db>,
    Json(payload): Json<SleepHistoryWeekParam>,
) -> Json<Vec<SleepHistoryEntry>> {
    match database.get_sleep_history_for_week(&payload.week).await {
        Ok(history) => Json(history),
        Err(_) => Json(vec![]),
    }
}
