export function getCities() {
    const getCities = localStorage.getItem('Cities')

    if (getCities === null) {
        return []
    }

    return JSON.parse(getCities)
}

export function addCity(cityName) {
    let cities = getCities()
    cities = cities.filter(objet => objet.name !== cityName.name);
    cities.unshift(cityName)
    if (cities.length > 5) {
        cities.pop()
    }
    localStorage.setItem('Cities', JSON.stringify(cities))
}