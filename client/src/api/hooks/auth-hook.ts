import { api } from "../../constants";
import { TChangePasswordRequest, TChangePasswordResponse, TLogin, TLoginArgs, TRegisterArgs, TUser } from "../../types/models";
import authFetch from "../auth-api";
import { TMutateHookArgs, TQueryHookArgs, useBaseMutationHook, useBaseQueryHook } from "./base-hook";

export const useMeHook = ({ onSuccess, onError, params, enabled }: TQueryHookArgs<TUser>) => {
  const query = useBaseQueryHook<TUser>(authFetch.fetchMe, api.auth.me.name, onSuccess, onError, params, enabled)
  return query
}
export const useRefreshHook = ({ onSuccess, onError, params, enabled }: TQueryHookArgs<TLogin>) => {
  const query = useBaseQueryHook<TLogin>(authFetch.refreshCall, api.auth.refresh.name, onSuccess, onError, params, enabled, true)
  return query
}
export const useLoginHook = ({ onSuccess, onError }: TMutateHookArgs<TLogin>) => {
  const mutate = useBaseMutationHook<TLogin, TLoginArgs>(authFetch.loginAsync, onSuccess, onError)
  return mutate
}
export const useRegisterHook = ({ onSuccess, onError }: TMutateHookArgs<TUser>) => {
  const mutate = useBaseMutationHook<TUser, TRegisterArgs>(authFetch.registerAsync, onSuccess, onError)
  return mutate
}
export const useChangePasswordHook = ({ onSuccess, onError }: TMutateHookArgs<TChangePasswordResponse>) => {
  const mutate = useBaseMutationHook<TChangePasswordResponse, TChangePasswordRequest>(authFetch.changePasswordAsync, onSuccess, onError)
  return mutate
}