import makeWASocket, { useMultiFileAuthState } from "baileys";
import { data_user } from "../database/yohan.db";
import "dotenv/config";
import axios from "axios";

const APIKEY = process.env.API_KEY;

async function main() {
  const { state, saveCreds } = await useMultiFileAuthState("cache");

  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });
  socket.ev.on("messages.upsert", async ({ messages, type, requestId }) => {
    const keys = messages[0].key.remoteJid!;
    // console.log(messages[0]);
    if (!messages[0].key.fromMe) {
      if (!keys.includes("@g.us")) {
        const number = keys.split("@")[0];
        const config = data_user(number);
        if (!config) {
          try {
            const message_text = messages[0].message!.conversation!
            await socket.sendPresenceUpdate("composing",keys)
            const gemini = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${APIKEY}`,
              {
                contents: [
                  {
                    parts: [
                      {
                        text: message_text,
                      },
                    ],
                  },
                ],
              }
            );
            await socket.sendPresenceUpdate("paused",keys)

            await socket.sendMessage(keys, {
              text: `${String(gemini.data.candidates[0].content.parts[0].text).replace("*","")} \n\n *Gemini AI [Google - Provider]*`,
            });
          } catch (err) {
            console.log(err);
            await socket.sendMessage(keys, { text: "Gagal menjalankan BOT"});
          }
        }
      }else {
        const number = messages[0].key.participant!.split("@")[0];
        const message_text = messages[0].message?.conversation!

        const metadata = await socket.groupMetadata(keys)
        const participants = metadata.participants.map(p => p.id);

        console.log(participants)
        if (message_text == "hidetag") {
            await socket.sendMessage(keys, { text: `@semua` , mentions : participants});
        } else if (message_text == "tag") {
           let text = ""
           participants.forEach((e)=> {
            text += "\n@" +  e.split("@")[0] 
           })
           await socket.sendMessage(keys, { text: text , mentions : participants});

        
        }
    }
    } 
  });
  socket.ev.on("creds.update", saveCreds);
}

main();
