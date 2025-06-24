import { FC, useEffect, useRef, useState } from "react";
import { PointSummaryResponse } from "../../../types/models";
import {
  Column,
  ColumnDirective,
  ColumnModel,
  ColumnsDirective,
  ExcelExport,
  GridComponent,
  Inject,
  QueryCellInfoEventArgs,
  Resize,
  Toolbar
} from "@syncfusion/ej2-react-grids";
import '../../../assets/css/specified-points-table.css'
import { firstUpper, textFromDate, toAnnotateNumber } from "../../../utils/text-util";
import { getValue } from "@syncfusion/ej2-base";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { DataTable, DataTableValue } from "primereact/datatable";
import { Skeleton } from "primereact/skeleton";
import { Column as Col } from 'primereact/column'
import { Dialog } from "primereact/dialog";
import ClientDetails from "../../users/client-list/components/client-details";
import { useLang } from "../../../providers/lang-provider";
type SpecifiedPointsTableProps = {
  data: PointSummaryResponse[],
  toDate?: Date,
  loading?: boolean
}
type CustomCol = {
  label: string
  width?: string | number
  id: keyof RenderedData
  align?: 'Left' | 'Center' | 'Right'
}
type ColHeadText = 'Number' | 'Name' | 'Expiry Date' | 'Temporary' | 'Expired' |
  'Earned' | 'Spent' | 'Offset' | 'Remaining' | 'Status' | 'Adjustment'
type RenderedData = {
  'oid': string
  'client-number': string
  'client-name': string
  'expiry-date': string
  'temporary-points': number
  'expired-points': number
  'earned-points': number
  'spent-points': number
  'offset-points': number
  'remaining-points': number
  'adjustment-points': number
  status: string
}
type SortIcon = {
  key: 'none' | 'asc' | 'desc',
  icon: 'e-sorting-3' | 'e-sort-down' | 'e-sort-up'
}
const cols: CustomCol[] = [{
  label: "Number",
  id: 'client-number',
  width: 120,
  align: 'Left'
}, {
  label: "Name",
  id: 'client-name',
  width: 130,
  align: 'Left'
}, {
  label: "Expiry Date",
  id: 'expiry-date',
  width: 120,
  align: 'Left'
}, {
  label: "Temporary",
  id: 'temporary-points',
  width: 100,
  align: 'Right'
},
//  {
//   label: "Expired",
//   id: 'expired-points',
//   width: 90,
//   align: 'Right'
// },
{
  label: "Earned",
  id: 'earned-points',
  width: 90,
  align: 'Right'
}, {
  label: "Spent",
  id: 'spent-points',
  width: 90,
  align: 'Right'
}, {
  label: "Adjustment",
  id: 'adjustment-points',
  width: 90,
  align: 'Right'
}, {
  label: "Offset",
  id: 'offset-points',
  width: 90,
  align: 'Right'
}, {
  label: "Remaining",
  width: 100,
  id: 'remaining-points',
  align: 'Right'
}
  // , {
  //   label: "Status",
  //   id: 'status',
  //   width: 90,
  //   align: 'Left'
  // }
]
type Order = {
  field: 'name' | 'number' | 'expiry-date' | 'temp-point' | 'expired-point' |
  'earned-point' | 'spent-point' | 'offset-point' | 'remain-point' | 'status'
  dir: 'asc' | 'desc' | 'none'
}
const SpecifiedPointsTable: FC<SpecifiedPointsTableProps> = ({ data, loading }) => {
  const grid = useRef<GridComponent | null>(null)
  const [numSort, setNumSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [nameSort, setNameSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [expDateSort, setExpDateSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [tempSort, setTempSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [expSort, setExpSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [earnSort, setEarnSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [spentSort, setSpentSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [offSort, setOffSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [remainSort, setRemainSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [statusSort, setStatusSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [sort, setSort] = useState<Order>()
  const { words } = useLang()
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentMember, setCurrentMember] = useState<string>()
  const headerTemp = (props: any) => {
    const headText: ColHeadText = props.headerText
    let target: SortIcon
    let onClick: () => void
    switch (headText) {
      case 'Number':
        target = numSort
        onClick = () => {
          setNumSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'number',
            dir: numSort.key === 'none' ?
              'asc' : numSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Name':
        target = nameSort
        onClick = () => {
          setNameSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'name',
            dir: nameSort.key === 'none' ?
              'asc' : nameSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Expiry Date':
        target = expDateSort
        onClick = () => {
          setExpDateSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'expiry-date',
            dir: expDateSort.key === 'none' ?
              'asc' : expDateSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Temporary':
        target = tempSort
        onClick = () => {
          setTempSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'temp-point',
            dir: tempSort.key === 'none' ?
              'asc' : tempSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Expired':
        target = expSort
        onClick = () => {
          setExpSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
          setSort({
            field: 'expired-point',
            dir: expSort.key === 'none' ?
              'asc' : expSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Earned':
        target = earnSort
        onClick = () => {
          setEarnSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'earned-point',
            dir: earnSort.key === 'none' ?
              'asc' : earnSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Spent':
        target = spentSort
        onClick = () => {
          setSpentSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'spent-point',
            dir: spentSort.key === 'none' ?
              'asc' : spentSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Offset':
        target = offSort
        onClick = () => {
          setOffSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'offset-point',
            dir: offSort.key === 'none' ?
              'asc' : offSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      case 'Remaining':
        target = remainSort
        onClick = () => {
          setRemainSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'remain-point',
            dir: remainSort.key === 'none' ?
              'asc' : remainSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
      default:
        target = statusSort
        onClick = () => {
          setStatusSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }));
          setSort({
            field: 'status',
            dir: statusSort.key === 'none' ?
              'asc' : statusSort.key === 'asc' ?
                'desc' : 'none'
          })
        }
        break
    }
    return <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'space-between'
      }}>
      <span>{props.headerText}</span>
      <ButtonComponent
        onClick={onClick}
        style={{ minWidth: 30 }}
        cssClass={`e-small e-round e-flat sort-btn${target.key === 'none' ?
          '' : ' active'} e-primary`}
        iconCss={`e-primary e-icons ${target.icon} sort-icon${target.key === 'none' ?
          '' : ' active'}`} />
    </div>
  }
  const mapModel = (m: PointSummaryResponse): RenderedData => ({
    'oid': m.client.oid,
    'client-name': m.client.name,
    'client-number': m.client.number,
    'expiry-date': m.client.expiry.toString(),
    'temporary-points': m.point.temporaryPoints,
    'expired-points': m.point.expiredPoints,
    'earned-points': m.point.earnedPoints,
    'spent-points': m.point.spentPoints,
    'offset-points': m.point.offSetPoints,
    'remaining-points': m.point.remainPoints,
    'adjustment-points': m.point.adjustPoints,
    status: m.client.status
  })
  const customData = () => {
    if (!sort || sort.dir === 'none') return data.map(mapModel)
    const f: keyof RenderedData = sort.field === 'name' ?
      'client-name' : sort.field === 'number' ?
        'client-number' : sort.field === 'expiry-date' ?
          'expiry-date' : sort.field === 'earned-point' ?
            'earned-points' : sort.field === 'expired-point' ?
              'expired-points' : sort.field === 'offset-point' ?
                'offset-points' : sort.field === 'remain-point' ?
                  'remaining-points' : sort.field === 'spent-point' ?
                    'spent-points' : sort.field === 'temp-point' ?
                      'temporary-points' : 'status'
    return data.map(mapModel).sort((a, b) => {
      if (a[f].toString().toUpperCase() === b[f].toString().toUpperCase()) return 0;
      const aVal = a[f]
      const bVal = b[f]
      if (sort.dir === 'asc') {
        if ((typeof aVal === 'number') && (typeof bVal === 'number')) return aVal - bVal;
        return a[f].toString().toUpperCase() > b[f].toString().toUpperCase() ? 1 : -1;
      }
      if ((typeof aVal === 'number') && (typeof bVal === 'number')) return bVal - aVal;
      return a[f].toString().toUpperCase() > b[f].toString().toUpperCase() ? -1 : 1;
    })
  }
  const customizeCell = (args: QueryCellInfoEventArgs) => {
    if (!args.cell || !args.data) return;
    var col = (args.column as Column).field
    const d = getValue(col, args.data)
    if (d == 0) return;
    if (col === 'expiry-date') {
      args.cell.textContent =
        // new Date(d).toCustomString('english', false, { dateOption: { monthMode: 'name', splitter: '-' } })
      textFromDate(
        new Date(d),
        'english',
        false,
        {
          dateOption: {
            monthMode: 'name',
            splitter: '-'
          }
        })
      return args.cell.classList.add(new Date(d) > new Date() ?
        'positive' : 'negative')
    }
    if ('offset-points,adjustment-points,earned-points,remaining-points'.split(',').includes(col)) {
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      if (d > 0 && col !== 'remaining-points') args.cell.textContent = '+' + args.cell.textContent
      return args.cell.classList.add(d > 0 ?
        'positive' : 'negative')
    }
    if (col === 'temporary-points') {
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      return args.cell.classList.add('positive')
    }
    if (col === 'spent-points') {
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      if (d > 0) args.cell.textContent = "-" + args.cell.textContent
      return args.cell.classList.add('negative')
    }
    if (col !== 'expired-points') return;
    const toShow = toAnnotateNumber(d)
    args.cell.textContent = toShow
    args.cell.classList.add('warning')
  }
  const dataBound = () => grid.current?.hideScroll()
  const today = (forFileName: boolean = false, withTime: boolean = false) => {
    const d = new Date();
    const sep = forFileName ? '-' : '/';
    let res = `${d.getDate()}${sep}${d.getMonth() + 1}${sep}${d.getFullYear()}`
    if (withTime) res += ` ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    return res;
  }
  const cModels: ColumnModel[] = cols.map(c => ({
    field: c.id,
    headerText: c.label,
    headerTextAlign: 'Center',
    textAlign: c.align ?? 'Center',
    width: c.id === 'status' || c.id === 'expiry-date' || c.id.endsWith('points') ? 120 : 200,
  }))
  const convertDate = (d: Date) => {
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }

  const excelProps: any = {
    dataSource: customData().map(d => ({
      ...d,
      'expiry-date': convertDate(new Date(d["expiry-date"]))
    })),
    query: '',
    columns: cModels,
    header: {
      headerRows: 5,
      rows: [
        {
          index: 1,
          cells: [
            {
              index: 1,
              colSpan: 10,
              value: 'POINT SUMMARY REPORT',
              style: {
                fontSize: 25,
                hAlign: 'Center',
                bold: true
              }
            }
          ]
        },
        {
          index: 2,
          cells: [
            {
              index: 1,
              colSpan: 10,
              value: 'Biztools Enterprise Solution Technology',
              style: {
                fontSize: 14,
                hAlign: 'Center'
              }
            },
          ]
        },
        {
          index: 3,
          cells: [
            {
              index: 1,
              colSpan: 10,
              value: today(),
              style: { hAlign: 'Center' }
            }
          ]
        }
      ]
    },

    footer: {
      footerRows: 2,
      rows: [
        {
          cells: [{
            index: 1,
            colSpan: 10,
            value: `Total: ${data.length}`,
            style: { bold: true }
          }]
        },
      ]
    },
    fileName: `point-summary(${today(true, true)}).xlsx`
  }
  const toolbarClick = () => {
    grid.current?.excelExport(excelProps)
  }
  const skeletonItems = Array.from({ length: data.length }, (_): DataTableValue => ({}))
  const skeletonBody = () => <Skeleton></Skeleton>
  useEffect(() => {
    if (!data || data.length < 1) return;
    setTimeout(() => {
      if (!grid.current) return;
      grid.current.getContent().children[0].scrollTop = 70 * (data.length - 1)
    }, 50);
  }, [data])
  return <div
    className="specified-point-table">
    {loading && <DataTable
      size="small"
      style={{ flex: 1, margin: 10 }}
      value={skeletonItems}
      className="p-datatable-striped">
      {cols.map(c => <Col
        key={c.id}
        field={c.id}
        header={c.label}
        style={{ width: c.width }}
        body={skeletonBody}></Col>)}
    </DataTable>}
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
      <ButtonComponent
        cssClass="e-small e-success"
        iconCss="ri-file-excel-line"
        content={words["export excel"]}
        onClick={toolbarClick} />
    </div>
    <GridComponent
      dataSource={customData()}
      dataBound={dataBound}
      enableHover={false}
      style={{ display: loading ? 'none' : '' }}
      rowSelecting={e => {
        setCurrentMember(e.data.oid)
        setShowDetailsDialog(true)
      }}
      ref={grid}
      excelHeaderQueryCellInfo={args => args.style = {
        borders: { color: '#222222' }
      }}
      excelQueryCellInfo={args => args.style = {
        borders: { color: '#222222' }
      }}
      queryCellInfo={customizeCell}
      // toolbarClick={toolbarClick}
      enableStickyHeader
      allowExcelExport
      autoFit
      rowDataBound={args => args.row.style.cursor = 'pointer'}
      allowResizing
      // toolbar={['ExcelExport']}
      height='calc(100vh - 216px)'
      rowHeight={28} >
      <ColumnsDirective>
        {cols.map(c =>
          <ColumnDirective
            key={c.id}
            field={c.id}
            headerText={firstUpper(words[c.label.toLowerCase()])}
            // headerText={c.label.toLowerCase()}
            headerTemplate={headerTemp}
            minWidth={c.width}
            textAlign={c.align} />)}
      </ColumnsDirective>
      <Inject services={[Toolbar, Resize, ExcelExport]} />
    </GridComponent>
    <Dialog
      visible={showDetailsDialog}
      onHide={() => setShowDetailsDialog(false)}
      closeIcon={<i className="ri-close-line"></i>}>
      <ClientDetails
        data={{
          oid: currentMember ?? '',
          gender: '',
          createdAt: new Date(),
          createdBy: '',
          clientGroup: '',
          days: 0,
          months: 0,
          years: 0,
          status: 'need-fetch'
        }} />
    </Dialog>
  </div>
}
export default SpecifiedPointsTable