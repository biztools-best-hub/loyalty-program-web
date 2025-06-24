import { FC } from "react";
import { MessageResponse } from "../../../../types/models/message";
import { useUser } from "../../../../providers/user-provider";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { ProgressSpinner } from "primereact/progressspinner";
import { useLang } from "../../../../providers/lang-provider";
import { textFromDate } from "../../../../utils/text-util";
type AnnouncementProps = {
  data: MessageResponse,
  onCardClick: () => void,
  disabled: boolean,
  onDelete: () => void
  icon: string
  deleting: boolean
}

const AnnouncementCard: FC<AnnouncementProps> = ({ data, onCardClick, disabled, onDelete, icon, deleting }) => {
  const { user } = useUser()
  const { lang } = useLang()
  return (<div
    className="event-item"
    style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      gap: 6,
      maxWidth: 320,
      minWidth: 320
    }}>
    {data.imageUrl ?
      <img onClick={onCardClick}
        src={data.imageUrl}
        alt="event-image"
        style={{
          flex: 1,
          objectFit: 'fill',
          aspectRatio: '2/1',
          boxShadow: '2px 2px 3px rgba(0,0,0,.2)'
        }} /> :
      <div className="item-need-bg"
        onClick={onCardClick}
        style={{
          flex: 1,
          aspectRatio: '2/1',
          boxShadow: '2px 2px 3px rgba(0,0,0,.2)',
          padding: '1rem',
          textAlign: 'justify',
          display: 'flex',
          overflowY: 'auto',
        }} >
        {lang == "khmer" ? data.descriptionKhmer ?? data.description : data.description}
      </div>
    }
    <div className="item-need-bg"
      style={{
        minHeight: 40,
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'center',
        padding: 10,
        boxShadow: '2px 2px 3px rgba(0,0,0,.2)',
      }}>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span>
          {lang == "khmer" ? data.titleKhmer ?? data.title : data.title}
        </span>
        <span className="card-send-at">
          <i className="ri-time-line"></i>
          {data.sendAt ?
            <span>{textFromDate(data.sendAt, 'english', true, { dateOption: { splitter: '-' } })}</span> :
            data.cycleTime ? <span className="cycle-wrap">
              <span className="card-cycle-days">
                {data.cycleDays!.split(',').map(d =>
                  (<span className={`card-cycle-day${d.isCurrentDate() ? ' active' : ''}`} key={d}>{d}</span>))}
              </span>
              <span>{data.cycleTime.toAmPmTime()}</span>
            </span> : <span>--</span>
          }
        </span>
      </span>
      {(user?.permissions.some(p =>
        p.permissionName.toLowerCase() == 'announcement') ||
        user?.currentRole?.toLocaleLowerCase() == 'admin') && <ButtonComponent
          disabled={disabled}
          cssClass="e-small e-outline e-danger" onClick={onDelete}
          iconCss={icon}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 24,
            height: 24
          }}>
          {deleting &&
            <ProgressSpinner style={{ width: 20, height: 20 }} />}
        </ButtonComponent>}
    </div>
  </div>);
}
export default AnnouncementCard;