import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
import { FC } from "react";
import { rowsPerPage } from "../../constants";
import { useLang } from "../../providers/lang-provider";

type PaginatorProps = {
  page: number
  take: number
  total: number
  totalLabel?: string
  onPage?: (n: number) => void
  onTake?: (n: number) => void
}
const Paginator: FC<PaginatorProps> = ({ page, take, total, onPage, onTake, totalLabel }) => {
  const { words } = useLang()
  const totalShow = () => {
    if (total < 2) return `1 ${words['of']} 1`;
    const last = ((page - 1) * take) + take > total ? total : (((page - 1) * take) + take);
    return `${((page - 1) * take) + 1}-${last} ${words['of']} ${total}`
  }
  return <div className="paginator">
    <span
      style={{
        whiteSpace: 'nowrap'
      }}>
      {/* {`${totalLabel ?? 'Total'}: ${total}`} */}
      {totalShow()}
    </span>
    <PagerComponent
      click={onPage ? e => onPage(e.currentPage) : undefined}
      currentPage={page}
      pageSize={take}
      pageCount={3}
      enablePagerMessage={false}
      pageSizes={rowsPerPage}
      totalRecordsCount={total} />
    <DropDownListComponent
      change={onTake ? e => onTake(e.value) : undefined}
      width={100}
      value={take}
      dataSource={rowsPerPage} />
  </div>
}
export default Paginator