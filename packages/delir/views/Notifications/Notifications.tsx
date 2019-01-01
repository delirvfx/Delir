import * as Delir from '@ragg/delir-core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'

import EditorStore, { NotificationEntry } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import RendererStore from '../../domain/Renderer/RendererStore'

import t from './Notifications.i18n'
import * as s from './style.styl'

interface Props extends ContextProp {
    entries: NotificationEntry[]
    userCodeException: Delir.Exceptions.UserCodeException | null
}

class Notifications extends React.Component<Props> {
    public componentDidUpdate(prevProps: Props) {
        const { userCodeException } = this.props

        if (userCodeException && userCodeException !== prevProps.userCodeException) {
            this.props.context.executeOperation(EditorOps.notify, {
                title: t('userCodeError'),
                detail: `In ${userCodeException.location.type}#${userCodeException.location.entityId.slice(0, 4)}\n${
                    userCodeException.message
                }`,
                level: 'error',
            })
        }
    }

    public render() {
        const { entries } = this.props

        return (
            <div className={s.root}>
                {entries.map(entry => (
                    <div key={entry.id} className={classnames(s.entry, s[`--${entry.level}`])}>
                        <div className={s.close} onClick={this.handleCloseMessage} data-entry-id={entry.id}>
                            &times;
                        </div>
                        {entry.title != null && entry.title !== '' && <h1 className={s.entryTitle}>{entry.title}</h1>}
                        {entry.message && <p className={s.entryBody}>{entry.message}</p>}
                        {entry.detail != null && entry.detail !== '' && <pre className={s.detail}>{entry.detail}</pre>}
                    </div>
                ))}
            </div>
        )
    }

    private handleCloseMessage = ({ currentTarget }: React.MouseEvent<HTMLDivElement>) => {
        const { entryId } = currentTarget.dataset
        this.props.context.executeOperation(EditorOps.removeNotification, { id: entryId! })
    }
}

export default withComponentContext(
    connectToStores([EditorStore, RendererStore], context => ({
        entries: context.getStore(EditorStore).getState().notifications,
        userCodeException: context.getStore(RendererStore).getUserCodeException(),
    }))(Notifications),
)
