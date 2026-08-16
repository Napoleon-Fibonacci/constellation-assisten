import { ownerName, ownerNumber } from "../settings.js"

export const command = ["owner", "creator"]

export async function run(sock, msg, { sender }) {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+','')}:${ownerNumber}
END:VCARD`

    await sock.sendMessage(sender, { 
        contacts: { 
            displayName: ownerName, 
            contacts: [{ vcard }] 
        } 
    }, { quoted: msg })
}