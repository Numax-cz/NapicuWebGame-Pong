
function Alert(txt, icon, confirm) {
    const timer = (confirm !== false) ? false : 2000;

    const Alert = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: confirm,
        timer: timer,
        background: '#f5f6fa',
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
        position: 'bottom-end',
        showConfirmButton: true,
        showCancelButton: true,
        timer: false,
        background: '#f5f6fa',
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

