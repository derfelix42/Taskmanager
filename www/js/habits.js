function getCurrentMonth() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getNextMonth(date) {
    if (date.getMonth() === 11) {
        return new Date(date.getFullYear() + 1, 0, 1)
    }

    return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

function getPrevMonth(date) {
    if (date.getMonth() === 0) {
        return new Date(date.getFullYear() - 1, 11, 1)
    }

    return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

function createTable(table, month, habits) {
    while (table?.hasChildNodes()) {
        table.removeChild(table.lastChild);
    }

    const days_in_month = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

    // table head
    const thead = document.createElement("thead")
    const tr = document.createElement("tr")
    thead.appendChild(tr)
    const thead_habits = document.createElement("td")
    thead_habits.appendChild(document.createTextNode("Habit"))
    tr.appendChild(thead_habits)

    for (let i = 1; i <= days_in_month; i += 1) {
        const td = document.createElement("td")
        td.appendChild(document.createTextNode(i.toString().padStart(2, "0") + "."))
        tr.appendChild(td)
    }

    table.appendChild(thead)


    // table body
    const tbody = document.createElement("tbody")
    table.appendChild(tbody)

    for (let habit of habits) {
        const tr = document.createElement("tr")
        const title = document.createElement("td")
        title.appendChild(document.createTextNode(habit.name))
        tr.appendChild(title)

        for (let i = 1; i <= days_in_month; i += 1) {
            const date = habits_month.getFullYear() + "-" + (habits_month.getMonth() + 1).toString().padStart(2, "0") + "-" + i.toString().padStart(2, "0")
            const td = document.createElement("td")
            if((new Date(habit.created)) <= (new Date(date)) || habit.dates.includes(date)) {
                const input = document.createElement("input")
                input.type = "checkbox"
                input.addEventListener("click", event => toggleHabit(event, habit.id, date))
                input.checked = habit.dates.includes(date)
                td.appendChild(input)
            }
            tr.appendChild(td)
        }




        tbody.appendChild(tr)
    }

}

let habits_month = getCurrentMonth()

const habits_table_daily = document.getElementById("habits_table_daily")
const habits_table_weekly = document.getElementById("habits_table_weekly")
const habits_table_monthly = document.getElementById("habits_table_monthly")

const habits_next_month = document.getElementById("habits_next_month")
const habits_prev_month = document.getElementById("habits_prev_month")

habits_next_month?.addEventListener("click", () => { habits_month = getNextMonth(habits_month); createHabitTables() })
habits_prev_month?.addEventListener("click", () => { habits_month = getPrevMonth(habits_month); createHabitTables() })

async function createHabitTables() {
    let habits = await fetchHabits()

    const daily = habits.filter(x => x.type === "daily")
    // const weekly = habits.filter(x => x.type === "weekly")
    // const monthly = habits.filter(x => x.type === "monthly")

    createTable(habits_table_daily, habits_month, daily)
    // createTable(habits_table_weekly, habits_month, weekly)
    // createTable(habits_table_monthly, habits_month, monthly)

    document.getElementById("habits_curr_date").innerText = (habits_month.getMonth() + 1).toString().padStart(2, "0") + "-" + habits_month.getFullYear()
}

if(habits_table_daily) {
    createHabitTables()
}