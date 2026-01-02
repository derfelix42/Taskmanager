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
