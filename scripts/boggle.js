const dice = [
  ["R", "I", "F", "O", "B", "X"],
  ["I", "F", "E", "H", "E", "Y"],
  ["D", "E", "N", "O", "W", "S"],
  ["U", "T", "O", "K", "N", "D"],
  ["H", "M", "S", "R", "A", "O"],
  ["L", "U", "P", "E", "T", "S"],
  ["A", "C", "I", "T", "O", "A"],
  ["Y", "L", "G", "K", "U", "E"],
  ["Qu", "B", "M", "J", "O", "A"],
  ["E", "H", "I", "S", "P", "N"],
  ["B", "A", "L", "I", "Y", "T"],
  ["E", "Z", "A", "V", "N", "D"],
  ["R", "A", "L", "E", "S", "C"],
  ["U", "W", "I", "L", "R", "G"],
  ["P", "A", "C", "E", "M", "D"],
  ["V", "E", "T", "I", "G", "N"],
];
const diceEsp = [
  ["Q", "B", "Z", "J", "X", "L"],
  ["E", "H", "L", "R", "D", "O"],
  ["T", "E", "L", "P", "C", "I"],
  ["T", "T", "O", "T", "E", "M"],
  ["A", "E", "A", "E", "E", "H"],

  ["T", "O", "U", "O", "T", "O"],
  ["N", "H", "D", "T", "H", "O"],
  ["S", "S", "N", "S", "E", "U"],
  ["S", "C", "T", "I", "E", "P"],
  ["Y", "I", "F", "P", "S", "R"],

  ["O", "V", "C", "R", "G", "R"],
  ["L", "H", "N", "R", "O", "D"],
  ["R", "I", "Y", "P", "R", "H"],
  ["E", "A", "N", "D", "N", "N"],
  ["E", "E", "E", "E", "M", "A"],

  ["A", "A", "A", "F", "S", "R"],
  ["A", "D", "A", "I", "S", "R"],
  ["D", "O", "R", "D", "L", "N"],
  ["M", "N", "N", "E", "A", "G"],
  ["I", "T", "A", "T", "I", "E"],

  ["A", "U", "M", "E", "E", "O"],
  ["U", "I", "F", "A", "S", "R"],
  ["C", "C", "Ñ", "N", "S", "T"],
  ["E", "T", "I", "L", "A", "C"],
];
let getDifference = (setA, setB) => {
  return new Set([...setA].filter((element) => !setB.has(element)));
};
var DICECOLS = 4,
  DICEROWS = 4,
  MINIMUMWORDLENGTH = 3,
  activeGame = false,
  allWords = false,
  boardLetters = [],
  both = false,
  collectiveWords = new Set(),
  currentDictionary = [],
  dictionary = [],
  dictionaryCommon = [],
  dictionarySpa = [],
  enteredCommonWords = new Set(),
  enteredWords = [],
  enteredWordsPerUser = {},
  enteredWordsSet = new Set(),
  enteredWordsSetPerUser = {},
  gameActive = false,
  gameChannel = {},
  gameChannelID = "",
  gameFinished = false,
  gameType = "individual",
  groupScore = 0,
  personMap = {},
  plurals = false,
  possible = false,
  remainingWords = 0,
  score = 0,
  scorePerUser = {},
  scoringWords = [],
  scoringWordsPerUser = {},
  showWords = false,
  spanish = false,
  timerID = "",
  validCommonWords = new Set(),
  validWords = new Set(),
  wordleTimer = null,
  wordleTimerID = "",
  wordsPerLetter = {},
  time = "1:00";
let interaction = null,
  timerMessage = null;

async function startGame(rows) {
  if (rows > 8) {
    rows = 8;
  }
  if (rows < 2) {
    rows = 2;
  }
  let letters = [];
  DICECOLS = rows;
  DICEROWS = rows;
  if (DICECOLS < 2) {
    DICEROWS = 2;
    DICECOLS = 2;
  }
  //Get dice
  var diceSelection = [];
  for (var i = 0; i < DICECOLS * DICEROWS; i++) {
    var random = Math.floor(Math.random() * 6);
    if (spanish) {
      diceSelection[i] = diceEsp[i % 15][random];
    } else {
      diceSelection[i] = dice[i % 15][random];
    }
  }
  letters = getLetters(diceSelection);
  boardLetters = letters;
  var printedBoard = getPrinted(letters);
  let boardChannel = await gameChannel.send(printedBoard);
  let count = gameType == "wordle" ? 4 : 3;
  console.log("normal words");
  validWords = await getAllValidWords(count, false);
  console.log("common words");
  validCommonWords = await getAllValidWords(count, true);
  enteredWordsSet = new Set();
  enteredWordsPerUser = {};
  enteredWordsSetPerUser = new Set();
  enteredCommonWords = new Set();
  scorePerUser = {};
  scoringWordsPerUser = {};
  groupScore = 0;
  collectiveWords = new Set();
  if (gameType != "wordle") {
    // startTimer();
  }
  score = 0;
  groupScore = 0;

  enteredWords = [];
  gameActive = true;
  scoringWords = [];
  remainingWords = getDifference(validCommonWords, enteredCommonWords).size;
}

function getPrinted(letters) {
  var pretty = "";
  for (var i = 0; i < letters.length; i++) {
    for (var j = 0; j < letters[i].length; j++) {
      var letter = letters[i][j];
      if (letter == "Qu") letter = "Q";
      var emoji = ":regional_indicator_" + letter.toLowerCase() + ":";
      if (letter.length == 1) {
        pretty += emoji + " ";
      } else {
        pretty += emoji;
      }
    }
    pretty += "\n";
  }
  return pretty;
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getLetters(letterArray) {
  var i = 0;
  var letters = [];
  for (var j = 0; j < DICECOLS; j++) {
    letters[j] = [];
    for (var k = 0; k < DICEROWS; k++) {
      letters[j].push(letterArray[i++]);
    }
  }
  letters = shuffle(letters);
  return letters;
}

function getPoints(word) {
  var length = word.length;
  var score = 0;
  switch (length) {
    case 1:
    case 2:
    case 3:
      score += 1;
      break;
    case 4:
      score += 2;
      break;
    case 5:
      score += 3;
      break;
    case 6:
      score += 4;
      break;
    case 7:
      score += 5;
      break;
    case 8:
    default:
      score += 11;
      break;
  }
  return score;
}

function endGame() {
  gameActive = false;
  gameFinished = true;
  clearTimeout(wordleTimer);
  if (gameType == "individual") {
    for (var personID in scoringWordsPerUser) {
      var myValidWords = "";
      if (allWords) {
        gameChannel.send(
          personMap[personID] + "'s score: " + scorePerUser[personID]
        );
        for (var i = 0; i < scoringWordsPerUser[personID].length; i++) {
          myValidWords += scoringWordsPerUser[personID][i] + "\n";
        }
      } else {
        var otherWords = [];
        var goodWords = scoringWordsPerUser[personID];
        for (var otherPersonID in scoringWordsPerUser) {
          if (otherPersonID == personID) {
            continue;
          }
          var otherPersonWords = scoringWordsPerUser[otherPersonID];
          goodWords = _.difference(goodWords, otherPersonWords);
        }
        var newScore = calculateScore(goodWords);
        gameChannel.send(
          personMap[personID] + "'s calculated score: " + newScore
        );
        for (var i = 0; i < goodWords.length; i++) {
          myValidWords += goodWords[i] + "\n";
        }
      }
      if (showWords) {
        gameChannel.send(
          personMap[personID] + "'s valid words:\n" + myValidWords
        );
      }
    }
  } else if (gameType == "team") {
    gameChannel.send("Score: " + score);
    var myValidWords = "";
    for (var i = 0; i < scoringWords.length; i++) {
      myValidWords += scoringWords[i] + "\n";
    }
    if (showWords) {
      gameChannel.send("Valid words:\n" + myValidWords);
    }
  } else if (gameType == "wordle") {
    gameChannel.send("Score: " + score);
    var myValidWords = "";
    for (var i = 0; i < scoringWords.length; i++) {
      myValidWords += scoringWords[i] + "\n";
    }
    if (showWords) {
      gameChannel.send("Valid bonus words:\n" + myValidWords);
    }

    // gameChannel.send("Score: " + score);
    var myValidWords = "";
    for (var i = 0; i < scoringWords.length; i++) {
      myValidWords += scoringWords[i] + "\n";
    }
    // gameChannel.send("Valid words:\n" + myValidWords);
    if (enteredCommonWords.size > 0) {
      gameChannel.send("All recorded words:\n");
      var allWords = Array.from(enteredCommonWords)
        .sort(function (a, b) {
          return a.length - b.length || a.localeCompare(b);
        })
        .join("\n");
      allWords = "```" + allWords + "```";
      gameChannel.send(allWords);
    }

    gameChannel.send("\nAll missing words:\n");
    let difference = getDifference(validCommonWords, enteredCommonWords);
    var allWords = Array.from(difference)
      .sort(function (a, b) {
        return a.length - b.length || a.localeCompare(b);
      })
      .join("\n");
    allWords = "```" + allWords + "```";
    gameChannel.send(allWords);

    if (enteredWords.size > 0) {
      gameChannel.send("All bonus words:\n");
      var allWords = Array.from(enteredWords)
        .sort(function (a, b) {
          return a.length - b.length || a.localeCompare(b);
        })
        .join("\n");
      allWords = "```" + allWords + "```";
      gameChannel.send(allWords);
    }
  }
  if (possible) {
    gameChannel.send("All possible words:\n");
    var allWords = Array.from(validWords).join("\n");
    gameChannel.send(allWords);
  }
}

function calculateScore(wordsArray) {
  var points = 0;
  for (var i = 0; i < wordsArray.length; i++) {
    points += getPoints(wordsArray[i]);
  }
  return points;
}

async function saveWord(inputtedWord, authorID, displayName) {
  console.log("Saving word:", inputtedWord, "from", displayName, authorID);
  if (gameType == "individual") {
    if (enteredWordsSetPerUser[authorID] == undefined) {
      enteredWordsSetPerUser[authorID] = new Set();
    }
    if (enteredWordsPerUser[authorID] == undefined) {
      enteredWordsPerUser[authorID] = [];
    }
    if (scoringWordsPerUser[authorID] == undefined) {
      scoringWordsPerUser[authorID] = [];
    }
    if (personMap[authorID] == undefined) {
      personMap[authorID] = displayName;
    }
    if (scorePerUser[authorID] == undefined) {
      scorePerUser[authorID] = 0;
    }

    var typedWord = inputtedWord.toLowerCase();
    // typedWord = typedWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    var isValid =
      !enteredWordsSetPerUser[authorID].has(typedWord) &&
      validWords.has(typedWord);
    enteredWordsSetPerUser[authorID].add(typedWord);
    if (isValid) {
      console.log("Valid");
      var tempScore = getPoints(typedWord);
      var userScore = parseInt(scorePerUser[authorID]);
      userScore += tempScore;
      scorePerUser[authorID] = userScore;
      groupScore += tempScore;
      scoringWordsPerUser[authorID].push(typedWord);
      if (plurals) {
        if (inputtedWord.charAt(inputtedWord.length - 1) == "s") {
          saveWord(inputtedWord.slice(0, -1), authorID, displayName);
        }
        if (
          inputtedWord.charAt(inputtedWord.length - 1) == "d" &&
          inputtedWord.charAt(inputtedWord.length - 2) == "e"
        ) {
          saveWord(inputtedWord.slice(0, -2), authorID, displayName);
          saveWord(inputtedWord.slice(0, -1), authorID, displayName);
        }
      }
    } else {
      console.log("Invalid");
    }
    var word = { word: typedWord, isValid: isValid };
    enteredWordsPerUser[authorID].push(word);
    collectiveWords.add(word);
  } else if (gameType == "team") {
    var typedWord = inputtedWord.toLowerCase();
    var isValid = !enteredWordsSet.has(typedWord) && validWords.has(typedWord);
    enteredWordsSet.add(typedWord);
    if (isValid) {
      var tempScore = getPoints(typedWord);
      score += tempScore;
      scoringWords.push(typedWord);
    }
    var word = { word: typedWord, isValid: isValid };
    enteredWords.push(word);
  } else if (gameType == "wordle") {
    var typedWord = inputtedWord.toLowerCase();

    var isValidCommon =
      !enteredCommonWords.has(typedWord) && validCommonWords.has(typedWord);
    var isValid = !enteredWordsSet.has(typedWord) && validWords.has(typedWord);
    enteredWordsSet.add(typedWord);
    console.log(
      "Wordle entered word:",
      typedWord,
      "isCommon:",
      isValidCommon,
      "isValid:",
      isValid
    );
    if (isValidCommon) {
      var tempScore = getPoints(typedWord);
      score += tempScore;
      scoringWords.push(typedWord);
      enteredCommonWords.add(typedWord);
      remainingWords = getDifference(validCommonWords, enteredCommonWords).size;
      await gameChannel
        .fetchMessage(timerID)
        .then((message) => message.edit(remainingWords))
        .catch(console.error);
      checkGameBoard();
    } else if (isValid) {
      var tempScore = getPoints(typedWord);
      score += tempScore;
      scoringWords.push(typedWord);
      enteredWords.add(typedWord);
    }
    //validCommonWords

    //enteredCommonWords
  }
}

function getAllValidWords(minimumWordLength, common) {
  return new Promise((resolve, reject) => {
    // console.log;
    MINIMUMWORDLENGTH = minimumWordLength;
    var thisSet = new Set();
    var ioff = [-1, 0, 1, -1, 1, -1, 0, 1];
    var joff = [1, 1, 1, 0, 0, -1, -1, -1];

    var flag = [];
    for (var i = 0; i < DICEROWS; i++) {
      flag[i] = [];
      for (var j = 0; j < DICECOLS; j++) {
        flag[i].push(false);
      }
    }

    for (var i = 0; i < DICEROWS; i++) {
      for (var j = 0; j < DICECOLS; j++) flag[i][j] = false;
    }
    for (var i = 0; i < DICEROWS; i++) {
      for (var j = 0; j < DICECOLS; j++) {
        flag[i][j] = true;
        recFindWords(
          boardLetters[i][j]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace("ñ", "n"),
          i,
          j,
          flag,
          thisSet,
          common
        );
        flag[i][j] = false;
      }
    }
    resolve(thisSet);
    return thisSet;
  });
}

function recFindWords(word, i, j, flag, thisSet, common) {
  // console.log("Find words, common:", common);
  var ioff = [-1, 0, 1, -1, 1, -1, 0, 1];
  var joff = [1, 1, 1, 0, 0, -1, -1, -1];

  if (word.length >= MINIMUMWORDLENGTH && isValidWord(word, common))
    thisSet.add(word);
  if (isValidPrefix(word, common)) {
    for (var cn = 0; cn < 8; cn++) {
      var ii = i + ioff[cn];
      var jj = j + joff[cn];
      if (ii < 0 || jj < 0) {
        continue;
      }
      if (
        ii < DICEROWS &&
        ii >= 0 &&
        jj < DICECOLS &&
        jj >= 0 &&
        !flag[ii][jj]
      ) {
        flag[ii][jj] = true;
        recFindWords(
          word + boardLetters[ii][jj].toLowerCase(),
          ii,
          jj,
          flag,
          thisSet,
          common
        );
        flag[ii][jj] = false;
      }
    } //end for
  } //end if
}

function isValidWord(wordToCheck, common) {
  let myDictionary = common ? dictionaryCommon : dictionary;
  var low = 0;
  var high = myDictionary.length;
  var mid;
  var mids;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    mids = myDictionary[mid]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace("ñ", "n");
    if (mids.localeCompare(wordToCheck) == 0) {
      // gameChannel.send("Valid");
      return true;
    }

    if (mids.localeCompare(wordToCheck) < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return false; // NOT_FOUND
}

function isValidPrefix(prefixToCheck, common) {
  let myDictionary = common ? dictionaryCommon : dictionary;
  var low = 0;
  var high = myDictionary.length;
  var mid;
  var mids;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    mids = myDictionary[mid]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace("ñ", "n");
    if (mids.startsWith(prefixToCheck)) {
      return true;
    }

    if (mids.localeCompare(prefixToCheck) < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return false; // NOT_FOUND
}

function isOnBoard(wordToCheck) {
  var stack = [];
  var thisSet = [];
  var ioff = [-1, 0, 1, -1, 1, -1, 0, 1];
  var joff = [1, 1, 1, 0, 0, -1, -1, -1];

  wordToCheck = wordToCheck.toLowerCase();
  var flag = [];
  for (var i = 0; i < DICEROWS; i++) {
    for (var j = 0; j < DICECOLS; j++) {
      flag[i][j] = false;
    }
  }
  for (var i = 0; i < DICEROWS; i++) {
    for (var j = 0; j < DICECOLS; j++) {
      if (wordToCheck.startsWith(boardLetters[i][j].toLowerCase())) {
        stack.push({
          i: i,
          j: j,
          currentNeighbor: -1,
          word: boardLetters[i][j].toLowerCase(),
          flag: flag,
        });
        while (!stack.empty()) {
          var e = stack.pop();
          if (e.word.localeCompare(wordToCheck) == 0) {
            var stack2 = [];
            stack.push(e);
            while (!stack.empty()) {
              e = stack.pop();
              stack2.push(Number(e.j * DICECOLS + e.i));
            }
            while (!stack2.empty()) {
              thisSet.push(stack2.pop());
            }
            return thisSet;
          }
          if (wordToCheck.startsWith(e.word)) {
            var cn = e.currentNeighbor + 1;
            while (cn < 8) {
              var ii = e.i + ioff[cn];
              var jj = e.j + joff[cn];
              if (
                ii < DICEROWS &&
                ii >= 0 &&
                jj < DICECOLS &&
                jj >= 0 &&
                !e.flag[ii][jj]
              ) {
                e.currentNeighbor = cn;
                stack.push(e);
                stack.push({
                  i: ii,
                  j: jj,
                  currentNeighbor: -1,
                  word: e.word + boardLetters[ii][jj].toLowerCase(),
                  flag: e.flag,
                });
                break;
              }
              cn++;
            } // while(cn ...
          } // if(wordToCheck...
        } //end while
      } // if(wordToCheck ...
    } // end for i,j
  }
  return null;
}
async function readTextFile(file, fileSpa, fileCommon) {
  var fs = require("fs"),
    path = require("path"),
    filePath = path.join(__dirname, file);

  await fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
    if (!err) {
      dictionary = data.split("\n");
      console.log("Data loaded");
    } else {
      console.log(err);
    }
  });

  var fsSpa = require("fs"),
    pathSpa = require("path"),
    filePathSpa = pathSpa.join(__dirname, fileSpa);

  await fsSpa.readFile(
    filePathSpa,
    { encoding: "utf-8" },
    function (err, data) {
      if (!err) {
        dictionarySpa = data.split("\n");
        console.log("Data loaded");
      } else {
        console.log(err);
      }
    }
  );

  var fsCommon = require("fs"),
    pathCommon = require("path"),
    filePathCommon = pathCommon.join(__dirname, fileCommon);

  await fsCommon.readFile(
    filePathCommon,
    { encoding: "utf-8" },
    function (err, data) {
      if (!err) {
        dictionaryCommon = data.split("\n");
        console.log("Common dictionary loaded");
        console.log("Dictionary length:", dictionaryCommon.length);
      } else {
        console.log(err);
      }
    }
  );
}

module.exports = {
  handleStart: async (params) => {
    // {time, size, showWords, team, plurals}
    time = params.time;
    let size = params.size;
    showWords = params.showWords;
    plurals = params.plurals;
    interaction = params.interaction;
    gameChannel = interaction.channel;
    gameChannelID = gameChannel.id;
    console.log("in handle command, channel:", gameChannel);
    gameActive = true;
    console.log("Game active: ", gameActive);
    timerMessage = await interaction.channel.send(`Timer: ${Math.floor(time / 60)}:${time % 60}`);
    // console.log("Time:", time);
    let timerInterval = setInterval(() => {
      time -= 1; 
      // console.log("Time:", time);
      // console.log("Timer:", `${Math.floor(time / 60)}:${time % 60}`);
      timerMessage.edit(`Timer: ${Math.floor(time / 60)}:${time % 60}`);
      if (time <= 0) {
        clearInterval(timerInterval);
        timerMessage.edit("Time's up!");
        endGame();
      }
    }, 1000);

    startGame(size);
  },
  initialize: (dictionaryIn, dictionaryCommonIn, dictionarySpaIn) => {
    dictionary = dictionaryIn;
    dictionaryCommon = dictionaryCommonIn;
    dictionarySpa = dictionarySpaIn;
  },
  handleWord: (word, message) => {
    console.log("Word:", word);
    console.log("Message channel:", message.channelId);
    if (message.channelId == gameChannelID && gameActive) {
      // gameChannel.send("Word: " + word);
      let authorID = message.author.id;
      let displayName = message.author.username;
      saveWord(word, authorID, displayName);
      message.delete();
    }
  },
  handleStop: () => {
    console.log("Trying to handle stop")
    if (gameActive) {
      gameActive = false;
      console.log("Game active: ", gameActive);
      // clearInterval(timerID);
      timerMessage.edit("Game stopped!");
      timerMessage = null;
      endGame();
    }
  },
  gameActive,
};
