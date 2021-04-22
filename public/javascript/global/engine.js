const root = document.getElementById("root");
const  Box = document.getElementById("Box");
const  Account = document.getElementById("Account");
function Start() {    
    Box.style.display = "none";
    Account.style.display = "none";
    root.style.display = "block";
    document.documentElement.setAttribute('game', "true") 
}

function End() {
    Box.style.display = "block";
    Account.style.display = "block";
    root.style.display = "none";
    document.documentElement.removeAttribute('game');
    PlayerLeftAlert();
}

