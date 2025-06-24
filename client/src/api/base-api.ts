import { apiKey, headerKeys } from "../constants"
import { getCookie } from "../utils/cookie-util"
import { get as getLocalStorage } from "../utils/local-storage-util"
const baseFetch = (reverse?: boolean) => {
  const baseOption = (withoutContentType: boolean = false): RequestInit => {
    if (withoutContentType) return {
      headers: {
        'Accept': 'application/json',
        [headerKeys.api]: apiKey,
        [headerKeys.device]: getLocalStorage('conical-device-id'),
        [headerKeys.refresh]: getCookie(reverse ? 'conical-access-token' : 'conical-refresh-token'),
        'Authorization': `Bearer ${getCookie(reverse ? 'conical-refresh-token' : 'conical-access-token')}`
      }
    }
    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        [headerKeys.api]: apiKey,
        [headerKeys.device]: getLocalStorage('conical-device-id'),
        [headerKeys.refresh]: getCookie(reverse ? 'conical-access-token' : 'conical-refresh-token'),
        'Authorization': `Bearer ${getCookie(reverse ? 'conical-refresh-token' : 'conical-access-token')}`
      }
    }
  }
  async function get<T>(baseUrl: string = '', url: string, params?: any, noReturnData?: boolean): Promise<T> {
    try {
      const opt = { ...baseOption() }
      opt.method = 'GET'
      const uri = new URL(`${baseUrl}${url}`)
      if (params) for (let p in params) uri.searchParams.append(p, params[p])
      const res = await fetch(uri, opt)
      if (res.status != 200) throw res
      if (noReturnData) throw 'success'
      const data: T = await res.json()
      return data
    } catch (e) { throw e }
  }
  async function post<T>(baseUrl: string, url: string, data?: any, noReturnData?: boolean): Promise<T> {
    try {
      const opt = { ...baseOption() }
      opt.method = "POST"
      opt.body = JSON.stringify(data ?? {})
      const res = await fetch(`${baseUrl}${url}`, opt)
      if (res.status != 200) throw res
      if (noReturnData) throw 'success'
      const d: T = await res.json()
      return d
    } catch (e) { throw e }
  }
  async function postForm<T>(baseUrl: string, url: string, data?: any, noReturnData?: boolean): Promise<T> {
    try {
      const body: FormData = new FormData()
      const opt = { ...baseOption(true) }
      for (let k in data) body.append(k, data[k])
      opt.method = 'POST'
      opt.body = body
      // baseUrl = ""
      const res = await fetch(`${baseUrl}${url}`, { ...opt })
      if (res.status != 200) throw res
      if (noReturnData) throw 'success'
      const d: T = await res.json()
      return d
    } catch (e) { throw e }
  }
  async function put<T>(baseUrl: string, url: string, data?: any, params?: any, noReturnData?: boolean): Promise<T> {
    try {
      const opt = { ...baseOption() }
      opt.method = "PUT"
      opt.body = JSON.stringify(data ?? {})
      const uri = new URL(`${baseUrl}${url}`)
      if (params) for (let p in params) uri.searchParams.append(p, params[p])
      const res = await fetch(uri, opt)
      if (res.status != 200) throw res
      if (noReturnData) throw 'success'
      const d: T = await res.json()
      return d
    } catch (e) { throw e }
  }
  return { get, post, put, postForm }
}
export default baseFetch