import { TBaseFilter, TIsIn } from "./base"

export type TAddress = {
  oid: string,
  en: string,
  kh?: string
}
export type TPermission = {
  oid: string
  permissionOid: string
  actions: string
  permissionName: string
}
export type AddressRequest = {
  userOid?: string
  status?: string
  kh?: string
  en?: string
}
export type User_Perm = {
  userOid?: string
  permissionOid?: string
  permissionName: string
  status?: string
  actions?: string
}
export type TUserRequest = {
  oid?: string,
  username?: string
  password?: string
  uid?: string
  gender?: string
  currentEmail?: string
  currentPhone?: string
  currentType?: string
  currentRole?: string
  profileImage?: string
  displayName?: string
  firstname?: string
  lastname?: string
  khFirstname?: string
  khLastname?: string
  currentAddress?: AddressRequest
  emails: string[]
  phones: string[]
  addresses: AddressRequest[]
  roles: string[]
  types: string[]
  groups: string[]
  permissions: User_Perm[]
}
export type TUser = {
  oid: string,
  username: string,
  code: string,
  uid?: string,
  gender?: string,
  displayName?: string,
  currentAddress?: TAddress,
  firstname?: string,
  status?: string,
  lastname?: string,
  currentType?: string,
  currentRole?: string,
  currentPhone?: string,
  currentEmail?: string,
  profileImage?: string,
  khFirstname?: string,
  khLastname?: string,
  addresses: TAddress[],
  emails: string[],
  phones: string[],
  roles: string[],
  types: string[],
  groups: string[],
  permissions: TPermission[]
}
export type TUserFilter = TBaseFilter<string> & {
  gender?: string
  hasProfileImage: number
  isInTypes?: TIsIn<string>
  isInRoles?: TIsIn<string>
  isInGroups?: TIsIn<string>
  hasPhonesIn?: TIsIn<string>
  hasEmailsIn?: TIsIn<string>
  hasPermissionsIn?: TIsIn<string>
  currentRole?: string
  currentType?: string
}