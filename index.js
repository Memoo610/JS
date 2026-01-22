const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// General Embed for Actions
function createGeneralEmbedofActions(typeOfAction, description, roleOfIssuer, color = "#00008B") {
  return new EmbedBuilder()
    .setTitle(typeOfAction)
    .setDescription(description)
    .setFooter({ text: `By ${roleOfIssuer}` })
    .setColor(color)
    .setTimestamp();
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Activity list
  const activities = [
    "Buckingham leaks",
    "Volute LTD.",
    "PSD",
    "SPA",
    "Ombudsmen",
    "Your leaks"
  ];

  // Function to set random activity
  const setRandomActivity = () => {
    try {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      client.user.setPresence({
        activities: [{ 
          name: randomActivity, 
          type: "WATCHING"
        }],
        status: "dnd"
      });
      console.log(`Activity changed to: ${randomActivity}`);
    } catch (error) {
      console.error("Failed to set activity:", error);
    }
  };

  // Set initial activity after a short delay
  setTimeout(setRandomActivity, 1000);

  // Change activity every 1 minute
  setInterval(setRandomActivity, 60000);

  // Register commands
  client.application.commands.set([{
    name: "blacklist",
    description: "Add a member to the blacklist",
    options: [
      {
        name: "member",
        description: "The member to blacklist",
        type: 9,
        required: true
      },
      {
        name: "reason",
        description: "Reason for blacklisting",
        type: 3,
        required: true
      },
      {
        name: "ban_from_server",
        description: "Should the member be banned from the server?",
        type: 5,
        required: true
      }
    ]
  },
  {
    name: "leak",
    description: "Submit a new leak document",
    options: [
      {
        name: "name",
        description: "Name of the document",
        type: 3,
        required: true
      },
      {
        name: "description",
        description: "Description of the leak",
        type: 3,
        required: true
      },
      {
        name: "link",
        description: "Google Docs link",
        type: 3,
        required: true
      },
      {
        name: "color",
        description: "Embed color (red, yellow, blue, etc.)",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "removecooldown",
    description: "Remove leak cooldown from a user (Admin only)",
    options: [
      {
        name: "user",
        description: "The user to remove cooldown from",
        type: 9,
        required: true
      }
    ]
  },
  {
    name: "inactivity",
    description: "Action against an inactive member",
    options: [
      {
        name: "member",
        description: "The member to action",
        type: 9,
        required: true
      },
      {
        name: "kick",
        description: "Should the member be kicked?",
        type: 5,
        required: true
      },
      {
        name: "send_notice",
        description: "Should a notice be sent?",
        type: 5,
        required: true
      }
    ]
  },
  {
    name: "leakerbenefits",
    description: "Give benefits to a leaker",
    options: [
      {
        name: "member",
        description: "The leaker member",
        type: 9,
        required: true
      },
      {
        name: "send_message",
        description: "Should a DM be sent?",
        type: 5,
        required: true
      },
      {
        name: "robuxtext",
        description: "Include robux payment text?",
        type: 5,
        required: true
      },
      {
        name: "staffmsg",
        description: "Additional staff message (optional)",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "requestpayment",
    description: "Request robux payment (DM only)",
    options: [
      {
        name: "robloxusername",
        description: "Your Roblox username",
        type: 3,
        required: true
      },
      {
        name: "are_you_sure",
        description: "Are you sure you are in our roblox group?",
        type: 5,
        required: true
      }
    ]
  },
  {
    name: "membersubmitleak",
    description: "Submit a leak for approval (Members only)",
    options: [
      {
        name: "leaktext",
        description: "The leak content/text",
        type: 3,
        required: true
      },
      {
        name: "choicefrom",
        description: "Type of leak",
        type: 3,
        required: true,
        choices: [
          { name: "LAS", value: "LAS" },
          { name: "RG", value: "RG" },
          { name: "MPS", value: "MPS" },
          { name: "BP", value: "BP" }
        ]
      }
    ]
  }]).catch(console.error);
});

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "blacklist") {
        if (!interaction.member.permissions.has("BAN_MEMBERS")) {
          return interaction.reply({ content: "You don't have permission to use this command!", flags: [] });
        }

        const member = interaction.options.getMentionable("member");
        const reason = interaction.options.getString("reason");
        const banFromServer = interaction.options.getBoolean("ban_from_server");

        try {
          const channel = await client.channels.fetch("1461038411661054290");
          const message = await channel.messages.fetch("1464031169602654433");

          let nickname = "Error";
          try {
            const guildMember = await interaction.guild.members.fetch(member.id);
            nickname = guildMember.nickname || member.username;
          } catch {
            nickname = "Error";
          }

          const username = member.username || "Unknown";
          const newLine = `- ${member}, ${username} (${nickname}) | ${reason}, Is-banned: ${banFromServer} | By ${interaction.user}`;

          const updatedContent = message.content + "\n" + newLine;
          await message.edit(updatedContent);

          if (banFromServer) {
            await interaction.guild.members.ban(member, { reason: reason });
            interaction.reply({ content: `${member} has been blacklisted and banned from the server. Reason: ${reason}`, flags: [] });
          } else {
            interaction.reply({ content: `${member} has been blacklisted. Reason: ${reason}`, flags: [] });
          }
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to blacklist the member.", flags: [] });
        }
      }

      if (interaction.commandName === "leak") {
        if (!interaction.member.permissions.has("BAN_MEMBERS")) {
          return interaction.reply({ content: "You don't have permission to use this command!", flags: [] });
        }

        const name = interaction.options.getString("name");
        const description = interaction.options.getString("description");
        const link = interaction.options.getString("link");
        const color = interaction.options.getString("color") || "Blue";

        if (!link.includes("docs.google.com")) {
          return interaction.reply({ content: "The link must be a Google Docs link!", flags: [] });
        }

        const userId = interaction.user.id;
        const cooldownFilePath = path.join(__dirname, "newleaks.js");

        try {
          let cooldowns = {};
          if (fs.existsSync(cooldownFilePath)) {
            const fileContent = fs.readFileSync(cooldownFilePath, "utf8");
            if (fileContent.trim()) {
              cooldowns = JSON.parse(fileContent);
            }
          }

          if (cooldowns[userId]) {
            const cooldownTime = cooldowns[userId];
            const now = Date.now();
            if (now < cooldownTime) {
              const remainingTime = Math.ceil((cooldownTime - now) / 1000 / 60);
              return interaction.reply({ content: `You have a cooldown! Please wait ${remainingTime} minutes.`, flags: [] });
            }
          }

          cooldowns[userId] = Date.now() + (5 * 60 * 60 * 1000);
          fs.writeFileSync(cooldownFilePath, JSON.stringify(cooldowns, null, 2));

          let roleName = "";
          if (interaction.member.roles.cache.size > 1) {
            const roles = interaction.member.roles.cache
              .filter(role => role.name !== "@everyone")
              .sort((a, b) => b.position - a.position);
            roleName = roles.first()?.name || "";
          }

          const embedColor = {
            red: "#8B0000",
            yellow: "#B8860B",
            blue: "#00008B",
            green: "#006400",
            purple: "#4B0082",
            orange: "#8B4513",
            pink: "#8B3A62",
            black: "#1a1a1a",
            white: "#808080"
          };

          const colorHex = embedColor[color.toLowerCase()] || "#00008B";

          const embed = new EmbedBuilder()
            .setTitle("New leak!")
            .setDescription(`We have leaked the ${name} in Buckingham palace\nLink :\n${link}`)
            .setColor(colorHex)
            .setTimestamp();

          const leaksChannel = await client.channels.fetch("1464008512341540946");
          await leaksChannel.send({ content: "@everyone", embeds: [embed] });

          interaction.reply({ content: `Leak "${name}" submitted successfully!`, flags: [] });
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to submit the leak.", flags: [] });
        }
      }

      if (interaction.commandName === "removecooldown") {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
          return interaction.reply({ content: "You don't have permission to use this command!", flags: [] });
        }

        const user = interaction.options.getMentionable("user");
        const userId = user.id;
        const cooldownFilePath = path.join(__dirname, "newleaks.js");

        try {
          let cooldowns = {};
          if (fs.existsSync(cooldownFilePath)) {
            const fileContent = fs.readFileSync(cooldownFilePath, "utf8");
            if (fileContent.trim()) {
              cooldowns = JSON.parse(fileContent);
            }
          }

          if (cooldowns[userId]) {
            delete cooldowns[userId];
            fs.writeFileSync(cooldownFilePath, JSON.stringify(cooldowns, null, 2));
            interaction.reply({ content: `Cooldown removed for ${user}!`, flags: [] });
          } else {
            interaction.reply({ content: `${user} doesn't have an active cooldown.`, flags: [] });
          }
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to remove the cooldown.", flags: [] });
        }
      }

      if (interaction.commandName === "inactivity") {
        if (!interaction.member.permissions.has("KICK_MEMBERS")) {
          return interaction.reply({ content: "You don't have permission to use this command!", flags: [] });
        }

        const member = interaction.options.getMentionable("member");
        const shouldKick = interaction.options.getBoolean("kick");
        const sendNotice = interaction.options.getBoolean("send_notice");
        const issuerRole = interaction.member.roles.highest.name;

        try {
          if (sendNotice) {
            const noticeEmbed = createGeneralEmbedofActions(
              "Inactivity Notice",
              "You have been punished for inactivity",
              issuerRole,
              "#FFA500"
            );
            
            try {
              await member.send({ embeds: [noticeEmbed] });
            } catch {
              console.log("Could not send DM to member");
            }
          }

          if (shouldKick) {
            await interaction.guild.members.kick(member, { reason: "Inactivity" });
          }

          interaction.reply({ content: `Action taken against ${member}`, flags: [] });
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to action the member.", flags: [] });
        }
      }

      if (interaction.commandName === "leakerbenefits") {
        const member = interaction.options.getMentionable("member");
        const sendMessage = interaction.options.getBoolean("send_message");
        const robuxText = interaction.options.getBoolean("robuxtext");
        const staffMsg = interaction.options.getString("staffmsg") || "";

        try {
          let benefitMessage = `# Thank you for sending the leak!\nThank you for submitting your leak. It has been approved by staff. And you will recieve the following benefit/s:\n- Leaker role.\n`;
          
          if (robuxText) {
            benefitMessage += `- Some robux if you request it in time. which is 3 days. Which you request by /requestpayment!\n`;
          }
          
          if (staffMsg) {
            benefitMessage += `${staffMsg}\n`;
          }
          
          benefitMessage += `-# By LeakShield.`;

          if (sendMessage) {
            try {
              await member.send(benefitMessage);
            } catch {
              return interaction.reply({ content: "Could not send DM to member.", flags: [] });
            }
          }

          const leakerRole = interaction.guild.roles.cache.get("1445532405900251146");
          if (leakerRole) {
            await member.roles.add(leakerRole);
          }

          const leakerBenefitsPath = path.join(__dirname, "leakerbenifits.js");
          let leakerData = {};
          if (fs.existsSync(leakerBenefitsPath)) {
            const fileContent = fs.readFileSync(leakerBenefitsPath, "utf8");
            if (fileContent.trim()) {
              leakerData = JSON.parse(fileContent);
            }
          }

          leakerData[member.id] = {
            memberId: member.id,
            memberTag: member.user.tag,
            timestamp: Date.now(),
            issuedBy: interaction.user.id,
            issuedByTag: interaction.user.tag,
            robuxEligible: robuxText,
            hasSentRequestPayment: false
          };

          fs.writeFileSync(leakerBenefitsPath, JSON.stringify(leakerData, null, 2));

          interaction.reply({ content: `Leaker benefits given to ${member}!`, flags: [] });
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to give leaker benefits.", flags: [] });
        }
      }

      if (interaction.commandName === "requestpayment") {
        if (interaction.guild) {
          return interaction.reply({ content: "This command can only be used in DMs!", flags: [] });
        }

        const robloxUsername = interaction.options.getString("robloxusername");
        const areYouSure = interaction.options.getBoolean("are_you_sure");

        if (!areYouSure) {
          return interaction.reply({ content: "You must confirm that you are in our roblox group!", flags: [] });
        }

        try {
          const userId = interaction.user.id;
          const leakerBenefitsPath = path.join(__dirname, "leakerbenifits.js");

          let leakerData = {};
          if (fs.existsSync(leakerBenefitsPath)) {
            const fileContent = fs.readFileSync(leakerBenefitsPath, "utf8");
            if (fileContent.trim()) {
              leakerData = JSON.parse(fileContent);
            }
          }

          if (!leakerData[userId]) {
            return interaction.reply({ content: "You don't have leaker benefits issued to you!", flags: [] });
          }

          const benefitData = leakerData[userId];

          if (!benefitData.robuxEligible) {
            return interaction.reply({ content: "You are not eligible for robux payment!", flags: [] });
          }

          const timeSinceIssued = Date.now() - benefitData.timestamp;
          const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

          if (timeSinceIssued > threeDaysMs) {
            return interaction.reply({ content: "Your robux payment has expired! (3 days have passed)", flags: [] });
          }

          benefitData.hasSentRequestPayment = true;
          fs.writeFileSync(leakerBenefitsPath, JSON.stringify(leakerData, null, 2));

          const issuer = await client.users.fetch(benefitData.issuedBy);
          try {
            await issuer.send(`${interaction.user.username} has submitted a robux payment request. Please wait while staff processes it.`);
          } catch {
            console.log("Could not send DM to issuer");
          }

          const owner = await client.users.fetch("1424111016450592879");
          const issuedDate = new Date(benefitData.timestamp).toLocaleString();
          const paymentEmbed = new EmbedBuilder()
            .setTitle("Robux Payment Request")
            .setDescription(`A new robux payment request has been submitted!`)
            .addFields(
              { name: "Discord Username", value: interaction.user.username, inline: true },
              { name: "Discord Tag", value: interaction.user.tag, inline: true },
              { name: "Roblox Username", value: robloxUsername, inline: true },
              { name: "Benefits Issued", value: issuedDate, inline: true },
              { name: "Issued By", value: benefitData.issuedByTag, inline: true }
            )
            .setColor("#00FF00")
            .setTimestamp();

          try {
            await owner.send({ embeds: [paymentEmbed] });
          } catch {
            console.log("Could not send DM to owner");
          }

          interaction.reply({ content: "Your payment request has been submitted! Please wait while staff processes it.", flags: [] });
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to process payment request.", flags: [] });
        }
      }

      if (interaction.commandName === "membersubmitleak") {
        const leakText = interaction.options.getString("leaktext");
        const choiceFrom = interaction.options.getString("choicefrom");
        const userId = interaction.user.id;
        const memberLeaksPath = path.join(__dirname, "memberleaks.js");

        try {
          let memberLeaks = {};
          if (fs.existsSync(memberLeaksPath)) {
            const fileContent = fs.readFileSync(memberLeaksPath, "utf8");
            if (fileContent.trim()) {
              memberLeaks = JSON.parse(fileContent);
            }
          }

          if (memberLeaks[userId]) {
            const cooldownData = memberLeaks[userId];
            if (cooldownData.cooldownUntil && Date.now() < cooldownData.cooldownUntil) {
              const remainingTime = Math.ceil((cooldownData.cooldownUntil - Date.now()) / 1000 / 60);
              return interaction.reply({ content: `You have a cooldown! Please wait ${remainingTime} minutes.`, flags: [] });
            }
          }

          if (!memberLeaks[userId]) {
            memberLeaks[userId] = {};
          }
          memberLeaks[userId].cooldownUntil = Date.now() + (5 * 60 * 60 * 1000);
          memberLeaks[userId].lastSubmission = leakText;
          memberLeaks[userId].lastType = choiceFrom;
          memberLeaks[userId].lastSubmissionTime = Date.now();
          memberLeaks[userId].status = "pending";

          fs.writeFileSync(memberLeaksPath, JSON.stringify(memberLeaks, null, 2));

          const owner = await client.users.fetch("1424111016450592879");

          const buttons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`deny_${userId}_${Date.now()}`)
                .setLabel("Deny")
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId(`approve_${userId}_${Date.now()}`)
                .setLabel("Approve")
                .setStyle(ButtonStyle.Success)
            );

          const submissionEmbed = new EmbedBuilder()
            .setTitle("New Member Leak Submission")
            .setDescription(`**Type:** ${choiceFrom}\n\n**Leak Content:**\n${leakText}`)
            .setFooter({ text: `Submitted by ${interaction.user.tag} (${userId})` })
            .setColor("#FFA500")
            .setTimestamp();

          await owner.send({ embeds: [submissionEmbed], components: [buttons] });

          interaction.reply({ content: "Your leak submission has been sent for review!", flags: [] });
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to submit leak.", flags: [] });
        }
      }
    }

    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId.startsWith("deny_")) {
        const parts = customId.split("_");
        const userId = parts[1];

        try {
          const modal = new ModalBuilder()
            .setCustomId(`denyReason_${userId}`)
            .setTitle("Denial Reason");

          const reasonInput = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Why are you denying this leak?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
          await interaction.showModal(modal);
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to show denial form.", flags: [] });
        }
      }

      if (customId.startsWith("approve_")) {
        const parts = customId.split("_");
        const userId = parts[1];

        try {
          const memberLeaksPath = path.join(__dirname, "memberleaks.js");
          let memberLeaks = {};
          if (fs.existsSync(memberLeaksPath)) {
            const fileContent = fs.readFileSync(memberLeaksPath, "utf8");
            if (fileContent.trim()) {
              memberLeaks = JSON.parse(fileContent);
            }
          }

          if (memberLeaks[userId]) {
            memberLeaks[userId].status = "approved";
            memberLeaks[userId].approvalTime = Date.now();
            fs.writeFileSync(memberLeaksPath, JSON.stringify(memberLeaks, null, 2));
          }

          interaction.reply({ content: `Leak from <@${userId}> has been approved!`, flags: [] });
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to approve leak.", flags: [] });
        }
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("denyReason_")) {
        const userId = interaction.customId.split("_")[1];
        const reason = interaction.fields.getTextInputValue("reason");

        try {
          const memberLeaksPath = path.join(__dirname, "memberleaks.js");
          let memberLeaks = {};
          if (fs.existsSync(memberLeaksPath)) {
            const fileContent = fs.readFileSync(memberLeaksPath, "utf8");
            if (fileContent.trim()) {
              memberLeaks = JSON.parse(fileContent);
            }
          }

          if (memberLeaks[userId]) {
            memberLeaks[userId].status = "denied";
            memberLeaks[userId].denialReason = reason;
            memberLeaks[userId].denialTime = Date.now();
            fs.writeFileSync(memberLeaksPath, JSON.stringify(memberLeaks, null, 2));
          }

          const member = await client.users.fetch(userId);
          const denyEmbed = createGeneralEmbedofActions(
            "Leak Denied",
            `Your leak submission has been denied.\n\n**Reason:** ${reason}`,
            "Staff",
            "#FF0000"
          );

          try {
            await member.send({ embeds: [denyEmbed] });
          } catch {
            console.log("Could not send DM to member");
          }

          interaction.reply({ content: `Leak from <@${userId}> has been denied!`, flags: [] });
        } catch (error) {
          console.error(error);
          interaction.reply({ content: "Failed to deny leak.", flags: [] });
        }
      }
    }
  } catch (error) {
    console.error("Interaction error:", error);
  }
});

client.login(process.env.TOKEN);
