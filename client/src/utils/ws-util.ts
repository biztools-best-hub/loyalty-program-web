import { WsData } from "../types/models/ws"

export const onMessage = async <T>(e: MessageEvent, fn: (r: WsData<T>) => void) => {
  if (e.data instanceof Blob) {
    const d = await e.data.text()
    try {
      const res: WsData<T> = JSON.parse(d)
      return fn(res)
    }
    catch { }
    return console.log(d)
  }
  if (typeof e.data === 'string') {
    try {
      const d: WsData<T> = JSON.parse(e.data)
      return fn(d)
    }
    catch { }
  }
  console.log(e.data)
}