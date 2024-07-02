<h2>Statistics</h2>

<?php

function getStats($category="", $start=NULL, $stop=NULL) {
    global $db;
    $where = "";
    $cat_sel = "";
    $time_sel_ids = "";
    $time_sel_time_tracked = "";

    if($category != "") {
        $cat_sel = "category = '$category'";
    }
    // $time_sel_ids = "";

    if($cat_sel != "" && $time_sel_ids == "") {
        $where = "WHERE $cat_sel";
    }
    $sql = "SELECT COUNT(ID) AS num_ids FROM `tasks` $where";
    $res = mysqli_query($db, $sql);
    $max_id = mysqli_fetch_array($res)["num_ids"];
    
    $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(CURRENT_TIMESTAMP, stop_time))) as overall_time FROM `task_history`;";
    $res = mysqli_query($db, $sql);
    $overall_time = mysqli_fetch_array($res)["overall_time"];
    
    $seconds = str_pad($overall_time % 60, 2, "0", STR_PAD_LEFT);
    $minutes = str_pad(floor($overall_time / 60) % 60, 2, "0", STR_PAD_LEFT);
    $hours = str_pad(floor($overall_time / 60 / 60) % 24, 2, "0", STR_PAD_LEFT);
    $days = floor($overall_time / 60 / 60 / 24);
    return [$max_id, "$days Tage, $hours:$minutes:$seconds"];
}
?>
<section class="statistics">
    <div class="wide">
        <header style='--color: #111'>Overall Statistics</header>
        <main>
            <?php $data = getStats(); ?>
            <p>Number of Tasks created: <?php echo $data[0]; ?></p>
            <p>Tracked hours: <?php echo $data[1]; ?></p>
        </main>
    </div>
</section>


<h3 class="stats">This week:</h3>
<section class="statistics week_stats">
    <div class="panel">
        <header><div class='categoryIndicator' style='--color: #777'></div>null</header>
        <div class="main">
            <?php $data = getStats(0); ?>
            <p>Number of Tasks created:  <?php echo $data[0]; ?></p>
            <p>Tracked hours: 0:00</p>
        </div>
    </div>
    
    <div class="panel">
        <header><div class='categoryIndicator' style='--color: #e6e200'></div>Uni</header>
        <div class="main">
        <?php $data = getStats(1); ?>
            <p>Number of Tasks created:  <?php echo $data[0]; ?></p>
            <p>Tracked hours: 0:00</p>
        </div>
    </div>
    
    <div class="panel">
        <header><div class='categoryIndicator' style='--color: #6efff0'></div>Sport</header>
        <div class="main">
        <?php $data = getStats(2);?>
            <p>Number of Tasks created:  <?php echo $data[0]; ?></p>
            <p>Tracked hours: 0:00</p>
        </div>
    </div>
    
    <div class="panel">
        <header><div class='categoryIndicator' style='--color: #D41C4D'></div>Wachmann</header>
        <div class="main">
        <?php $data = getStats(3);?>
            <p>Number of Tasks created:  <?php echo $data[0]; ?></p>
            <p>Tracked hours: 0:00</p>
        </div>
    </div>
</section>

