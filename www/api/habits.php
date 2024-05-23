<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$body = json_decode(file_get_contents('php://input'));

$db = $globals['db'];
$sql = "";

if (isset($_GET['ID'])) {

  $ID = $_GET['ID'];
  $date = $_GET['date'];

  $sql = "SELECT * FROM habits_tracker WHERE habitID = $ID AND DATE(done) = '$date'";
  $result = mysqli_query($db, $sql);
  if (mysqli_num_rows($result) > 0) {
    // Delete entry
    $sql = "DELETE FROM `habits_tracker` WHERE habitID = $ID AND DATE(done) = '$date'";
  } else {
    // Insert new entry
    $sql = "INSERT INTO `habits_tracker`(`habitID`, `done`) VALUES ('$ID','$date')";
  }
  
  mysqli_query($db, $sql);
  header('Content-Type: application/json');
  
  print '{"status": "done", "sql": "' . $sql . '"}';
} else if (isset($_GET['updateName'])) {
  $habitID = $_GET['updateName'];
  $name = $body->name;

  $sql = "UPDATE `habits` SET `name`='$name' WHERE ID = $habitID";
  mysqli_query($db, $sql);
  header('Content-Type: application/json');
  print '{"status": "done", "sql": "' . $sql . '"}';

} else {
  // result array with list of habits and list of associations
  $habits = array();

  $sql = "SELECT ID, name, created, groupID FROM `habits` LEFT JOIN `habit_group_members` ON habits.ID = habit_group_members.habitID WHERE active = 1 and type = 'daily' and habit_group_members.deleted IS NULL;  ";
  $result = mysqli_query($db, $sql);

  while ($row = mysqli_fetch_assoc($result)) {
    $id = $row['ID'];
    $name = $row['name'];
    $created = $row['created'];
    $groupID = $row['groupID'];
    $habits["habits"][] = array("ID" => $id, "name" => $name, "created" => $created, "groupID" => $groupID);
  }

  $current_month = date('m');
  $current_year = date('Y');

  // update current month and year based on GET
  if (isset($_GET['month'])) {
    $current_month = $_GET['month'];
  }
  if (isset($_GET['year'])) {
    $current_year = $_GET['year'];
  }

  $sql = "SELECT habitID, done, DAY(done) as dom, entered FROM `habits_tracker` WHERE MONTH(done) = $current_month AND YEAR(done) = $current_year;";
  $result = mysqli_query($db, $sql);

  while ($row = mysqli_fetch_assoc($result)) {
    $habitID = $row['habitID'];
    $done = $row['done'];
    $dom = $row['dom'];
    $entered = $row['entered'];
    $habits["entries"][] = array("habitID" => $habitID, "done" => $done, "dom" => $dom, "entered" => $entered);
  }


  $sql = "SELECT ID, name, created FROM `habit_groups` WHERE deleted = 0";
  $result = mysqli_query($db, $sql);

  while ($row = mysqli_fetch_assoc($result)) {
    $id = $row['ID'];
    $name = $row['name'];
    $created = $row['created'];
    $habits["groups"][] = array("ID" => $id, "name" => $name, "created" => $created);
  }


  header('Content-Type: application/json');

  print json_encode($habits);

}



?>