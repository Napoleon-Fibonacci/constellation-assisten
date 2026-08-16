import { botName, ownerName, footer } from "../settings.js"

export const command = ["menu", "help"]

export async function run(sock, msg, { sender }) {
    const text = `
╭───「 ${botName} 」
│ Hi, ${ownerName}!
│ 
│ Daftar Perintah:
│ • .ping - Cek status bot
│ • .menu - Lihat menu ini
│ • .owner - Kontak owner
╰──────────────
${footer}
`.trim()

    await sock.sendMessage(sender, { text: text }, { quoted: msg })
}