//const main = require("./bot.js"); // Requiring main file bot.js

module.exports = (message) => { // Function with 'message' parameter
console.log("\nNo loop");
var VC = message.member.voiceChannel;
        if (!VC)
            return message.reply("MESSAGE IF NOT IN A VOICE CHANNEL")
    VC.join()
        .then(connection => {
            const dispatcher = connection.playFile('./audiofile.m4a');
            dispatcher.on("end", end => {VC.leave()});
        })
        .catch(console.error);
};
