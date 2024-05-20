<?php

$globals["database_name"] = "j_tasks";
require_once("includes/db_connection.php");

$db = $globals['db'];

if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"]) ||
    (basename(__FILE__) != basename($_SERVER["SCRIPT_FILENAME"]) && 
    count(glob($_SERVER['DOCUMENT_ROOT']."/backups/taskmanager_export-".(new DateTime())->format('Y-m-d_')."*.json")) == 0)
) {

    // Get Categories
    $sql = "SELECT * FROM `category`";
    $result = mysqli_query($db, $sql);

    $categories = array();
    while($r = mysqli_fetch_assoc($result)) {
        $categories[] = $r;
    }

    // Get Wakeup times
    $sql = "SELECT * FROM `wakeup_times`";
    $result = mysqli_query($db, $sql);

    $wakeup_times = array();
    while($r = mysqli_fetch_assoc($result)) {
        $wakeup_times[] = $r;
    }

    // Get Cron-jobs
    $sql = "SELECT * FROM `cron-jobs`";
    $result = mysqli_query($db, $sql);

    $cron_jobs = array();
    while($r = mysqli_fetch_assoc($result)) {
        $cron_jobs[] = $r;
    }

    // $sql = 'SELECT taskID, JSON_ARRAYAGG(JSON_EXTRACT(JSON_OBJECT("start", start_time, "stop", stop_time), "$")) as history FROM `task_history` GROUP BY taskID;';
    $sql = 'SELECT tasks.*, JSON_ARRAYAGG(JSON_EXTRACT(JSON_OBJECT("start", start_time, "stop", stop_time), "$")) AS history
            FROM `tasks` LEFT JOIN `task_history` ON tasks.ID = task_history.taskID
            GROUP BY tasks.ID;';
    $result = mysqli_query($db, $sql);

    $tasks = array();
    while($r = mysqli_fetch_assoc($result)) {
        $r["history"] = json_decode($r["history"]);
        $tasks[] = $r;
    }


    $data["categories"] = $categories;
    $data["wakeup_times"] = $wakeup_times;
    $data["cron_jobs"] = $cron_jobs;
    $data["tasks"] = $tasks;

    $date = new DateTime();
    $date_str = $date->format('Y-m-d_H-i-s');

    if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {

        if(isset($_GET["download"])) {
            header('Content-disposition: attachment; filename=taskmanager_export-'.$date_str.'.json');
            header('Content-Type: application/json');
            
            print json_encode($data);

        } else {
            $path = $_SERVER['DOCUMENT_ROOT']."/backups/taskmanager_export-".$date_str.".json";
            $backup = fopen($path, "w") or die("Unable to open file!");
            fwrite($backup, json_encode($data));
            fclose($backup);
    
            header('Content-Type: application/json');
            print "{'msg': 'success!', 'file': " . "taskmanager_export-" . $date_str . ".json, 'path': '" .$_SERVER['DOCUMENT_ROOT']."/Taskmanager/backups/taskmanager_export-" . $date_str . ".json" . "'}";
        }

    } else {
        $path = $_SERVER['DOCUMENT_ROOT']."/backups/taskmanager_export-".$date_str.".json";
        $backup = fopen($path, "w") or die("Unable to open file!");
        fwrite($backup, json_encode($data));
        fclose($backup);

    }

    echo "Created backup ".$path;
} else {
    echo "No new backup needed!";
}
?>