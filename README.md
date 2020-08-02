# aye-aye-api

> API Management that allows easy logging and start and stop functions useful for loading screens

[![NPM](https://img.shields.io/npm/v/@starrsoftware/aye-aye-api.svg)](https://www.npmjs.com/package/@starrsoftware/aye-aye-api) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @starrsoftware/aye-aye-api
```

## Single Call Usage

```jsx
import React from 'react';
import Call from '@starrsoftware/aye-aye-api';

export default function SingleCallExample(props) {
   const [temperature, setTemperature] = useState(Number.NaN);

   useEffect(() => {
      //Call single API (this one is fake)
      Call({ url: 'http://weather.com/SanJose/GetTemperature/' })
         .then((result) => {
            setTemperature(result.data);
         })
         .catch((error) => {
            console.error(error);
         });
   });

   return <div>Temp: {temperature}&#176;F</div>;
}
```

## Multiple Call Usage

```jsx
import React from 'react';
import Call from '@starrsoftware/aye-aye-api';

export default function SingleCallExample(props) {
   const [temperature, setTemperature] = useState(Number.NaN);
   const [windSpeed, setWindSpeed] = useState(Number.NaN);
   const [windDirection, setWindDirection] = useState(Number.NaN);
   const [humidity, setHumidity] = useState(Number.NaN);

   useEffect(async () => {
      //Call single API (this one is fake)
      let promises = await Call([
         { url: 'http://weather.com/SanJose/GetTemperature/' },
         { url: 'http://weather.com/SanJose/GetWindSpeed/' },
         { url: 'http://weather.com/SanJose/GetWindDirection/' },
         { url: 'http://weather.com/SanJose/GetHumidity/' }
      ]);

      promises[0]
         .then((result) => {
            setTemperature(result.data);
         })
         .catch((error) => {
            console.error('Temperature Error');
         });

      promises[1]
         .then((result) => {
            setwindSpeed(result.data);
         })
         .catch((error) => {
            console.error('Wind Speed Error');
         });

      promises[2]
         .then((result) => {
            setWindDirection(result.data);
         })
         .catch((error) => {
            console.error('Wind Direction Error');
         });

      promises[3]
         .then((result) => {
            setHumidity(result.data);
         })
         .catch((error) => {
            console.error('Humidity Error');
         });
   });

   return (
      <div>
         <div>Temp: {temperature} &#176;F</div>
         <div>Wind Speed: {windSpeed} m/s</div>
         <div>Wind Direction: {windDirection} &#176;</div>
         <div>Humidity: {humidity} %</div>
      </div>
   );
}
```

## License

MIT © [iwdwebman](https://github.com/iwdwebman)
