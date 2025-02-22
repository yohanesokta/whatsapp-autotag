"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("baileys"));
const yohan_db_1 = require("../database/yohan.db");
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const APIKEY = process.env.API_KEY;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)("cache");
        const socket = (0, baileys_1.default)({
            auth: state,
            printQRInTerminal: true,
        });
        socket.ev.on("messages.upsert", (_a) => __awaiter(this, [_a], void 0, function* ({ messages, type, requestId }) {
            var _b;
            const keys = messages[0].key.remoteJid;
            // console.log(messages[0]);
            if (!messages[0].key.fromMe) {
                if (!keys.includes("@g.us")) {
                    const number = keys.split("@")[0];
                    const config = (0, yohan_db_1.data_user)(number);
                    if (!config) {
                        try {
                            const message_text = messages[0].message.conversation;
                            yield socket.sendPresenceUpdate("composing", keys);
                            const gemini = yield axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${APIKEY}`, {
                                contents: [
                                    {
                                        parts: [
                                            {
                                                text: message_text,
                                            },
                                        ],
                                    },
                                ],
                            });
                            yield socket.sendPresenceUpdate("paused", keys);
                            yield socket.sendMessage(keys, {
                                text: `${String(gemini.data.candidates[0].content.parts[0].text).replace("*", "")} \n\n *Gemini AI [Google - Provider]*`,
                            });
                        }
                        catch (err) {
                            console.log(err);
                            yield socket.sendMessage(keys, { text: "Gagal menjalankan BOT" });
                        }
                    }
                }
                else {
                    const number = messages[0].key.participant.split("@")[0];
                    const message_text = (_b = messages[0].message) === null || _b === void 0 ? void 0 : _b.conversation;
                    const metadata = yield socket.groupMetadata(keys);
                    const participants = metadata.participants.map(p => p.id);
                    console.log(participants);
                    if (message_text == "hidetag") {
                        yield socket.sendMessage(keys, { text: `@semua`, mentions: participants });
                    }
                    else if (message_text == "tag") {
                        let text = "";
                        participants.forEach((e) => {
                            text += "\n@" + e.split("@")[0];
                        });
                        yield socket.sendMessage(keys, { text: text, mentions: participants });
                    }
                }
            }
        }));
        socket.ev.on("creds.update", saveCreds);
    });
}
main();
