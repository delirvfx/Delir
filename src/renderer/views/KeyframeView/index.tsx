import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'

import s from './style.styl'

interface KeyframeViewProps {
    activeLayer: Delir.Project.Layer|null
}

export default class KeyframeView extends React.Component<KeyframeViewProps, any> {
    render()
    {
        return (
            <div className={s.keyframeView}>
            </div>
        )
    }
}