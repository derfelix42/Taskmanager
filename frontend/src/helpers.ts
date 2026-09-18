export function padZero(str: string, len: number) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}


/// Returns the number of days between the two dates.
export function compareDates(date1: Date, date2: Date): number {
    const date1Utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const date2Utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

    return (date1Utc - date2Utc) / 86400000;
}

export function getCategorySuggestionByName(name: string) {
    const suggestions = {
        "[Flavius]": 14,
        "[WebTech]": 10,
        "[Uni]": 1,
        "[DnD]": 6,
        "[D&D]": 6,
        "Joggen": 7,
        "Centr": 7,
        "[Taskmanager]": 2,
        "Mensa": 3,
        "Frühstück": 3,
        "Abendessen": 3,
        "Mittagessen": 3,
        "[Wachmann]": 13,
        "Kirchenchor": 8,
        "[PoML]": 1,
        "[CR]": 1,
        "[TNN]": 1,
        "[FASP]": 1,
        "[AL]": 1,
        "[SGM]": 15,
        // "[AMIR]": 1,
        // "[RL]": 1,
        // "[SSE]": 1,
        // "[TNN]": 1,
        // "[QC]": 1,
        // "[CV]": 1,
        // "[Seminar]": 1,
    }

    for (const [key, value] of Object.entries(suggestions)) {
        // console.log(name, key, value, name.indexOf(key))
        if (name.indexOf(key) >= 0)
            return value
    }

    return 0
}

export function secondsToTimestamp(seconds: number, displaySeconds: boolean = true) {
    let hours = Math.floor(seconds / 3600) + ""
    let mins = Math.floor(seconds / 60) % 60 + ""
    let secs = seconds % 60 + ""
    return padZero(hours, 2) + ":" + padZero(mins, 2) + ((displaySeconds) ? ":" + padZero(secs, 2) : "")
}