String.prototype.isCurrentDate = function () {
  const d = new Date();
  const cDay = d.getDay()
  const days = 'mon,tue,wed,thu,fri,sat,sun'.split(',')
  return this.toLowerCase() == days[cDay < 1 ? 1 : cDay - 1];
}
String.prototype.firstUpper = function () {
  return `${this[0].toUpperCase()}${this.substring(1).toLowerCase()}`
}
export const firstUpper = (s: string) =>
  `${s?.[0].toUpperCase()}${s?.substring(1).toLowerCase()}`;
export const capitalize = (s: string) =>
  s.split(' ').map(ss => ss[0].toUpperCase() + ss.substring(1).toLowerCase()).join(' ')
export const extractAvatarText = (s?: string) => {
  if (!s) return ''
  s = s.split(" ").map(c => c[0]).join("").trim().toUpperCase()
  return s;
}
export const numText = (n: number | string,
  lang: 'english' | 'khmer' = 'english') => {
  const khNumbers = '០១២៣៤៥៦៧៨៩'.split("")
  if (!Number(n) && Number(n) !== 0)
    throw 'Error: given string value cannot convert to number'
  const num = n.toString()
  return num.split("").map(v => lang === 'english' ?
    v : khNumbers[Number(v)]).join("")
}
export const mixNumText = (s: string,
  lang: 'english' | 'khmer' = 'english') => {
  const khNumbers = '០១២៣៤៥៦៧៨៩'.split("")
  return s.split("").map(v => Number(v) || Number(v) === 0 ?
    (lang === 'english' ? v : khNumbers[Number(v)]) : v).join("")
}
type FullOption = {
  dateOption: DateOption
  timeOption?: TimeOption
}
type DateOption = {
  monthMode?: 'name' | 'number'
  withDayName?: boolean
  format?: '00' | '0'
  splitter?: '-' | '/' | '.' | ',' | ' '
}
type TimeOption = {
  format?: 'h' | 'hh' | 'h m' | 'h mm' | 'hh mm' | 'hh m' | 'h m s' | 'h m ss' | 'h mm s' |
  'hh m s' | 'h mm ss' | 'hh mm s' | 'hh m ss' | 'hh mm ss',
  mode?: '24h' | '12h'
  splitter?: ':' | '-' | ',' | ' '
}
export const textFromTime = (
  time: {
    hour: number,
    minute: number,
    second?: number,
    millisecond?: number
  },
  lang: 'english' | 'khmer' = 'english',
  option?: TimeOption
) => {
  option = {
    format: option?.format ?? 'hh mm',
    mode: option?.mode ?? '12h',
    splitter: option?.splitter ?? ':'
  }
  const shift = time.hour > 11 ?
    (lang === 'english' ? 'PM' : 'ល្ងាច') :
    (lang === 'english' ? 'AM' : "ព្រឹក")
  if (option.mode === '12h' && time.hour > 12) time.hour -= 12
  const h = option.format?.split(" ").includes("h") ?
    time.hour.toString() : `${time.hour < 10 ? '0' : ''}${time.hour}`
  const mn = option.format?.split(" ").includes("m") ?
    time.minute.toString() : (option.format?.split(" ").includes("mm") ?
      `${time.minute < 10 ? '0' : ''}${time.minute}` : undefined)
  const s = time.second ? (option.format?.split(" ").includes("s") ?
    time.second.toString() : (option.format?.split(" ").includes("ss") ?
      `${time.second < 10 ? '0' : ''}${time.second}` : undefined)) : undefined
  return `${numText(h, 'english')}${mn ?
    `${option.splitter}${numText(mn, 'english')}` : ''}${s ?
      `${option.splitter}${numText(s, 'english')}` : ''}${option.mode === '12h' ?
        ` ${shift}` : ''}`
}
String.prototype.toAmPmTime = function () {
  if (!this) return this as string;
  try {
    const chunks = this.split(':');
    let h = parseInt(chunks[0]);
    let mn = chunks.length > 1 ? parseInt(chunks[1]) : 0
    let sh = 'AM'
    if (h > 12) {
      h -= 12;
      sh = 'PM'
    }
    return `${h > 9 ? h : `0${h}`}:${mn > 9 ? mn : `0${mn}`} ${sh}`
  } catch {
    return this as string;
  }
}
Date.prototype.toCustomString = function (lang: 'english' | 'khmer' = 'english',
  withTime: boolean = false, { dateOption }: FullOption = {
    dateOption: {
      monthMode: 'number',
      splitter: ' ',
      format: '00',
      withDayName: false
    },
    timeOption: {
      format: 'hh mm',
      splitter: ':',
      mode: '12h'
    }
  }) {
  const khDays = 'អាទិត្យ,ច័ន្ទ,អង្គារ,ពុធ,ព្រហស្បត្តិ,សុក្រ,សៅរ៍'.split(',')
  const khMonths = 'មករា,កុម្ភៈ,មិនា,មេសា,ឧសភា,មិថុនា,កក្កដា,សីហា,កញ្ញា,តុលា,វិច្ឆិកា,ធ្នូ'.split(',')
  const enDays = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',')
  const enMonths = 'January,February,March,April,May,June,July,August,September,October,November,December'.split(',')
  const date = new Date(this)
  const month = date.getMonth()
  const twoDigits = dateOption.format === '00'
  let m = dateOption.monthMode === 'name' ?
    (lang === 'english' ? enMonths[month].substring(0, 3) : khMonths[month])
    : numText(`${twoDigits && month + 1 < 10 ? '0' : ''}${month + 1}`, 'english')
  const day = date.getDay()
  const dName = lang === 'english' ? enDays[day].substring(0, 3) : khDays[day]
  let dt = numText(`${twoDigits && date.getDate() < 10 ? '0' : ''}${date.getDate()}`, 'english')
  const y = numText(date.getFullYear(), 'english')
  if (!dateOption.splitter) dateOption.splitter = ' '
  const fullTime = textFromTime({
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  }, 'english')
  const fullDate = `${dateOption.withDayName ? `${dName}, `
    : ''}${dt}${dateOption.splitter}${m}${dateOption.splitter}${y}${withTime ? ` ${fullTime}` : ''}`
  return fullDate;
}
export const textFromDate = (d: Date,
  lang: 'english' | 'khmer' = 'english',
  withTime?: boolean, { dateOption }: FullOption = {
    dateOption: {
      monthMode: 'number',
      splitter: ' ',
      format: '00',
      withDayName: false
    },
    timeOption: {
      format: 'hh mm',
      splitter: ':',
      mode: '12h'
    }
  }) => {
  const khDays = 'អាទិត្យ,ច័ន្ទ,អង្គារ,ពុធ,ព្រហស្បត្តិ,សុក្រ,សៅរ៍'.split(',')
  const khMonths = 'មករា,កុម្ភៈ,មិនា,មេសា,ឧសភា,មិថុនា,កក្កដា,សីហា,កញ្ញា,តុលា,វិច្ឆិកា,ធ្នូ'.split(',')
  const enDays = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',')
  const enMonths = 'January,February,March,April,May,June,July,August,September,October,November,December'.split(',')
  const date = new Date(d)
  const month = date.getMonth()
  const twoDigits = dateOption.format === '00'
  let m = dateOption.monthMode === 'name' ?
    (lang === 'english' ? enMonths[month].substring(0, 3) : khMonths[month])
    : numText(`${twoDigits && month + 1 < 10 ? '0' : ''}${month + 1}`, 'english')
  const day = date.getDay()
  const dName = lang === 'english' ? enDays[day].substring(0, 3) : khDays[day]
  let dt = numText(`${twoDigits && date.getDate() < 10 ? '0' : ''}${date.getDate()}`, 'english')
  const y = numText(date.getFullYear(), 'english')
  if (!dateOption.splitter) dateOption.splitter = ' '
  const fullTime = textFromTime({
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  }, 'english')
  const fullDate = `${dateOption.withDayName ? `${dName}, `
    : ''}${dt}${dateOption.splitter}${m}${dateOption.splitter}${y}${withTime ? ` ${fullTime}` : ''}`
  return fullDate;
}
export const toAnnotateNumber = (n: number, noDecimal: boolean = false) => {
  let res = n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  if (noDecimal) res = res.split('.')[0]
  return res;
}