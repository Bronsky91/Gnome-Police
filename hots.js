import {
  getRandomText,
  HOTS,
  intros,
  sendMsg,
  sendMsgToChannel,
} from "./app.js";

const hotsOutros = [
  `_Let the self hatred commence!_`,
  `_Wouldn't be my choice..._`,
  `_ARAM again I'm sure_`,
  `_Don't forget to update._`,
];

let channelPostedIn;
let hotsWaitList = [];
let currentTimeoutID;

export const userInHotsWaitList = (msg) => {
  return hotsWaitList.includes(msg?.author?.username);
};

export const dmHotsPlayers = async (msg) => {
  if (msg.mentions.roles.map((r) => r.id).includes(HOTS)) {
    // Remove the current timeout to make sure it's not running if the command is run again before it's timed out
    if (currentTimeoutID) clearTimeout(currentTimeoutID);
    // Reset state each new command
    resetState();
    // Save channelID it was posted in
    channelPostedIn = msg.channelId;
    try {
      const role = await msg.guild.roles.fetch(HOTS);
      role.members.map((member) => {
        // Only message if the member isn't in a voice channel already
        if (!member.voice.channelId) {
          // Send member a DM
          member.send(
            `${getRandomText(intros)} it appears that **${
              msg.author.username
            }** is requesting your presence for a HOTS game. ${getRandomText(
              hotsOutros
            )}\nShall I tell them you're attending? (**y**/**n**)`
          );
          // Add them to the current list of players
          hotsWaitList.push(member.user.username);
        }
      });
      currentTimeoutID = clearPlayerListTimeout(role.members);
    } catch (err) {
      console.error(err);
    }
  }
};

export const hotsPlayerResponded = (msg) => {
  // Remove from waitlist once responded
  removeFromWaitlist(msg);
  if (
    msg.content.toLowerCase() === "y" ||
    msg.content.toLowerCase().match(/(yes)|(ya)|(yeah)/)
  ) {
    // Confirmed
    hotsPlayerAgreed(msg);
  } else {
    // Denied
    hotsPlayerDeclined(msg);
  }
};

const hotsPlayerAgreed = (msg) => {
  sendMsg(msg, `I'll let them know of your arrival`);
  sendMsgToChannel(
    channelPostedIn,
    `**${msg.author.username}** will be attending!`
  );
};

const hotsPlayerDeclined = (msg) => {
  sendMsg(msg, `You don't have to be a dick about it`);
  sendMsgToChannel(channelPostedIn, `**${msg.author.username}** has declined.`);
};

const removeFromWaitlist = (msg) => {
  const index = hotsWaitList.indexOf(msg?.author?.username);
  if (index > -1) {
    hotsWaitList.splice(index, 1);
  }
};

const clearPlayerListTimeout = (users) => {
  return setTimeout(() => {
    if (hotsWaitList.length > 0) {
      sendMsgToChannel(
        channelPostedIn,
        `**${hotsWaitList.join(
          ", "
        )}** has yet to respond to the summons, best to queue without them`
      );
      users.map((member) => {
        if (
          !member.voice.channelId &&
          hotsWaitList.includes(member.user.username)
        ) {
          // Send user a DM
          member.send(
            `It's been a while, I'll let them know you won't be attending this HOTS game. _It's for the best really_`
          );
        }
      });
    }
    resetState();
  }, 300000);
};

const resetState = () => {
  hotsWaitList = [];
  channelPostedIn = "";
};
