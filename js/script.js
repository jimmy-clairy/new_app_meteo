const keyAPI = '6f43c7305020f81c3276859a5f0cd312'
const city = 'Paris'
const errorInfo = document.querySelector('.error-info')

async function getFetchData(url) {
    try {
        const resJSON = await fetch(url)
        if (!resJSON.ok) {
            throw new Error('Connexion serveur impossible!')
        }
        return resJSON.json()

    } catch (error) {
        console.error("=== ERROR === " + error);
    }
}

async function getWeatherData(city) {
    try {
        const coordinates = await getFetchData(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${keyAPI}`)

        if (coordinates.length === 0) {
            throw new Error('Ville non trouvée!')
        }

        const cityName = coordinates[0].name
        const lat = coordinates[0].lat
        const lon = coordinates[0].lon
        // console.log("Coordinates" + cityName, lat, lon);

        const dataWeather = await getFetchData(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keyAPI}&units=metric&lang=fr`)
        // console.log(dataWeather);
        const weather5day = await getFetchData(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${keyAPI}&units=metric&lang=fr`)
        // console.log(weather5day);

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
        }

        weather5day.list.forEach((item) => {
            currentWeather.list.push({
                dt: item.dt,
                dtTxt: item.dt_txt,
                temp: item.main.temp,
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                humidity: item.main.humidity,
                icon: item.weather[0].icon
            })
        })

        addElements(currentWeather)
    } catch (error) {
        console.error("=== ERROR === " + error);

        errorInfo.style.display = 'block'
    }

}

getWeatherData(city)

function addElements(data) {
    console.log(data);
    const cities = document.querySelectorAll('.cityName')
    cities.forEach(city => city.textContent = data.cityName)

    const temp = document.querySelector('.temp')
    temp.textContent = `${data.temp}°`

    const description = document.querySelector('.description')
    description.textContent = data.description

    const tempMins = document.querySelectorAll('.temp-min')
    tempMins.forEach(tempMin => tempMin.textContent = `${data.tempMin}°`)

    const tempMaxs = document.querySelectorAll('.temp-max')
    tempMaxs.forEach(tempMax => tempMax.textContent = `${data.tempMax}°`)

    const feels = document.querySelectorAll('.feel')
    feels.forEach(feel => feel.textContent = `${data.feelsLike}°`)

    const iconWeather = document.querySelector('.header-bot__icon-weather')
    iconWeather.src = `assets/iconMeteo/${data.icon}.svg`
}

// Slider
const sliderBtn = document.querySelector(".slider-btn")
const slider = document.querySelector(".slider")

sliderBtn.addEventListener("click", toggleNav)

function toggleNav() {
    sliderBtn.classList.toggle("active")
    slider.classList.toggle("active")
}

// Form
const form = document.getElementById('form')
form.setCity.addEventListener('input', () => {
    errorInfo.style.display = 'none'
})
form.addEventListener('submit', (e) => {
    e.preventDefault()
    getWeatherData(form.setCity.value.trim() || 'paris')
    // form.reset()
})