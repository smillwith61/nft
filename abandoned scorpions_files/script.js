
// lifted from some overflow page
/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}


$(document).ready(function() {

	// show/hide about
	$('.about_show').click(function(){
		$('.about').toggle();
	});

	function hidePopup() {
		$('.popup_close_btn').hide();
		$('.popup_selection').hide();
	}

	$('.popup_close_btn').click(function(){
		hidePopup();
	});

	$(document).keyup(function(e) {
		if (e.key === "Escape") { // escape key maps to keycode `27`
			hidePopup();
		}
	});

	$.getJSON("metadata.json")
	.done(function(json){
		$.getJSON("reserved.json")
		.done(function(reservedJson){
			$.getJSON("history.json")
			.done(function(infoJson){
				print(json);
				$('.filters_container').prepend($.parseHTML(`
					<div class="hide_unavailable_div filter_segment">
						<input type="checkbox" id="hide_unavailable" name="hide_unavailable" value="hide_unavailable">
						<label for="hide_unavailable">hide unavailable</label>
					</div>
				`));

				// make header open stuff in new tab
				// target="_blank" rel="noopener noreferrer"
				$('.links a').attr({
					target:"_blank", rel:"noopener noreferrer"
				})

				// randomize
				let indices = [];
				for (let i = 0; i < 10000; i++) {
					indices[i] = i;
				}
				shuffleArray(indices);

				function updateFiltered() {
					// first remove all the cards
					$('.grid').empty();
					scorpsLoaded = 0;
					loadScorps(100);
				}

				// give the hide unavailable filter a function
				$('#hide_unavailable').change(function() {
					updateFiltered();
				});

				let emojis = {
					"outline_type": "🔲",
					"bg_style": "🖼",
					"claw_left": "👈",
					"claw_right": "👉",
					"claws_unique": "🙌",
					"has_cigarette": "🚬",
					"legs": "🦵",
					"tail": "💉",
					"bloody_tail": "🩸",
					"has_matches": "🔥",
					"has_halo": "👼",
					"multicolored": "🦚",
					"colored_claws": "🟢",
					"colored_core": "🔵",
					"colored_tail": "🟣",
					"multicolor_type": "🦓",
					"false_face": "🤡",
					"evil_eye": "👁",
					"no_eyes": "🙈"
				}

				// create the filters
				let attribute_stats_keys = Object.keys(json.attribute_stats);
				attribute_stats_keys.forEach(attribute_name => {
					// let checkbox = $('<input>').attr(
					// 	{'id':});
					// let checkbox_label = $('<label>');
					let attr_div = $('<div>', { class: 'filter_segment', id: attribute_name });
					// attr_div.append($('<p>').append($('<b>').text(attribute_name)));
					let attr_label_text = attribute_name;
					if (attribute_name == "multicolor_type") attr_label_text = "color_type";
					let listHeadHTML = "<span class=emoji>" + emojis[attribute_name] + "</span> <b>" + attr_label_text + "</b>";
					attr_div.append($('<label>').append($.parseHTML(listHeadHTML)));
					let attr_traits = Object.keys(json.attribute_stats[attribute_name]);
					attr_traits.forEach(attr_trait_name => {
						let unique_name = attribute_name + "__" + attr_trait_name;
						let checkbox_div = $('<div>');
						checkbox_div.append(
							$('<input>').attr({
								type: "checkbox",
								id: unique_name,
								name: attr_trait_name,
								value: unique_name,
							}).change(function() {
								updateFiltered();
							})
						).append(
							$('<label>').attr({
								for: unique_name
							}).text(
								attr_trait_name
							)
						);
						attr_div.append(checkbox_div);
					});
					$('.filters').append(attr_div)
				});

				// hide filters for now
				$('.filters_container').hide();

				function filtersVisibleText() {
					$('.filters_link a').text("filters " + ($('.filters_container').is(":visible") ? "▴" : "▾"));
				}
				filtersVisibleText();

				// add to header
				$('.filters_link a').click(function () {
					$('.filters_container').toggle();
					filtersVisibleText();
				})

				// available info
				let numAvail = Object.keys(reservedJson).length / 100.0;
				numAvail = numAvail.toFixed(1);
				console.log(numAvail);
				$('.reserved_info span').text(
					numAvail + "% reserved"
				);

				let scorpsLoaded = 0;

				function loadScorps() {
					// to optimize, create the set of active filter segments first, then iterate over 100
					let max_load = scorpsLoaded + 100;

					// filtering, set up ahead of iterating
					let filters = {};
					$('.filter_segment').each(function(){
						let attribute_name = $(this).attr('id');
						let filter_this = false;
						let selected_filters = []
						$('#' + attribute_name).children().each(function() {
							let input = $(this).children('input');
							let attr_trait_name = input.attr('name');
							if (input.is(":checked")) {
								filter_this = true;
								selected_filters.push(attr_trait_name.toLowerCase());
							}
						});
						if (filter_this) {
							filters[attribute_name] = selected_filters;
						}
					});

					let filter_keys = Object.keys(filters);
					let hide_unavailable = $('#hide_unavailable').is(":checked");

					while (scorpsLoaded < max_load) {
						if (scorpsLoaded >= indices.length) {
							break;
						}
						let idx = indices[scorpsLoaded];
						let is_reserved = reservedJson.hasOwnProperty(json.entries[idx].number);
						let wallet_addr = "";
						if (is_reserved) {
							wallet_addr = reservedJson[json.entries[idx].number].owner;
						}

						// here is where the filtering happens
						let passes_filters = true;
						filter_keys.forEach(attribute_name => {
							let entry_trait = json.entries[idx]['attributes'][attribute_name].toString();
							if (!filters[attribute_name].includes(entry_trait)) {
								passes_filters = false;
							}
						});

						// hide unavailable if this is unchecked
						if (hide_unavailable) {
							if (is_reserved) passes_filters = false;
						}

						if (!passes_filters) {
							scorpsLoaded++;
							max_load++;
							continue;
						}

						createScorpCard(json.entries[idx], json.attribute_stats, is_reserved, wallet_addr, infoJson);
						scorpsLoaded++;
					}
				}

				loadScorps(100);

				function checkLoadMore() {
					let view_bottom = $(window).scrollTop() + $(window).height();
					let page_bottom = $(document).height() - 300;
					if (view_bottom > page_bottom) {
						loadScorps(100);
					}
				}

				$(window).scroll(function() {
					checkLoadMore();
				});



			})
			.fail(function(){
				console.log("metadaten");
				return;
			});
		})
		.fail(function(){
			console.log("reserved");
			return;
		});
	})
	.fail(function(){
		console.log("history");
		return;
	});
});


function createScorpCard(scorpObj, attribute_stats, is_reserved, wallet_addr, infoJson) {

	let div = $('<div>', {
		id: scorpObj.number,
		// class: 'scorpCard',
		class: 'grid_item',
		title: scorpObj.number,
		style: "background-image: url(img/" + scorpObj.image_large + ");"
	});

	if (is_reserved) {
		div.append(
			$('<div>', {
				class: 'grid_item_fade',
			})
		);
	}

	$('<a>', {
		href: 'javascript:void(0)'
	}).append(
		div
	)
	.click(function() {
		// change img and scorp #
		$('.popup_preview_image').attr('href', 'info/?number=' + scorpObj.number);
		$('.popup_preview img').attr('src', 'img/' + scorpObj.image_large);
		$('#scorp_no').text(scorpObj.number);

		{ // nickname
			let has_scorp = infoJson.hasOwnProperty(scorpObj.number)
			$('#scorp_nickname').text("");
			if (has_scorp) {
				let scorpInfo = infoJson[scorpObj.number];
				let has_nick = scorpInfo.hasOwnProperty('nickname')
				if (has_nick) {
					$('#scorp_nickname').text('"' + scorpInfo['nickname'] + '"');
				}
			}
		}

		if (!is_reserved) {
			$('#available').empty().append(
				$('<p>', {
					// href: "about#instructions",
					text: "available"
				}).css('color', 'green')
			);
		} else {
			$('#available').empty().text("reserved by:\n").css('color', 'gray').append(
				$('<a>', {
					class: 'wallet_addr_link',
					href: "wallet/?addr=" + wallet_addr,
					text: wallet_addr
				})
			)
		}
		// $('#available').text(avail_text).css('color', avail_color);
		$('.more_info a').attr("href", "info/?number=" + scorpObj.number)

		// add stats
		$('.popup_stats').empty();
		let keys = Object.keys(scorpObj.attributes)
		let table = $('<table>').appendTo($('.popup_stats'));
		let row = $('<tr>').appendTo(table);
		row.append( $('<th>').text("attribute"))
			.append( $('<th>').text("value").addClass('value_col'))
			.append( $('<th>').text("rarity"));

		keys.forEach(function(key){
			let val = scorpObj.attributes[key];
			let val_str = String(val);
			// if (val_str == "true") val_str = "True";
			// if (val_str == "false") val_str = "False";
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
				return;
			}
			// } else if (rare_float <= 55.0) {

			// }
			let row = $('<tr>').appendTo(table);
			row.append( $('<td>').text(key))
				.append( $('<td>').text(val))
				// .append( $('<td>').text(at_stat.rarity));
				// .append( $('<td>', { style: "text-align: right; font-family: 'Overpass Mono', monospace;" }).text(at_stat.rarity));
				.append( $('<td>', {
					style: "text-align: right; color: " + col + "; background-color: " + bg_col + ";"
				}).text(at_stat.rarity.substring(0, 1) + "★" + at_stat.rarity.substring(1)).css('white-space', 'pre'));
			// console.log('key: ' + key + ' value: ' + scorpObj.attributes[key]);
			// stat_text += key + ": " + scorpObj.attributes[key] + "\n"
		})

		// show
		$('.popup_close_btn').show();
		$('.popup_selection').show();
	})
	.appendTo($('.grid'));
}
