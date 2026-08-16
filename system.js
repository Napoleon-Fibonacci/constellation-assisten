import { readdir, readFile } from "fs/promises"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const pluginsDir = join(__dirname, "plugins")
let commands = new Map()
let lastModified = 0

export async function loadCommands(force = false) {
    const files = await readdir(pluginsDir).filter(f => f.endsWith(".js"))
    const latestMod = Math.max(...files.map(f => new Date().getTime()))

    if (force || latestMod > lastModified || commands.size === 0) {
        commands.clear()
        for (const file of files) {
            try {
                const module = await import(`./plugins/${file}?t=${Date.now()}`)
                if (module.default) {
                    const cmd = module.default
                    if (cmd.name) commands.set(cmd.name, cmd)
                    if (cmd.aliases) cmd.aliases.forEach(a => commands.set(a, cmd))
                }
            } catch (e) {
                console.error(`Failed to load ${file}:`, e.message)
            }
        }
        lastModified = latestMod
        console.log(`Loaded ${commands.size} commands`)
    }

    return commands
}

export function normalizeJid(jid) {
    if (!jid) return ""
    return jid.split("@")[0] + (jid.includes("@g.us") ? "@g.us" : "@s.whatsapp.net")
}

export function getLidFromPn(pn) {
    return pn.includes("@") ? pn : `${pn}@s.whatsapp.net`
}
