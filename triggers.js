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
	execute(message, config) { 
		
		function trigger(message, fileType){
			const fileList = fs.readdirSync(`${fileType}/`);
			const triggerIndex = findTrigger(message, fileList)
			
			//Do nothing if it isn't a trigger word
			if(triggerIndex === undefined) return;
	
			switch(fileType){
				case "audio":
					message.member.voice.channel.join().then(musicPlayer => {
						const dispatcher = musicPlayer.play(`${fileType}/${fileList[triggerIndex]}`)
						dispatcher.on('start', () => {});
						dispatcher.on('finish', () => { return; });
						dispatcher.on('error', console.error);
					});
					break;
				case "image":
					message.channel.send({files: [fs.readFileSync(`${fileType}/${fileList[triggerIndex]}`)]});
					break;
				default:
					message.channel.send("Error: invalid file type");
			}
		}

		const findTrigger = (message, fileList) => {
			const args = message.content.toLowerCase().split(" ");
			const triggers = functions.removeFileExtension(fileList)
			
			const triggerCounter = [];
			if(fileList.length > 0){
				for(let i = 0; i < args.length; i++){
					triggers.forEach((r, indexValue) => {
						if (r === args[i])
							triggerCounter.push(indexValue);
					})
				}
			}
			//Prevents additional words/arguments from being picked up
			if (triggerCounter[0] !== undefined) return triggerCounter[0];
			else return undefined
		}

		//Checks if secret room
		functions.checkRoom(message, config)
		.then(r => {
			if (r === undefined)
				trigger(message, "image");
			else
				trigger(message, "audio");	
		})
	},
};