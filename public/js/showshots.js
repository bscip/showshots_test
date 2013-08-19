var en_api_key = '';
var sk_api_key = '';

var artists = [];
var shows = [];

$(function() {
    // Set the accordion for the top level container
    $('#container').accordion({
        heightStyle:  "content"
    });

    // Artist Search button
    $('#artist_search_submit').button();
    $('#artist_search_submit').click(function() {
        // echonest artist search
        var url = 'http://developer.echonest.com/api/v4/artist/search?api_key='+en_api_key;
            url += '&format=json&name='+$('#artist_search').val();
            url += '&bucket=id:songkick';
            url += '&results=10';
        $.getJSON(url, function(data) {
            console.log('init echo nest resp:');
            console.log(data);
            $.each(data.response.artists, function(i,artist) {
                // songkick match?
                if (artist.foreign_ids !== undefined &&
                    artist.foreign_ids[0].catalog == 'songkick') {
                    var a = {};
                    a.artist_name = artist.name;
                    a.skid = artist.foreign_ids[0].foreign_id.split(/[: ]/).pop();
                    artists.push(a);
                }
            });

            var asr = '';
            $.each(artists, function(i,a) {
                asr += '<div class="artist_list"';
                asr += ' skid='+a.skid+'>';
                asr += a.artist_name; 
                asr += '</div>';
            });
            $('#artist_search_results').empty().append(asr);
        });
    });

    $("div#artist_search_results").on('click', 'div.artist_list', function() {
        $('#artist_selected').html('Currently Selected:  '+$(this).html());
    });

});
