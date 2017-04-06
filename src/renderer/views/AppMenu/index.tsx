import * as React from 'react'
import {remote} from 'electron'

import darwinMenu from './menus/darwin'

export default class AppMenu extends React.Component<any, any>
{
    render()
    {
        remote.Menu.setApplicationMenu(
            remote.Menu.buildFromTemplate(
                darwinMenu(this.props, this.state)
            )
        )

        return null
    }
}