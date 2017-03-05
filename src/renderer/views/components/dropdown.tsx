import * as React from 'react'
import {PureComponent, PropTypes} from 'react'
import * as classnames from 'classnames'

import Portal from '../../utils/portal'

import s from './dropdown.styl'

interface DropdownProps {
    shownInitial: boolean
    className: string
}

interface DropdownState {
    show: boolean
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    static propTypes = {
        shownInitial: PropTypes.bool,
        className: PropTypes.string,
    }

    static defaultProps = {
        shownInitial: false,
    }

    refs: {
        inspector: HTMLDivElement
    }

    state = {
        show: this.props.shownInitial
    }

    private _portal: Portal = new Portal()

    show = () => this.setState({show: true})

    hide = () => this.setState({show: false})

    toggle = () => this.setState({show: !this.state.show})

    private hideOnOutsideClicked = (e: MouseEvent) =>
    {
        if (this.state.show) {
            this.hide()
        }
    }

    componentDidMount = () =>
    {
        window.addEventListener('click', this.hideOnOutsideClicked, true)
    }

    componentWillUnmount = () =>
    {
        window.removeEventListener('click', this.hideOnOutsideClicked, true)
        this._portal.unmount()
    }

    componentDidUpdate = () =>
    {
        const {props: {className, children}, state: {show}} = this
        const {left, top} = this.refs.inspector.getBoundingClientRect()

        console.log(show)

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

    render()
    {
        return (
            <div ref='inspector' className={s.dropdownInspector} />
        )
    }
}