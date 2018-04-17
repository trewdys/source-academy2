import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import * as actions from '../actions'
import { Shape } from '../shape'
import createEditor from '../../common/createEditor'

export type OwnProps = {}

export type Props = OwnProps & {
  initialValue: string
  isReadOnly: boolean
  setEditorValue: (value: string) => any
  setBreakpoints: (breakpoints: any) => any
}

const mapStateToProps = (state: Shape, ownProps: OwnProps) => ({
  initialValue: state.editor.value,
  isReadOnly: state.config.isReadOnly
})

const mapDispatchToProps = (dispatch: Dispatch<Shape>) =>
  bindActionCreators(
    {
      setEditorValue: actions.setEditorValue,
      setBreakpoints: actions.setBreakpoints
    },
    dispatch
  )

class Editor extends React.Component<Props, any> {
  $editor: HTMLDivElement | null
  editor: AceAjax.Editor

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isReadOnly !== this.props.isReadOnly) {
      this.editor.setReadOnly(this.props.isReadOnly)
    }
  }

  async componentDidMount() {
    const $editor = findDOMNode(this.$editor!) as HTMLElement
    const editor = await createEditor($editor, this.props.initialValue)
    editor.on('guttermousedown', e => {
      var target = e.domEvent.target
      if (target.className.indexOf('ace_gutter-cell') == -1) return
      if (!editor.isFocused()) return
      if (e.clientX > 25 + target.getBoundingClientRect().left) return

      var row = e.getDocumentPosition().row
      var breakpoints = e.editor.session.getBreakpoints(row, 0)

      if (typeof breakpoints[row] === typeof undefined)
        e.editor.session.setBreakpoint(row)
      else e.editor.session.clearBreakpoint(row)
      this.props.setBreakpoints(editor.session.getBreakpoints())

      e.stop()
    })
    editor.getSession().on('change', e => {
      var breakpointsArray = editor.session.getBreakpoints()
      if (Object.keys(editor.session.getBreakpoints()).length > 0) {
        if (e.lines.length > 1) {
          var breakpoint = parseInt(Object.keys(breakpointsArray)[0])
          var lines = e.lines.length - 1
          var start = e.start.row
          var end = e.end.row
          if (e.action === 'insert') {
            //console.log('new lines',breakpoint, start , end );
            if (breakpoint >= start) {
              //console.log('breakpoint forward');
              editor.session.clearBreakpoint(breakpoint)
              editor.session.setBreakpoint(breakpoint + lines)
            }
          } else if (e.action === 'remove') {
            //console.log('removed lines',breakpoint, start , end);
            if (breakpoint > start && breakpoint < end) {
              //console.log('breakpoint remove');
              editor.session.clearBreakpoint(breakpoint)
            }
            if (breakpoint >= end) {
              //console.log('breakpoint behind');
              editor.session.clearBreakpoint(breakpoint)
              editor.session.setBreakpoint(breakpoint - lines)
            }
          }
        }
      }
      //e.editor.props.setBreakpoints(breakpointsArray)
      this.props.setBreakpoints(editor.session.getBreakpoints())
    })

    editor.getSession().on('change', () => {
      this.props.setEditorValue(editor.getValue())
    })
    if (this.props.isReadOnly) {
      editor.setReadOnly(true)
    }
    this.editor = editor as AceAjax.Editor
  }

  render() {
    return (
      <div className="editor-container">
        <div className="editor" ref={r => (this.$editor = r)} />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
