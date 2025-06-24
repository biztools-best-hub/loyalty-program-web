import { TBaseFilter, TIsIn } from "./base"

export type TPOSClientFilter = TBaseFilter<string> & {
  gender?: string
  isInGroups?: TIsIn<string>
  isSavingAndMember?: boolean
}
export type TPOSClient = {
  oid: string
  number?: string
  name?: string
  nameKhmer?: string
  phone1?: string
  registerDate?: Date
  years: number
  months: number
  days: number
  dob?: Date
  deliverToAddress1?: string
  deliverToAddress2?: string
  billToAddress1?: string
  billToAddress2?: string
  status: string
  gender: string;
  clientGroup: string
  createdAt: Date
  updatedAt?: Date
  createdBy: string
  updatedBy?: string
}
export type TPOSClientArgs = {
  oid: string
  number?: string
  name?: string
  phone1?: string
  dob?: Date
  deliverToAddress1?: string
  deliverToAddress2?: string
  billToAddress1?: string
  billToAddress2?: string
  gender?: string
  clientGroup?: string
}
export type BriefClientResponse = {
  oid: string
  number: string
  name: string
  status: string
  expiry: Date
}
export type TBriefClientFilter = TBaseFilter<string> & {
  status?: string
  maxRemainingMonths?: number
}