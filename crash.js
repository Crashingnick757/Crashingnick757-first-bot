


const auth = require('./auth.json');

const prefix = auth.prefix;

module.exports = (message) => { // Function with 'message' parameter
message.channel.send('Type\n'+prefix+'forcecrash\nto confirm');
}


