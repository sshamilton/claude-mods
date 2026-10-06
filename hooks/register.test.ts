import { expect, test } from 'claude-code/testing'

const RUN_RESULT = {
  exitCode: 0,
  stdout: 'pliny.local\n',
  stderr: '',
  isStdoutTruncated: false,
  isStderrTruncated: false,
}

test('pins the host name on the status line at session start', async ($, on) => {
  const status: Array<string | undefined> = []
  on('process.run', () => ({ value: RUN_RESULT }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('ui.status', ($, e) => {
    status.push(e.text)
    return { value: undefined }
  })

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })

  expect(status).toEqual(['⬢ pliny'])
})

test('draws the host rule above the prompt in the host color', async ($, on) => {
  on('process.run', () => ({ value: RUN_RESULT }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const tree = await $.ui.render({
      surface,
      component: 'AbovePrompt',
      requestId: 'above-prompt',
      props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
    })
    const text = JSON.stringify(tree)
    expect(text).toContain('pliny')
    expect(text).toContain('#2fbf71')
  }
})

test('yields the band to a survey', async ($, on) => {
  on('process.run', () => ({ value: RUN_RESULT }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['engine'] }))
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })

  const tree = await $.ui.render({
    surface: 'terminal',
    component: 'AbovePrompt',
    requestId: 'above-prompt',
    props: { hasSurvey: true, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
  })
  expect(JSON.stringify(tree)).not.toContain('pliny')
})
