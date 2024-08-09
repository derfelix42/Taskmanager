<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$body = json_decode(file_get_contents('php://input'));

$db = $globals['db'];
$sql = "";

/* Create new Habit */
if (isset($_GET['create'])) {
  $sql = "INSERT INTO `habits` (`ID`, `name`, `type`, `created`, `active`) VALUES (NULL, '', 'daily', current_timestamp(), '1');";
  mysqli_query($db, $sql);
  $res = mysqli_query($db, "SELECT LAST_INSERT_ID() as ID;");
  $row = mysqli_fetch_assoc($res);
  header('Content-Type: application/json');
  print '{"status": "done", "sql": "' . $sql . '", "ID": ' . $row['ID'] . '}';

/* Delete a habit */
} else if (isset($_GET['delete'])) {
  $ID = $_GET["delete"];
  $sql = "UPDATE `habits` SET `active` = 0 WHERE ID = $ID";
  mysqli_query($db, $sql);
  header('Content-Type: application/json');
  print '{"status": "done", "sql": "' . $sql . '"}';
  
/* Move a habit to (another) group */
} else if (isset($_GET['move'])) {
  $ID = $_GET["move"];
  $groupID = $_GET["group"];
  // first delete all associations
  $sql = "UPDATE `habit_group_members` SET `deleted` = current_timestamp() WHERE habitID = '$ID' AND deleted IS NULL;";
  // echo $sql."\n";
  mysqli_query($db, $sql);
  
  header('Content-Type: application/json');

  if($groupID != "null") {
    // then insert new association
    $sql = "INSERT INTO `habit_group_members` (`groupID`, `habitID`, `added`, `deleted`) VALUES ('$groupID', '$ID', CURRENT_TIMESTAMP(), NULL);";
    // echo $sql."\n";
    mysqli_query($db, $sql);
    print '{"status": "done", "sql": "' . $sql . '"}';
  } else {
    print '{"status": "done"}';
  
  }


  
/* Mark a habit as done */
} else if (isset($_GET['ID'])) {

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

/* Update habit name */
} else if (isset($_GET['updateName'])) {
  $habitID = $_GET['updateName'];
  $name = $body->name;

  $sql = "UPDATE `habits` SET `name`='$name' WHERE ID = $habitID";
  mysqli_query($db, $sql);
  header('Content-Type: application/json');
  print '{"status": "done", "sql": "' . $sql . '"}';

/* Create new group */
} else if (isset($_GET['createGroup'])) {
  $newName = $body->newGroupName;
  $sql = "INSERT INTO `habit_groups` (`ID`, `name`, `created`, `deleted`) VALUES (NULL, '$newName', current_timestamp(), '0');";
  mysqli_query($db, $sql);
  $res = mysqli_query($db, "SELECT LAST_INSERT_ID() as ID;");
  $row = mysqli_fetch_assoc($res);
  header('Content-Type: application/json');
  print '{"status": "done", "sql": "' . $sql . '", "ID": ' . $row['ID'] . '}';

/* Delete group */
} else if (isset($_GET['deleteGroup'])) {
  $ID = $_GET["deleteGroup"];
  $sql = "UPDATE `habit_groups` SET `deleted` = 1 WHERE ID = $ID";
  mysqli_query($db, $sql);
  header('Content-Type: application/json');
  print '{"status": "done", "sql": "' . $sql . '"}';

/* Rename group */
} else if (isset($_GET['renameGroup'])) {

  $groupID = $_GET['renameGroup'];
  $new_name = $body->name;

  $sql = "UPDATE `habit_groups` SET `name`='$new_name' WHERE ID = $groupID";
  mysqli_query($db, $sql);
  header('Content-Type: application/json');
  print '{"status": "done", "sql": "' . $sql . '"}';

/* Get all habits and their entries for given month */
} else {
  // result array with list of habits and list of associations
  $habits = array();

  $sql = "SELECT ID, name, created, groupID FROM `habits` LEFT JOIN (SELECT * FROM `habit_group_members` WHERE habit_group_members.deleted IS NULL) as b ON habits.ID = b.habitID WHERE active = 1 and type = 'daily';";
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