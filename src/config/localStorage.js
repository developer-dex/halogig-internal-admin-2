import { config } from "./config";

export function setSession(token) { // Removed type annotation
  if (!config.localStorageAuthTokenKey) {
    console.error("localStorageAuthTokenKey is not defined in config");
    return;
  }
  console.log("token ::::", token);
  localStorage.setItem(config.localStorageAuthTokenKey, token);
}

export function setSessionClient(token) { // Removed type annotation
  if (!config.localStorageClientTokenKey) {
    console.error("localStorageClientTokenKey is not defined in config");
    return;
  }
  console.log("token ::::", token);
  localStorage.setItem(config.localStorageClientTokenKey, token);
}

// Fixed function name from 'sesetSessionStorageItemtSession' to 'setSessionStorageItem'
export function setSessionStorageItem(token) { // Removed type annotation
  if (!config.localStorageAuthTokenKey) {
    console.error("localStorageAuthTokenKey is not defined in config");
    return;
  }
  console.log("token ::::", token);
  sessionStorage.setItem(config.localStorageAuthTokenKey, token);
}

export function getSession() { // Removed return type annotation
  if (!config.localStorageAuthTokenKey) {
    console.error("localStorageAuthTokenKey is not defined in config");
    return null;
  }
  return localStorage.getItem(config.localStorageAuthTokenKey);
}
export function getSessionClient() { // Removed return type annotation
  if (!config.localStorageClientTokenKey) {
    console.error("localStorageClientTokenKey is not defined in config");
    return null;
  }
  return localStorage.getItem(config.localStorageClientTokenKey);
}

export function clearSession() {
  localStorage.clear();
}

export function setLocalStorageItem(key, value) { // Removed type annotations
  localStorage.setItem(key, value);
}

export function getLocalStorageItem(key) { // Removed return type annotation
  return localStorage.getItem(key);
}
