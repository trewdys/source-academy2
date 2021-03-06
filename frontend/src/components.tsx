import * as React from 'react'
import { render } from 'react-dom'
import { DateRangePicker } from '@blueprintjs/datetime'
import moment from 'moment-timezone'

window.sa = {
  components: {
    dateRangePicker(
      container: HTMLElement,
      startInput: HTMLInputElement,
      endInput: HTMLInputElement
    ) {
      const handleChange = ([newStart, newEnd]: [Date, Date]) => {
        newStart = moment(newStart).startOf('day').toDate()
        newEnd = moment(newEnd).startOf('day').toDate()
        startInput.value = newStart.getTime().toString()
        endInput.value = newEnd.getTime().toString()
      }
      if (startInput.value && endInput.value) {
        const startValue = moment(startInput.value).toDate()
        const endValue = moment(endInput.value).toDate()
        startInput.value = startValue.getTime().toString()
        endInput.value = endValue.getTime().toString()
        render(
          <DateRangePicker
            defaultValue={[startValue!, endValue!]}
            onChange={handleChange}
          />,
          container
        )
      } else {
        render(<DateRangePicker onChange={handleChange} />, container)
      }
    },
    async richTextEditor(container: HTMLInputElement) {
      const SimpleMDE = await import(/* webpackChunkName: "simplemde" */ 'simplemde')
      const value = container.value
      const mde = new SimpleMDE({
        autofocus: false,
        element: container,
        forceSync: true
      })
      mde.value(value)
    },
    async jsonEditor(
      input: HTMLTextAreaElement,
      container: HTMLElement
    ) {
      const ace = await import(/* webpackChunkName: "brace" */ 'brace')
      await import('ayu-ace/light')
      await import('brace/mode/json')
      const editor = ace.edit(container)
      const session = editor.getSession()
      editor.setTheme('ace/theme/ayu-light')
      session.setMode('ace/mode/json')
      editor.setFontSize('14px')
      const json = JSON.parse(input.value)
      editor.setValue(JSON.stringify(json, null, '\t'))
      editor.on('change', () => (input.value = editor.getValue()))
      editor.clearSelection()
    },
    async codeEditor(
      input: HTMLTextAreaElement,
      container: HTMLElement
    ) {
      const ace = await import(/* webpackChunkName: "brace" */ 'brace')
      await import(/* webpackChunkName: "ayu-ace.light" */ 'ayu-ace/light')
      await import(/* webpackChunkName: "brace.javascript" */ 'brace/mode/javascript')
      const editor = ace.edit(container)
      const session = editor.getSession()
      editor.setTheme('ace/theme/ayu-light')
      session.setMode('ace/mode/javascript')
      editor.setFontSize('14px')
      editor.setValue(input.value)
      editor.on('change', () => (input.value = editor.getValue()))
      editor.clearSelection()
    }
  }
}
