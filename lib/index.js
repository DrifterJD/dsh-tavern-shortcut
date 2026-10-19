// dsh-tavern-shortcut
// 第一次加载时在桌面创建“DSH 酒馆”快捷方式；之后启动 DSH 不再做任何事。
// 这个插件不会启动酒馆服务，也不会改变 DSH 的默认启动目标。

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-tavern-shortcut'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LAUNCHER = process.env.DSH_TAVERN_LAUNCHER || 'D:\\DSH\\tavern-launcher'
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const DESKTOP = path.join(os.homedir(), 'Desktop')
const SHORTCUT = path.join(DESKTOP, 'DSH 酒馆.lnk')
const MARKER = path.join(DSH_HOME, '.tavern-shortcut-created.json')
const VBS = path.join(LAUNCHER, 'launch-tavern.vbs')
const SCRIPT = path.join(ROOT, 'scripts', 'create-shortcut.ps1')

function report(stage, error) {
  const detail = error && (error.stack || error.message) || String(error)
  console.warn(`[${name}] ${stage}失败：${detail}`)
}

function fileExists(file) {
  try {
    fs.accessSync(file)
    return true
  } catch {
    return false
  }
}

function writeMarker(extra) {
  const payload = {
    createdAt: new Date().toISOString(),
    shortcut: SHORTCUT,
    launcher: LAUNCHER,
    ...extra,
  }
  fs.mkdirSync(path.dirname(MARKER), { recursive: true })
  const tmp = MARKER + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  fs.renameSync(tmp, MARKER)
}

export function apply(_ctx) {
  try {
    if (fileExists(MARKER)) return

    // 已经存在（例如手动创建过）就只记标记，不覆盖用户自己的快捷方式。
    if (fileExists(SHORTCUT)) {
      writeMarker({ created: false, reason: 'shortcut-already-exists' })
      return
    }

    if (!fileExists(VBS)) {
      report('启动器不存在', VBS)
      return
    }

    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy', 'Bypass',
        '-File', SCRIPT,
        '-LauncherDir', LAUNCHER,
      ],
      { windowsHide: true, timeout: 20000, encoding: 'utf8' },
      (error, stdout, stderr) => {
        if (error) {
          report('创建桌面快捷方式', error)
          if (stderr && stderr.trim()) console.warn(stderr.trim())
          return
        }
        const created = SHORTCUT
        try {
          writeMarker({ created: true, shortcut: created })
          console.log(`[${name}] 已创建桌面快捷方式：${created}`)
        } catch (markerError) {
          report('写入完成标记', markerError)
        }
      },
    )
  } catch (error) {
    report('初始化', error)
  }
}
