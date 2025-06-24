import { TBaseFilter } from "./base"

export type EventModel = {
  oid?: string
  title: string
  titleKhmer?: string
  description?: string
  descriptionKhmer?: string
  status: string
  link?: string
  eventType?: string
  duration: number
  imageUrl?: string
}
export type EventResponse = {
  oid: string
  title?: string
  titleKhmer?: string
  description?: string
  createdAt: Date
  link?: string
  descriptionKhmer?: string
  status: string
  eventType: string
  duration: number
  imageUrl?: string
}
export type EventFilter = TBaseFilter<string> & {
  status?: string
  eventType?: string
  startDate: Date | null
  endDate: Date | null
  needFetch: boolean
}