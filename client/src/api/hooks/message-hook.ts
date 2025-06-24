import { api } from "../../constants"
import { BroadcastInput, MessageRemoveResult, MessageResponse, RemoveAnnouncementsInput } from "../../types/models/message"
import { FileUpload, UploadResult } from "../../types/models/upload"
import messageFetch from "../message-api"
import { TMutateHookArgs, TQueryHookArgs, useBaseMutationHook, useBaseMutationHookWeb, useBaseQueryHook } from "./base-hook"

export const useBroadcastHook = ({ onSuccess, onError }: TMutateHookArgs<MessageResponse>) => {
  return useBaseMutationHook<MessageResponse, BroadcastInput>(messageFetch.broadcastAsync, onSuccess, onError)
}
export const useAnnouncementsHook = ({ onSuccess, onError }: TQueryHookArgs<MessageResponse[]>) => {
  return useBaseQueryHook<MessageResponse[]>(messageFetch.announcementsAsync, api.message.getAnnouncements.name, onSuccess, onError);
}
export const useSetLastAnnouncementsHook = ({ onSuccess, onError, params, enabled }: TQueryHookArgs<MessageResponse[]>) => {
  return useBaseQueryHook<MessageResponse[]>(messageFetch.setLastAnnouncementsAsync, api.message.setLastAnnouncements.name, onSuccess, onError, params, enabled);
}
export const useGetLastAnnouncementsCountHook = ({ onSuccess, onError }: TQueryHookArgs<{ count: number }>) => {
  return useBaseQueryHook<{ count: number }>(messageFetch.getLastAnnouncementsCountAsync, api.message.getLastAnnouncementsCount.name, onSuccess, onError);
}
export const useRemoveAnnouncementsHook = ({ onSuccess, onError }: TMutateHookArgs<MessageRemoveResult>) => {
  return useBaseMutationHook<MessageRemoveResult, RemoveAnnouncementsInput>(messageFetch.removeAsync, onSuccess, onError);
}
export const useUploadAnnouncementHook = ({ onSuccess, onError }: TMutateHookArgs<UploadResult>) => {
  return useBaseMutationHookWeb<UploadResult, FileUpload>(messageFetch.uploadAsync, onSuccess, onError)
}
