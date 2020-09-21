import {Node} from 'unist'

export type RemarkNode = Node & {
  children?: RemarkNode[]
  value?: string
}

export type Entry = {
  title: string
  content: string
}
