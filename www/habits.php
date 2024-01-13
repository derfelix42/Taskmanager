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
        (<em id="habits_curr_date"></em>)
    </h2>

    <a id="habits_prev_month" class="clickable">prev</a> <a id="habits_next_month" class="clickable">next</a>

    <h3>Daily</h3>

    <table id="habits_table_daily" class="habits">
    </table>

    <!-- <h3>Weekly</h3> -->
    <?php
    // $start_week = getStartWeekOfMonth($month, $year);
    // $end_week = getEndWeekOfMonth($month, $year);

    // print("Month includes KW-$start_week until KW-$end_week");
    ?>

    <!-- <table class="habits">
        <thead>
            <tr>
                <td>Habit</td>
                <?php 
                // for($kw = $start_week; $kw <= $end_week; $kw++) {
                //     print("<td>KW-".str_pad($kw, 2, "0", STR_PAD_LEFT)."</td>");
                // }
                ?>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Hallo</td>
                <?php 
                // for($kw = $start_week; $kw <= $end_week; $kw++) {
                //     print('<td><input type="checkbox" name="" id=""></td>');
                // }
                ?>
            </tr>
            <tr>
                <td>Welt</td>
                <?php 
                // for($kw = $start_week; $kw <= $end_week; $kw++) {
                //     print('<td><input type="checkbox" name="" id=""></td>');
                // }
                ?>
            </tr>
        </tbody>

    </table> -->


    <!-- <h3>Monthly</h3>
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
    </table> -->
</div>