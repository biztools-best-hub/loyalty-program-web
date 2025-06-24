export type AddOrRemoveUsersOfPermissionInput = {
  permissionOid: string
  removeUsers: string[]
  addUsers: string[]
}
export type AddOrRemovePermissionsOfUserInput = {
  username: string
  removePermissions: string[]
  addPermissions: string[]
}
export type UsersOfPermissionResult = {
  permissionOid: string
  permissionName: string
  permissionKey: string
  users: string[]
}
export type PermissionsOfUserResult = {
  username: string
  userOid: string
  permissons: PermissionResult[]
}
export type PermissionResult = {
  oid: string
  name: string
  key: string
}
export type TWebUser = {
  username: string
  profileImage?: string
}