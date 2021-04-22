const socket = io();
const Input1 = document.getElementById("inputglobalidex");
const Input2 = document.getElementById("idinputglobal");
const ButtonSend = document.getElementById("sessionbtn");
const UserNameSetInput = document.getElementById("NameInput");
//Socket
let Socketdata;
socket.on('id', data => {
    Input2.value = data.id;
    $("#idinputglobal").attr("disabled", "disabled");
});

socket.on("idcheck", data => {
    if (data.id == true) {
        Input1.style.borderBottom = "2px solid #40b484";
        PovolitOdeslani();
    } else if (Input1.value.length < 1) {
        Input1.style.borderBottom = "2px solid #40b484";
        ZakazatOdeslani();
    }
    else {
        Input1.style.borderBottom = "2px solid #e84118";
        ZakazatOdeslani();
    }
});
socket.on("invite", data => {
    RequestSend(data.username);
    Socketdata = data;
});



socket.on("getusername", data => {
    document.getElementById("clientusername").innerText = data;
    document.getElementById("NameInput").value = data;
});

socket.on("AcceptDeny", data => {
    RequestDeny(data.username);
});

socket.on("PlayerLeft", () => {
    Game.Player = false;
    ctx.clearRect(0, 0, okno.ln, okno.lp);
    Input1.value = "";
    End();
});

$("#sessionbtn").click(function () {
    socket.emit("request", Input1.value);
});

socket.on("ReturnRequestExist", () => {
    RequestExistAlert();
});

socket.on("ReturnRequestSuccess", () => {
    RequestSuccessAlert();  
});

socket.on("ReturnRequestMaxPlayers", () => {
    RequestMaxPlayers();
});

socket.on("ReturnRequestWait", () => {
    RequestWait();
});
$("#inputglobalidex").on("change paste keyup", function () {
    socket.emit("idcheck", Input1.value);
});



//Funkce
function AcceptRequest(data) {
    socket.emit("accept", { username: data.username, id: data.id });
}

function DenyRequest(data) {
    socket.emit("deny", { username: data.username, id: data.id });
}

function SocketName() {
    socket.emit("setusername", { username: UserNameSetInput.value })
}

ZakazatOdeslani();
function PovolitOdeslani() {
    $("#sessionbtn").prop('disabled', false);
    ButtonSend.style.border = "#40b484 2px solid";
    document.querySelector("button").style.cursor = 'pointer'
}

function ZakazatOdeslani() {
    $("#sessionbtn").prop('disabled', true);
    ButtonSend.style.border = "#7f8c8d 2px solid";
    document.querySelector("button").style.cursor = 'not-allowed'
}

