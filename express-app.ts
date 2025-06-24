import express, { Response } from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import fileUpload, { UploadedFile } from 'express-fileupload'
import path from 'path'
import fs from 'fs'
import errorHandler from './error-handler'
const uploadErrorHandler = (e: any, res: Response<any, Record<string, any>>) => errorHandler('uploadErrors', e, res)
const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(fileUpload())
app.get("*", (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))
app.post('/upload', (req, res) => {
  try {
    const data = req.body
    if (!req.files?.["data"]) return res.status(400).send('invalid data')
    const publicDir = path.join(__dirname, 'public');
    const uploadDir = path.join(publicDir, 'uploads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)
    const userDir = path.join(uploadDir, data.username)
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir)
    const isProfile = data.mode?.toUpperCase() === "PF"
    const subDir = isProfile ? path.join(userDir, 'images') : path.join(userDir, 'files')
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir)
    const url = path.join(subDir, `${isProfile ? 'profile-' : ''}${data.id}.${data.extension}`)
    const files = fs.readdirSync(subDir)
    if (isProfile && files.length > 0) {
      const exists = files.filter(f => f.startsWith('profile-'))
      exists.forEach(e => fs.unlinkSync(path.join(subDir, e)))
    }
    const file = req.files["data"] as UploadedFile
    file.mv(url)
    return res.send({ isSuccess: true, url: url.replace(publicDir, '').substring(1).split("\\").join('/') })
  }
  catch (e: any) {
    uploadErrorHandler(e, res)
  }
})
export default app