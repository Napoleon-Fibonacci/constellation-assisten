import { readdir } from "fs/promises"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { ownerNumber } from "./settings.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const pluginsDir = join(__dirname, "plugins")
const plugins = {}

const cleanOwner = ownerNumber.replace(/[^0-9]/g, "")

export async function loadPlugins() {
    try {
        const files = (await readdir(pluginsDir)).filter(f => f.endsWith(".js"))
        console.log(`📂 Memuat ${files.length} plugin...`)
        
        for (const file of files) {
            try {
                const module = await import(`./plugins/${file}`)
                if (module.command) {
                    for (const cmd of module.command) {
                        plugins[cmd] = module.run
                    }
                    console.log(`✅ Loaded: ${file} (${module.command.join(", ")})`)
                }
            } catch (err) {
                console.error(`❌ Gagal load ${file}:`, err.message)
            }
        }
    } catch (err) {
        console.error("Gagal baca folder plugins:", err.message)
    }
}

export async function handler(sock, m) {
    try {
        const msg = m.messages[0]
        if (!msg || !msg.message) return
        if (msg.key.fromMe) return // Abaikan pesan dari bot sendiri

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        if (!text.startsWith(".")) return

        const senderJid = msg.key.remoteJid
        const args = text.slice(1).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        if (plugins[command]) {
            console.log(`⚡ Command: ${command} dari ${senderJid.split("@")[0]}`)
            try {
                await plugins[command](sock, msg, { 
                    args, 
                    sender: senderJid, 
                    isGroup: senderJid.endsWith("@g.us") 
                })
            } catch (e) {
                console.error(`Error run ${command}:`, e)
                await sock.sendMessage(senderJid, { text: "❌ Terjadi kesalahan pada sistem." })
            }
        }
    } catch (err) {
        console.error("Handler error:", err)
    }
}