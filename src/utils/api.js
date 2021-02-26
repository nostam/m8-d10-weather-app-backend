const axios = require("axios");

const owmKey = process.env.OPENWEATHERMAP_KEY;
const ipdataKey = process.env.IPDATA_KEY;
const upsplashKey = process.env.UPSPLASH_KEY;

const ipdata = {
  url: `https://api.ipdata.co?api-key=${ipdataKey}`,
  key: ipdataKey,
};
const openWeatherMap = {
  currentWeatherUrl: `https://api.openweathermap.org/data/2.5/weather?&appid=${owmKey}&units=metric&q=`,
  next5DayUrl: `https://api.openweathermap.org/data/2.5/forecast?appid=${owmKey}&units=metric&q=`,
  oneCallUrl: function (lat, lon, day = 5) {
    return `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${day}&appid=${owmKey}`;
  },
  key: owmKey,
};
const upsplash = {
  url: `https://api.unsplash.com/search/photos?per_page=5&client_id=${upsplashKey}&query=`,
  key: upsplashKey,
};

async function fetchWeather(city = input) {
  try {
    //<CurrentWeather>
    const cw = await axios.get(openWeatherMap.currentWeatherUrl + city);
    //<Next5Days>
    const next5 = await axios.get(openWeatherMap.next5DayUrl + city);
    const weather = [{ current: cw.data }, { next: next5.data }];
    return weather;
  } catch (error) {
    console.log(error);
  }
}
async function fetchCityBackground(city = input) {
  try {
    //<Upsplash>
    const res = await axios.get(upsplash.url + city);
    return res.ok ? res.data : new Error();
  } catch (error) {
    console.log(error);
  }
}

const fetchWeatherAndBackground = (user) => {
  user.favourites.map((entry) => {
    const weatherData = fetchWeather(entry.city);
    const bgData = fetchCityBackground(entry.city);
    // entry["weather"] = weatherData;
    // entry["images"] = bgData;
    console.log("en", entry);
  });
  console.log("user", user);
  return user;
};

module.exports = {
  fetchCityBackground,
  fetchWeather,
  fetchWeatherAndBackground,
};
