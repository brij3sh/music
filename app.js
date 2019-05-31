'use strict';

var xlsx = require('xlsx');
var async = require('async');
var request = require('request');
var fs = require('fs');



var data = {

	readFile: function(req, res, next) {

		console.log('Reading File...');

		var enFile = req.files.enFile;
		var enFileData = enFile.data;

		try {
			// var workbook = xlsx.read(enFileData);
			var workbook = xlsx.readFile(enFile.path);
		} catch (err) {
			return next(ec.appError({
				status: ec.INVALID_FILE,
				message: 'Error Reading File'
			}));
		}

		if (!workbook) {
			return next(ec.appError({
				status: ec.INVALID_FILE,
				message: 'Invalid File'
			}));
		}

		//var allSheets = workbook.SheetNames;

		var sheetName = workbook.SheetNames[0];
		var worksheet = workbook.Sheets[sheetName];
		var worksheetRange = worksheet['!ref'];

		if (!worksheetRange) {
			return next(ec.appError({
				status: ec.INVALID_FILE,
				message: sheetName + ' is a empty Sheet.'
			}));
		}

		var jsonData = xlsx.utils.sheet_to_json(worksheet);
		var outputData = [];
		// console.log(jsonnData[0]);

		async.each(jsonData, function(item, callback) {
			// console.log(item.song);
	    	var url = 'http://api.musixmatch.com/ws/1.1/track.search?q_track=' + item.song +'&page_size=3&page=1&s_track_rating=desc&apikey=905748e88e234954c9849597855d2d57';
	    	// console.log(url);
	    	request(url, function (err, response, body) {

	    		if (err) {
	    			callback(err);
	    		} else {

	    		
	    		try{
					var apiData = JSON.parse(body);
					// console.log(apiData);
					
					var songData = {};
					songData.original = item.song;
					songData.track_name = apiData.message.body.track_list[0].track.track_name || ' ';
					songData.track_rating = apiData.message.body.track_list[0].track.track_rating || ' ';
					songData.album_name = apiData.message.body.track_list[0].track.album_name || ' ';
					songData.artist_name = apiData.message.body.track_list[0].track.artist_name || ' ';
					songData.music_genre_name = apiData.message.body.track_list[0].track.primary_genres.music_genre_list[0].music_genre.music_genre_name || ' ';
				} catch (e){


				}
					
					outputData.push(songData);
					callback();
				}
			});

		}, function(err) {
		    
		    
		    	console.log('All songs have been processed successfully');
		    	// console.log(outputData);

		    	fs.writeFile('file13.json', JSON.stringify(outputData), function (err) {
					if (err) throw err;
					console.log('Saved!');
					res.json('Success');
				});				
		    
		});
		
	}

}

module.exports = data;

(function() {
	if (require.main == module) {
		var req = {
			files: {
				enFile: {
					path: '/home/brijesh/Desktop/audio.xlsx'
				}
			}
		}
		data.readFile(req, {
			json: console.log
		}, console.log);
	}
}());