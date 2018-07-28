import * as classnames from 'classnames'
import * as React from 'react'
import { Component } from 'react'

import {default as EditorStateStore, NotificationEntries as NotificationEntries } from '../../stores/EditorStateStore'
import connectToStores from '../../utils/Flux/connectToStores'

import * as s from './style.sass'

interface NotificationsProps {
    entries: NotificationEntries
}

@connectToStores([EditorStateStore], (context, props) => ({
    entries: EditorStateStore.getState().get('notifications')
}))
export default class Notifications extends Component<NotificationsProps, any> {
    public render()
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
