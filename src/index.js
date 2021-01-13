const download = require('download')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

require('dotenv').config()

const BACKUP_FOLDER_NAME = 'backup'

const GUILD_ID = process.env?.GUILD_ID ?? ''
const TOKEN = process.env?.TOKEN ?? ''

/**
 * Calls the Discord API to list the emojis for a guild.
 *
 * @param {string} guildId The guild id.
 *                         (See https://discord.com/developers/docs/resources/guild).
 *
 * @return {Promise<[{id: string, name: string}]>} The list of emojis
 *                (See https://discord.com/developers/docs/resources/emoji).
 */
async function listEmojis(guildId) {
  const res = await fetch(
    `https://discord.com/api/v8/guilds/${guildId}/emojis`,
    {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US',
        authorization: TOKEN,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin'
      },
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      method: 'GET',
      mode: 'cors'
    }
  )

  return await res.json()
}

/**
 * Converts an emoji id to the download URL.
 *
 * @param {string} emojiId The Discord emoji id.
 *                         (See https://discord.com/developers/docs/resources/emoji).
 *
 * @return {string} The download URL.
 */
function toEmojiUrl(emojiId) {
  return `https://cdn.discordapp.com/emojis/${emojiId}.png?v=1`
}

// Main function

;(async () => {
  // Ensure backup folder exists

  if (!fs.existsSync(BACKUP_FOLDER_NAME)) {
    fs.mkdirSync(BACKUP_FOLDER_NAME)
  }

  // Map emoji to image URLs, then download from each URL

  const transformEmojiToRecord = ({ id, name }) => ({
    name: name,
    url: toEmojiUrl(id)
  })

  const downloadAndBackupEmoji = async ({ name, url }) => {
    fs.writeFileSync(
      path.join('.', BACKUP_FOLDER_NAME, `${name}.png`),
      await download(url)
    )
  }

  ;(await listEmojis(GUILD_ID))
    .map(transformEmojiToRecord)
    .forEach(downloadAndBackupEmoji)
})()
