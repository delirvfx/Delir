# v0.2.0
**new feature(with broken changes)**
- Add `electron-connect` configure file (`gulp_config/electron_connect.coffee`)
  - if you need stops auto-reload for browser-side development  
    please change `renderer.watch` to `false` in configure file.
- Context menu `click` listener now bind to context menu opened HTMLElement.
    - *(broken change)* And notified context menu opend element to onDidClickCommandItem, onDidClickItem listeners.
- Now possible to obtain the Last popup triggered element via `app.contextMenu.lastPoppedElement`

**bugfix**
- Fix browser-side auto reload, it now enable to work.

# v0.1.0
Initial release
