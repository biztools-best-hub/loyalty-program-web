import { v4 } from 'uuid'
import { Server } from 'http'
import WebSocket from 'ws'
import errorHandler from './error-handler'
type WsDataReq<T> = WsData<T> & {
  receivers: string[]
}
type WsData<T> = {
  dataType: 'authenticate' | 'data' | 'notification'
  sender: string
  data: T
}
interface WsClient extends WebSocket.WebSocket {
  isAlive: boolean
  id: string
  username?: string
}
const socketErrorHandler = (e: any, client: WsClient) =>
  errorHandler("socketErrors", e, undefined, `connection id: ${client.id}, username: ${client.username ?? 'biztools | admin'}`)
const initializeSocketApp = (server: Server) => {
  const ws = new WebSocket.Server<any>({ server })
  ws.on('connection', (s) => {
    const id = v4()
    s.id = id
    s.isAlive = true
    // console.log(`client id: ${id} connected`)
    s.send('you are connected')
    s.on('message', (json: string) => {
      try {
        const data: WsDataReq<any> = JSON.parse(json)
        if (data.dataType !== 'authenticate') {
          // console.log(data)
          // console.log([...ws.clients].map(c => ({ id: c.id, username: c.username })))
          const d: WsData<any> = {
            dataType: data.dataType,
            data: data.data,
            sender: data.sender
          }
          if (data.receivers.length < 1)
            return ws.clients.forEach(c => {
              if (!c.isAlive || c.id === id) return;
              c.send(JSON.stringify(d))
            })
          return ws.clients.forEach(c => {
            if (!c.isAlive || !c.username || c.id === id || !data.receivers.map(u =>
              u.toLowerCase()).includes(c.username.toLowerCase())) return;
            c.send(JSON.stringify(d))
          })
        }
        s.username = data.sender ?? 'biztools | admin'
        ws.clients.forEach(c => {
          if (c.username === data.sender) return;
          c.send(`client id: ${s.id} with username: ${s.username ?? 'admin | biztools'} has connected`)
        })
      } catch (e: any) {
        socketErrorHandler(e, s)
      }
    })
    s.on('pong', () => s.isAlive = true)
    s.on('close', (_: any, __: any) => {
      s.isAlive = false
      ws.clients.forEach(c => {
        if (c.id === id) return;
        c.send(`client id: ${s.id} with username: ${s.username ?? 'biztools | admin'} has disconnected`)
      })
    })
    s.on('error', (e: any) => socketErrorHandler(e, s))
    s.on('open', () => console.log('connection established'))
  })
  return ws
}
export default initializeSocketApp