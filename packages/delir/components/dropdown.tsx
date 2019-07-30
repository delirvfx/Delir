import classnames from 'classnames'
import React from 'react'

import Portal from '../modules/Portal'

import s from './dropdown.styl'

interface Props {
    shownInitial?: boolean
    className?: string
    children?: React.ReactNode
}

interface State {
    show: boolean
}

export default class Dropdown extends React.Component<Props, State> {
    public static defaultProps = {
        shownInitial: false,
    }

    public refs: {
        inspector: HTMLDivElement
    }

    public state: State = {
        show: this.props.shownInitial || false,
    }

    private _portal: Portal = new Portal()

    public show = (callback?: () => void) => {
        this.setState({ show: true }, callback)
    }

    public hide = (callback?: () => void) => {
        this.setState({ show: false }, callback)
    }

    public toggle = () => {
        this.setState({ show: !this.state.show })
    }

    public componentDidMount() {
        window.addEventListener('click', this.hideOnOutsideClicked, {
            capture: true,
        })
    }

    public componentWillUnmount() {
        window.removeEventListener('click', this.hideOnOutsideClicked, {
            capture: true,
        })
        this._portal.unmount()
    }

    public shouldComponentUpdate(nextProps: Props, nextState: State) {
        const { props, state } = this
        return props.className !== nextProps.className || state.show !== nextState.show
    }

    public componentDidUpdate() {
        const {
            props: { className, children },
            state: { show },
        } = this
        const { left, top } = this.refs.inspector.getBoundingClientRect()

        this._portal.mount(
            <ul
                className={classnames(s.dropdown, className, {
                    [s['--shown']]: show,
                })}
                style={{ left, top }}
            >
                {children}
            </ul>,
        )
    }

    public render() {
        return <div ref="inspector" className={s.dropdownInspector} />
    }

    private hideOnOutsideClicked = (e: MouseEvent) => {
        const path = (e as any).path as Element[]
        const clickSelfOrChild = path.includes(this._portal.root)

        if (!clickSelfOrChild && this.state.show) {
            this.hide()
        }
    }
}
