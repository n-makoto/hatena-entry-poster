import {Client} from 'hatena-blog-api'

const postEntry = async ({
  API_KEY,
  BLOG_ID,
  HATENA_ID,
  title,
  content
}: {
  API_KEY: string
  BLOG_ID: string
  HATENA_ID: string
  title: string
  content: string
}): Promise<void> => {
  const client = new Client({
    apiKey: API_KEY,
    authType: 'basic',
    blogId: BLOG_ID,
    hatenaId: HATENA_ID
  })
  // await client.list()

  await client.create({
    categories: ['category1'],
    content,
    contentType: 'text/x-markdown',
    draft: true,
    title
  })
}

export {postEntry}
