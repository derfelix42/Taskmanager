<script setup lang="ts">
import { createTask, getCategoryColors, startTimerOnTask } from '@/api/api'
import { getCategorySuggestionByName } from '@/helpers'
import { useCurrentDateStore } from '@/stores/currentDateStore'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const emit = defineEmits(['close'])

const currentDateStore = useCurrentDateStore()

let header = useTemplateRef("header")
const titleElement = useTemplateRef<HTMLInputElement>('titleElement')

let title = ref("")
let description = ref("")
let location = ref("")
let category = ref(0)
let due_date = ref("")
let due_time = ref("")
let duration = ref("")
let priority = ref(5)

const categories = ref<any[]>([])
let priorities: { value: number, text: string }[] = [];

function setHeaderColor() {
  let id = category.value
  let color = "#" + categories.value.find(cat => cat.ID === id)?.color
  if (color === "#null") {
    color = "#777"
  }
  header.value?.style.setProperty('background-color', color)
}

function fillPrioritySelector() {
  priorities = []
  for (let i = 10; i >= 1; i--) {
    let line = { value: i, text: "" + i };
    if (i === 1) {
      line.text = "1 - Niedrig"
    } if (i === 5) {
      line.text = "5 - Normal"
    } if (i === 10) {
      line.text = "10 - Hoch"
    }
    priorities.push(line)
  }
}

function autoSuggestCategory() {
  let cat = getCategorySuggestionByName(title.value)
  console.log("Auto-Cat-Suggestion:", cat)
  if (category.value !== cat) {
    category.value = cat
  }

}

async function save(autostart: boolean = false) {
  let new_task = {
    title: title.value,
    description: description.value,
    due_date: due_date.value,
    due_time: due_time.value,
    duration: duration.value,
    priority: priority.value,
    category: category.value,
    location: location.value
  }

  const res = await createTask(new_task)
  const new_id = res.result.ID

  if (autostart) {
    await startTimerOnTask(new_id)
  }

  emit('close')
}


watch(() => title.value, () => autoSuggestCategory())
watch(() => category.value, () => setHeaderColor())

onMounted(async () => {
  categories.value = await getCategoryColors()
  setHeaderColor()
  fillPrioritySelector()
  due_date.value = currentDateStore.isoDate
  titleElement.value?.focus()
})

</script>

<template>
  <div id="addNewTaskModal" class="taskModal">
    <div class="container">
      <div class="header" ref="header">
        Neue Aufgabe erstellen
        <p id="closeAddNewTaskModal" class="float-right" @click="$emit('close')">[X]</p>
      </div>
      <div class="content">
        <div class="settings flex-one">
          <input class="bigInput" type="text" ref="titleElement" placeholder="Title" v-model="title"
            @keyup.enter="save(false)" @keyup.ctrl.enter="save(true)" required>
          <textarea class="flex-one" v-model="description" rows="4" cols="80" placeholder="Description"></textarea>
          <input class="smallInput" type="text" v-model="location" placeholder="Location">
        </div>
        <hr>
        <div class="settings">
          <label>Category: <select class="mobilBigInput" v-model="category">
              <option :value="category.ID" v-for="category in categories" :key="category.id">{{ category.ID }} -
                {{ category.Bezeichnung }}</option>
            </select></label>
          <label>Priority: <select class="mobilBigInput" v-model="priority">
              <option :value="prior.value" v-for="prior in priorities">{{ prior.text }}</option>
            </select></label>
        </div>
        <hr>
        <div class="settings">
          <label>Deadline: <input class="margin-left" type="date" v-model="due_date"><input class="margin-left"
              type="time" name="due-time"></label>
          <label>Duration: <input class="margin-left" type="time" v-model="duration"></label>
        </div>
        <hr>
        <div class="save">
          <button type="button" name="save" @click="save()">Speichern</button>
          <button type="button" name="save-and-start" @click="save(true)">Speichern und sofort starten
            [Strg+Enter]</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.taskModal .container {
  position: relative;
  background-color: #333 !important;
  border-radius: 1em;
  z-index: 10;
}
</style>
