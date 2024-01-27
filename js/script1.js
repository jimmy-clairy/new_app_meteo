import { getCities } from "./functionsLocal.js";
import { createWeatherObject } from "./getWeatherObject.js";
import { inputForm } from "./inputForm.js";
import { showBoxesDay } from "./showBoxesDay.js";
import { showBoxesHour } from "./showBoxesHour.js";
import { sliderBottom } from "./sliderBottom.js";

/**
 * Asynchronously fetches weather data for a specified city and logs the result.
 * @param {string} cityName - The name of the city for which weather data is fetched.
 * @returns {Promise<void>} - A promise that resolves once the weather data is fetched and processed.
 */
export async function fetchWeatherData(cityName) {
    if (!cityName) {
        cityName = getCities()[0].name
    }
    try {
        const weatherData = await createWeatherObject(cityName);
        console.log(weatherData);

        if (weatherData) {
            document.querySelector('.loader').classList.add('active');

            showDataCityHeader(weatherData);
            showDataCityCards(weatherData);
            showBoxesDay(weatherData);
            showBoxesHour(weatherData);
            sliderTopInfo(weatherData);
            sliderBottom()

            return weatherData

        }
    } catch (error) {
        console.error(error.message);
    }
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

function sliderTopInfo(weatherData) {
    const { name, tempMin, tempMax, feel } = weatherData

    const sliderTop = document.querySelector('.slider__top')
    sliderTop.querySelector('.cityName').textContent = name
    sliderTop.querySelector('.temp-min').textContent = tempMin
    sliderTop.querySelector('.temp-max').textContent = tempMax
    sliderTop.querySelector('.feel').textContent = feel
}

fetchWeatherData()
slider()
inputForm()