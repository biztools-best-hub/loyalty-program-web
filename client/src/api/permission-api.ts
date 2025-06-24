import { api } from "../constants";
import { AddOrRemovePermissionsOfUserInput, AddOrRemoveUsersOfPermissionInput, PermissionResult, PermissionsOfUserResult, TWebUser, UsersOfPermissionResult } from "../types/models/permissions";
import baseFetch from "./base-api";

const permissionFetch = {
  async addOrRemoveUsersOfPermissionAsync(baseUrl: string, input: AddOrRemoveUsersOfPermissionInput, noReturnData?: boolean): Promise<UsersOfPermissionResult> {
    return baseFetch().post<UsersOfPermissionResult>(baseUrl, api.permission.addOrRemoveUsersOfPermissionAsync.url, input, noReturnData)
  },
  async addOrRemovePermissionsOfUserAsync(baseUrl: string, input: AddOrRemovePermissionsOfUserInput, noReturnData?: boolean): Promise<PermissionsOfUserResult> {
    return baseFetch().post<PermissionsOfUserResult>(baseUrl, api.permission.addOrRemovePermissionsOfUserAsync.url, input, noReturnData)
  },
  async allPermissionsAsync(baseUrl: string, params: any): Promise<PermissionResult[]> {
    return baseFetch().get<PermissionResult[]>(baseUrl, api.permission.allPermissionsAsync.url, params)
  },
  async webUsersAsync(baseUrl: string, params: any): Promise<TWebUser[]> {
    return baseFetch().get<TWebUser[]>(baseUrl, api.permission.webUsersAsync.url, params)
  },
  async usersOfPermissionAsync(baseUrl: string, params: any): Promise<UsersOfPermissionResult> {
    return baseFetch().get<UsersOfPermissionResult>(baseUrl, api.permission.usersOfPermissionAsync.url, params)
  },
  async permissionsOfUserAsync(baseUrl: string, params: any): Promise<PermissionsOfUserResult> {
    return baseFetch().get<PermissionsOfUserResult>(baseUrl, api.permission.permissionsOfUserAsync.url, params)
  }
}
export default permissionFetch