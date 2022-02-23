const { changeAuthData } = require('../flowscripts/write_data.js');
const { Permissions, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
/*
    args[0] == NFT/FT/find
    args[1] == contract name
    args[2] == contract address
    args[3] == # of token
    args[4] == public path
    args[5] == discord role
    args[6] == optional link
*/
const execute = async (message, args) => {
    if (message.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
        console.log("Person is setting up a verification.");
        if ((args.length === 6 || args.length === 7) && (!isNaN(args[3])) && (args[0] === 'NFT' || args[0] === 'FT')) {
            let role = message.guild.roles.cache.find(role => role.name === args[5]);
            if (!role) {
                message.channel.send("This role does not exist!");
                return;
            }

            let guildId = message.guild.id
            let tokenType = args[0];
            let contractName = args[1];
            let contractAddress = args[2];
            let number = args[3];
            let path = args[4];
            let network = "mainnet";
            let url = (args.length === 7) ? args[6] : "";

            let setupResult = await changeAuthData(guildId, tokenType, contractName, contractAddress, number, path, role.id, url, network);
            if (!setupResult) {
                message.channel.send("The setup failed.");
                return;
            }

            postEmeraldIDVerifier(message, role.id);
        } else if (args.length === 2) {
            console.log("Setting up", args[0]);
            let role = message.guild.roles.cache.find(role => role.name === args[1]);
            if (!role) {
                message.channel.send("This role does not exist!");
                return;
            }

            /* TOPSHOT SPECIFIC */
            let number = args[0] === 'CoolCatsTotal' ? 3 : args[0] === 'CoolCatsUnique' ? 30 : 1;

            /* GENERAL */
            let setupResult = await changeAuthData(message.guild.id, args[0], "", "0x097bafa4e0b48eef", number, "", role.id, "", "mainnet");
            if (!setupResult) {
                message.channel.send("The setup failed.");
                return;
            }

            postEmeraldIDVerifier(message, role.id);

        } else {
            message.channel.send("You did not supply the correct number of arguments. `!setup [NFT/FT] [contract name] [contract address] [number of tokens] [public path] [role name] [OPTIONAL: link to the minting site]`")
        }
    } else {
        console.log("You do not have permissions to do this.")
    }
}

const postEmeraldIDVerifier = (message, roleID) => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(`mainnetemeraldid-${roleID}`)
                .setLabel('Verify')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setURL('https://pedantic-darwin-e512ad.netlify.app/resetEmeraldID')
                .setLabel('Reset')
                .setStyle('LINK'),
            new MessageButton()
                .setURL('https://emeraldcity.gitbook.io/emerald-city/building-guild/emerald-bot')
                .setLabel('Docs')
                .setStyle('LINK')
        );

    const embed = new MessageEmbed()
        .setColor('#5bc595')
        .setTitle('Verify with your EmeraldID')
        .setAuthor('Emerald City', 'https://i.imgur.com/YbmTuuW.png', 'https://discord.gg/emeraldcity')
        .setDescription('Click the `Verify` button below to get the ' + `<@&${roleID}>` + ' role with your EmeraldID.')
        .setThumbnail('https://i.imgur.com/UgE8FJl.png');

    message.channel.send({ ephemeral: true, embeds: [embed], components: [row] }).catch(e => console.log(e));
}

module.exports = {
    name: 'setup',
    description: 'setup a role verification with emeraldid',
    execute: execute,
    postEmeraldIDVerifier
}

