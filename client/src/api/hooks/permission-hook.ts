import { api } from "../../constants";
import { AddOrRemovePermissionsOfUserInput, AddOrRemoveUsersOfPermissionInput, PermissionResult, PermissionsOfUserResult, TWebUser, UsersOfPermissionResult } from "../../types/models/permissions";
import permissionFetch from "../permission-api";
import { TMutateHookArgs, TQueryHookArgs, useBaseMutationHook, useBaseQueryHook } from "./base-hook";

export const useAddOrRemoveUsersOfPermissionHook = ({ onSuccess, onError }: TMutateHookArgs<UsersOfPermissionResult>) => {
  return useBaseMutationHook<UsersOfPermissionResult, AddOrRemoveUsersOfPermissionInput>(permissionFetch.addOrRemoveUsersOfPermissionAsync, onSuccess, onError)
}
export const useAddOrRemovePermissionsOfUserHook = ({ onSuccess, onError }: TMutateHookArgs<PermissionsOfUserResult>) => {
  return useBaseMutationHook<PermissionsOfUserResult, AddOrRemovePermissionsOfUserInput>(permissionFetch.addOrRemovePermissionsOfUserAsync, onSuccess, onError)
}
export const useUsersOfPermissionHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<UsersOfPermissionResult>) => {
  return useBaseQueryHook<UsersOfPermissionResult>(permissionFetch.usersOfPermissionAsync, api.permission.usersOfPermissionAsync.name, onSuccess, onError, params, enabled)
}
export const usePermissionsOfUserHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<PermissionsOfUserResult>) => {
  return useBaseQueryHook<PermissionsOfUserResult>(permissionFetch.permissionsOfUserAsync, api.permission.permissionsOfUserAsync.name, onSuccess, onError, params, enabled)
}
export const useAllPermissionsHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<PermissionResult[]>) => {
  return useBaseQueryHook<PermissionResult[]>(permissionFetch.allPermissionsAsync, api.permission.allPermissionsAsync.name, onSuccess, onError, params, enabled)
}
export const useWebUsersHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<TWebUser[]>) => {
  return useBaseQueryHook<TWebUser[]>(permissionFetch.webUsersAsync, api.permission.webUsersAsync.name, onSuccess, onError, params, enabled)
}