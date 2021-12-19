import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import { readFileSync, readdirSync } from "fs";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const discordClient = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const savedContrabandFiles = readdirSync("contraband").map((fn) =>
  readFileSync(`contraband/${fn}`)
);
const pigGifUrl = "https://tenor.com/view/gnome-squeeze-hog-gif-13302788";

const getRandomResponse = () => {
  const responses = [
    `Nice Try.`,
    `This message includes contraband.`,
    `Really? You should know better.`,
    `Oh nein, tust du nicht!`,
    `Blame Boochie.`,
    `I'm just following orders.`,
    `Nothing personal. Well maybe a little bit.`,
    `For Gnomeregan!`,
  ];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

const findThatPig = async (msg) => {
  const attachmentPromises = msg.attachments.map((attachment) => {
    // Downloads the message attachments and returns them as buffers
    return axios
      .get(attachment?.url, { responseType: "arraybuffer" })
      .then((res) => Buffer.from(res.data, "utf-8"));
  });
  const buffers = await Promise.all(attachmentPromises);
  const pigBufferMatches = buffers.filter((pg) => {
    // Find any buffers that match the saved files
    return savedContrabandFiles.find((spg) => Buffer.compare(spg, pg) === 0);
  });

  // Find any attachments that have the common names of controband gifs
  const pigs = msg.attachments.filter(
    (a) => a.name === "pig.gif" || a.name === "gnome-squeeze.gif"
  );

  const notAllowed =
    pigs.size !== 0 ||
    pigBufferMatches.length !== 0 ||
    msg.content.includes(pigGifUrl);

  if (notAllowed) {
    msg.reply(getRandomResponse());
    setTimeout(() => msg.delete(), 500);
  }
};

const idiotPatrol = (msg) => {
  if (msg.content.toLowerCase().includes(`idiot`)) {
    msg.reply(`That's your one. Tread carefully`);
  }
};

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on("messageCreate", (msg) => {
  findThatPig(msg);
  // ** To be determined what's to come **
  // idiotPatrol(msg);
});

discordClient.login(process.env.TOKEN);
