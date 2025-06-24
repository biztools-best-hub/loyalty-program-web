import { api } from "../../constants";
import { TDataListResponse } from "../../types/models/base";
import { EventFilter, EventModel, EventResponse } from "../../types/models/event";
import { FileUpload, UploadResult } from "../../types/models/upload";
import eventFetch from "../event-api";
import { TMutateHookArgs, TQueryHookArgs, useBaseMutationHook, useBaseMutationHookWeb, useBaseQueryHook } from "./base-hook";

export const useAddEventHook = ({ onSuccess, onError }: TMutateHookArgs<EventResponse>) => {
  return useBaseMutationHook<EventResponse, EventModel>(eventFetch.addAsync, onSuccess, onError)
}
export const useFilterEventsHook = ({ onSuccess, onError }: TMutateHookArgs<TDataListResponse<EventResponse>>) => {
  return useBaseMutationHook<TDataListResponse<EventResponse>, EventFilter>(eventFetch.filterAsync, onSuccess, onError)
}
export const useRemoveEventHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<EventResponse>) => {
  return useBaseQueryHook<EventResponse>(eventFetch.removeAsync, api.event.remove.name, onSuccess, onError, params, enabled)
}
export const useUpdateEventHook = ({ onSuccess, onError }: TMutateHookArgs<EventResponse>) => {
  return useBaseMutationHook<EventResponse, EventModel>(eventFetch.addAsync, onSuccess, onError)
}
export const useUploadEventHook = ({ onSuccess, onError }: TMutateHookArgs<UploadResult>) => {
  return useBaseMutationHookWeb<UploadResult, FileUpload>(eventFetch.uploadAsync, onSuccess, onError)
}