export const command = ["ping", "p"]

export async function run(sock, msg, { sender }) {
    await sock.sendMessage(sender, { text: "🏓 Pong! Bot aktif." }, { quoted: msg })
}