import axios from 'axios';

const NEW_LINE = '\n';

let DefaultProperties = {
   StartFunction: () => {},
   EndFunction: () => {},
   StatusFunction: (succedded, failed, total) => {
      Log(
         LOG_LEVELS.INFO,
         failed > 0
            ? `Failed to load ${failed} API's out of ${total}${
                 succedded + failed < total
                    ? `. Still loading ${total - (succedded + failed)} more.`
                    : ''
              }`
            : `Loading ${total} APIs. Completed ${succedded} so far.`
      );
   }
};

export const LOG_LEVELS = {
   DEBUG: 1,
   INFO: 2,
   WARNING: 3,
   ERROR: 4
};

export const LOG_LEVEL_TEXT = {
   [LOG_LEVELS.DEBUG]: 'Debug',
   [LOG_LEVELS.INFO]: 'Info',
   [LOG_LEVELS.WARNING]: 'Warning',
   [LOG_LEVELS.ERROR]: 'Error'
};

export const CACHE_LOCATIONS = {
   NONE: 0,
   LOCAL_STORAGE: 1,
   SESSION_STORAGE: 2,
   MEMORY: 3
};

const LogLevelMaxForSucceed = LOG_LEVELS.INFO;

let LogLevels = {
   '1xx': LOG_LEVELS.DEBUG,
   '2xx': LOG_LEVELS.DEBUG,
   '3xx': LOG_LEVELS.DEBUG,
   '4xx': LOG_LEVELS.ERROR,
   '4xx': LOG_LEVELS.ERROR
};

let Loggers = {
   [LOG_LEVELS.DEBUG]: {
      console: (error) => {
         console.debug(error);
      }
   },
   [LOG_LEVELS.INFO]: {
      console: (error) => {
         console.info(error);
      }
   },
   [LOG_LEVELS.WARNING]: {
      console: (error) => {
         console.warn(error);
      }
   },
   [LOG_LEVELS.ERROR]: {
      console: (error) => {
         console.error(error);
      }
   }
};

export const CACHE_MAX_SIZE = {
   [CACHE_LOCATIONS.LOCAL_STORAGE]: 5242880,
   [CACHE_LOCATIONS.SESSION_STORAGE]: 5242880,
   [CACHE_LOCATIONS.MEMORY]: 10485760
};

export const DEFAULT_LOG_FORMAT = (logLevel, message, url, method, data) => {
   const logLevelText = LOG_LEVEL_TEXT[logLevel] || 'Unknown';
   let logMessage = `AyeAye::${logLevelText}`;

   if ((url || '').length > 0) {
      logMessage += `${NEW_LINE}${method.toUpperCase() || 'GET'} - ${url}`;
   }

   if ((message || '').length > 0) {
      logMessage += `${NEW_LINE}${message}`;
   }

   if (typeof data === 'object') {
      logMessage += `${NEW_LINE}${NEW_LINE}--Payload--${NEW_LINE}${JSON.stringify(
         data
      )}`;
   }

   return logMessage;
};

let CurrentLogLevel = LOG_LEVELS.WARNING;
let CurrentCacheLocation = CACHE_LOCATIONS.NONE;
let CurrentCacheDuration = 0; //0ms means no cache
let AllowedCacheMethods = ['GET'];
let CurrentLogFormat = DEFAULT_LOG_FORMAT;
let MemoryCache = {};

export const SetDefaultProperties = ({
   startFunction,
   endFunction,
   statusFunction
}) => {
   DefaultProperties.StartFunction =
      startFunction || DefaultProperties.StartFunction;
   DefaultProperties.EndFunction = endFunction || DefaultProperties.EndFunction;
   DefaultProperties.StatusFunction =
      statusFunction || DefaultProperties.StatusFunction;
};

export const SetLogLevels = (logLevels) => {
   LogLevels = { ...LogLevels, ...logLevels };
};

export const TestLogging = (message) => {
   Object.keys(LOG_LEVELS).forEach((logLevelKey) =>
      Log(LOG_LEVELS[logLevelKey], message)
   );
};

export const SetCurrentLogLevel = (logLevel) => {
   CurrentLogLevel = logLevel;
};

let Config = {};

export const SetConfig = (config) => {
   Config = config;
};

export const SetCacheConfig = (cacheLocation, duration, methods, maxSize) => {
   var cacheLocationIsValid = Object.keys(CACHE_LOCATIONS).some((cacheKey) => {
      return CACHE_LOCATIONS[cacheKey] === cacheLocation;
   });

   if (!cacheLocationIsValid) {
      Log(
         LOG_LEVELS.ERROR,
         'Cache Location is invalid when setting Cache Config'
      );
      return;
   }

   CurrentCacheLocation = cacheLocation;

   if (duration >= 0) {
      CurrentCacheDuration = duration;
   }

   if (Array.isArray(methods)) {
      AllowedCacheMethods = methods;
   }

   if (Array.isArray(maxSize)) {
      CACHE_MAX_SIZE = { ...CACHE_MAX_SIZE, ...maxSize };
   }
};

export const SetLoggers = ({ debug, info, warning, error }) => {
   Loggers[LOG_LEVELS.DEBUG] = { ...Loggers[LOG_LEVELS.DEBUG], ...debug };
   Loggers[LOG_LEVELS.INFO] = { ...Loggers[LOG_LEVELS.INFO], ...info };
   Loggers[LOG_LEVELS.WARNING] = { ...Loggers[LOG_LEVELS.WARNING], ...warning };
   Loggers[LOG_LEVELS.ERROR] = { ...Loggers[LOG_LEVELS.ERROR], ...error };
};

const ClearStorageCache = (storage, key = '') => {
   if (storage) {
      if (key.length > 0) {
         storage.removeItem(key);
      } else {
         Object.keys(storage).forEach((key) => {
            if (key.startsWith('AyeAye')) {
               storage.removeItem(key);
            }
         });
      }
   }
};

export const ClearCache = (cacheLocation = 0, key = '') => {
   if (!Object.keys(CACHE_LOCATIONS).includes(cacheLocation)) {
      return;
   }

   if (
      cacheLocation === CACHE_LOCATIONS.MEMORY ||
      cacheLocation === CACHE_LOCATIONS.NONE
   ) {
      if (key.length > 0) {
         if (MemoryCache[key]) {
            delete MemoryCache[key];
         }
      } else {
         MemoryCache = {};
      }
   }

   if (
      cacheLocation === CACHE_LOCATIONS.LOCAL_STORAGE ||
      cacheLocation === CACHE_LOCATIONS.NONE
   ) {
      ClearStorageCache(window.localStorage, key);
   }

   if (
      cacheLocation === CACHE_LOCATIONS.SESSION_STORAGE ||
      cacheLocation === CACHE_LOCATIONS.NONE
   ) {
      ClearStorageCache(window.sessionStorage, key);
   }
};

export const GetCacheKey = (url, method, data) => {
   let capitalizedMethod = method.toUpperCase();

   //Only allow caching on certain methods and others are designed for modifying data
   if (!AllowedCacheMethods.includes(capitalizedMethod)) {
      return '';
   }

   return `AyeAye:${capitalizedMethod}:${url}${
      typeof data === 'object' ? ':' + JSON.stringify(data) : ''
   }`;
};

export const GetCacheStandardObject = (data) => {
   return JSON.stringify({ data, date: new Date() });
};

const GetStorageCache = (storage, key) => {
   if (storage) {
      let cacheData = storage.getItem(key);

      if (cacheData) {
         return JSON.parse(cacheData);
      }

      return undefined;
   }
};

export const GetCacheValue = (cacheLocation, key, duration) => {
   if (
      !Object.keys(CACHE_LOCATIONS).includes(cacheLocation) ||
      cacheLocation === CACHE_LOCATIONS.NONE ||
      duration <= 0 ||
      key.length <= 0
   ) {
      return undefined;
   }

   let data = undefined;

   switch (cacheLocation) {
      case CACHE_LOCATIONS.MEMORY:
         data = MemoryCache[key];
         break;
      case CACHE_LOCATIONS.LOCAL_STORAGE:
         data = GetStorageCache(window.localStorage, key);
         break;
      case CACHE_LOCATIONS.SESSION_STORAGE:
         data = GetStorageCache(window.sessionStorage, key);
         break;
   }

   if (data && data.date) {
      if (new Date() - data.date > duration) {
         return data.data;
      } else {
         ClearCache(cacheLocation);
      }
   }
   //if date is valid but outdated clear it out

   return undefined;
};

const SetStorageCache = (location, storage, key, data) => {
   if (storage) {
      let currentCacheSize = Object.keys(storage)
         .filter((key) => key.startsWith('AyeAye'))
         .map((key) => key.length + (storage[key] || '').length)
         .reduce(a, (b) => a + b);
      let dataSize = GetObjectSize(data);

      if (currentCacheSize + dataSize >= CACHE_MAX_SIZE[location]) {
         Log(LOG_LEVELS.INFO, 'Cache Size Limit Reached');
         return;
      }

      storage.setItem(key, JSON.stringify(data));
   }
};

const GetObjectSize = (obj) => {
   if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
         case 'number':
            return 8;
         case 'string':
            return obj.length * 2;
         case 'boolean':
            return 4;
         case 'object':
            var objClass = Object.prototype.toString.call(obj).slice(8, -1);
            if (objClass === 'Object' || objClass === 'Array') {
               let objectSize = 0;
               for (var key in obj) {
                  if (!obj.hasOwnProperty(key)) {
                     continue;
                  }

                  objectSize += GetObjectSize(obj[key]);
               }
               return objectSize;
            }
            return obj.toString().length * 2;
         default:
            return 0;
      }
   }

   return 0;
};

export const SetCacheValue = (cacheLocation, key, duration, data) => {
   if (
      !Object.keys(CACHE_LOCATIONS).includes(cacheLocation) ||
      cacheLocation === CACHE_LOCATIONS.NONE ||
      duration <= 0 ||
      key.length <= 0
   ) {
      return;
   }

   const cacheData = GetCacheStandardObject(data);

   switch (cacheLocation) {
      case CACHE_LOCATIONS.MEMORY:
         let currentCacheSize = GetObjectSize(MemoryCache);
         let dataSize = GetObjectSize(data);

         if (
            currentCacheSize + dataSize >=
            CACHE_MAX_SIZE[CACHE_LOCATIONS.MEMORY]
         ) {
            Log(LOG_LEVELS.INFO, 'Cache Size Limit Reached');
            return;
         }

         MemoryCache[key] = cacheData;
         break;
      case CACHE_LOCATIONS.LOCAL_STORAGE:
         SetStorageCache(
            CACHE_LOCATIONS.LOCAL_STORAGE,
            widow.localStorage,
            key,
            cacheData
         );
         break;
      case CACHE_LOCATIONS.SESSION_STORAGE:
         SetStorageCache(
            CACHE_LOCATIONS.SESSION_STORAGE,
            widow.sessionStorage,
            key,
            cacheData
         );
         break;
   }
};

const Log = (logLevel, message, url, method, data) => {
   if (logLevel < CurrentLogLevel) {
      return;
   }

   var applicableLoggers = Loggers[logLevel];

   if (!applicableLoggers) {
      return;
   }

   const logMessage = CurrentLogFormat(logLevel, message, url, method, data);

   Object.keys(applicableLoggers).forEach((loggerKey) => {
      applicableLoggers[loggerKey](logMessage);
   });
};

const Call = async ({
   url,
   data,
   properties,
   cacheLocation,
   cacheDuration,
   method,
   ...other
}) => {
   return new Promise(function (resolve, reject) {
      //Get the min cache curation
      const minCacheDuration = Math.min(
         CurrentCacheDuration || 0,
         cacheDuration || CurrentCacheDuration || 0
      );

      let methodString = (method || 'GET').toUpperCase();

      const cacheLocationVerified = Object.keys(CACHE_LOCATIONS).includes(
         cacheLocation
      )
         ? cacheLocation
         : CurrentCacheLocation;
      const cacheKey = GetCacheKey(url, methodString, data);

      //If we allow caching try to get the value
      if (minCacheDuration > 0 && CurrentCacheLocation > 0) {
         var cacheValue = GetCacheValue(
            cacheLocationVerified,
            cacheKey,
            minCacheDuration
         );

         if (cacheValue) {
            return cacheValue;
         }
      }

      DefaultProperties.StartFunction();

      //TODO: Need to handle mulitple calls
      let response = axios({
         url,
         data,
         methodString,
         ...other,
         ...Config
      });

      DefaultProperties.EndFunction();

      if (!response) {
         Log(LOG_LEVELS.ERROR, message, url, methodString, data);
         reject(response);
         return;
      }

      //Find the status of the response, if for some reason that fails use 420 as an unofficial Method Failure
      const statusString =
         (response.status || '').toString().toLowerCase() || '420';
      let logLevel =
         LogLevels[statusString] ||
         LogLevels[statusString[0] + 'xx'] ||
         LOG_LEVELS.ERROR;

      //Log and Cache the response if applicable
      Log(logLevel, message, url, methodString, data);
      SetCacheValue(
         cacheLocationVerified,
         cacheKey,
         minCacheDuration,
         response
      );

      if (logLevel <= LogLevelMaxForSucceed) {
         resolve(response);
      } else {
         reject(response);
      }
   });
};

export default Call;
