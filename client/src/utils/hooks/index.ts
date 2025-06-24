import { useContext } from "react"
import { UserContext } from "../../providers/user-provider"
import { TokenContext } from "../../providers/token-provider"
import { removeCookie } from "../cookie-util"

export const useLogout = () => {
  const { removeUser, modifyUserRole } = useContext(UserContext)
  const { removeRefreshToken, removeToken } = useContext(TokenContext)
  const logout = () => {
    removeUser()
    modifyUserRole('')
    removeToken()
    removeRefreshToken()
    removeCookie('conical-uid')
  }
  return logout
}