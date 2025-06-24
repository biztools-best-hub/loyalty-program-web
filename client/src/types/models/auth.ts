import { TAddress, TPermission } from "./user"

export type TChangePasswordRequest = {
  oldPassword: string
  newPassword: string
}
export type TChangePasswordResponse = {
  username: string
  result: string
}
export type TLoginArgs = {
  username: string
  password: string
}
export type TRegisterArgs = TLoginArgs & {
  uid?: string
  gender?: string
  currentEmail?: string
  currentPhone?: string
  currentType?: string
  currentRole?: string
  currentAddress?: TAddress
  profileImage?: string
  displayName?: string
  firstname?: string
  lastname?: string
  khFirstname?: string
  khLastname?: string
  emails: string[]
  phones: string[]
  types: string[]
  roles: string[]
  groups: string[]
  addresses: TAddress[]
  permissions: TPermission[]
}
export type TLogin = {
  token: string
  refreshToken: string
  deviceId: string
  uid?: string
}