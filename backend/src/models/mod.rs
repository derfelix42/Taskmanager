use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct category {
    ID: i64,
    Bezeichnung: String,
    color: Option<String>,
    display: bool,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct sleep_history {
    ID: i64,
    start_time: chrono::NaiveDateTime,
    stop_time: chrono::NaiveDateTime,
}
