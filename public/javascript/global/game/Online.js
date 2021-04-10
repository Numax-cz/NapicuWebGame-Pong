const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hrac = new Player();
ctx.canvas.height = okno.lp;
ctx.canvas.width = okno.ln;



class Game {
    static Render() {
        Background.Render();
        Player.Render();
    }
}


function Render() {
    Game.Render();
    requestAnimationFrame(Start);
}

socket.on("Ready", data => {
    Start();
    Render();
});

socket.on("BallMove", data => {
    console.log(data);
});