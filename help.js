const auth = require('./auth.json');

const prefix = auth.prefix;

module.exports = (message) => { // Function with 'message' parameter

			message.channel.send("NOTE: This feature may not be complete yet.\nprefix: Shows the prefix.\ndevs: Shows a list of programmers.\nbalance: shows your balance\nping: Checks the bots ping\n").catch((e) => { console.log(e); });

}
