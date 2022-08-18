import dotenv from "dotenv";
import { Client, Intents, Message } from "discord.js";
import { readFileSync, readdirSync } from "fs";
import { Buffer } from "buffer";
import axios from "axios";

dotenv.config();

const discordClient = new Client({
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

// Roles
const adminRoleId = `705094003279790120`;
const HOTS = "1004903824856719430";

const intros = [`Pardon me sir,`];

const hotsOutros = [
  `_Let the self hatred commence!_`,
  `_Wouldn't be my choice..._`,
  `_ARAM again I'm sure_`,
  `_Don't forget to update._`,
];

const yourWelcomes = [
  `But of course, sir`,
  `Don't mention it`,
  `Tis my duty`,
  `I live to serve`,
  `My pleasure`,
];

const introductions = [
  `At your service!`,
  `I live to serve.`,
  `How may I help?`,
  `I'm here`,
  `You rang?`,
];

const getRandomText = (textArray) => {
  const randomIndex = Math.floor(Math.random() * textArray.length);
  return textArray[randomIndex];
};

const sendMsg = (msg, text) => {
  msg.channel.send(text);
};

const dmHotsPlayers = async (msg) => {
  if (msg.mentions.roles.map((r) => r.id).includes(HOTS)) {
    try {
      const role = await msg.guild.roles.fetch(HOTS);
      role.members.map((user) => {
        if (!user.voice.channelId) {
          user.send(
            `${getRandomText(intros)} it appears that **${
              msg.author.username
            }** is requesting your presence for a HOTS game. ${getRandomText(
              hotsOutros
            )}`
          );
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
};

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on("messageCreate", async (msg) => {
  // Prevent bot from reacting to itself
  if (msg.author.id === discordClient.user.id) return;

  // Command switch
  switch (msg.content.trim().toLowerCase()) {
    case "!butler":
      sendMsg(msg, getRandomText(introductions));
  }

  // Thank you DMS
  if (
    msg.channel.type === "DM" &&
    msg.content.toLowerCase().match(/(thanks)|(thx)|(ty)|(thank)/)
  ) {
    sendMsg(msg, getRandomText(yourWelcomes));
  }

  // Monitors
  dmHotsPlayers(msg);
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);
