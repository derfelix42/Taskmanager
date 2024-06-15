<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


if(isset($_GET['nfcID']) && isset($_GET['deviceID'])) {
  $location = isset($_GET['location']) ? "'".$_GET['location']."'" : "NULL";
  $deviceOwner = isset($_GET['deviceOwner']) ? "'".$_GET['deviceOwner']."'" : "NULL";
  $nfcID = $_GET['nfcID'];
  $deviceID = $_GET['deviceID'];
  $sql = "INSERT INTO `nfcLocations` (`ID`, `timestamp`, `location`, `deviceOwner`, `nfcID`, `deviceID`) VALUES (NULL, CURRENT_TIMESTAMP, $location, $deviceOwner, '$nfcID', '$deviceID');";
  print mysqli_query($db, $sql);
  exit();
}

?>
