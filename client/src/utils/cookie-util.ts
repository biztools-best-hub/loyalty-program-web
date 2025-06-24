import { TCookieArgs, TCookieKey } from "../types";

export function setCookie(param: TCookieArgs) {
  const d = new Date();
  let ratio = param.duration.value
  switch (param.duration.by) {
    case 'hour':
      ratio *= 60
      break
    case 'day':
      ratio *= 60 * 24
      break
    case 'week':
      ratio *= 60 * 24 * 7
      break
    case 'month':
      ratio *= 60 * 24 * 30
      break
    default:
      break
  }
  d.setTime(d.getTime() + (ratio * 60 * 1000))
  let expires = `expires=${d.toUTCString()}`
  document.cookie = `${param.key}=${param.value};${expires};path=/`
}
export function getCookie(key: TCookieKey): string {
  let name = key + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}
export function checkCookie(key: TCookieKey) {
  let value = getCookie(key)
  return value && value != ""
}
export function removeCookie(key: TCookieKey) {
  if (!getCookie(key)) return;
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}