import { rowsPerPage } from "../../constants"
import { TPointSummaryFilter } from "../../types/models"

export type TItem = {
  label: string,
  id: string,
  selected: boolean
}
export type Order = {
  field: 'name' | 'number' | 'expiry-date' | 'temp-point' | 'expired-point' | 'earned-point' |
  'spent-point' | 'offset-point' | 'remain-point' | 'status'
  dir: 'asc' | 'desc' | 'none'
}
export const initialItems: TItem[] = [{
  label: "all clients",
  id: "all-clients",
  selected: true,
}, {
  label: "specific clients",
  id: "specific-clients",
  selected: false
}];
export const initialClientStatusItems: (TItem & { value: number })[] = [{
  label: 'all',
  id: 'all',
  selected: true,
  value: 4
}, {
  label: 'member',
  id: 'member',
  selected: true,
  value: 1
}, {
  label: 'none',
  id: 'none',
  selected: true,
  value: 0
}, {
  label: 'hold',
  id: 'hold',
  selected: true,
  value: 2
}, {
  label: 'resign',
  id: 'resign',
  selected: true,
  value: 3
}]
export const initialAllFilter: TPointSummaryFilter = {
  page: 1,
  take: rowsPerPage[0],
  clientStatus: 'all'
}