const color = '#f5f6fa';
const position = "bottom-end"
function Alert(txt, icon, confirm) {
    const timer = (confirm !== false) ? false : 2000;
    const Alert = Swal.mixin({
        toast: true,
        position: position,
        showConfirmButton: confirm,
        timer: timer,
        background: color,
        timerProgressBar: false,
    });
    Alert.fire({
        icon: icon,
        title: txt,
    });
}





function AlertRequest(txt) {
    const Alert = Swal.mixin({
        toast: true,
        position: position,
        showConfirmButton: true,
        showCancelButton: true,
        timer: false,
        background: color,
        timerProgressBar: false,
        confirmButtonText: "Příjmout",
        cancelButtonText: "Odmítnout",
    });
    Alert.fire({
        icon: "info",
        title: txt,
    }).then((i) => {
        if (i.isConfirmed) {
            AcceptRequest(Socketdata);
        } else {
            DenyRequest(Socketdata);
        }
    });
}

function AlertRequestButtons(txt, emit, emit2) {
    const Alert = Swal.mixin({
        toast: true,
        position: position,
        showConfirmButton: true,
        showCancelButton: true,
        timer: false,
        background: color,
        timerProgressBar: false,
        confirmButtonText: "Ano",
        cancelButtonText: "Ne",
    });
    Alert.fire({
        icon: "info",
        title: txt,
    }).then((i) => {
        if (i.isConfirmed) {
            socket.emit(emit);
        } else if (emit2) {
            socket.emit(emit2);
        }
    });
}
function AlertButtons(txt) {

}


function PlayerLeftAlert() {
    Alert("Hráč se odpojil", "info", false);
}

function RequestSuccessAlert() {
    Alert("Pozvánka byla odeslaná!", "success", false);
}

function RequestExistAlert() {
    Alert("Již jste pozvali tohoto hráče", "warning", false);
}

function RequestMaxPlayers() {
    Alert("Tento hráč již hraje", "warning", false);
}

function RequestDeny(name) {
    Alert(`Hráč ${name} nepříjmul pozvánku`, "info", true);
}

function RequestSend(name) {
    AlertRequest(`${name} vás chce pozvat do hry`);
}

function RequestWait() {
    Alert("Hráče již někdo pozval", "info", true);
}

function RequestLeft() {
    AlertRequestButtons("Opravdu chcete opustit hru?", "BtnLeft");
}

function RequestPause() {
    AlertRequestButtons("Opravdu chcete pauzu hry?", "BtnPause");
}

function RequestReset() {
    AlertRequestButtons("Opravdu chcete restart hry?", "BtnReset");
}

function RequestGiveUp() {
    AlertRequestButtons("Opravdu se chcete vzdát?", "BtnGiveUp");
}

function RequestPauseAsk() {
    AlertRequestButtons("Hráč požádal o pauzu hry", "GamePauseAccept","GamePauseDeny");
}
