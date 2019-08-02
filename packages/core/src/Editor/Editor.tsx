import { Engine } from '../Engine'

export class Editor {
  public player: Engine
  public project: Project

  constructor() {
    this.player = new Engine()
  }

  public openProject(project: any) {
    this.player.project
  }
}
