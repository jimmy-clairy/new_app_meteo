import { numericDate, formatTimestamp } from "./functionsUtiles.js"

const MAX_HOURS = 18 //40 max

export function showBoxesHour(weatherData) {
    const objForBoxesHour = createObjForBoxesHour(weatherData)
    // console.log("Boxes Hour");
    // console.log(objForBoxesHour);

    let allItem = '';

    for (const data of objForBoxesHour) {

        const item = `<div class="box">
                        <div class="day">${data.day}</div>
                        <div class="date">${data.date}</div>
                        <div class="hour">${data.hour}</div>
                        <div class="icon-container">
                        <img class="icon-hour" src="./assets/iconMeteo/${data.icon}.svg" alt="icon sunset">
                        </div>
                        <div class="temp-hour">${data.temp}°</div>
                    </div>`;

        allItem += item;
    }

    document.querySelector('#boxes__3H').innerHTML = allItem;
}

function createObjForBoxesHour(weatherData) {
    const listWeatherData = weatherData.list
    const arrayHour = []
    let i = 0;

    for (const item of listWeatherData) {
        if (i === MAX_HOURS) { break }

        const [year, month, day] = numericDate(item)
        const [date, fullHour] = formatTimestamp(item.dt, { weekday: 'long' }).split(' ')
        const [hour, minute, seconde] = fullHour.split(':')

        arrayHour.push({
            day: date,
            date: `${day}/${month}`,
            hour: `${hour}:${minute}`,
            icon: item.weather[0].icon,
            temp: item.main.temp.toFixed(0)
        })
        i++;
    }
    return arrayHour
}