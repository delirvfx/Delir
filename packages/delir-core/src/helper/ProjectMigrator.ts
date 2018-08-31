import * as _ from 'lodash'

export default {
    isMigratable: (project: ProjectScheme) => {
        return false
    },

    migrate: (project: ProjectScheme) => {
        return project
    }
}
