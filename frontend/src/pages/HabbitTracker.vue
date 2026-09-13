<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
    createHabit,
    createHabitGroup,
    deleteHabit,
    deleteHabitGroup,
    fetchHabits,
    moveHabitToGroup,
    renameHabitGroup,
    toggleHabit,
    updateHabitName,
} from '@/api/api'

interface Habit {
    ID: string
    name: string
    groupID: string | null
    editMode?: boolean
}

interface HabitGroup {
    ID: string
    name: string
    editMode?: boolean
}

interface HabitEntry {
    habitID: string
    dom: string
}

const habits = reactive<{ habits: Habit[]; groups: HabitGroup[]; entries: HabitEntry[] }>({
    habits: [],
    groups: [],
    entries: [],
})
const habits_month = ref(new Date())
const habits_curr_date = computed(() => {
    return `${(habits_month.value.getMonth() + 1).toString().padStart(2, '0')}-${habits_month.value.getFullYear()}`
})
const days_in_month = computed(() => new Date(habits_month.value.getFullYear(), habits_month.value.getMonth() + 1, 0).getDate())
const adding_new_group = ref(false)
const adding_new_group_name = ref('')

async function getHabits() {
    const new_habits = await fetchHabits(
        String(habits_month.value.getMonth() + 1),
        String(habits_month.value.getFullYear()),
    )
    habits.habits.splice(0, habits.habits.length, ...new_habits.habits)
    habits.groups.splice(0, habits.groups.length, ...new_habits.groups)
    habits.entries.splice(0, habits.entries.length, ...new_habits.entries)
}

async function currentMonth() {
    const date = new Date()
    habits_month.value = new Date(date.getFullYear(), date.getMonth(), 1)
    await getHabits()
}

async function nextMonth() {
    const date = habits_month.value
    habits_month.value = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    await getHabits()
}

async function prevMonth() {
    const date = habits_month.value
    habits_month.value = new Date(date.getFullYear(), date.getMonth() - 1, 1)
    await getHabits()
}

async function clickedHabit(habitID: string, day: number) {
    const date = `${habits_month.value.getFullYear()}-${(habits_month.value.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    await toggleHabit(undefined, habitID, date)
    await getHabits()
}

async function renameHabit(habitID: string, name: string) {
    await updateHabitName(habitID, name)
    await getHabits()
}

async function createNewHabit() {
    await createHabit()
    await getHabits()
}

async function deleteHabitByID(habitID: string) {
    await deleteHabit(habitID)
    await getHabits()
}

async function adding_new_group_fnc() {
    await createHabitGroup(adding_new_group_name.value)
    await getHabits()
    adding_new_group.value = false
}

async function renameHabitGroup_fn(groupID: string, name: string) {
    await renameHabitGroup(groupID, name)
    await getHabits()
}

async function deleteHabitGroup_fn(groupID: string) {
    const habits_to_move = habits.habits.filter((habit) => habit.groupID === groupID)
    for (const habit of habits_to_move) {
        await moveHabitToGroup(habit.ID, 'null')
    }
    await deleteHabitGroup(groupID)
    await getHabits()
}

function dragStart(event: DragEvent, habitID: string) {
    event.dataTransfer?.setData('text/plain', habitID)
}

function dragOver(event: DragEvent) {
    event.preventDefault()
}

async function drop(event: DragEvent, groupID: string | null) {
    event.preventDefault()
    const habitID = event.dataTransfer?.getData('text/plain')
    if (!habitID) return
    await moveHabitToGroup(habitID, groupID ?? 'null')
    await getHabits()
}

onMounted(currentMonth)
</script>

<template>
        <div class="habits_header">
        <h1 class="underline">Habit Tracker</h1>
        </div>
        <div class="habits_header">
        <a @click="prevMonth()">
            <i class="fas fa-chevron-left clickable"></i>
        </a>
        <h1>
            {{ habits_curr_date }}
        </h1>
        <a @click="nextMonth()">
            <i class="fas fa-chevron-right clickable"></i>
        </a>
        </div>

        <span class="divider height-1"/>
        
        <table class="habits" v-for="group in habits.groups">
        <thead>
        <tr @dragover="dragOver($event)" @drop="drop($event, group.ID)">

        <td v-if="!group.editMode" @click="group.editMode = true" class="clickable">
        {{ group.name }}
        </td>
        <td v-else>
        <input type="text" @change="renameHabitGroup_fn(group.ID, ($event.target as HTMLInputElement).value)" :value="group.name" v-on:keyup.enter="group.editMode = false">
        <span @click.stop="deleteHabitGroup_fn(group.ID)" class="clickable right">❌</span>
        </td>


        <td v-for="i in days_in_month" :key="group.ID + '-' + i">
        {{ i.toString().padStart(2, "0") }}.
        </td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="habit in habits.habits?.filter(x => x.groupID === group.ID)" :key="group.ID+'-'+habit.ID" draggable="true" @dragstart="dragStart($event, habit.ID)" @dragover="dragOver($event)" @drop="drop($event, group.ID)">
        
        <td v-if="!habit.editMode" @click="habit.editMode = true" class="clickable">
        {{ habit.name }}
        </td>
        <td v-else>
        <input type="text" @change="renameHabit(habit.ID, ($event.target as HTMLInputElement).value)" :value="habit.name" v-on:keyup.enter="habit.editMode = false">
        <span @click.stop="deleteHabitByID(habit.ID)" class="clickable right">❌</span>
        </td>
        <td v-for="i in days_in_month" @click="clickedHabit(habit.ID, i)" :key="habit.ID + '-' + i + '-' + habits_curr_date" :class="{checked: (habits.entries !== undefined ? habits.entries.filter(x => x.habitID === habit.ID).map(x => x.dom).includes(i.toString()) : false)}" class="clickable">
        </td>
        </tr>
        </tbody>
        </table>
        
        <table class="habits">
        <thead v-if="habits.habits?.filter(x => x.groupID === null).length > 0">
        <tr @dragover="dragOver($event)" @drop="drop($event, 'null')">
        <td></td>
        <td v-for="i in days_in_month" :key="'null-' + i" >
        {{ i.toString().padStart(2, "0") }}.
        </td>
        </tr>
        
        </thead>
        <tbody>
        <tr v-for="habit in habits.habits?.filter(x => x.groupID === null)" :key="'null-'+habit.ID" draggable="true" @dragstart="dragStart($event, habit.ID)" @dragover="dragOver($event)" @drop="drop($event, null)">
        <td v-if="!habit.editMode" @click="habit.editMode = true" class="clickable">
        {{ habit.name }}
        </td>
        <td v-else>
        <input type="text" @change="renameHabit(habit.ID, ($event.target as HTMLInputElement).value)" :value="habit.name" v-on:keyup.enter="habit.editMode = false">
        <span @click.stop="deleteHabitByID(habit.ID)" class="clickable right">❌</span>
        </td>
        
        <td v-for="i in days_in_month" @click="clickedHabit(habit.ID, i)" :key="habit.ID + '-' + i + '-' + habits_curr_date" :class="{checked: (habits.entries !== undefined ? habits.entries.filter(x => x.habitID === habit.ID).map(x => x.dom).includes(i.toString()) : false)}" class="clickable">
        </td>
        </tr>
        <tr>
        <td colspan="32" style="text-align: center;" @click="createNewHabit()" @dragover="dragOver($event)" @drop="drop($event, 'null')">
        +
        </td>
        </tr>
        </tbody>
        </table>

        <section id="add_habits_group">
            <button class="habits clickable" @click="adding_new_group = true" v-if="!adding_new_group">Add Group</button>
            <template v-if="adding_new_group">
                <h3>Add new Group:</h3>
                <input type="text" v-model="adding_new_group_name" placeholder="New Groups Name">
                <button class="habits clickable" @click="adding_new_group = false">Cancel</button>
                <button class="habits clickable" @click="adding_new_group_fnc">Save</button>
            </template>
        </section>
</template>

<style>
div.habit-tracker {
    padding: 1em;
}

div.habit-tracker h2 {
    margin: 0;
}

div.habit-tracker h3 {
    margin-top: 1.7em;
    margin-bottom: 0.3em;
}

table.habits thead {
    font-weight: 900;
    background-color: rgba(255,255,255,0.2);
}

table.habits tr:hover {
    background-color: rgba(255,255,255,0.2);
}

table.habits tr td:first-child {
    width: 10em;
}

table.habits td {
    box-shadow: inset 0 0 10px black;
    border: 1px solid white;
    width: 1em;
    height: 2em;
}

table.habits td input, section#add_habits_group input {
    width: calc(100% - 2em);

    line-height: 1em;
    font-size: 1em;
    font-family: monospace;
    font-weight: 600;
  
    /* height: 1.4em; */
    border: 0;
    border-bottom: 1px solid black;
    padding: 0.2em;
    background-color: #555;
    color: white;
    outline: none;
}

table.habits :not(thead) tr td {
    box-shadow: inset 0 0 10px black;
}

table.habits input[type=checkbox] {
    cursor: pointer;
}

table.habits {
    margin-bottom: 2em;
}

table.habits td.checked {
    /* box-shadow: inset 0 0 10px white; */
    background-color: #349127;
}

div.habits_header {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

div.habits_header * {
    display: inline-block;
}

div.habits_header a {
    margin: 0 2em;
}

button.habits {
    margin-right: 0.5em;
    margin-top: 0.5em;
    padding: 0.5em 1em;
    background-color: #111;
    color: white;
    border: 1px solid white;
    border-radius: 0.75em;
}

button.habits:hover {
    background-color: rgba(255,255,255,0.1);
}
</style>