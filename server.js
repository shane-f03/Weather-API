const express = require("express");
require("dotenv").config();

const app = express();
const port = 3000;
const WEATHER_ENDPOINT = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const GEOLOCATION_ENDPOINT = "http://ip-api.com/json";
const DEFAULT_CITY = "Toronto";

function getCurrentDate() {
  const date = new Date();
  let currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  return currentDate;
}

function getFutureDate() {
  const date = new Date();
  const futureDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
  let currentDate = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}-${futureDate.getDate()}`;

  return currentDate;
}

async function getWeatherData(city) {
  const urlParams = `/${city}/${getCurrentDate()}/${getFutureDate()}?key=${process.env.API_KEY}`;
  const response = await fetch(WEATHER_ENDPOINT + urlParams);

  if (!response.ok) return {};

  const rawData = await response.json();
  const days = rawData.days.map((day) => {
    const { datetime, tempmax, tempmin, temp, feelslike, preciptype, cloudcover, conditions, description } = day;
    return { datetime, tempmax, tempmin, temp, feelslike, preciptype, cloudcover, conditions, description };
  });

  return { city: rawData.resolvedAddress, description: rawData.description, days };
}

async function getGeoLocation(ip) {
  const response = await fetch(GEOLOCATION_ENDPOINT + "/" + ip);
  if (!response.ok) return DEFAULT_CITY;

  const rawData = await response.json();
  if (!rawData.city) return DEFAULT_CITY;

  return rawData.city;
}

app.get("/", async (req, res) => {
  const city = req.query.city || (await getGeoLocation(req.headers["x-forwarded-for"]));

  const result = await getWeatherData(city);

  if (Object.keys(result).length === 0) {
    res.status(404);
  }

  res.json(result);
});

app.listen(port, () => {
  console.log(`Weather app listening on http://localhost:${port}`);
});
