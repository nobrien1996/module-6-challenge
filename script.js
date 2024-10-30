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

    tempPar.textContent = `Temp: ${temp}°F`;
    windPar.textContent = `Wind: ${windSpeed} MPH`;
    humidityPar.textContent = `Humidity: ${humidity} %`;
    cardBody.append(heading, tempPar, windPar, humidityPar);

    todayContainer.innerHTML = '';
    todayContainer.append(card);
}

function renderForecast(forecast) {
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

    col.setAttribute('class', 'columns-md');
}