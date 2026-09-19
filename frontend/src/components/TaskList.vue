<script lang="ts" setup>
import { endTaskAPI, getTasksForDate } from '@/api/api';
import { secondsToTimestamp } from '@/helpers';
import type { TaskResponse } from '@/models/tasks';
import { useCurrentDateStore } from '@/stores/currentDateStore';
import { useTasksStore } from '@/stores/tasksStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, reactive, watch } from 'vue';

const props = defineProps(['title', 'tasks'])

const emit = defineEmits<{
  setTaskDone: [taskId: number]
  openModal: [taskId: number]
}>()

const totalTimeSpent = computed(() => {
  let sum = 0;
  for (let task of props.tasks) {
    sum += task.stats.time_spent;
  }
  return sum
})

</script>

<template>
  <!-- {{ props.tasks }} -->
  <table>
    <!-- Header -->
    <tr date>
      <td>{{ props.title }} {{ totalTimeSpent > 0 ? "(" + secondsToTimestamp(totalTimeSpent, false) + ")" : "" }}</td>
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
  </table>

</template>

<style scoped>
table {
  margin-bottom: 2em;
}
</style>