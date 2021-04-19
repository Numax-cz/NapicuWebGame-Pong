const root = document.getElementById("root");
const  Box = document.getElementById("Box");
const  Request = document.getElementById("Request");
const  Account = document.getElementById("Account");
function Start() {    
    Box.style.display = "none";
    Request.style.display = "none";
    Account.style.display = "none";
    root.style.display = "block";
    document.documentElement.setAttribute('game', "true") 
}

function End() {
    Box.style.display = "block";
    Request.style.display = "block";
    Account.style.display = "block";
    root.style.display = "none";
    document.documentElement.removeAttribute('game');
    Alert();
}

