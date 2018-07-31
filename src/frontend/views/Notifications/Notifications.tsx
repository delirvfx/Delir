import { connectToStores } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'

import EditorStateStore, { NotificationEntry } from '../../stores/EditorStateStore'

import * as s from './style.styl'

interface NotificationsProps {
    entries: NotificationEntry[]
}

export default connectToStores([EditorStateStore], (context) => ({
    entries: context.getStore(EditorStateStore).getState().notifications,
}))(class Notifications extends React.Component<NotificationsProps, any> {
    public render()
    {
        const {entries} = this.props

        return (
            <div className={s.root}>
                {entries.map(entry => (
                    <div className={classnames(s.entry, s[`--${entry.level}`])}>
                        {(entry.title != null && entry.title !== '') && (
                            <h1 className={s.entryTitle}>{entry.title}</h1>
                        )}
                        <p className={s.entryBody}>
                            {entry.message}
                        </p>
                        {entry.detail != null && entry.detail !== '' && (
                            <pre className={s.detail}>{entry.detail}</pre>
                        )}
                    </div>
                ))}
            </div>
        )
    }
})
