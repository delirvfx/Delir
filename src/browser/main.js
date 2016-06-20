process.on("uncaughtException", e => {
    e = e || {};
    const appRoot = new RegExp(path.join(__dirname, "../../"), "g");

    if (e.message) {
        process.stderr.write("\u001b[1;31m[Error]\u001b[0;31m" + e.message + "\n\u001b[m\n");
    }
    if (e.stack) {
        process.stderr.write("\u001b[1;31m[Stack]\u001b[0;31m" + (e.stack.replace(appRoot, "")) + "\u001b[m\n");
    }
});

console.log(process.versions);

const fs = require("fs");
const path = require("path");
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const parseCommandLine = () => {
    var args, version, yargs;
    yargs = require("yargs").boolean("dev").describe("dev", "Run development mode").boolean("help").describe("help", "Show command line help").alias("help", "h").boolean("version").describe("version", "Show version").alias("version", "v");
    args = yargs.parse(process.argv.slice(1));

    if (args.help) {
        yargs.showHelp("error");
        process.exit(0);
    }
    if (args.version) {
        version = app.getVersion();
        process.stdout.write(version + "\n");
        process.exit(0);
    }
    return {
        devMode: args["dev"]
    };
};

(() => {
    var args;
    args = parseCommandLine();
    app.on("window-all-closed", function() {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    app.on("ready", function() {
        const window = new BrowserWindow();
        window.loadURL(`file://${__dirname}/../renderer/index.html`);
        window.show();
    });
})();
