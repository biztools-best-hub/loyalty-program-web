import { api } from "../constants"
import {
  BriefClientResponse,
  TBriefClientFilter,
  TPOSClient,
  TPOSClientArgs,
  TPOSClientFilter
} from "../types/models"
import { TDataListResponse } from "../types/models/base"
import baseFetch from "./base-api"

const posClientFetch = {
  async filterAsync(baseUrl: string, input: TPOSClientFilter): Promise<TDataListResponse<TPOSClient>> {
    return await baseFetch().post<TDataListResponse<TPOSClient>>(baseUrl, api.posClient.filter.url, input)
  },
  async allAsync(baseUrl: string,): Promise<TPOSClient[]> {
    return await baseFetch().get<TPOSClient[]>(baseUrl, api.posClient.all.url)
  },
  async getAsync(baseUrl: string, params: any): Promise<TPOSClient | undefined | null> {
    return await baseFetch().get<TPOSClient | undefined | null>(baseUrl, api.posClient.get.url, params)
  },
  async addAsync(baseUrl: string, input: TPOSClientArgs): Promise<TPOSClient> {
    return await baseFetch().post<TPOSClient>(baseUrl, api.posClient.add.url, input)
  },
  async updateAsync(baseUrl: string, input: TPOSClientArgs): Promise<TPOSClient> {
    return await baseFetch().post<TPOSClient>(baseUrl, api.posClient.update.url, input)
  },
  async removeAsync(baseUrl: string, params: any): Promise<TPOSClient> {
    return await baseFetch().get<TPOSClient>(baseUrl, api.posClient.remove.url, params)
  },
  async briefFilterAsync(baseUrl: string, input: TBriefClientFilter): Promise<TDataListResponse<BriefClientResponse>> {
    return await baseFetch().post<TDataListResponse<BriefClientResponse>>(baseUrl, api.posClient.briefFilter.url, input)
  }
}
export default posClientFetch