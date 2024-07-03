<h2>Statistics</h2>

<?php

function getCategories() {
    global $db;
    $sql = "SELECT ID, Bezeichnung, color FROM `category` WHERE display = 1;";
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
    
    $sql = "SELECT SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIMESTAMP))) as overall_time FROM `task_history` JOIN tasks ON tasks.ID = task_history.taskID $where;";
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


<h3 class="stats">Overall per Category:</h3>
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
                <?php $data = getStats($category['ID']); ?>
                <p>Number of Tasks created:  <?php echo $data[0]; ?></p>
                <p>Tracked hours: <?php echo $data[1]; ?></p>
            </div>
        </div>

    <?php
    }
    ?>

</section>

