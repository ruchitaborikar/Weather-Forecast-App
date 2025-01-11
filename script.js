const apiKey = '32df750b7b65eedb9a76aae32a84e00a';  // Replace with your actual API key
const baseURL = 'https://api.openweathermap.org/data/2.5/weather';
const forecastURL = 'https://api.openweathermap.org/data/2.5/forecast';

// Fetch weather data for a city
async function getCityWeather() {
    const city = document.getElementById('city').value;
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    await getWeather(city);
}

// Fetch weather data for the user's current location
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await getWeather(null, lat, lon);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Fetch weather data from the API
async function getWeather(city = null, lat = null, lon = null) {
    let url = city ? `${baseURL}?q=${city}&appid=${apiKey}&units=metric` : `${baseURL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayWeather(data);
        updateRecentSearches(city || `${data.name}, ${data.sys.country}`);
        await getExtendedForecast(city || data.name);
    } catch (error) {
        document.getElementById('weather-display').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Display weather data
function displayWeather(data) {
    const weatherDisplay = document.getElementById('weather-display');
    weatherDisplay.innerHTML = `
        <p><strong>Location:</strong> ${data.name}, ${data.sys.country}</p>
        <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} km/h</p>
        <p><strong>Weather:</strong> ${data.weather[0].description}</p>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
    `;
}

// Store and display recent searches using localStorage
function updateRecentSearches(city) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (!recentSearches.includes(city)) {
        recentSearches.unshift(city);
        if (recentSearches.length > 5) recentSearches.pop();
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
    populateRecentSearches();
}

// Populate the dropdown with recent searches
function populateRecentSearches() {
    const dropdown = document.getElementById('recent-searches');
    dropdown.innerHTML = '<option value="">Select Recent Search</option>';
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recentSearches.forEach(city => {
        dropdown.innerHTML += `<option value="${city}">${city}</option>`;
    });
}

// Fetch and display extended forecast
async function getExtendedForecast(city) {
    const url = `${forecastURL}?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error fetching extended forecast');
        }
        const data = await response.json();
        displayExtendedForecast(data);
    } catch (error) {
        console.error(error);
    }
}

// Display extended forecast
function displayExtendedForecast(data) {
    const forecastDisplay = document.getElementById('forecast-display');
    forecastDisplay.innerHTML = '';  // Clear previous data

    // Show forecast for 5 days, each day at 12:00 PM
    const filteredForecast = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    filteredForecast.forEach(forecast => {
        forecastDisplay.innerHTML += `
            <div class="card">
                <p><strong>Date:</strong> ${new Date(forecast.dt_txt).toLocaleDateString()}</p>
                <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather icon">
                <p><strong>Temp:</strong> ${forecast.main.temp}°C</p>
                <p><strong>Wind:</strong> ${forecast.wind.speed} km/h</p>
                <p><strong>Humidity:</strong> ${forecast.main.humidity}%</p>
            </div>
        `;
    });
}

// Initialize recent searches on page load
document.addEventListener('DOMContentLoaded', populateRecentSearches);
