const mongoose = require("mongoose");
const users = require("../models/users");
const { MessageEmbed } = require("discord.js");

module.exports = {
  description: `Saves and Displays a user's current section in the course`,
  category: "Section",
  slash: "both",
  testOnly: true,
  guildOnly: true,

  options: [
    {
      type: "SUB_COMMAND",
      name: "save",
      description: "Save a user's progress(Only accepts numbers)",
      options: [
        {
          name: "section_num",
          type: "NUMBER",
          description: "Your current section",
          required: true,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "show",
      description: "Shows your section progress in the course",
    },
    {
      type: "SUB_COMMAND",
      name: "showall",
      description: "Shows everyone's progress",
    },
  ],
  callback: async ({ interaction }) => {
    const subCommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const sectionNum = interaction.options.getNumber("section_num");
    const member = interaction.member.id;
    const memberName = interaction.member.user;
    const avatar = interaction.user;

    if (subCommand === "save") {
      const search = await users.find({ discordId: member });
      if (search.length === 0) {
        try {
          await users.create({
            discordId: member,
            section: sectionNum,
            discordName: memberName,
          });
          return {
            custom: true,
            content: `Successfully Updated! Use /sections to show your progress or use /sections showall to view everyone's.`,
            allowedMentions: {
              users: [],
            },
          };
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          await users.findOneAndUpdate({
            discordId: member,
            section: sectionNum,
          });
          return {
            custom: true,
            content: `Successfully Updated! Use /sections to show your progress or use /sections showall to view everyone's.`,
          };
        } catch (error) {
          console.log(error);
        }
      }
    }
    if (subCommand === "show") {
      if (!user?.id) {
        const progress = await users.find({ discordId: member });
        if (progress.length === 0) {
          return {
            custom: true,
            content: `You haven't saved your progress yet. Please use /sections save.`,
          };
        } else {
          const { section } = progress[0];
          try {
            const embed = new MessageEmbed({
              description: `Your Current Section: ${section}`,
            })
              .setColor(0xba55d3)
              .setImage(avatar.displayAvatarURL());
            return embed;
          } catch (error) {
            return {
              custom: true,
              content: `Sorry Something went wrong`,
            };
          }
        }
      }
    }

    if (subCommand === "showall") {
      let progress = await users.find();
      let description = `Everyone's Current Progress\n\n`;
      for (const prog of progress) {
        description += `**ID:** ${prog.discordId}\n`;
        description += `**Name:** <@${prog.discordName}>\n`;
        description += `**Section:** ${prog.section}\n\n`;
      }
      const embed = new MessageEmbed()
        .setDescription(description)
        .setColor(0xba55d3);

      return embed;
    }
  },
};
