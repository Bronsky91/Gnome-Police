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
      role.members.map((user) => {
        // Only message if the user isn't in a voice channel already
        if (!user.voice.channelId) {
          // Send user a DM
          user.send(
            `${getRandomText(intros)} it appears that **${
              msg.author.username
            }** is requesting your presence for a HOTS game. ${getRandomText(
              hotsOutros
            )}\nShall I tell them you're attending? (**y**/**n**)`
          );
          // Add them to the current list of players
          hotsWaitList.push(user.user.username);
        }
      });
      currentTimeoutID = clearPlayerListTimeout();
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
    sendMsg(msg, `I'll let them know of your arrival`);
    sendMsgToChannel(
      channelPostedIn,
      `Master ${msg.author.username} will be attending!`
    );
  } else {
    // Denied
    sendMsg(msg, `You don't have to be a dick about it`);
    sendMsgToChannel(
      channelPostedIn,
      `Master ${msg.author.username} has declined.`
    );
  }
};

const hotsPlayerAgreed = (msg) => {};

const hotsPlayerDeclined = (msg) => {};

const removeFromWaitlist = (msg) => {
  const index = hotsWaitList.indexOf(msg?.author?.username);
  if (index > -1) {
    hotsWaitList.splice(index, 1);
  }
};

const clearPlayerListTimeout = () => {
  return setTimeout(() => {
    if (hotsWaitList.length > 0) {
      sendMsgToChannel(
        channelPostedIn,
        `Master${
          hotsWaitList && hotsWaitList.length > 1 ? "s" : ""
        } ${hotsWaitList.join(
          ", "
        )} has yet to respond to the summons, best to queue without them`
      );
    }
    resetState();
  }, 300000);
};

const resetState = () => {
  hotsWaitList = [];
  channelPostedIn = "";
};
