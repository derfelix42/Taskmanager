import { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const habit_tracker = createApp({
    setup() {
        const habits = reactive({habits: [], groups: [], entries: []})
        const habits_month = ref(new Date())
        const habits_curr_date = computed(() => {
            return (habits_month.value.getMonth() + 1).toString().padStart(2, "0") + "-" + habits_month.value.getFullYear()
        })
        const days_in_month = computed(() => new Date(habits_month.value.getFullYear(), habits_month.value.getMonth() + 1, 0).getDate())
        const adding_new_group = ref(false);
        const adding_new_group_name = ref("");

        async function currentMonth() {
            const d = new Date()
            habits_month.value = new Date(d.getFullYear(), d.getMonth(), 1);
            await getHabits()
        }
        
        async function nextMonth() {
            const date = habits_month.value
            if (date.getMonth() === 11) {
                habits_month.value = new Date(date.getFullYear() + 1, 0, 1)
            } else {
                habits_month.value = new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        
            await getHabits()
        }
        
        async function prevMonth() {
            const date = habits_month.value
            if (date.getMonth() === 0) {
                habits_month.value = new Date(date.getFullYear() - 1, 11, 1)
            } else {
                habits_month.value = new Date(date.getFullYear(), date.getMonth() - 1, 1)
            }
        
            await getHabits()
        }

        async function getHabits() {
            // fetch habits based on habits_month
            const new_habits = await fetchHabits(habits_month.value.getMonth() + 1, habits_month.value.getFullYear())
            // console.log(new_habits)
            habits.habits.splice(0)
            Object.assign(habits.habits, new_habits.habits)
            habits.groups.splice(0)
            Object.assign(habits.groups, new_habits.groups)
            habits.entries.splice(0)
            Object.assign(habits.entries, new_habits.entries)
        }

        async function clickedHabit(habitID, i) {
            const date = habits_month.value.getFullYear() + "-" + (habits_month.value.getMonth() + 1).toString().padStart(2, "0") + "-" + i.toString().padStart(2, "0")
            await toggleHabit(undefined, habitID, date)
            await getHabits()
        }

        async function renameHabit(habitID, name) {
            await updateHabitName(habitID, name)
            await getHabits()
        }

        async function createNewHabit() {
            await createHabit()
            await getHabits()
        }

        async function deleteHabitByID(habitID) {
            await deleteHabit(habitID)
            await getHabits()
        }

        async function adding_new_group_fnc() {
            await createHabitGroup(adding_new_group_name.value)
            await getHabits()
            adding_new_group.value = false
        }

        async function renameHabitGroup_fn(groupID, name) {
            console.log("habits:renameHabitGroup",groupID,name)
            await renameHabitGroup(groupID, name)
            await getHabits()
        }

        async function deleteHabitGroup_fn(groupID) {
            // console.log("habits:deleteHabitGroup")
            // TODO: move all habits within to null group
            let habits_to_move = habits.habits?.filter(x => x.groupID === groupID)
            // console.log("Would have to move the following habits:", habits_to_move)
            for (const habit of habits_to_move) {
                // console.log("habit:", habit, habit.ID)
                await moveHabitToGroup(habit.ID, "null")
            }

            // console.log("stopping before.")
            await deleteHabitGroup(groupID)
            await getHabits()
        }

        async function dragStart(event, habitID) {
            event.dataTransfer.setData("text/plain", habitID)
        }

        async function dragOver(event) {
            event.preventDefault()
        }

        async function drop(event, groupID) {
            event.preventDefault()
            const habitID = event.dataTransfer.getData("text/plain")
            // console.log(habitID, groupID)
            await moveHabitToGroup(habitID, groupID)
            await getHabits()
        }

        onMounted(async () => {
            await currentMonth()
        })

        return {
            habits,
            habits_month,
            habits_curr_date,
            days_in_month,
            adding_new_group,
            adding_new_group_name,
            clickedHabit,
            renameHabit,
            createNewHabit,
            deleteHabitByID,
            nextMonth,
            prevMonth,
            dragStart,
            dragOver,
            drop,
            adding_new_group_fnc,
            renameHabitGroup_fn,
            deleteHabitGroup_fn,
        }

    },
    template: `
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
        <input type="text" @change="renameHabitGroup_fn(group.ID, $event.target.value)" :value="group.name" v-on:keyup.enter="group.editMode = false">
        <span @click.stop="deleteHabitGroup_fn(group.ID)" class="clickable right">🗑️</span>
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
        <input type="text" @change="renameHabit(habit.ID, $event.target.value)" :value="habit.name" v-on:keyup.enter="habit.editMode = false">
        <span @click.stop="deleteHabitByID(habit.ID)" class="clickable right">🗑️</span>
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
        <input type="text" @change="renameHabit(habit.ID, $event.target.value)" :value="habit.name" v-on:keyup.enter="habit.editMode = false">
        <span @click.stop="deleteHabitByID(habit.ID)" class="clickable right">🗑️</span>
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

        <section>
            <button @click="adding_new_group = true" v-if="!adding_new_group">Add Group</button>
            <template v-if="adding_new_group">
                <input type="text" v-model="adding_new_group_name">
                <button @click="adding_new_group = false">Cancel</button>
                <button @click="adding_new_group_fnc">Save</button>
            </template>
        </section>
        `
    })
    
habit_tracker.mount("#habit_tracker")