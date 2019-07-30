import _ from 'lodash'
import { Project } from '../Entity/Project'
import { walkAssets } from './MigrationHelper'

export default {
  isMigratable: (project: Project) => {
    if (project.formatVersion === '2017091401') {
      return true
    }

    return false
  },

  /** Migrate project to latest schema at migratable version */
  migrate: (project: Project) => {
    if (project.formatVersion === '2017091401') {
      walkAssets(project, asset => {
        asset.path = `file://${asset.path}`
      })
    }

    return project
  },
}
