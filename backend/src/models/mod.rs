use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct category {
    pub ID: i64,
    pub Bezeichnung: String,
    pub color: Option<String>,
    pub display: bool,
    pub prefixes: Option<String>,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct sleep_history {
    ID: i64,
    start_time: chrono::NaiveDateTime,
    stop_time: chrono::NaiveDateTime,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct task {
    pub ID: i64,
    pub Name: String,
    pub description: String,
    pub due: chrono::NaiveDate,
    pub due_time: Option<chrono::NaiveTime>,
    pub done: Option<chrono::DateTime<chrono::Utc>>,
    pub duration: Option<chrono::NaiveTime>,
    pub priority: i64,
    pub difficulty: i64,
    pub created: chrono::DateTime<chrono::Utc>,
    pub category: i64,
    pub location: String,
    pub deleted: bool,
    pub autogen: bool,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct task_by_date {
    pub ID: i64,
    pub done: Option<chrono::DateTime<chrono::Utc>>,
    pub Name: String,
    pub description: String,
    pub due: chrono::NaiveDate,
    pub due_time: Option<chrono::NaiveTime>,
    #[serde(rename = "DOW")]
    pub dow: i64,
    pub duration: Option<chrono::NaiveTime>,
    pub duration_in_hours: Option<f64>,
    #[serde(rename = "daysLeft")]
    pub days_left: i64,
    pub priority: i64,
    pub difficulty: i64,
    pub color: Option<String>,
    pub time_spent: i64,
    pub active_start_time: Option<chrono::NaiveDateTime>,
    pub category: i64,
    pub location: String,
}
