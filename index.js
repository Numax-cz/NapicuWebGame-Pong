require("dotenv").config();
const express = require("express");
const app = express();
const crypto = require('crypto');


const server = app.listen(process.env.PORT, () => {
    console.log("Aplikace běží na portu: " + process.env.PORT);
});



function randomString() {
    const size = 5;
    return crypto
        .randomBytes(size)
        .toString('hex')
        .slice(0, size)
}


app.use(express.urlencoded({ extended: false }));
// app.use(cookieSession({
//     name: "session",
//     keys: ['mWcJwD3MBT', 'dV4s9UFpCq']
// }));

const io = require("socket.io")(server);

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');



app.get("/local", (req, res) => {
    res.render("local");
});

app.get("/global", (req, res) => {
    res.render("global")
});

app.get("/", (req, res) => {
    UserName = "Anonymous";


    res.render("index");
});

app.get("/session", (req, res) => {
    res.render("session")
});


const clientRooms = {};
io.on("connection", socket => {
    socket.username = "Anonymous"
    let roomName;
    do {
        roomName = randomString();
    } while (io.sockets.adapter.rooms.get(roomName));
    clientRooms[socket.id] = roomName;
    socket.join(roomName);
    socket.emit("id", { id: roomName });



    socket.on("request", data => {
        const clients = io.sockets.adapter.rooms.get(data);

        if (data !== roomName) {
            console.log(data + " " + roomName);
            if (clients.size == 1) {
                for (const id of clients) {
                    const username = io.sockets.sockets.get(id).username
                    io.to(id).emit("invite", { username: username, id: id });
                }
            } else if (clients.size == 2) {
                //uživatelé již hrajou
            } else {
                //TODO Error
            }
        }
    });
    socket.on("accept", data => {
        console.log(data);
    });

    socket.on("deny", data => {
        console.log(data);
    });


    socket.on("idcheck", data => {
        const clients = io.sockets.adapter.rooms.get(data);
        if (clients && data !== roomName) {
            socket.emit("idcheck", { id: true });
        } else {
            socket.emit("idcheck", { id: false });
        }







    });







    socket.on("disconnect", () => {
        //TODO Nazdar 
    });
});















app.post("/api/namechange", (req, res) => {
    res.json("AHoj")
});