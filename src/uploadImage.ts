import fotolife from 'hatena-fotolife-api'

const uploadImage = async ({
  API_KEY,
  //   USER_NAME,
  HATENA_ID,
  title,
  file
}: {
  API_KEY: string
  HATENA_ID: string
  //   USER_NAME: string
  title: string
  file: string
}): Promise<void> => {
  const client = fotolife({
    type: 'wsse',
    username: HATENA_ID,
    apikey: API_KEY
  })
  const options = {title, file}

  await client.create(options)
}

export {uploadImage}
