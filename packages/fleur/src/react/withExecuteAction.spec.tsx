import * as React from 'react'

import { ExecuteActionProp } from './withExecuteAction'

describe('withExecuteAction', () => {
    it('', () => {
        interface Props extends ExecuteActionProp { prop: string }
        const Component = withExecuteAction(class extends React.PureComponent<Props> {})
        return (<Component />)
    })
})
