<?php
  function format_size($size){
    $units = ["", "KB", "MB", "GB"];
    $mod = 1024;

    for ($i = 0; $size > $mod; $i++) {
      $size /= $mod;
    }

    $endIndex = strpos($size, ".") + 3;
    return substr($size, 0, $endIndex) . ' ' . $units[$i];
  }
?>

<div class="settings">
  <?php
  if(isset($_GET['cron-disable'])) {
    $cron_disable = $_GET['cron-disable'];
    $sql = "UPDATE `cron-jobs` SET enabled = 0 WHERE ID = ".$cron_disable;
    $execute = mysqli_query($db, $sql);
  }
  if(isset($_GET['cron-enable'])) {
    $cron_enable = $_GET['cron-enable'];
    $sql = "UPDATE `cron-jobs` SET enabled = 1 WHERE ID = ".$cron_enable;
    $execute = mysqli_query($db, $sql);
  }
  ?>
  <h2>Settings</h2>

  <h3>Tasks created by Cron</h3>

  <?php
  $sql = "SELECT * FROM `cron-jobs`";
  $crons = mysqli_query($db, $sql);

  if(mysqli_num_rows($crons)>0) {
    while($row = mysqli_fetch_assoc($crons)) {
      $cron_id = $row['ID'];
      $cron_enabled = $row['enabled'];
      $cron_time = $row['time'];
      $cron_description = $row['description'];
      $cron_action = $row['action'];
      $cron_last_executed = $row['last_executed'];

      $checkbox_checked = $cron_enabled ? "checked" : "";
      $cron_last_executed_string = $cron_last_executed == "" ? "never" : $cron_last_executed;

      $cron_en_disable = $cron_enabled ? "cron-disable=".$cron_id : "cron-enable=".$cron_id;

      echo '
      <div class="cron-row">
        <input type="checkbox" name="" value="" '.$checkbox_checked.' onclick="window.location.href = \'?settings&'.$cron_en_disable.'\';">
        <code>'.$cron_time.'</code>
        <p>'.$cron_description.' ('.$cron_last_executed_string.')</p>
      </div>
      ';

    }
  }
  ?>
  <br>
  <br>
  <h3>Cron-Log:</h3>
  <pre><?php echo $cronlog; ?></pre>

  <br>
  <br>

  <h2>Backups</h2>

  > <a href="export.php?download" target="_blank" rel="noopener noreferrer">Create and download</a><br>

  <br><br>
  <?php 
  $dir = scandir("backups/", SCANDIR_SORT_DESCENDING);

  $size = 0;
  foreach ($dir as $key => $value) {
    if($value === '.' || $value === '..') {continue;}
    $filesize = filesize("backups/".$value);
    print "<li><a href='backups/".$value."' target='_blank' rel='noopener noreferrer'>".$value."</a> (".format_size($filesize).")</li>";
    $size += $filesize;
  }
  print "<br>(Space on disk: ".format_size($size).")";
  ?>
</div>
