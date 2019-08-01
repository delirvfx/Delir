import * as Delir from '@delirvfx/core'
import immer from 'immer'

const effectReplaceMap: { [oldName: string]: string } = {
  '@ragg/delir-posteffect-color-slider': '@delirvfx/posteffect-color-slider',
  '@ragg/delir-posteffect-numeric-slider': '@delirvfx/posteffect-numeric-slider',
  '@ragg/delir-posteffect-the-world': '@delirvfx/posteffect-the-world',
}

export const migrateProject = (project: Delir.Entity.Project): Delir.Entity.Project => {
  return immer(project, project => {
    Delir.MigrationHelper.walkEffects((project as any) as Delir.Entity.Project, effect => {
      const { processor } = effect
      const newId = effectReplaceMap[processor]

      if (newId) {
        effect.processor = newId
      }
    })
  })
}
