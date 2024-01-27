import { addCity } from "./functionsLocal.js"
import { fetchWeatherData } from "./script1.js"
import { sliderBottom } from "./sliderBottom.js"

export function inputForm() {
    const slider = document.querySelector('.slider')
    const input = slider.querySelector('#setCity')
    const btnOK = slider.querySelector('button')

    input.addEventListener('input', () => {
        document.querySelector('.error-info').style.display = 'none'
    })

    btnOK.addEventListener('click', async (e) => {
        e.preventDefault()
        const { name, temp, weather } = await fetchWeatherData(input.value)

        addCity({ name, temp, weather })
        sliderBottom()
    })
}