const auth = require('./auth.json');

const prefix = auth.prefix;

module.exports = (message) => { // Function with 'message' parameter

			message.channel.send("NOTE: This feature may not be complete yet.\nprefix: Shows the prefix.\ndevs: Shows a list of the bots devs.\nbalance/bal: shows your balance\nping: Checks the bots ping\ndice_roll <optional number of sides default is 6>: get a random number from 1 to 6 (or the specified number)\njoke: Responds with a random joke").catch((e) => { console.log(e); });

}
