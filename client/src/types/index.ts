export type TDuration = {
  value: number,
  by: 'minute' | 'hour' | 'day' | 'week' | 'month'
}
export type TLocalStorageKey = 'conical-theme' | 'conical-device-id' | 'conical-lang' | 'conical-is-register' |
  'conical-sidebar-open' | 'filter-state' | 'filter-groups' | 'conical-words'
export type TLocalStorageArgs = {
  key: TLocalStorageKey
  value: string
}
export type TCookieKey = 'conical-access-token' | 'conical-refresh-token' | 'conical-uid'
export type TCookieArgs = {
  key: TCookieKey,
  value: string | number | boolean
  duration: TDuration
}
export type TMenuItemProps = {
  item: TMenuItem
  expand: (id: string) => void
}
export type TMenuItem = {
  label?: string
  icon?: string
  id: string
  active: boolean
  isChild: boolean
  expanded: boolean
  targets?: string[]
  children?: TMenuItem[]
}
export type TApi = {
  name: string,
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
}
export type TMessageApi = {
  getLastAnnouncementsCount: TApi,
  setLastAnnouncements: TApi,
  getAnnouncements: TApi,
  broadcast: TApi,
  uploadAnnouncementImage: TApi,
  removeAnnouncements: TApi,
}
export type TEventApi = {
  filter: TApi
  upload: TApi
  add: TApi
  remove: TApi
}
export type TAuthApi = {
  login: TApi
  register: TApi
  refresh: TApi
  me: TApi,
  changePassword: TApi
}
export type TPosClientApi = {
  filter: TApi
  all: TApi
  get: TApi
  update: TApi
  remove: TApi
  add: TApi
  briefFilter: TApi
}
export type TPointApi = {
  getPointHistoryAsync: TApi
  offSetAsync: TApi
  pointsSummaryAsync: TApi
  singlePointSummaryAsync: TApi
}
export type TUserApi = {
  usersAsync: TApi
  userAsync: TApi
  switchUserTypeAsync: TApi
  updateUserAsync: TApi
  addUserAsync: TApi
}
export type TDashboardApi = {
  dashboardReportAsync: TApi
  memberStatisticAsync: TApi
}
export type TPermissionApi = {
  addOrRemoveUsersOfPermissionAsync: TApi
  addOrRemovePermissionsOfUserAsync: TApi
  usersOfPermissionAsync: TApi
  permissionsOfUserAsync: TApi
  allPermissionsAsync: TApi
  webUsersAsync: TApi
}
export type TApiRoutes = {
  auth: TAuthApi
  posClient: TPosClientApi
  point: TPointApi
  user: TUserApi
  event: TEventApi
  dashboard: TDashboardApi
  permission: TPermissionApi
  message: TMessageApi
}