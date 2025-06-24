import {
  TLoginArgs as LoginArgs,
  TRegisterArgs as RegisterArgs,
  TLogin as Login,
  TChangePasswordRequest as ChangePasswordReq,
  TChangePasswordResponse as ChangePasswordRes
} from "./auth"
import { TUserFilter as UserFilter, TUser as User, TUserRequest as UserRequest } from "./user"
import {
  TBriefClientFilter as BriefClientFilter,
  BriefClientResponse as ClientResponse,
  TPOSClientArgs as ClientArgs,
  TPOSClient as Client,
  TPOSClientFilter as ClientFilter
} from "./pos-client"
import {
  PointResponse as Point,
  AlterPointResponse as AlterPoint,
  PointSummaryResponse as Summary,
  TPointFilterResponse as PointFilterRes,
  TPointSummaryFilter as SummaryFilter,
  TSinglePointSummaryFilter as SingleFilter,
  OffSetPointRequest as OffsetRequest
} from './point'
export type TUser = User
export type TUserRequest = UserRequest
export type TLoginArgs = LoginArgs
export type TRegisterArgs = RegisterArgs
export type TChangePasswordRequest = ChangePasswordReq
export type TChangePasswordResponse = ChangePasswordRes
export type TLogin = Login
export type TPOSClientFilter = ClientFilter
export type TUserFilter = UserFilter
export type TPOSClient = Client
export type TPOSClientArgs = ClientArgs
export type BriefClientResponse = ClientResponse
export type TBriefClientFilter = BriefClientFilter
export type TPointFilterResponse = PointFilterRes
export type TPointSummaryFilter = SummaryFilter
export type TSinglePointSummaryFilter = SingleFilter
export type OffSetPointRequest = OffsetRequest
export type PointSummaryResponse = Summary
export type PointResponse = Point
export type AlterPointResponse = AlterPoint