import makeWASocket, { DisconnectReason, Browsers } from "ourin-baileys"
import { useMultiFileAuthState } from "ourin-baileys"
import pino from "pino"
import { handler } from "./handler.js"
import { botName, ownerNumber, usePairingCode, sessionPath } from "./settings.js"

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

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log(qr)
        }

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        }

        if (connection === "open") {
            console.log(`${botName} connected!`)
        }

        if (connection === "connecting" && usePairingCode) {
            const code = await sock.requestPairingCode(ownerNumber)
            console.log(`Pairing Code: ${code}`)
        }
    })

    sock.ev.on("messages.upsert", async (m) => {
        await handler(sock, m)
    })
}

startBot()
