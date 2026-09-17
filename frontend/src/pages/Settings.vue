<script setup lang="ts">

function format_size(size: number) {
    const units = ["", "KB", "MB", "GB"];
    const mod = 1024;

    let i: number;
    for(i = 0; size > mod; i+=1) {
        size /= mod;
    }

    return size.toPrecision(1) + " " + units[i];    
}

function enableCron(cronID: number) {
    // make API call to enable Cron:
    // "UPDATE `cron-jobs` SET enabled = 1 WHERE ID = ".$cron_enable;
}

function disableCron(cronID: number) {
    // make API call to disable Cron:
    // "UPDATE `cron-jobs` SET enabled = 0 WHERE ID = ".$cron_disable;
}

function getCronJobs() {
  // "SELECT * FROM `cron-jobs`"
}

function getCronLogs() {
  return "All good!"
}

let cron_jobs = [
  {id: 0, enabled: false, time: "* * * */12 *", description: "Test Job", action: "action", last_executed: "last_executed", }
]

</script>

<template>
<div class="settings">
  <h2>Settings (non-functioning!)</h2>

  <h3>Tasks created by Cron</h3>

  <div class="cron-row" v-for="job in cron_jobs" :key="job.id">
    <input type="checkbox" name="" :value="job.enabled" :onclick="disableCron(job.id)">
    <code> {{ job.time }}</code>
    <p>{{ job.description }} ({{ job.last_executed }})</p>
  </div>

  <br>
  <br>
  <h3>Cron-Log:</h3>
  <pre>{{ getCronLogs() }}</pre>

  <br>
  <br>

  <h2>Backups</h2>

  > <a href="export.php?download" target="_blank" rel="noopener noreferrer">Create and download</a><br>

  <br><br>
  <!-- <?php 
  $dir = scandir("backups/", SCANDIR_SORT_DESCENDING);

  $size = 0;
  foreach ($dir as $key => $value) {
    if($value === '.' || $value === '..') {continue;}
    $filesize = filesize("backups/".$value);
    print "<li><a href='backups/".$value."' target='_blank' rel='noopener noreferrer'>".$value."</a> (".format_size($filesize).")</li>";
    $size += $filesize;
  }
  print "<br>(Space on disk: ".format_size($size).")";
  ?> -->
</div>


</template>

<style>
.settings {
  padding: 0.5em;
}

.cron-row {
  display: flex;
  height: 2.2em;
}

.cron-row input {
  width: auto;
  height: 2.2em;
  width: 1.2em;
  margin: 0em 0.5em 0em 0.5em;
}

.cron-row p {
  line-height: 2.2em;
  margin-left: 0.5em;
}

</style>