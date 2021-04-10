const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const Hrac = new Player(100);
const Hrac2 = new Player(okno.ln - 100);

ctx.canvas.height = okno.lp;
ctx.canvas.width = okno.ln;


class Game {
    static Pause = false;

    static Render() {
        Background.Render();
        Hrac.Render();
        Hrac2.Render();
        Ball.Render();



            
        if (MoveKey.Up) {  
            Hrac.MoveUp();
        }
        if (MoveKey.Down) {
            Hrac.MoveDown();
        }

    }
    static Start() {

    }
    static Pause() {
        Game.Pause = true;
    }
    static Score() {

    }
    static GameOver() {

    }

    static Debugger(value) {
        ctx.fillStyle = '#FFF'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2;
        ctx.font = "45px Teko";
        ctx.fillText("y " + Math.floor(value), 10, 50);
    }

}



function Render() {
    Game.Render();
    requestAnimationFrame(Render);

}

window.onload = () => {
    Render();
}






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