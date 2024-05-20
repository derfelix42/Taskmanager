<?php
if($_SERVER['DOCUMENT_ROOT'] == "") {
    $_SERVER['DOCUMENT_ROOT'] = "/var/www/html";
}
echo "Taskmanager CronJobs - ".date("Y-m-d H:i:s")."\nExecuting in: ".$_SERVER['DOCUMENT_ROOT']."\n";


$globals["database_name"] = "j_tasks";

require_once("includes/db_connection.php");
$db = $globals['db'];
include_once($_SERVER['DOCUMENT_ROOT']."/cronjobs.php");

echo $cronlog;

echo "\n###\n\nBackups:\n";

include_once($_SERVER['DOCUMENT_ROOT']."/export.php");



echo "\n\n####################################################\n\n";
?>