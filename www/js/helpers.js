function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function getCategorySuggestionByName(name) {
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
        if(name.indexOf(key) >= 0)
            return value
    }

    return 0
}

