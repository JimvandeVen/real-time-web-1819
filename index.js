const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const googleProfanityWords = require('google-profanity-words');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let badWords = googleProfanityWords.list()

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        let words = msg.split(" ")
        let sensoredWords = []
        words.forEach(word => {
            if (badWords.includes(word)) {
                let censoredWord = word.replace(/./g, "*")
                sensoredWords.push(censoredWord)
            } else {
                sensoredWords.push(word)
            }
        });
        let newMsg = sensoredWords.join(" ")
        io.emit('chat message', newMsg);
    });
});

http.listen(8989, function () {
    console.log('listening on :8989');
});

