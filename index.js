const download = require('download')
const fetch = require('node-fetch')
const fs = require('fs')
const { guildId, token } = require('./env')

if (!fs.existsSync('./dist')){
  fs.mkdirSync('./dist');
}

function toEmojiUrl(emojiId) {
  return `https://cdn.discordapp.com/emojis/${emojiId}.png?v=1`
}

;(async () => {
  const res = await fetch(
    `https://discord.com/api/v8/guilds/${guildId}/emojis`,
    {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US',
        authorization: token,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      method: 'GET',
      mode: 'cors'
    }
  )

  const resBody = await res.json()

  const emojiRecords = resBody.map(({ id, name }) => {
    const url = toEmojiUrl(id)

    return { id, name, url }
  })

  emojiRecords.forEach(async ({ name, url }) => {
    fs.writeFileSync(`./dist/${name}.png`, await download(url))
  })
})()
