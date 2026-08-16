import makeWASocket, { DisconnectReason, Browsers } from "ourin-baileys"
import { useMultiFileAuthState } from "ourin-baileys"
import pino from "pino"
import { handler, loadPlugins } from "./handler.js"
import { botName, ownerNumber, sessionPath } from "./settings.js"

const logger = pino({ level: "silent" })

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

    const sock = makeWASocket({
        auth: state,
        logger,
        browser: Browsers.ubuntu("Chrome"),
        syncFullHistory: false
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr, isNewLogin }) => {
        if (qr) console.log(qr)

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
            else console.log("❌ Koneksi ditutup permanen.")
        }

        if (connection === "connecting" && isNewLogin) {
            console.log("⏳ Meminta pairing code...")
            try {
                const code = await sock.requestPairingCode(ownerNumber.replace(/[^0-9]/g, ""))
                console.log(`🔑 === PAIRING CODE: ${code} ===`)
                console.log("Masukkan kode di WhatsApp HP Anda (Perangkat Tertaut).")
            } catch (e) {
                console.error("Gagal pairing:", e.message)
            }
        }

        if (connection === "open") {
            console.log(`✅ ${botName} Connected!`)
            await loadPlugins()
        }
    })

    sock.ev.on("messages.upsert", async (m) => {
        await handler(sock, m)
    })
}

startBot()