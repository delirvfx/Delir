import * as React from 'react'
import connectToStores from './connectToStores'

describe('connectToStores', () => {
    type Props = { a: '' }

    const Component = connectToStores<Props>((ctx, props) => ({
        a: ''
    }))(class extends React.Component<Props> {})

    (<Component a='' />)
})
