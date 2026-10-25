use sqlx::{query, MySql, MySqlPool, Pool};

use crate::models::{category, task, task_by_date};

#[derive(Debug, sqlx::FromRow)]
pub struct StatisticsAggregate {
    pub tasks_created: i64,
    pub tracked_seconds: i64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct StatisticsSleep {
    pub sessions: i64,
    pub seconds: i64,
}

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

    pub async fn get_statistics(
        &self,
        range: Option<(chrono::NaiveDateTime, chrono::NaiveDateTime)>,
        category: Option<i64>,
    ) -> Result<StatisticsAggregate, sqlx::Error> {
        let mut task_query =
            String::from("SELECT CAST(COUNT(ID) AS SIGNED) FROM tasks WHERE deleted = 0");
        if range.is_some() {
            task_query.push_str(" AND due >= ? AND due < ?");
        }
        if category.is_some() {
            task_query.push_str(" AND category = ?");
        }
        let mut count_query = sqlx::query_scalar::<_, i64>(&task_query);
        if let Some((start, end)) = range {
            count_query = count_query.bind(start).bind(end);
        }
        if let Some(category) = category {
            count_query = count_query.bind(category);
        }
        let tasks_created = count_query.fetch_one(&self.pool).await?;

        let mut tracked_query = String::from(
            "SELECT CAST(COALESCE(SUM(TIMESTAMPDIFF(SECOND, h.start_time, \
             COALESCE(h.stop_time, CURRENT_TIMESTAMP))), 0)
             AS SIGNED) FROM task_history h JOIN tasks t ON t.ID = h.taskID
             WHERE t.deleted = 0",
        );
        if let Some((start, end)) = range {
            tracked_query.push_str(" AND t.due >= ? AND t.due < ?");
        }
        if let Some(category) = category {
            tracked_query.push_str(" AND t.category = ?");
        }
        let mut tracked = sqlx::query_scalar::<_, i64>(&tracked_query);
        if let Some((start, end)) = range {
            tracked = tracked.bind(start).bind(end);
        }
        if let Some(category) = category {
            tracked = tracked.bind(category);
        }
        let tracked_seconds = tracked.fetch_one(&self.pool).await?;

        Ok(StatisticsAggregate {
            tasks_created,
            tracked_seconds,
        })
    }

    pub async fn get_sleep_statistics(
        &self,
        range: Option<(chrono::NaiveDateTime, chrono::NaiveDateTime)>,
    ) -> Result<StatisticsSleep, sqlx::Error> {
        match range {
            Some((start, end)) => {
                sqlx::query_as(
                    "SELECT CAST(COUNT(ID) AS SIGNED) AS sessions,
                        CAST(COALESCE(SUM(TIMESTAMPDIFF(
                            SECOND,
                            GREATEST(start_time, ?),
                            LEAST(COALESCE(stop_time, CURRENT_TIMESTAMP), ?)
                        )), 0) AS SIGNED) AS seconds
                 FROM sleep_history
                 WHERE start_time < ? AND (stop_time IS NULL OR stop_time > ?)",
                )
                .bind(start)
                .bind(end)
                .bind(end)
                .bind(start)
                .fetch_one(&self.pool)
                .await
            }
            None => {
                sqlx::query_as(
                    "SELECT CAST(COUNT(ID) AS SIGNED) AS sessions,
                        CAST(COALESCE(SUM(TIMESTAMPDIFF(
                            SECOND,
                            start_time,
                            COALESCE(stop_time, CURRENT_TIMESTAMP)
                        )), 0) AS SIGNED) AS seconds
                 FROM sleep_history",
                )
                .fetch_one(&self.pool)
                .await
            }
        }
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

    pub async fn get_active_task(&self) -> Result<std::option::Option<i32>, sqlx::Error> {
        let query = "SELECT taskID FROM `task_history` WHERE stop_time IS NULL ORDER BY start_time DESC LIMIT 1";
        sqlx::query_scalar::<_, i32>(query)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn start_task_by_name(&self, name: String, category: i64) -> Result<(), sqlx::Error> {
        let query = "";
        Ok(())
    }

    pub async fn create_task(
        &self,
        name: &str,
        description: &str,
        due: chrono::NaiveDate,
        due_time: Option<chrono::NaiveTime>,
        duration: Option<chrono::NaiveTime>,
        priority: i64,
        category: i64,
        location: &str,
    ) -> Result<i64, sqlx::Error> {
        let result = sqlx::query(
            "INSERT INTO tasks
                (Name, description, due, due_time, duration, priority, category, location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(name)
        .bind(description)
        .bind(due)
        .bind(due_time)
        .bind(duration)
        .bind(priority)
        .bind(category)
        .bind(location)
        .execute(&self.pool)
        .await?;

        Ok(result.last_insert_id() as i64)
    }
}
