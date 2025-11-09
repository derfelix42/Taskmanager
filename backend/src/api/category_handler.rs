use axum::{extract::State, routing::MethodRouter, Json};
use serde::{Deserialize, Serialize};

use crate::{database::Db, models::category};

#[derive(Deserialize)]
pub struct CreateCategory {
    pub Bezeichnung: String,
    pub color: String,
}

#[derive(Deserialize)]
pub struct DeleteCategory {
    pub ID: i32,
}

#[derive(Serialize)]
pub struct SimpleResponse {
    pub success: bool,
    pub message: String,
}

pub fn category_router() -> MethodRouter<Db> {
    MethodRouter::new()
        .get(get_categories)
        .post(create_category)
        .delete(delete_category)
}

pub async fn get_categories(State(database): State<Db>) -> Json<Vec<category>> {
    match database.get_categories().await {
        Ok(categories) => Json(categories),
        Err(_) => Json(vec![]),
    }
}

pub async fn create_category(
    State(database): State<Db>,
    Json(payload): Json<CreateCategory>,
) -> Json<SimpleResponse> {
    let result = database
        .create_category(&payload.Bezeichnung, &payload.color)
        .await;

    match result {
        Ok(_) => Json(SimpleResponse {
            success: true,
            message: "Category created".to_string(),
        }),
        Err(e) => Json(SimpleResponse {
            success: false,
            message: format!("Error: {}", e),
        }),
    }
}

pub async fn delete_category(
    State(database): State<Db>,
    Json(payload): Json<DeleteCategory>,
) -> Json<SimpleResponse> {
    let result = database.delete_category(payload.ID).await;

    match result {
        Ok(_) => Json(SimpleResponse {
            success: true,
            message: "Category deleted (display=0)".to_string(),
        }),
        Err(e) => Json(SimpleResponse {
            success: false,
            message: format!("Error: {}", e),
        }),
    }
}
