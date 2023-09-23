<?php

$globals["database_name"] = "j_tasks";
require_once("../includes/db_connection.php");

$db = $globals['db'];

// $sql = "SELECT * FROM `category`";
$sql = "SELECT category.ID, Bezeichnung, color, display, GROUP_CONCAT(b.prefix SEPARATOR ',') as prefixes FROM `category` LEFT JOIN (SELECT category as ID, SUBSTRING_INDEX(Name, ' ', 1) AS prefix, COUNT(Name) as counter FROM `tasks` WHERE done is NULL AND deleted = 0 AND Name REGEXP '^\\\\[' GROUP BY category, prefix HAVING counter > 1) AS b ON category.ID = b.ID GROUP BY category.ID;";
$result = mysqli_query($db, $sql);

$rows = array();
while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}

header('Content-Type: application/json');

print json_encode($rows);
?>
