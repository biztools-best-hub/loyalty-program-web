import { FC, ReactNode, createContext, useContext, useState } from "react";
import { useQuery } from "react-query";
import {
  useChangePasswordHook,
  useLoginHook,
  useMeHook,
  useRefreshHook,
  useRegisterHook
} from "../api/hooks/auth-hook";
import {
  useAddPOSClientHook,
  useAllPOSClientHook,
  useBriefPOSClientFilterHook,
  useFilterPOSClientHook,
  useGetPOSClientHook,
  useRemovePOSClientHook,
  useUpdatePOSClientHook
} from "../api/hooks/pos-client-hook";
import {
  useOffsetPointsHook,
  usePointsHistoryHook,
  usePointsSummaryHook,
  useSinglePointSummaryHook
} from "../api/hooks/point-hook";
import {
  useAddUserHook,
  useSwitchUserTypeHook,
  useUpdateUserHook,
  useUserHook,
  useUsersHook
} from "../api/hooks/user-hook";
import { useUploadHook } from "../api/hooks/upload-hook";
import {
  useAddEventHook,
  useFilterEventsHook,
  useRemoveEventHook,
  useUploadEventHook
} from "../api/hooks/event-hook";
import { dashboardReportHook, memberStatisticHook } from "../api/hooks/dashboard-hook";
import {
  useAddOrRemovePermissionsOfUserHook,
  useAddOrRemoveUsersOfPermissionHook,
  useAllPermissionsHook,
  usePermissionsOfUserHook,
  useUsersOfPermissionHook,
  useWebUsersHook
} from "../api/hooks/permission-hook";
import {
  useAnnouncementsHook,
  useBroadcastHook,
  useRemoveAnnouncementsHook,
  useUploadAnnouncementHook,
  useSetLastAnnouncementsHook,
  useGetLastAnnouncementsCountHook
} from "../api/hooks/message-hook";

type TApiContextProps = {
  apiUrl: string
  webUrl: string
  ws: string
  companyName: string
}
const ApiContext = createContext<TApiContextProps>({ apiUrl: '', webUrl: '', ws: '', companyName: 'BIZTOOLS ENTERPRISE SOLUTION TECHNOLOGIES CO., LTD' })
const fetchApiUrl = async (): Promise<{
  'api-url': string,
  'web-url': string,
  'webSocket': string,
  'company-name': string
}> => {
  const res = await fetch('/config.json')
  if (res.status !== 200) throw res
  const data = await res.json()
  return data
}
const ApiProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [apiUrl, setApiUrl] = useState('')
  const [webUrl, setWebUrl] = useState('')
  const [ws, setWs] = useState('')
  const [companyName, setCompanyName] = useState('BIZTOOLS ENTERPRISE SOLUTION TECHNOLOGIES CO., LTD')
  useQuery('API_URL', fetchApiUrl, {
    onError: _ => { },
    onSuccess: d => {
      setApiUrl(_ => d['api-url'])
      setWebUrl(_ => d["web-url"])
      setWs(_ => d.webSocket);
      if (!!d['company-name']) setCompanyName(() => d['company-name'])
    },
    retry: false
  })
  return <ApiContext.Provider value={{ apiUrl, webUrl, ws, companyName }}>
    {children}
  </ApiContext.Provider>
}
export const useApi = () => {
  const { apiUrl, webUrl, ws, companyName } = useContext(ApiContext)
  const auth = {
    useLogin: useLoginHook,
    useRegister: useRegisterHook,
    useMe: useMeHook,
    useRefresh: useRefreshHook,
    useChangePassword: useChangePasswordHook
  }
  const posClient = {
    useAddPosClient: useAddPOSClientHook,
    useUpdatePosClient: useUpdatePOSClientHook,
    useRemovePosClient: useRemovePOSClientHook,
    usePosClient: useGetPOSClientHook,
    usePosClients: useAllPOSClientHook,
    useFilterPosClients: useFilterPOSClientHook,
    useBriefFilterPosClients: useBriefPOSClientFilterHook
  }
  const point = {
    usePointsHistory: usePointsHistoryHook,
    useOffsetPoints: useOffsetPointsHook,
    usePointsSummary: usePointsSummaryHook,
    useSinglePointSummary: useSinglePointSummaryHook
  }
  const user = {
    useUser: useUserHook,
    useUsers: useUsersHook,
    useAddUser: useAddUserHook,
    useUpdateUser: useUpdateUserHook,
    useSwitchUserType: useSwitchUserTypeHook
  }
  const event = {
    useAddEvent: useAddEventHook,
    useFilterEvents: useFilterEventsHook,
    useRemoveEvent: useRemoveEventHook,
    useUploadEvent: useUploadEventHook
  }
  const uploader = {
    useUpload: useUploadHook
  }
  const dashboard = {
    useDashboardReport: dashboardReportHook,
    useMemberStatistic: memberStatisticHook
  }
  const permission = {
    useAddOrRemoveUsersOfPermission: useAddOrRemoveUsersOfPermissionHook,
    useAddOrRemovePermissionsOfUser: useAddOrRemovePermissionsOfUserHook,
    useUsersOfPermission: useUsersOfPermissionHook,
    usePermissionsOfUser: usePermissionsOfUserHook,
    useAllPermissions: useAllPermissionsHook,
    useWebUsers: useWebUsersHook
  }
  const message = {
    useBroadcast: useBroadcastHook,
    useRemoveAnnouncements: useRemoveAnnouncementsHook,
    useGetAnnouncements: useAnnouncementsHook,
    useUploadAnnouncementImage: useUploadAnnouncementHook,
    useSetLastAnnouncements: useSetLastAnnouncementsHook,
    useGetLastAnnouncementsCount: useGetLastAnnouncementsCountHook
  }
  return {
    apiUrl, webUrl, auth, posClient, point, user, uploader, ws, event, dashboard, permission, message, companyName
  }
}
export default ApiProvider