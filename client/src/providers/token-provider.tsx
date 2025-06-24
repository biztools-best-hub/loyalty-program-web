import { FC, ReactNode, createContext, useContext, useState } from "react"
import { getCookie, setCookie, removeCookie } from "../utils/cookie-util"

export type TTokenContextProps = {
  token: string,
  refreshToken: string,
  changeToken: (newToken: string) => void,
  changeRefreshToken: (newToken: string) => void,
  removeToken: () => void
  removeRefreshToken: () => void
}
export const TokenContext = createContext<TTokenContextProps>({
  refreshToken: getCookie('conical-refresh-token'),
  token: getCookie('conical-access-token'),
  changeToken: (_: string) => { },
  removeToken: () => { },
  changeRefreshToken: (_: string) => { },
  removeRefreshToken: () => { }
});

const TokenProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>(getCookie('conical-access-token'))
  const [refreshToken, setRefreshToken] = useState<string>(getCookie('conical-refresh-token'))
  const changeToken = (newToken: string) => {
    setToken(_ => newToken)
    setCookie({
      key: 'conical-access-token',
      value: newToken,
      duration: {
        value: 1,
        by: 'hour'
      }
    })
  }
  const removeToken = () => {
    setToken(_ => '')
    removeCookie('conical-access-token')
  }
  const changeRefreshToken = (newToken: string) => {
    setRefreshToken(_ => newToken)
    setCookie({
      key: 'conical-refresh-token',
      value: newToken,
      duration: {
        value: 2,
        by: 'week'
      }
    })
  }
  const removeRefreshToken = () => {
    setRefreshToken(_ => '')
    removeCookie('conical-refresh-token')
  }
  return (
    <TokenContext.Provider
      value={{
        token,
        refreshToken,
        changeToken,
        removeToken,
        changeRefreshToken,
        removeRefreshToken
      }}>
      {children}
    </TokenContext.Provider>
  );
}
export default TokenProvider
export const useToken = () => useContext(TokenContext)