import { api } from "../../constants"
import { TDashboardReport, TMemberStatistic, TMemberStatisticInput } from "../../types/models/point"
import dashboardFetch from "../dashboard-api"
import { TMutateHookArgs, TQueryHookArgs, useBaseMutationHook, useBaseQueryHook } from "./base-hook"

export const dashboardReportHook = ({ onSuccess, onError, enabled, params }: TQueryHookArgs<TDashboardReport>) => {
  return useBaseQueryHook<TDashboardReport>(dashboardFetch.dashboardReportAsync, api.dashboard.dashboardReportAsync.name, onSuccess, onError, params, enabled)
}
export const memberStatisticHook = ({ onSuccess, onError }: TMutateHookArgs<TMemberStatistic>) => {
  return useBaseMutationHook<TMemberStatistic, TMemberStatisticInput>(dashboardFetch.memberStatisticAsync, onSuccess, onError)
}