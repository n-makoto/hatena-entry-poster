import fs from 'fs'
import remark from 'remark'
import {RemarkNode, Entry} from './types'
import {ENTRIES_PATH} from './settings'

export const getTitleAndContent = (directory: string): Entry => {
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
  const h1Node = findH1(parsedMarkDown, 'heading', 1)[0]
  if (h1Node.children && Array.isArray(h1Node.children)) {
    const titleNode = findNode(h1Node.children[0], 'text')
    if (titleNode[0].value) {
      title = titleNode[0].value
    }
  }

  return {
    title,
    content: file
  }
}

export const findNode = (
  object: RemarkNode,
  targetType: string
): RemarkNode[] => {
  const result = []
  for (const k in object) {
    const value = object[k]
    if (k === 'type' && value && value === targetType) {
      result.push(object)
    }
    if (value && typeof value === 'object') {
      const innerValue = findNode(value as RemarkNode, targetType)
      if (innerValue.length > 0) {
        for (const elem of innerValue) {
          result.push(elem)
        }
      }
    }
  }
  return result
}

export const findH1 = (
  object: RemarkNode,
  targetType: string,
  depth: number
): RemarkNode[] => {
  const result = []
  for (const k in object) {
    const value = object[k]
    if (k === 'type' && value && value === targetType) {
      if (typeof depth === 'number' && object.depth && object.depth === depth) {
        result.push(object)
        break
      }
    }
    if (value && typeof value === 'object') {
      const innerValue = findH1(value as RemarkNode, targetType, depth)
      if (innerValue.length > 0) {
        for (const elem of innerValue) {
          if (typeof depth === 'number' && elem.depth && elem.depth === depth) {
            result.push(elem)
          }
        }
      }
    }
  }
  return result
}
