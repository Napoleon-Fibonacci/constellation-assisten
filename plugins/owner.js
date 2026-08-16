import { ownerName, ownerNumber } from "../settings.js"

export default {
    name: "owner",
    aliases: ["creator"],
    ownerOnly: false,
    execute: async (sock, m) => {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL:+${ownerNumber.replace("@s.whatsapp.net", "")}\nEND:VCARD`
        await sock.sendMessage(m.key.remoteJid, { 
            contacts: { 
                displayName: ownerName, 
                contacts: [{ vcard }] 
            } 
        }, { quoted: m })
    }
}
