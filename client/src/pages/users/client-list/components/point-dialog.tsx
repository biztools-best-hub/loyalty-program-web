import { Dialog } from "primereact/dialog"
import { FC, KeyboardEvent, FocusEvent, RefObject } from "react"
import { useLang } from "../../../../providers/lang-provider"
import { firstUpper } from "../../../../utils/text-util"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"

type PointDialogProps = {
  closeAdjustDialog: () => void,
  goToLastPoint: () => void,
  onPointChange: () => void,
  onPointLostFocus: (e: FocusEvent<HTMLInputElement, Element>) => void,
  onPointKeyEnter: (e: KeyboardEvent<HTMLInputElement>) => void,
  onRemarkKeyEnter: (e: KeyboardEvent<HTMLInputElement>) => void,
  offsetDoneClick: () => void,
  onRemarkChange: () => void,
  pointRef: RefObject<HTMLInputElement>,
  remarkRef: RefObject<HTMLInputElement>,
  doneBtnRef: RefObject<Button>,
  offsetPointsRequestError: { point: boolean, remark: boolean },
  currentAdjustValue?: number,
  showAdjustDialog: boolean,
  addingOffset: boolean
}
const PointDialog: FC<PointDialogProps> = ({
  closeAdjustDialog,
  goToLastPoint,
  onPointChange,
  onPointKeyEnter,
  onPointLostFocus,
  onRemarkKeyEnter,
  onRemarkChange,
  offsetDoneClick,
  currentAdjustValue,
  remarkRef,
  pointRef,
  doneBtnRef,
  offsetPointsRequestError,
  showAdjustDialog,
  addingOffset
}) => {
  const { words } = useLang()
  return <Dialog
    className="adj-dialog"
    onHide={closeAdjustDialog}
    draggable={false}
    visible={showAdjustDialog}
    position="bottom"
    closable={!addingOffset}
    closeIcon={<i className="ri-close-line"></i>}
    resizable={false}
    header={
      <div className="adj-dialog-head">
        <i className="pi pi-pencil" />
        <span>
          {words["adjust point_v"]}
        </span>
      </div>}>
    <div className="adj-dialog-body">
      <div className="adj-dialog-warn-part">
        <div className="adjust-warn">
          <i className="pi pi-exclamation-triangle" />
          <span>
            {firstUpper(words["please consider checking last point record before adjusting points"])}
          </span>
          <Button
            size="small"
            className="btn-go-to-last-point"
            disabled={addingOffset}
            onClick={goToLastPoint}
            outlined
            label={words["check last points now"]}
            icon='pi pi-arrow-right'
            iconPos="right" />
        </div>
      </div>
      <div className="adj-point-input-group">
        <div className="point-input">
          <label htmlFor="points">
            {firstUpper(words["points"])}
          </label>
          <InputText
            disabled={addingOffset}
            onChange={onPointChange}
            onKeyDown={onPointKeyEnter}
            ref={pointRef}
            onBlur={onPointLostFocus}
            defaultValue={0}
            className={!currentAdjustValue || currentAdjustValue === 0 ?
              (offsetPointsRequestError.point ?
                'points p-invalid' : undefined) : (currentAdjustValue > 0 ?
                  'points col-success' : 'points col-danger') + (offsetPointsRequestError.point ?
                    ' points p-invalid' : 'points')}
            id="points"
            type="number" />
          {offsetPointsRequestError.point &&
            <small
              id="remark-help"
              className="msg-error">
              Point mustn't be 0 or empty
            </small>}
        </div>
        <div className="remark-input">
          <label htmlFor="remark">
            {firstUpper(words["remark"])}
          </label>
          <InputText
            className={offsetPointsRequestError.remark ?
              'p-invalid' : undefined}
            disabled={addingOffset}
            id="remark"
            onKeyDown={onRemarkKeyEnter}
            ref={remarkRef}
            onChange={onRemarkChange} />
          {offsetPointsRequestError.remark &&
            <small
              id="remark-help"
              className="msg-error">
              Remark is required!
            </small>}
        </div>
      </div>
      <div className="adj-dialog-btn-wrap">
        <Button
          severity="success"
          loading={addingOffset}
          ref={doneBtnRef}
          onClick={offsetDoneClick}
          label={firstUpper(words["done"])}
          icon='pi pi-check'
          size="small" />
      </div>
    </div>
  </Dialog>
}
export default PointDialog