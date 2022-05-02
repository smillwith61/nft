
function lookupNumber() {
	let number = $('#lookup_input').val();
	if (number == "") {
		number = "0000";
	}
	open("/scorpions/info/?number=" + number);
}

function lookupWallet() {
	let addr = $('#lookup_wallet').val();
	open("/scorpions/wallet/?addr=" + addr);
}

function isMobileWidth() {
	return $('#mobile-indicator').is(':visible');
}

$(document).ready(function() {
	let html_str = `
		<div class="title">
			<a class="title_name" href="/scorpions"><h3>Abandoned Scorpions</h3></a>
			<a class="title_hamburger" href="javascript:void(0)"><h3>☰</h3></a>
		</div>
		<div class="header_content">
			<div class="links">
				<div class="social_logos">
				<a href="https://t.me/AbandonedScorpions">
					<img src="telegram.svg" title="telegram"/>
				</a>
				<a href="https://twitter.com/AbandonedScorps">
					<img src="twitter.svg" title="twitter"/>
				</a>
				</div>
				<a href="about/#about">about</a>
				<a href="about/#instructions">instructions</a> 
			</div>

			<div class="header_other">
				<div class="lookup_div">
					<span>
						<input class="lookup_input" id="lookup_input" type="text" maxlength="4" pattern="\d{4}" placeholder="0123" />
					</span>
					<span>
						<button onclick="lookupNumber()">lookup</button>
					</span>
				</div>
				<div class="lookup_wallet_spacer"></div>
				<div class="lookup_div">
					<span>
						<input class="lookup_input" id="lookup_wallet" type="text" placeholder="rdx1qspudnjc0h2cmxh552uzjp7ck40zh0da8mlusgqgtpphwtyvqur2kgql2umgx" />
					</span>
					<span>
						<button class="lookup_wallet_btn" onclick="lookupWallet()">wallet</button>
					</span>
				</div>
			</div>
		</div>

		<!-- https://stackoverflow.com/a/21351445 -->
		<div id="mobile-indicator"></div>
	`;
	let html = $.parseHTML(html_str);
	$('.site_header').append(html);

	$('.title_hamburger').click(function() {
		let cur_display = $('.header_content').css('display');
		console.log(cur_display);
		$('.header_content').toggle();
	});


	$('#lookup_input').on("keyup", function(e) {
		if (e.key === 'Enter') {
			$('#lookup_input').blur();
			lookupNumber();
		}
	});

	$('#lookup_wallet').on("keyup", function(e) {
		if (e.key === 'Enter') {
			$('#lookup_wallet').blur();
			lookupWallet();
		}
	});

	let lastMobileState = isMobileWidth();

	if (isMobileWidth()) {
		$('.header_content').hide()
	}

	$(window).resize(function() {
		if (lastMobileState != isMobileWidth()) {
			if (isMobileWidth()) {
				$('.header_content').hide()
			} else {
				$('.header_content').show()
			}
		}
		lastMobileState = isMobileWidth();
	});
});
