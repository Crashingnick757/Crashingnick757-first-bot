

module.exports = (message) => { // Function with 'message' parameter
let vc = message.member.voiceChannel;


  if (!vc) return console.log("The channel does not exist!");
  vc.join().then(connection => {
    // Yay, it worked!
    console.log("Successfully connected.");
  }).catch(e => {
    // Oh no, it errored! Let's log it to console :)
    console.error(e);
  });
}


