use sqlx::{query, MySql, MySqlPool, Pool};

use crate::models::{category, task, task_by_date};

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

    pub async fn get_tasks_by_category(&self, category: i64) -> Result<Vec<task>, sqlx::Error> {
        let query = "SELECT * FROM tasks WHERE deleted = 0 AND category=?";

        let rows: Vec<task> = sqlx::query_as(query)
            .bind(category)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows)
    }

    pub async fn get_tasks_by_date(
        &self,
        date: chrono::NaiveDate,
    ) -> Result<Vec<task_by_date>, sqlx::Error> {
        let query = "SELECT tasks.ID, tasks.done, Name, description, due, due_time,
                            DAYOFWEEK(due) AS dow, duration,
                            CAST(HOUR(duration) + (MINUTE(duration) / 60) AS DOUBLE) AS duration_in_hours,
                            TIMESTAMPDIFF(DAY, NOW(), due) AS days_left,
                            IF(CURRENT_DATE > due, 11, priority) AS priority,
                            difficulty, color, CAST(IFNULL(completed_time_spent, 0) AS SIGNED) AS time_spent, active_start_time,
                            category, location
                     FROM tasks
                     JOIN category ON tasks.category = category.ID
                     LEFT JOIN (
                         SELECT taskID,
                                SUM(TIMESTAMPDIFF(SECOND, start_time,stop_time)
                                    ) AS completed_time_spent
                         FROM task_history
						 WHERE stop_time IS NOT NULL
                         GROUP BY taskID
                     ) AS c ON tasks.ID = c.taskID
					LEFT JOIN (
                         SELECT taskID,start_time AS active_start_time
                         FROM task_history
						 WHERE stop_time IS NULL
                         GROUP BY taskID
                     ) AS b ON tasks.ID = b.taskID
                     WHERE deleted = 0 AND due = ?
                     ORDER BY due ASC, due_time ASC, priority DESC, category;";

        sqlx::query_as(query).bind(date).fetch_all(&self.pool).await
    }

    pub async fn start_task_by_name(&self, name: String, category: i64) -> Result<(), sqlx::Error> {
        let query = "";
        Ok(())
    }
}
