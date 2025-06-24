export const serverDateTime = (d: Date) => {
  const offset = d.getTimezoneOffset()
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes() - offset,
    d.getSeconds(),
    d.getMilliseconds())
}