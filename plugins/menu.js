import { botName, ownerName } from "../settings.js"

export default {
    name: "menu",
    aliases: ["help", "commands"],
    ownerOnly: false,
    execute: async (sock, m, { prefix, footer }) => {
        const text = `*${botName}*\n\nOwner: ${ownerName}\n\nCommands:\n- ${prefix}ping\n- ${prefix}menu\n- ${prefix}owner\n\n${footer}`
        await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m })
    }
}
