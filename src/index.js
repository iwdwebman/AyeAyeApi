import axios from 'axios';

const NEW_LINE = '\n';

let DefaultProperties = {
   StartFunction: () => {},
   EndFunction: () => {},
   StatusFunction: () => {}
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

let DefaultLogLevels = {
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
   DefaultLogLevels = { ...DefaultLogLevels, ...logLevels };
};

export const TestLogging = (message) => {
   Log(LOG_LEVELS.DEBUG, message);
   Log(LOG_LEVELS.INFO, message);
   Log(LOG_LEVELS.WARNING, message);
   Log(LOG_LEVELS.ERROR, message);
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
};

export const SetLoggers = ({ debug, info, warning, error }) => {
   Loggers[LOG_LEVELS.DEBUG] = { ...Loggers[LOG_LEVELS.DEBUG], ...debug };
   Loggers[LOG_LEVELS.INFO] = { ...Loggers[LOG_LEVELS.INFO], ...info };
   Loggers[LOG_LEVELS.WARNING] = { ...Loggers[LOG_LEVELS.WARNING], ...warning };
   Loggers[LOG_LEVELS.ERROR] = { ...Loggers[LOG_LEVELS.ERROR], ...error };
};

export const GetCacheKey = (url, method, data) => {
   let capitalizedMethod = method.toUpperCase();

   //Only allow caching on certain methods and others are designed for modifying data
   if (!AllowedCacheMethods.includes(capitalizedMethod)) {
      return '';
   }

   return `${capitalizedMethod}:${url}${
      typeof data === 'object' ? ':' + JSON.stringify(data) : ''
   }`;
};

const Log = (logLevel, message, url, method, data) => {
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
   ...other
}) => {
   return new Promise(function (resolve, reject) {
      // do a thing, possibly async, then…
      const minCacheDuration = Math.min(
         CurrentCacheDuration || 0,
         cacheDuration || 0
      );

      if (minCacheDuration > 0 && false /* Cache has data */) {
      }

      let response = axios({
         url,
         data,
         ...other,
         ...Config
      });

      if (/* everything turned out fine */ true) {
         resolve(response);
      } else {
         reject(response);
      }
   });
};

export default Call;
