var maxSteps = 7;
var currentStep = 0;
var customSteps = [0,1,2];
var formFields = [];
var foundErrors = false;
var formatChecks = {
	text: {
		validation: function(value) {
			return !!value;
		},
		error: "<span class='errorMessage'> This must be non-empty text</span>"
	},
	percentage: {
		validation: function(value) {
			return (value > 0 && value <= 100);
		},
		error: "<span class='errorMessage'> This must be a whole number between 0 and 100</span>",
		strip: true
	},
	wholeNumber: {
		validation: function(value) {
			return (value > 0);
		},
		error: "<span class='errorMessage'> This must be a whole number</span>"
	},
	decimal: {
		validation: function(value) {
			return (value > 0);
		},
		error: "<span class='errorMessage'> This must be a number with at most two decimal places</span>",
		strip: true
	},
	dollars: {
		validation: function(value) {
			return !!value;
		},
		error: "<span class='errorMessage'> This must be a filled in dollar amount</span>",
		strip: true
	},
	email: {
		validation: function(value) {
			var emailPattern = /^[a-zA-Z0-9._-]+@(?!(?:yahoo|hotmail|gmail)\.com$)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;  
   			return emailPattern.test(value);
		},
		error: "<span class='errorMessage'>Please enter a valid email address. Yahoo,  hotmail, and gmail are not valid domains.</span>"
	},
	phone: {
		validation: function(value) {
   			return !!value;
		},
		error: "<span class='errorMessage'>This must be a filled in dollar amount</span>"
	},
	name: {
		validation: function(value) {
			var namePattern = /^[a-zA-Z .'-]+$/;
			var match = namePattern.test(value);
			var length = (value.split(' ').length == 2)
   			return length && match;
		},
		error: "<span class='errorMessage'>This must be a first and last name</span>"
	}
};
var formObject = {};

//display
function renderForm() {
	$('#step_' + customSteps[currentStep]).show('slow').siblings().hide('slow');
}

function renderReview() {
	var stepsToReview = [];
	for (var i = 1; i <= maxSteps; i++) {
		stepsToReview.push($('#step_' + customSteps[i])[0]);
	}
	$('button').hide();
	$('#reviewTitle, .submit').show();
	$(stepsToReview).show('slow');
}

function customizeFlow() {
	if (formObject['0_improveIT'] === 'true') customSteps.push(3);
	if (formObject['0_automateIT'] === 'true') customSteps.push(4);
	if (formObject['0_toolsConsolidation'] === 'true') customSteps.push(5);
	if (formObject['0_hybridIT'] === 'true') customSteps.push(6);
	customSteps.push(7);
	maxSteps = customSteps.length - 1;
	for (var i = 0; i <= maxSteps; i++) {
		$('#step_' + customSteps[i] + ' > .stepTitle').html('STEP ' + i);
	}
}

//button handlers
function handleNext() {
	var currentFields = $('[id^="' + customSteps[currentStep] + '_"]');
	validate(currentFields);
	if (!foundErrors) validateStep(customSteps[currentStep]);
	if ((currentStep < maxSteps) && !foundErrors) {
		if (currentStep === 0) customizeFlow();
		currentStep += 1;
		renderForm();
	};
}

function handleBack() {
	if (currentStep > 0) {
		currentStep -= 1;
		renderForm();
	};
}

function handleUpdate() {
	var updateStep = $(this).parent().attr('id');
	updateStep = updateStep.substr(updateStep.indexOf('_') + 1);
	var updateFields = $('[id^="' + updateStep + '_"]');
	validate(updateFields);
	if (!foundErrors) validateStep(updateStep);
	if (!foundErrors) {
		$(this).hide('slow');
		$('.submit').show('slow');
	}
}

function handleReviewChange() {
	var changeStep = $(this).attr('id');
	changeStep = changeStep.substr(0, changeStep.indexOf('_'));
	$('#step_' + changeStep + ' > .update').show('slow');
	$('.submit').hide('slow');
}

function addLicense() {
	var lastLicense = $('#swLicenses input').last();
	var lastLicenseID = lastLicense.attr('id');
	var lastLicenseNumber = lastLicenseID.substr(lastLicenseID.lastIndexOf('_') + 1);
	var newLicenseID = '5_1_swLicenses_' + (parseInt(lastLicenseNumber) + 1);
	$(this).before('<input type="text" id="' + newLicenseID + '" optional="true"/><br>');
}

//validate fields
function validate(fields) {
	foundErrors = false;
	$.each(fields, function(index, field) {
		var format = $(field).attr('format');
		var value = getFieldValue(field);
		if (format) {
			var value = stripFieldValue(field, value);
			var validInput = formatChecks[format].validation(value);
			if (!(validInput || $(field).attr('optional'))) {
				foundErrors = true;
				if (!$(field).hasClass('invalid')) {
					$(field).addClass('invalid').after(formatChecks[format].error);
				}
			} else {
				foundErrors = foundErrors || false;
				$(field).removeClass('invalid').next("span").remove();
				if (!!value) formObject[$(field).attr('id')] = value;
			}
		} else {
			if (!!value) formObject[$(field).attr('id')] = value;
		}
	});
}

//step specific validation
function validateStep(step) {
	if (step == 6) {
		var totalServers = parseInt($('#6_1_totalServers').val());
		var virtualServers = parseInt($('#6_1_virtualServers').val());
		var physicalServers = parseInt($('#6_1_physicalServers').val());
		var virtualToCloud = parseInt($('#6_2_virtualToCloud').val());
		var physicalToCloud = parseInt($('#6_2_physicalToCloud').val());
		if (virtualServers + physicalServers !== totalServers){
			var serverCountError = true;
			$('#6_1_totalServers').addClass('invalid').after('<span class="errorMessage">Total servers must equal the sum of virtual and physical servers</span>');
		} else {
			var serverCountError = false;
			$('#6_2_virtualToCloud').removeClass('invalid').next("span").remove();
		}
		if (virtualToCloud > virtualServers) {
			var virtualServerError = true;
			$('#6_2_virtualToCloud').addClass('invalid').after('<span class="errorMessage">This must be lower than the current amount of virtual servers</span>');
		} else {
			var virtualServerError = false;
			$('#6_2_virtualToCloud').removeClass('invalid').next("span").remove();
		}
		if (physicalToCloud > physicalServers) {
			var physicalServerError = true;
			$('#6_2_physicalToCloud').addClass('invalid').after('<span class="errorMessage">This must be lower than the current amount of physical servers</span>');
		} else {
			var physicalServerError = false;
			$('#6_2_physicalToCloud').removeClass('invalid').next("span").remove();
		}
		if (serverCountError || virtualServerError || physicalServerError) foundErrors = true;
	}
}

//strip down form values if needed for storing into formObject
function getFieldValue(field) {
	return $(field).val() || 
			$(field).html() || 
			$(field).attr('placeholder') || 
			$(field).find(":selected").text();
}

//remove anything except number and decimals
function stripFieldValue(field, value) {
	value = formatChecks[$(field).attr('format')].strip ? value.replace(/[^0-9.]/g, '') : value ;
	return value;
}

//allow only numbers to be typed in
//From stackoverflow***
function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

//format currency
function formatMoney(value, withCents) {
	var reverseArray = value.split('').reverse();
	var index = withCents ? 2 : 0;
	if (withCents) {
		reverseArray.splice(2, 0, '.');
		index++;
	};
	while (index < (reverseArray.length - 3)) {
		index += 3;
		reverseArray.splice(index, 0, ',');
		index++;
	};
	if (value.length > 0) reverseArray.push('$');
	return 	reverseArray.reverse().join('');
}

function formatDecimal(value) {
	var number = value ? parseFloat(value) : '0';
	return (number/100).toString();
}

//setup
$(document).ready(function() {
	$('.resultsPage').hide();

	//next and back button press
 	$('.next').on('click', handleNext);
	$('.back').on('click', handleBack);
	$('.update').on('click', handleUpdate);

	$('#addLicense').on('click', addLicense);

	$('.review').on('click', function(){
		$('input:text, select').on('change keyup paste', handleReviewChange);
		renderReview();
	});

	$('input[format="dollars"]').on('input', function() {
	    var enteredValue = $(this).val().replace(/\D/g,'');
	    $(this).val(formatMoney(enteredValue, false));
  	});

  	$('input[format="decimal"]').on('input', function() {
	    var enteredValue = $(this).val().replace(/\D/g,'');
	    $(this).val(formatDecimal(enteredValue));
  	});

  	$('input[format="percentage"]').on('input', function() {
  		var start = this.selectionStart,
        	end = this.selectionEnd;
	    $(this).val(function(index, old) { return old.replace(/[^0-9]/g, '') + '%'; });
	    this.setSelectionRange(start, end);
  	});

  	$('#7_3yrQuote').on('input', function() {
  		var enteredValue = $(this).val().replace(/\D/g,'');
  		var result = (parseInt(enteredValue)/3).toFixed(0);
		$('#7_1yrQuote').html(formatMoney(result));
	});

	$('#6_2_3yrQuoteHybrid').on('input', function() {
  		var enteredValue = $(this).val().replace(/\D/g,'');
  		var result = (parseInt(enteredValue)/3).toFixed(0);
		$('#6_2_1yrQuoteHybrid').html(formatMoney(result));
	});

	$('input[type="checkbox"]').prop('checked', true);
	$('input[type="checkbox"]').change(function() {
	    $(this).is(":checked") ? $(this).val('true') : $(this).val('false');
	});

	$('[id^="4_1_title"]').on('input', function() {
		var projectedField = $(this).attr('id').replace('1', '2');
		$('#' + projectedField).html($(this).val())
	});
	
	renderForm();
});