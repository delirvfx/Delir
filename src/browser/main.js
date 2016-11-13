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

import fs  from 'fs-promise'
import path  from 'path'
import yargs from 'yargs'
import  {BrowserWindow, Menu, app} from 'electron'

const parseCommandLine = () => {
    const parser = yargs
        .boolean('dev').describe('dev', 'Run development mode')
        .boolean('help').describe('help', 'Show command line help').alias('help', 'h')
        .boolean('version').describe('version', 'Show version').alias('version', 'v')

    const args = parser.parse(process.argv.slice(1))

    if (args.help) {
        args.showHelp('error')
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
        await fs.mkdir(path.join(userDir, 'delir'))
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e
        }
    }

    try {
        await fs.mkdir(path.join(userDir, 'delir/plugins'))
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e
        }
    }
}

(async () => {
    const args = parseCommandLine()
    await install()

    app.on('window-all-closed', function() {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    const run = () => {
        Menu.setApplicationMenu(
            Menu.buildFromTemplate(require('./menus/darwin').default)
        )

        const window = new BrowserWindow({
            // frame: false,
            titleBarStyle: 'hidden',
            // transparent: true,
            webPreferences: {
                webgl: true,
                experimentalFeatures: true,
                experimentalCanvasFeatures: true,
            }
        })

        window.loadURL(`file://${path.join(__dirname, '/../renderer/index.html')}`)
        window.show()
    }

    app.isReady() ? run() : app.on('ready', run)
})().catch(e => console.log(e))
