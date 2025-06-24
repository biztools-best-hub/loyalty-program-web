import { api } from "../constants";
import { TDataListResponse } from "../types/models/base";
import { EventFilter, EventModel, EventResponse } from "../types/models/event";
import { UploadResult } from "../types/models/upload";
import baseFetch from "./base-api";

const eventFetch = {
  async addAsync(baseUrl: string, input: EventModel, noReturnData?: boolean): Promise<EventResponse> {
    return await baseFetch().post<EventResponse>(baseUrl, api.event.add.url, input, noReturnData)
  },
  async filterAsync(baseUrl: string, input: EventFilter, noReturnData?: boolean): Promise<TDataListResponse<EventResponse>> {
    return await baseFetch().post<TDataListResponse<EventResponse>>(baseUrl, api.event.filter.url, input, noReturnData)
  },
  async removeAsync(baseUrl: string, params: any): Promise<EventResponse> {
    return await baseFetch().get<EventResponse>(baseUrl, api.event.remove.url, params)
  },
  async uploadAsync(baseUrl: string, params: any): Promise<UploadResult> {
    return await baseFetch().postForm<UploadResult>(baseUrl, api.event.upload.url, params)
  }
}
export default eventFetch