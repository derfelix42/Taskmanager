<?php
include('credentials.php');
$servername = "mariadb";
$database = "j_tasks";

$globals['db'] = mysqli_connect($servername, $username, $password, $database);

if(!$globals['db']) {
  die("Connection failed: ".mysqli_connect_error());
}
?>
