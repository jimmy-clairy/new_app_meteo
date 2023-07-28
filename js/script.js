// Clé API pour accéder aux données météorologiques
import { keyAPI } from "./config.js";

const arrayCities = localStorage.getItem('arrayCities') ? JSON.parse(localStorage.getItem('arrayCities')) : ['PARIS']

// Élément HTML pour afficher les erreurs
const errorInfo = document.querySelector('.error-info');
// Loader
const loader = document.querySelector('.loader')


/**
 * Met à jour l'affichage d'une liste de villes sur une page web en fonction du contenu du tableau arrayCities.
 * Efface le contenu actuel du conteneur d'affichage (citiesContainer) et ajoute les villes du tableau arrayCities comme des paragraphes (éléments <p>) dans le conteneur.
 *
 * @param {string[]} arrayCities - Le tableau de villes utilisé pour mettre à jour l'affichage.
 */
function updateListCities(arrayCities) {
    const citiesContainer = document.getElementById('cities__container')
    citiesContainer.innerHTML = ''
    let i = 0;
    for (const city of arrayCities) {
        const p = document.createElement('p')
        if (i === 0) {
            p.textContent = `${city} ⭐`
        } else {
            p.textContent = `${city}`
        }
        i++
        citiesContainer.appendChild(p)
    }
    setListCity()
}

/**
 * Met à jour un tableau de villes en suivant les règles suivantes :
 * 1. Si la ville existe déjà dans le tableau, elle est déplacée au début du tableau.
 * 2. Le tableau est tronqué pour conserver uniquement les 3 premiers éléments s'il en contient plus.
 *
 * @param {string[]} arrayCities - Le tableau de villes à mettre à jour.
 * @param {string} city - La ville à ajouter/mettre à jour dans le tableau.
 * @returns {string[]} Le tableau de villes mis à jour.
 */
function rangeArrayCities(arrayCities, city) {
    city = city.toLocaleUpperCase()

    const indexOfCity = arrayCities.findIndex(c => c === city);
    if (indexOfCity !== -1) {
        arrayCities.splice(indexOfCity, 1)
    }
    arrayCities.unshift(city)

    if (arrayCities.length > 5) {
        arrayCities.length = 5;
    }
    return arrayCities
}


/**
 * Effectue une requête HTTP GET sur l'URL spécifiée et renvoie les données au format JSON.
 * @param {string} url - L'URL à partir de laquelle récupérer les données JSON.
 * @returns {Promise} Une promesse résolue avec les données JSON si la requête réussit, ou une promesse rejetée avec l'erreur si la requête échoue.
 */
async function getFetchData(url) {
    try {
        const response = await fetch(url);

        // Vérifier si la réponse est OK (statut HTTP 200-299).
        if (!response.ok) {
            throw new Error('Connexion serveur impossible!');
        }

        // Récupérer et renvoyer les données au format JSON.
        return response.json();
    } catch (error) {
        console.error("Erreur lors de la requête HTTP:", error);
        throw error;
    }
}

/**
 * Récupère les données météorologiques pour une ville donnée et les affiche sur la page.
 * 
 * @param {string} city - Le nom de la ville pour laquelle récupérer les données météorologiques.
 */
async function getWeatherData(city) {
    try {
        // Récupérer les coordonnées géographiques de la ville en utilisant l'API de géolocalisation.
        const coordinates = await getFetchData(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${keyAPI}`);

        // Vérifier si la ville n'a pas été trouvée.
        if (coordinates.length === 0) {
            throw new Error('Ville non trouvée!');
        }

        // Récupérer les coordonnées et le nom de la ville à partir des données de géolocalisation.
        const cityName = coordinates[0].name;
        const lat = coordinates[0].lat;
        const lon = coordinates[0].lon;

        // Récupérer les données météorologiques actuelles en utilisant les coordonnées géographiques.
        const dataWeather = await getFetchData(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keyAPI}&units=metric&lang=fr`);

        // Récupérer les prévisions météorologiques sur 5 jours en utilisant les coordonnées géographiques.
        const weather5day = await getFetchData(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${keyAPI}&units=metric&lang=fr`);

        // Créer un objet contenant les données météorologiques actuelles.
        const currentWeather = {
            cityName: cityName,
            temp: dataWeather.main.temp.toFixed(0),
            feelsLike: dataWeather.main.feels_like.toFixed(0),
            tempMin: dataWeather.main.temp_min.toFixed(0),
            tempMax: dataWeather.main.temp_max.toFixed(0),
            humidity: dataWeather.main.humidity,
            icon: dataWeather.weather[0].icon,
            description: dataWeather.weather[0].description,
            wind: (dataWeather.wind.speed * 3.6).toFixed(0),
            sunrise: dataWeather.sys.sunrise,
            sunset: dataWeather.sys.sunset,
            list: []
        };

        // Ajouter les prévisions horaires aux données météorologiques actuelles.
        weather5day.list.forEach((item) => {
            currentWeather.list.push({
                dt: item.dt,
                dtTxt: item.dt_txt,
                temp: item.main.temp,
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                humidity: item.main.humidity,
                icon: item.weather[0].icon
            });
        });

        // Afficher les données météorologiques sur la page.
        addElements(currentWeather);
        console.log(currentWeather);
        const newArrayCities = rangeArrayCities(arrayCities, cityName)
        // Sauvegarde dans le localStorage le tableau de villes
        localStorage.setItem('arrayCities', JSON.stringify(newArrayCities))
        updateListCities(arrayCities)

    } catch (error) {
        console.error("=== ERROR === " + error);
        errorInfo.style.display = 'block';
    }
}


/**
 * Ajoute les éléments HTML avec les données météorologiques à la page.
 * @param {Object} data - Les données météorologiques à afficher sur la page.
 */
function addElements(data) {
    try {
        // Afficher les données dans les éléments HTML correspondants.

        const cities = document.querySelectorAll('.cityName');
        cities.forEach(city => city.textContent = data.cityName);

        const temp = document.querySelector('.temp');
        temp.textContent = `${data.temp}°`;

        const description = document.querySelector('.description');
        description.textContent = data.description;

        const tempMins = document.querySelectorAll('.temp-min');
        tempMins.forEach(tempMin => tempMin.textContent = `${data.tempMin}°`);

        const tempMaxs = document.querySelectorAll('.temp-max');
        tempMaxs.forEach(tempMax => tempMax.textContent = `${data.tempMax}°`);

        const feels = document.querySelectorAll('.feel');
        feels.forEach(feel => feel.textContent = `${data.feelsLike}°`);

        const iconWeather = document.querySelector('.header-bot__icon-weather');
        iconWeather.src = `assets/iconMeteo/${data.icon}.svg`;

        const humidity = document.querySelector('.humidity');
        humidity.textContent = `${data.humidity}%`;

        const wind = document.querySelector('.wind');
        wind.textContent = `${data.wind} km/h`;

        const sunset = document.querySelector('.sunset');
        sunset.textContent = getLocaleTime(data.sunset);

        const sunrise = document.querySelector('.sunrise');
        sunrise.textContent = getLocaleTime(data.sunrise);

        // Afficher les prévisions météo pour les prochaines heures dans l'élément ayant l'ID 'boxes__hour'.
        const boxesHour = document.getElementById('boxes__hour');
        const NBitem = 36; // Maximum 36 éléments à afficher
        boxesHour.innerHTML = '';
        for (let i = 1; i <= NBitem && i < data.list.length; i++) {
            const [dataDate, dataHour] = data.list[i].dtTxt.split(' ');

            const item = `<div class="box">
                      <div class="day">${getDayLetter(data.list[i].dt)}</div>
                      <div class="date">${formatDate(dataDate)}</div>
                      <div class="hour">${formatHour(dataHour)}</div>
                      <div class="icon-container">
                          <img class="icon-hour" src="./assets/iconMeteo/${data.list[i].icon}.svg" alt="icon sunset">
                      </div>
                      <div class="temp-hour">${data.list[i].temp.toFixed(0)}°</div>
                  </div>`;

            boxesHour.insertAdjacentHTML('beforeend', item);
        }

        // Supprime le loader
        loader.classList.add('active')
        setTimeout(() => loader.style.display = 'none', 1000)

    } catch (error) {
        console.error("Erreur lors de l'ajout des éléments météorologiques:", error);
    }
}


/**
 * Obtient le nom du jour de la semaine à partir d'un horodatage Unix.
 * @param {number} timestamp - L'horodatage Unix (en secondes) pour lequel récupérer le nom du jour.
 * @returns {string} Le nom du jour de la semaine (en français).
 */
function getDayLetter(timestamp) {
    try {
        // Convertir l'horodatage en millisecondes, car Date() attend des millisecondes.
        const date = new Date(timestamp * 1000);

        // Obtenir le numéro du jour de la semaine (0 pour dimanche, 1 pour lundi, etc.).
        const dayNumber = date.getDay();

        // Tableau contenant les noms des jours de la semaine en français.
        const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        // Récupérer le nom du jour de la semaine à partir du tableau daysOfWeek.
        const dayName = daysOfWeek[dayNumber];

        return dayName;
    } catch (error) {
        console.error("Erreur lors de la récupération du nom du jour de la semaine:", error);
        return '';
    }
}


/**
 * Formate une heure au format "HH:mm:ss" en "HH:mm".
 * @param {string} hour - L'heure à formater au format "HH:mm:ss".
 * @returns {string} L'heure formatée au format "HH:mm".
 */
function formatHour(hour) {
    try {
        // Séparer l'heure, les minutes et les secondes en utilisant ":" comme délimiteur.
        const [hourPart, minutesPart] = hour.split(':');

        // Formater l'heure au format "HH:mm".
        const formattedHour = `${hourPart}:${minutesPart}`;

        return formattedHour;
    } catch (error) {
        console.error("Erreur lors du formatage de l'heure:", error);
        return '';
    }
}

/**
 * Formate une date au format "YYYY-MM-DD" en "MM-DD".
 * @param {string} date - La date à formater au format "YYYY-MM-DD".
 * @returns {string} La date formatée au format "MM-DD".
 */
function formatDate(date) {
    try {
        // Séparer l'année, le mois et le jour en utilisant "-" comme délimiteur,

        const [year, month, day] = date.split('-');
        // Formater la date au format "DD-MM".
        const formattedDate = `${day}-${month}`;

        return formattedDate;
    } catch (error) {
        console.error("Erreur lors du formatage de la date:", error);
        return '';
    }
}


/**
 * Récupère l'heure locale (au format "HH:mm") à partir d'un horodatage Unix.
 * @param {number} timestamp - L'horodatage Unix (en secondes) pour lequel récupérer l'heure locale.
 * @returns {string} L'heure locale formatée au format "HH:mm".
 */
function getLocaleTime(timestamp) {
    try {
        // Convertir l'horodatage en millisecondes, car Date() attend des millisecondes.
        const date = new Date(timestamp * 1000);

        // Obtenir l'heure locale sous forme de chaîne de caractères (ex: "HH:mm:ss").
        const time = date.toLocaleTimeString();

        // Séparer l'heure, les minutes et les secondes en utilisant ":" comme délimiteur.
        const [hour, minutes] = time.split(':');

        // Formater l'heure au format "HH:mm".
        const formattedTime = `${hour}:${minutes}`;

        return formattedTime;
    } catch (error) {
        console.error("Erreur lors de la conversion de l'horodatage en heure locale:", error);
        return '';
    }
}


// Slider ------------------------------------------------
const sliderBtn = document.querySelector(".slider-btn")
const slider = document.querySelector(".slider")

sliderBtn.addEventListener("click", toggleNav)

function toggleNav() {
    sliderBtn.classList.toggle("active")
    slider.classList.toggle("active")
}

// Form ---------------------------------------------------
const form = document.getElementById('form')
form.setCity.addEventListener('input', () => {
    errorInfo.style.display = 'none'
})
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const city = form.setCity.value.trim() || 'paris';
    getWeatherData(city);
    form.reset()
})

getWeatherData(arrayCities[0])
updateListCities(arrayCities)

function setListCity() {
    const cities = document.querySelectorAll('#cities__container p')
    cities.forEach(city => city.addEventListener('click', () => {
        getWeatherData(city.textContent);
    }))
}