<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


if(isset($_GET['date'])) {
  $date = $_GET['date'];


  $sql = "SELECT tasks.ID, Name, description, due, due_time, DAYOFWEEK(due) AS DOW, duration, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if('$date'>due, 11, priority) as priority, color, DAYOFWEEK(due) as dayofweek, done, time_spent+IFNULL(time_spent_new, 0) as time_spent
            FROM `tasks`
            JOIN category ON tasks.category = category.ID
            LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent_new FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
            WHERE  WEEK(due,1) = WEEK('$date',1)
            ORDER BY due ASC, due_time ASC, priority DESC, category, Name";

            /* History + Future */
  $sql = "(SELECT tasks.ID, location, Name, category, description, DAY(start_time) as due, TIME(start_time) as due_time, DAYOFWEEK(due) AS DOW, duration, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if('$date'>due, 11, priority) as priority, color, DAYOFWEEK(due) as dayofweek, done, TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP)) as time_spent
            FROM `task_history`
            JOIN tasks on taskID = tasks.ID
            JOIN category ON tasks.category = category.ID
            WHERE WEEK(start_time,1) = WEEK('$date',1) AND YEAR(start_time) = YEAR('$date') AND deleted = 0
            ORDER BY due ASC, due_time ASC, priority DESC, category, Name)
          UNION
          (SELECT tasks.ID, location, Name, category, description, due, IF(due=CURRENT_DATE, IF(due_time < CURRENT_TIME AND due_time+duration >CURRENT_TIME, CURRENT_TIME, due_time), due_time) as due_time,
              DAYOFWEEK(due) AS DOW, IF(due=CURRENT_DATE, IF(due_time < CURRENT_TIME AND due_time+duration >CURRENT_TIME, SUBTIME(duration, SUBTIME(CURRENT_TIME, due_time)) , duration), duration) as duration, TIMESTAMPDIFF(DAY, NOW(), due) AS daysLeft, if(CURRENT_DATE>due, 11, priority) as priority, color, DAYOFWEEK(due) as dayofweek, done, 0 as time_spent
            FROM `tasks`
            JOIN category ON tasks.category = category.ID
            LEFT JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as time_spent_new FROM `task_history` GROUP BY taskID) as b ON tasks.ID = b.taskID
            WHERE  (WEEK(due,1) = WEEK('$date',1)) AND YEAR(due) = YEAR('$date') AND ((due > CURRENT_DATE) OR (due = CURRENT_DATE AND due_time+duration > CURRENT_TIME)) AND deleted = 0 AND done IS NULL
            ORDER BY due ASC, due_time ASC, priority DESC, category, Name)";
  $result = mysqli_query($db, $sql);


  $rows = array();
  while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
  }

  header('Content-Type: application/json');

  print json_encode($rows);
}




?>
