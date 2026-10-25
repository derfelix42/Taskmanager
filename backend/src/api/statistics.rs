use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use chrono::{Datelike, Duration, Months, NaiveDate, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::database::{Db, StatisticsAggregate, StatisticsSleep};

#[derive(Deserialize)]
pub struct StatisticsQuery {
    timeframe: Option<String>,
    offset: Option<i32>,
}

#[derive(Serialize)]
pub struct StatisticsValue {
    pub tasks_created: i64,
    pub tracked_hours: f64,
}

#[derive(Serialize)]
pub struct StatisticsCategory {
    pub color: String,
    pub name: String,
    pub tasks_created: i64,
    pub tracked_hours: f64,
    pub share: f64,
}

#[derive(Serialize)]
pub struct StatisticsResponse {
    pub overall: StatisticsValue,
    pub this_year: StatisticsValue,
    pub last_year: StatisticsValue,
    pub timeframe: TimeframeStatistics,
}

#[derive(Serialize)]
pub struct TimeframeStatistics {
    pub info: TimeframeInfo,
    pub overall: StatisticsValue,
    pub sleep: SleepStatistics,
    pub categories: Vec<StatisticsCategory>,
}

#[derive(Serialize)]
pub struct TimeframeInfo {
    pub timeframe: String,
    pub offset: i32,
}

#[derive(Serialize)]
pub struct SleepStatistics {
    pub sessions: i64,
    pub hours: f64,
}

#[derive(Clone, Copy)]
pub(crate) struct DateRange {
    start: NaiveDateTime,
    end: NaiveDateTime,
}

pub fn statistics_router() -> Router<Db> {
    Router::new().route("/", get(get_statistics))
}

async fn get_statistics(
    State(database): State<Db>,
    Query(query): Query<StatisticsQuery>,
) -> Result<Json<StatisticsResponse>, StatusCode> {
    let overall_requested = query.timeframe.is_none() && query.offset.is_none();
    let timeframe = query
        .timeframe
        .unwrap_or_else(|| "WEEK".to_string())
        .to_uppercase();
    let offset = query.offset.unwrap_or(0);
    let timeframe_range = if overall_requested {
        None
    } else {
        Some(date_range(&timeframe, offset).ok_or(StatusCode::BAD_REQUEST)?)
    };

    let today = Utc::now().date_naive();
    let this_year = year_range(today.year());
    let last_year = year_range(today.year() - 1);

    let overall = database
        .get_statistics(None, None)
        .await
        .map_err(database_error)?;
    let this_year_stats = database
        .get_statistics(Some((this_year.start, this_year.end)), None)
        .await
        .map_err(database_error)?;
    let last_year_stats = database
        .get_statistics(Some((last_year.start, last_year.end)), None)
        .await
        .map_err(database_error)?;
    let timeframe_stats = database
        .get_statistics(timeframe_range.map(|range| (range.start, range.end)), None)
        .await
        .map_err(database_error)?;
    let sleep = database
        .get_sleep_statistics(timeframe_range.map(|range| (range.start, range.end)))
        .await
        .map_err(database_error)?;
    let categories = database.get_categories().await.map_err(database_error)?;

    let total_seconds = timeframe_stats.tracked_seconds as f64;
    let mut category_stats = Vec::with_capacity(categories.len());
    for category in categories {
        let stats = database
            .get_statistics(
                timeframe_range.map(|range| (range.start, range.end)),
                Some(category.ID),
            )
            .await
            .map_err(database_error)?;
        category_stats.push(StatisticsCategory {
            color: category.color.unwrap_or_else(|| "777".to_string()),
            name: category.Bezeichnung,
            tasks_created: stats.tasks_created,
            tracked_hours: hours(stats.tracked_seconds),
            share: if total_seconds > 0.0 {
                stats.tracked_seconds as f64 / total_seconds
            } else {
                0.0
            },
        });
    }

    Ok(Json(StatisticsResponse {
        overall: value(overall),
        this_year: value(this_year_stats),
        last_year: value(last_year_stats),
        timeframe: TimeframeStatistics {
            info: TimeframeInfo {
                timeframe: if overall_requested {
                    "OVERALL".to_string()
                } else {
                    timeframe
                },
                offset,
            },
            overall: value(timeframe_stats),
            sleep: sleep_value(sleep),
            categories: category_stats,
        },
    }))
}

fn database_error(error: sqlx::Error) -> StatusCode {
    tracing::error!(%error, "Could not load statistics");
    StatusCode::INTERNAL_SERVER_ERROR
}

fn value(stats: StatisticsAggregate) -> StatisticsValue {
    StatisticsValue {
        tasks_created: stats.tasks_created,
        tracked_hours: hours(stats.tracked_seconds),
    }
}

fn sleep_value(stats: StatisticsSleep) -> SleepStatistics {
    SleepStatistics {
        sessions: stats.sessions,
        hours: hours(stats.seconds),
    }
}

fn hours(seconds: i64) -> f64 {
    seconds as f64 / 3600.0
}

fn date_range(timeframe: &str, offset: i32) -> Option<DateRange> {
    let today = Utc::now().date_naive();
    let start = match timeframe {
        "DAY" => today.checked_add_signed(Duration::days(i64::from(offset)))?,
        "WEEK" => {
            let monday = today - Duration::days(i64::from(today.weekday().num_days_from_monday()));
            monday.checked_add_signed(Duration::weeks(i64::from(offset)))?
        }
        "MONTH" => shift_month(first_of_month(today), offset)?,
        "YEAR" => NaiveDate::from_ymd_opt(today.year().checked_add(offset)?, 1, 1)?,
        _ => return None,
    };
    let end = match timeframe {
        "DAY" => start.checked_add_signed(Duration::days(1))?,
        "WEEK" => start.checked_add_signed(Duration::weeks(1))?,
        "MONTH" => start.checked_add_months(Months::new(1))?,
        "YEAR" => start.checked_add_months(Months::new(12))?,
        _ => return None,
    };
    Some(DateRange {
        start: start.and_hms_opt(0, 0, 0)?,
        end: end.and_hms_opt(0, 0, 0)?,
    })
}

fn first_of_month(date: NaiveDate) -> NaiveDate {
    NaiveDate::from_ymd_opt(date.year(), date.month(), 1).expect("valid month start")
}

fn shift_month(date: NaiveDate, offset: i32) -> Option<NaiveDate> {
    let month_index = date
        .year()
        .checked_mul(12)?
        .checked_add(i32::try_from(date.month0()).ok()?)?
        .checked_add(offset)?;
    let year = month_index.div_euclid(12);
    let month = u32::try_from(month_index.rem_euclid(12))
        .ok()?
        .checked_add(1)?;
    NaiveDate::from_ymd_opt(year, month, 1)
}

fn year_range(year: i32) -> DateRange {
    let start = NaiveDate::from_ymd_opt(year, 1, 1)
        .expect("valid year")
        .and_hms_opt(0, 0, 0)
        .expect("valid midnight");
    let end = NaiveDate::from_ymd_opt(year + 1, 1, 1)
        .expect("valid year")
        .and_hms_opt(0, 0, 0)
        .expect("valid midnight");
    DateRange { start, end }
}
