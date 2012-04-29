Title: 7digital shared playlists built in node.js
Author: Michael Lam
Date: Apr 23 2012

7digital shared playlists is a real time web app I made that enables users to listen and add tracks to the same playlist. Please open it up a couple of browsers to see how the real time functionality works.

[7digital shared playlists demo](http://electric-summer-3784.herokuapp.com/)

It’s the result of maxing out my two days of innovation time this month at 7digital, plus a little extra over the weekend as two days never seems enough!


## Source Code

[Source on GitHub](https://github.com/treadsafely/node-js-7digital-shared-playlists)

## node.js and WebSockets

The tech stack I chose was [node.js](http://nodejs.org/) with [WebSockets](http://en.wikipedia.org/wiki/WebSocket) for real-time communication. WebSockets utilise a much reduced overhead in server communication than ajax does, and node.js can comfortably handle all of the websocket connections via it’s single-threaded, non-blocking event loop architecture.

Not all browsers support WebSockets, which is where the [socket.io](http://socket.io/) comes in. Socket.io uses WebSockets if they are available, but if not, it will use Flash sockets, and if this is not available, it uses long polling. [Now.js](http://nowjs.com/) (another node module) is built on top of the socket.io module. Now.js makes it really easy to sync your variables and functions from client to server side and back with the “now” object that can be accessed at either the client or server side.

## Web framework

I used [express](http://expressjs.com/), a lightweight web framework that makes it really easy to create the http server, create the routes and render views. I used a typical MVC architecture to structure the application.

## Audio

Audio is handled by [audio.js](http://kolber.github.com/audiojs/). Audio.js enables the HTML5 audio tag to be used anywhere, regardless of browser support, by using a flash player if the audio tag is not supported.

## Persistence

[MongoDB](http://www.mongodb.org/) plays very nicely with node.js. [Mongoose](http://mongoosejs.com/) is a node.js wrapper for MongoDB, and makes for very easy persistence of JavaScript objects. Current users, chat history and playlist tracks are all persisted within the application.

## Mapping XML to JSON
Unfortunately, the 7digital API does not yet support JSON. I used node-xml2json to do the mapping.

## View templating

I used [Jade](http://jade-lang.com/), pretty much the de-facto standard in view templating in node.js. It’s incredibly intuitive, very readable and supports express out of the box.

## Deployment

Hosting is taken care of by [heroku](http://www.heroku.com/). I wanted to use [JoyentCloud](http://www.joyentcloud.com/) to host as it has full support for WebSockets, but they are not provising new smart machines due to being at full capacity. Heroku does not have WebSocket support and uses long polling instead. Not great, but the resultant effect is pretty much the same.
## Conclusion
The 7digital shared playlist app was a lot of fun to make, and hopefully a demonstration of the power of real time apps – providing value by enabling online communities to interact without the requirement of refreshing the page, or the server overhead of concurrent ajax calls or polling.