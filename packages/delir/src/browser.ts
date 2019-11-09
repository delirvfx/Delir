process.on('uncaughtException', e => {
  e = e || {}
  const appRoot = new RegExp(path.join(__dirname, '../../'), 'g')

  if (e.message) {
    process.stderr.write('\u001b[131m[Error]\u001b[031m' + e.message + '\n\u001b[m\n')
  }
  if (e.stack) {
    process.stderr.write('\u001b[131m[Stack]\u001b[031m' + e.stack.replace(appRoot, '') + '\u001b[m\n')
  }
})

import { app, BrowserWindow } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import yargs from 'yargs'

const parseCommandLine = () => {
  const parser = yargs
    .boolean('dev')
    .describe('dev', 'Run development mode')
    .boolean('help')
    .describe('help', 'Show command line help')
    .alias('help', 'h')
    .boolean('version')
    .describe('version', 'Show version')
    .alias('version', 'v')

  const args = parser.parse(process.argv.slice(1))

  if (args.help) {
    parser.showHelp('error')
    process.exit(0)
  }
  if (args.version) {
    // tslint:disable-next-line:no-console
    console.log(`Delir ${app.getVersion()}`)
    process.exit(0)
  }

  return {
    devMode: args.dev,
  }
}

const install = async () => {
  const userDir = app.getPath('appData')

  try {
    await fs.mkdirp(path.join(userDir, 'delir/plugins'))
  } catch (e) {
    throw e
  }
}
;(async () => {
  const args = parseCommandLine()
  await install()

  if (process.env.NODE_ENV === 'development') {
    // tslint:disable-next-line:no-console
    console.log('Run as develop mode')

    // install devtools
    const devtron = require('devtron')
    devtron.install()

    const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer')

    await Promise.all([installExtension(REACT_DEVELOPER_TOOLS), installExtension(REDUX_DEVTOOLS)])
  }

  app.on('window-all-closed', () => {
    app.quit()
  })

  const run = () => {
    const window = new BrowserWindow({
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: true,
        webgl: true,
        experimentalFeatures: true,
      },
    })

    if (process.env.NODE_ENV === 'development') {
      const storybookWindow = new BrowserWindow({
        titleBarStyle: 'default',
        webPreferences: {
          nodeIntegration: true,
          webgl: true,
          experimentalFeatures: true,
        },
      })

      storybookWindow.loadURL('http://localhost:6123')
      window.show()
    }

    window.loadURL(`file://${path.join(__dirname, '/../delir/index.html')}`)
    window.show()

    args.devMode && window.webContents.openDevTools()
  }

  app.isReady() ? run() : app.on('ready', run)
})().catch(e => {
  // tslint:disable-next-line:no-console
  console.log(e)
})
