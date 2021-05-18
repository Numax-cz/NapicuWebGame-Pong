require("dotenv").config();
const express = require("express");
const app = express();
const crypto = require('crypto');
const server = app.listen(process.env.PORT, () => {
    console.log("Aplikace běží na portu: " + process.env.PORT);
});



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
var PlayersRequest = new Map();
var Requests = new Map();


io.on("connection", socket => {
    socket.username = "Anonymous"
    socket.emit("getusername", socket.username);
    let roomName;
    GetNewRoom(socket);

    socket.on("request", data => {
        const clients = io.sockets.adapter.rooms.get(data);
        for (let i of PlayersRequest.values()) {
            if (i == socket.id) {
                io.to(socket.id).emit("ReturnRequestExist");
                return false;
            }
        }

        if (data !== roomName) {
            if (clients.size == 1) {
                for (const id of clients) {
                    if (!PlayersRequest.get(id)) {
                        PlayersRequest.set(id, socket.id);
                        io.to(id).emit("invite", { username: socket.username, id: socket.id });
                        io.to(socket.id).emit("ReturnRequestSuccess");
                    } else {
                        io.to(socket.id).emit("ReturnRequestWait"); //todo
                    }
                }
            } else if (clients.size == 2) {
                io.to(socket.id).emit("ReturnRequestMaxPlayers");
            } else {
                console.log("FATAL ERROR [Připojilo se více klientů]");
            }
        }
    });


    socket.on("accept", data => {
        const dataSocket = io.sockets.sockets.get(data.id);
        if (dataSocket) {
            PlayersRequest.delete(socket.id);
            dataSocket.leave(dataSocket.ActivityRoom);
            socket.Player = "Hrac1";
            dataSocket.Player = "Hrac2";
            dataSocket.ActivityRoom = socket.ActivityRoom;
            dataSocket.join(socket.ActivityRoom);
            io.to(socket.ActivityRoom).emit("Ready");
        } else {
            //Todo hráč se odpojil
        }
    });

    socket.on("deny", data => {
        PlayersRequest.delete(socket.id);
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
            this.ScorePlayer1 = 0;
            this.ScorePlayer2 = 0;
        }



        Render() {
            this.Collision();
            this.Move();
        }
        Move() {
            this.velX -= this.SpeedX;
            this.velY += this.SpeedY;
        }
        Collision() {
            if ((this.velX - this.Size) <= 0) {
                this.ScorePlayer2 += 1;
                this.ScoreUpdate();
            }
            if ((this.velX + this.Size) >= okno.ln) {
                this.ScorePlayer1 += 1;
                this.ScoreUpdate();
            }
            if ((this.velY + this.Size) >= okno.lp) {
                this.SpeedY = -(this.SpeedY);
            }
            if ((this.velY - this.Size) <= 0) {
                this.SpeedY = -(this.SpeedY);
            }
        }

        ScoreUpdate() {
            io.to(roomName).emit("ScoreUpdate", { player1: this.ScorePlayer1, player2: this.ScorePlayer2 });
            this.Start();
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
            let SocketKoule = Balls.get(socketid)
            if (!SocketKoule.pause) {
                Koule.Render();
                io.to(socketid).emit("BallMove", { velX: SocketKoule.velX, velY: SocketKoule.velY, size: SocketKoule.Size, color: SocketKoule.BallColor });
                PlayerPush(socketid);
            }
        }
    }
    var intervatFun;
    socket.on("PingStart", () => {
        if (!Players.has(socket.id) || !Balls.has(socket.ActivityRoom)) {
            const ZoneX = (socket.Player == "Hrac1") ? PlayerPos.Player1 : PlayerPos.Player2;
            Hrac = new Player(ZoneX);
            Koule = new Ball();
            Koule.pause = false;
            Players.set(socket.id, Hrac);
            Balls.set(socket.ActivityRoom, Koule);
            intervatFun = setInterval(function () { Render(socket.ActivityRoom); }, 33);
            io.to(socket.ActivityRoom).emit("START");
        }
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

    socket.on("BtnLeft", () => {
        Left();
        var array = GetRoomPlayers();
        io.to(socket.ActivityRoom).emit("PlayerLeft");
        for (var i = 0; i < array.length; i++) {
            let dataSocket = io.sockets.sockets.get(array[i]);
            GetNewRoom(dataSocket);
        }
    });

    socket.on("BtnPause", () => {
        let PlayersArray = GetRoomPlayers();
        let TargetID = (socket.Player == "Hrac1") ? PlayersArray[1] : PlayersArray[0]
        let dataSocket = io.sockets.sockets.get(TargetID);
        let koule = Balls.get(dataSocket.ActivityRoom);
        Requests.set(dataSocket.id, socket.id);
        koule.RequestPause = Requests;
        io.to(dataSocket.id).emit("RequestPauseGame");
    });

    socket.on("GamePauseAccept", () => {
        let koule = Balls.get(socket.ActivityRoom);
        koule.pause = true;
        let PlayersArray = GetRoomPlayers();
        let Name0 = io.sockets.sockets.get(PlayersArray[0]).username;
        let Name1 = io.sockets.sockets.get(PlayersArray[1]).username;
        io.to(socket.ActivityRoom).emit("GamePaused", {name0: Name0, name1: Name1});
    });

    socket.on("GamePauseDeny", () => {

    });

    socket.on("BtnReset", () => {

    });

    socket.on("BtnGibeUp", () => {

    });


    function PlayerPush(socketid) {
        var Hrac1 = GETPlayersDataSocketRoom().Hrac1;
        var Hrac2 = GETPlayersDataSocketRoom().Hrac2;
        if (Hrac1 && Hrac2) {
            io.to(socketid).emit("PlayerMove", { x: Hrac1.x, y: Hrac1.y, x2: Hrac2.x, y2: Hrac2.y, heigth: Player.heigth, width: Player.width });
        }
    }


    //More
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

    function GetPlayerByRoom() {
        let PlayersID = io.sockets.adapter.rooms.get(socket.ActivityRoom);
        if (PlayersID) {
            return Array.from(io.sockets.adapter.rooms.get(socket.ActivityRoom))[0];
        } else {
            return false;
        }
    }

    function OnePlayerLeftGame() {
        const dataSocket = io.sockets.sockets.get(GetPlayerByRoom());
        if (dataSocket) {
            io.to(dataSocket.ActivityRoom).emit("PlayerLeft");
            GetNewRoom(dataSocket);
        }
    }



    function GetNewRoom(dataSocket) {
        Players.delete(dataSocket.id);
        do {
            roomName = randomString();
        } while (io.sockets.adapter.rooms.get(roomName));
        if (dataSocket.ActivityRoom) {
            dataSocket.leave(dataSocket.ActivityRoom);
        }
        dataSocket.ActivityRoom = roomName;
        dataSocket.join(roomName);
        dataSocket.Player = "none";
        io.to(dataSocket.id).emit("id", { id: roomName });
    }
    function randomString() {
        const size = 5;
        return crypto
            .randomBytes(size)
            .toString('hex')
            .slice(0, size)
    }

    function Left() {
        clearInterval(intervatFun);
        Balls.delete(socket.ActivityRoom);
        Players.delete(socket.id);
    }









    socket.on("disconnect", () => {
        Left();
        OnePlayerLeftGame();
    });
});









//TODO Client

//Změna name
// Enter pro potvrzení
// Povolit pouze pár mist. jméno 
// Zakázat mezery


//TODO Server
//Kolize
//Řáden 269 - Kontrola zda je hráč v roomce 

