$(document).ready(function () {
    $('.tasksMenu').hide();
    $('.jobsMenu').change(function () {
        if ($('.jobsMenu').val() !== 'default') {
            $('.tasksMenu').show();
        } else {
            $('.tasksMenu').hide();
        }
    });
    $('.punchBtn').hide();
    $('.tasksMenu').change(function () {
        if ($('.tasksMenu').val() !== 'select') {
            $('.punchBtn').show();
        } else {
            $('.punchBtn').hide();
        }
    });

});