import { getCities } from "./functionsLocalStorage.js";
import { fetchWeatherData } from "./script1.js";

function handleClickCity() {
    const cityAll = document.querySelectorAll('#cities__container .city')

    cityAll.forEach(city => city.addEventListener('click', (e) => {
        fetchWeatherData(e.target.innerText)
    }))
}

export function showListCity() {
    const cities = getCities()
    const citiesContainer = document.querySelector('#cities__container')
    let allItemHTML = ''
    for (const city of cities) {
        allItemHTML += `<p class='container'>
                        <span class='city'>${city.name}</span>
                        <span class='temp'> ${city.temp}°</span>
                        <span class='container-img'><img src='./assets/iconMeteo/${city.weather.icon}.svg'></span>
                    </p>`
    }
    citiesContainer.innerHTML = allItemHTML;
    handleClickCity()
}

export function getChecked() {
    const checkForDay = document.querySelector('#checkForDay');
    const checkFor3H = document.querySelector('#checkFor3H');

    const boxesDay = 'boxes__day';
    const boxes3H = 'boxes__3H';

    initializeCheckbox(boxesDay, checkForDay);
    initializeCheckbox(boxes3H, checkFor3H);
}

function initializeCheckbox(storageKey, checkboxElement) {
    checkboxElement.checked = getLocalStorageValue(storageKey);
    toggleBoxes(storageKey, checkboxElement.checked);

    checkboxElement.addEventListener('click', () => {
        localStorage.setItem(storageKey, checkboxElement.checked);
        toggleBoxes(storageKey, checkboxElement.checked);
    });
}

function getLocalStorageValue(key) {
    return JSON.parse(localStorage.getItem(key)) || false;
}

function toggleBoxes(type, isChecked) {
    const element = document.getElementById(type);
    const elementParent = element.closest('.boxes');
    elementParent.style.display = isChecked ? 'grid' : 'none';
}