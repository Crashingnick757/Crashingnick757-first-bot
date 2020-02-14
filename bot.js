
console.log("\nBot loading...\n");

const Discord = require("discord.js"); // Requires the npm package 'discord.js'.
const logger = require('winston');
const ytdl = require('ytdl-core');

//const avatar = './yeet.png'
const auth = require('./auth.json'); //Token and prefix
const devs = require("./devs.json"); //Dev list file
const youtubers = require("./youtubers.json"); //Youtuber list file
const YT_links = require("./YT_links.json"); //Youtuber links file
const Sequelize = require('sequelize');

const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();

const ping = require("./ping.js"); // Requiring module ping.js
const help = require("./help.js"); // Requiring module help.js
const crash = require("./crash.js"); //Requiring module crash.js
const music_choices = require("./music_choices.js"); //Requiring module music_choices.js
const channeljoin = require("./channel"); //Requiring module channel.js
const music_loop = require("./music_loop.js"); //Requiring module music_loop.js
const music = require("./music.js"); //Requiring module Music.js

const dev_list = devs.dev_list;
const youtuber_list = youtubers.list;
const YT_list = YT_links.list;
const prefix = auth.prefix;
const PREFIX = prefix;

const array_reset = [];

var current_song = 0;

var queue = [];

var currentVC = [];

var loop = false;

var music_ready = true;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const jokes = [
'The homework assignment for my Spanish class was to write a paragraph. When I returned their papers, I asked one student if he had used Google Translate or any other online translator to write his paper. He categorically denied doing so. That led to my next question: “Then why is this in French?”',
'Upon finding a clearly plagiarized paper, I called the student into my office. Pointing to my computer screen, I said, “I found your entire paper online. Do you have anything you want to say about that?”\n Her angry response: “Well, I paid my sister to write it, but I didn’t think she’d plagiarize!”',
'I was describing my job as an engineer to some middle schoolers when I mentioned that “one of my colleagues and I designed a medical instrument for measuring human muscle tone.”\nLater, I added, “another colleague and I designed a system to allow merchants to print coupons at the cash register.” Thinking that all this technical talk was confusing, I asked if there were any questions.\nThere was one: “What’s a colleague?”',
'I’m known as a stickler for good spelling. So when an associate e-mailed technical documents and asked me to “decifer” them, I had to set him straight.\n“Decipher is spelled with a ph, not an f,” I wrote. “In case you’ve forgotten, spellchecker comes free with your Microsoft program.”\nA minute later came his reply: “Must be dephective.”',
'At the Christmas Eve service at my church, the pastor, quizzing some children about the nativity, asked, “What gifts did the three wise men give the Christ child?”\n“Gold!” one child yelled.“Frankincense!” shouted another. After a pause, a third asked, “Gift cards?”',
'Q: What do you call a lazy baby kangaroo?\nA: A pouch potato.',
'Q: Why shouldn’t you visit an expensive wig shop?\nA: It’s too high a price ‘toupee.’'
];

const client = new Discord.Client(); 

client.user.setActivity('In testing');

Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

client.once('ready', async () => {
	const storedBalances = await Users.findAll();
storedBalances.forEach(b => currency.set(b.user_id, b));

	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	if (message.author.bot) return;
	currency.add(message.author.id, 1);

	if (!message.content.startsWith(prefix)) return;
	const input = message.content.slice(prefix.length).trim();
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

	if (command === 'balance') {
		const target = message.mentions.users.first() || message.author;
return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)}💰`);

	} else if (command === 'bal') {
		const target = message.mentions.users.first() || message.author;
return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)}💰`);

	} else if (command === 'inventory') {
const target = message.mentions.users.first() || message.author;
const user = await Users.findOne({ where: { user_id: target.id } });
const items = await user.getItems();

if (!items.length) return message.channel.send(`${target.tag} has nothing!`);
return message.channel.send(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
	} else if (command === 'transfer') {

const currentAmount = currency.getBalance(message.author.id);
const transferAmount = commandArgs.split(/ +/g).find(arg => !/<@!?\d+>/g.test(arg));
const transferTarget = message.mentions.users.first();

if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount.`);
if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author}, you only have ${currentAmount}.`);
if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}.`);

currency.add(message.author.id, -transferAmount);
currency.add(transferTarget.id, transferAmount);

return message.channel.send(`Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your current balance is ${currency.getBalance(message.author.id)}💰`);




	} else if (command === 'buy') {
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
if (!item) return message.channel.send(`That item doesn't exist.`);
if (item.cost > currency.getBalance(message.author.id)) {
	return message.channel.send(`You currently have ${currency.getBalance(message.author.id)}, but the ${item.name} costs ${item.cost}!`);
}

const user = await Users.findOne({ where: { user_id: message.author.id } });
currency.add(message.author.id, -item.cost);
await user.addItem(item);

message.channel.send(`You've bought: ${item.name}.`);

	} else if (command === 'shop') {
		const items = await CurrencyShop.findAll();
return message.channel.send(items.map(item => `${item.name}: ${item.cost}💰`).join('\n'), { code: true });

	}else if (command === 'gift' & message.author.id == '415955266853535759') {


const giftAmount = commandArgs.split(/ +/g).find(arg => !/<@!?\d+>/g.test(arg));
const giftTarget = message.mentions.users.first();

//if (giftAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}.`);

currency.add(giftTarget.id, giftAmount);

return message.channel.send(`Successfully gifted ${giftAmount}💰 to ${giftTarget.tag}. Their new balance is ${currency.getBalance(giftTarget.id)}💰`);




	}else if (command === 'reset' & message.author.id == '415955266853535759') {


//const giftAmount = commandArgs.split(/ +/g).find(arg => !/<@!?\d+>/g.test(arg));
const giftTarget = message.mentions.users.first();

//if (giftAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}.`);

currency.delete(giftTarget.id);

//return message.channel.send(`Successfully gifted ${giftAmount}💰 to ${giftTarget.tag}. Their new balance is ${currency.getBalance(giftTarget.id)}💰`);




	} else if (command === 'leaderboard') {
		return message.channel.send(
	currency.sort((a, b) => b.balance - a.balance)
		.filter(user => client.users.has(user.user_id))
		.first(10)
		.map((user, position) => (`${position + 1}) ${(client.users.get(user.user_id).tag)}: ${user.balance}💰`)
		.join('\n'),
	{ code: true }
));

	}
});


client.login(auth.token);




console.log("\nBot online");


//client.user.setActivity('main');





client.on('ready', () => {

//client.user.setAvatar('./yeet.png');

//client.user.setActivity('Main');

var queue = [];

console.log("\nStatus set");
});

//(foo) => { console.log(foo); }

client.on("message", (message) => {
if (!message.content.startsWith(prefix) || message.author.bot) return;
const user_ = message.author;
const args = message.content.slice(prefix.length).split(' ');
const args_123 = args.slice(message.mentions.users.first());
const command = args.shift().toLowerCase();

    if(command === "ping"){
            ping(message);
        }



if (command === "prefix"){

message.channel.send("The prefix is: "+prefix);

}

if (command === "test1"){

message.react('👍');

message.reply("If the command worked please do "+prefix+"Test_confirm");

}



if (command === "test_confirm"){
message.channel.send("OK").catch((e) => { console.log(e); });
console.log('Test confirmed');
}

if (command === "ping_me"){
    
message.reply("OK");

}

if (command === "crash"){
if (message.author.id == '415955266853535759') {
crash(message);
}
}

if (command === "mentiontest"){
let role =  message.mentions.users.first() || message.author;
let role_ = role.ID;
message.channel.send(`${role}`);
}

if(command === "announce" && message.author.id == '415955266853535759')
    {
        //var role = message.server.roles.get('name', 'Head Mods');
        message.channel.send('ANNOUNCEMENT\n@here\n'+args.join(" ")).catch((e) => { console.log(e); });
    }


if(command === "mentionrole" && message.author.id == '415955266853535759')
    {
        //var role = message.server.roles.get('name', 'Head Mods');
        message.channel.send(`<@&628658188505579520>`+args.join(" ")).catch((e) => { console.log(e); });
    }
if(command == "ticket"){
message.channel.send('A ticket responder is on the way\n\n<@&657268346160414721>\n');
message.channel.send('TICKET\n\n'+args.join(" ")).catch((e) => { console.log(e); });
}

if (command === "forcecrash"){
if (message.author.id == '415955266853535759') {
crash(message);
message.channel.send('Bot going down now!')
    .then(msg => client.destroy())
    .then(console.log("\nBot crashing...\n"));
}
}


if (command === "dm"){
const user = message.mentions.users.first();
user.send('Message from: '+message.author+'\n\n'+args.join(" ")).catch((e) => { console.log(e); });
console.log('DMed '+user.tag);

message.delete;

}



if (command === "update" && message.author.id == '415955266853535759'){
//const user = '148619350700589056';
const user = message.mentions.users.first();
//const user = 'Sasiko#1234';
//const user = 'Crashingnick757#8087';
console.log(user);
user.send('An update is ready');
}

if (command == 'add_song' || command == 'queue_song'){
var q_length = queue.length;
let path_ = args[0];

queue[q_length] = path_;
message.channel.send(path_+' added to queue');
}

if (command == 'clear_queue'){
queue = array_reset;
message.channel.send('Queue cleared');
}

if (command == 'q' || command == 'queue'){
message.channel.send(queue);
}

if (command === "devs"){
message.channel.send(dev_list);
}

if (command === "yts"){
message.channel.send(YT_list);
}

if (command === "joke"){
var num_ = getRandomInt(0,jokes.length);
message.channel.send("------------------\n"+jokes[num_]);
}

if (command === "help"){
help(message);
}

if (command === "youtubers"){
message.channel.send(youtuber_list).catch((e) => { console.log(e); });
}


if (command == "args"){
message.channel.send(args.join(" ")).catch((e) => { console.log(e); });
}

if (command == 'play' && music_ready == true){
let url = args.join(' ');
let VC = message.member.voiceChannel;

const { voiceChannel } = message.member;

		if (!VC) {
			return message.reply('please join a voice channel first!');
		}
currentVC[0] = message.member.voiceChannel;
		VC.join().then(connection => {
music_ready = false;
			const stream = ytdl(url, { filter: 'audioonly' });
			const dispatcher = connection.playStream(stream);
if (currentVC == queue.length){
			dispatcher.on('end', () => voiceChannel.leave());
dispatcher.on("end", end => {music_ready = true});
dispatcher.on("end", end => {currentVC = array_reset});
}



		});

}

if (command == 'join'){
let VC = message.member.voiceChannel;

const { voiceChannel } = message.member;

		if (!VC) {
			return message.reply('please join a voice channel first!');
		}
currentVC[0] = message.member.voiceChannel;
		VC.join()
}

//$play https://www.youtube.com/watch?v=r_PtXiaTTdM



if (command == 'stop'){

let VC = message.member.voiceChannel;
if (!VC || VC != currentVC[0])
            return message.reply("You must be in the same voice channel as me")
message.react('👍');
VC.leave();
queue = array_reset;
currentVC = array_reset;
music_ready = true;
}



if (command == 'creeper'){
message.channel.send("Aw, man!").catch((e) => { console.log(e); });
}




//Everything below is experimental OR template code.

/*
if (command === ""){
message.channel.send("").catch((e) => { console.log(e); });
}

*///template


});
