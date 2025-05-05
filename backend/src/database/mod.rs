use sqlx::{MySql, MySqlPool, Pool};

use crate::models::{category, SleepHistoryEntry};

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

    // Category Table
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

    // Sleep History
    pub async fn sleep_history_wake_up(&self) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE sleep_history SET stop_time = NOW() WHERE stop_time IS NULL")
            .execute(&self.pool)
            .await
            .map(|_| ())
    }

    pub async fn sleep_history_go_to_sleep(&self) -> Result<(), sqlx::Error> {
        sqlx::query("INSERT INTO sleep_history (start_time, stop_time) VALUES (NOW(), NULL)")
            .execute(&self.pool)
            .await
            .map(|_| ())
    }

    pub async fn get_sleep_history(
        &self,
        date: &str,
    ) -> Result<Vec<SleepHistoryEntry>, sqlx::Error> {
        let query = r#"
            SELECT 
                start_time, 
                IFNULL(stop_time, NOW()) as stop_time, 
                stop_time IS NULL as is_active,  
                DAYOFWEEK(start_time) as sleep_dow, 
                DAYOFWEEK(IFNULL(stop_time, NOW())) as wakeup_dow, 
                TIME(start_time) as sleep_time, 
                TIME(IFNULL(stop_time, NOW())) as wakeup_time, 
                TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, NOW())) as sleep_secs, 
                SEC_TO_TIME(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, NOW()))) as sleep_hours 
            FROM sleep_history 
            WHERE (WEEK(start_time, 1) = WEEK(? , 1) OR WEEK(IFNULL(stop_time, NOW()), 1) = WEEK(? , 1))
              AND (YEAR(start_time) = YEAR(? ) OR YEAR(IFNULL(stop_time, NOW())) = YEAR(? ))
            ORDER BY start_time ASC
        "#;

        let rows = sqlx::query_as::<_, SleepHistoryEntry>(query)
            .bind(date)
            .bind(date)
            .bind(date)
            .bind(date)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }
}
