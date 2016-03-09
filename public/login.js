$(document).ready(function () {
    $(".slide").click(function () {
        $('html, body').animate({
            scrollTop: $("#login").offset().top
        }, 500);
    });
});