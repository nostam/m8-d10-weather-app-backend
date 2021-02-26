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
    // const weather = [{ current: cw.data }, { next: next5.data }];
    const weather = [{ current: cw.data }];
    return weather;
  } catch (error) {
    console.log(error);
  }
}
async function fetchCityBackground(city = input) {
  try {
    //<Upsplash>
    const res = await axios.get(upsplash.url + city);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

async function fetchWeatherAndBackground(user) {
  try {
    const payload = user.favourites.map(async (entry) => {
      return {
        city: entry.city,
        country: entry.coutnry,
        lat: entry.lat,
        lon: entry.lon,
        weather: await fetchWeather(entry.city),
        images: await fetchCityBackground(entry.city),
      };
    });
    return await Promise.all(payload);
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  fetchCityBackground,
  fetchWeather,
  fetchWeatherAndBackground,
};
