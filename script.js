let searchHistory = [];

//SETTING API INFO
const weatherApiRootUrl = 'https://api.openweathermap.org';
const WeatherApiKey = '50b1030cf1dbdda37df102829f6e4c07';


//REFERENCES FOR DOM ELEMENTS
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const todayContainer = document.querySelector('#today');
const forecastContainer = document.querySelector('#forecast');
const searchHistoryContainer = document.querySelector('#history');

//SET TIMEZONES
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);


//FUNCTION TO RENDER SEARCHES WITH FOR LOOP
function renderSearches() {
    searchHistoryContainer.innerHTML = '';
    for (let i = searchHistory.length - 1; i >= 0; i--) {
        const btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-controls', 'today forecast');
        btn.classList.add('history-btn', 'btn-history');
        btn.setAttribute('data-search', searchHistory[i]);
        btn.textContent = searchHistory[i];
        searchHistoryContainer.append(btn);
    }
}

//FUNCTION TO UPDATE LOCAL STORAGE HISTORY AND DISPLAYED HISTORY
function appendHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    }
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    renderSearches();
}

//GRAB SEARCH HISTORY FROM LOCAL STORAGE
function initHistory() {
    const storedHistory = localStorage.getItem('search-history');
    if (storedHistory) {
        searchHistory = JSON.parse(storedHistory);
    }
    renderSearches();
}

//FUNCTION TO GRAB AND DISPLAY DATA FROM API
function renderWeather(city, weather) {
    const date = dayjs().format('M/D/YY');
    const temp = weather.main.temp;
    const windSpeed = weather.wind.speed;
    const humidity = weather.main.humidity;
    const iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    const iconDescription = weather.weather[0].description || weather[0].main;

    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const heading = document.createElement('h2');
    const weatherPic = document.createElement('img');
    const tempPar = document.createElement('p');
    const windPar = document.createElement('p');
    const humidityPar = document.createElement('p');

    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);
    heading.setAttribute('class', 'h3 card-title');
    tempPar.setAttribute('class', 'card-text');
    windPar.setAttribute('class', 'card-text');
    humidityPar.setAttribute('class', 'card-text');

    heading.textContent = `${city} (${date})`;
    weatherPic.setAttribute('src', iconUrl);
    weatherPic.setAttribute('alt', iconDescription);
    weatherPic.setAttribute('class', 'weather-img');
    heading.append(weatherPic);

    tempPar.textContent = `Temp: ${temp} °F`;
    windPar.textContent = `Wind: ${windSpeed} MPH`;
    humidityPar.textContent = `Humidity: ${humidity} %`;
    cardBody.append(heading, tempPar, windPar, humidityPar);

    todayContainer.innerHTML = '';
    todayContainer.append(card);
}

//FORECAST CARD FUNCTION
function renderForecastCard(forecast) {
    const iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    const iconDescription = forecast.weather[0].description;
    const temp = forecast.main.temp;
    const humidity = forecast.main.humidity;
    const windSpeed = forecast.wind.speed;

    const col = document.createElement('div');
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardTitle = document.createElement('h5');
    const weatherPic = document.createElement('img');
    const tempPar = document.createElement('p');
    const windPar = document.createElement('p');
    const humidityPar = document.createElement('p');

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherPic, tempPar, windPar, humidityPar);

    col.setAttribute('class', 'columns');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempPar.setAttribute('class', 'card-text');
    windPar.setAttribute('class', 'card-text');
    humidityPar.setAttribute('class', 'card-text');

    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YY');
    weatherPic.setAttribute('src', iconUrl);
    weatherPic.setAttribute('alt', iconDescription);
    tempPar.textContent = `Temp: ${temp} °F`;
    windPar.textContent = `Wind: ${windSpeed} MPH`;
    humidityPar.textContent = `Humidity: ${humidity} %`;

    forecastContainer.append(col);
}

//DISPLAY 5-DAY FORECAST
function renderForecast(dailyForecast) {
    const startDate = dayjs().add(1, 'day').startOf('day').unix();
    const endDate = dayjs().add(6, 'day').startOf('day').unix();
    const headingColumn = document.createElement('div');
    const heading = document.createElement('h4');

    headingColumn.setAttribute('class', 'column-12');
    heading.textContent = '5-Day Forecast';
    headingColumn.append(heading);

    forecastContainer.innerHTML = '';
    forecastContainer.append(headingColumn);

    for (let i = 0; i < dailyForecast.length; i++) {
        if (dailyForecast[i].dt >= startDate && dailyForecast[i].dt < endDate) {
            if (dailyForecast[i].dt_txt.slice(11, 13) == '12') {
                renderForecastCard(dailyForecast[i]);
            }
        }
    }
}

//RENDER LOCATIONS
function renderItems(city, data) {
    renderCurrentWeather(city, data.list[0], data.city.timezone);
    renderForecast(data.list);
}

//FETCH AND DISPLAY DATA FOR INDIVIDUAL LOCATION
function fetchWeather(location) {
    const {lat} = location;
    const {lon} = location;
    const city = location.name;

    const apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${WeatherApiKey}`;

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            renderItems(city, data);
        })
        .catch(function (err) {
            console.error(err);
        })
}

function fetchLoc(search) {
    const apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${WeatherApiKey}`;

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert('Better luck looking for Atlantis');
            } else {
                appendHistory(search);
                fetchWeather(data[0]);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

function searchSubmit(e) {
    if (!searchInput.value) {
        return;
    }

    e.preventDefault();
    const search = searchInput.value.trim();
    fetchLoc(search);
    searchInput.value = '';
}

function searchHistoryClick(e) {
    if (!e.target.matches('.btn-history')) {
        return;
    }
    const btn = e.target;
    const search = btn.getAttribute('data-search');
    fetchLoc(search);
}

document.addEventListener('DOMContentLoaded', function() {
    initHistory();
    searchForm.addEventListener('submit', searchSubmit);
    searchHistoryContainer.addEventListener('click', searchHistoryClick);
});