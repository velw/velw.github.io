

// *********************** Code for the timeout redirect to the live kundli page

var windowTimeoutHandle;
var windowTimeout = function () { location.href = "livekundali.html"; } // function to handle timeout is declared once, in a variable, so we don't create a new one each time
var clickListenerHandle;
var clickListener = function() { setRedirect(); }                      // function to handle click declared once so we don't create a new one each time

function clearRedirect() {

  if (windowTimeoutHandle) {                       
    window.clearTimeout(windowTimeoutHandle);      
  }
  if (clickListenerHandle) {                                     
    document.body.removeEventListener(clickListenerHandle);     
  }
}

function setRedirect() {     

// Could do this using HTTP, but the page we're loading relies heavily on javascript 
// so if it's not enabled we probably don't want to go there

  clearRedirect(); // Clear the previous listener so we don't add a timeout every time this function runs

  var MILLISECONDS_IN_A_SECOND = 1000;
  var SECONDS_IN_A_MINUTE = 60;
  var minutesBeforeRedirect = 12; 

  windowTimeoutHandle = window.setTimeout(windowTimeout, (MILLISECONDS_IN_A_SECOND * SECONDS_IN_A_MINUTE * minutesBeforeRedirect));

  clickListenerHandle = document.body.addEventListener('click', clickListener, true);      // reset the timeout each time a click occurs on the page
}

// *********************** Code for the banner text at the top of the page

function writeBanner() {

  var messages = [     // note, no comma after the last one!
    'Where is your attention?',
    'Where is your attention?',
    'Where is your attention?',
    'Where is your attention?',
    'Where is your attention?',
    'Where is your attention?',
    'What is your mind moving towards right now?',
    'What is your mind moving towards right now?',
    'What is your mind moving towards right now?',
    'What is your mind moving towards right now?',
    'What does success look like today?',
    'How will you succeed today?',
    'With the right plan, and the right execution, you will succeed.',
    'If you keep executing on the plan, you will succeed.',
    'Keep executing the plan. Follow your system.',
    'Keep the promises you make to yourself.',
    'Are you executing today on your commitments to yourself?',
    'Address what\'s holding you back.',
    'How would today look if life were as you would choose?',
    'Are these the results you want?',
    'Is this who you are?',
    'Is this who you are?',
    'This is who they are.',
    'Contain what disrupts your peace.',
    'Live in reality.',
    'Live in reality.',
    'What can you do today to move closer to the life you want?',
    'Nurture all that you are, whether or not it is seen or valued by others.',
    'Choose how you value yourself.',
    'Everything happens for a reason &#x1f64f;',
    'When you\'re talking, you\'re not listening.',
    'Before taking action, check in with yourself.',
    'When communicating disagreement, think about the goal.',
    'Do the work.',
    'Do the work.',
    'Do the work.',
    'Do you have the resources right now to show up for this situation the way you\'d choose?',
    'Do you have the resources right now to be present for this situation the way you\'d choose?',
    'Are you present for this situation the way you\'d choose?',
    'Are you showing up for this situation the way you\'d choose?',
    'Be present.',
    'Be present.',
    'Are you coming from a place of love, care and compassion right now?',
    'Change the script.',
    'Redefine what can be done.',
    'Recognise illusion.',
    'Recognise attachment.',
    'Does this situation give you what you need to be present the way you\'d choose?',
    'Does this situation give you what you need to be at peace?',
    'What do you need to be present the way you\'d choose?',
    'What do you need to be at peace?',
    'Think about the quality of your attention.',
    'Foster connection in every interaction.',
    'Love your enemies.',
    'Love is care.',
    'Love is care.',
    'Love is listening.',
    'Love is listening.',
    'Love is holding space.',
    'Love is holding space.',
    'Love is remaining an ally as they learn their lessons.',
    'Love is valuing someone for everything they were, are and can be.',
    'If it\'s worth doing, it\'s worth bringing your full attention.',
    'You don\'t need more time. You need more focus.',
    'If they can\'t acknowledge your reality, why would you worry about meeting their expectations?',
    'How you value yourself shapes how others value you.',
    'Value yourself, fully.',
    'Are the conditions right for this conversation?',
    'Are you in the right frame of mind for this conversation?',
    'The other person <a href="https://seths.blog/2016/12/the-other-person-is-always-right/">is always right</a>.',
    'What\'s moving in the right direction? What isn\'t?',
    'Know your worth. Live it fully.',
    'Cultivate peace, stillness and abundance.',
    'Cultivate peace, stillness and abundance.',
    'Relax your neck and shoulders.',
    'Relax your shoulders.',
    'Stand up straight.',
    'Wrists when typing: level, supported and relaxed',
    'No justice, no peace.',
    'How do you feel?',
    'On task?',
    'On schedule?',
    'What\'s driving this sense of urgency?',
    'Choose peace.',
    'Do what you can.',
    'Quell all-or-nothing thinking: keep doing what you can.',
    'Stop giving up in small ways — they are cumulative.',
    'Keep the vision clear.',
    'Never stop dreaming.',
    'Don\'t let their &#x2757; become your &#x2757;',
    'Return to the moment between tasks.',
    'Working-day priorities: rest, maintenance and nourishment.',
    'Weekend priorities: extinguish urgency, silence the "alarm," switch from "away from" to "towards".',
    'Practice discipline.',
    'If you keep doing what you\'ve been doing, you\'ll keep getting what you\'ve been getting.',
    'An hour not wasted on social media is the day\'s housework done.',
    'An hour not wasted on social media could be the day\'s housework done.',
    'Address quickly anything that affects your experience, your discipline or your possibilities.',
    'Do you feel you can succeed today?',
    'What does success look like?',
    'No crossed transactions.',
    'No shame.',
    'Is it defeat? Or liberation?',
    'You can\'t see yourself as "more" without seeing others as "less".',
    'Defeat is feeling you cannot be the person you want to be.',
    'What\'s stopping you from being the person you want to be?',
    'What could you be doing right now to make the life you want a reality?',
    'Don\'t run down the battery.',
    'Enter non-working days fully charged.',
    'Keep starting.',
    'When the wind picks up, move down the tree.',
    'Intentions can be good or bad. Needs are neither.',
    'No one is less. No one is more.',
    'Judge less.',
    'On a long enough timeline, reality always wins.', 
    '"The cake is a lie."',
    '"The snacks are free."',
    '"No matter how far you have gone on the wrong road, turn back." — Turkish proverb',
    '"You can\'t build a reputation on what you\'re going to do" — Henry Ford',
    '"We are what we repeatedly do" — Will Durant (paraphrasing Aristotle)',
    '"If I have seen further, it is by standing on the shoulders of giants" — Sir Isaac Newton',
    '"You cannot serve from an empty vessel" — Eleanor Brownn',
    '"You cannot serve from an empty vessel" — Eleanor Brownn',
    '"You cannot serve from an empty vessel" — Eleanor Brownn',
    '"The pain will leave once it has finished teaching you" — Bruce Lee'
    ];

  var m = Math.floor(Math.random() * messages.length);

  document.write('<div class="box boxBanner">');     // only add the box with the banner if javascript is activated
//  document.write('Here\'s some banner text');
  document.write(messages[m]);
  document.write('</div>'); 

//  document.write('<div class="box boxBanner">');     // only add the box with the banner if javascript is activated
//  document.write('<em>10 minutes before!</em>');
//  document.write('</div>'); 
}

// *********************** Code for world clock

var worldClockTimeout;

function updateWorldTime() { 

  // 1. Work through page finding all the span tags that are class "world time"
  var times = document.getElementsByClassName('worldClockTime'); 
  var seconds = 0;

  for (i = 0; i < times.length; i++) { 
    var t = times[i]; 
    var localeString;
    // 2. For each one, pull the id and then use a case statement to match to a localeString (here - so you don't have to embed the localeString as an element id and then not be able to use the same locale twice)
    switch(t.id) {
      case "tokyo":
        localeString = "Asia/Tokyo";
        break;
      case "newdelhi":
        localeString = "Asia/Kolkata";
        break;
      case "london":
        localeString = "Europe/London";
        break;
      case "washington":
        localeString = "America/New_York";
        break;
      case "sanfrancisco":
        localeString = "America/Los_Angeles";
        break;
      default:
        localeString = "Asia/Tokyo";
    } 

    // 3. Write the time in that locale as the content of the span tag (don't forget to check if it's the day before or after!)
    var dateHere = new Date();
    var dateThere = new Date(dateHere.toLocaleString('en-US', { timeZone: localeString }));

    var dayShift = "";
    var amPm = "am";
    var hours = dateThere.getHours();
    if (hours > 11) {
      amPm = "pm";
      if (hours > 12) {
        hours = hours - 12;
      }
    } else if (hours == 0) {
      hours = 12;
    }
    var minutes = dateThere.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (dateThere.getDate() > dateHere.getDate()) {
      dayShift = "(+1)";
    } else if (dateThere.getDate() < dateHere.getDate()) {
      dayShift = "(-1)";
    }
    t.textContent = hours + ":" + minutes + " " + amPm + " " + dayShift;

    seconds = dateHere.getSeconds();
  }

  var MILLISECONDS_IN_A_SECOND = 1000;
  var SECONDS_IN_A_MINUTE = 60;
  var interval = (MILLISECONDS_IN_A_SECOND * (SECONDS_IN_A_MINUTE - seconds));
  worldClockTimeout = setTimeout(updateWorldTime, interval);
}

function startWorldClock() {
  updateWorldTime();
}

function stopWorldClock() {

  if (worldClockTimeout) {
    clearTimeout(worldClockTimeout);
  }
}


