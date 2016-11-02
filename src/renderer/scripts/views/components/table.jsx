import _ from 'lodash'
import React, {PropTypes, Children} from 'react'
import classnames from 'classnames'

export class Table extends React.Component
{
    constructor(...args)
    {
        super(...args)

        const columnWidths = Children.toArray(this.props.children).reduce((memo, child, _) => {
            if (child.type !== TableHeader) return memo

            return Children.toArray(child.props.children).reduce((memo, rowChild, _) => {
                return Children.toArray(rowChild.props.children).reduce((widths, colChild, _) => {
                    return widths.concat(0)
                }, [])
            })
        })

        this.state = {
            columnWidths: columnWidths,
        }

        console.log(this.state);
    }

    handleCellResizing = (cellIdx, width) => {

    }

    render()
    {
        // console.log(this.props.children)

        return (
            <div className={classnames('_table')}>
                {React.Children.map(this.props.children, (child, idx) => {
                    if (child.type === TableHeader) {
                        return React.cloneElement(child, {
                            notifyCellResizing: this.handleCellResizing,
                        })
                    } else {
                        return child
                    }
                })}
            </div>
        )
    }
}

export class TableHeader extends React.Component
{
    static propTypes = {
        notifyCellResizing: PropTypes.func,
    }

    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        return (
            <div className={classnames('table-header')}>
                {React.Children.map(this.props.children, (child, idx) => {
                    if (child.type === Row) {
                        return React.cloneElement(child, {
                            notifyCellResizing: this.props.notifyCellResizing,
                        })
                    } else {
                        return child
                    }
                })}
            </div>
        )
    }
}

export class TableBody extends React.Component
{
    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        return (
            <div className={classnames('table-body')}>
                {this.props.children}
            </div>
        )
    }
}

export class TableFooter extends React.Component
{
    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        return (
            <div className={classnames('table-footer')}>
                {this.props.children}
            </div>
        )
    }
}

export class Row extends React.Component
{
    static propTypes = {
        notifyCellResizing: PropTypes.func,
    }

    constructor(...args)
    {
        super(...args)
    }

    render()
    {
        return (
            <div className={classnames('table-row')}>
                {React.Children.map(this.props.children, (child, idx) => {
                    if (child.type === Col && this.props.notifyCellResizing) {
                        return React.cloneElement(child, {
                            notifyCellResizing: this.props.notifyCellResizing.bind(null, idx),
                        })
                    } else {
                        return child
                    }
                })}
            </div>
        )
    }
}

export class Col extends React.Component
{
    static propTypes = {
        notifyCellResizing: PropTypes.func,
        defaultWidth: PropTypes.number,
    }

    static defaultProps = {
        defaultWidth: 0,
    }

    constructor(...args)
    {
        super(...args)

        this.state = {
            width: this.props.defaultWidth,
            dragState: null,
        }
    }

    onResizeStart = e => {
        console.log(Object.assign({}, e))

        this.setState({
            dragState: {
                clientX: e.clientX,
                clientY: e.clientY
            }
        })
    }

    onResize = e => {
        console.log(Object.assign({}, e))
    }

    render()
    {
        const style = this.state.width === 0 ? {flex: 1} : {width: this.state.width}

        return (
            <div className={classnames('table-col')} style={style}>
                {this.props.children}
                {
                    this.props.notifyCellResizing &&
                    <div
                        className='resizer'
                        draggable={true}
                        onDragStart={this.onResizeStart}
                        onDrag={this.onResize}
                    />
                }
            </div>
        )
    }
}
