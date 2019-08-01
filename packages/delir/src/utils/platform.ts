import os from 'os'

export const isWindows = () => os.type() === 'Windows_NT'
export const isMacOS = () => os.type() === 'Darwin'
export const isLinux = () => os.type() === 'Linux'
