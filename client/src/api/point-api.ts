import { api } from "../constants";
import {
  OffSetPointRequest,
  PointResponse,
  PointSummaryResponse,
  TPointSummaryFilter,
  TSinglePointSummaryFilter
} from "../types/models";
import { TBaseFilter, TDataListResponse } from "../types/models/base";
import baseFetch from "./base-api";

const pointFetch = {
  async getPointHistoryAsync(baseUrl: string, filter: TBaseFilter<string>): Promise<TDataListResponse<PointResponse>> {
    return await baseFetch().post<TDataListResponse<PointResponse>>(baseUrl, api.point.getPointHistoryAsync.url, filter)
  },
  async offSetPointsAsync(baseUrl: string, input: OffSetPointRequest): Promise<void> {
    return await baseFetch().post<void>(baseUrl, api.point.offSetAsync.url, input, true)
  },
  async pointsSummaryAsync(baseUrl: string, filter: TPointSummaryFilter): Promise<TDataListResponse<PointSummaryResponse>> {
    return await baseFetch().post<TDataListResponse<PointSummaryResponse>>(baseUrl, api.point.pointsSummaryAsync.url, filter)
  },
  async singlePointSummaryAsync(baseUrl: string, filter: TSinglePointSummaryFilter): Promise<PointSummaryResponse> {
    return await baseFetch().post<PointSummaryResponse>(baseUrl, api.point.singlePointSummaryAsync.url, filter)
  }
}
export default pointFetch