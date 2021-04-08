const username = document.getElementById("NameInput");
$(function () {
    $("#NameInput").on("change paste keyup", function () {
        $.ajax({
            type: "post",
            url: "/api/namechange",
            data: { username: username.value },
            success: function (data) {
                alert(data)
            }
        })
    })
});