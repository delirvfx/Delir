import * as _ from 'lodash'

export default {
    isMigratable: (project: any) => {
        return false
    },

    /** Migrate project to latest schema at migratable version */
    migrate: (project: any) => {
        return project
    },
}
