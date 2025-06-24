import { Column, ColumnModel, QueryCellInfoEventArgs } from "@syncfusion/ej2-react-grids"
import { textFromDate, toAnnotateNumber } from "../../../../utils/text-util"
import { useLang } from "../../../../providers/lang-provider"
import { getValue } from "@syncfusion/ej2-base"
import { PointResponse } from "../../../../types/models"

export type TCol = {
  field: string,
  header: string,
  accessor?: (field: string, data: any, column: ColumnModel) => any,
  template?: (data: any, prev?: any) => any
}
export const useColumns = () => {
  const { lang } = useLang()
  const columns = (): TCol[] => [{
    field: 'referenceNumber',
    header: 'receipt-number',
  }, {
    field: 'timeStamp',
    header: 'date',
    accessor: (_, d, __) =>
      // new Date(d.timeStamp).toCustomString(lang, true, {
      //   dateOption: { format: '00', monthMode: 'name', withDayName: false, splitter: ' ' },
      //   timeOption: { format: 'hh mm', mode: '12h', splitter: ':' }
      // })
    textFromDate(
      new Date(d.timeStamp),
      lang,
      true,
      {
        dateOption: {
          format: '00',
          monthMode: 'name',
          withDayName: false,
          splitter: ' ',
        },
        timeOption: {
          format: 'hh mm',
          mode: '12h',
          splitter: ':',
        }
      }),
  }, {
    field: 'amount',
    header: 'amount',
  }, {
    field: 'temporaryPoints',
    header: 'temporary',
  }, {
    field: 'current',
    header: 'current',
  }, {
    field: 'earnedPoints',
    header: 'earned',
  }, {
    field: 'spentPoints',
    header: 'spent',
  }, {
    field: 'offSetPoints',
    header: 'offset',
  }, {
    field: 'total',
    header: 'total',
  }, {
    field: 'userLogIn',
    header: 'user',
  }, {
    field: 'remark',
    header: 'remark',
  }]
  return columns()
}
export const useCustomizeCell = (lastPoint: any, data?: PointResponse[]) => {
  return (args: QueryCellInfoEventArgs) => {
    if (!args.cell || !args.data) return;
    var col = (args.column as Column).field
    const d = getValue(col, args.data)
    if (col === "offSetPoints") {
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      if (d < 0) return args.cell.classList.add('negative')
      if (d > 0) {
        args.cell.textContent = '+' + args.cell.textContent
        return args.cell.classList.add('positive')
      }
      return
    }
    if (col === "current" || col === 'total') {
      const oid = getValue('oid', args.data)
      const timeStamp = getValue('timeStamp', args.data)
      const target = data ?
        data.findIndex(d => d.oid == oid &&
          d.timeStamp === timeStamp) : -1
      const p = !data || target < 1 ?
        lastPoint?.[col] : data[target - 1][col]
      const toShow = toAnnotateNumber(d)
      return args.cell.innerHTML = `<div class="custom-cell">
      <span>${toShow}</span>
      <span class="e-icons ${d !== 0 ?
          (`e-icon ${!p || p < d ?
            'val-up-icon positive' : 'val-down-icon negative'}`) : ''}"></span>
      </div>`
    }
    if (col === 'earnedPoints' || col === 'spentPoints') {
      if (d === 0) return;
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      return args.cell.classList.add(col === 'earnedPoints' ? 'positive' : 'negative')
    }
    if (col !== 'amount') return
    if (d === 0) return

    const toShow = toAnnotateNumber(d)
    args.cell.textContent = toShow
    const spent = getValue('spentPoints', args.data)
    const earned = getValue('earnedPoints', args.data)
    if ((spent === 0 && earned === 0) || (spent !== 0 && earned !== 0)) return
    const isSpent = spent !== 0
    args.cell.classList.add(isSpent ? 'negative' : 'positive')
  }
}