import * as core from '@actions/core'
import {postEntry} from './postEntry'
import {uploadImage} from './uploadImage'
import {getLatestEntry} from './entry'
import {wait} from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const API_KEY: string = process.env.API_KEY || ''
    const BLOG_ID: string = process.env.BLOG_ID || ''
    const HATENA_ID: string = process.env.HATENA_ID || ''
    const FILE_PATH: string = process.env.FILE_PATH || ''
    core.debug(API_KEY)
    core.debug(BLOG_ID)
    core.debug(HATENA_ID)

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    const {title, content} = getLatestEntry()

    await postEntry({API_KEY, BLOG_ID, HATENA_ID, title, content})

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
