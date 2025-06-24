import { FC, useEffect, useState } from "react";
import { TPOSClient } from "../../../../types/models";
import ClientInfo from "./client-info";
import IndividualClientPoints from "./client-points";
import '../../../../assets/css/client-detail.css'
import { useApi } from "../../../../providers/api-provider";
import { useToast } from "../../../../providers/toast-provider";
import { Skeleton } from "primereact/skeleton";

const ClientDetails: FC<{ data: TPOSClient }> = ({ data }) => {
  const [loading, setLoading] = useState(data.status == 'need-fetch')
  const [exactData, setExactData] = useState<TPOSClient>()
  const { posClient } = useApi()
  const { show } = useToast()
  const getClient = posClient.usePosClient({
    onSuccess: r => {
      setLoading(false)
      setExactData(r)
    },
    onError: e => {
      setLoading(false)
      show({
        summary: 'Error',
        detail: e.message ?? (e.status ?? 'something went wrong'),
        severity: 'error',
        life: 5000
      })
    },
    params: { id: data.oid },
    enabled: false
  })
  useEffect(() => {
    if (data.status != 'need-fetch') return setExactData(data);
    setLoading(true)
    getClient()
  }, [])
  return <div className="client-detail">
    {
      loading || !exactData ? <Skeleton /> :
        <>
          <ClientInfo data={exactData} />
          <IndividualClientPoints oid={data.oid} client={exactData} />
        </>
    }
  </div>
}
export default ClientDetails