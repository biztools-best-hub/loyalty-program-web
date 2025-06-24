import { FC, useEffect, useRef, useState } from "react";
import noDataImg from '../../../assets/images/no_data.png'
import BasePage from "../../base-page";
import '../../../assets/css/announcement.css';
import { useUser } from "../../../providers/user-provider";
import { useSearchBox } from "../../../providers/search-box-provider";
import { useLang } from "../../../providers/lang-provider";
import { useApi } from "../../../providers/api-provider";
import { useToast } from "../../../providers/toast-provider";
import { ButtonComponent, RadioButtonComponent } from "@syncfusion/ej2-react-buttons";
import { FileUpload, ItemTemplateOptions } from "primereact/fileupload";
import { capitalize, firstUpper, textFromDate } from "../../../utils/text-util";
import imageCompression from "browser-image-compression";
import { v4 } from "uuid";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";
import { ProgressBar } from "primereact/progressbar";
import { MessageResponse } from "../../../types/models/message";
import AnnouncementCard from "./components/announcement-card";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DateRangePickerComponent, DateTimePickerComponent, TimePickerComponent } from "@syncfusion/ej2-react-calendars";
import StateInput from "../../others/state-input";
import StateTextArea from "../../others/state-textarea";
import { Slider } from "primereact/slider";
type PublishMode = 'now' | 'at' | 'repeat'


const Announcement: FC = () => {
  const { user } = useUser();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [publishMode, setPublishMode] = useState<PublishMode>('now');
  const [search, setSearch] = useState('')
  const [enableChangeImage, setEnableChangeImage] = useState(false)
  const { lang } = useLang()
  const [enableSaveBtn, setEnableSaveBtn] = useState(false)
  const [emptyByFilter, setEmptyByFilter] = useState(false)
  const { defineOnSearch } = useSearchBox();
  const [originRange, setOriginRange] = useState(1)
  const [customRange, setCustomRange] = useState(1)
  const [fetching, setFetching] = useState(false)
  const [dateFilter, setDateFilter] = useState<{ startDate: Date | null, endDate: Date | null }>({ startDate: null, endDate: null })
  const [saveIconClass, setSaveIconClass] = useState('ri-save-3-fill')
  const [announcements, setAnnouncements] = useState<MessageResponse[]>()
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<MessageResponse[]>();
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string>()
  const [deleting, setDeleting] = useState(false)
  const [showFullPreview, setShowPreview] = useState(false)
  const [currentData, setCurrentData] = useState<MessageResponse>()
  const [showFileTooLarge, setShowFileTooLarge] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [titleVal, setTitleVal] = useState("")
  const [titleKhmerVal, setTitleKhmerVal] = useState("")
  const [link, setLink] = useState("")
  const [descVal, setDescVal] = useState("")
  const [settingRange, setSettingRange] = useState(false)
  const [descKhmerVal, setDescKhmerVal] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDays, setScheduleDays] = useState<string[]>([])
  const [scheduleTime, setScheduleTime] = useState<string>()
  const { words } = useLang()
  const { message, apiUrl } = useApi()
  const [showRangeDialog, setShowRangeDialog] = useState(false)
  const { show } = useToast()
  const publishDate = useRef<DateTimePickerComponent | null>(null)
  let uploader: FileUpload | null = null
  const inputFile = useRef<HTMLInputElement>(null)
  const saveBtn = useRef<ButtonComponent>(null)
  const announcementWrap = useRef<HTMLDivElement>(null)
  const getLastAnnouncementsCount = message.useGetLastAnnouncementsCount({
    onSuccess: r => {
      setOriginRange(r.count)
      setCustomRange(r.count)
    },
    onError: e => console.log(e),
    enabled: true,
  })
  const setLastAnnouncements = message.useSetLastAnnouncements({
    onSuccess: _ => {
      setOriginRange(customRange)
      setSettingRange(false)
      setShowRangeDialog(false)
    },
    onError: e => {
      console.log(e)
      setSettingRange(false)
      setShowRangeDialog(false)
    },
    params: { count: customRange },
    enabled: false
  })
  const removeAnnouncement = message.useRemoveAnnouncements({
    onSuccess: _ => {
      setAnnouncements(p => p?.filter(a => a.oid != currentAnnouncement) ?? [])
      setFilteredAnnouncements(p => startFilter(p?.filter(a => a.oid != currentAnnouncement)) ?? [])
      setDeleting(false)
    },
    onError: e => {
      setDeleting(false)
      show({
        detail: e.message,
        severity: 'error',
        summary: firstUpper(words['error']),
        life: 5000
      })
    }
  })
  const getAnnouncements = message.useGetAnnouncements({
    onSuccess: r => {
      setAnnouncements(r);
      setFilteredAnnouncements(startFilter(r));
    }, onError: e => {
      setAnnouncements([]);
      setFilteredAnnouncements([]);
      show({
        detail: e.message,
        summary: firstUpper(words['error']),
        severity: 'error',
        life: 5000
      })
    }
  })
  const startCompress = async (f: File) => {
    try {
      setCompressing(true)
      const compressedFile = await imageCompression(f, {
        maxSizeMB: 1.8, onProgress: p => {
          setProgress(p)
        }
      })
      setProgress(100)
      setTimeout(() => {
        setShowFileTooLarge(false)
        setCompressing(false)
        startAdd(compressedFile)
        setProgress(0)
      }, 1600)
    } catch (error: any) {
      setFetching(false)
      setSaveIconClass('ri-save-3-fill')
      setCompressing(false)
      setShowFileTooLarge(false)
      show({
        detail: error.message ?? firstUpper(words["something went wrong while compressing"]),
        summary: firstUpper(words['error']),
        severity: 'error',
        life: 5000
      })
    }
  }
  const uploadImage = message.useUploadAnnouncementImage({
    onSuccess: r => {
      setCompressing(false)
      broadcast({
        title: {
          english: titleVal,
          khmer: titleKhmerVal
        },
        message: {
          english: descVal,
          khmer: descKhmerVal,
        },
        imageUrl: `${apiUrl}${r.localUrl}`,
        cycleDays: publishMode == 'repeat' && scheduleDays.length > 0 ? scheduleDays.join(',') : undefined,
        cycleTime: publishMode != 'repeat' ? undefined : scheduleTime,
        status: publishMode == 'now' ? 'published' : 'pending',
        sendAt: publishMode != 'at' ? undefined : publishDate.current?.value?.toUTCString(),
        link
      })
    },
    onError: e => {
      setCompressing(false)
      setFetching(false)
      setSaveIconClass('ri-save-3-fill')
      show({
        detail: e.message ??
          (e.statusText.toLowerCase().endsWith("too large") ?
            firstUpper(words[`Your file is too large (limit size is 1.8MB)`]) :
            firstUpper(words['something went wrong'])),
        severity: 'error',
        summary: firstUpper(words["error"]),
        life: 5000
      })
    },
  })
  const broadcast = message.useBroadcast({
    onSuccess: (r) => {
      r.sendAt = publishMode == 'at' ? publishDate.current?.value : undefined;
      r.cycleDays = publishMode == 'repeat' && scheduleDays && scheduleDays.length > 0 ? [...scheduleDays].join(",") : undefined;
      r.cycleTime = publishMode == 'repeat' ? scheduleTime : undefined;
      setFetching(false);
      setShowEventDialog(false);
      setCurrentData(undefined);
      setScheduleDays([]);
      setScheduleTime(undefined)
      setPublishMode('now')
      setSaveIconClass('ri-save-3-fill')
      setAnnouncements(p => p ? [...p, r] : [r])
      setFilteredAnnouncements(p => startFilter(p ? [...p, r] : [r]))
      setTitleVal("")
      setTitleKhmerVal("")
      setDescVal("")
      setDescKhmerVal("")
      setLink("")
      show({
        summary: firstUpper(words['success']),
        life: 5000,
        severity: 'success'
      })
    },
    onError: (e: any) => {
      setFetching(false)
      setSaveIconClass('ri-save-3-fill')
      show({
        detail: e.message,
        severity: 'error',
        summary: firstUpper(words['error']),
        life: 5000
      })
    },

  })
  const startAdd = (f?: File) => {
    if (publishMode != 'now' && !publishDate.current?.value && (scheduleDays.length < 1 || !scheduleTime || scheduleTime.trim().length < 1)) {
      if (publishMode == 'at') {
        publishDate.current?.element?.focus();
        return;
      }
      if (publishMode == 'repeat') {
        setShowSchedule(true)
      }
      return;
    }
    confirmDialog({
      message: firstUpper(words['are you sure on creating this announcement?']),
      header: firstUpper(words['confirmation']),
      closable: false,
      acceptLabel: firstUpper(words['yes']),
      rejectLabel: firstUpper(words['no_a']),
      acceptClassName: 'accept-btn',
      rejectClassName: 'reject-btn',
      defaultFocus: 'accept',
      accept() {
        const input = {
          title: {
            english: titleVal,
            khmer: titleKhmerVal
          },
          message: {
            english: descVal,
            khmer: descKhmerVal
          },
          imageUrl: '',
          cycleDays: publishMode == 'repeat' && scheduleDays.length > 0 ? scheduleDays.join(',') : undefined,
          cycleTime: publishMode == 'repeat' ? scheduleTime : undefined,
          status: publishMode == 'now' ? 'published' : 'pending',
          sendAt: publishMode != 'at' ? undefined : publishDate.current?.value?.toUTCString(),
          link
        };
        if (!f) f = uploader?.getFiles()[0]
        setFetching(true)
        setSaveIconClass('')
        const image = new Image()
        if (f) {
          if (f.size > 1.78 * 1024 * 1024) {
            setShowFileTooLarge(true)
            return;
          }
          const url = URL.createObjectURL(f)
          image.addEventListener('load', () => {
            uploadImage({
              data: f as File,
              height: image.height,
              width: image.width,
              id: v4(),
            })
          })
          image.src = url
          return;
        }
        else if (currentData?.imageUrl) {
          image.src = currentData.imageUrl;
          image.addEventListener('load', () => {
            uploadImage({
              height: image.height,
              width: image.width,
              id: v4(),
              old: currentData.imageUrl
            })
          })
        }
        else broadcast(input)
      },
    })
  }
  const itemTemplate = (file: any, _: ItemTemplateOptions) => {
    const img = file as File
    return (
      <div style={{ display: 'flex', flex: 1 }}>
        <img
          className="event-img"
          style={{ maxWidth: 'calc((75vw / 2) - 30px)' }}
          src={`${URL.createObjectURL(img)}`}
          alt="empty" />
      </div>
    )
  }
  const getFileSize = () => {
    const f = uploader?.getFiles()[0]
    if (!f) return '0B';
    const units = ["MB", "GB", "TB"]
    let current = 0
    let size = f.size / 1024 / 1024
    while (size >= 1024 && current < units.length) {
      size = size / 1024
      current++
    }
    return `${size.toFixed(2)}${units[current]}`
  }
  const emptyTemplate = () => {
    return currentData?.imageUrl ? <div>
      <img
        className="event-img"
        style={{ maxWidth: 'calc((75vw / 2) - 30px)' }}
        src={`${currentData.imageUrl}`}
        alt="empty"
      />
    </div> : <div
      onClick={() => {
        if (fetching) return;
        inputFile.current?.click()
      }}
      style={{
        cursor: fetching ? 'default' : 'pointer',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <i className="pi pi-image"
        style={{
          fontSize: '5em',
          borderRadius: '50%',
          color: 'rgba(0,0,0,.3)'
        }}>
      </i>
      <span
        style={{
          fontSize: '1em',
          color: 'var(--text-color-secondary)'
        }}
        className="my-5">
        {firstUpper(words['click to upload or drag and drop image here'])}
      </span>
    </div>
  }
  function startFilter(ls?: MessageResponse[]): MessageResponse[] {
    if (!ls) {
      setEmptyByFilter(true)
      return [];
    }
    if (!search && !dateFilter.endDate && !dateFilter.startDate) {
      if (ls.length <= 0) setEmptyByFilter(true)
      return ls;
    }
    if (dateFilter.startDate && dateFilter.endDate) {
      const exactFilterStart = new Date(dateFilter.startDate.getFullYear(), dateFilter.startDate.getMonth(), dateFilter.startDate.getDate())
      const exactFilterEnd = new Date(dateFilter.endDate.getFullYear(), dateFilter.endDate.getMonth(), dateFilter.endDate.getDate())
      ls = ls.filter(a => {
        const d = new Date(a.createdDate)
        const exactDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        return exactDate >= exactFilterStart && exactDate <= exactFilterEnd;
      })
    }
    if (search) {
      ls = ls.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.titleKhmer?.includes(search) || a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.descriptionKhmer?.includes(search)) ?? [];
    }
    if (ls.length <= 0) setEmptyByFilter(true)
    return ls;
  }
  useEffect(() => {
    if (currentAnnouncement && deleting) removeAnnouncement({ oidList: [currentAnnouncement] })
  }, [deleting, currentAnnouncement])
  useEffect(() => {
    getAnnouncements()
    defineOnSearch(v => {
      setSearch(v)
    })
    getLastAnnouncementsCount()
  }, [])
  useEffect(() => {
    setFilteredAnnouncements(() => startFilter(announcements))
  }, [search])
  useEffect(() => {
    setFilteredAnnouncements(() => startFilter(announcements))
  }, [dateFilter])
  return (<BasePage
    rightComponent={(emptyByFilter || (filteredAnnouncements && filteredAnnouncements.length > 0)) &&
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <i className="ri-filter-2-fill"></i>
          <span style={{ whiteSpace: 'nowrap' }}>
            {capitalize(words["date filter"])}:
          </span>
          <DateRangePickerComponent
            openOnFocus={true}
            format='dd/MM/yyyy'
            change={e => {
              setDateFilter({
                startDate: e.startDate,
                endDate: e.endDate
              })
            }} />
        </span>
        {(user?.permissions.some(p =>
          p.permissionName.toLocaleLowerCase() == 'announcement')
          || user?.currentRole?.toLocaleLowerCase() == 'admin') &&
          <ButtonComponent
            onClick={() => setShowEventDialog(true)}
            cssClass="e-success"
            iconCss="ri-add-fill"
            content={firstUpper(words["add new announcement"])} />
        }
      </div>
    }
  >
    <div className="announcements-container"
      style={{ display: 'flex', flex: 1 }}>
      {!filteredAnnouncements ?
        <div className="events-loading"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <ProgressSpinner style={{ width: 50 }} />
          <span>
            {firstUpper(words['checking announcements'])}...
          </span>
        </div> :
        filteredAnnouncements.length > 0 ?
          <div ref={announcementWrap}
            className="events-wrap"
            style={{
              flex: 1,
              gap: 10,
              display: 'flex',
              flexDirection: 'column'
            }}>
            <div style={{
              display: 'grid',
              flex: 1,
              placeItems: 'center',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {filteredAnnouncements.map((d: MessageResponse) => {
                  const iconCss = deleting && currentAnnouncement === d.oid ?
                    '' : 'ri-delete-bin-6-fill'
                  return (<AnnouncementCard
                    key={d.oid}
                    data={d}
                    deleting={deleting && currentAnnouncement === d.oid}
                    onCardClick={() => {
                      setCurrentData(d)
                      setScheduleDays(d.cycleDays?.split(",") ?? [])
                      setScheduleTime(d.cycleTime)
                      setPublishMode(d.sendAt ? 'at' : d.cycleDays ? 'repeat' : 'now')
                      setTitleVal(d.title ?? "")
                      setTitleKhmerVal(d.titleKhmer ?? "")
                      setDescVal(d.description ?? "")
                      setDescKhmerVal(d.descriptionKhmer ?? "")
                      setLink(d.link ?? "")
                      setShowPreview(true)
                    }}
                    onDelete={() => {
                      setCurrentAnnouncement(d.oid)
                      setDeleting(true)
                    }}
                    icon={iconCss}
                    disabled={deleting && currentAnnouncement == d.oid} />)
                })}
              </div>
            </div>
            <div>
              <ButtonComponent
                cssClass="e-info"
                style={{ width: 'fit-content', marginBottom: 10, borderRadius: 10 }}
                iconCss="ri-settings-4-fill"
                onClick={() => setShowRangeDialog(true)}
                content="Set last random announcements count"
              />
            </div>
          </div> : emptyByFilter ?
            <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {firstUpper(words["cannot find the announcements"])}
            </div> :
            <div className="no-events"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10
              }} >
              <img src={noDataImg} alt="no-data" style={{ width: 200 }} />
              <span>{firstUpper(words['oop no announcements'])}</span>
              {(user?.permissions.some(p =>
                p.permissionName.toLocaleLowerCase() == 'announcement') ||
                user?.currentRole?.toLocaleLowerCase() == 'admin') &&
                <ButtonComponent
                  onClick={() => setShowEventDialog(true)}
                  cssClass="e-info"
                  iconCss="ri-add-fill"
                  content={firstUpper(words["add new announcement now"])} />}
            </div>}
    </div>
    <Dialog
      style={{ width: '75vw', minWidth: '400px' }}
      resizable={false}
      closeIcon={<i className="ri-close-line"></i>}
      header={<div style={{ display: 'flex', gap: 1 }}>
        {currentData ?
          <i className="ri-loop-left-fill"></i> :
          <i className="ri-notification-2-fill"></i>
        }
        <span>
          {currentData ? capitalize(words["edit to republish"]) : capitalize(words['new announcement'])}
        </span>
      </div>}
      visible={showEventDialog}
      draggable={false}
      footer={<div style={{
        paddingTop: 20,
        display: 'flex',
        justifyContent: 'flex-end'
      }} >
        <ButtonComponent
          ref={saveBtn}
          onClick={() => {
            startAdd()
          }}
          disabled={!titleVal || !titleKhmerVal || (!descVal && !descKhmerVal) || fetching}
          iconCss={saveIconClass}
          cssClass="e-success"
          style={{ margin: 0, display: 'flex', alignItems: 'center' }} >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {fetching && <ProgressSpinner style={{ width: 16, height: 16 }} />}
            <span>{words['save']}</span>
          </div>
        </ButtonComponent>
      </div>}
      closable={!fetching}
      closeOnEscape={false}
      onHide={() => {
        setCurrentData(undefined)
        setPublishMode('now')
        setScheduleDays([])
        setScheduleTime(undefined)
        setShowEventDialog(false)
        setTitleVal("")
        setLink("")
        setTitleKhmerVal("")
        setDescVal("")
        setDescKhmerVal("")
      }}>
      <input disabled={fetching}
        type="file"
        accept="image/*"
        ref={inputFile}
        hidden
        onChange={e => {
          const f = e.target.files?.[0]
          if (!f) return;
          uploader?.setFiles([f])
          setEnableChangeImage(true)
          setEnableSaveBtn(true)
        }} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '5px',
        borderTop: 'solid 1px #ddd',
        paddingTop: 20, gap: 10
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            textAlign: 'left',
            flex: 1,
            gap: 1
          }}>
            <label >{firstUpper(words['title (KH)'])}</label>
            <StateInput disabled={fetching} initialValue={titleKhmerVal} onChange={e => {
              setTitleKhmerVal(e.target.value)
              if (!e.target.value || e.target.value.trim().length < 1) {
                if ((!descVal ||
                  descVal.trim().length < 1) &&
                  (!uploader || uploader.getFiles().length < 1)) {
                  if (enableSaveBtn) setEnableSaveBtn(false)
                }
                return;
              }
              if (!enableSaveBtn) setEnableSaveBtn(true)
            }} />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            textAlign: 'left',
            flex: 1,
            gap: 1
          }}>
            <label >{firstUpper(words['title (ENG)'])}</label>
            <StateInput disabled={fetching} initialValue={titleVal} onChange={e => {
              setTitleVal(e.target.value)
              if (!e.target.value || e.target.value.trim().length < 1) {
                if ((!descVal ||
                  descVal.trim().length < 1) &&
                  (!uploader || uploader.getFiles().length < 1)) {
                  if (enableSaveBtn) setEnableSaveBtn(false)
                }
                return;
              }
              if (!enableSaveBtn) setEnableSaveBtn(true)
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                textAlign: 'left'
              }}>
                <label>
                  {firstUpper(words['image'])}
                </label>
                <div id="image-wrap"
                  style={{
                    display: 'flex',
                    width: 'calc((75vw / 2) - 25px) ',
                    aspectRatio: '2 / 1',
                    border: 'solid 1px #ddd',
                    borderRadius: 6
                  }}>
                  <FileUpload
                    disabled={fetching}
                    className="custom-file-upload"
                    ref={r => uploader = r}
                    accept="image/*"
                    onSelect={() => {
                      setEnableChangeImage(true)
                      setEnableSaveBtn(true)
                    }}
                    style={{ flex: 1, display: 'flex' }}
                    contentStyle={{
                      flex: 1,
                      display: 'flex',
                      background: 'transparent'
                    }}
                    itemTemplate={itemTemplate}
                    emptyTemplate={emptyTemplate}
                    headerTemplate={<div></div>} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'flex-start' }}>
                <div>{firstUpper(words['description (KH)'])}</div>
                <StateTextArea
                  disabled={fetching}
                  initialValue={descKhmerVal}
                  onChange={e => setDescKhmerVal(e.target.value)}
                  style={{
                    flex: 1,
                    width: 'calc((75vw / 2) - 30px)',
                    minWidth: 'calc((400px / 2) - 90px)',
                    resize: 'none'
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  alignItems: 'flex-start'
                }}>
                <div>{firstUpper(words['description (ENG)'])}</div>
                <StateTextArea
                  disabled={fetching}
                  initialValue={descVal}
                  onChange={e => setDescVal(e.target.value)}
                  style={{
                    flex: 1,
                    width: 'calc((75vw / 2) - 30px)',
                    minWidth: 'calc((400px / 2) - 90px)',
                    resize: 'none'
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <ButtonComponent
              disabled={!enableChangeImage || fetching}
              cssClass="e-info"
              iconCss="ri-image-edit-fill"
              onClick={() => inputFile.current?.click()}
              content={words["change image"]} />
            <div style={{
              display: 'flex',
              textAlign: 'left',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RadioButtonComponent
                  label="Publish now"
                  name="publish-mode"
                  value='now'
                  checked={publishMode == 'now'}
                  change={e => {
                    if (e.event.target.checked) { setPublishMode('now') }
                  }} />
                <RadioButtonComponent
                  label="Publish time"
                  name="publish-mode"
                  value='at'
                  checked={publishMode == "at"}
                  change={e => {
                    if (e.event.target.checked) {
                      setPublishMode('at')
                      setTimeout(() => {
                        publishDate.current?.element.focus()
                      }, 50);
                    }
                  }} />
                <RadioButtonComponent
                  label="Publish loop"
                  name="publish-mode"
                  value='repeat'
                  checked={publishMode == "repeat"}
                  change={e => { if (e.event.target.checked) { setPublishMode('repeat') } }} />
              </div>
              <DateTimePickerComponent
                width={250}
                value={currentData?.sendAt}
                openOnFocus
                ref={publishDate}
                enabled={publishMode == 'at' && !fetching} />
              <ButtonComponent
                onClick={() => setShowSchedule(true)}
                content="Set repeatedly schedule"
                iconCss="ri-settings-4-line"
                cssClass="e-info"
                type="button"
                disabled={publishMode != 'repeat' || fetching} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ textAlign: 'left' }} >Link</label>
          <StateInput disabled={fetching} initialValue={link} onChange={e => {
            setLink(e.target.value)
            setEnableSaveBtn(true)
          }}
          />
        </div>
      </div>
    </Dialog>
    <Dialog draggable={false}
      className="preview-event-image"
      closeIcon={<i className="ri-close-line"></i>}
      header={<div style={{
        textAlign: 'left',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <span>
          {lang == 'khmer' ? currentData?.titleKhmer ?? currentData?.title : currentData?.title}
        </span>
        {currentData?.createdDate &&
          <span style={{ fontSize: 12, color: '#6deee7' }}>
            <span>{capitalize(words['created date'])}: </span>
            <span>
              {
                // currentData.createdDate.toCustomString('english', false, { dateOption: { splitter: '-' } })
                textFromDate(currentData.createdDate, 'english', false, { dateOption: { splitter: '-' } })
              }
            </span>
          </span>
        }
      </div>}
      style={{ padding: 0 }}
      visible={showFullPreview}
      onHide={() => {
        setShowPreview(false)
        setCurrentData(undefined);
        setPublishMode('now')
        setScheduleDays([]);
        setScheduleTime(undefined);
        setTitleVal("")
        setLink("")
        setTitleKhmerVal("")
        setDescVal("")
        setDescKhmerVal("")
      }}
      contentStyle={{
        display: 'flex',
        padding: 0,
        justifyContent: 'center',
        alignItems: 'center'
      }} >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {currentData?.imageUrl && <img
          src={currentData.imageUrl}
          alt="preview-image"
          style={{
            background: '#ddd',
            width: '40vw',
            aspectRatio: '2/1',
            minWidth: 300
          }} />}
        {(currentData?.sendAt || currentData?.cycleDays) && <div className="preview-schedule">
          <i className="ri-time-line"></i>
          {currentData.sendAt ? <span className="p-schedule-time">
            {
              textFromDate(currentData.sendAt, 'english', true, { dateOption: { splitter: '-' } })
              // currentData.sendAt?.toCustomString('english', true, { dateOption: { splitter: '-' } })
            }
          </span> : <span className="schedule-routine">
            <span className="p-schedule-days">
              {currentData.cycleDays!.split(',').map(d => (<span className={`p-schedule-day${d.isCurrentDate() ? ' active' : ''}`} key={d}>{d}</span>))}
            </span>
            <span className="p-schedule-time">
              {currentData.cycleTime?.toAmPmTime()}
            </span>
          </span>}
        </div>}
        <div style={{
          width: '40vw',
          color: '#fff',
          textAlign: 'justify',
          minWidth: 300,
        }}>
          {lang == 'khmer' ? currentData?.descriptionKhmer ?? currentData?.description : currentData?.description}
        </div>

        {currentData?.link &&
          <a className="announcement-link" href={currentData.link} target="_blank">{currentData.link}</a>
        }
        {(user?.permissions.some(p =>
          p.permissionName.toLocaleLowerCase() == 'announcement')
          || user?.currentRole?.toLocaleLowerCase() == 'admin') &&
          <ButtonComponent
            cssClass="e-info m-hover"
            iconCss="ri-loop-left-line"
            onClick={() => {
              setShowPreview(false)
              setShowEventDialog(true)
              if (currentData?.imageUrl) setEnableChangeImage(true)
            }}
            content={firstUpper(words["edit to republish"])} />
        }
      </div>

    </Dialog>
    <Dialog
      visible={showRangeDialog}
      closable={!settingRange}
      onHide={() => {
        setShowRangeDialog(false)
        setCustomRange(originRange)
      }}
      closeIcon={<i className="ri-close-line"></i>}
      style={{ width: 460 }}
      header={<div style={{ display: 'flex', gap: 5 }}>
        <i className="ri-settings-4-fill"></i>
        <span>Set the count</span>
      </div>}
      draggable={false}
      resizable={false}
    >
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Slider max={10} min={1} value={customRange} onChange={e => setCustomRange(e.value as number)} />
        <span style={{ fontSize: 20, fontWeight: 'bold' }}>{customRange}</span>
        <div >
          <ButtonComponent
            disabled={settingRange || customRange == originRange}
            cssClass="e-success"
            onClick={() => {
              setSettingRange(true)
              setLastAnnouncements()
            }}
            style={{ borderRadius: 8, minWidth: 90, minHeight: 30 }} >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {settingRange ? <ProgressSpinner style={{ width: 16, height: 16 }} /> :
                <span>OK</span>
              }
            </div>
          </ButtonComponent>
        </div>
      </div>
    </Dialog>
    <Dialog closable={!compressing}
      closeIcon={<i className="ri-close-line"></i>}
      style={{ width: 460 }}
      header={<div style={{
        display: 'flex',
        color: 'orange',
        justifyContent: 'flex-start',
        gap: 6,
        alignItems: 'center'
      }}>
        < i className="ri-alert-line"></i>
        <span>{firstUpper(words['alert'])}</span>
      </div>}
      draggable={false}
      className="file-too-large-dialog"
      visible={showFileTooLarge}
      onHide={() => {
        setFetching(false)
        setShowFileTooLarge(false)
      }}>
      <div style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {compressing ? <ProgressBar value={progress} /> :
          <span>{
            !words['your file size'] || !words['too large (limit size is 1.8MB)'] ?
              `Your file size ${getFileSize()} is too large (limit size is 1.8MB)` :
              `${words['your file size']} ${getFileSize()} ${words['too large (limit size is 1.8MB)']}`
          }</span>}
        {compressing ? <span>{firstUpper(words['compressing'])}...</span> :
          <span>{firstUpper(words['try to compress it and upload'])}?</span>}
        <div>
          <ButtonComponent
            onClick={() => {
              const f = uploader?.getFiles()[0]
              if (!f) return;
              startCompress(f)
            }}
            disabled={compressing}
            cssClass="e-info"
            content={words["compress then upload"]} />
        </div>
      </div>
    </Dialog>
    <Dialog
      visible={showSchedule}
      style={{
        minWidth: 400
      }}
      closeIcon={<i className="ri-close-line"></i>}
      resizable={false}
      onHide={() => {
        setShowSchedule(false)
        if (currentData) {
          setScheduleDays(currentData.cycleDays?.split(',') ?? [])
          setScheduleTime(currentData.cycleTime)
          return;
        }
        setScheduleDays([])
        setScheduleTime(undefined)
      }}
      header={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ri-settings-4-line"></i>
        <span>Set schedule</span>
      </div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['mon', 'tue', 'wed', 'thu', 'fri', "sat", 'sun'].map(d => (<div key={d} onClick={() => setScheduleDays(p => {
            let temp = [...p]
            if (temp.includes(d)) temp = temp.filter(t => t != d)
            else temp.push(d)
            return temp;
          })} className={`schedule-day${scheduleDays.includes(d) ? ' selected' : ''}`}>{d}</div>))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TimePickerComponent
            value={scheduleTime ? new Date(2000, 1, 1, parseInt(scheduleTime?.split(':')[0]), parseInt(scheduleTime?.split(':')[1])) : undefined}
            change={e => {
              if (!e.value) return;
              const d = e.value as Date
              if (!d) return;
              const h = d.getHours()
              const mn = d.getMinutes()
              const res = `${h}:${mn}`;
              setScheduleTime(res)
            }}
            style={{ fontSize: 20, textAlign: 'center' }} width={200} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <ButtonComponent
            onClick={() => setShowSchedule(false)}
            disabled={!scheduleTime || scheduleTime.trim().length < 1 || scheduleDays.length < 1}
            content="OK"
            cssClass="e-success" />
        </div>
      </div>
    </Dialog>
    <ConfirmDialog />
  </BasePage >)
}
export default Announcement;