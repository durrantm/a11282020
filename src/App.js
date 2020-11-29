import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// 'x-rapidapi-key': process.env.RAPIDAPI_KEY
function App() {
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('02140');
  const [state, setState] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [weatherMain, setWeatherMain] = useState('local weather');
  const [weatherMinTemp, setWeatherMinTemp] = useState('');
  const [weatherTemp, setWeatherTemp] = useState('');
  const [weatherMaxTemp, setWeatherMaxTemp] = useState('');
  const [windspeed, setWindSpeed] = useState();
  const [latLong, setLatLong] = useState([]);
  const [forecast, setForecast] = useState({});
  console.log(forecast); // just to prevent lint error
  const [forecast5DayHighs, setForecast5DayHighs] = useState(["x", "x", "x", "x", "x", ]);

  const options = {
    method: 'GET',
    url: `https://redline-redline-zipcode.p.rapidapi.com/rest/info.json/${zip}/degrees`,
    headers: {
      'x-rapidapi-key': `${process.env.REACT_APP_X_RAPIDAPI_KEY }`,
      'x-rapidapi-host': 'redline-redline-zipcode.p.rapidapi.com'
    },
  };
  const appIdWeather = `${process.env.REACT_APP_WEATHER_API_KEY}`;
  const optionsWeather = {
    method: 'GET',
    url: `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${appIdWeather}&units=imperial`
  };

  const optionsWeatherForecast = {
    method: 'GET',
    url: 'https://weatherbit-v1-mashape.p.rapidapi.com/forecast/daily',
    params: {lat: latLong[0], lon: latLong[1], units: "I" },
    // params: {lat: 34, lon: -118, units: "I" },
    headers: {
      'x-rapidapi-key': `${process.env.REACT_APP_X_RAPIDAPI_KEY }`,
      'x-rapidapi-host': 'weatherbit-v1-mashape.p.rapidapi.com'
    }
  };
  const resetWeather = () => {
    setWeatherMinTemp('');
    setWeatherMaxTemp('');
    setWindSpeed('');
    setWeatherMain('');
    setWeatherTemp('');
    // setForecast5DayHighs(['-', '-', '-', '-', '-']);
  };
  const invalidZip = () => {
    setCity('-');
    setState('');
    setTimeZone('');
    resetWeather();
  };
  const round = (num, decimals = 0) => {
    if (typeof num === 'number') {
      return num.toFixed(decimals);
    }
    return '-';
  };
  useEffect(() => {
    if (zip.length === 5 && !isNaN(zip)) {
      // Example #1 of using axio
      axios.request(options)
        .then(function(response) {
          setCity(response.data.city);
          setState(response.data.state);
          setTimeZone(response.data.timezone.timezone_abbr);
          setLatLong([response.data.lat, response.data.lng]);
        })
        .then(function() {
          // Example #2 of using axio
          // This is the one that is intended to get the 15 day forcast details
          // This is the one I am trying to get to work
          axios.request(optionsWeatherForecast)
            .then(function(response) {
              // this works but is clumsy and only gets high temps
              setForecast5DayHighs ([
                response.data.data[1].high_temp,
                response.data.data[2].high_temp,
                response.data.data[3].high_temp,
                response.data.data[4].high_temp,
                response.data.data[5].high_temp
              ]);
              const responseData = response.data.data;
              const reducedResponse = responseData.reduce((result, item, index) => {
                return {
                  ...result,
                  [index]: item,
                };
              }, {});

              // setForecast(reducedResponse); // This is the "object" approach I want to use..
              setForecast(object => {
                return {
                  ...object,
                  reducedResponse
                };
              });
              console.log(reducedResponse);

              console.log("== 1 forecast ==");
              console.log(forecast);
              console.log("== 2 response.data.data==");
              console.log(response.data.data);
              console.log("== 3 ==");
            })
            .catch(function() {
              setForecast5DayHighs(["-", "-", "-", "-", "-"]);
              setForecast({});
            });
        })
        .catch(function() {
          invalidZip();
          setForecast({});
        });
      // Example #3 of using axios
      axios.request(optionsWeather)
        .then(function(response) {
          setWeatherMain(response.data.weather[0].main);
          setWeatherTemp(round(response.data.main.temp));
          setWeatherMinTemp(round(response.data.main.temp_min));
          setWeatherMaxTemp(round(response.data.main.temp_max));
          const windspeed = round(response.data.wind.speed * (5 / 9));
          setWindSpeed(windspeed);
        })
        .catch(function() {
          resetWeather();
        });
    }
    if (zip.length !== 5 || isNaN(zip)) {
      invalidZip();
    }
  }, [ /*zip, ...forecast5DayHighs, forecast*/ ]);

  const updateZip = (event) => {
    setZip(event.target.value);
  };

  // const temps = () => {
  //   const result = [];
  //   for(const day of Object.entries(forecast)) {
  //     result.push(day.high_temp);
  //   }
  //   return result;
  // };


  // const ForecastFromObject = () => {
  //   const theTemps = temps();
  //   return (
  //     <div>
  //       RESULT:<br/>
  //       { theTemps.map((temp, i) => {
  //         <div key={i}>
  //         For Day{i+1} the temp is: {round(temp)}°  <br/>
  //         </div>;
  //       })
  //       }
  //     </div>
  //   );
  // };

  return (
    <div className = "App" >
      <header className = "App-header" >
        <span className = "zipInputForm" >
          <form onSubmit = { updateZip } >
            <input type = "text"
              placeholder = "zip"
              value = { zip }
              onChange = { updateZip }
              size = "5"
              maxLength = "10"
              className = "zipInput" / >
            { /* <input type="submit" value="submit it" /> */ }
          </form> { zip } <br/> { city } { state } <br/>
          <div className = "timezone" > { timeZone } <br/>
          </div>
        </span>
      </header>
      <div className = "App-body" id = "weather" >
        <br/> { weatherMain }, { weatherTemp }° <br/>
            Min: { weatherMinTemp }° &nbsp; &nbsp; Max: { weatherMaxTemp }° <br/>
            Windspeed: { windspeed }<span id = "mph">mph</span>
        <br/><br/>
        Forecast:
        {/* This works for an Array */}
        { forecast5DayHighs.map((high, i) =>
          <div key={i}>
            Day: {i+1} {round(high)}°  <br/>
          </div>
        )}
        <br/>
        Forecast from Object Attempt I:<br/>
        { /* This does not work */}
        {/* <ForecastFromObject /> */}

        {/* This does not work either */}
        Forecast from Object Attempt II:<br/>
        {/* { forecast.entries.map((day, i) =>
          <div key={i}>
            Day: {i+1} {round(day.high_temp)}°  <br/>
          </div>
        )} */}
      </div>
    </div>
  );
}
export default App;