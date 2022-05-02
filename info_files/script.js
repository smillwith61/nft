// from https://stackoverflow.com/a/21903119
var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
		}
	}
	return false;
};

// from https://stackoverflow.com/a/49092130
function hex_to_rgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
			  r: parseInt(result[1], 16),
			  g: parseInt(result[2], 16),
			  b: parseInt(result[3], 16)
	} : null;
}
function hex_inverse_bw(hex) {
	rgb = this.hex_to_rgb(hex);
	luminance = (0.2126*rgb["r"] + 0.7152*rgb["g"] + 0.0722*rgb["b"]);
	return (luminance < 140) ? "#ffffff": "#000000";
}



$(document).ready(function() {
	$('.downloads_container').hide();
	function downloadsVisibleText() {
		$('.downloads_link a').text("downloads " + ($('.downloads_container').is(":visible") ? "▴" : "▾"));
	}
	downloadsVisibleText();
	$('.downloads_link a').click(function () {
		$('.downloads_container').toggle();
		downloadsVisibleText();
	})

	$.getJSON("../metadata.json") .done(function(json) {
		$.getJSON("../reserved.json") .done(function(reservedJson) {

			$.getJSON("../history.json") .done(function(infoJson) {
				let has_scorp = infoJson.hasOwnProperty(scorpObj.number)
				if (!has_scorp) return;
				let scorpInfo = infoJson[scorpObj.number];
				let has_nick = scorpInfo.hasOwnProperty('nickname') && scorpInfo['nickname'] != '';
				if (has_nick)
					$('#scorp_nickname').text('"' + scorpInfo['nickname'] + '"');
			});

			let scorp_num_str = getUrlParameter('number');
			let scorp_num = parseInt(scorp_num_str);

			let scorpObj = json.entries[scorp_num];
			let attribute_stats = json.attribute_stats;
			let is_reserved = reservedJson.hasOwnProperty(scorpObj.number)
			let reserved_info = {}
			let reserved_addr = "available"
			if (is_reserved) {
				reserved_info = reservedJson[scorpObj.number];
				reserved_addr = reserved_info.owner;
			}

			// change img and scorp #
			$('.popup_preview img').attr('src', '../img/' + scorpObj.image_large);
			$('#scorp_no').text(scorpObj.number);
			$('#32px').attr('href', '../img/' + scorpObj.image);
			$('#jpeg').attr('href', '../img/jpg/' + scorpObj.number + ".jpg");
			// let avail_text = is_reserved ? "reserved" : "available";
			// let avail_color = is_reserved ? 'gray' : 'green';
			// $('#available').text(avail_text).css('color', avail_color);
			// $('#reserved_by_wallet').text(reserved_addr).css('color', avail_color);
			if (!is_reserved) {
				$('#reserved_by').append(
					$('<a>', {
						class: 'wallet_addr_link',
						href: "/scorpions/about#instructions",
						text: "available"
					}).css('color', 'green')
				);
			} else {
				$('#reserved_by').text("reserved by:\n").css('color', 'gray').append(
					$('<a>', {
						class: 'wallet_addr_link',
						href: "/scorpions/wallet/?addr=" + reserved_addr,
						text: reserved_addr
					})
				)
			}

			// add stats
			$('.popup_stats_info').empty();
			let keys = Object.keys(scorpObj.attributes)
			let table = $('<table>').appendTo($('.popup_stats_info'));
			let row = $('<tr>').appendTo(table);
			row.append( $('<th>').text("attribute"))
				.append( $('<th>').text("value").addClass('value_col'))
				.append( $('<th>').text("rarity"));

			keys.forEach(function(key){
				let val = scorpObj.attributes[key];
				let val_str = String(val);

				let at_stat = attribute_stats[key][val_str];
				let rare_str = at_stat.rarity.substring(0, 1);
				let rare_float = parseInt(rare_str);
				let col = 'gray';
				let bg_col = 'none';
				if (rare_float == 6) {
					col = 'darkcyan';
				} else if (rare_float == 5) {
					col = 'green';
				} else if (rare_float == 4) {
					col = 'darkgoldenrod';
				} else if (rare_float == 3) {
					col = 'darkorange';
				} else if (rare_float == 2) {
					col = 'darkred';
				} else if (rare_float == 1) {
					col = 'black';
				} else {
				}

				// }
				let row = $('<tr>').appendTo(table);
				row.append( $('<td>').text(key))
					.append( $('<td>').text(val).addClass('value_col'))
					// .append( $('<td>').text(at_stat.rarity));
					// .append( $('<td>', { style: "text-align: right; font-family: 'Overpass Mono', monospace;" }).text(at_stat.rarity));
					.append( $('<td>', {
						style: "text-align: right; color: " + col + "; background-color: " + bg_col + ";"
					}).text(at_stat.rarity.substring(0, 1) + "★" + at_stat.rarity.substring(1)).css('white-space', 'pre'));
				// console.log('key: ' + key + ' value: ' + scorpObj.attributes[key]);
				// stat_text += key + ": " + scorpObj.attributes[key] + "\n"
			})

			// colors
			keys = Object.keys(scorpObj.colors)
			table = $('.colors table');
			keys.forEach(function(key){
				let val = scorpObj.colors[key];
				if (!scorpObj.attributes.multicolored && key == "secondary_color") {
					return;
				}
				if (scorpObj.attributes.bg_style == "blank" && key == "bg_color") {
					return;
				}
				if (scorpObj.attributes.no_eyes && key == "eye_color") {
					return;
				}

				// }
				let row = $('<tr>').appendTo(table);
				let css = {
					'background-color': val,
					'color': hex_inverse_bw(val)
				}
				row.append( $('<td>').text(key).css(css).css('text-align', 'left'))
					.append( $('<td>').text(val).css(css));
			})
		})
		.fail(function(){
			console.log("An error has occurred.");
			return;
		})
	})
	.fail(function(){
		console.log("An error has occurred.");
		return;
	});
});
