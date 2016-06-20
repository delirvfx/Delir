packageJson = require "../../../package.json"

# See about properties
#   menuitem    : https://github.com/atom/electron/blob/02bdace366f38271b5c186412f42810ecb06e99e/docs/api/menu-item.md
#   accelerator : https://github.com/atom/electron/blob/02bdace366f38271b5c186412f42810ecb06e99e/docs/api/accelerator.md

module.exports = do ->
    menus = []

    menus.push {
        label: packageJson.productName
        submenu: [
            {
                label       : "About #{packageJson.productName}"
                selector    : "orderFrontStandardAboutPanel:"
                command     : "app:about"
            }
            { type: "separator" }
            {
                label       : "Preferences..."
                command     : "app:show-settings"
                accelerator : "Command+,"
            }
            { type: "separator" }
            {
                label: "Services"
                submenu: []
            }
            { type: "separator" }
            {
                label: "Quit"
                command: "app:quit", accelerator: "Command+Q"
            }
        ]
    }

    menus.push {
        label: "File"
        submenu: [
            {
                label       : "New Window"
                command     : "app:new-window"
                accelerator : "CmdOrCtrl+N"
            }
            {
                label       : "Close Window"
                command     : "window:close"
                accelerator : "CmdOrCtrl+W"
            }
        ]
    }

    menus.push {
        label: "Edit"
        submenu: [
            {
                label       : "Undo"
                selector    : "undo:"
                accelerator : "Command+Z"
            }
            {
                label       : "Redo"
                selector    : "redo:"
                accelerator : "Shift+Command+Z"
            }
            { type: "separator"}
            {
                label       : "Cut"
                selector    : "cut:"
                accelerator : "Command+X"
            }
            {
                label       : "Copy"
                selector    : "copy:"
                accelerator : "Command+C"
            }
            {
                label       : "Paste"
                selector    : "paste:"
                accelerator : "Command+V"
            }
            {
                label       : "Select All"
                selector    : "selectAll:"
                accelerator : "Command+A"
            }
        ]
    }

    menus.push {
        label: "Window"
        submenu: [
            {
                label       : "Minimize"
                selector    : "performMiniaturize:"
                accelerator : "Command+M"
            }
            {
                label       : "Zoom"
                selector    : "performZoom:"
            }
        ]
    }

    menus.push {
        label: "Developer"
        submenu: [
            {
                label       : "Reload"
                command     : "window:reload"
                accelerator : "Command+R"
            }
            {
                label       : "Toggle Developer Tools"
                command     : "window:toggle-dev-tools"
                accelerator : "Alt+Command+I"
            }
        ]
    } if global.app.isDevMode()

    menus.push {
        label: "Help"
        submenu: [
            {
                label       : "Version #{packageJson.version}"
                enabled     : false
            }
        ]
    }

    return menus
