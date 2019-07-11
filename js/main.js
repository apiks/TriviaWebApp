// Init
var money_level = 1;
var current_question;
var button_lock = false;
var sess_token;
var usedHelps = [];


// Shuffles an array
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// Sleeps for X Milliseconds
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Decodes/escapes special characters in the answers
function decode(string) {
    var div = document.createElement("div");
    div.innerHTML = string; 
    return typeof div.textContent !== 'undefined' ? div.textContent : div.innerText;
}

// Fetches a random int from 0 to, not including, max
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Fetches session token
function getSessToken() {
	fetch( 'https://opentdb.com/api_token.php?command=request', {
		method: 'get'
	}).then(function(response) {
		return response.json();
	}).then(function(sessToken) {
		sess_token = sessToken.token;
		document.getElementById("menu").style.visibility = "visible";
		document.getElementById("loading-div").style.visibility = "hidden";
	}).catch( function(err) {
		console.log(err);
	});
}

// Fetches a random question by difficulty
function getQuestion(difficulty) {
	var url = 'https://opentdb.com/api.php?amount=1&difficulty=' + difficulty + '&type=multiple' +
	 "&token=" + sess_token;
	 fetch(url, {
		method: 'get'
	}).then(function(response) {
		return response.json();
	}).then(function(questions) {
		// Checks if response_code is 0. If it's 3 or 4 get new sess token, else return;
		if (questions.response_code != 0) {
			if (questions.response_code == 3 || questions.response_code == 4) {
				getSessToken();
				// Sleep for a second while getting new sess Token;
				sleep(1000).then(() => {
				});
			} else {
				return;
			}
		}

		// Set fetched question
		current_question = questions.results[0];
		document.getElementById("question").textContent = decode(current_question.question);

		// Merge all possible answers and shuffle them
		var answers = current_question.incorrect_answers;
		answers.push(current_question.correct_answer);
		shuffle(answers);

		// Reset answer color and visibility
		Array.from(document.getElementsByClassName("answer-item")).forEach(
		    function(element) {
		        element.style.background = "cyan";
		        element.style.visibility = "visible";
		    }
		);
		// Set answer text to possible answer
		Array.from(document.getElementsByClassName("answer")).forEach(
		    function(element, index) {
		        element.textContent = decode(answers[index]);
		    }
		);
		document.getElementById("status").style.visibility = "hidden";

		// Unlock buttons
		button_lock = false;
	}).catch( function(err) {
		console.log(err);
	});
}

// Hides all answers (overrides visibility setting of "answer-item")
function hideAnswers() {
	Array.from(document.getElementsByClassName("answer-item")).forEach(
	    function(element) {
	        element.style.visibility = "hidden";
	    }
	);
}

// Initializes the game if the session token has been fetched and start pressed
function startGame() {
	$("#start-button", "#menu").click(function(){
		if (sess_token == null) {
			return;
		}
		button_lock = true;
		document.getElementById("question-answer-container").style.visibility = "visible";
		document.getElementById("stats").style.visibility = "visible";
		document.getElementById("menu").style.visibility = "hidden";
		document.getElementById("reset-button").style.visibility = "visible";
		getQuestion("easy");
	}); 
}

// Resets game and brings it back to the menu
function resetGame() {
	$("#reset-button", "#main").click(function(){
		if (button_lock) {
			return;
		}

		// Hide and change appropriate css fields
		document.getElementById("question-answer-container").style.visibility = "hidden";
		hideAnswers();
		document.getElementById("stats").style.visibility = "hidden";
		document.getElementById("menu").style.visibility = "visible";
		document.getElementById("reset-button").style.visibility = "hidden";
		document.getElementById("status").style.visibility = "hidden";
		document.getElementById("question").textContent = "Loading...";
		Array.from(document.getElementsByClassName("help-item")).forEach(
		    function(element) {
		    	element.style.background = "#ffd6a1";
		    }
		);
		// Reset audience and friend help text 
    	var audience_help = document.getElementById("audience-help");
    	if (audience_help.textContent != "Ask Audience") {
    		audience_help.textContent = "Ask Audience";
    	}
    	var friend_help = document.getElementById("friend-help");
    	if (friend_help.textContent != "Call a Friend") {
    		friend_help.textContent = "Call a Friend";
    	}
    	// Reset money levels
		Array.from(document.getElementsByClassName("money-level-item")).forEach(
		    function(element) {
		    	if (element.firstChild.textContent == "1") {
		    		element.id = "current-level";
		    	} else if (element.id == "current-level") {
		    		element.id = "";
		    	}
		    }
		);
		money_level = 1;
		button_lock = false;
		usedHelps = [];
	}); 
}

// Handles answer click
function pickAnswer() {
	$(".answer-item", "#answers").click(function(){

		if (button_lock) {
			return;
		}

		// Lock button and save picked answer text element and change color to yellow
		button_lock = true;
		var pickedAnswerText = $(this).find(".answer")[0];
		$(this)[0].style.background = "yellow";

		sleep(2000).then(() => {
			if (pickedAnswerText.textContent == decode(current_question.correct_answer)) {

				// Change color to lightgreen if correct answer
				$(this)[0].style.background = "lightgreen";

				sleep(2000).then(() => {
					// Check money level and handle accordingly
					var current_level = $("#current-level", "#money-levels-container");
				    if (current_level.find(".level")[0].textContent != "15") {
				    	current_level.removeAttr("id");
				    	current_level.prev().attr("id", "current-level")

				    	// Reset audience and friend help text 
				    	var audience_help = document.getElementById("audience-help");
				    	if (audience_help.textContent != "Ask Audience") {
				    		audience_help.textContent = "Ask Audience";
				    	}
				    	var friend_help = document.getElementById("friend-help");
				    	if (friend_help.textContent != "Call a Friend") {
				    		friend_help.textContent = "Call a Friend";
				    	}
				    } else {
				    	// Win the game
				    	document.getElementById("question-answer-container").style.visibility = "hidden";
				    	hideAnswers();
				    	var status = document.getElementById("status");
				    	status.textContent = "Congratulations! You've won 1 MILLION!";
				    	status.style.background = "lightgreen";
				    	status.style.visibility = "visible";
				    }

				    // Give questions of differing difficulty based on money level
				    if (current_level.find(".level")[0].textContent > 10) {
				    	getQuestion("hard");
				    } else if (current_level.find(".level")[0].textContent > 5) {
				    	getQuestion("medium");
				    } else {
				    	getQuestion("easy");
				    }
				});

			} else {

				// Change color to red if wrong answer
				$(this)[0].style.background = "red";

				// Show correct answer
				Array.from(document.getElementsByClassName("answer")).forEach(
				    function(element) {
				    	if (element.textContent == decode(current_question.correct_answer)) {
				    		element.parentNode.style.background = "lightgreen";
				    		return;
				    	}
				    }
				);

				sleep(2000).then(() => {
					// Fail the game
					hideAnswers();
					document.getElementById("question-answer-container").style.visibility = "hidden";
					var status = document.getElementById("status");
					status.textContent = "Sorry, you've failed!";
					status.style.background = "red";
					status.style.visibility = "visible";
					button_lock = false;
				});
			}
		});
  	}); 
}

// Gives random answer from visible answers
function getRandomAnswer() {
	var possibleAnswers = [];
	Array.from(document.getElementsByClassName("answer")).forEach(
	    function(element) {
			if (element.parentElement.style.visibility != "hidden") {
	    		possibleAnswers.push(element.previousElementSibling);
	    	}
	    }
	);
	shuffle(possibleAnswers);
	return possibleAnswers[0].textContent;
}

// Handles help click
function pickHelp() {
	$(".help-item", "#helps-container").click(function(){

		if (button_lock || document.getElementById("status").style.visibility == "visible") {
			return;
		}

		var help_item = $(this);
		var help_id = help_item.attr("id");

		// Returns if this help was already clicked before
		var found = usedHelps.find(function(helpId) {
			return help_id == helpId;
		});
		if (found != null) {
			return;
		}

		if (help_id == "friend-help") {
			// Gives random answer from visible answers
			help_item.text("Correct answer is " + getRandomAnswer());

		} else if (help_id == "50/50-help") {
			var correct_index;
			var random_int = getRandomInt(4);
			var used_int;

			// Find and save index of the correct answer element
			Array.from(document.getElementsByClassName("answer")).forEach(
			    function(element, index) {
			    	if (element.textContent == decode(current_question.correct_answer)) {
			    		correct_index = index;
			    	}
			    }
			);

			// Hide two random wrong answers
			for (i = 0; i < 2; i++) {
				while (random_int == correct_index || random_int == used_int) {
					random_int = getRandomInt(4);
				}
				used_int = random_int;
				document.getElementsByClassName("answer-item")[random_int].style.visibility = "hidden";
			}

		} else if (help_id == "audience-help"){

			var random_success = Math.random();
			var correct_letter;
			var random_int;

			// If random_success is under 0.7 give correct answer, otherwise give random wrong answer
			if (random_success < 0.7) {
				// Find and print correct answer letter
				Array.from(document.getElementsByClassName("answer")).forEach(
				    function(element) {
				    	if (element.textContent == decode(current_question.correct_answer)) {
							if (element.parentElement.style.visibility != "hidden") {
								help_item.text("Correct answer is " + element.previousElementSibling.textContent);
					    	}
				    	}
				    }
				);
				
			} else {
				// Gives random answer from visible answers
				help_item.text("Correct answer is " + getRandomAnswer());
				}
		}

		// Add this help to array of used helps and make it lightgray
		usedHelps.push(help_id);
		$(this).css("background-color", "lightgray");
  	}); 
}

// Loads JS
window.onload = function() {
	sessToken = getSessToken();
	startGame();
	resetGame();
	pickAnswer();
	pickHelp();
}