/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import {Entry} from './types'
import {getTitleAndContent} from './markdown'
import {extractDateString} from './utils'
import {ENTRIES_PATH} from './settings'

export const getLatestEntry = (): Entry => {
  try {
    const list = fs.readdirSync(ENTRIES_PATH)
    const directories = filterToDirectories(list)
    const latestDirectory = getLatestDirectoryName(directories)
    return getTitleAndContent(latestDirectory)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const filterToDirectories = (list: string[]): string[] => {
  return list.filter(elem => {
    const stats = fs.statSync(path.join(ENTRIES_PATH, elem))
    return stats.isDirectory()
  })
}

const getLatestDirectoryName = (list: string[]): string => {
  const latestDirectory = {
    name: 'nope',
    time: 0
  }
  for (const elem of list) {
    const dateStr = extractDateString(elem)
    const elemDate = new Date(`${dateStr.join('-')} 00:00:00`)
    const epochTime = elemDate.getTime()
    if (epochTime > latestDirectory.time) {
      latestDirectory.name = elem
      latestDirectory.time = epochTime
    }
  }
  return latestDirectory.name
}
