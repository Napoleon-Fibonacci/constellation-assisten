export default {
    name: "ping",
    aliases: ["p"],
    ownerOnly: false,
    execute: async (sock, m, { prefix }) => {
        await sock.sendMessage(m.key.remoteJid, { text: "Pong!" }, { quoted: m })
    }
}
