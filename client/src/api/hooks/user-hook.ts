import { api } from "../../constants";
import { TUser, TUserFilter, TUserRequest } from "../../types/models";
import { TDataListResponse } from "../../types/models/base";
import userFetch from "../user-api";
import { TMutateHookArgs, TQueryHookArgs, useBaseMutationHook, useBaseQueryHook } from "./base-hook";

export const useUsersHook = ({ onSuccess, onError }: TMutateHookArgs<TDataListResponse<TUser>>) => {
  const mutate = useBaseMutationHook<TDataListResponse<TUser>, TUserFilter>(userFetch.usersAsync, onSuccess, onError)
  return mutate
}
export const useUserHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<TUser>) => {
  const query = useBaseQueryHook<TUser>(userFetch.userAsync, api.user.userAsync.name, onSuccess, onError, params, enabled)
  return query
}
export const useSwitchUserTypeHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<TUser>) => {
  const query = useBaseQueryHook<TUser>(userFetch.switchUserTypeAsync, api.user.switchUserTypeAsync.name, onSuccess, onError, params, enabled)
  return query
}
export const useUpdateUserHook = ({ onSuccess, onError, params }: TMutateHookArgs<TUser>) => {
  const mutate = useBaseMutationHook<TUser, TUserRequest>(userFetch.updateUserAsync, onSuccess, onError, params)
  return mutate
}
export const useAddUserHook = ({ onSuccess, onError }: TMutateHookArgs<TUser>) => {
  const mutate = useBaseMutationHook<TUser, TUserRequest>(userFetch.addUserAsync, onSuccess, onError)
  return mutate
}