import os from 'os'

export const Platform = {
  get cmdOrCtrl() {
    return this.isMacOS ? 'Cmd' : 'Ctrl'
  },

  isWindows: os.type() === 'Windows_NT',
  isMacOS: os.type() === 'Darwin',
  isLinux: os.type() === 'Linux',
}
