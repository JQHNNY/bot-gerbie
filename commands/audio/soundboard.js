const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	VoiceConnectionStatus,
	// AudioPlayerStatus,
	StreamType,
} = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sound')
		.setDescription('Gerbie soundboard')
		.addStringOption(option =>
			option.setName('sound')
				.setDescription('Kies een sound bro')
				.setRequired(true)
				.addChoices(
					{ name: 'Follower', value: 'follower_alert' },
					{ name: 'C4', value: 'c4' },
					{ name: 'Money in da pocket', value: 'donation_alert' },
					{ name: 'OHOHOHO', value: 'ohoho' },
					{ name: 'HELP HELP HELP', value: 'help' },
					{ name: 'AHEM AHEM', value: 'cough.mp3' },
					{ name: 'Gerbie loves WHAT!?', value: 'kawk' },
					{ name: 'Gerbie attack', value: 'yeahHUHUHU' },
					{ name: 'wtf', value: 'wtf' },
					{ name: 'waarom is niemand ooo', value: 'ooh' },
					{ name: 'EYYYYYYYY', value: 'eyy' },
					{ name: 'glizzy', value: 'glizzy' },
				)),

	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceChannel) {
			return interaction.reply('Ga eerst in een voice channel jij monkey');
		}

		const selectedSound = interaction.options.getString('sound');
		const filePath = path.join(__dirname, '..', '..', 'audio', `${selectedSound}.mp3`);

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			return interaction.reply('Die sound bestaat niet bro.');
		}

		let connection;
		try {
			connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
				selfDeaf: false,
			});
			await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
		}
		catch (error) {
			console.error('Failed to connect to voice channel:', error);
			return interaction.reply('Brooo ik kan niet verbinden wa is dees');
		}

		const resource = createAudioResource(fs.createReadStream(filePath), {
			inputType: StreamType.Arbitrary,
		});
		const player = createAudioPlayer();

		player.on('stateChange', (oldState, newState) => {
			console.log(`🎵 Player state changed from ${oldState.status} to ${newState.status}`);
		});

		player.play(resource);
		connection.subscribe(player);

		await interaction.reply(`sound: **${selectedSound}**`);

		// Leave voice channel after sound finishes
		// player.on(AudioPlayerStatus.Idle, () => {
		// 	console.log('Playback finished. Leaving channel.');
		// 	connection.destroy();
		// });
	},
};