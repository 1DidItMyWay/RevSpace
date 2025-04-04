let topics = [];
let topicslisttable = document.getElementById('topicst');
let topicslisthead = document.getElementById('topicsh');
let dltbtn = document.querySelectorAll('.dltbtn');
let flag = 0;
let globalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
document.getElementById('timezone').placeholder = globalTimezone;

function setTimezone() {
    let inputTimezone = document.getElementById('timezone').value.trim();
    globalTimezone = convertToIANA(inputTimezone) || globalTimezone;
    alert(`Timezone set to: ${globalTimezone}`);
}


function convertToIANA(timezone) {
    const timezoneMap = {
        "PST": "America/Los_Angeles",
        "MST": "America/Denver",
        "CST": "America/Chicago",
        "EST": "America/New_York",
        "AKST": "America/Anchorage",
        "HST": "Pacific/Honolulu",
        "AST": "America/Halifax",
        "NST": "America/St_Johns",
        "GMT": "Etc/GMT",
        "UTC": "Etc/UTC",
        "BST": "Europe/London",
        "CET": "Europe/Paris",
        "CEST": "Europe/Berlin",
        "EET": "Europe/Helsinki",
        "EEST": "Europe/Bucharest",
        "MSK": "Europe/Moscow",
        "IST": "Asia/Kolkata",
        "PKT": "Asia/Karachi",
        "WIB": "Asia/Jakarta",
        "SGT": "Asia/Singapore",
        "CST-CHINA": "Asia/Shanghai",
        "JST": "Asia/Tokyo",
        "KST": "Asia/Seoul",
        "AEST": "Australia/Sydney",
        "ACST": "Australia/Adelaide",
        "AWST": "Australia/Perth",
        "NZST": "Pacific/Auckland",
        "NZDT": "Pacific/Auckland", // Daylight Saving
        "WAT": "Africa/Lagos",
        "CAT": "Africa/Harare",
        "EAT": "Africa/Nairobi",
        "ART": "America/Argentina/Buenos_Aires",
        "BRT": "America/Sao_Paulo",
        "CLT": "America/Santiago",
        "VET": "America/Caracas",
        "HKT": "Asia/Hong_Kong",
        "MYT": "Asia/Kuala_Lumpur",
    };
    return timezoneMap[timezone.toUpperCase()] || null;
}

let dateflag = 0;

function addMoreTopics() {
    const container = document.getElementById('topics-container');
    const newEntry = document.createElement('div');
    newEntry.classList.add('topic-entry');
    newEntry.innerHTML = `
                <label for="topic">Topic:</label>
                <input type="text" class="topic" required>

                <label for="start-date">Start Date:</label>
                <input class="topic-date" type="date" class="start-date" required>

                <label for="time">Time:</label>
                <input type="time" class="time" required>
            `;

    container.appendChild(newEntry);
    dateflag += 1;
    setTheDate(dateflag);
}

function setTheDate(i) {
    const today = new Date().toISOString().split('T')[0];
    let datet = document.getElementsByClassName('topic-date');
    datet[i].value = today;
    datet[i].placeholder = today;
}

setTheDate(dateflag);

function addTopics() {
    const topicInputs = document.querySelectorAll('.topic');
    const dateInputs = document.querySelectorAll('.topic-date');
    const timeInputs = document.querySelectorAll('.time');

    topics = [];
    for (let i = 0; i < topicInputs.length; i++) {
        const topic = topicInputs[i].value;
        const startDate = dateInputs[i].value;
        const time = timeInputs[i].value;

        if (topic && startDate && time) {
            topics.push({topic, startDate, time});
        }
    }
    updateTopicsList();
}

function updateTopicsList() {
    if (flag === 0) {
        topicslisttable.style.display = 'block';
        topicslisthead.style.display = 'block';
        dltbtn.forEach(t => {
            t.style.display = 'block';
        })

        flag = 1;

    }
    const list = document.getElementById('topics-list');
    list.innerHTML = '';
    topics.forEach(t => {
        let dates = getRepetitionDates(t.startDate, t.time);
        const tr = document.createElement('tr');
        tr.innerHTML += `<td>${t.topic}</td> 
<td>${t.startDate.split('T')[0]}</td> 
<td>${formatDate(dates[0])}</td> 
<td>${formatDate(dates[1])}</td>
<td>${formatDate(dates[2])}</td>
<td>${formatDate(dates[3])}</td>
<td>${formatDate(dates[4])}</td>
<td>${formatDate(dates[5])}</td>
<td>${formatDate(dates[6])}</td>
<td>${formatDate(dates[7])}</td>
 <td><button id="delete-icon" onclick="deleteTopic(${topics.indexOf(t)})">🗑️</button></td>`;

        list.appendChild(tr);
    });
}

function formatDate(isoString) {
    const date = new Date(isoString.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
    return date.toISOString().split('T')[0];
}

function deleteTopic(topic) {
    topics.splice(topic, 1);
    updateTopicsList()
}

function deleteList() {
    topics = [];
    if (flag === 1) {
        topicslisttable.style.display = 'none';
        topicslisthead.style.display = 'none';
        dltbtn.forEach(t => {
            t.style.display = 'none';
        })


        flag = 0;

    }

}

function getRepetitionDates(startDate, time) {
    let baseDate = new Date(`${startDate}T${time}:00`);
    return [1, 7, 14, 21, 30, 60, 120, 180].map(days => {
        let newDate = new Date(baseDate);
        newDate.setDate(newDate.getDate() + days);
        return newDate.toISOString().replace(/[-:]/g, '').split('.')[0];
    });
}

function generateICS() {
    let icsData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Spaced Repetition//EN\n";
    topics.forEach(t => {
        let dates = getRepetitionDates(t.startDate, t.time);
        dates.forEach(date => {
            icsData += `BEGIN:VEVENT\nSUMMARY:${t.topic}\nDTSTART:${date}Z\nEND:VEVENT\n`;
        });
    });
    icsData += "END:VCALENDAR";

    const blob = new Blob([icsData], {type: 'text/calendar'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "spaced_repetition.ics";
    link.click();
}

function addToGoogleCalendar() {
    if (!globalTimezone) {
        alert("Please set a valid timezone.");
        return;
    }

    let googleCalendarURL = `https://calendar.google.com/calendar/u/0/r/settings/export`;
    let firstEvent = true;

    topics.forEach(t => {
        let dates = getRepetitionDates(t.startDate, t.time);
        dates.forEach(date => {
            let formattedDate = date.slice(0, 15) + 'Z';
            let eventURL = `&text=${encodeURIComponent(t.topic)}&dates=${formattedDate}/${formattedDate}&details=Spaced%20Repetition%20Review&ctz=${encodeURIComponent(globalTimezone)}`;

            if (firstEvent) {
                googleCalendarURL += eventURL;
                firstEvent = false;
            } else {
                googleCalendarURL += eventURL.replace('action=TEMPLATE', 'add');
            }
        });
    });

    window.open(googleCalendarURL, '_blank');
}