process.on('uncaughtException', e => {
    e = e || {}
    const appRoot = new RegExp(path.join(__dirname, '../../'), 'g')

    if (e.message) {
        process.stderr.write('\u001b[131m[Error]\u001b[031m' + e.message + '\n\u001b[m\n')
    }
    if (e.stack) {
        process.stderr.write('\u001b[131m[Stack]\u001b[031m' + (e.stack.replace(appRoot, '')) + '\u001b[m\n')
    }
})

import fs from 'fs-extra'
import path from 'path'
import yargs from 'yargs'
import {BrowserWindow, Menu, app} from 'electron'

const parseCommandLine = () => {
    const parser = yargs
        .boolean('dev').describe('dev', 'Run development mode')
        .boolean('help').describe('help', 'Show command line help').alias('help', 'h')
        .boolean('version').describe('version', 'Show version').alias('version', 'v')

    const args = parser.parse(process.argv.slice(1))

    if (args.help) {
        parser.showHelp('error')
        process.exit(0);
    }
    if (args.version) {
        console.log(`Delir ${app.getVersion()}`);
        process.exit(0);
    }

    return {
        devMode: args['dev']
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

(async () => {
    const args = parseCommandLine()
    await install()

    if (args.devMode || process.env.DELIR_ENV === 'dev') {
        console.log('Run as develop mode')

        // install devtools
        const devtron = require('devtron')
        devtron.install()

        const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer')
        await installExtension(REACT_DEVELOPER_TOOLS)
    }

    app.on('window-all-closed', () => {
        app.quit()
    })

    const run = () => {
        const window = new BrowserWindow({
            // frame: false,
            titleBarStyle: 'hidden',
            // transparent: true,
            webPreferences: {
                webgl: true,
                experimentalFeatures: true,
                experimentalCanvasFeatures: true,
            },
        })

        window.loadURL(`file://${path.join(__dirname, '/../delir/index.html')}`)
        window.show()
        args.devMode && window.webContents.openDevTools()
    }

    app.isReady() ? run() : app.on('ready', run)
})().catch(e => console.log(e))
