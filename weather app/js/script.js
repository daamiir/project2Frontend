// Define API key as a constant for better maintainability
const apiKey = "f5aee948906b2f4696cd11e72c6f6cf0";

let currentUnit = null;

// Add event listener for search button
document.querySelector(".search-button").addEventListener("click", () => {
    getCurrentUnit();
    getCurrentWeather();
    getForecast();
});


function getCurrentUnit() {
    // Select all inputs with the class 'my-checkbox'
    const switchInputs = document.querySelectorAll('.switch');

    switchInputs.forEach((switchInput) =>{
        if(switchInput.checked){
            currentUnit = switchInput.value;
        }
    });
}

async function getCurrentWeather() {
    const city = document.querySelector(".search-bar").value;
    let units = 'metric';

    if(currentUnit === 'F'){
        units = 'imperial';
    }else{
        units = 'metric';
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?units=${units}&q=${city}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function displayWeather(data) {
    const cityNameContainer = document.querySelector('.city-name');
    const dateContainer = document.querySelector('.date');
    const iconContainer = document.querySelector('.icon');
    const tempContainer = document.querySelector('.temperature');
    const humidityContainer = document.querySelector('.humidity');
    const windContainer = document.querySelector('.wind');
    const descriptionContainer = document.querySelector('.description');

    const city = data.name;
    const temp = data.main.temp;
    const weather = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    cityNameContainer.textContent = city;
    tempContainer.textContent = `${Math.round(temp)}°C`;
    humidityContainer.textContent = `💧 ${humidity}%`;
    windContainer.textContent = `Wind ${windSpeed} km/h`;
    descriptionContainer.textContent = weather;
    iconContainer.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weather}">`;

    const currentDate = new Date();
    dateContainer.textContent = `${currentDate.toLocaleDateString("en-US", { weekday: "long" })} ${currentDate.toLocaleDateString("en-US")}`;
}

async function getForecast() {
    const city = document.querySelector(".search-bar").value;
    let units = 'metric';

    if(currentUnit === 'F'){
        units = 'imperial';
    }else{
        units = 'metric';
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");

        const dataForForecast = await response.json();
        console.log(dataForForecast);
        displayExample(dataForForecast);
    } catch (error) {
        console.error(error);
    }
}

function displayExample(data) {
    const forecastContainer = document.querySelector('.forecast-grid');
    forecastContainer.innerHTML = "";  // Clear previous forecasts

    let tempMax = null;
    let tempMin = null;

    data.list.forEach((forecast, index) => {
        const tempMinEvery3Hours = Math.round(forecast.main.temp_min);
        const tempMaxEvery3Hours = Math.round(forecast.main.temp_max);

        if (tempMax === null || tempMin === null) {
            tempMax = tempMaxEvery3Hours;
            tempMin = tempMinEvery3Hours;
        }

        if(tempMax < tempMaxEvery3Hours){
            tempMax = tempMaxEvery3Hours;
        }

        if(tempMin > tempMinEvery3Hours){
            tempMin = tempMinEvery3Hours;
        }

        if (index % 8 === 0) {  // Approx. every 24 hours
            const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
            const weather = forecast.weather[0].description;
            const icon = forecast.weather[0].icon;

            const forecastHTML = `
                <div class="day">
                    <p class="day-name">${date}</p>
                    <div class="day-icon"><img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weather}"></div>
                    <p class="temp-high">${tempMax}°</p>
                    <p class="temp-low">${tempMin}°</p>
                    <p class="condition">${weather}</p>
                </div>
            `;
            forecastContainer.innerHTML += forecastHTML;

            tempMax = null;
            tempMin = null;
        }
    });
}
