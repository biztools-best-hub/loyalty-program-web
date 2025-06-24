import { useMutation, useQuery } from "react-query"
import { api } from "../../constants"
import authFetch from "../auth-api"
import { useToken } from "../../providers/token-provider"
import { remove, set } from "../../utils/local-storage-util"
import { setCookie } from "../../utils/cookie-util"
import { useApi } from "../../providers/api-provider"
import { useEffect, useState } from "react"
let failedCount = 0
export type TMutateHookArgs<TRes> = {
  onSuccess: (d: TRes) => void
  onError?: (e: any) => void
  params?: any
}
export type TQueryHookArgs<TRes> = TMutateHookArgs<TRes> & {
  enabled?: boolean
}
export const useBaseQueryHook = <T>(
  fn: any,
  name: string,
  onSuccess: any,
  onError: any,
  params?: any,
  enabled?: boolean,
  noRefresh?: boolean
) => {
  const { apiUrl } = useApi()
  const apiCall = async (): Promise<T> => await fn(apiUrl, params)
  const { refreshToken, token, changeToken, removeToken, removeRefreshToken } = useToken()
  const [refreshed, setRefreshed] = useState(false)
  const { refetch: refresh } = useQuery(api.auth.refresh.name, () => authFetch.refreshCall(apiUrl), {
    enabled: false,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onError(_: any) {
      removeToken()
      removeRefreshToken()
      remove('conical-is-register')
    },
    onSuccess(d) {
      changeToken(d.token)
      setCookie({
        key: 'conical-refresh-token',
        value: d.refreshToken,
        duration: {
          value: 2,
          by: 'week'
        }
      })
      if (d.uid) setCookie({
        key: 'conical-uid',
        value: d.uid,
        duration: {
          value: 1,
          by: 'minute'
        }
      })
      set({
        key: 'conical-device-id',
        value: d.deviceId
      })
      setRefreshed(true)
    }
  })
  const { refetch } = useQuery(name, apiCall, {
    enabled,
    retry: false,
    onError(e: any) {
      if (e === 'success') onSuccess()
      else if (e.status == 401 && refreshToken && !noRefresh) {
        if (failedCount > 3) {
          failedCount = 0;
          removeToken()
          removeRefreshToken()
          return onError(e)
        }
        failedCount++
        refresh()
      }
      else if (onError) onError(e)
    },
    onSuccess: res => {
      setRefreshed(false)
      onSuccess(res)
    }
  })
  useEffect(() => {
    if (refreshed) refetch()
  }, [token])
  return refetch
}
export const useBaseMutationHook = <T, TInput>(
  fn: any,
  onSuccess: any,
  onError: any,
  params?: any,
  noRefresh?: boolean,
) => {
  const { apiUrl } = useApi()
  const [refreshed, setRefreshed] = useState(false)
  const { refreshToken, token, changeToken, removeToken, removeRefreshToken } = useToken()
  const { refetch } = useQuery(api.auth.refresh.name, () => authFetch.refreshCall(apiUrl), {
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retryOnMount:false,
    refetchOnMount: false,
    onError(_: any) {
      removeToken()
      removeRefreshToken()
      remove('conical-is-register')
    },
    onSuccess(d) {
      changeToken(d.token)
      setCookie({
        key: 'conical-refresh-token',
        value: d.refreshToken,
        duration: {
          value: 2,
          by: 'week'
        }
      })
      if (d.uid) setCookie({
        key: 'conical-uid',
        value: d.uid,
        duration: {
          value: 1,
          by: 'minute'
        }
      })
      set({
        key: 'conical-device-id',
        value: d.deviceId
      })
      setRefreshed(true)
    }
  })
  const [ip, setInput] = useState<TInput>()
  const { mutate } = useMutation((input: TInput): Promise<T> => {
    setInput(input)
    return fn(apiUrl, input, params)
  }, {
    retry: false,
    onError(e: any) {
      if (e === 'success') onSuccess()
      else if (e.status == 401 && refreshToken && !noRefresh) {
        if (failedCount > 4) {
          failedCount = 0;
          removeToken()
          removeRefreshToken()
          return onError(e)
        }
        failedCount++
        refetch()
      }
      else if (onError) onError(e)
    },
    onSuccess: res => {
      setRefreshed(false)
      onSuccess(res)
    }
  })
  useEffect(() => {
    if (refreshed && ip) mutate(ip)
  }, [token])
  return mutate
}
export const useBaseMutationHookWeb = <T, TInput>(
  fn: any,
  onSuccess: any,
  onError: any,
  params?: any,
) => {
  const { apiUrl } = useApi()
  const { mutate } = useMutation((input: TInput): Promise<T> => {
    return fn(apiUrl, input, params)
  }, {
    retry: false,

    onError(e: any) {
      if (e === 'success') onSuccess()
      else if (onError) onError(e)
    },
    onSuccess: res => {
      onSuccess(res)
    }
  })
  return mutate
}