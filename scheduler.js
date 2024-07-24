// *********************** Code for scheduler

// Scratch this. Do a more ellaborate one at some point in the future that uses the offset from midnight or dawn

/**
HTML:



   <div class="box boxInColumn">
<div class="boxTitle" id="schedulerNow">Now:</div>
<span id="schedulerNext">Next:</span>
   </div>

*/






var schedulerTimeout;

function updateScheduler() { 

  // Schedule
  var scheduleArray = [[ "2024-04-23T19:30:00.000-04:00", 'Second', 'Third', 'The last one' ],[ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],[ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]];    


  // 1. Find the item in the schedule array that matches the current time, by comparing the current time
  var timeNow = new Date();


  // 2. Update the "Now" label with the current activity

  // 3. Update the "Next" label with the next activity and time



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


    seconds = dateHere.getSeconds();
  }

  var MILLISECONDS_IN_A_SECOND = 1000;
  var SECONDS_IN_A_MINUTE = 60;
  var interval = (MILLISECONDS_IN_A_SECOND * (SECONDS_IN_A_MINUTE - seconds));
  schedulerTimeout = setTimeout(updateScheduler, interval);
}

function getTime(dateObject) {

    var dateThere = new Date(dateObject.toLocaleString('en-US', { timeZone: localeString }));

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
    return (hours + ":" + minutes + " " + amPm + " " + dayShift);
}

function startScheduler() {
  updateScheduler();
}

function stopScheduler() {

  if (schedulerTimeout) {
    clearTimeout(schedulerTimeout);
  }
}