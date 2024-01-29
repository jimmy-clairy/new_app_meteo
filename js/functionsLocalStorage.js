export function getCities() {
    const getCities = localStorage.getItem('Cities')

    if (getCities === null) {
        return []
    }

    return JSON.parse(getCities)
}

export function addCity(weatherData) {
    const { name, temp, weather } = weatherData

    let cities = getCities()
    cities = cities.filter(objet => objet.name !== name);
    cities.unshift({ name, temp, weather })

    if (cities.length > 5) {
        cities.pop()
    }

    localStorage.setItem('Cities', JSON.stringify(cities))
}