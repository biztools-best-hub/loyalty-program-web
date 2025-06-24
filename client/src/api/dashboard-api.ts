import { api } from "../constants";
import { TDashboardReport, TMemberStatistic } from "../types/models/point";
import baseFetch from "./base-api";

const dashboardFetch = {
  dashboardReportAsync: async (baseUrl: string, params: any): Promise<TDashboardReport> => {
    return await baseFetch().get<TDashboardReport>(baseUrl, api.dashboard.dashboardReportAsync.url, params)
  },
  memberStatisticAsync: async (baseUrl: string, input: any, noReturnData?: boolean): Promise<TMemberStatistic> => {
    return await baseFetch().post<TMemberStatistic>(baseUrl, api.dashboard.memberStatisticAsync.url, input, noReturnData)
  }
}
export default dashboardFetch