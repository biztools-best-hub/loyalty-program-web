import { Response } from "express";
import path from 'path'
import fs from 'fs'

export default function errorHandler(fileLogName: string, e: any, res?: Response<any, Record<string, any>>, ...intersect: string[]) {
  const logDir = path.join(__dirname, 'logs')
  const fileDir = path.join(logDir, `${fileLogName}.txt`)
  const d = new Date()
  const months = 'January,February,March,April,May,June,July,August,September,October,November,December'.split(',')
  const a = `${d.getHours() >= 12 ? 'P' : 'A'}M`
  let h = d.getHours()
  if (h > 12) h -= 12
  const hs = `${h < 10 ? '0' : ''}${h}`
  const m = d.getMinutes()
  const ms = `${m < 10 ? '0' : ''}${m}`
  const sec = d.getSeconds()
  const ss = `${sec < 10 ? '0' : ''}${sec}`
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)
  if (!fs.existsSync(fileDir)) {
    fs.writeFileSync(fileDir, `${d.getDate()}/${months[d.getMonth()]}/${d.getFullYear()} (${hs}:${ms}:${ss} ${a})`)
    if (intersect.length > 0) {
      for (let its of intersect) fs.appendFileSync(fileDir, its)
    }
    fs.appendFileSync(fileDir, e.message ?? e.toString())
  }
  else {
    fs.appendFileSync(fileDir, "--------------------------")
    fs.appendFileSync(fileDir, `${d.getDate()}/${months[d.getMonth()]}/${d.getFullYear()} (${hs}:${ms}:${ss} ${a})`)
    if (intersect.length > 0) {
      for (let its of intersect) fs.appendFileSync(fileDir, its)
    }
    fs.appendFileSync(fileDir, e.message ?? e.toString())
  }
  console.log(e)
  res?.status(500).send("internal server error")
}