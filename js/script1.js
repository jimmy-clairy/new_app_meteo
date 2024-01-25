import { createWeatherObject } from "./getWeatherObject.js";
import formateTimestamp from "./formateTimestamp.js";

/**
 * Fetches weather data for a specific city and logs the result.
 * @param {string} cityName - The name of the city for which weather data is fetched.
 * @returns {Promise<Object>} - A promise that resolves to the weather data object.
 */
const cityData = await createWeatherObject('narbonne');
console.log(cityData);

if (cityData) {
    document.querySelector('.loader').classList.add('active');
    slider();
    showDataCityHeader();
    showDataCityCards();
    boxesDay();
}

/**
 * Initializes the slider functionality.
 */
function slider() {
    const sliderBtn = document.querySelector(".slider-btn");
    const slider = document.querySelector(".slider");

    sliderBtn.addEventListener("click", toggleNav);

    function toggleNav() {
        sliderBtn.classList.toggle("active");
        slider.classList.toggle("active");
    }
}

/**
 * Displays weather data in the header section of the page.
 */
function showDataCityHeader() {
    const { temp, weather, name, tempMin, tempMax, feel } = cityData;
    const headerBot = document.querySelector('.header-bot');

    headerBot.querySelector('.temp').textContent = `${temp}°`;
    headerBot.querySelector('.description.active').textContent = weather.description;
    headerBot.querySelector('.cityName').textContent = name;
    headerBot.querySelector('.temp-min').textContent = `${tempMin}°`;
    headerBot.querySelector('.temp-max').textContent = `${tempMax}°`;
    headerBot.querySelector('.feel').textContent = `${feel}°`;
    headerBot.querySelector('.header-bot__icon-weather').src = `./assets/iconMeteo/${weather.icon}.svg`;
}

/**
 * Displays weather data in the card section of the page.
 */
function showDataCityCards() {
    const { humidity, wind, sunrise, sunset } = cityData;
    const boxes = document.querySelector('.boxes__current');

    boxes.querySelector('.humidity').textContent = `${humidity} %`;
    boxes.querySelector('.wind').textContent = `${wind} km/h`;
    boxes.querySelector('.sunrise').textContent = sunrise;
    boxes.querySelector('.sunset').textContent = sunset;
}

/**
 * Filters out the current day from the list of days in the weather data.
 * @param {Object} cityData - The weather data object.
 * @returns {Array} - The list of days excluding the current day.
 */
function supCurrentDay(cityData) {
    const currentDay = formateTimestamp(Math.floor(Date.now() / 1000), { weekday: 'long' }).split(' ')[0];
    const listDays = cityData.list;

    return listDays.filter(list => currentDay !== formateTimestamp(list.dt, { weekday: 'long' }).split(' ')[0]);
}

/**
 * Groups weather data by day, limiting to a maximum number of days.
 * @param {Object} cityData - The weather data object.
 * @returns {Array} - The grouped weather data by day.
 */
function groupForDay(cityData) {
    const listDays = supCurrentDay(cityData);
    const groupedDays = [];
    const numberMaxOfDays = 4;

    let currentDay = '';
    let currentGroupIndex = -1;

    for (const listItem of listDays) {
        const dayFormat = formateTimestamp(listItem.dt, { weekday: 'long' }).split(' ')[0];

        if (currentDay !== dayFormat) {
            currentGroupIndex++;
            if (currentGroupIndex === numberMaxOfDays) {
                break;
            }

            const numericDate = listItem.dt_txt.split(' ')[0];
            const [year, month, day] = numericDate.split('-');

            currentDay = dayFormat;
            groupedDays.push({ day: currentDay, date: `${day}/${month}`, icon: '', temps: [], icons: [] });
        }

        groupedDays[currentGroupIndex].temps.push(Math.floor(listItem.main.temp));
        groupedDays[currentGroupIndex].icons.push(listItem.weather[0].icon);
    }

    for (const item of groupedDays) {
        item.tempMin = Math.min(...item.temps);
        item.tempMax = Math.max(...item.temps);
        item.icon = item.icons[4];
        delete item.temps;
        delete item.icons;
    }

    return groupedDays;
}

/**
 * Displays weather data for each day in a card format.
 */
function boxesDay() {
    const listDays = groupForDay(cityData);

    let allItem = '';
    for (const list of listDays) {
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