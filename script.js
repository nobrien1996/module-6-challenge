let searchHistory = [];

//SETTING API INFO
const weatherApiRootUrl = 'https://api.openweathermap.org';
const WeatherApiKey = '8ac9c5c8f10a09b02e884b106142eb64';


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
        btn.style.margin = '5px';
        btn.style.padding = '10px';
        btn.style.backgroundColor = '#007bff';
        btn.style.color = '#ffffff';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
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

    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '5px';
    card.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    card.style.margin = '10px';
    card.style.padding = '15px';
    
    cardBody.style.padding = '10px';
    heading.style.fontSize = '1.5em';
    heading.style.marginBottom = '10px';

    heading.textContent = `${city} (${date})`;
    weatherPic.setAttribute('src', iconUrl);
    weatherPic.setAttribute('alt', iconDescription);
    weatherPic.style.width = '50px'; 
    heading.append(weatherPic);

    tempPar.textContent = `Temp: ${temp} °F`;
    windPar.textContent = `Wind: ${windSpeed} MPH`;
    humidityPar.textContent = `Humidity: ${humidity} %`;
    
    cardBody.append(heading, tempPar, windPar, humidityPar);
    card.append(cardBody);

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

    col.style.flex = '1';
    col.style.margin = '10px';
    col.style.minWidth = '150px';

    card.style.backgroundColor = '#007bff';
    card.style.color = '#ffffff';
    card.style.borderRadius = '5px';
    card.style.padding = '10px';
    
    cardBody.style.padding = '10px';
    cardTitle.style.fontSize = '1.2em';

    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YY');
    weatherPic.setAttribute('src', iconUrl);
    weatherPic.setAttribute('alt', iconDescription);
    tempPar.textContent = `Temp: ${temp} °F`;
    windPar.textContent = `Wind: ${windSpeed} MPH`;
    humidityPar.textContent = `Humidity: ${humidity} %`;

    cardBody.append(cardTitle, weatherPic, tempPar, windPar, humidityPar);
    card.append(cardBody);
    col.append(card);

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
    renderWeather(city, data.list[0], data.city.timezone);
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
            console.log(data);
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
            console.log(data);
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
    if (searchForm) {
    searchForm.addEventListener('submit', searchSubmit);
    }
    if (searchHistoryContainer) {
    searchHistoryContainer.addEventListener('click', searchHistoryClick);
    }
});