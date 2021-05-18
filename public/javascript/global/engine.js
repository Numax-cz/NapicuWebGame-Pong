const root = document.getElementById("root");
const root2 = document.getElementById("root-stats");
const  Box = document.getElementById("Box");
const Account = document.getElementById("Account");
const Settings = document.getElementById("settings");
function Start() {    
    Box.style.display = "none";
    Account.style.display = "none";
    root.style.display = "block";
    root2.style.display = "block";
    Settings.style.display = "block";
    document.documentElement.setAttribute('game', "true") 
}

function End() {
    Box.style.display = "block";
    Account.style.display = "block";
    root.style.display = "none";
    root2.style.display = "none";
    Settings.style.display = "none";
    document.documentElement.removeAttribute('game');
    PlayerLeftAlert();
}

