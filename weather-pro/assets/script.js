const weatherApiRootUrl = 'https://api.openweathermap.org';
const weatherApiKey = 'd91f911bcf2c0f925fb6535547a5ddc9';




function displayCurrent(current, city) {
  let currentDay = $('#today');
  currentDay.addClass('border border-light')

  let date = new Date(current.dt * 1000);

  //empty current day element
  currentDay.empty();

  //create header for city and date and weather Icon
  let weatherHeader = $('<div>').addClass('row');

  //city name and date
  let cityDate = $('<h2 id="cityDate">').addClass("col-auto h2 m-2");
  cityDate.text(`${city} (${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()})`);
  
  //weather icon from API, push to URL
  let weatherIcon = current.weather[0].icon;
  let weatherIconEl = $('<img class="col-sm-1">').attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`);

  //temp from API 
  let temp = current.temp;
  let tempEl = $('<div class="m-2">').text(`Temp: ${temp}°`);

  //wind speed from API 
  let wind = current.wind_speed;
  let windEl = $('<div class="m-2">').text(`Wind: ${wind}MPH`);

  //humidity from API, add to div class
  let humidity = current.humidity;
  let humidityEl = $('<div class="m-2">').text(`Humidity ${humidity}%`);

  let uvIndex = current.uvi;
  let uvIndexContainer = $('<div class="row">');
  let uvIndexEl = $(`<div class="col-auto m-2">`).text(`UV Index:`);
  let uvIndexVal = $('<div class="col-auto m-2 rounded-1">').text(uvIndex);
  
  //gives good, moderate or severe color to index 
  if(uvIndex < 2){
      uvIndexVal.addClass("btn-success");
  }else if (uvIndex < 7) {
      uvIndexVal.addClass("btn-warning");
  }else {
      uvIndexVal.addClass("btn-danger");
  }
  
  weatherHeader.append(cityDate, weatherIconEl);
  currentDay.append(weatherHeader, tempEl, windEl, humidityEl, uvIndexContainer);
  uvIndexContainer.append(uvIndexEl, uvIndexVal);
}



function displayFiveDay(daily) {
    
  let forecastEl = $('#forecast');
  
  //empty current day element
  forecastEl.empty();
  forecastEl.addClass();
  
  //city name and date
  let fiveDay = $('<h2 id="fiveDay">').addClass("h2 mt-4");
  fiveDay.text(`5-Day Forecast:`);
  
  forecastEl.append(fiveDay);

  let fiveForecast = $('<div class="row justify-content-between m-1 mt-4">');
  for (let i = 0; i < 5; i++) {
      let date = new Date(daily[i].dt * 1000);

      let dateEl = $('<h5 id="dateEl">').addClass("col-auto h5 m-2");
      dateEl.text(`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`);
      
      let weatherIcon = daily[i].weather[0].icon;
      let weatherIconEl = $('<img>').attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`);

      //temperature from API 
      let temp = daily[i].temp.day;
      let tempEl = $('<div class="m-2">').text(`Temp: ${temp}°`);

      //wind Speed from API
      let wind = daily[i].wind_speed;
      let windEl = $('<div class="m-2">').text(`Wind: ${wind}MPH`);

      //humidity from API
      let humidity = daily[i].humidity;
      let humidityEl = $('<div class="m-2">').text(`Humidity ${humidity}%`);

      let dailyForecast = $(`<div class="col-2 bg-secondary rounded-1">`);

      dailyForecast.append(dateEl, weatherIconEl, tempEl, windEl, humidityEl);
  
      fiveForecast.append(dailyForecast);
  }

  forecastEl.append(fiveForecast);
}



function saveToLocalState(city) {
  const maxSearch = 8;

  // adds items to localStorage 
  if(city){
      for (let i = 0; i < maxSearch; i++) {
          let x = maxSearch - 1 - i;
          localStorage.setItem(`${x}`, localStorage.getItem(`${x-1}`));
      }
      localStorage.setItem(`0`, city);
  }

  let list = $('#history');
  list.empty();

  //pulls from local storage to fill search city
  for(let i = 0; i < maxSearch; i++) {
      if(localStorage.getItem(`${i}`) != "null" && localStorage.getItem(`${i}`) != null) {
          let cityEl  = $(`<li id="search-${i}">`).addClass("list-group-item");
          cityEl.click(function(){
              $(`#searchTerm`).val($(`#search-${i}`).text());
              searchCityWeather();
          })
          cityEl.text(localStorage.getItem(`${i}`)); 
          list.append(cityEl);
      }
  }
}



function searchCityWeather() {

  //sets city from search term
  const city = document.querySelector('#searchTerm').value;

  //using fetch pulls weather info for chosen city from openWeatherMap.org
  fetch(`${weatherApiRootUrl}/geo/1.0/direct?q=${city}&limit=5&appid=${weatherApiKey}`)
  .then(function (res) {
      return res.json();
  })
  .then(function (body) {
      console.log('body', body);
      const lat = body[0].lat;
      const lon = body[0].lon;
      console.log(lat, lon);
      return fetch(`${weatherApiRootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`)
  })
  .then(function (res) {
      return res.json();
  })
  .then(function (body) {
      console.log(body)
      const current = body.current;
      const daily = body.daily;
      displayCurrent(current, city);
      displayFiveDay(daily);
      saveToLocalState(city);
  })
  .catch(function (error) {
   console.log(error)
  });
}

saveToLocalState();