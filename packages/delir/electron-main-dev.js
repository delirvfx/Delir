const { BrowserWindow, app } = require('electron');
const __DEV__ = process.env.NODE_ENV === 'development';


let mainWindow

app.on('ready', () => {
    mainWindow = new BrowserWindow({ width: 1920, height: 1080 });
    mainWindow.loadURL(__DEV__ ? 'http://localhost:3000' : `file://${__dirname}/prebuild/index.html`)
})
