export type WsData<T> = {
  dataType: 'authenticate' | 'data' | 'notification'
  sender: string
  data: T
}
export type WsDataReq<T> = WsData<T> & {
  receivers: string[]
}