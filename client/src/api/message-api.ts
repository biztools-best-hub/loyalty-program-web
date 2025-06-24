import { api } from "../constants"
import { BroadcastInput, MessageRemoveResult, MessageResponse, RemoveAnnouncementsInput } from "../types/models/message"
import { UploadResult } from "../types/models/upload"
import baseFetch from "./base-api"

const messageFetch = {
  async broadcastAsync(baseUrl: string, input: BroadcastInput, noReturnData?: boolean): Promise<MessageResponse> {
    return await baseFetch().post<MessageResponse>(baseUrl, api.message.broadcast.url, input, noReturnData)
  },
  async announcementsAsync(baseUrl: string, noReturnData?: boolean): Promise<MessageResponse[]> {
    return await baseFetch().get<MessageResponse[]>(baseUrl, api.message.getAnnouncements.url, noReturnData)
  },
  async setLastAnnouncementsAsync(baseUrl: string, noReturnData?: boolean): Promise<MessageResponse[]> {
    return await baseFetch().get<MessageResponse[]>(baseUrl, api.message.setLastAnnouncements.url, noReturnData)
  },
  async getLastAnnouncementsCountAsync(baseUrl: string, noReturnData?: boolean): Promise<{ count: number }> {
    return await baseFetch().get<{ count: number }>(baseUrl, api.message.getLastAnnouncementsCount.url, noReturnData)
  },
  async removeAsync(baseUrl: string, input: RemoveAnnouncementsInput): Promise<MessageRemoveResult> {
    return await baseFetch().post<MessageRemoveResult>(baseUrl, api.message.removeAnnouncements.url, input)
  },
  async uploadAsync(baseUrl: string, params: any): Promise<UploadResult> {
    return await baseFetch().postForm<UploadResult>(baseUrl, api.message.uploadAnnouncementImage.url, params)
  },

}
export default messageFetch