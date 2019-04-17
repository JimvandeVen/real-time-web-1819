const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const googleProfanityWords = require('google-profanity-words');
const Twit = require('twit')
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
require('dotenv').config()

var T = new Twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret
})

app.set("views", "view");
app.set("view engine", "ejs");

app.use(express.static('public'))

app.get('/', index)


function index(req, res) {
    res.render("pages/index");
};

let stream = T.stream('statuses/filter', { track: '#brexit', language: 'en', tweet_mode: "extended" })

stream.on('tweet', function (stream) {

    streamHandler(stream)

})

function streamHandler(stream) {

    if (stream.extended_tweet) {
        console.log(stream.extended_tweet.full_text)
    } else {
        console.log(stream.text)
    }

    // let text = stream.extended_tweet ? stream.extended_tweet.full_text : stream.text
    // console.log(text);


    // let tweet = {
    //     twid: stream.id,
    //     active: false,
    //     author: stream.user.name,
    //     avatar: stream.user.profile_image_url,
    //     body: text,
    //     date: stream.created_at,
    //     screenname: stream.user.screen_name,
    //     sentiment: sentiment.analyze(text)
    // };

    // io.emit('tweet', tweet);
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

http.listen(process.env.PORT || 3000)