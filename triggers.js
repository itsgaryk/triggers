const fs = require('fs');
const functions = require("./functions.js")

//OpusEncoder for voice
const {OpusEncoder} = require('@discordjs/opus');
const trigger = require('./commands/trigger.js');
// Specify 48kHz sampling rate and 2 channel size.
const encoder = new OpusEncoder(48000, 2);

// Encode and decode.
//const encoded = encoder.encode(buffer);
//const decoded = encoder.decode(encoded);

module.exports = {
	execute(message, config, args) { 

		const checkRoom = async (message, config) => {
			const fileType = await functions.postedInRoom(message, config);
			return fileType;
		}

		const getTrigger = (fileList, args) => {			
			const triggerCounter = [];
			if(fileList.length > 0){
				for(let i = 0; i < args.length; i++){
					fileList.forEach((r, indexValue) => {
						if (functions.removeFileExtension(r) === args[i].toLowerCase())
							triggerCounter.push(fileList[indexValue]);
					})
				}
			}
			if (triggerCounter[0] === undefined) return undefined
			else return triggerCounter[0];
		}

		const imageTrigger = (message, file) => {
			message.channel.send({files:[fs.realpathSync(`image/${file}`)]});
		}

		const audioTrigger = (message, file) => {
			message.member.voice.channel.join()
			.then(musicPlayer => {
				const dispatcher = musicPlayer.play(`audio/${file}`)
				dispatcher.on('start', () => {});
				dispatcher.on('finish', () => { return; });
				dispatcher.on('error', console.error);
			})
		}

		checkRoom(message, config)
		.then(fileType => {
			
			const args = message.content.split(/ +/);

			const fileList = fs.readdirSync(`${fileType}/`);
			const fileName = getTrigger(fileList, args);

			if(fileName === undefined) return;
	
			switch(fileType){
				case "image":
					imageTrigger(message, fileName);
					break;
				case "audio":
					audioTrigger(message, fileName);
					break;
				default:
					return;
			}
		})
	},
};