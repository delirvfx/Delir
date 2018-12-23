import * as _ from 'lodash'

export default {
    isMigratable: (project: any) => {
        return false
    },

    migrate: (project: any) => {
        return project
    },
}
