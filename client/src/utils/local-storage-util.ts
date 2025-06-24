import { TLocalStorageArgs, TLocalStorageKey } from "../types";

export const set = (input: TLocalStorageArgs) => {
  localStorage.setItem(input.key, input.value)
}
export const get = (key: TLocalStorageKey) => localStorage.getItem(key) ?? ''
export const remove = (key: TLocalStorageKey) => localStorage.removeItem(key)