<?php

// ┌───────────── Minute (0 - 59)
// │ ┌───────────── Stunde (0 - 23)
// │ │ ┌───────────── Tag des Monats (1 - 31)
// │ │ │ ┌───────────── Monat (1 - 12)
// │ │ │ │ ┌───────────── Wochentag (0 - 6)
// │ │ │ │ │
// * * * * *  /Pfad/Programmname


function logcron(...$logstring) {
  global $cronlog;
  foreach ($logstring as $s) {
    $cronlog .= $s." ";
  }
  $cronlog .= "\n";
}

function createEntry($id, $time, $actions, $upcoming) {
  $entry = new stdClass();
  $entry->id = $id;
  $entry->time = $time;
  $entry->actions = $actions;
  $entry->upcoming = $upcoming;
  return $entry;
}

function executeCronJob($job) {
  global $db;
  $actions = explode("\n", $job->actions);
  logcron("Execute Job with following actions:");
  foreach($actions as $action) {
    logcron("->",$action);
    mysqli_query($db, $action);
  }
  mysqli_query($db, "UPDATE `cron-jobs` SET next_execution = '".$job->upcoming->format('Y-m-d H:i:s')."' WHERE ID = ".$job->id);
  mysqli_query($db, "UPDATE `cron-jobs` SET last_executed = CURRENT_TIMESTAMP WHERE ID = ".$job->id);
  logcron("-> Updated entry Meta-Data");
}

// Start Cron-Executer
$cronlog = "Start of Cronlog\n";
logcron("Fetching MySQL");
$sql = "SELECT ID, time, action, IFNULL(last_executed, CURRENT_DATE) as last_executed, TIMESTAMPDIFF(DAY, IFNULL(last_executed, CURRENT_DATE), CURRENT_TIMESTAMP) as datediff FROM `cron-jobs` WHERE enabled = 1 AND (next_execution IS NULL OR next_execution < CURRENT_TIMESTAMP)";
$crons = mysqli_query($db, $sql);
logcron("Got ".mysqli_num_rows($crons)." Entries");



$cronentries = [];

if(mysqli_num_rows($crons)>0) {
  while($row = mysqli_fetch_assoc($crons)) {
    $cron_id = $row['ID'];
    $cron_time = $row['time'];
    $cron_action = $row['action'];
    $cron_last_executed = $row['last_executed'];

    $cron_time_pieces = explode(" ", $cron_time);
    $datediff = $row['datediff'];

    logcron(" -> Got: ID",$cron_id,"with Datediff:",$datediff,"|",$cron_time,"last executed at:",$cron_last_executed);

    if ($datediff >= 0) {
      if($cron_time_pieces[4] == "*" and $cron_time_pieces[3] == "*" and $cron_time_pieces[2] == "*") {
        $next_execution = (new DateTime())->setTime(intval($cron_time_pieces[1]),intval($cron_time_pieces[0]));

        $now = new DateTime();
        logcron("    -> Needs to be executed just once today at ",$next_execution->format('Y-m-d H:i:s'));
        if ($now > $next_execution) {
          $upcoming_execution = (new DateTime())->modify('+1 day')->setTime(intval($cron_time_pieces[1]),intval($cron_time_pieces[0]));
          logcron("    -> Needs to be executed right now!");
          array_push($cronentries, createEntry($cron_id, $next_execution, $cron_action, $upcoming_execution));
          logcron("    -> Upcoming Execution at",$upcoming_execution->format('Y-m-d H:i:s'));
        }
      }

    }



  }
}

logcron("");
logcron("Done processing entries");
logcron("");
logcron("The following Tasks need to be executed:");
foreach($cronentries as $entry) {
  //logcron(" ->", $entry->time->format('Y-m-d H:i:s'),$entry->upcoming->format('Y-m-d H:i:s'),$entry->actions);
  executeCronJob($entry);
}
if(empty($cronentries)) {
  logcron(" -> None!");
}

?>
