use serde::{Deserialize, Serialize};
use sqlx::{MySql, MySqlPool, Pool};

#[derive(Clone, Debug)]
pub struct db {
    pub pool: Pool<MySql>,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct category {
    ID: i64,
    Bezeichnung: String,
    color: Option<String>,
    display: bool,
}

impl db {
    pub async fn new() -> Self {
        let pool = match MySqlPool::connect("mysql://user:pass@localhost/j_tasks").await {
            Ok(p) => {
                tracing::info!("Connected successfully to DB");
                p
            }
            Err(e) => {
                tracing::error!("Could not connect to DB! {}", e);
                panic!();
            }
        };

        db { pool }
    }

    pub async fn get_categories(&self) -> Vec<category> {
        let rows: Vec<category> = sqlx::query_as("SELECT * FROM category WHERE display = ?")
            .bind(1)
            .fetch_all(&self.pool)
            .await
            .unwrap();

        rows
    }
}
