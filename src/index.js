import axios from "axios";

let DefaultProperties = {
  StartFunction = () => {},
  EndFunction = () => {},
  StatusFunction = () => {}
}

export const LOG_LEVELS = {
  DEBUG: 1,
  INFO: 2,
  WARNING: 3,
  ERROR: 4
}

let DefaultLogLevels = {
  "1xx": DEBUG,
  "2xx": DEBUG,
  "3xx": DEBUG,
  "4xx": ERROR,
  "4xx": ERROR
}

export const SetDefaultProperties = ({startFunction, endFunction, statusFunction}) => {
  DefaultProperties.StartFunction = startFunction || DefaultProperties.StartFunction;
  DefaultProperties.EndFunction = endFunction || DefaultProperties.EndFunction;
  DefaultProperties.StatusFunction = statusFunction || DefaultProperties.StatusFunction;
}

export const SetDefaultHeaders = (headers) => {

}

export const SetAuthorization = (type, token) => {
  
}

export const SetLogLevels = (logLevels) => {
  DefaultLogLevels = {...DefaultLogLevels, ...logLevels};
}

export const AddLogger = ({debug, info, warning, error}) => {

}

export default Call = async ({ token, url, data, method, headers, properties }) => {
  return new Promise(function(resolve, reject) {
    // do a thing, possibly async, then…
  let response = axios.call();
    if (/* everything turned out fine */true) {
      resolve(response);
    }
    else {
      reject(response);
    }
  });
}

