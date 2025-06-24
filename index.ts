import http from 'http'
import dotenv from 'dotenv'
import app from './express-app'
import initializeSocketApp from './socket-app'
import { AddressInfo } from 'ws'
import errorHandler from './error-handler'
dotenv.config()

const server = http.createServer(app)
initializeSocketApp(server)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  let adr = 'localhost';
  const address = server.address();
  if (!address) return console.log(`listening on http://${adr}:${PORT}`)
  try {
    const addr = (address as AddressInfo).address
    if (addr !== '::' && !addr.includes('0.0.0.0') && !addr.includes('127.0.0.1')) adr = addr
  } catch (e: any) { errorHandler('appErrors', e) }
  console.log(`listening on http://${adr}:${PORT}`)
})