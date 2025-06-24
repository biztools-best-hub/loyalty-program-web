export type TIsIn<T> = {
  field?: string
  values: T[]
}
export type TOrder = {
  field?: string
  isDesc?: boolean
}
export type AdvanceSearch = {
  field: string,
  search: string
}
export type TBaseFilter<T> = {
  page?: number
  take?: number
  search?: string
  createdAtOrAfter?: Date
  createdAtOrBefore?: Date
  updatedAtOrAfter?: Date
  updatedAtOrBefore?: Date
  advanceSearch?: AdvanceSearch
  isIn?: TIsIn<T>
  order?: TOrder
}

export type TDataListResponse<T> = {
  data: T[]
  page: number
  totalFilteredRecords: number,
  totalRecords: number
}