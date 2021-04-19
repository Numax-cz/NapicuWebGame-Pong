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



// var Players = []
var Players = new Map();
var Balls = new Map();




io.on("connection", socket => {
    socket.username = "Anonymous"
    socket.emit("getusername", socket.username);
    let roomName;
    do {
        roomName = randomString();
    } while (io.sockets.adapter.rooms.get(roomName));
    socket.join(roomName);
    socket.ActivityRoom = roomName; //Nevím nevím
    socket.Player = "none"
    socket.emit("id", { id: roomName });

    socket.on("request", data => {
        const clients = io.sockets.adapter.rooms.get(data);

        if (data !== roomName) {
            if (clients.size == 1) {
                for (const id of clients) {
                    io.to(id).emit("invite", { username: socket.username, id: socket.id });
                }
            } else if (clients.size == 2) {
                //uživatelé již hrajou
            } else {
                //TODO Error
            }
        }
    });


    socket.on("accept", data => {
        const dataSocket = io.sockets.sockets.get(data.id);
        dataSocket.leave(dataSocket.ActivityRoom);
        socket.Player = "Hrac1";
        dataSocket.Player = "Hrac2";
        dataSocket.ActivityRoom = roomName;
        dataSocket.join(roomName);
        io.to(roomName).emit("Ready");
    });

    socket.on("deny", data => {
        io.to(data.id).emit("AcceptDeny", { username: socket.username });
    });

    socket.on("setusername", data => {
        socket.username = data.username;
        socket.emit("getusername", socket.username);
    });

    socket.on("idcheck", data => {
        const clients = io.sockets.adapter.rooms.get(data);
        if (clients && data !== roomName) {
            socket.emit("idcheck", { id: true });
        } else {
            socket.emit("idcheck", { id: false });
        }
    });


    // InGame    
    var Hrac;
    var Koule;
    const okno = {
        lp: 1000,
        ln: 1800
    }
    const PlayerPos = {
        Player1: 100,
        Player2: okno.ln - 100,
    }

    class Ball {
        constructor() {
            this.x = okno.ln / 2;
            this.y = okno.lp / 2;
            this.Size = 12;
            this.velX = this.x;
            this.velY = this.y;
            this.SpeedX = this.Random();
            this.SpeedY = this.Random();
            this.BallColor = "#ecf0f1";
        }



        Render() {
            // this.PlayerCollision();
            this.Collision();
            this.Move();
        }
        Move() {
            this.velX -= this.SpeedX;
            this.velY += this.SpeedY;
        }
        Collision() {
            if ((this.velX + this.Size) >= okno.ln) {
                this.Start(); //Player? Game Over - -
            }
            if ((this.velX - this.Size) <= 0) {
                this.Start(); //Player? Game Over - -
            }
            if ((this.velY + this.Size) >= okno.lp) {
                this.SpeedY = -(this.SpeedY);
            }
            if ((this.velY - this.Size) <= 0) {
                this.SpeedY = -(this.SpeedY);
            }
        }



        Reverse() {
            this.SpeedY = - (this.SpeedY);
            this.SpeedX = - (this.SpeedX);
        }

        Random() {
            return Math.round(Math.random()) ? 4 : -4;
        }

        Start() {
            this.velX = this.x;
            this.velY = this.y;
            this.SpeedX = this.Random();
            this.SpeedY = this.Random();
        }
    }

    class Player {
        static MoveSpeed = 0.65;
        static heigth = 210;
        static width = 10;
        constructor(x) {
            this.y = okno.lp / 2 - Player.heigth / 2;
            this.x = x;
            this.speed = 0;
        }

        Move() {
            this.y += this.speed;
            this.speed *= 0.92;
        }

        MoveUp() {
            this.speed -= Player.MoveSpeed;
        }
        MoveDown() {
            this.speed += Player.MoveSpeed;
        }

    }




    function Render(socketid) {
        if (GetRoomPlayers()) {
            Koule.Render();
            let SocketKoule = Balls.get(socketid)
            io.to(socketid).emit("BallMove", { velX: SocketKoule.velX, velY: SocketKoule.velY, size: SocketKoule.Size, color: SocketKoule.BallColor });
            PlayerPush(socketid);
        }
    }
    var intervatFun;
    socket.on("PingStart", () => {
        const ZoneX = (socket.Player == "Hrac1") ? PlayerPos.Player1 : PlayerPos.Player2;
        Hrac = new Player(ZoneX);
        Koule = new Ball();
        Players.set(socket.id, Hrac);
        Balls.set(socket.ActivityRoom, Koule);
        intervatFun = setInterval(function () { Render(socket.ActivityRoom); }, 33);
        io.to(roomName).emit("START");
    });




    socket.on("PlayerUpdate", () => {
        if (GetRoomPlayers()) {
            Hrac.Move();
        }
    });

    socket.on("PlayerMoveUp", () => {
        if (GetRoomPlayers()) {
            Hrac.MoveUp();
        }
    });

    socket.on("PlayerMoveDown", () => {
        if (GetRoomPlayers()) {
            Hrac.MoveDown();
        }
    });

    function PlayerPush(socketid) {
        var Hrac1 = GETPlayersDataSocketRoom().Hrac1;
        var Hrac2 = GETPlayersDataSocketRoom().Hrac2;
        if (Hrac1 && Hrac2) {
            io.to(socketid).emit("PlayerMove", { x: Hrac1.x, y: Hrac1.y, x2: Hrac2.x, y2: Hrac2.y, heigth: Player.heigth, width: Player.width });
        }
        // else {
        //     PlayerLeftGame(socketid);
        // }
    }



    function GETPlayersDataSocketRoom() {
        const PlayersArray = GetRoomPlayers();
        if (PlayersArray) {
            let Hrac1ID = PlayersArray[0]; //100
            let Hrac2ID = PlayersArray[1]; //1700
            let dataSocket1 = io.sockets.sockets.get(Hrac1ID); //socket.Player: Hrac1
            let dataSocket2 = io.sockets.sockets.get(Hrac2ID); //socket.Player: Hrac2
            let Hrac1 = Players.get(Hrac1ID);
            let Hrac2 = Players.get(Hrac2ID);
            return {
                Hrac1: Hrac1,
                Hrac2: Hrac2
            }
        } else {
            return false;
        }
    }

    function GetRoomPlayers() {
        let PlayersID = io.sockets.adapter.rooms.get(socket.ActivityRoom)
        if (PlayersID) {
            let PlayersArray = Array.from(PlayersID);
            if (PlayersArray.length == 2) {
                return PlayersArray;
            } else {
                return false;
            }
        }
        return false;
    }

    function GetSocketById(id) {
        return io.sockets.sockets.get(id);
    }

    function GetPlayerByRoom() {
        let PlayersID = io.sockets.adapter.rooms.get(socket.ActivityRoom);
        if (PlayersID) {
            return Array.from(io.sockets.adapter.rooms.get(socket.ActivityRoom))[0];
        } else {
            return false;
        }
    }

    function PlayerLeftGame(socket) {
        const dataSocket = io.sockets.sockets.get(GetPlayerByRoom());
        if (dataSocket) {
            io.to(dataSocket.id).emit("PlayerLeft");
            GetNewRoom(dataSocket);
            clearInterval(intervatFun);
        }
    }

    function GetNewRoom(dataSocket) {
        do {
            roomName = randomString();
        } while (io.sockets.adapter.rooms.get(roomName));
        dataSocket.join(roomName);
        dataSocket.ActivityRoom = roomName;
        dataSocket.Player = "none";
        io.to(dataSocket).emit("id", { id: roomName });
    }

    socket.on("disconnect", () => {
        Players.delete(socket.id);
        PlayerLeftGame(socket)
    });
});








