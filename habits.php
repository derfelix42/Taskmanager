<?php
$currentDate = date('m-Y');
$month = date('m');
$year = date('Y');

function getStartWeekOfMonth($month, $year)
{
    $start = mktime(0, 0, 0, $month, 1, $year);
    $start_week = date('W', $start);
    return $start_week;
}

function getEndWeekOfMonth($month, $year)
{
    $start = mktime(0, 0, 0, $month, 1, $year);
    $end = mktime(0, 0, 0, $month, date('t', $start), $year);
    $end_week = date('W', $end);
    return $end_week;
}

?>

<div class="habit-tracker">
    <h2>Habit Tracker 
        (<?php echo $currentDate; ?>)
    </h2>

    <h3>Daily</h3>
    <?php
    $days_in_month = cal_days_in_month(CAL_GREGORIAN, 10, 2023);
    echo "There were {$days_in_month} days in this month";
    ?>

    <table class="habits">
        <thead>
            <td>Habit</td>
            <?php
            for ($i = 1; $i <= $days_in_month; $i++) {
                echo "<td>".str_pad($i, 2, "0", STR_PAD_LEFT).".</td>";
            }
            ?>
        </thead>
        <tbody>
            <?php
            $sql = 'SELECT habits.ID, habits.name, GROUP_CONCAT(DISTINCT DAYOFMONTH(done)) AS DOM FROM `habits` LEFT JOIN habits_tracker ON habits.ID = habits_tracker.habitID WHERE habits.type = "daily" AND habits.active = 1 GROUP BY habits.ID;';
            $daily_habits =  mysqli_query($db, $sql);

                
            if(mysqli_num_rows($daily_habits)>0) {
                while($row = mysqli_fetch_assoc($daily_habits)) {
                    $id = $row['ID'];
                    $name = $row['name'];
                    $doms = explode(",", $row['DOM']);

                    print("<tr><td>$name</td>");
                    for ($i = 1; $i <= $days_in_month; $i++) {
                        $checked = "";
                        if(in_array($i, $doms)) {
                            $checked = "checked";
                        }
                        print("<td><input type='checkbox' onclick='toggleHabit(event, $id, \"$year-$month-$i\")' $checked></td>");

                    }
                    print("</tr>");
                }
            }
            ?>
        </tbody>
    </table>

    <h3>Weekly</h3>
    <?php
    $start_week = getStartWeekOfMonth($month, $year);
    $end_week = getEndWeekOfMonth($month, $year);

    print("Month includes KW-$start_week until KW-$end_week");
    ?>

    <table class="habits">
        <thead>
            <tr>
                <td>Habit</td>
                <?php 
                for($kw = $start_week; $kw <= $end_week; $kw++) {
                    print("<td>KW-".str_pad($kw, 2, "0", STR_PAD_LEFT)."</td>");
                }
                ?>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Hallo</td>
                <?php 
                for($kw = $start_week; $kw <= $end_week; $kw++) {
                    print('<td><input type="checkbox" name="" id=""></td>');
                }
                ?>
            </tr>
            <tr>
                <td>Welt</td>
                <?php 
                for($kw = $start_week; $kw <= $end_week; $kw++) {
                    print('<td><input type="checkbox" name="" id=""></td>');
                }
                ?>
            </tr>
        </tbody>

    </table>


    <h3>Monthly</h3>
    <table class="habits">
        <thead>
            <tr>
                <td>Habit 1</td>
                <td>Habit 2</td>
                <td>Habit 3</td>
                <td>Habit 4</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><input type="checkbox" name="" id=""></td>
                <td><input type="checkbox" name="" id=""></td>
                <td><input type="checkbox" name="" id=""></td>
                <td><input type="checkbox" name="" id=""></td>
            </tr>
        </tbody>
    </table>
</div>