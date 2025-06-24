import { FC, ReactNode, useContext, useState, useEffect, createContext } from "react"
import { setCookie } from "../utils/cookie-util"
import {
  //  get as getLocalStorage,
  remove,
  set
} from "../utils/local-storage-util"
import { useToken } from "./token-provider"
import { TUser } from "../types/models"
import { useApi } from "./api-provider"
// import { TListener } from "../types/models/signalr"
// import { createSignalRContext } from "react-signalr"
// import { apiKey } from "../constants"
// import { HttpTransportType } from "@microsoft/signalr"

export type TUserContextProps = {
  user?: TUser,
  modifyUser: (user: TUser) => void
  modifyUserRole: (role: string) => void
  userRole: string
  removeUser: () => void
}

export const UserContext = createContext<TUserContextProps>({
  modifyUser: (_: TUser) => { },
  modifyUserRole: (_: string) => { },
  userRole: '',
  removeUser: () => { },
})
// const SignalRContext = createSignalRContext();


const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    token,
    refreshToken,
    changeToken,
    removeToken,
    removeRefreshToken } = useToken()
  const [user, setUser] = useState<TUser>()
  const [userRole, setUserRole] = useState<string>('')
  const { auth, apiUrl } = useApi()
  const modifyUser = (u: TUser) => setUser(_ => u)
  const me = auth.useMe({
    onError(_) { },
    onSuccess(d: TUser) {
      setUser(_ => ({ ...d }))
      setUserRole(_ => d.currentRole ?? '')
      remove('conical-is-register')
    },
    enabled: false
  })
  const refreshAsync = auth.useRefresh({
    onSuccess(d) {
      changeToken(d.token)
      setCookie({
        key: 'conical-refresh-token',
        value: d.refreshToken,
        duration: {
          value: 2,
          by: 'week'
        }
      })
      if (d.uid) setCookie({
        key: 'conical-uid',
        value: d.uid,
        duration: {
          value: 1,
          by: 'minute'
        }
      })
      set({
        key: 'conical-device-id',
        value: d.deviceId
      })
      me()
    },
    onError() {
      removeToken()
      removeRefreshToken()
      remove('conical-is-register')
    },
    enabled: false
  })
  const removeUser = () => setUser(_ => undefined)
  const modifyUserRole = (role: string) => setUserRole(_ => role)
  useEffect(() => {
    if (!apiUrl) return;
    if (!token && refreshToken) refreshAsync()
    else if (token && !user) me()
  }, [token, user, refreshToken, apiUrl])
  return (
    <UserContext.Provider
      value={{
        user,
        userRole,
        modifyUserRole,
        modifyUser,
        removeUser,
      }}>
      {/* <SignalRContext.Provider
        connectEnabled={!!token}
        automaticReconnect={true}
        transport={HttpTransportType.WebSockets}
        accessTokenFactory={() => token}
        dependencies={[token]}
        headers={{
          'Authorization': `Bearer ${token}`,
          'conical-api-key': apiKey,
          'conical-device-id': getLocalStorage('conical-device-id'),
          'conical-refresh-token': refreshToken
        }}
        withCredentials={false}
        url={`${apiUrl}/hub`}> */}
      {children}
      {/* </SignalRContext.Provider> */}
    </UserContext.Provider>
  )
}
export default UserProvider
export const useUser = () => useContext(UserContext)