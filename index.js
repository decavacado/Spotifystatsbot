//Spotify stats bot
const discord = require("discord.js");
const client = new discord.Client();
const uuid = require("uuid");
const pg = require("pg");

//Database
const pgclient = new pg.Client({
	connectionString: "postgres://sozhshjllrxqty:4ffec387901f5a079e874b290834893a946713efd012ae70159dec9c27e80a93@ec2-52-205-145-201.compute-1.amazonaws.com:5432/d6mfatrd67m8ha",
	ssl: {
		rejectUnauthorized: false
	}
		
});

pgclient.connect();

function parser(content){
	    let content_arrs = content.split(" ")

	    let command = content_arrs.shift()

	    return {
	       	command: command,
	        arguments: [...content_arrs]
	     }	             
}

var types = ["long", "short", "medium"]

client.on("message", (message) => {
	let command = parser(message.content)
	if(message.content === "s!cop") message.reply(message.content);
	
	if(command.command.toLowerCase() === "s!spotify") {
		if(command.arguments.length > 0) {
			if(types.includes(command.arguments[0])) {
				var type = command.arguments[0]
			}
		}else {
			var type = "long"
		}
		let code = uuid.v4();
		let id = message.author.id;
		pgclient.query(`DELETE FROM spotify WHERE user_name = '${id}';`, (err, res) => {
			    console.log("gone")
		})
		pgclient.query(`INSERT INTO spotify (user_name, code, data, type) VALUES ('${id}', '${code}', '', '${type}');`, (err, res) => {
			console.log(res, err);
			message.reply("Here is the code " + code + " go here https://spotstats.herokuapp.com/");
		});
	}else if(message.content === "s!verify") {
		let id = message.author.id
		pgclient.query("SELECT data, type FROM spotify WHERE user_name = '" + id + "';", (err, res) => {
		  if(err || res.rows.length < 1) {
		  	message.reply("Seems you have not done s!spotify yet")
		  }else {
		  	console.log(res)
		  	if(res.rows[0].data === "") {
		  		var data = JSON.parse(res.rows[1].data)
		  		var type = res.rows[1].type 
		  	}else {
		  		var data = JSON.parse(res.rows[0].data)
		  		var type = res.rows[0].type 
		  	}
		  	console.log(data)
		  	let embed = new discord.MessageEmbed()
		  	if(type === "short") {
		  		embed.setTitle("Spotify Stats Top Artists in 4 weeks")
		  	}else if(type === "medium") {
		  		embed.setTitle("Spotify Stats Top Artists in 6 months")
		  	}else {
		  		embed.setTitle("Spotify Stats Top Artists of All time")
		  	}
		  	embed.setThumbnail(data.items[0].images[1].url)
		  	embed.setColor("#1DB954")
		  	embed.setFooter('Made by Decavacado:)', 'https://static.highsnobiety.com/thumbor/FbFicZMWjWbBrF-KbfPWUPEqzuA=/1600x1067/static.highsnobiety.com/wp-content/uploads/2019/11/29110006/lil-uzi-vert-playboi-carti-beef-twitter-reactions-01.jpg');
		  	let index = 1
		  	for(let i of data.items) {
		  		embed.addField(`${index}`, `${i.name} popularity(${i.popularity}) genre(${i.genres[0]}) followers(${i.followers.total})`)
		  		index++;
		  	} 
		  	message.reply("Displaying Data soon")
		  	pgclient.query(`DELETE FROM spotify WHERE user_name = '${id}';`, (err, res) => {
		  		console.log("gone")
		  	})
		  	message.reply(embed)
		  }			
		})
	}
})

client.on("ready", function(){
	client.user.setPresence({activity: {name: "s!spotify", type: "STREAMING", url: "https://www.twitch.tv/pokimane"}})
})



client.login("Nzg1Mjk2Njk0OTQ5ODM4ODc4.X81yig.kQrW3AvZ3dnPdrp-Dz-QA880ZUU");
