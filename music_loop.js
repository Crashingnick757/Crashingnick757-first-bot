//const main = require("./bot.js"); // Requiring main file bot.js

module.exports = (message) => { // Function with 'message' parameter
console.log("Loop");
var vc = message.member.voiceChannel;

vc.join().then(connection => {

    function play (connection) {
        
        const dispatcher = connection.playFile('./audiofile.m4a')
           dispatcher.on('end', () => { 
    play(connection);
});
    }

})
.catch(console.error);
};
