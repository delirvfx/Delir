import _ from 'lodash'

export type ActionRequest = {
    action: string,
    params: Object,
}

export class ProjectActions
{
    static addNewComposition(
        params: {
            name: string,
        }
    ): ActionRequest
    {
        return {
            action: 'ADD_NEW_COMPOSITION',
            params: {
                name: params,
            },
        }
    }

    static removeComposition(
        params: {
            id: string
        }
    ) : ActionRequest
    {
        return {
            action: 'REMOVE_COMPOSITION',
            params,
        }
    }

    static addNewLayer(
        params: {
            compositionId: string
        }
    )
    {
        return {
            action: 'ADD_NEW_LAYER',

        }
    }
}
