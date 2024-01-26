import { numericDate, formatTimestamp } from "./functionsUtiles.js"
const MAX_DAYS = 4; // Max 4 days

/**
 * Filters out the current day from the list of days in the weather data.
 * @param {Object} weatherData - The weather data object.
 * @returns {Array} - The list of days excluding the current day.
 */
function deleteCurrentDay(weatherData) {
    const currentDay = formatTimestamp(Math.floor(Date.now() / 1000), { weekday: 'long' }).split(' ')[0];
    const listDays = weatherData.list;

    return listDays.filter(list => currentDay !== formatTimestamp(list.dt, { weekday: 'long' }).split(' ')[0]);
}

/**
 * Groups weather data by day, limiting to a maximum number of days.
 * @param {Object} weatherData - The weather data object.
 * @returns {Array} - The grouped weather data by day.
 */
function createObjForBoxesDay(listDays) {
    const groupedDays = [];

    let currentDay = '';
    let currentGroupIndex = -1;

    for (const item of listDays) {
        const [dayFormat] = formatTimestamp(item.dt, { weekday: 'long' }).split(' ');

        if (currentDay !== dayFormat) {
            currentGroupIndex++;

            if (currentGroupIndex === MAX_DAYS) { break; }

            const [year, month, day] = numericDate(item)
            currentDay = dayFormat;

            groupedDays.push({
                day: currentDay,
                date: `${day}/${month}`,
                icon: '',
                temps: [],
                icons: []
            });
        }

        groupedDays[currentGroupIndex].temps.push(item.main.temp);
        groupedDays[currentGroupIndex].icons.push(item.weather[0].icon);
    }

    for (const item of groupedDays) {
        item.tempMin = Math.min(...item.temps).toFixed(0);
        item.tempMax = Math.max(...item.temps).toFixed(0);
        item.icon = item.icons[4];
        delete item.temps;
        delete item.icons;
    }

    return groupedDays;
}

/**
 * Displays weather data for each day in a card format.
 * @param {Object} weatherData - The weather data object.
 */
export function showBoxesDay(weatherData) {
    const weatherDataLessCurrentDay = deleteCurrentDay(weatherData);
    const objForBoxesDay = createObjForBoxesDay(weatherDataLessCurrentDay);
    // console.log("Boxes Day");
    // console.log(objForBoxesDay);

    let allItem = '';

    for (const list of objForBoxesDay) {
        const item = `<div class="box">
                            <div class="day">${list.day}</div>
                            <div class="date">${list.date}</div>
                            <div class="icon-container">
                                <img class="icon-hour" src="./assets/iconMeteo/${list.icon}.svg" alt="icon météo" width="70" height="70">
                            </div>
                            <div class="temp-min-max">${list.tempMin}° / ${list.tempMax}°</div>
                        </div>`;

        allItem += item;
    }

    document.querySelector('#boxes__day').innerHTML = allItem;
}