<h2>Statistics</h2>

<?php
$get_timeframe = "";
$get_offset = "";

if(isset($_GET['timeframe'])) {
    $get_timeframe = $_GET['timeframe'];

    if(isset($_GET['offset'])) {
        $get_offset = $_GET['offset'];
    }
}

function getCategories() {
    global $db;
    $sql = "SELECT ID, Bezeichnung, color FROM `category`;";
    $res = mysqli_query($db, $sql);
    // If there are no categories, return an empty array
    if(mysqli_num_rows($res) == 0) {
        return [];
    } else {
        $categories = [];
        while($row = mysqli_fetch_array($res)) {
            $categories[$row["ID"]] = $row;
        }
        return $categories;
    }
}

function getStats($category="", $timeframe=NULL, $offset=NULL) {
    global $db;
    $where = "";
    $cat_sel = "";
    $time_sel_ids = "";
    $time_sel_time_tracked = "";

    if($timeframe != NULL) {
        $week_day = "";
        if($timeframe == "WEEK") {
            $week_day = ",7";
        }
        $time_sel_time_tracked = "$timeframe(due$week_day) = $timeframe(CURRENT_DATE$week_day)$offset";
        if($timeframe == "WEEK" || $timeframe == "MONTH") {
            // TODO: New Year Overwrap makes things go kaboom!
            $time_sel_time_tracked .= " AND YEAR(due) = YEAR(CURRENT_DATE)";
        }
    }

    if($category != "") {
        $cat_sel = "category = '$category'";
    }
    // $time_sel_ids = "";

    if($cat_sel != "" && $time_sel_ids == "") {
        $where = "WHERE $cat_sel";
    }
    if($time_sel_time_tracked != "" && $where != "") {
        $where .= " AND ".$time_sel_time_tracked;
    }
    if($time_sel_time_tracked != "" && $where == "") {
        $where = "WHERE ".$time_sel_time_tracked;
    }
    $sql = "SELECT COUNT(ID) AS num_ids FROM `tasks` $where";
    // echo $sql;
    $res = mysqli_query($db, $sql);
    $max_id = mysqli_fetch_array($res)["num_ids"];
    
    $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as overall_time FROM `task_history` JOIN tasks ON tasks.ID = task_history.taskID $where;";
    $res = mysqli_query($db, $sql);
    $overall_time = mysqli_fetch_array($res)["overall_time"];
    
    $seconds = str_pad($overall_time % 60, 2, "0", STR_PAD_LEFT);
    $minutes = str_pad(floor($overall_time / 60) % 60, 2, "0", STR_PAD_LEFT);
    $hours = str_pad(floor($overall_time / 60 / 60), 2, "0", STR_PAD_LEFT);
    $time_string = "-";
    if($seconds > 0) {
        $time_string = "$seconds seconds";
    }
    if($minutes > 0) {
        $time_string = "$minutes minutes, $time_string";
    }
    if($hours > 0) {
        $time_string = "$hours hours, $time_string";
    }

    // $days = floor($overall_time / 60 / 60 / 24);
    return [$max_id, $time_string, $overall_time];
}
?>
<section class="statistics">
    <div class="wide">
        <header style='--color: #111'>Instance Statistics</header>
        <main>
            <section>
                <h3>Overall</h3>
                <?php $data = getStats(); ?>
                <p>Number of Tasks created: <?php echo $data[0]; ?></p>
                <p>Tracked hours: <?php echo $data[1]; ?></p>
            </section>

            <section>
                <h3>This Year</h3>
                <?php $data = getStats("", "YEAR"); ?>
                <p>Number of Tasks created: <?php echo $data[0]; ?></p>
                <p>Tracked hours: <?php echo $data[1]; ?></p>
            </section>

            <section>
                <h3>Last Year</h3>
                <?php $data = getStats("", "YEAR", "-1"); ?>
                <p>Number of Tasks created: <?php echo $data[0]; ?></p>
                <p>Tracked hours: <?php echo $data[1]; ?></p>
            </section>

        </main>
    </div>
</section>

<h3 class="stats">Statistics per Category:</h3>
<nav class="statistics">
    <a href="?statistics">Overall</a>
    <a href="?statistics&timeframe=WEEK">This Week</a>
    <a href="?statistics&timeframe=WEEK&offset=-1">Last Week</a>
    <a href="?statistics&timeframe=MONTH">This Month</a>
    <a href="?statistics&timeframe=MONTH&offset=-1">Last Month</a>
</nav>

<section class="statistics">
    <div class="wide">
        <header style='--color: #111'>Statistics</header>
        <main>
            <section>
                <h3>Overall</h3>
                <?php $sum_data = getStats("", $get_timeframe, $get_offset); ?>
                <p>Number of Tasks created: <?php echo $sum_data[0]; ?></p>
                <p>Tracked hours: <?php echo $sum_data[1]; ?></p>
            </section>

            <!-- <section>
                <h3>???</h3>
                <?php // $data = getStats("", "YEAR"); ?>
                <p>Number of Tasks created: <?php echo $data[0]; ?></p>
                <p>Tracked hours: <?php echo $data[1]; ?></p>
            </section>

            <section>
                <h3>???</h3>
                <?php //$data = getStats("", "YEAR", "-1"); ?>
                <p>Number of Tasks created: <?php echo $data[0]; ?></p>
                <p>Tracked hours: <?php echo $data[1]; ?></p>
            </section> -->

        </main>
    </div>
</section>

<section class="statistics week_stats">
    <?php 
    $categories = getCategories();
    foreach($categories as $category) {
        $data = getStats($category["ID"]);

        if($category['color'] == NULL) {
            $category['color'] = "777";
        }

    ?>

        <div class="panel">
            <header><div class='categoryIndicator' style='--color: #<?php echo $category['color']; ?>'></div><?php echo $category['Bezeichnung']; ?></header>
            <div class="main">
                <?php $data = getStats($category['ID'], $get_timeframe, $get_offset); ?>
                <p>Number of Tasks created:  <?php echo $data[0]; ?></p>
                <p>
                    Tracked hours: <?php echo $data[1]; ?>
                    <?php 
                        if($data[2] > 0) { echo "(".number_format(((floatval($data[2]) / floatval($sum_data[2])*100)),1,',','')."%)"; } 
                    ?>
                </p>
            </div>
        </div>

    <?php
    }
    ?>

</section>

