use axum::routing::MethodRouter;

use crate::database::Db;

pub fn sleep_history_router() -> MethodRouter<Db> {
    MethodRouter::new()
}
