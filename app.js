import dotenv from "dotenv";
import { Client, Intents, Message } from "discord.js";
import { readFileSync, readdirSync } from "fs";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const discordClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});
// Roles
const adminRoleId = `705094003279790120`;
const academyAdminRoleId = `922364543974395925`;

// Mentions
const nooby = `<@100377761356472320>`;
const dixie = `<@96819678797660160>`;
// User Ids
const bronskyId = 146355018092511233;
const dixieId = 96819678797660160;
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
const fileNameContraband = [
  "pig.gif",
  "gnome-squeeze.gif",
  ...[...Array(21).keys()].map((i) => `take${i}.gif`),
];

// Msg content to watch for
const bugReports = ["bug report", "bugreport"];
const boochieAndMenWarnings = [
  "boochie and men",
  "boochie & men",
  "boochie&men",
  "boochieandmen",
  "booch and men",
  "booch & men",
];
const unlimitedPowerTrigger =
  "tenor.com/view/unlimited-power-star-wars-gif-10270127";

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
  `By decree of the great leader, fix your little bot ${nooby}.`,
  `Comrade ${nooby}, if you must name your bot after our great leader, at least make sure it works.`,
];
const dixiePraiseResponses = [
  `Let us praise our great leader!`,
  `Hallowed be thy name!`,
  `Praise our great leader and his totally clean and not at all gross butthole!`,
];
const antiBoochieAndMenResponses = [
  `I hear Boochie and Men is such a toxic server.`,
  `I wouldn't be caught dead in Boochie and Men`,
  `Boochie and men? You mean that lame server full of weebs?`,
  `Luckily **the Great Council** _cough_ Dixie _cough_ convinced us to keep away from Boochie and Men!`,
  `I sure do love it here in Dixie & Men!`,
  `I hear Boochie and Men is run by a horrbile dicator that uses Gamer words non-stop!`,
  `Say it with me! **Dixie & Men for life!**`,
];

const getRandomResponse = (responses) => {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

const disconnectAllVoiceUsers = (msg) => {
  // Disconnects all users (except dixie) in all voice channels
  return msg.guild.channels.fetch().then((channels) => {
    channels
      .filter((c) => c.type === "GUILD_VOICE")
      .map((vc) => {
        vc.members.map((member) => {
          if (member.id != dixieId) member.voice.disconnect();
        });
      });
  });
};

const demoteAllAdmins = (msg) => {
  // Looks at all members and if they are admins (except dixie), STRIP THEM OF THEIR TITLE!
  return msg.guild.members.fetch().then((members) => {
    members.map((member) => {
      // TODO: find the proper adminRoleId
      if (member._roles.includes(adminRoleId) && member.id != dixieId) {
        member.roles.remove(adminRoleId);
      }
    });
  });
};

const unlimitedPower = async (msg) => {
  if (msg.content.includes(unlimitedPowerTrigger) && msg.author.id == dixieId) {
    await disconnectAllVoiceUsers(msg);
    await demoteAllAdmins(msg);
    msg.reply(`Your power has been executed great leader`);
  }
};

const bullyNooby = (msg) => {
  if (bugReports.some((br) => msg.content.toLowerCase().includes(br))) {
    msg.channel.send(getRandomResponse(noobyBullyResponses));
  }
};

const praiseDixie = (msg) => {
  if (msg.mentions.users.some((user) => user.id == dixieId)) {
    msg.channel.send(getRandomResponse(dixiePraiseResponses));
  }
};

const antiBoochieAndMen = (msg) => {
  if (
    boochieAndMenWarnings.some((bmw) => msg.content.toLowerCase().includes(bmw))
  ) {
    msg.channel.send(getRandomResponse(antiBoochieAndMenResponses));
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
  const pigFileNameMatches = fileNameContraband.some((fnc) =>
    msg.attachments.map((attachment) => attachment.name).includes(fnc)
  );

  const notAllowed =
    pigFileNameMatches ||
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

discordClient.on("messageCreate", async (msg) => {
  // Prevent bot from reacting to itself
  if (msg.author.id === discordClient.user.id) return;

  praiseDixie(msg);
  antiBoochieAndMen(msg);
  findThatPig(msg);
  bullyNooby(msg);

  // TODO: Fix or change the unlimited power feature
  // unlimitedPower(msg);
});

discordClient.login(process.env.TOKEN);
