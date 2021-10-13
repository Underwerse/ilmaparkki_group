// Tämä on yleisskripti, jonka avulla lisätään toimintoja kaikille sivuille
'use strict';

document.addEventListener("DOMContentLoaded", () => {
  // Lisätään 'header':in kuvalle linkki pääsivulle
  const header = document.querySelector('header');
  header.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  header.addEventListener('mousemove', () => {
    header.style.cursor = 'pointer';
  })

  // Lisätään 'menu':n aktiiville linkille korostusta
  const setActiveMenu = () => {
    const menuLinks = document.querySelectorAll('.main-menu li a');
    const url = document.location.href;
    for (let i = 1; i < menuLinks.length; i++) {
      if (url === menuLinks[i].href) {
        menuLinks[i].className += 'activeMenu';
      }
    }
  }

  setActiveMenu();

  /**
  /* Sää ennuste API
  */
  /* const getWeatherData = () => {
    //Tehdään muuttujia
    const weatherApiKey = '7a2a285eb61c6138308c6b1df9b2fa1b';
    const apiUrl = `http://api.weatherstack.com/current?access_key=${weatherApiKey}&units=m&query=`;
    let apiQuery;
    const button = document.getElementById('searchButton');

    //Katsotaan onko hakunappia painettu
    button.addEventListener('click', makeQuery);

    //Kysellään annetut tiedot omalta nettisivulta
    function makeQuery() {

      //Poistaa napin käytöstä, kunnes sivun lataa uudelleen
      document.getElementById("searchButton").disabled = true;

      apiQuery = apiUrl + document.getElementById('search').value;

      search(apiQuery);
    }

    const defaultQuery = apiUrl + 'Espoo';
    search(defaultQuery);

    //Tehdään haku rajapinta nettisivulle
    async function search(apiQuery) {
      let response = await fetch(apiQuery);
      let weatherData = await response.json();
      processResults(weatherData);
    }

    //Luetaan etsittyä dataa ja tulostetaan innerHTML komennolla weatherAdjuster elementtiin
    function processResults(jsonData) {
      const weatherElem = document.getElementById('weatherAdjuster');
      let htmlCode = `<p>`;

      htmlCode += `<img src='${jsonData.current.weather_icons}'><img>`;
      htmlCode += `Paikka: ${jsonData.location.name}<br>`;
      htmlCode += `Sään kuvaus: ${jsonData.current.weather_descriptions}<br>`;
      htmlCode += `Lämpötila: ${jsonData.current.temperature}°C<br>`;
      htmlCode += `Tuntuu: ${jsonData.current.feelslike}°C<br>`;
      htmlCode += `Tuulen nopeus: ${jsonData.current.wind_speed}m/s<br>`;
      htmlCode += `Ilmankosteus: ${jsonData.current.humidity}%<br>`;
      htmlCode += `</p>`;

      //Lisätään tiedot innerHTML komennolla weather elementtiin
      weatherElem.innerHTML += htmlCode;
    }
  } */

  async function getWeatherData() {
    //Tehdään muuttujia
    const apiUrl = 'http://api.openweathermap.org/data/2.5/weather?id=660129&appid=b55f639a32a873e5d0147d5233056298&lang=fi';

    let response = await fetch(apiUrl);
    let weatherData = await response.json();
    //Luetaan etsittyä dataa ja tulostetaan innerHTML komennolla weatherAdjuster elementtiin
    const weatherElem = document.getElementById('weatherAdjuster');
    let htmlCode = `<p>`;

    let icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    htmlCode += `<img src='${icon}'><img>`;
    htmlCode += `Paikka: ${weatherData.name}<br>`;
    htmlCode += `Sään kuvaus: ${weatherData.weather[0].description}<br>`;
    htmlCode += `Lämpötila: ${Math.floor(weatherData.main.temp - 273)} °C<br>`;
    htmlCode += `Ilmankosteus: ${weatherData.main.humidity}%<br>`;
    htmlCode += `Tuulen nopeus: ${weatherData.wind.speed} m/s<br>`;
    htmlCode += `</p>`;

    //Lisätään tiedot innerHTML komennolla weather elementtiin
    weatherElem.innerHTML += htmlCode;
  }

  getWeatherData();


  /**
   * COVID-19 tiedot API
   */
  async function getCovidData() {
    //Tehdään muuttujia
    const covidApiUrl = 'https://covid-api.com/api/reports/total?date=2021-10-12&iso=FIN';

    let response = await fetch(covidApiUrl, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });

    let covidData = await response.json();

    covidResults(covidData.data);

    //Luetaan etsittyä dataa ja tulostetaan innerHTML komennolla weatherAdjuster elementtiin
    function covidResults(jsonData) {
      const covidElem = document.getElementById('covid');
      let formatter = new Intl.NumberFormat('fi');
      document.getElementById('newDesease').innerHTML = formatter.format(jsonData.confirmed_diff);
      document.getElementById('deseaseTotal').innerHTML = formatter.format(jsonData.confirmed);
      document.getElementById('newDeaths').innerHTML = formatter.format(jsonData.deaths_diff);
      document.getElementById('deathsTotal').innerHTML = formatter.format(jsonData.deaths);
    }
  }

  getCovidData();
});