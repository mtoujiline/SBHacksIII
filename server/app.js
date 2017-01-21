let express = require('express')
let bodyParser = require('body-parser')
let app = express() 
app.use(bodyParser.json())

let queue = [];
let playlist = [];

//TODO
//needs to figure out which song to return from q and p
//if q is empty, 
let getNextSong = function(q, p) {
	//if(! q.empty())
	//	return  q.pop()
	//else 
	//	return p.pop();
 
	return JSON.stringify(q.pop());
}


let addSongByUrl = function(song, q) {
	
	//TODO: upvote if exist
	q.push({
		url: song.url,
		title: "TITLE",
		user: song.user,
		votes: 1
	})
	return;
}

app.get('/', function (req, res) {
   let json = JSON.stringify({
      key : 'value',
      key1: 'value1'
   });
   res.send(json)
})

app.get('/song', function (req, res) {
   
   let json = JSON.stringify({
      key : 'blah',
      key1: 'blah'
   });
   res.send(getNextSong(queue, playlist))
})

app.get('/queue', function (req, res) {
   res.send(queue)
})

app.listen(3000, function() {
   console.log('Listening on port 3000');
})

app.post('/addSong', function(req, res){
	addSongByUrl(req.body, queue);
	res.end(getNextSong(queue, playlist));
	//TODO: fail check
})