import {
  OffSetPointRequest,
  PointSummaryResponse,
  TPointFilterResponse,
  TPointSummaryFilter,
  TSinglePointSummaryFilter
} from "../../types/models";
import { TBaseFilter, TDataListResponse } from "../../types/models/base";
import pointFetch from "../point-api";
import { TMutateHookArgs, useBaseMutationHook } from "./base-hook";

export const usePointsHistoryHook = ({ onSuccess, onError }: TMutateHookArgs<TPointFilterResponse>) => {
  return useBaseMutationHook<TPointFilterResponse, TBaseFilter<string>>(
    pointFetch.getPointHistoryAsync,
    onSuccess,
    onError
  )
}
export const useOffsetPointsHook = ({ onSuccess, onError }: TMutateHookArgs<void>) => {
  return useBaseMutationHook<void, OffSetPointRequest>(pointFetch.offSetPointsAsync, onSuccess, onError)
}
export const usePointsSummaryHook = ({ onSuccess, onError }: TMutateHookArgs<TDataListResponse<PointSummaryResponse>>) => {
  return useBaseMutationHook<TDataListResponse<PointSummaryResponse>, TPointSummaryFilter>(
    pointFetch.pointsSummaryAsync,
    onSuccess,
    onError
  )
}
export const useSinglePointSummaryHook = ({ onSuccess, onError }: TMutateHookArgs<PointSummaryResponse>) => {
  return useBaseMutationHook<PointSummaryResponse, TSinglePointSummaryFilter>(
    pointFetch.singlePointSummaryAsync,
    onSuccess,
    onError
  )
}