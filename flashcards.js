const SimpleCard = require("./basic");
const Cloze = require("./cloze");
const inquirer = require("inquirer");
const fs = require("fs");
var correct = 0;
var wrong = 0;
var cardArray = [];

//Creates the application process framework
const flashcards = () => {

        inquirer.prompt([{

                type: 'list',
                name: 'userType',
                message: 'What do you wanna do?',
                choices: ['create-basic-cards', 'create-cloze-cards', 'basic-test', 'cloze-test', 'quit']
            }

        ]).then(function(choice) {

            if (choice.userType === 'create-basic-cards') {
                readCard('log.txt');
                createCard(basicPrompt, 'log.txt');
            } else if (choice.userType === 'create-cloze-cards') {
                readCard('cloze-log.txt');
                createCard(clozePrompt, 'cloze-log.txt');
            } else if (choice.userType === 'basic-test') {
                quiz('log.txt', 0);
            } else if (choice.userType === 'cloze-test') {
                quiz('cloze-log.txt', 0);
            } else if (choice.userType === 'quit') {
                console.log('Thank you for playing!');
            }
        });
    }

//Defines the application functions
const readCard = (logFile) => {
    cardArray = [];
    fs.readFile(logFile, "utf8", function(error, data) {
        var jsonContent = JSON.parse(data);
        for (let i = 0; i < jsonContent.length; i++) {
            cardArray.push(jsonContent[i]);
        }
    });
};

const createCard = (promptType, logFile) => {
    inquirer.prompt(promptType).then(function(answers) {
        cardArray.push(answers);
        if (answers.makeMore) {
            createCard(promptType, logFile);
        } else {
            writeToLog(logFile, JSON.stringify(cardArray));
            flashcards();
        }
    });
};

const quiz = (logFile, x) => {
    fs.readFile(logFile, "utf8", function(error, data) {
        var jsonContent = JSON.parse(data);
        if (x < jsonContent.length) {
            if (jsonContent[x].hasOwnProperty("front")) {
                var gameCard = new SimpleCard(jsonContent[x].front, jsonContent[x].back);
                var gameQuestion = gameCard.front;
                var gameAnswer = gameCard.back.toLowerCase();
            } else {
                var gameCard = new Cloze(jsonContent[x].text, jsonContent[x].cloze);
                var gameQuestion = gameCard.message;
                var gameAnswer = gameCard.cloze.toLowerCase();
            }
            inquirer.prompt([{
                name: "question",
                message: gameQuestion,
                validate: function(value) {
                    if (value.length > 0) {
                        return true;
                    }
                    return 'Take a guess!';
                }
            }]).then(function(answers) {
                if (answers.question.toLowerCase().indexOf(gameAnswer) > -1) {
                    console.log('Correct!');
                    correct++;
                    x++;
                    quiz(logFile, x);
                } else {
                    gameCard.printAnswer();
                    wrong++;
                    x++;
                    quiz(logFile, x);
                }
            })
        } else {
            console.log('Here is how you did: ');
            console.log('correct: ' + correct );
            console.log('wrong: ' + wrong );
            correct = 0;
            wrong = 0;
            flashcards();
        }
    });
};

const writeToLog = (logFile, info) => {
    fs.writeFile(logFile, info, function(err) {
        if (err)
            console.error(err);
    });
}

const basicPrompt = [{
    name: "front",
    message: "Type out the Front of Card: "
}, {
    name: "back",
    message: "Type out the Back of Card: "

}, {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card? (hit enter for YES)?',
    default: true
}]

const clozePrompt = [{
    name: "text",
    message: "Type a sentence, putting the part you want to hide in parentheses. For example, 'Don't drink and (drive)'",
    validate: function(value) {
        var parentheses = /\(\w.+\)/;
        if (value.search(parentheses) > -1) {
            return true;
        }
        return 'Please select a word or a phrase in your sentence to place in parentheses'
    }
}, {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card? (hit enter for YES)?',
    default: true
}]

const makeMore = {
    type: 'confirm',
    name: 'makeMore',
    message: 'Create another card ?(hit enter for YES)?',
    default: true
}

flashcards();
