// Clé API pour accéder aux données météorologiques
import { API_KEY } from "./config.js";

const arrayCities = localStorage.getItem('arrayCities') ? JSON.parse(localStorage.getItem('arrayCities')) : [{ name: 'Paris' }]

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
	// let item
	let i = 0;
	for (const city of arrayCities) {
		let item = `<div class='city'>
                        <span class="name">${city.name}</span>
                        <span class="temp">${city.temp}°</span>
                        <span class='container-img'>
                        <img src="assets/iconMeteo/${city.icon}.svg" alt="icon meteo" width="64" height="64">
                        </span>
                        ${i === 0 ? "⭐" : ""}
                    </div>`
		i++
		citiesContainer.innerHTML += item
	}
	setListCity()
}

/**
 * Met à jour un tableau de villes en suivant les règles suivantes :
 * 1. Si la ville existe déjà dans le tableau, elle est déplacée au début du tableau.
 * 2. Le tableau est tronqué pour conserver uniquement les 5 premiers éléments s'il en contient plus.
 *
 * @param {Object[]} arrayCities - Le tableau de villes à mettre à jour.
 * @param {Object} cityObj - L'objet contenant les informations de la ville à ajouter/mettre à jour dans le tableau.
 * @returns {Object[]} Le tableau de villes mis à jour.
 */
function rangeArrayCities(arrayCities, cityObj) {
	const indexOfCity = arrayCities.findIndex(c => c.name === cityObj.name);

	if (indexOfCity !== -1) {
		arrayCities.splice(indexOfCity, 1)
	}
	arrayCities.unshift(cityObj)
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

const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
/**
 * Récupère les données météorologiques pour une ville donnée et les affiche sur la page.
 * 
 * @param {string} city - Le nom de la ville pour laquelle récupérer les données météorologiques.
 */
async function getWeatherData(city) {
	try {
		city = city.toLocaleUpperCase();

		// Récupérer les coordonnées géographiques de la ville en utilisant l'API de géolocalisation.
		const coordinates = await getFetchData(`${GEO_API_URL}?q=${city}&limit=5&appid=${API_KEY}`);

		if (coordinates.length === 0) {
			throw new Error('Ville non trouvée!');
		}

		// Récupérer les coordonnées et le nom de la ville à partir des données de géolocalisation.
		const cityName = coordinates[0].name;
		const lat = coordinates[0].lat;
		const lon = coordinates[0].lon;

		// Récupérer les données météorologiques actuelles en utilisant les coordonnées géographiques.
		const dataWeather = await getFetchData(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`);

		// Récupérer les prévisions météorologiques sur 5 jours en utilisant les coordonnées géographiques.
		const weather5day = await getFetchData(`${FORECAST_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`);
		console.log(dataWeather);
		// Créer un objet contenant les données météorologiques actuelles.
		const currentWeather = createWeatherObject(cityName, dataWeather, weather5day);
		console.log('Appel API');
		// Afficher les données météorologiques sur la page.
		addElements(currentWeather);

		const cityObj = {
			name: cityName,
			temp: currentWeather.temp,
			icon: currentWeather.icon
		};
		const newArrayCities = rangeArrayCities(arrayCities, cityObj);
		localStorage.setItem('arrayCities', JSON.stringify(newArrayCities));
		updateListCities(arrayCities);

	} catch (error) {
		console.error("=== ERROR === " + error);
		errorInfo.style.display = 'block';
	}
}

/**
 * Crée un objet contenant les données météorologiques actuelles.
 * 
 * @param {string} cityName - Le nom de la ville.
 * @param {object} dataWeather - Les données météorologiques actuelles.
 * @param {object} weather5day - Les prévisions météorologiques sur 5 jours.
 * @returns {object} L'objet contenant les données météorologiques actuelles.
 */
function createWeatherObject(cityName, dataWeather, weather5day) {
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

	return currentWeather;
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

		showBoxesFor3H(data.list)

		const tempMinMax = getMinMax(data.list)

		showBoxesForDay(data.list, tempMinMax)

		// Supprime le loader
		loader.classList.add('active')
		setTimeout(() => loader.style.display = 'none', 1000)

	} catch (error) {
		console.error("Erreur lors de l'ajout des éléments météorologiques:", error);
	}
}

/**
 * Affiche les boîtes de prévisions météo pour les prochaines heures dans un élément HTML spécifié.
 *
 * @param {Array} data - Les données de prévisions météo pour les prochaines heures.
 */
function showBoxesFor3H(data) {
	const maxItem = 18; // Maximum 36 éléments à afficher

	// Récupération de l'élément conteneur des boîtes de prévisions par heures
	const boxes3H = document.getElementById('boxes__3H');

	if (!boxes3H) {
		console.error("Element with ID 'boxes__3H' not found.");
		return;
	}

	// Nettoyage du contenu précédent
	boxes3H.innerHTML = '';

	// Boucle pour afficher les boîtes de prévisions pour les prochaines heures
	for (let i = 1; i < data.length && i <= maxItem; i++) {
		const [dataDate, dataHour] = data[i].dtTxt.split(' ');

		const item = `<div class="box">
                    <div class="day">${getDayLetter(data[i].dt)}</div>
                    <div class="date">${formatDate(dataDate)}</div>
                    <div class="hour">${formatHour(dataHour)}</div>
                    <div class="icon-container">
                        <img class="icon-hour" src="./assets/iconMeteo/${data[i].icon}.svg" alt="icon météo" width="70" height="70">
                    </div>
                    <div class="temp-hour">${data[i].temp.toFixed(0)}°</div>
                </div>`;

		boxes3H.insertAdjacentHTML('beforeend', item);
	}
}

/**
 * Affiche les boîtes de prévisions météo pour les prochains jours dans un élément HTML spécifié.
 *
 * @param {Array} data - Les données de prévisions météo.
 * @param {Array} tempMinMax - Les valeurs minimales et maximales de température pour chaque jour.
 */
function showBoxesForDay(data, tempMinMax) {
	const NBitemDay = 36; // Maximum 36 éléments à afficher

	// Récupération de l'élément conteneur des boîtes de prévisions par jour
	const boxesDay = document.getElementById('boxes__day');

	if (!boxesDay) {
		console.error("Element with ID 'boxes__day' not found.");
		return;
	}

	// Supprime du tableau, le tableau vide et le jour actuel
	tempMinMax.splice(0, 2);

	// Nettoyage du contenu précédent
	boxesDay.innerHTML = '';

	const [currentDate] = data[1].dtTxt.split(' ');

	// Boucle pour afficher les boîtes de prévisions pour les prochains jours
	for (let i = 1, startMinMax = 0; i <= NBitemDay && i < data.length; i++) {
		const [dataDate, dataHour] = data[i].dtTxt.split(' ');

		// Vérifier si l'heure est 12:00:00 pour afficher la prévision du midi
		if (dataHour === '12:00:00' && dataDate !== currentDate) {
			const item = `<div class="box">
                            <div class="day">${getDayLetter(data[i].dt)}</div>
                            <div class="date">${formatDate(dataDate)}</div>
                            
                            <div class="icon-container">
                                <img class="icon-hour" src="./assets/iconMeteo/${data[i].icon}.svg" alt="icon météo" width="70" height="70">
                            </div>
                            <div class="temp-min-max">${tempMinMax[startMinMax].min}° / ${tempMinMax[startMinMax].max}°</div>
                        </div>`;

			boxesDay.insertAdjacentHTML('beforeend', item);
			startMinMax++;
		}
	}
}

/**
 * Calcule les valeurs minimales et maximales de température pour chaque jour à partir des données fournies.
 *
 * @param {Array} data - Les données de température à traiter.
 * @returns {Array} Un tableau d'objets contenant les valeurs minimales et maximales de température pour chaque jour.
 */
function getMinMax(data) {
	let arrayForDay = [];
	let arraySubForDay = [];
	let newDataDate = '';

	// Parcours des données pour les regrouper par jour
	for (const entry of data) {
		const [dataDate] = entry.dtTxt.split(' ');

		if (newDataDate === dataDate) {
			arraySubForDay.push(entry);
		} else {
			arrayForDay.push(arraySubForDay);
			arraySubForDay = [];
			arraySubForDay.push(entry);
		}
		newDataDate = dataDate;
	}

	let arrayMinMax = [];

	// Calcul des valeurs minimales et maximales pour chaque jour
	for (const forDay of arrayForDay) {
		let tempArray = [];
		for (const day of forDay) {
			tempArray.push(day.temp);
		}

		// Création d'un objet avec les valeurs minimales et maximales
		const nextObject = {
			min: Math.min(...tempArray).toFixed(0),
			max: Math.max(...tempArray).toFixed(0),
		};
		arrayMinMax.push(nextObject);
	}

	return arrayMinMax;
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

// Formulaire ---------------------------------------------------
const formulaire = document.getElementById('form')
formulaire.setCity.addEventListener('input', () => {
	errorInfo.style.display = 'none'
})
formulaire.addEventListener('submit', (e) => {
	e.preventDefault()
	const city = formulaire.setCity.value.trim() || 'paris';
	getWeatherData(city);
	formulaire.reset()
})

getWeatherData(arrayCities[0].name)
updateListCities(arrayCities)

function setListCity() {
	const cities = document.querySelectorAll('#cities__container div')
	cities.forEach(city => city.addEventListener('click', () => {
		getWeatherData(city.firstElementChild.textContent);
	}))
}

// Checked 3H ----------------------------------------
const boxes3H = document.getElementById('boxes__3H');
const checkboxFor3H = document.getElementById('checkFor3H');
const storageKeyFor3H = 'checkFor3H';

// Récupérez la valeur du stockage local et convertissez-la en booléen.
const storedValueFor3H = JSON.parse(localStorage.getItem(storageKeyFor3H));

const DISPLAY_GRID = 'grid';
const DISPLAY_NONE = 'none';

// Si la valeur stockée est nulle, initialisez l'affichage en fonction de la valeur par défaut.
if (storedValueFor3H === null) {
	handleCheckedFor3H();
} else {
	// Déterminez la valeur d'affichage en fonction de la valeur stockée.
	const displayValue = storedValueFor3H ? DISPLAY_GRID : DISPLAY_NONE;
	boxes3H.parentElement.style.display = displayValue;
	checkboxFor3H.checked = storedValueFor3H;
}

checkboxFor3H.addEventListener('change', handleCheckedFor3H);
function handleCheckedFor3H() {
	const isChecked = checkboxFor3H.checked;

	localStorage.setItem(storageKeyFor3H, isChecked);

	const displayValue = isChecked ? DISPLAY_GRID : DISPLAY_NONE;
	boxes3H.parentElement.style.display = displayValue;
}

// Checked Day----------------------------------------
const boxesDay = document.getElementById('boxes__day');
const checkboxForDay = document.getElementById('checkForDay');
const storageKey = 'checkForDay';

// Récupérez la valeur du stockage local et convertissez-la en booléen.
const storedValue = JSON.parse(localStorage.getItem(storageKey));

// Si la valeur stockée est nulle, initialisez l'affichage en fonction de la valeur par défaut.
if (storedValue === null) {
	handleCheckedForDay();
} else {
	// Déterminez la valeur d'affichage en fonction de la valeur stockée.
	const displayValue = storedValue ? DISPLAY_GRID : DISPLAY_NONE;
	boxesDay.parentElement.style.display = displayValue;
	checkboxForDay.checked = storedValue;
}

checkboxForDay.addEventListener('change', handleCheckedForDay);
function handleCheckedForDay() {
	const isChecked = checkboxForDay.checked;

	localStorage.setItem(storageKey, isChecked);

	const displayValue = isChecked ? DISPLAY_GRID : DISPLAY_NONE;
	boxesDay.parentElement.style.display = displayValue;
}