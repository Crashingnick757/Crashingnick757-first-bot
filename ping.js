const auth = require('./auth.json');

const prefix = auth.prefix;

module.exports = (message) => { // Function with 'message' parameter
if(message.content == prefix+"ping"){ // Check if the command is "ping"
			message.channel.send("Pinging ...") // Placeholder for pinging ... 
			.then((msg) => { // Resolve promise
				msg.edit("Ping: " + (Date.now() - msg.createdTimestamp)) // Edits message with current timestamp minus timestamp of message
			});
console.log("\nBot pinging...");		
}
}

