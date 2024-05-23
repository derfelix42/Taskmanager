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

        
        onMounted(async () => {
            await currentMonth()
        })



        return {
            habits,
            habits_month,
            habits_curr_date,
            days_in_month,
            clickedHabit,
            nextMonth,
            prevMonth
        }

    },
    template: `
        <h2>Habit Tracker 
            (<em>{{ habits_curr_date }}</em>)
        </h2>

        <button @click="prevMonth()">prev</button>
        <button @click="nextMonth()">next</button>


        <table id="habits_table_daily" class="habits">
            <thead>
                <tr>
                    <td>Habit</td>
                    <td v-for="i in days_in_month">{{ i.toString().padStart(2, "0") }}.</td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="habit in habits.habits">
                    <td>{{ habit.name }}</td>
                    <td v-for="i in days_in_month" :key="habit.ID + '-' + i">
                        <input type="checkbox" @click="clickedHabit(habit.ID, i)"
                            :checked="habits.entries.filter(x => x.habitID === habit.ID).map(x => x.dom).includes(i.toString())">
                    </td>
                </tr>
            </tbody>
        </table>
    `
})

habit_tracker.mount("#habit_tracker")