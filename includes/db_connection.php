<?php
include('credentials.php');
$servername = "localhost";
$database = $globals["database_name"];

$globals['db'] = mysqli_connect($servername, $username, $password, $database);

if(!$globals['db']) {
  die("Connection failed: ".mysqli_connect_error());
}
//echo "Connected Successfully!";

?>
