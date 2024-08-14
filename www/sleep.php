<script type="module" src="vue/sleep_history_entries.js" defer></script>
<script>
async function start_sleep_session() {

}
</script>
<h2>
    Sleep Tracker 
    <i class="fa-regular fa-moon"></i>
</h2>

<section class="statistics">
    <div class="wide">
        <header style='--color: #111'>Sleep Statistics</header>
        <main>
            <section>
                <h3>Overall</h3>
                <p>Number of Tasks created:</p>
                <p>Tracked hours:</p>
            </section>
        </main>
    </div>
</section>

<button onclick="goToSleepNow()">Go to sleep</button>
<button onclick="wakeUpNow()">Wake up now</button>


<section class="sleep_history">
    <h3>
        Sleep History
        <button>Add new <i class="fa-regular fa-plus"></i></button>
    </h3>


    <div id="sleep_history_entries">
        
    </div>

</section>