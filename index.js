const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const googleProfanityWords = require('google-profanity-words');

app.set("views", "view");
app.set("view engine", "ejs");

app.use(express.static('public'))

app.get('/', index)
app.get('/chat', chatRedirect)
app.post('/chat', chat)


function index(req, res) {
    res.render("pages/index");
};

function chatRedirect(req, res) {
    res.redirect("/")
}

function chat(req, res) {
    res.render("pages/chat");
}

let badWords = googleProfanityWords.list()

io.on('connection', function (socket) {

    socket.broadcast.emit('newUser', socket.id);

    socket.on('setUserName', function (nickname) {
        socket.username = nickname;
        console.log(socket.username)
        io.emit('newName', nickname);
    });

    socket.on('chat message', function (msg) {
        msg.username = socket.username

        let words = msg.message.split(" ")
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
        msg.message = newMsg
        io.emit('chat message', msg);
    });

    socket.on('disconnect', function () {
        console.log("disconect")
        io.sockets.emit('userLeft', socket.username);
    });
});

http.listen(8989, function () {
    console.log('listening on :8989');
});

