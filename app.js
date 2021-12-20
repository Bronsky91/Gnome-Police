import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import { readFileSync, readdirSync } from "fs";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const discordClient = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Mentions
const nooby = `<@100377761356472320>`;

// Contraband
const savedContrabandFiles = readdirSync("contraband").map((fn) =>
  readFileSync(`contraband/${fn}`)
);
const urlContraband = [
  "tenor.com/view/gnome-squeeze-hog-gif-13302788",
  "imgur.com/a/RKrjRj1",
  "imgur.com/gallery/0n6toZp",
  "youtube.com/watch?v=uzseYbdR4dI",
  "makeagif.com/i/3dg8C9",
];

// Msg content to watch for
const bugReports = ["bug report", "bugreport"];

// Bot responses
const policeGifResponses = [
  `Nice Try.`,
  `This message includes contraband.`,
  `Really? You should know better.`,
  `Oh nein, tust du nicht!`,
  `Blame Boochie.`,
  `I'm just following orders.`,
  `Nothing personal. Well maybe a little bit.`,
  `WEE WOO WEE WOO`,
];
const noobyBullyResponses = [
  `Comrade ${nooby}, please get your shit together before our great leader angers.`,
  `By decree of the great leader, ${nooby} fix your little bot.`,
  `Comrade ${nooby}, if you must name your bot after our great leader, at least make sure it works.`,
];

const getRandomResponse = (responses) => {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

const bullyNooby = (msg) => {
  if (bugReports.some((br) => msg.content.includes(br))) {
    msg.channel.send(getRandomResponse(noobyBullyResponses));
  }
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
    urlContraband.some((pgu) => msg.content.includes(pgu));

  if (notAllowed) {
    msg.reply(getRandomResponse(policeGifResponses));
    setTimeout(() => msg.delete(), 500);
  }
};

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on("messageCreate", (msg) => {
  findThatPig(msg);
  bullyNooby(msg);
});

discordClient.login(process.env.TOKEN);
