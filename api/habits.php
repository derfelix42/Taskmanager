<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];
$sql = "";

if(isset($_GET['ID'])) {

  $ID = $_GET['ID'];
  $date = $_GET['date'];

  $sql = "SELECT * FROM habits_tracker WHERE habitID = $ID AND DATE(done) = '$date'";
  $result = mysqli_query($db, $sql);
  if(mysqli_num_rows($result)>0) {
    // Delete entry
    $sql = "DELETE FROM `habits_tracker` WHERE habitID = $ID AND DATE(done) = '$date'";
  } else {
    // Insert new entry
    $sql = "INSERT INTO `habits_tracker`(`habitID`, `done`) VALUES ('$ID','$date')";
  }

  mysqli_query($db, $sql);
}



header('Content-Type: application/json');

print '{"status": "done", "sql": "'.$sql.'"}';
?>
