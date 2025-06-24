import { FileUpload, UploadResult } from "../types/models/upload";
import baseFetch from "./base-api"

const uploader = {
  async upload(baseUrl: string, input: FileUpload) {
    return await baseFetch().postForm<UploadResult>(baseUrl, '/api/file/upload-profile', input);
  }
}
export default uploader