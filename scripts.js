const url = "https://dictionary.cambridge.org/autocomplete/amp?dataset=english&q=";
(function() {

    $('#fname').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: url + $("#fname").val(),
                success: function(data) {
                    response(data.map(x => x.word));
                }
            });
        },
        select: function(event, ui) {
            console.log({ event, ui });
            // log("Selected: " + ui.item.value + " aka " + ui.item.id);
        }
    });
})();