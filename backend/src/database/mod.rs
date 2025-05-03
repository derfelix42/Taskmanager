use sqlx::{MySql, MySqlPool, Pool};

use crate::models::category;

#[derive(Clone, Debug)]
pub struct Db {
    pub pool: Pool<MySql>,
}

impl Db {
    pub async fn new() -> Self {
        let pool = match MySqlPool::connect("mysql://root:pass@mariadb/j_tasks").await {
            Ok(p) => {
                tracing::info!("Connected successfully to DB");
                p
            }
            Err(e) => {
                tracing::error!("Could not connect to DB! {}", e);
                panic!();
            }
        };

        Db { pool }
    }

    pub async fn get_categories(&self) -> Result<Vec<category>, sqlx::Error> {
        let query = "SELECT category.ID, Bezeichnung, color, display, GROUP_CONCAT(b.prefix SEPARATOR ',') as prefixes
                     FROM `category`
                     LEFT JOIN (
                         SELECT category as ID, SUBSTRING_INDEX(Name, ' ', 1) AS prefix, COUNT(Name) as counter
                         FROM `tasks`
                         WHERE done is NULL AND deleted = 0 AND Name REGEXP '^\\\\['
                         GROUP BY category, prefix
                         HAVING counter > 1
                     ) AS b ON category.ID = b.ID
                     GROUP BY category.ID";

        let rows: Vec<category> = sqlx::query_as(query).fetch_all(&self.pool).await?;
        Ok(rows)
    }

    pub async fn create_category(&self, bezeichnung: &str, color: &str) -> Result<(), sqlx::Error> {
        sqlx::query("INSERT INTO category (Bezeichnung, color, display) VALUES (?, ?, 1)")
            .bind(bezeichnung)
            .bind(color)
            .execute(&self.pool)
            .await
            .map(|_| ())
    }

    pub async fn delete_category(&self, id: i32) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE category SET display=0 WHERE ID=?")
            .bind(id)
            .execute(&self.pool)
            .await
            .map(|_| ())
    }
}
