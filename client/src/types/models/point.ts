import { TBaseFilter, TDataListResponse, TIsIn } from "./base"

export type TPointFilterResponse = TDataListResponse<PointResponse> & {
  lastPoint?: PointResponse
}
export type OffSetPointRequest = {
  clientOid: string
  description: string
  offSetPoints: number
  offlineSaleAction?: number
  pointType: number
  timeStamp?: Date
  userLogIn: string
}
export type PointResponse = {
  clientOid: string
  timeStamp: Date
  current: number
  total: number
  referenceNumber?: string
  amount: number
  remark?: string
  remark2?: string
  beginningPoints: number
  earnedPoints: number
  spentPoints: number
  offSetPoints: number
  adjustPoints: number
  remainPoints: number
  expiredPoints: number
  userLogIn: string
  oid: string;
  temporaryPoints: number
  sOOid: string
  saleOid: string
  pointType: number
  offsetDescription: "Offset charge point- Ref:"
  temporaryDescription: "From temporary point "
  isOffsetDescription: boolean
  isAdjustment_PointsHistory: boolean
}
export type PointSummaryResponse = {
  client: {
    oid: string
    number: string
    name: string
    registerDate?: Date
    lastDate: Date
    years: number
    months: number
    days: number
    status: string
    expiry: Date
  }
  point: PointResponse
}

export type TPointSummaryFilter = TBaseFilter<string> & {
  ofClientOids?: TIsIn<string>
  clientStatus?: string
  startDate?: Date
  endDate?: Date
  mostRemain?: number
  leastRemain?: number
  maxRemainingMonths?: number
}
export type TSinglePointSummaryFilter = {
  clientOid?: string
  startDate?: Date
  mostRemain?: number
  leastRemain?: number
  endDate?: Date
}
export type AlterPointResponse = PointResponse & {
  origin: boolean
}
export type TPointMember = {
  oid: string
  points: number
  number: string
  registeredDate?: Date
  name: string
}
export type TDashboardPointData = {
  total: number
  spend: number
  earned: number
  adjust: number
}
export type TSubSummary = {
  year: number
  month: number
}
export type TSummary = {
  count: number
  previous: TSubSummary
  current: TSubSummary
}
export type TDashboardSummaryData = {
  all: TSummary
  available: TSummary
  expired: TSummary
}
export type TDashboardReport = {
  topPointsMembers: TPointMember[]
  topSpendingMembers: TPointMember[]
  totalPointsMembers: TPointMember[]
  newMembers: TPointMember[]
  points: TDashboardPointData
  summaryData: TDashboardSummaryData
}
export type TStatisticPoint = {
  points: number
  timestamp: Date
}
export type TMemberStatistic = {
  oid: string
  points: TStatisticPoint[]
}
export type TMemberStatisticInput = {
  oid: string
  pointType: 'a' | 'e' | 's'
}