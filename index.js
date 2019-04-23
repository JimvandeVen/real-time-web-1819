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


io.on("connection", function (socket) {
    let connectionCount = 0

    socket.on('joinPro', function () { //Janno vragen wat ie hier nou precies bedoelde!!!!!!!!!
        socket.join('proBrexit');
        connectionCount++
        console.log("pro");

    });

    socket.on('joinCon', function () {
        socket.join('conBrexit');
        connectionCount++
        console.log("con");

    });


    if (connectionCount >= 1) {
        stream.on('tweet', function (stream) {
            console.log("tweet");
            streamHandler(stream)
        })
    }




    let proTweets = []
    let conTweets = []
    let proCount = 0
    let conCount = 0


    function streamHandler(stream) {
        const pattern = "RT @";
        if (stream.in_reply_to_status_id === null && stream.text.indexOf(pattern) < 0 && stream.quoted_status_id === undefined) {
            checkFunc(stream)
        }
    }

    function checkFunc(stream) {
        if (stream.extended_tweet) {
            extendedTweet(stream)
        } else {
            tweet(stream)
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
                sentiment: sentiment.analyze(stream.extended_tweet.full_text),
                likes: 0
            };
            return tweet
        }
        await tweetSorter(crObj(stream))

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
                sentiment: sentiment.analyze(stream.text),
                likes: 0
            };
            return tweet
        }
        await tweetSorter(crObj(stream))

    }

    function tweetSorter(tweet) {
        if (tweet.sentiment.score <= 0) {
            conTweets.push(tweet)
            io.to('proBrexit').emit('autoFeed', tweet);
            proCount++
            console.log("contweets")
        } else {
            proTweets.push(tweet)
            io.to('conBrexit').emit('autoFeed', tweet);
            conCount++
            console.log("protweets")

        }
    }


    socket.on("likeHandler", function (like) {
        if (conTweets.length) {
            conTweets.forEach(conTweet => {
                if (conTweet.twid == like.likedId) {
                    if (like.value == "dislike") {
                        conTweet.likes--
                    } else {
                        conTweet.likes++
                    }
                    console.log(conTweet)
                    io.to('conBrexit').emit('likes', conTweets.sort(compare));

                }
            })
        }
        if (proTweets.length) {
            proTweets.forEach(proTweet => {
                if (proTweet.twid == like.likedId) {
                    if (like.value == "dislike") {
                        proTweet.likes--
                    } else {
                        proTweet.likes++
                    }
                    console.log(proTweet)
                    io.to('proBrexit').emit('likes', proTweets.sort(compare));
                }
            })
        }
    })
    function compare(a, b) {
        return a.likes - b.likes
    }
})

http.listen(process.env.PORT || 3000)