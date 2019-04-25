const socket = io.connect(window.location.origin);
const sentimentForm = document.querySelector(".sentimentForm");

if (sentimentForm) {
    sentimentForm.addEventListener("submit", e => {
        e.preventDefault();
        let sentiment = new FormData(sentimentForm)
        let output = ""
        for (const entry of sentiment) {
            output = entry[1];
        };
        console.log(output)
        if (output == "pro") {
            socket.emit("joinPro")
            addTitle(output)
            changeBackground(output)
        } else {
            socket.emit("joinCon")
            addTitle(output)
            changeBackground(output)
        }
        sentimentForm.remove()
    });
}

function addTitle(sentiment) {
    const topTweetTitle = document.querySelector("#topTweetTitle")
    const feedText = document.querySelector(".feedText")
    if (sentiment == "pro") {
        topTweetTitle.innerHTML = "What do pro Europeans think about tweets rooting for Brexit?"
        feedText.innerHTML = "What do you think about tweets written by pro Europeans? Like or dislike their tweets."
    } else {
        topTweetTitle.innerHTML = "What do the Brexiteers think about tweets against Brexit?"
        feedText.innerHTML = "What do you think about tweets written by Brexiteers? Like or dislike their tweets."
    }
}
function changeBackground(sentiment) {
    let body = document.querySelector("body")
    if (sentiment == "pro") {
        body.style.backgroundImage = 'url(https://www.embassyoflibya.eu/wp-content/uploads/2015/04/flag_EU-A.jpg)';
    } else {
        body.style.backgroundImage = 'url(https://i.pinimg.com/originals/01/9c/6a/019c6ae6c2e39f2de7f292e20a5cc74e.jpg)'
            ;
    }
}
socket.on("likes", function (tweets) {

    document.querySelector(".liked").innerHTML = likes(tweets);
    if (tweets.length >= 4) {
        document.querySelector(".disliked").innerHTML = dislikes(tweets);
    }
    document.querySelector(".topTweets").classList.remove("hide")
    removeAnimation()
})

function likes(tweets) {
    let likes
    if (tweets.length == 1) {
        likes = `<div class="tweet"><h3>${tweets[tweets.length - 1].author}</h3><img class="avatar" src="${tweets[tweets.length - 1].avatar}"></img><p>${tweets[tweets.length - 1].body}</p></div>`
        return likes
    } else if (tweets.length >= 2) {
        likes = `<div class="tweet"><h3>${tweets[tweets.length - 1].author}</h3><img class="avatar" src="${tweets[tweets.length - 1].avatar}"></img><p>${tweets[tweets.length - 1].body}</p></div><div class="tweet"><h3>${tweets[tweets.length - 2].author}</h3><img class="avatar" src="${tweets[tweets.length - 2].avatar}"></img><p>${tweets[tweets.length - 2].body}</p></div>`
        return likes
    }
}

function dislikes(tweets) {
    let dislikes
    if (tweets.length == 1) {
        dislikes = `<div class="tweet"><h3>${tweets[0].author}</h3><img class="avatar" src="${tweets[0].avatar}"></img><p>${tweets[0].body}</p></div>`
        return dislikes
    } else if (tweets.length >= 2) {
        dislikes = `<div class="tweet"><h3>${tweets[0].author}</h3><img class="avatar" src="${tweets[0].avatar}"></img><p>${tweets[0].body}</p></div><div class="tweet"><h3>${tweets[1].author}</h3><img class="avatar" src="${tweets[1].avatar}"></img><p>${tweets[1].body}</p></div>`
        return dislikes
    }
}

socket.on("autoFeed", function (tweet) {
    document.querySelector(".feed").innerHTML +=
        `<div class="tweet">
            <h3>${tweet.author}</h3>
            <form class="likeForm">
                <input type="radio" data-id="${tweet.twid}" id="like:${tweet.twid}" name="likes" value="like">
                <label for="like:${tweet.twid}">Like</label>
                <input type="radio" data-id="${tweet.twid}" id="dislike:${tweet.twid}" name="likes" value="dislike">
                <label for="dislike:${tweet.twid}">Dislike</label>
            </form>
            <img class="avatar" src="${tweet.avatar}"></img>
            <p>${tweet.body}</p>
        </div>`

    const likeForms = document.querySelectorAll(".likeForm")
    likeForms.forEach(likeForm => {
        likeForm.addEventListener("change", function (e) {
            likeHandler(e)
        })
    })
    removeAnimation()
})

function removeAnimation() {
    const tweets = document.querySelectorAll(".tweet")
    tweets.forEach(tweet => {
        tweet.classList.add("oldTweet")
        setTimeout(function () { tweet.classList.remove("tweet"); }, 300);
    })
}

function likeHandler(e) {
    let like = {
        likedId: e.srcElement.dataset.id,
        value: e.srcElement.value
    }
    // console.log(e.srcElement.parentElement);
    const targetElement = document.querySelector(".likedBoxContainer")
    const movingElement = e.srcElement.parentElement.parentElement
    moveElement(targetElement, movingElement)
    socket.emit("likeHandler", like)
}

function moveElement(targetElement, movingElement) {
    targetElement.appendChild(movingElement);
    movingElement.classList.add("yourLiked")
    console.log(movingElement)
}

