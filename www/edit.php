<?php

$globals["database_name"] = "j_tasks";
require_once("includes/db_connection.php");

$db = $globals['db'];

$ID = -1;
if(isset($_GET['ID'])) {
  $ID = $_GET['ID'];
}

$sql = "SELECT * FROM `tasks` WHERE ID = $ID";
$result = mysqli_query($db, $sql);
$row = mysqli_fetch_assoc($result);

$name = $row['Name'];
$description = $row['description'];
$due = $row['due'];
$due_time = $row['due_time'];
$duration = $row['duration'];
$priority = $row['priority'];
$category = $row['category'];

print_r($result);

if(isset($_GET['change'])) {
  $cname = htmlentities($_GET['Name']);
  $cdesc = htmlentities($_POST['Description']);
  $cdue = $_POST['duedate'];
  $cdue_time = $_POST['duetime'];
  $cduration = $_POST['duration'];
  $cpriority = $_POST['priority'];
  $ccategory = $_POST['category'];


  if($name != $cname) {
    echo "different Name!<br>";
    $cname = "SET 'Name' = ".htmlentities($_POST['name']).", ";
  }

  if($description != $cdesc) {
    echo "different Desc!<br>";
    $cdesc = "SET 'description' = ".htmlentities($_POST['Description']).", ";
  }

  if($duedate != $cdue) {
    echo "different duedate!<br>";
    $cdesc = "SET 'description' = '".$_GET['duedate']."' ";
  }

  if($due_time != $cdue_time) {
    echo "different duetime!<br>";
  }

  if($duration != $cduration) {
    echo "different duration!<br>";
  }

  if($priority != $cpriority) {
    echo "different priority!<br>";
  }

  if($category != $ccategory) {
    echo "different category! [".$category.":".$ccategory."]<br>";
  }

  exit();
  // $name = htmlentities($_GET['name']);
  // $duedate = "'".$_GET['duedate']."'";
  // $duetime = (!empty($_GET['duetime']) ? "'".$_GET['duetime']."'": "NULL");
  // $duration = (!empty($_GET['duration']) ? "'".$_GET['duration']."'": "NULL");
  // $priority = $_GET['priority'];
  // $category = $_GET['category'];
  //UPDATE `tasks` SET `Name` = 'Aufstehene' WHERE `tasks`.`ID` = 402;

  $sql = "UPDATE `tasks` $cname $cdesc WHERE `tasks`.`ID` = $ID;";
  echo $sql;
  exit();
  mysqli_query($db, $sql);
  header("Location: tasks.php");
  exit();
}


?>

<h2><?php echo "$name - $ID" ?></h2>
<form action="?change=1" method="post">
  <table>
    <tr>
      <td><label for="Name">Name:</label></td>
      <td><input type="text" name="Name" value="<?php echo $name ?>"></td>
    </tr>
    <tr>
      <td><label for="Description">Description:</label></td>
      <td><textarea name="Description"><?php echo $description ?></textarea></td>
    </tr>
    <tr>
      <td><label for="priority">Priority:</label></td>
      <td><input tpye="number" min="0" max="10" name="priority" placeholder="priority (0-10)" required value="<?php echo $priority ?>"/></td>
    </tr>
    <tr>
      <td><label for="duedate">Due:</label></td>
      <td><input type="date" name="duedate" value="<?php echo $due ?>"></td>
    </tr>
    <tr>
      <td><label for="duetime">DueTime:</label></td>
      <td><input type="time" name="duetime" value="<?php echo $due_time ?>"></td>
    </tr>
    <tr>
      <td><label for="duration">Duration:</label></td>
      <td><input type="time" name="duration" value="<?php echo $duration ?>"></td>
    </tr>
    <tr>
      <td><label for="category">Category:</label></td>
      <td><select name="category">
        <?php
          $sql = "SELECT * FROM `category`";
          $cats = mysqli_query($db, $sql);

          if(mysqli_num_rows($cats)>0) {
            while($row = mysqli_fetch_assoc($cats)) {
              $cat_id = $row['ID'];
              $cat_name = $row['Bezeichnung'];
              $selected = "";
              if($category == $cat_id) {
                $selected = "selected";
              }
              echo "<option value='$cat_id' $selected>$cat_name</option>";
            }
          }

        ?>
        </select></td>
    </tr>
    <tr>
      <td></td><td><input type="submit" value="Save Changes"><button type="button" name="return" onclick="location.href='tasks.php'">Back</button></td>
    </tr>
  </table>

</form>
