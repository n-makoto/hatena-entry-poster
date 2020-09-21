import {Client} from 'hatena-blog-api'
import {API_KEY, BLOG_ID, HATENA_ID} from './settings'

const postEntry = async ({
  title,
  content
}: {
  title: string
  content: string
}): Promise<void> => {
  const client = new Client({
    apiKey: API_KEY,
    authType: 'basic',
    blogId: BLOG_ID,
    hatenaId: HATENA_ID
  })

  await client.create({
    categories: ['category1'],
    content,
    contentType: 'text/x-markdown',
    draft: true,
    title
  })
}

export {postEntry}
