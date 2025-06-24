export type FileUpload = {
  id: string
  name?: string
  extension?: string
  data?: File,
  old?: string,
  username?: string
  width?: number
  height?: number
}
export type UploadResult = {
  isSuccess: boolean
  localUrl?: string
  refId?: string
}