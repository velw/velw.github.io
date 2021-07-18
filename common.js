// alert("This alert box was called with the onload event");

function writeHeader() {
  document.write("<div class='headerText'>velw.github.io</div>");
}

function writeFooter(createdDateString) {

  document.write("<hr/>");
  document.write("<div class='footerDiv'><div class='footerFloatDivLeft'>");
  writeFooterDatestamp(createdDateString);
  writeFooterStatcounter();
  document.write("</div><div class='footerFloatDivRight'>Site created and maintained by velw<br /><br /><a href='javascript:history.back()'>back</a> &ensp; <a href='..'>up</a> &ensp; <a href='/'>top</a></div></div><br style='clear:both' />");

  writeFooterExternalAnchorRewriter()
}

function writeFooterDatestamp(createdDateString) {

  document.write("Last updated: ");
  document.write("<script type='text/javascript'> ");
  document.write("updated = new Date(document.lastModified); ");
  document.write("theMonth = updated.toLocaleString('default', { month: 'long' }); ");
  document.write("theDate = updated.getDate(); ");
  document.write("theYear = updated.getFullYear(); ");

  document.write("dateSuffix = 'th'; ");
  document.write("textDate = ' ' + theDate; ");
  document.write("dateLastDigit = textDate.substr(textDate.length-1, textDate.length); ");
  document.write("if (dateLastDigit==='1') { ");
  document.write("  dateSuffix = 'st'; ");
  document.write("} else if (dateLastDigit==='2') { ");
  document.write("  dateSuffix = 'nd'; ");
  document.write("} else if (dateLastDigit==='3') { ");
  document.write("  dateSuffix = 'rd'; ");
  document.write("} ");

  document.write("document.write(theDate + dateSuffix + ' ' + theMonth + ', ' + theYear); ");
  document.write("</script><br /> ");

  document.write("Created: " + createdDateString + "<br />");

}


function writeFooterStatcounter() {

  document.write("Site visitors: ");
  document.write("<!-- Default Statcounter code for velw.github.io  --> ");
  document.write("<script type='text/javascript'> ");
  document.write("var sc_project=12424074;  ");
  document.write("var sc_invisible=0;  ");
  document.write("var sc_security='3b333f99';  ");
  document.write("var sc_text=2;  ");
  document.write("var scJsHost = 'https://'; ");

  document.write("document.write(\"<sc\"+\"ript type='text/javascript' src='\" + ");
  document.write("scJsHost+");
  document.write("\"statcounter.com/counter/counter.js'></\"+\"script>\"); ");
  document.write("</script> ");
  document.write("<!-- End of Statcounter Code --> ");
}

function writeFooterExternalAnchorRewriter() {

  document.write("<script type='text/javascript'> ");
  document.write("var anchors = document.getElementsByTagName('a'); ");
  document.write("for (i = 0; i < anchors.length; i++) { ");
  document.write("  var a = anchors[i]; ");
  document.write("  if ((a.host !== window.location.host) && (a.href !== 'javascript:history.back()')) { ");
  document.write("   a.setAttribute('target', '_blank'); ");
  document.write("  } ");
  document.write("} ");
  document.write("</script> ");

}