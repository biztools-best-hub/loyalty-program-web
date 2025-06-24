import { FileUpload, UploadResult } from "../../types/models/upload";
import uploader from "../upload-api";
import { TMutateHookArgs, useBaseMutationHookWeb } from "./base-hook";

export const useUploadHook = ({ onSuccess, onError }: TMutateHookArgs<UploadResult>) => {
  return useBaseMutationHookWeb<UploadResult, FileUpload>(uploader.upload, onSuccess, onError)
}