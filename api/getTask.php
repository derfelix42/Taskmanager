<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

if(isset($_GET['getTask'])) {
  $ID = $_GET['getTask'];

  $sql = "SELECT * FROM `tasks` WHERE ID = $ID";
  $result = mysqli_query($db, $sql);
  $row = mysqli_fetch_assoc($result);

  print_r(json_encode($row));
}

?>
