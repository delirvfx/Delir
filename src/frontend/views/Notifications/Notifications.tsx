import * as React from 'react'
import {Component} from 'react'
import * as classnames from 'classnames'

import connectToStores from '../../utils/connectToStores'
import {default as EditorStateStore, NotificationEntries as NotificationEntries} from '../../stores/EditorStateStore'

import * as s from './style.styl'

type NotificationsProps = {
    entries: NotificationEntries
}

@connectToStores([EditorStateStore], (context, props) => ({
    entries: EditorStateStore.getState().get('notifications')
}))
export default class Notifications extends Component<NotificationsProps, any> {
    render()
    {
        const {entries} = this.props

        return (
            <div className={s.root}>
                {entries.toArray().map(entry => (
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
}
