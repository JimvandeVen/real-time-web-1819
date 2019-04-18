const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const googleProfanityWords = require('google-profanity-words');
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
    console.log(stream)
})

let tweets = []
let count = 0;

function streamHandler(stream) {
    const pattern = "RT @";
    if (stream.in_reply_to_status_id === null && stream.text.indexOf(pattern) < 0 && stream.quoted_status_id === undefined) {
        count++;


        checkFunc(stream)

    }
}

function checkFunc(stream) {
    if (stream.extended_tweet) {
        count++;
        extendedTweet(stream)
    } else {
        tweet(stream)
        count++;
    }
    autoFeed(tweets)

}

function autoFeed(tweets) {

    if (count < 10) {
        console.log(tweets)
        io.emit("autoFeed", tweets)

    }
}

async function extendedTweet(stream) {
    function crObj(stream) {
        let tweet = {
            twid: stream.id,
            active: false,
            author: stream.user.name,
            avatar: stream.user.profile_image_url,
            body: stream.extended_tweet.full_text,
            date: stream.created_at,
            screenname: stream.user.screen_name,
            sentiment: sentiment.analyze(stream.extended_tweet.full_text)
        };
        return tweet
    }
    await tweets.push(crObj(stream))
    io.emit('tweet', tweets.sort(compare));
    console.log(tweets)
}

async function tweet(stream) {
    function crObj(stream) {
        let tweet = {
            twid: stream.id,
            active: false,
            author: stream.user.name,
            avatar: stream.user.profile_image_url,
            body: stream.text,
            date: stream.created_at,
            screenname: stream.user.screen_name,
            sentiment: sentiment.analyze(stream.text)
        };
        return tweet
    }
    await tweets.push(crObj(stream))
    io.emit('tweet', tweets.sort(compare));
    console.log(tweets)

}

function compare(a, b) {
    return a.sentiment.score - b.sentiment.score
}

// let badWords = googleProfanityWords.list()

// io.on('connection', function (socket) {

//     socket.broadcast.emit('newUser', socket.id);

//     socket.on('setUserName', function (nickname) {
//         socket.username = nickname;
//         console.log(socket.username)
//         io.emit('newName', nickname);
//     });

//     socket.on('chat message', function (msg) {
//         msg.username = socket.username

//         let words = msg.message.split(" ")
//         let sensoredWords = []
//         words.forEach(word => {
//             if (badWords.includes(word)) {
//                 let censoredWord = word.replace(/./g, "*")
//                 sensoredWords.push(censoredWord)
//             } else {
//                 sensoredWords.push(word)
//             }
//         });
//         let newMsg = sensoredWords.join(" ")
//         msg.message = newMsg
//         io.emit('chat message', msg);
//     });

//     socket.on('disconnect', function () {
//         console.log("disconect")
//         io.sockets.emit('userLeft', socket.username);
//     });
// });

http.listen(process.env.PORT || 3000)