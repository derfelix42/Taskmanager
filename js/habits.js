async function toggleHabit(event, habitID, date) {
    let url = "api/habits.php?ID="+habitID+"&date="+date;
    await fetch(url)
}