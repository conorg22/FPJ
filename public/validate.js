$(document).ready(function () {
    $('form').submit(function (evt) {
        var $this = $(evt.target);
        var valid = true;

        $this.find('input:text').each(function () {
            if (!$(this).val()) {
                valid = false;
                $(this).parent().addClass('has-error');
            }
            //add more validation logic here
        });
        if (!valid) {
            evt.preventDefault();
        }

        return valid;
    });


});