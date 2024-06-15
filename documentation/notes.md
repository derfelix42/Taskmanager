# Notes
Here are some random notes for me to remember. This might be of interest for you; it might not be; we'll see ¯\\\_(ツ)\_/¯

## Get Working-Hours on Taskmanager
To see how many hours I have spent on this project, I can use the following MySQL command. I use the result to regularly update the badge in the main README.md. This is not perfectly accurate, as I added time tracking only far later compared to the task management, so there are most probably 10s of hours of work missing (the first time-tracked task is `2021-04-12`, but this project was started on `2019-08-05`)
```SQL
SELECT SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP)))) AS time_spent FROM `tasks` RIGHT JOIN task_history on tasks.ID = task_history.taskID WHERE tasks.Name LIKE "%taskmanager%";
```