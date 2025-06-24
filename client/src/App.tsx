import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import './App.css'
// import PR, { PrimeReactProvider } from 'primereact/api'
import { useEffect, useRef, useState } from "react"
import Home from "./pages/home/home"
import LoginRegister from "./pages/login-register/login-register"
import LoadingScreen from "./pages/loading-screen"
import { Toast } from "primereact/toast"
import { useToken } from "./providers/token-provider"
import { useLang } from "./providers/lang-provider"
import { useTheme } from "./providers/theme-provider"
import { useToast } from "./providers/toast-provider"
import { useUser } from "./providers/user-provider"
import { SideBarProvider } from "./providers"
import { enableRipple, registerLicense } from '@syncfusion/ej2-base'
import { useApi } from "./providers/api-provider"
import { syncFusionClaimKey } from "./constants"
import 'remixicon/fonts/remixicon.css'
import { useWs } from "./providers/ws-provider"
import { WsDataReq } from "./types/models/ws"
import { onMessage } from "./utils/ws-util"
registerLicense(syncFusionClaimKey)
// PR.appendTo = "self"
// PR.cssTransition = true
// PR.ripple = true
// PR.autoZIndex = true
enableRipple(true)
let socket: WebSocket | null = null
function App() {
  const { token, refreshToken } = useToken()
  const { words } = useLang()
  const { user } = useUser()
  const [wsAuthenticated, setWsAuthenticated] = useState(false)
  const { apiUrl, ws: wsUrl } = useApi()
  const { ws, initWs } = useWs()
  const { theme } = useTheme()
  const { bindToast } = useToast()
  const [pos, _] = useState<'center' | 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right'>('bottom-right')
  const toast = useRef<Toast>(null)
  useEffect(() => {
    if (!wsUrl || !user || wsUrl.trim().length < 1 || socket) return;
    socket = new WebSocket(wsUrl)
    initWs(socket)
  }, [wsUrl, user])
  const onWsClose = (_: Event) => console.log('disconnected')
  const onWsError = (_: Event) => console.log('ws error')
  useEffect(() => {
    if (!ws || !user || wsAuthenticated) return;
    const sendData: WsDataReq<null> = {
      dataType: 'authenticate',
      sender: user?.username ?? '',
      receivers: [],
      data: null
    }
    ws.addEventListener('open', _ => {
      ws.send(JSON.stringify(sendData))
      setWsAuthenticated(true)
    })
    ws.addEventListener('close', onWsClose)
    ws.addEventListener('error', onWsError)
    ws.addEventListener('message', e => onMessage<string>(e, res => {
      if (res.dataType === 'data') return console.log(res.data)
      if (res.dataType !== 'notification') return;
      toast.current?.show({
        summary: 'Notification',
        detail: res.data,
        severity: 'info',
        life: 5000,
        style: { textAlign: 'left' }
      })
    }))
  }, [ws, user, wsAuthenticated])
  useEffect(() => {
    if (!toast.current) return;
    bindToast(toast.current)
  }, [toast.current])
  return (
    // <PrimeReactProvider value={{ appendTo: 'self', cssTransition: true, ripple: true, autoZIndex: true }}>
    <div className={`App ${theme}`}>
      {!apiUrl || !words || (token && !user) || (!token && refreshToken) ?
        <LoadingScreen />
        : (token ?
          <SideBarProvider>
            <Home />
          </SideBarProvider>
          : <LoginRegister />)}
      <Toast ref={toast} position={pos} />
    </div>
    // </PrimeReactProvider>
  )
}

export default App
