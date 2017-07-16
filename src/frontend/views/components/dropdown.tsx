import * as React from 'react'
import {PureComponent} from 'react'
import * as PropTypes from 'prop-types'
import * as classnames from 'classnames'

import Portal from '../../modules/Portal'

import * as s from './dropdown.styl'

interface DropdownProps {
    shownInitial: boolean
    className: string
}

interface DropdownState {
    show: boolean
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    public static propTypes = {
        shownInitial: PropTypes.bool,
        className: PropTypes.string,
    }

    public static defaultProps = {
        shownInitial: false,
    }

    public refs: {
        inspector: HTMLDivElement
    }

    public state = {
        show: this.props.shownInitial
    }

    private _portal: Portal = new Portal()

    public show = () =>
    {
        this.setState({show: true})
    }

    public hide = () =>
    {
        this.setState({show: false})
    }

    public toggle = () =>
    {
        this.setState({show: !this.state.show})
    }

    private hideOnOutsideClicked = (e: MouseEvent) =>
    {
        const path = ((e as any).path as Element[])
        const clickSelfOrChild = path.includes(this._portal.root)

        if (!clickSelfOrChild && this.state.show) {
            this.hide()
        }
    }

    public componentDidMountg()
    {
        window.addEventListener('click', this.hideOnOutsideClicked, true)
    }

    public componentWillUnmountg()
    {
        window.removeEventListener('click', this.hideOnOutsideClicked, true)
        this._portal.unmount()
    }

    public componentDidUpdateg()
    {
        const {props: {className, children}, state: {show}} = this
        const {left, top} = this.refs.inspector.getBoundingClientRect()

        this._portal.mount((
            <ul
                className={classnames(s.dropdown, className, {
                    [s['--shown']]: show
                })}
                style={{left, top}}
            >
                {children}
            </ul>
        ))
    }

    public render()
    {
        return (
            <div ref='inspector' className={s.dropdownInspector} />
        )
    }
}
