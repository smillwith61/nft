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

$.fn.multiline = function(text){
	this.text(text);
	this.html(this.html().replace(/\n/g,'<br/>'));
	return this;
}

// good one to test with: rdx1qsplxvk5pmq3gtmpztskju0wz03j336kgexqjf7mu236m3l8vwackgsqee0jx
$(document).ready(function() {

	$.getJSON("../reserved.json") .done(function(reservedJson) {
		$.getJSON("../history.json") .done(function(infoJson) {

		let wallet_addr = getUrlParameter('addr');

		$('.wallet_addr').multiline("Address:\n" + wallet_addr);

		// doing this really stupid thing cause i don't feel like sorting
		for(let i = 0; i < 10000; i++) {
			let scorp_no = String(i).padStart(4, '0');
			if (!reservedJson.hasOwnProperty(scorp_no)) {
				continue;
			}
			let scorp = reservedJson[scorp_no];
			if (scorp.owner == wallet_addr) {

				let nickname = '';
				{ // nickname
					let has_scorp = infoJson.hasOwnProperty(scorp_no)
					if (has_scorp) {
						let scorpInfo = infoJson[scorp_no];
						let has_nick = scorpInfo.hasOwnProperty('nickname') && scorpInfo['nickname'] != '';
						if (has_nick) {
							nickname = '"' + scorpInfo['nickname'] + '"';
						}
					}
				}
				$('.wallet_grid').append(
					$('<a>', { href: "../info/?number=" + scorp_no }).append(
						$('<div>').addClass('wallet_grid_item').append(
							$('<img>').attr({
								src: "../img/" + scorp_no + "_large.png",
							})
						).append(
							$('<label>').text(
								scorp_no
							)
						)
						.append($('<br>')
						).append(
							$('<label>').text(
								nickname
							)
						)
					)
				)
			}
		}
	});
	})
	.fail(function(){
		console.log("An error has occurred.");
		return;
	})
});
