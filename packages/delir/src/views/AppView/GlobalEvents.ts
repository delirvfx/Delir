import { EventEmitter } from '../../utils/EventEmitter'

export enum GlobalEvent {
  copyViaApplicationMenu = 'copy',
  cutViaApplicationMenu = 'cut',
  pasteViaApplicationMenu = 'paste',
}

interface Events {
  [GlobalEvent.copyViaApplicationMenu]: {}
  [GlobalEvent.cutViaApplicationMenu]: {}
  [GlobalEvent.pasteViaApplicationMenu]: {}
}

export const GlobalEvents = new (class extends EventEmitter<Events> {
  protected exclusiveEvents = [
    GlobalEvent.copyViaApplicationMenu,
    GlobalEvent.cutViaApplicationMenu,
    GlobalEvent.pasteViaApplicationMenu,
  ]
})()
