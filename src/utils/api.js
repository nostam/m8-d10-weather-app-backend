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
  oneCallUrl: function (lat, lon, time = 5) {
    return `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${time}&appid=${owmKey}`;
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
    if (cw.ok && next5.ok) {
      const weather = [{ current: cw.data }, { next: next5.data }];
      return weather;
    } else {
      throw new Error("API call failed");
    }
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

const fetchWeatherAndBackground = async (user) => {
  if (isNaN(user.favourites.length) || user.favourites.length === 0)
    return user;
  const { favourites } = user;
  favourites.forEach((entry) => {
    const weatherData = fetchWeather(entry.city);
    const bgData = fetchCityBackground(entry.city);
    weahterData
      ? (entry = { ...entry, weather: weatherData, images: bgData })
      : new Error("API call failed");
  });
  return user;
};

module.exports = {
  fetchCityBackground,
  fetchWeather,
  fetchWeatherAndBackground,
};
