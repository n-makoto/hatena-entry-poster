/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import remark from 'remark'
import {Node} from 'unist'

interface remarkNode extends Node {
  children?: remarkNode[]
  value?: string
}

const ENTRIES_PATH = './entries'

type Entry = {
  title: string
  content: string
}

const getLatestEntry = (): Entry => {
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

const getTitleAndContent = (directory: string): Entry => {
  let title = ''
  const directoryPath = `${ENTRIES_PATH}/${directory}`
  const list = fs.readdirSync(directoryPath)
  if (!list.includes('entry.md')) {
    throw new Error('entry.md is not found')
  }

  const filePath = `${directoryPath}/entry.md`
  const file = fs.readFileSync(filePath, {encoding: 'utf8'})

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const {parse} = remark()
  const parsedMarkDown = parse(file)
  const h1Node = findVal(parsedMarkDown, 'heading', 1)
  if (
    Array.isArray(h1Node) &&
    h1Node[0].children &&
    Array.isArray(h1Node[0].children)
  ) {
    const titleNode = findVal(h1Node[0].children[0], 'text', undefined)
    if (titleNode[0].value) {
      title = titleNode[0].value
    }
  }

  return {
    title,
    content: directory
  }
}

const findVal = (
  object: remarkNode,
  targetType: string,
  depth: number | undefined
): remarkNode[] => {
  const result = []
  for (const k in object) {
    const value = object[k]
    if (k === 'type' && value && value === targetType) {
      if (typeof depth === 'number' && object.depth && object.depth === depth) {
        result.push(object)
        break
      } else {
        result.push(object)
      }
    }
    if (value && typeof value === 'object') {
      const innerValue = findVal(value as Node, targetType, depth)
      if (innerValue.length > 0) {
        for (const elem of innerValue) {
          if (typeof depth === 'number' && elem.depth) {
            if (elem.depth === depth) {
              result.push(elem)
            }
          } else {
            result.push(elem)
          }
        }
      }
    }
  }
  return result
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

// TODO: テスト書く
const extractDateString = (str: string): string[] => {
  const regExp = /([0-9]{4})([0-9]{2})([0-9]{2})/g
  const result = regExp.exec(str)
  if (result == null || result.length === 0) {
    throw new Error('Invalid Directory Name')
  }
  return [result[1], result[2], result[3]] || []
}

const filterToDirectories = (list: string[]): string[] => {
  return list.filter(elem => {
    const stats = fs.statSync(path.join(ENTRIES_PATH, elem))
    return stats.isDirectory()
  })
}

const result = getLatestEntry()
console.log(result)
