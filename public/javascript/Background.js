class Background{
    static Render() {
        ctx.beginPath();
        ctx.fillStyle = "#2d3436";
        ctx.fillRect(0, 0, okno.ln, okno.lp);
        ctx.fill(); 
    }
}