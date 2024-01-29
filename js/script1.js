import { addCity, getCities } from "./functionsLocalStorage.js";
import { createWeatherObject } from "./getWeatherObject.js";
import { showBoxesDay } from "./showBoxesDay.js";
import { showBoxesHour } from "./showBoxesHour.js";
import { getChecked, showListCity } from "./sliderBottom.js";
import { inputForm, sliderTopInfo } from "./sliderTop.js";

/**
 * Asynchronously fetches weather data for a specified city and logs the result.
 * @param {string} cityName - The name of the city for which weather data is fetched.
 * @returns {Promise<void>} - A promise that resolves once the weather data is fetched and processed.
 */
export async function fetchWeatherData(cityName) {

    const cities = getCities()
    if (!cityName && cities.length === 0) {
        cityName = 'paris'
    } else if (!cityName && cities.length !== 0) {
        cityName = cities[0].name
    }

    try {
        const weatherData = await createWeatherObject(cityName);

        if (weatherData) {
            document.querySelector('.loader').classList.add('active');


            addCity(weatherData);
            showDataCityHeader(weatherData);
            showDataCityCards(weatherData);
            showBoxesDay(weatherData);
            showBoxesHour(weatherData);
            sliderTopInfo(weatherData);
            showListCity()
            return weatherData
        }
    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Displays weather data in the header section of the page.
 * @param {Object} weatherData - The weather data object.
 */
function showDataCityHeader(weatherData) {
    const { temp, weather, name, tempMin, tempMax, feel } = weatherData;
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
 * @param {Object} weatherData - The weather data object.
 */
function showDataCityCards(weatherData) {
    const { humidity, wind, sunrise, sunset } = weatherData;
    const boxes = document.querySelector('.boxes__current');

    boxes.querySelector('.humidity').textContent = `${humidity} %`;
    boxes.querySelector('.wind').textContent = `${wind} km/h`;
    boxes.querySelector('.sunrise').textContent = sunrise;
    boxes.querySelector('.sunset').textContent = sunset;
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

// Initialization
fetchWeatherData()
slider()
inputForm()
getChecked()