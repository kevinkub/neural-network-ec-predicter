// Get all countries from dataset
var countries = [];
for(var i = 0; i < scores.length; i++) {
	var score = scores[i];
	if(countries.indexOf(score.TeamOne.trim()) == -1) {
		countries.push(score.TeamOne.trim())
	}
	if(countries.indexOf(score.TeamTwo.trim()) == -1) {
		countries.push(score.TeamTwo.trim())
	}
}

// Translations
var de2en = {
  "Frankreich": "France",
  "Rumänien": "Romania",
  "Albanien": "Albania",
  "Schweiz": "Switzerland",
  "England": "England",
  "Russland": "Russia",
  "Wales": "Wales",
  "Slowakei": "Slovenia",
  "Deutschland": "Germany",
  "Ukraine": "Ukraine",
  "Polen": "Poland",
  "Nordirland": "Northern Ireland",
  "Spanien": "Spain",
  "Tschechien": "Czech Republic",
  "Türkei": "Turkey",
  "Kroatien": "Croatia",
  "Belgien": "Belgium",
  "Italien": "Italy",
  "Irland": "Ireland",
  "Schweden": "Sweden",
  "Portugal": "Portugal",
  "Island": "Iceland",
  "Österreich": "Austria",
  "Ungarn": "Hungary"
};
var en2de = {};
for(var key in de2en) {
	var value = de2en[key];
	en2de[value] = key;
	if(countries.indexOf(value) == -1) {
		console.log(value);
	}
}

// Find matches in Jans game data
var cupMatches = [].concat(
	games.Groups[0].Matches,
	games.Groups[1].Matches,
	games.Groups[2].Matches,
	games.Groups[3].Matches,
	games.Groups[4].Matches,
	games.Groups[5].Matches,
	games.RoundOf16.Matches,
	games.RoundOf16.QuarterFinals,
	games.RoundOf16.SemiFinals,
	games.RoundOf16.Final
);

// Create training data
var training = [];
	// historic
for(var i = 0; i < scores.length; i++) {
	var score = scores[i];
	var input = {};
	for(var j = 0; j < countries.length; j++) {
		input[countries[j]] = 0;
	}
	input[score.TeamOne.trim()] = 1;
	input[score.TeamTwo.trim()] = 1;
	input['Year'] = (score.Date - 1930) / (2016 - 1930);
	var output = {};
	for(var j = 0; j < countries.length; j++) {
		output[countries[j]] = 0;
	}
	var x = 0;
	if(score.ScoreOne > score.ScoreTwo) {
		x = 1;
	} 
	if(score.ScoreOne == score.ScoreTwo) {
		x = 0.5;
	}
	output[score.TeamOne.trim()] = x;
	output[score.TeamTwo.trim()] = 1 - x;
	training.push({input: input, output: output});
}
	// running cup
for(var i = 0; i < cupMatches.length; i++) {
	var score = cupMatches[i];
	if(score != null && score.Title1 != null && score.Score1 != null && score.Title2 != null && score.Score2 != null){
		var input = {};
		for(var j = 0; j < countries.length; j++) {
			input[countries[j]] = 0;
		}
		input[de2en[score.Title1]] = 1;
		input[de2en[score.Title2]] = 1;
		input['Year'] = 1;
		var output = {};
		for(var j = 0; j < countries.length; j++) {
			output[countries[j]] = 0;
		}
		var x = 0;
		if(score.Score1 > score.Score2) {
			x = 1;
		} 
		if(score.Score1 == score.Score2) {
			x = 0.5;
		}
		input[de2en[score.Title1]] = x;
		input[de2en[score.Title2]] = 1 - x;
		training.push({input: input, output: output});
	} 
}
	// manual override for strong teams
training.push({input: {"Hungary": 1, "Year": 1}, output: {"Hungary": 0}});
training.push({input: {"Hungary": 1, "Year": 1}, output: {"Hungary": 0}});
training.push({input: {"Hungary": 1, "Year": 1}, output: {"Hungary": 0}});
training.push({input: {"Sweden": 1, "Year": 1}, output: {"Sweden": 0}});
training.push({input: {"Sweden": 1, "Year": 1}, output: {"Sweden": 0}});
training.push({input: {"Romania": 1, "Year": 1}, output: {"Romania": 0}});
training.push({input: {"Romania": 1, "Year": 1}, output: {"Romania": 0}});
training.push({input: {"Romania": 1, "Year": 1}, output: {"Romania": 0}});
training.push({input: {"Romania": 1, "Year": 1}, output: {"Romania": 0}});
training.push({input: {"Romania": 1, "Year": 1}, output: {"Romania": 0}});
training.push({input: {"Italy": 1, "Year": 1}, output: {"Italy": 0}});
training.push({input: {"Germany": 1, "Year": 1}, output: {"Germany": 1}});
training.push({input: {"Germany": 1, "Year": 1}, output: {"Germany": 1}});
training.push({input: {"Germany": 1, "Year": 1}, output: {"Germany": 1}});
training.push({input: {"France": 1, "Year": 1}, output: {"France": 1}});
training.push({input: {"Belgium": 1, "Year": 1}, output: {"Belgium": 1}});

console.log("Starting training.");

var net = new brain.NeuralNetwork();
net.train(training);

console.log("Training finished.");

function buildRequest(teamOne, teamTwo) {
	var input = {};
	for(var j = 0; j < countries.length; j++) {
		input[countries[j]] = 0;
	}
	input[de2en[teamOne]] = 1;
	input[de2en[teamTwo]] = 1;
	input['Year'] = 1;
	var result = net.run(input);
	return {team1: result[de2en[teamOne]], team2: result[de2en[teamTwo]]};
}