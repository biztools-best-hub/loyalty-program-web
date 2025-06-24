import { FC, useEffect, useState } from "react";
import { TPOSClient } from "../../../../types/models";
import { useLang } from "../../../../providers/lang-provider";
import { firstUpper, mixNumText, textFromDate } from "../../../../utils/text-util";
import '../../../../assets/css/client-info.css'

const ClientInfo: FC<{ data: TPOSClient }> = ({ data }) => {
  const { lang, words } = useLang()
  const [createdAt, setCreatedAt] = useState<string>()
  const [updatedAt, setUpdatedAt] = useState<string>()
  useEffect(() => {
    setCreatedAt(p =>
      // data.createdAt?.toCustomString(lang, false, { dateOption: { monthMode: 'name', withDayName: false } }) ??
      data.createdAt ?
        textFromDate(
          data.createdAt,
          lang,
          false,
          {
            dateOption: {
              monthMode: 'name',
              withDayName: false
            },
          })
        :
        p)
    setUpdatedAt(p =>
      // data.updatedAt?.toCustomString(lang, false, { dateOption: { monthMode: 'name', withDayName: false } }) ??
      data.updatedAt ?
        textFromDate(
          data.updatedAt,
          lang,
          false,
          {
            dateOption: {
              monthMode: 'name',
              withDayName: false
            }
          }) :
        p)
  }, [])
  return <div className="client-info-wrap">
    <div className="client-info-body">
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words["name"])}
        </label>
        <div className="item-value">
          {data.name &&
            data.name.trim().length > 0 ?
            data.name : '---'}
        </div>
      </div>
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words["gender"])}
        </label>
        <div
          className="item-value"
          id="gender">
          {data.gender &&
            data.gender.trim().length > 0 ?
            firstUpper(words[data.gender.toLowerCase()]) : '---'}
        </div>
      </div>
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words["bill address"])}
        </label>
        <div
          className="item-value"
          id="bill-address">
          {data.billToAddress1 &&
            data.billToAddress1.trim().length > 0 ?
            data.billToAddress1 : '---'}
        </div>
      </div>
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words["created"])}
        </label>
        <div
          className="item-value"
          id="created">
          {data.createdAt ?
            `${firstUpper(words["on_d"])}: ${createdAt}${data.createdBy &&
              data.createdBy.trim().length > 0 ?
              ` ${firstUpper(words?.["by"])}: ${data.createdBy}` : ''}` : '---'}
        </div>
      </div>
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words['number'])}
        </label>
        <div className="item-value">
          {data.number &&
            data.number.trim().length > 0 ?
            data.number : '---'}
        </div>
      </div>
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words['phone'])}
        </label>
        <div
          className="item-value"
          id="phone">
          {data.phone1 &&
            data.phone1.trim().length > 0 ?
            mixNumText(data.phone1, 'english') : '---'}
        </div>
      </div>
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words["delivery address"])}
        </label>
        <div
          className="item-value"
          id="delivery-address">
          {data.deliverToAddress1 &&
            data.deliverToAddress1.trim().length > 0 ?
            data.deliverToAddress1 : '---'}
        </div>
      </div>
      <div className="items">
        <label className="client-info-label">
          {firstUpper(words['updated'])}
        </label>
        <div
          id="updated"
          className="item-value">
          {data.updatedAt ?
            `${firstUpper(words["on_d"])}: ${updatedAt}${data.updatedBy &&
              data.updatedBy.trim().length > 0 ?
              ` ${firstUpper(words["by"])}: ${data.updatedBy}` : ''}` : '---'}
        </div>
      </div>
    </div>
  </div>
}
export default ClientInfo