/**
 * Retrieves the list of cities stored in the local storage.
 * @returns {Array} - An array of city objects.
 * @throws {Error} - Throws an error if there is an issue parsing the stored cities.
 */
export function getCities() {
    const storedCities = localStorage.getItem('Cities');

    try {
        return storedCities ? JSON.parse(storedCities) : [];
    } catch (error) {
        console.error('Error parsing stored cities:', error);
        throw new Error('Error retrieving cities from local storage');
    }
}

/**
 * Adds a city to the list of stored cities in the local storage.
 * @param {Object} weatherData - The weather data object for the city.
 * @param {string} weatherData.name - The name of the city.
 * @param {string} weatherData.temp - The temperature of the city.
 * @param {Object} weatherData.weather - The weather information for the city.
 */
export function addCity(weatherData) {
    const { name, temp, weather } = weatherData;

    let cities = getCities();
    cities = cities.filter(({ name: cityName }) => cityName !== name);
    cities.unshift({ name, temp, weather });

    const MAX_CITIES = 5;

    if (cities.length > MAX_CITIES) {
        cities.pop();
    }

    localStorage.setItem('Cities', JSON.stringify(cities));
}
