import * as core from '@actions/core'
import {postEntry} from './postEntry'
// import {uploadImage} from './uploadImage'
import {getLatestEntry} from './entry'
import {wait} from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    const {title, content} = getLatestEntry()

    await postEntry({title, content})

    // await uploadImage({
    //   API_KEY,
    //   HATENA_ID,
    //   title,
    //   file: FILE_PATH
    // })

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
