import { formatTimestamp } from './functionsUtiles.js';

/**
 * Asynchronously fetches data from a given URL.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} - A promise that resolves with the fetched data.
 * @throws {Error} - Throws an error if the server connection is not successful.
 */
async function getDataCity(url) {
    console.log('Appel API');
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Server connection failed');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

/**
 * Creates a weather object for a given city.
 * @param {string} [city='paris'] - The name of the city to retrieve weather information for.
 * @returns {Promise<Object>} - A promise resolved with an object containing weather information for the city.
 * @throws {Error} - If the city is not found or an error occurs while fetching weather data.
 * @example
 * const weatherData = await createWeatherObject('paris');
 * console.log('Weather Information:', weatherData);
 */
export async function createWeatherObject(city = 'paris') {
    try {
        const API_KEY = '6f43c7305020f81c3276859a5f0cd312';

        // Fetching city coordinates
        const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct";
        const GEO_URL = `${GEO_API_URL}?q=${city}&limit=1&appid=${API_KEY}`;
        const data = await getDataCity(GEO_URL);

        // Checking if the city is found
        if (data.length === 0) {
            document.querySelector('.error-info').style.display = 'block'
            throw new Error('City not found');
        }

        const dataCity = data[0];

        // Fetching current weather data
        const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
        const WEATHER_URL = `${WEATHER_API_URL}?lat=${dataCity.lat}&lon=${dataCity.lon}&appid=${API_KEY}&units=metric&lang=fr`;
        const dataCity1 = await getDataCity(WEATHER_URL);

        // Fetching weather forecast data
        const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
        const FORECAST_URL = `${FORECAST_API_URL}?lat=${dataCity.lat}&lon=${dataCity.lon}&appid=${API_KEY}&units=metric&lang=fr`;
        const dataCity2 = await getDataCity(FORECAST_URL);

        // Building an object containing all weather information
        const dataCityAll = {
            name: dataCity.name,
            temp: dataCity1.main.temp.toFixed(0),
            tempMin: dataCity1.main.temp_min.toFixed(0),
            tempMax: dataCity1.main.temp_max.toFixed(0),
            feel: dataCity1.main.feels_like.toFixed(0),
            humidity: dataCity1.main.humidity,
            wind: (dataCity1.wind.speed * 3.6).toFixed(0),
            sunrise: formatTimestamp(dataCity1.sys.sunrise, { hour: 'numeric', minute: 'numeric' }).replace(':', 'h'),
            sunset: formatTimestamp(dataCity1.sys.sunset, { hour: 'numeric', minute: 'numeric' }).replace(':', 'h'),
            weather: dataCity1.weather[0],
            list: dataCity2.list
        };

        return dataCityAll;
    } catch (error) {
        console.error(error.message);
        throw error; // Rejects the error to allow for future handling by the caller, if necessary.
    }
}