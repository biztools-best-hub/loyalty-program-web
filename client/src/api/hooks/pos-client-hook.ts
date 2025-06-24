import { api } from "../../constants"
import {
  BriefClientResponse,
  TBriefClientFilter,
  TPOSClient,
  TPOSClientArgs,
  TPOSClientFilter
} from "../../types/models"
import { TDataListResponse } from "../../types/models/base"
import posClientFetch from "../pos-client-api"
import { TMutateHookArgs, TQueryHookArgs, useBaseMutationHook, useBaseQueryHook } from "./base-hook"


export const useAddPOSClientHook = ({ onSuccess, onError }: TMutateHookArgs<TPOSClient>) => {
  const mutate = useBaseMutationHook<TPOSClient, TPOSClientArgs>(posClientFetch.addAsync, onSuccess, onError)
  return mutate
}
export const useUpdatePOSClientHook = ({ onSuccess, onError }: TMutateHookArgs<TPOSClient>) => {
  const mutate = useBaseMutationHook<TPOSClient, TPOSClientArgs>(posClientFetch.updateAsync, onSuccess, onError)
  return mutate
}
export const useGetPOSClientHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<TPOSClient>) => {
  const query = useBaseQueryHook<TPOSClient | null | undefined>(
    posClientFetch.getAsync,
    api.posClient.get.name,
    onSuccess,
    onError,
    params,
    enabled
  )
  return query
}
export const useRemovePOSClientHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<TPOSClient>) => {
  const query = useBaseQueryHook<TPOSClient>(
    posClientFetch.removeAsync,
    api.posClient.remove.name,
    onSuccess,
    onError,
    params,
    enabled
  )
  return query
}
export const useAllPOSClientHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<TPOSClient[]>) => {
  const query = useBaseQueryHook<TPOSClient[]>(
    posClientFetch.allAsync,
    api.posClient.all.name,
    onSuccess,
    onError,
    params,
    enabled
  )
  return query
}
export const useFilterPOSClientHook = ({ onSuccess, onError }: TMutateHookArgs<TDataListResponse<TPOSClient>>) => {
  const mutate = useBaseMutationHook<TDataListResponse<TPOSClient>, TPOSClientFilter>(
    posClientFetch.filterAsync,
    onSuccess,
    onError
  )
  return mutate
}
export const useBriefPOSClientFilterHook = ({ onSuccess, onError }: TMutateHookArgs<TDataListResponse<BriefClientResponse>>) => {
  const mutate = useBaseMutationHook<TDataListResponse<BriefClientResponse>, TBriefClientFilter>(
    posClientFetch.briefFilterAsync,
    onSuccess,
    onError
  )
  return mutate
}