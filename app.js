import dotenv from "dotenv";
import { Client, Intents } from "discord.js";

dotenv.config();

const discordClient = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

// Roles
export const adminRoleId = `705094003279790120`;
// export const HOTS = "1004903824856719430";
// export const HOTS = "1009679972459352104";

// export const intros = [`Pardon me sir,`, `If I may,`];

// export const yourWelcomes = [
//   `But of course, sir`,
//   `Don't mention it`,
//   `Tis my duty`,
//   `I live to serve`,
//   `My pleasure`,
// ];

// export const gotToldOff = [
//   `Very well sir.`,
//   `You're the boss.`,
//   `Of course.`,
//   `My apologies`,
// ];

// export const introductions = [
//   `At your service!`,
//   `I live to serve.`,
//   `How may I help?`,
//   `I'm here`,
//   `You rang?`,
// ];

export const getRandomText = (textArray) => {
  const randomIndex = Math.floor(Math.random() * textArray.length);
  return textArray[randomIndex];
};

export const sendMsg = (msg, text) => {
  msg.channel.send(text);
};

export const sendMsgToChannel = (channelId, text) => {
  discordClient.channels.fetch(channelId).then((channel) => channel.send(text));
};

async function banGoblinhog() {
  try {
    const guilds = discordClient.guilds.cache;
    const dixieAndMen = guilds.find((g) => g.name === "Dixie & Men");

    if (dixieAndMen) {
      const members = await dixieAndMen.members.fetch();
      const goblinhog = members.find((m) => m.user.username === "goblinhog");

      if (goblinhog) {
        await goblinhog.ban({
          reason: "Banned by Gnome Border Patrol. Just following orders.",
        });
        console.log("Successfully banned goblinhog.");
      } else {
        console.log("User 'goblinhog' not found in guild.");
      }
    } else {
      console.log("Guild 'Dixie & Men' not found.");
    }
  } catch (error) {
    console.error("Failed to ban goblinhog:", error);
  }
}

discordClient.on("ready", () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);

  const interval = 300000;

  banGoblinhog();

  setInterval(banGoblinhog, interval);
});

// discordClient.on("ready", () => {
//   console.log(`Logged in as ${discordClient.user.tag}!`);
// });

// discordClient.on("messageCreate", async (msg) => {
//   // Prevent bot from reacting to itself
//   if (msg.author.id === discordClient.user.id) return;

//   // Command switch
//   switch (msg.content.trim().toLowerCase()) {
//     case "!butler":
//       sendMsg(msg, getRandomText(introductions));
//   }

//   // DMS
//   if (msg.channel.type === "DM") {
//     if (userInHotsWaitList(msg)) {
//       hotsPlayerResponded(msg);
//     } else {
//       if (msg.content.toLowerCase().match(/(thanks)|(thx)|(ty)|(thank)/)) {
//         sendMsg(msg, getRandomText(yourWelcomes));
//       }
//       if (msg.content.toLowerCase().match(/(stop)|(fuck)/)) {
//         sendMsg(msg, getRandomText(gotToldOff));
//       }
//     }
//   }

//   // Monitors
//   dmHotsPlayers(msg);
// });

discordClient.login(process.env.DISCORD_BOT_TOKEN);
