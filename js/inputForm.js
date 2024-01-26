import { fetchWeatherData } from "./script1.js"

export function inputForm() {
    const slider = document.querySelector('.slider')
    const input = slider.querySelector('#setCity')
    const btnOK = slider.querySelector('button')

    input.addEventListener('input', () => {
        document.querySelector('.error-info').style.display = 'none'
    })

    btnOK.addEventListener('click', (e) => {
        e.preventDefault()
        fetchWeatherData(input.value)
        setLocalStorage(input.value)
    })
}


