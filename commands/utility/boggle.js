const { SlashCommandBuilder } = require("@discordjs/builders");

const { handleStart } = require("../../scripts/boggle.js");

// import /scripts/boggle.js



module.exports = {
  data: new SlashCommandBuilder()
    .setName("boggle")
    .setDescription("Play a game of Boggle!")
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time limit for the game in seconds.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("size")
        .setDescription("The dimension of the board.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("showwords")
        .setDescription("Shows everyone's valid words at the end.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("team")
        .setDescription("Earned points are shared between all players.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("plurals")
        .setDescription(
          "Inputting words with -s or -ed will automatically attempt to add the base word."
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    // console.log("Interaction", interaction);
    // console.log("Options", interaction.options);
    await interaction.reply("Boggle game started!");
    let options = {
      time: interaction.options.getString("time") ?? "120",
      size: interaction.options.getString("size") ?? "4",
      showWords: interaction.options.getString("showwords") === "true" ?? false,
      team: interaction.options.getString("team") === "true" ?? false,
      plurals: interaction.options.getString("plurals") === "true" ?? false,
      interaction,
    };

    
    // console.log("Options", options);
    console.log("Calling handle command");
    handleStart(options);
    console.log("Called handle command");
  },
};
