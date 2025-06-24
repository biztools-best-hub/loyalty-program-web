import { Context, FC, ReactNode, createContext, useContext, useState } from "react";
type WsContextProps = {
  ws: WebSocket | null,
  initWs: (s: WebSocket) => void
}
const WsContext: Context<WsContextProps> = createContext<WsContextProps>({ ws: null, initWs: _ => { } })
const WsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const initWs = (s: WebSocket) => setWs(s)
  return <WsContext.Provider value={{ ws, initWs }}>
    {children}
  </WsContext.Provider>
}
export const useWs = () => useContext(WsContext)
export default WsProvider