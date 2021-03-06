let express = require('express')
let bodyParser = require('body-parser')
let SongManager = require('./SongManager');
let SocketServer = require('ws').Server;
let validUrl = require('valid-url');

// Express stuff
let cors = require('cors');
let app = express() 
var expressWs = require('express-ws')(app);

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors())

sm = SongManager();

app.get('/getNext', function (req, res) {
	res.send(JSON.stringify(sm.getNext()));
})

app.get('/getUpcoming', function (req, res) {
	let n = 5;
	//TODO set number of elements
	res.send(sm.getUpcoming(n));
})

// TODO: change, shouldn't be url if it is a name
app.post('/addSongByUrl', function(req, res){
	// TODO: make better
	// Test if a url
	if((validUrl.isUri(req.body.url))) {
		if((req.body.url.includes('youtu.be/') || //TODO normilize address 
			req.body.url.includes('youtube.com/'))) {
				sm.addToQueueByURL(req.body.url, req.body.user);
				res.status(200).send("added");
		} else {
			res.status(400).send("Not a valid url");
		}
	}
	else {
		sm.addToQueueByName(req.body.url, req.body.user).then(
			(result) => {
				console.log(result);
				res.status(200).send(result);
			},
			(err) => {
				console.log(err)
				
				res.status(500).send(err)
			});
	}
})

app.ws('/', function(ws, req) {
  
	// Register for updates
	ws.send(JSON.stringify(sm.getUpcoming(5)))

	sm.setChangeCallback(ws);
});

app.get('/callBack', function(req, res){
	res.send("This is crazy, so call me maybe!");
});

app.listen( process.env.PORT || 8081, function() {
	console.log('Listening on port 8081');
	//hardcodeSongs();
});

app.post('/addPlaylist', function(req, res){
	p = [];
	if(req.body.items === undefined) {
		res.status(400).send("missing items field");
	}
	let playlist = req.body.items;
	for ( let i = 0 ; i < playlist.length ; i++ ){
		let name = playlist[i].name;
		for( let j = 0 ; j < playlist[i].artists.length ; j++){
			name = name + " " + playlist[i].artists[j].name;
		}
		p.push(sm.createSongFromName(name).then( (o) => {
			sm.addToLibrary(o);		
		}));
	}

	Promise.all(p).then(() => sm.fillPlaylist(5))
		.catch((e) => console.log(e));

	res.status(200).send("Playlist received");
});

let hardcodeSongs = function(){
	a = [];	
	a.push(sm.createSongFromURL("https://www.youtube.com/watch?v=f8E07NEZMAs", "Admin"))
	a.push(sm.createSongFromURL("https://www.youtube.com/watch?v=-zHVW7Zy_vg", "Admin"))
	a.push(sm.createSongFromURL("https://www.youtube.com/watch?v=1Ga5o7JJquQ", "Admin"))
	a.push(sm.createSongFromURL("https://www.youtube.com/watch?v=sWj2KV2jEPc", "Admin"))
	a.push(sm.createSongFromURL("https://www.youtube.com/watch?v=Fz8h_q4qvNk", "Admin"))

	a.forEach((p) => {
		p.then((s) => { 
			sm.addToLibrary(s);
			sm.fillPlaylist(5);
		});
	});
}
