use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct category {
    ID: i64,
    Bezeichnung: String,
    color: Option<String>,
    display: bool,
    prefixes: Option<String>,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct sleep_history {
    ID: i64,
    start_time: chrono::NaiveDateTime,
    stop_time: chrono::NaiveDateTime,
}

#[derive(Deserialize, Serialize, sqlx::FromRow, Debug)]
pub struct SleepHistoryEntry {
    pub start_time: chrono::NaiveDateTime,
    pub stop_time: chrono::NaiveDateTime,
    pub is_active: bool,
    pub sleep_dow: i32,
    pub wakeup_dow: i32,
    pub sleep_time: chrono::NaiveTime,
    pub wakeup_time: chrono::NaiveTime,
    pub sleep_secs: i64,
    pub sleep_hours: String,
}
