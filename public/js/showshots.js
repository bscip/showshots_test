var en_api_key = '';
var sk_api_key = '';
var flickr_api_key = '';

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
        $("#shows_header").trigger('click');

        var url = 'http://api.songkick.com/api/3.0/artists/'+$(this).attr('skid');
            url += '/gigography.json?apikey='+sk_api_key;
            url += '&order=desc&page=1&per_page=20';
            url += '&jsoncallback=?';

        $.getJSON(url, function(data) {
            var shows = '';
            $.each(data.resultsPage.results.event, function(i,show) {
                var d = new Date(show.start.date);
                var min_time = Math.round(d.getTime()/1000);
                var max_time = Math.round(new Date(d.setHours(d.getHours()+12)).getTime()/1000);
                if (show.start.datetime !== null) {
                    d = new Date(show.start.datetime);
                    min_time = Math.round(new Date(d.setHours(d.getHours()-8)).getTime()/1000);
                    max_time = Math.round(new Date(d.setHours(d.getHours()+8)).getTime()/1000);
                } 
                var performer = '';
                //$.each(show.performance[0].displayName;
                $.each(show.performance, function(i,perf) {
                    performer += perf.displayName;
                    if ((i+1) < show.performance.length) {
                        performer += ', ';
                    }
                });
                var venue_name = show.venue.displayName;
                var metro_name = show.venue.metroArea.displayName;
                var country_name = show.venue.metroArea.country.displayName;
                var show_details = performer+' at '+venue_name+' in '+metro_name+', '+country_name; 

                var show = ''; 
                    show += '<div class="show_listing ui-widget-content">';
                    show += '<span class="show_date" ';
                    show += 'min="'+min_time+'" max="'+max_time+'" ';
                    show += 'tags="'+performer+','+venue_name+'">';
                    show += d.toDateString()+'</span>';
                    show += '<span class="show_details">'+show_details+'</span>';
                    show += '</div>';

                shows += show;
            });

            $('#shows').empty().append(shows);
        });
    });

    $("div#shows").on('click', 'div span.show_date', function() {
        console.log('blah');
        $("#images_header").trigger('click');

        var url = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json';
            url += '&extras=owner_name,url_t,url_m&media=photos';
            url += '&api_key='+flickr_api_key;
            url += '&min_taken_date='+$(this).attr('min');
            url += '&max_taken_date='+$(this).attr('max');
            url += '&tags='+encodeURIComponent($(this).attr('tags'));
            url += '&jsoncallback=?';
   
            console.log(url);
        var images = '';
        $.getJSON(url, function(data) {
            console.log(data);
            $.each(data.photos.photo, function(i,p) {
                images += '<span class="show_image"><img src="'+p.url_t+'"/></span>';
            });

            $('#images').empty().append(images);
        });
    });
});
