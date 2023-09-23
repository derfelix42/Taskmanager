<?php
$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];


if(isset($_GET['category'])) {
  $category = $_GET['category'];
  $sql = "SELECT SUBSTRING_INDEX(Name, ' ', 1) AS prefix, COUNT(Name) as counter
    FROM `tasks` 
    WHERE category = $category
        AND done is NULL AND deleted = 0
        AND Name REGEXP '^\\\\['
    GROUP BY prefix;";

  $result = mysqli_query($db, $sql);


  $rows = array();
  while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
  }

  header('Content-Type: application/json');

  print json_encode(["sql" => $sql, "data" => $rows]);
}

?>