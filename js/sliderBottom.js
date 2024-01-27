import { getCities } from "./functionsLocal.js";
import { fetchWeatherData } from "./script1.js";

export function sliderBottom() {
    const cities = getCities()
    const citiesContainer = document.querySelector('#cities__container')
    let allItem = ''
    for (const city of cities) {
        allItem += `<p class='container'><span class='city'>${city.name}</span><span class='temp'> ${city.temp}°</span><span class='container-img'><img src='./assets/iconMeteo/${city.weather.icon}.svg'></span></p>`
    }
    citiesContainer.innerHTML = allItem;
    const cityAll = document.querySelectorAll('#cities__container .city')
    cityAll.forEach(city => city.addEventListener('click', (e) => fetchWeatherData(e.target.innerText)))

}