import { fetchWeatherData } from "./script1.js"

const sliderTop = document.querySelector('.slider__top')

export function sliderTopInfo(weatherData) {
    const { name, tempMin, tempMax, feel } = weatherData

    sliderTop.querySelector('.cityName').textContent = name
    sliderTop.querySelector('.temp-min').textContent = `${tempMin}°`;
    sliderTop.querySelector('.temp-max').textContent = `${tempMax}°`;
    sliderTop.querySelector('.feel').textContent = `${feel}°`;
}

export function inputForm() {

    const input = sliderTop.querySelector('#setCity')
    const btnOK = sliderTop.querySelector('button')

    input.addEventListener('input', () => {
        document.querySelector('.error-info').style.display = 'none'
    })

    btnOK.addEventListener('click', (e) => {
        e.preventDefault()
        fetchWeatherData(input.value)
    })
}