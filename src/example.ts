/* eslint-disable no-console */
import {Client} from 'hatena-blog-api'

// tslint:disable:no-console
const main = async (): Promise<void> => {
  const apiKey = 'z9rvpt2v20'
  const blogId = 'action-test.hatenablog.com'
  const hatenaId = 'mkt0225'

  const client = new Client({
    apiKey,
    authType: 'basic',
    blogId,
    hatenaId
  })
  const entries = await client.list()
  console.log('listed')
  console.log(entries)

  const created = await client.create({
    categories: ['category1'],
    content: [
      '[link](http://example.com)',
      '',
      '- item 1',
      '- item 2',
      '- item 3'
    ].join('\n'),
    contentType: 'text/x-markdown',
    draft: true,
    title: 'test',
    updated: '2019-02-07T12:00:00+09:00'
  })
  console.log('created')
  console.log(created)

  //   const retrieved = await client.retrieve(created.editUrl)
  //   console.log('retrieved')
  //   console.log(retrieved)

  //   await client.delete(created.editUrl)
  //   console.log('deleted')
}

// export {main}
main()
