import { isJidGroup, jidNormalizedUser } from "ourin-baileys"
import { loadCommands } from "./system.js"
import { ownerNumber, footer } from "./settings.js"

export async function handler(sock, { messages, type }) {
    if (type !== "notify") return

    const m = messages[0]
    if (!m?.message || m.key.fromMe) return

    const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(text) ? text.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "."
    const cmd = text.startsWith(prefix) ? text.slice(1).trim().split(" ")[0].toLowerCase() : ""
    const args = text.slice(prefix.length + cmd.length).trim().split(" ")
    const sender = jidNormalizedUser(m.key.remoteJid)
    const isOwner = [ownerNumber, `${ownerNumber}@s.whatsapp.net`].includes(sender)

    const commands = await loadCommands()
    const command = commands.get(cmd)

    if (command && (!command.ownerOnly || isOwner)) {
        try {
            await command.execute(sock, m, { prefix, args, sender, isOwner, footer })
        } catch (e) {
            console.error(e)
            await sock.sendMessage(m.key.remoteJid, { text: "Error executing command" }, { quoted: m })
        }
    }
}
