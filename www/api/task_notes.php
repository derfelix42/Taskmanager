<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

if(isset($_GET['taskID']) && isset($_GET['update'])) {
  $ID = $_GET['taskID'];
  $body = json_decode(file_get_contents('php://input'));

  $text = $body->note;

  $sql = "INSERT INTO `task_notes`(`taskID`, `note`) VALUES ($ID, '$text') ON DUPLICATE KEY UPDATE `note`='$text';";
  $result = mysqli_query($db, $sql);
  print("{'success': true, 'message': 'updated'}");


}  else if(isset($_GET['taskID'])) {
  $ID = $_GET['taskID'];

  $sql = "SELECT * FROM `task_notes` WHERE taskID = $ID ORDER BY created DESC LIMIT 1";
  $result = mysqli_query($db, $sql);
  if($result != null) {
    $row = mysqli_fetch_assoc($result);
  
    print_r(json_encode($row));
  } else {
    print("{'success': false, 'message': 'result form DB was empty', 'sql': '$sql'}");
  }
} else {
  print("{'success': false, 'message': 'field `taskID` is missing'}");

}

?>
