import { api } from "../constants"
import { TUser, TUserFilter, TUserRequest } from "../types/models"
import { TDataListResponse } from "../types/models/base"
import baseFetch from "./base-api"

const userFetch = {
  async usersAsync(baseUrl: string, filter: TUserFilter, noReturnData?: boolean): Promise<TDataListResponse<TUser>> {
    return await baseFetch().post<TDataListResponse<TUser>>(baseUrl, api.user.usersAsync.url, filter, noReturnData)
  },
  async userAsync(baseUrl: string, params: any, noReturnData?: boolean): Promise<TUser> {
    return await baseFetch().get<TUser>(baseUrl, api.user.userAsync.url, params, noReturnData)
  },
  async switchUserTypeAsync(baseUrl: string, params: any, noReturnData?: boolean): Promise<TUser> {
    return await baseFetch().get<TUser>(baseUrl, api.user.switchUserTypeAsync.url, params, noReturnData)
  },
  async updateUserAsync(baseUrl: string, input: TUserRequest, noReturnData?: boolean): Promise<TUser> {
    return await baseFetch().post<TUser>(baseUrl, api.user.updateUserAsync.url, input, noReturnData)
  },
  async addUserAsync(baseUrl: string, input: TUserRequest, noReturnData?: boolean): Promise<TUser> {
    return await baseFetch().post<TUser>(baseUrl, api.user.addUserAsync.url, input, noReturnData)
  }
}
export default userFetch