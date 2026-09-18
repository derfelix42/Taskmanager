<script lang="ts" setup>
import { endTaskAPI, getTasksForDate } from '@/api/api';
import { secondsToTimestamp } from '@/helpers';
import type { TaskResponse } from '@/models/tasks';
import { useCurrentDateStore } from '@/stores/currentDateStore';
import { useTasksStore } from '@/stores/tasksStore';
import { storeToRefs } from 'pinia';
import { onMounted, reactive, watch } from 'vue';

const props = defineProps(['title', 'tasks'])

const emit = defineEmits<{
    setTaskDone: [taskId: number]
    openModal: [taskId: number]
}>()


</script>

<template>
    <!-- {{ props.tasks }} -->
    <table>
        <!-- Header -->
        <tr date>
            <td>{{ props.title }}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <!-- <td>$dow - $date_text $time_spent_day_sum_string $difficulty_score_of_day_string</td>
            <td></td>
            <td>$currentTemp $weatherInfo</td>
            <td>🌅 $sunrise</td>
            <td>🌇 $sunset / $sunset_dark</td>
            <td id='daysum_$DueDate'></td>
            <td></td> -->
        </tr>

        <!-- Tasklist -->

        <tr priority='$priority' v-for="task in props.tasks" :key="task.id">
            <td @click="$emit('openModal', task.id)" class='clickable'>
                <div class='categoryIndicator' :style="{ '--color': '#' + task.color }"></div>{{ task.title }}
                {{ task.priority === 10 ? "❗" : "" }}
                {{ task.stats.time_spent !== 0 ? "(" + secondsToTimestamp(task.stats.time_spent, false) + ")" : "" }}
                {{ task.difficulty > 1 ? "[" + task.difficulty + "]" : "" }}
            </td>
            <td @click="$emit('openModal', task.id)" class='clickable'>
                <p class='description'>{{ task.description }}</p>
            </td>
            <td>
                <p id='timeLeft_$ID'>{{ task.stats.days_left }}</p>
            </td>
            <td>{{ task.location }}</td>
            <td>{{ task.due_time }}</td>
            <td>{{ task.duration }}</td>
            <td @click="$emit('setTaskDone', task.id)" class="clickable">&#10004;</td>
        </tr>


        <!-- <?php
      /**

        ADDING CURRENT THE EVENTS

       */
      $weather = getForecast();

      $day = 0;
      $duration_sum = 0;
      $spent_time_daysum = 0;
      if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
          $ID = $row['ID'];
          $name = urldecode($row['Name']);
          $desc = urldecode(str_replace("\n", "<br>", $row['description']));
          $DaysLeft = $row['daysLeft'];
          $DueDate = $row['due'];
          $category = $row['category'];
          $DueTime = $row['due_time'];
          $Duration = $row['duration'];
          $Duration2 = $row['duration2'];
          $priority = $row['priority'];
          $difficulty = $row['difficulty'];
          $Location = $row['location'];
          $color = $row['color'];
          if (empty($color)) {
            $color = "777";
          }
          $setNewDate = "";
          $exclamation = "";
          if ($priority == 10) {
            $exclamation = " <b>❗</b>";
          }

          $duration_sum += $Duration2;

          if ($DaysLeft >= 0) {
            if ($day != $DueDate) {

              $daysOfWeek = array("Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag");
              $dow = $daysOfWeek[$row['DOW'] - 1];
              $date_text = date("d.m.Y", strtotime($DueDate));

              //update duration sum of previous day
              echo "<script>updateDurationSumOfDay('daysum_" . $day . "', $duration_sum)</script>";

              // $time_spent_day_sum_sql = "SELECT SUM(time_spent) as sum FROM `tasks` WHERE (done IS NULL AND due = '$DueDate') OR DATE(done) = '$DueDate'";
              $time_spent_day_sum_sql = "SELECT SUM(time_spent) as sum FROM `tasks`
                                      JOIN (SELECT taskID, SUM(TIMESTAMPDIFF(SECOND, start_time, IFNULL(stop_time, CURRENT_TIME))) as time_spent FROM `task_history` WHERE (DATE(start_time) = '$DueDate') GROUP BY taskID) as b ON tasks.ID = b.taskID
                                      WHERE (done IS NULL AND due = '$DueDate') OR DATE(done) = '$DueDate'";

              $time_spent_day_sum_res = mysqli_query($db, $time_spent_day_sum_sql);
              $time_spent_day_sum_string = "";
              if (mysqli_num_rows($time_spent_day_sum_res) > 0) {
                $time_spent_day_sum_secs = mysqli_fetch_assoc($time_spent_day_sum_res)['sum'];

                $time_spent_day_sum_minutes = str_pad(floor($time_spent_day_sum_secs / 60 % 60), 2, '0', STR_PAD_LEFT);
                $time_spent_day_sum_hours = floor($time_spent_day_sum_secs / 60 / 60);

                $time_spent_day_sum_string = "(" . $time_spent_day_sum_hours . ":" . $time_spent_day_sum_minutes . ")";
              }

              // Difficulty Scoring
              $difficulty_score_of_day_sql = "SELECT DATE(start_time) as Datum, SUM(TIMESTAMPDIFF(MINUTE, task_history.start_time, IFNULL(task_history.stop_time, CURRENT_TIMESTAMP)) / 60 * difficulty) as score 
                                          FROM `task_history` LEFT JOIN tasks on task_history.taskID = tasks.ID 
                                          WHERE DATE(start_time) = '$DueDate' GROUP BY `Datum`;";
              $difficulty_score_of_day_res = mysqli_query($db, $difficulty_score_of_day_sql);
              $difficulty_score_of_day_string = "";
              if (mysqli_num_rows($difficulty_score_of_day_res) > 0) {
                $difficulty_score_of_day_string = "[" . round((float) mysqli_fetch_assoc($difficulty_score_of_day_res)['score'], 1) . "]";
              }

              $sunrise_data = date_sun_info(strtotime($DueDate), floatval($sunrise_latitude), floatval($sunrise_longitude));
              $sunrise = date("H:i", $sunrise_data['sunrise']);
              $sunset = date("H:i", $sunrise_data['sunset']);
              $sunset_dark = date("H:i", $sunrise_data['civil_twilight_end']);

              $weatherInfo = "";
              foreach ($weather as $wd) {
                if (!(intval(date_diff(new DateTime("now"), new DateTime($DueDate))->format("%a")) > 3)) { //Eigentlich >5, aber scheinbar muss es >3 sein :laugh:
                  $weatherInfo = $weather[$DueDate][1] . "°C bis " . $weather[$DueDate][2] . "°C";
                }
              }

              if ($DaysLeft == 0) {
                $currentTemp = getCurrentTemp() . "°C";
                $weatherInfo = "(" . $weatherInfo . ")";
              } else {
                $currentTemp = "";
              }

              echo "
            <tr date>
              <td>$dow - $date_text $time_spent_day_sum_string $difficulty_score_of_day_string</td>
              <td></td>
              <td>$currentTemp $weatherInfo</td>
              <td>🌅 $sunrise</td>
              <td>🌇 $sunset / $sunset_dark</td>
              <td id='daysum_$DueDate'></td>
              <td></td>
            </tr>
        ";
              $day = $DueDate;
              $duration_sum = 0;
              $spent_time_daysum = 0;
            }
          } else {
            if (!isset($category)) {
              $category = "";
            }
          }

          $time_spent_string = "";
          $time_spent = $row['time_spent'];
          if ($time_spent > 0) {
            if ($category != 12) {
              $spent_time_daysum += $time_spent;
            }
            $minutes = str_pad(floor($time_spent / 60 % 60), 2, '0', STR_PAD_LEFT);
            $hours = floor($time_spent / 60 / 60);

            $time_spent_string = " ($hours:$minutes)";
          }
          $difficulty_string = "";
          if ($difficulty != NULL && $difficulty > 1) {
            $difficulty_string = " [" . $difficulty . "]";
          }

          echo "
        <tr priority='$priority'>
          <td onclick='openModal($ID)' class='clickable'><div class='categoryIndicator' style='--color: #$color'></div>$name$exclamation$time_spent_string$difficulty_string</td>
          <td onclick='openModal($ID)' class='clickable'><p class='description'>$desc</p></td>
          <td><p id='timeLeft_$ID'>$DaysLeft</p> $setNewDate</td>
          <td>$Location</td>
          <td>$DueTime</td>
          <td>$Duration</td>
          <td><a href='tasks.php?doneID=$ID&category=$category&$curSelDay&prefix=$prefix'>&#10004;</a></td>
        </tr>
    ";
        }
        echo "<script>updateDurationSumOfDay('daysum_" . $day . "', $duration_sum)</script>";
      }


      ?> -->

    </table>

</template>

<style scoped>
table {
    margin-bottom: 2em;
}
</style>