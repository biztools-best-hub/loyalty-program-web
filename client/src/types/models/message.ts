export type MessageResponse = {
  oid: string
  status: string
  imageUrl?: string
  title?: string
  titleKhmer?: string
  description?: string
  descriptionKhmer?: string
  link?: string
  sendAt?: Date
  cycleDays?: string
  cycleTime?: string
  createdDate: Date
  createdBy?: string
};
export type BroadcastInput = {
  message?: { english?: string, khmer?: string }
  title?: { english?: string, khmer?: string }
  imageUrl?: string
  link?: string
  topic?: string
  sendAt?: string
  cycleDays?: string
  cycleTime?: string
  status: string
};
export type RemoveAnnouncementsInput = {
  oidList: string[]
};
export type MessageRemoveResult = { isSuccess: boolean };