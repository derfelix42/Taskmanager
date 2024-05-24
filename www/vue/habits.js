import { createApp, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const habit_tracker = createApp({
    setup() {
        const habits = reactive([])
        const habits_month = ref(new Date())
        const habits_curr_date = computed(() => (habits_month.value.getMonth() + 1).toString().padStart(2, "0") + "-" + habits_month.value.getFullYear())
        const days_in_month = computed(() => new Date(habits_month.value.getFullYear(), habits_month.value.getMonth() + 1, 0).getDate())

        async function currentMonth() {
            const d = new Date()
            habits_month.value = new Date(d.getFullYear(), d.getMonth(), 1);
            await getHabits()
        }
        
        async function nextMonth() {
            const date = habits_month.value
            if (date.getMonth() === 11) {
                return new Date(date.getFullYear() + 1, 0, 1)
            }
        
            habits_month.value = new Date(date.getFullYear(), date.getMonth() + 1, 1)
            await getHabits()
        }
        
        async function prevMonth() {
            const date = habits_month.value
            if (date.getMonth() === 0) {
                return new Date(date.getFullYear() - 1, 11, 1)
            }
        
            habits_month.value = new Date(date.getFullYear(), date.getMonth() - 1, 1)
            await getHabits()
        }

        async function getHabits() {
            // fetch habits based on habits_month
            const new_habits = await fetchHabits(habits_month.value.getMonth() + 1, habits_month.value.getFullYear())
            console.log(new_habits)
            Object.assign(habits, new_habits)
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

        async function dragStart(event, habitID) {
            event.dataTransfer.setData("text/plain", habitID)
        }

        async function dragOver(event) {
            event.preventDefault()
        }

        async function drop(event, groupID) {
            event.preventDefault()
            const habitID = event.dataTransfer.getData("text/plain")
            console.log(habitID, groupID)
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
            clickedHabit,
            renameHabit,
            createNewHabit,
            deleteHabitByID,
            nextMonth,
            prevMonth,
            dragStart,
            dragOver,
            drop
        }

    },
    template: `
        <h2>Habit Tracker 
            (<span>{{ habits_curr_date }}</span>)
        </h2>

        <button @click="prevMonth()">prev</button>
        <button @click="nextMonth()">next</button>
        
        <table class="habits" v-for="group in habits.groups">
            <thead>
            <tr @dragover="dragOver($event)" @drop="drop($event, group.ID)">
                <td>{{group.name}}</td>
                <td v-for="i in days_in_month" :key="group.ID + '-' + i">
                    {{ i.toString().padStart(2, "0") }}.
                </td>
            </tr>
            </thead>
            <tbody>
                <tr v-for="habit in habits.habits?.filter(x => x.groupID === group.ID)" :key="group.ID+'-'+habit.ID" draggable="true" @dragstart="dragStart($event, habit.ID)" @dragover="dragOver($event)" @drop="drop($event, group.ID)">
                    
                    <td v-if="!habit.editMode" @click="habit.editMode = true">
                        {{ habit.name }}
                        <span @click.stop="deleteHabitByID(habit.ID)" class="clickable right">🗑️</span>
                    </td>
                    <td v-else>
                        <input type="text" @change="renameHabit(habit.ID, $event.target.value)" :value="habit.name" v-on:keyup.enter="habit.editMode = false">
                    </td>
                    <td v-for="i in days_in_month" :key="habit.ID + '-' + i + '-' + habits_curr_date">
                        <input type="checkbox" @click="clickedHabit(habit.ID, i)"
                        :checked="habits.entries ? habits.entries.filter(x => x.habitID === habit.ID).map(x => x.dom).includes(i.toString()) : false">
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
                    <!-- show trash icon on hover to delete habit -->
                    <td v-if="!habit.editMode" @click="habit.editMode = true">
                        {{ habit.name }}
                        <span @click.stop="deleteHabitByID(habit.ID)" class="clickable right">🗑️</span>
                    </td>
                    <td v-else>
                        <input type="text" @change="renameHabit(habit.ID, $event.target.value)" :value="habit.name" v-on:keyup.enter="habit.editMode = false">
                    </td>

                    <td v-for="i in days_in_month" :key="habit.ID + '-' + i + '-' + habits_curr_date">
                        <input type="checkbox" @click="clickedHabit(habit.ID, i)"
                            :checked="habits.entries ? habits.entries.filter(x => x.habitID === habit.ID).map(x => x.dom).includes(i.toString()) : false">
                    </td>
                </tr>
                <!-- extra row to add new habit - being a full row just showing a plus in the middle -->
                <tr>
                    <td colspan="32" style="text-align: center;" @click="createNewHabit()" @dragover="dragOver($event)" @drop="drop($event, 'null')">
                        +
                    </td>
                </tr>
            </tbody>
        </table>
    `
})

habit_tracker.mount("#habit_tracker")