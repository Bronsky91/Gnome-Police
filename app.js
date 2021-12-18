import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import { readFileSync } from "fs";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const findThatPig = async (msg) => {
  const pigGifUrl = "https://tenor.com/view/gnome-squeeze-hog-gif-13302788";
  const pigGifBufferOne = readFileSync("pig.gif");
  const pigGifBufferTwo = readFileSync("gnome-squeeze.gif");
  const savedPigGifArray = [pigGifBufferOne, pigGifBufferTwo];

  const attachmentPromises = msg.attachments.map((attachment) => {
    return axios
      .get(attachment?.url, { responseType: "arraybuffer" })
      .then((res) => Buffer.from(res.data, "utf-8"));
  });
  const buffers = await Promise.all(attachmentPromises);
  const pigBufferMatches = buffers.filter((pg) => {
    return savedPigGifArray.find((spg) => Buffer.compare(spg, pg) === 0);
  });

  const pigs = msg.attachments.filter(
    (a) => a.name === "pig.gif" || a.name === "gnome-squeeze.png"
  );

  const notAllowed =
    pigs.size !== 0 ||
    pigBufferMatches.length !== 0 ||
    msg.content === pigGifUrl;

  if (notAllowed) {
    msg.reply("Nice try.");
    setTimeout(() => msg.delete(), 500);
  }
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  findThatPig(msg);
});

client.login(process.env.TOKEN);
