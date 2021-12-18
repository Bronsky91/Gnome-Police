import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import { readFileSync } from "fs";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const getRandomResponse = () => {
  const responses = [
    `Nice Try.`,
    `That message includes contraband.`,
    `Really? You should know better.`,
    `Oh nein, tust du nicht!`,
  ];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

const findThatPig = async (msg) => {
  const pigGifUrl = "https://tenor.com/view/gnome-squeeze-hog-gif-13302788";
  const pigGifBufferOne = readFileSync("pig.gif");
  const pigGifBufferTwo = readFileSync("gnome-squeeze.gif");
  const pigGifBufferThree = readFileSync("gnome-vid.mp4");
  const savedPigGifArray = [
    pigGifBufferOne,
    pigGifBufferTwo,
    pigGifBufferThree,
  ];

  const attachmentPromises = msg.attachments.map((attachment) => {
    // Downloads the message attachments and returns them as buffers
    return axios
      .get(attachment?.url, { responseType: "arraybuffer" })
      .then((res) => Buffer.from(res.data, "utf-8"));
  });
  const buffers = await Promise.all(attachmentPromises);
  const pigBufferMatches = buffers.filter((pg) => {
    // Find any buffers that match the saved files
    return savedPigGifArray.find((spg) => Buffer.compare(spg, pg) === 0);
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

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  findThatPig(msg);
  // ** To be determined what's to come **
  // idiotPatrol(msg);
});

client.login(process.env.TOKEN);
