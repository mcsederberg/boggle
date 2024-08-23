const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Intents,
  MessageEmbed,
  REST,
  Routes,
} = require("discord.js");
const Discord = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const config = require("./config.json");
const key = require("./key.json");
const options = config.options;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const _ = require("underscore");
const path = require("node:path");
const fs = require("fs");
const { gameActive, handleWord, initialize } = require("./scripts/boggle.js");

client.commands = new Collection();

const commands = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    console.log(filePath);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
      console.log(command.data.name);
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}
const rest = new REST().setToken(key.token);

console.log("Commands:", client.commands);
let dictionary = [],
  dictionaryCommon = [],
  dictionarySpa = [];

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(key.clientId, key.guildId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

client.once(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }

  // console.log(interaction);
});

client.login(key.token);
client.once(Events.ClientReady, () => {
  console.log("Ready!");
});
client.on(Events.MessageCreate, (msg) => {
  if (msg.author.bot) return;
  // console.log("Message Received", msg, "game active:", gameActive);
  handleWord(msg.content, msg);
  // msg.delete();
});

// return;

client.on("ready", async () => {
  console.log("Boggle bot initializing");
  await initializeBoggle();
  initialize(dictionary, dictionaryCommon, dictionarySpa);
});
client.on("message", (message) => {
  console.log("?");
  // if (!message.content.startsWith(config.prefix) || message.author.bot) return;
  if (message.author.bot) return;
  var authorID = message.author.id;
  var displayName = message.author.username;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  var command = args.shift().toLowerCase();
  if (command == "stop") {
    endGame();
    return;
  }
  console.log("??");
  if (command == "remaining") {
    console.log("In remaining, game type:", gameType);
    if (gameType == "wordle") {
      let difference = getDifference(validCommonWords, enteredCommonWords);
      message.channel.send(`Remaining word count: ${difference.size}`);
    }
  }
  // console.log("???", gameActive, message.content.startsWith(config.prefix), config.prefix, message.content, message);
  console.log("gameActive:", gameActive);
  console.log("content:", message.content);
  console.log("message:", message);
  console.log("prefix:", config.prefix);
  if (!gameActive && message.content.startsWith(config.prefix)) {
    var length = 4;
    console.log("?");
    initializeOptions();
    var tempShowWords = false;
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (arg) {
        if (isNaN(arg)) {
          switch (arg) {
            case "team":
              gameType = "team";
              break;
            case "2m":
              time = "2:00";
              break;
            case "3m":
              time = "3:00";
              break;
            case "30s":
              time = "0:30";
              break;
            case "showwords":
            case "words":
              tempShowWords = true;
              break;
            case "plurals":
              plurals = true;
              break;
            case "allwords":
              allWords = true;
              break;
            case "spanish":
            case "spa":
            case "espanol":
              spanish = true;
              break;
            case "both":
              both = true;
              break;
            case "possible":
              possible = true;
              break;
            case "wordle":
              gameType = "wordle";
            default:
            // code
          }
        } else {
          length = arg;
        }
      }
    }
    // console.log("Command:", command);
    switch (command) {
      case "wordle":
        gameType = "wordle";
      case "boggle":
        showWords = tempShowWords;
        if (command == "boggle") {
          message.channel.send("Time left:");
        }
        gameChannel = message.channel;
        startBoggle(length);
        message.delete();
        break;
      case "stop":
        endGame();
        message.delete();
        break;
      case "restartbot":
        resetBot(message.channel);
        break;
      case "help":
        var commands = require("./commands.json");
        var embed = new Discord.RichEmbed()
          .setColor("#8CD7FF")
          .setTitle(`**Parameters**`);
        // const helpEmbed = new Discord.MessageEmbed().setColor("#2295d4");

        Object.keys(commands).forEach((command) => {
          const currentCommand = commands[command];
          embed.addField(currentCommand.title, currentCommand.description);
        });
        message.channel.send(embed);
        break;
      case "remaining":
        console.log("In remaining, game type:", gameType);
        if (gameType == "wordle") {
          let getDifference = (setA, setB) => {
            return new Set([...setA].filter((element) => !setB.has(element)));
          };
          message.channel.send(
            getDifference(enteredCommonWords, validCommonWords).length
          );
        }
        break;
    }
  } else if (gameChannel == message.channel && gameActive) {
    var content = message.content;
    message.delete();
    //Game active, just watch for inputted words
    saveWord(content, authorID, displayName);
  }
});
// client.login(key.token);

// Turn bot off (destroy), then turn it back on
function resetBot(channel) {
  // send channel a message that you're resetting bot [optional]
  channel
    .send("Resetting...")
    .then((msg) => client.destroy())
    .then(() => client.login(key.token));
}

function initializeOptions() {
  gameType = "individual";
  plurals = false;
  allWords = false;
  spanish = false;
  both = false;
  possible = false;
}

async function initializeBoggle() {
  await readTextFile(
    "/dictionary.txt",
    "/dictionarySpa.txt",
    "/dictionaryCommon.txt"
  );
  console.log("Files read");
  return;
}

async function startBoggle(rows) {
  startGame(null, rows);
  if (gameType != "wordle") {
    var sent = await gameChannel.send(time);
    timerID = sent.id;
  } else {
    gameChannel.send("Remaining words:");
    var sent = await gameChannel.send(remainingWords);
    timerID = sent.id;

    gameChannel.send("Elapsed time:");
    var timerChannel = await gameChannel.send("00:00:00");
    wordleTimerID = timerChannel.id;
    startWordleTimer();
  }
}
function log(message) {
  console.log(message);
}
function readTextFile(file, fileSpa, fileCommon) {
  return new Promise(async (resolve, reject) => {
    var fs = require("fs"),
      path = require("path"),
      filePath = path.join(__dirname, file);

    let dictionaryRead = false;
    let dictionarySpaRead = false;
    let dictionaryCommonRead = false;
    const checkFinished = () => {
      if (dictionaryRead && dictionarySpaRead && dictionaryCommonRead) {
        resolve();
      }
    };

    await fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
      if (!err) {
        dictionary = data.split("\n");
        console.log("Dictionary loaded");
        dictionaryRead = true;
        checkFinished();
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
          console.log("Spanish dictionary loaded");
          dictionarySpaRead = true;
          checkFinished();
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
          console.log("Common Dictionary loaded");
          dictionaryCommonRead = true;
          checkFinished();
        } else {
          console.log(err);
        }
      }
    );
    console.log("Files read");
  });
}

async function startGame(letters, rows) {
  var currentDictionary = spanish ? dictionarySpa : dictionary;
  if (both) {
    currentDictionary = spanish;
    currentDictionary = dictionary.concat(dictionarySpa);
  }
  if (rows > 8) {
    rows = 8;
  }
  if (!Array.isArray(letters)) {
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
  }
  boardLetters = letters;
  var printedBoard = getPrinted(letters);
  // var embed = new Discord.RichEmbed()
  // 		  .setColor('#8CD7FF')
  // 		  .setTitle(`**Board**`)
  // 		  .setDescription(printedBoard);
  let boardChannel = await gameChannel.send(printedBoard);
  let count = gameType == "wordle" ? 4 : 3;
  console.log("normal words");
  validWords = getAllValidWords(count, false);
  console.log("common words");
  validCommonWords = getAllValidWords(count, true);
  enteredWordsSet = new Set();
  enteredWordsPerUser = {};
  enteredWordsSetPerUser = new Set();
  enteredCommonWords = new Set();
  time = "1:00";
  scorePerUser = {};
  scoringWordsPerUser = {};
  groupScore = 0;
  collectiveWords = new Set();
  if (gameType != "wordle") {
    startTimer();
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

const toHHMMSS = (numSecs) => {
  let secNum = parseInt(numSecs, 10);
  let hours = Math.floor(secNum / 3600)
    .toString()
    .padStart(2, "0");
  let minutes = Math.floor((secNum - hours * 3600) / 60)
    .toString()
    .padStart(2, "0");
  let seconds =
    secNum - hours * 3600 - (minutes * 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

async function startWordleTimer() {
  let elapsed = 0;
  let updateTimer = () => {
    elapsed += 15;
    gameChannel
      .fetchMessage(wordleTimerID)
      .then((message) => message.edit(toHHMMSS(elapsed)))
      .catch(console.error);
  };
  wordleTimer = setInterval(updateTimer, 15000);
}

async function startTimer() {
  var presentTime;
  await gameChannel
    .fetchMessage(timerID)
    .then((message) => (presentTime = message.content))
    .catch(console.error);
  var timeArray = presentTime.split(/[:]+/);
  var m = timeArray[0];
  var s = checkSecond(timeArray[1] - 1);
  if (s == 59) {
    m--;
  }
  await gameChannel
    .fetchMessage(timerID)
    .then((message) => message.edit(m + ":" + s))
    .catch(console.error);
  if (m <= 0 && s == 0) {
    endGame();
  } else {
    setTimeout(startTimer, 1000);
  }
}

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {
    sec = "0" + sec;
  } // add zero in front of numbers < 10
  if (sec < 0) {
    sec = "59";
  }
  return sec;
}

function checkGameBoard() {}

async function saveWord(inputtedWord, authorID, displayName) {
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
  console.log;
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
  return thisSet;
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
