//empty object to hold all methods 
var app = {};

//function that gets occupations and displays as options in the datalist
app.getOccupations = function(number) {
	$.ajax({
		url: `https://api.teleport.org/api/urban_areas/teleport:dpz83/salaries/`,
		method: 'GET',
		dataType: 'json',
		data: {
			format: 'json'
		}
	}).then(function(data){
		// accessing the occupations
		var occupations = data.salaries[number].job.title;
		var occOption = `<option id='${occupations}'>${occupations}</option>`
		// appending the occupations to the datalist as options
		$('datalist').append(occOption);
		// controlling what the user sees on focus of the input fields
		$('input[list=my_occ]').focusin(function() {
			$(this).val('').removeAttr('placeholder');
		});
		$('input[list=my_occ]').focusout(function(){
			$(this).attr('placeholder', 'Type in your occupation here...')
		});
		$('input.my-input').focusin(function() {
			$(this).removeAttr('placeholder');
		});
		$('input.my-input').focusout(function(){
			$(this).attr('placeholder', 'Type in your city here...')
		});
	});
}

//collect user input of urban area and occupation on form submit 
app.collectInfo = function(value) {
	$('form').on('submit',function(e) {
		e.preventDefault();
		var uaId = value.uaId;
		var uaName = value.title;
		var occupation = $('input[list=my_occ]').val();
		app.getUaData(uaId,occupation,uaName);
	});
	//alert user when they haven't chosen a valid occupation
	//code below from https://www.noupe.com/design/html5-datalists-what-you-need-to-know-78024.html
	// Find all inputs on the DOM which are bound to a datalist via their list attribute.
	var inputs = document.querySelectorAll('input[list=my_occ]');
	for (var i = 0; i < inputs.length; i++) {
	// When the value of the input changes...
		inputs[i].addEventListener('change', function(){
			var optionFound = false,
				datalist = this.list;
			// Determine whether an option exists with the current value of the input.
			for (var j = 0; j <datalist.options.length; j++) {
				if (this.value == datalist.options[j].value) {
					optionFound = true;
					break;
				}
			}
			// use the setCustomValidity function of the Validation API
			// to provide an user feedback if the value does not exist in the datalist
			if (optionFound) {
				this.setCustomValidity('');
			} else {
				this.setCustomValidity('Sorry this occupation is not on our list. Please select another.');
			}
		});
	} 
	//end of code from noupe
	//alert user when they have chosen a city that doesn't have data available 
	var uaInput = document.querySelectorAll('input.my-input');
	for (var i = 0 ; i < uaInput.length; i++) {
		uaInput[i].addEventListener('change', function(){
			if (value.uaId) {
					this.setCustomValidity('');
				} else {
					this.setCustomValidity('Sorry there is no data for this location. Please select another.');
				}
		});
	}
}

//get salaries and quality of life data based on urban area
app.getUaData = function(uaId,occupation,uaName) {
	//ajax call for salaries details 
	var salaries = $.ajax({
		url: `https://api.teleport.org/api/urban_areas/teleport:${uaId}/salaries/`,
		method: 'GET',
		dataType: 'json',
		data: {
			format: 'json'
		}
	})
	//ajax call for ua details
	var uaDetails = $.ajax({
		url: `https://api.teleport.org/api/urban_areas/teleport:${uaId}/details/`,
		method: 'GET',
		dataType: 'json',
		data: {
			format: 'json'
		}
	})
	//when the promise for the ajax calls come back then get the users salary and the users urban area coffee price
	$.when(salaries, uaDetails)
		.then(function(salaryData,uaData){
			var array = salaryData[0].salaries
			for (var i in array) {
				if (array[i].job.title == occupation) {
				var salaryValue = Math.floor(array[i].salary_percentiles.percentile_50);
				}
			}
			var coffeeValue = uaData[0].categories[3].data[3].currency_dollar_value;
			app.displayResult(salaryValue,coffeeValue,occupation,uaName)
		});
}

//display the result on the page
app.displayResult = function(salaryValue,coffeeValue,occupation,uaName) {
	var numCoffee = Math.floor(salaryValue.toFixed(0) / coffeeValue.toFixed(0));
	var result = `In ${uaName} an average cappuccino costs $${coffeeValue}0 and the average ${occupation} salary is $${salaryValue} a year. <br> You make ${numCoffee} cappuccinos a year!`
	$('.result__blurb').html(result);
}

//function to initialize/start other functions 
app.init = function() {
	//initializing the teleport autocomplete
	TeleportAutocomplete.init('.my-input').on('change', function(value) {
	app.collectInfo(value);
	});
	//for loop to count through occupations
	for(let i = 0; i <= 51; i++) {
		app.getOccupations(i);
	}
	//on page refresh, bring user to the top of the page
	$(window).on('load', function(){
		$('html, body').animate({
			scrollTop: $('body').offset().top
		}, 1000);
	});
}

//document ready that will run init 
$(function() {
	app.init();
}); 