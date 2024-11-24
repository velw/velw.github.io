// alert("This alert box was called with the onload event");

function writeHeaderText() {
  document.write("<div class='headerText'>velw.github.io</div>");
}

function writeFooter(createdDateString) {

  revealLocalContent();

  document.write("<hr/>");
  document.write("<div class='footerDiv'><div class='footerFloatDivLeft'>");

  // Datestamps
  document.write("Last updated: ");
  document.write("<script type='text/javascript'> ");
  document.write("  document.write(getLastModifiedDateString()); ");
  document.write("</script><br /> ");
  document.write("Created: " + createdDateString + "<br />");

  writeFooterStatcounter();

  document.write("</div><div class='footerFloatDivRight'>Site created and maintained by velw<br /><br />");
  document.write("<a href='javascript:history.back()'>back</a> &ensp; <a href='..'>up</a> &ensp; ");
  document.write("<a href='/'>top</a></div></div><br style='clear:both' />");

  rewriteExternalAnchors();
  rewriteReferenceAnchors();

}



function getLastModifiedDateString() {

  var updated = new Date(document.lastModified);
  var theMonth = updated.toLocaleString('default', { month: 'long' });
  var theDate = updated.getDate(); 
  var theYear = updated.getFullYear(); 

  var dateSuffix = 'th'; 
  var textDate = ' ' + theDate; 
  var dateLastDigit = textDate.substr(textDate.length-1, textDate.length); 

  if (dateLastDigit==='1') {
    dateSuffix = 'st'; 
  } else if (dateLastDigit==='2') { 
    dateSuffix = 'nd'; 
  } else if (dateLastDigit==='3') { 
  dateSuffix = 'rd'; 
  } 

  return(theDate + dateSuffix + ' ' + theMonth + ', ' + theYear); 
}

// Global variables for Statcounter
  var sc_project=12424074;  
  var sc_invisible=0;  
  var sc_security='3b333f99';  
  var sc_text=2;  
  var scJsHost = 'https://'; 

function writeFooterStatcounter() {     

// To do: change this (adjust values of statcounter global variables? and change "Site visitors" to "Page visitors"?) so it writes
// page-specific code for certain pages

  if (!hostIsLocal()) {
    document.write("Site visitors: <script type='text/javascript' src='" + scJsHost + "statcounter.com/counter/counter.js'></" + "script>");
  }

}

function rewriteExternalAnchors() {

  var anchors = document.getElementsByTagName('a'); 
  for (i = 0; i < anchors.length; i++) { 
    var a = anchors[i]; 
    //if ((a.host !== window.location.host) && (a.href !== 'javascript:history.back()')) { 
    if ((a.host !== window.location.host) && (a.href !== 'javascript:history.back()') && (a.href.indexOf('livekundali.html') < 0 )) { 
     a.setAttribute('target', '_blank'); 
    } 
  } 

}

function rewriteReferenceAnchors() {

  var anchors = document.getElementsByTagName('a'); 
  for (i = 0; i < anchors.length; i++) { 
    var a = anchors[i]; 
    if ((a.host == window.location.host) && (a.href.indexOf('#references') > -1)) { 
     var refDiv = document.getElementById(a.hash.substring(1)); 
     a.setAttribute('title', refDiv.textContent); 
    } 
  } 

}

function revealLocalContent() {

  if (hostIsLocal) {
    var elems = document.getElementsByClassName('localOnly'); 
    for (i = 0; i < elems.length; i++) { 
      var e = elems[i]; 
      e.style.display = 'initial'; 
    } 
  }

}

function hostIsLocal() {

  if (window.location.host.indexOf('localhost') > -1) {          // running on a local web server
    return true;
  } else if (window.location.protocol.indexOf('file:') > -1) {     // running from the file system
    return true;
  } else {
    return false;
  }

}
