const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hrac = new Player();
ctx.canvas.height = okno.lp;
ctx.canvas.width = okno.ln;



class Game {
    static Player = false;
    static Render() {
        
        
        
        Background.Render();
        Player.Render();
        Ball.Render();
        
        
        if (MoveKey.Up) {
            socket.emit("PlayerMoveUp");
        }
        if (MoveKey.Down) {
            socket.emit("PlayerMoveDown");
        }
        
    

    }

}


function StartRender() {
    if (!Game.Player) {
        return;
    }
    Game.Render();
    requestAnimationFrame(StartRender);
}

socket.on("Ready", data => {
    socket.emit("PingStart");
});

socket.on("START", data => {
    Start();
    Game.Player = true;
    StartRender();
});





MoveKey = {
    Up: false,
    Down: false,
    key: (e) => {
        const key = (e.type == "keydown") ? true : false;
        switch (e.keyCode) {
            case 87:
                MoveKey.Up = key;
                break;
            case 83:
                MoveKey.Down = key;
                break
        }
    }
}

window.addEventListener("keydown", MoveKey.key);
window.addEventListener("keyup", MoveKey.key);