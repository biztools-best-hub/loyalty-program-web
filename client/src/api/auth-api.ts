import { api } from "../constants"
import { TChangePasswordRequest, TChangePasswordResponse, TLogin, TLoginArgs, TRegisterArgs, TUser } from "../types/models";
import baseFetch from "./base-api"
const authFetch = {
  async refreshCall(baseUrl: string): Promise<TLogin> {
    return await baseFetch(true).get<TLogin>(baseUrl, api.auth.refresh.url)
  },
  async fetchMe(baseUrl: string): Promise<TUser> {
    return await baseFetch().get<TUser>(baseUrl, api.auth.me.url)
  },
  async loginAsync(baseUrl: string, input: TLoginArgs): Promise<TLogin> {
    return await baseFetch().post<TLogin>(baseUrl, api.auth.login.url, input)
  },
  async registerAsync(baseUrl: string, input: TRegisterArgs): Promise<TUser> {
    return await baseFetch().post<TUser>(baseUrl, api.auth.register.url, input)
  },
  async changePasswordAsync(baseUrl: string, input: TChangePasswordRequest): Promise<TChangePasswordResponse> {
    return await baseFetch().post<TChangePasswordResponse>(baseUrl, api.auth.changePassword.url, input)
  }
};
export default authFetch