const { SlashCommandBuilder } = require("@discordjs/builders");

const { handleStop } = require("../../scripts/boggle.js");

// import /scripts/boggle.js



module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the current game"),
  async execute(interaction) {
    console.log("Calling handle command");
    handleStop()
  },
};
