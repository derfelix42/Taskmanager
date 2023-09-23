<?php
$servername = "localhost";
$username = "***REMOVED***";
$password = "***REMOVED***";
$database = $globals["database_name"];

$globals['db'] = mysqli_connect($servername, $username, $password, $database);

// $servername = "192.168.2.122";
// $username = "***REMOVED***";
// $password = "***REMOVED***";
// $database = "j_tasks"; #$globals["database_name"];
//
// $globals['db'] = mysqli_connect($servername, $username, $password);


if(!$globals['db']) {
  die("Connection failed: ".mysqli_connect_error());
}
//echo "Connected Successfully!";

?>
