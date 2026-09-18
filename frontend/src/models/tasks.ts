export interface TaskResponse {
    id: number
    done_timestamp: string | null
    title: string
    description: string
    due_date: string
    due_time: string | null
    day_of_week: number
    duration: string | null
    duration_in_hours: number | null
    priority: number
    difficulty: number
    color: string
    category: number
    location: string
    stats: TaskStats
}

export interface TaskStats {
    days_left: number
    time_spent: number
    active_start_time: string | null
}