/* *******************************************************************************************************
REMINDER: WE NOW USE AU FOR EVERYTHING!! (as all the planetary measurements are given in AU, only the moon,
 and so nodes - which rely on moon calcs, are odd ones out


To do:

NEXT: Adjust colours for Rahu (switch ray config to that of sun while doing, or just swap sun colours out)
       --- maybe did this already, but not sure if its right - > Add code to specify lightness for each ray "hue" (maybe change the name of that to colour?) or moon is gonna be blue [maybe - try changing the color first]
      - change existing lightness code to factors applied to whatever is in the hue
      -- work through variables to change constants to upper case names before I start copying and pasting to add planets
      Add other graha (including rahu/ketu)
      - add perturbations for three outer planets
      Add code to specify distance for both rahu and ketu as half way (on screen) between conventional planets and "new" planets (special lines for rahu/ketu?)

      Add utility class to draw line terminators with dots at increasing distances
      Add radial lines for earth
      Add Nakshatras (in just background colour - until I've figured out the element colours!)
      

Housekeeping:
-- consistency in variable names - clear distinction between screen and space (display / physical?)
-- check all calculations that don't need to be done with every animation frame (or physical "recalculation") are out of those loops/methods
-- make sure physical recalculations are not being done more often than necessary (check cycles for each planet, adjust accordingly 
    - maybe have one standard calculation based on time to complete ecliptic loop?)
-- simplify graphics wherever possible to minimize calculations
-- put formula from sweden / radixpro sites in as comments above code formula here, to see where each formula comes from

Calcs:
-- calculate screen radius of planets in proportion to actual size (perhaps also adjust according to distance?) - swedish guy has some formula for this!
   - keep existing size as "minimum"? then perhaps double that as maximum?
-- figure out if there's any good way to switch to the "true" north node (see bookmarks)

Graphics:
-- add radial lines and arcs (for signs... and for nakshatras?) for planets, with their glyphs at outer edge
-- use same element hues for signs, nakshatras and planet lines, for consistency??
-- make graha rays rotate/oscillate in proportion to speed of spinning at equator (see NASA) vid and/or speed of motion around ecliptic
-- add phases for interior grahas - Moon (Venus, Mercury?)

******************************************************************************************************* */


var fullDebug = false;
var isSidereal = true;
var drawPhases = true; // false; // true;

// *******************************************************************************************************



class Palette {    // set defaults, extend for different times of day
  constructor() {

    this.backgroundHue = 208;
    this.backgroundSaturation = 32;   // 37
    this.backgroundLuminosityMin = 6;
    this.backgroundLuminosityMax = 100;
    // was originally 90% saturation, 4% luminosity - check at night time, maybe up to 38% / 7%
    this.backgroundDetailStrongLuminosityDiff = 15; // was 12, then 14
    this.backgroundDetailMidLuminosityDiff = 10; // was 8, then 7 - try 12 or 10?
    this.backgroundLuminosityLightDarkCutoff = 67;  // for determining whether details should be lighter or darker than background

    // These should always be overwritten
    this.background;
    this.backgroundDetailStrong;
    this.backgroundDetailMid;

    this.backgroundDetailStrongLineWidth = 0.8;
    this.backgroundDetailMidLineWidth = 0.8;

    this.THEME_DAY = 1;
    this.THEME_DIMMING = 2;
    this.THEME_TWILIGHT = 3;
    this.THEME_NIGHT = 4;
    this.theme = 1;

    this.THEME_THRESHOLD_DIMMING = 9;     // 9
    this.THEME_THRESHOLD_TWILIGHT = 0;     // 0
    this.THEME_THRESHOLD_NIGHT = -7;       // -7    - maybe even -6???
    this.RAY_LIGHTNESS_CURVE_OFFSET = 2.2;  // 2.4 was good

    this.RAY_LIGHTNESS_DEFAULT = 60;
    this.RAY_LIGHTNESS_ADJUSTMENT_DOWN = -12; // was -10
    this.RAY_LIGHTNESS_ADJUSTMENT_UP = 12;
    this.rayLightnessAdjustment;
    this.RAY_ALPHA = 0.05;

    // first value is hue, second is hue range (either side of hue), third is saturation, fourth is lightness, fifth is lightness range (either side of lightness)
    this.SUN_HUES = [
      [30, 15, 100, this.RAY_LIGHTNESS_DEFAULT, 0],
      [40, 5, 100, this.RAY_LIGHTNESS_DEFAULT, 0],
      [46, 3, 100, 70, 10]
//      [8, 3, 100, 45, 10]
      ];

    this.MOON_HUES = [ 
      [207, 0, 100, 92, 8],    // light blues
      [207, 0, 100, 92, 8],    // more of the same light blues
      [207, 0, 40, 33, 10],    // dark blues
      [30, 3, 20, 75, 10]      // pale mushroom
      ];

    this.RAHU_HUES = [
      [7, 0, 100, 25, 5],      // red
      [7, 0, 0, 25, 5],        // deep red
      [0, 0, 100, 20, 5]       // charcoal
      ];

    this.KETU_HUES = [ 
      [50, 15, 20, 35, 10],  // dark
      [50, 15, 20, 35, 10],  // more dark
      [61, 10, 50, 75, 15]   // mid-light
      ];

    this.MERCURY_HUES = [
      [184, 5, 4, 87, 12],   // light grey (originally from the cyan bits on a real colour photo, although they seemed different when I reexamined!)
      [184, 5, 4, 58, 15],   // dark grey
      [230, 10, 8, 75, 10],   // highlight/colour from "real colour" NASA photo
      [16, 4, 12, 80, 10],   // highlight/colour from "real colour" NASA photo
      [140, 5, 87, 77, 10],  // emerald green light
      [140, 5, 98, 17, 50]  // emerald green dark
      ];

    this.VENUS_HUES = [
      [40, 5, 32, 70, 5],   //  from "real colour" NASA pic
      [198, 7, 14, 80, 10],   // from "real colour" NASA pic
      [299, 49, 90, 50, 10],  // from indigo (jyotish? gemstone?)
      [344, 10, 90, 84, 15],  // pale pink, from jyotish
      [26, 3, 100, 67, 0]  // peach
      ];

    this.MARS_HUES = [
      [358, 12, 100, 46, 18],   // deep, dark red from pinks through to orange
      [20, 8, 81, 61, 5],   // orangy brown, mid
      [22, 5, 65, 71, 9]  // from NASA photo, lighter
      ];

    this.JUPITER_HUES = [
      [138, 2, 34, 52, 8],   //  Turqoise green
      [216, 2, 58, 52, 8],   // Blue from the pic with turquoise green bits
      [9, 7, 77, 50, 10],    //  hue 4 - 14 red bits
      [9, 7, 77, 50, 10],    //  hue 4 - 14 red bits
      [30, 2, 48, 71, 8],    // Rust/orange/yellow bands
      [30, 2, 48, 71, 8],    // Rust/orange/yellow bands
      [40, 10, 22, 68, 5],   // More real colour photo
      [40, 10, 22, 68, 5],   // More real colour photo
      [54, 7, 89, 73, 7],    // Pale yellow
      [54, 7, 89, 73, 7],    // Pale yellow
      [54, 7, 89, 73, 7],    // Pale yellow
      [54, 7, 89, 73, 7],    // Pale yellow
      [46, 2, 99, 58, 15]    // Mustard yellow (gemstone)
      ];

    this.SATURN_HUES = [
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [240, 5, 100, this.RAY_LIGHTNESS_DEFAULT, 0]  // 
      ];

    this.URANUS_HUES = [
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [240, 5, 100, this.RAY_LIGHTNESS_DEFAULT, 0]  // 
      ];

    this.NEPTUNE_HUES = [
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [240, 5, 100, this.RAY_LIGHTNESS_DEFAULT, 0]  // 
      ];

    this.PLUTO_HUES = [
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [224, 5, 6, this.RAY_LIGHTNESS_DEFAULT, 0],   // 
      [240, 5, 100, this.RAY_LIGHTNESS_DEFAULT, 0]  // 
      ];

    this.EARTH_HUES = [
      [115, 25, 100, this.RAY_LIGHTNESS_DEFAULT, 0],   // Greens
      [190, 7, 100, this.RAY_LIGHTNESS_DEFAULT, 0],    // Pale blue
      [220, 15, 100, this.RAY_LIGHTNESS_DEFAULT, 0]     // Deep blue  (was 213)
      ];

    this.grahaBorder;
    this.GRAHA_BORDER_LINE_WIDTH = 0.8;
    this.GRAHA_BORDER_ALPHA = 0.85;
    this.GRAHA_SHADOW_ALPHA = 0.85;
    this.grahaShadow;


    this.GRAHA_BAND_MAX_PERCENT = (70 / 100); 
    this.GRAHA_BAND_MIN_PERCENT = (10 / 100); 
    this.grahaBandRadiusMax;
    this.grahaBandRadiusMin;

    this.GLYPH_BAND_MAX_PERCENT = (82 / 100); 
    this.glyphBandRadiusMax;
    this.RASHI_BAND_MAX_PERCENT = (94 / 100); 
    this.rashiBandRadiusMax;
    this.RASHI_BAND_CURVE_DEPTH_PERCENT_OUTER = ( 90 / 100);  // Was 190/100
    this.RASHI_BAND_CURVE_DEPTH_PERCENT_INNER = ( 190 / 100);  // Was 190/100
    this.RASHI_LABELS = ['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];

    this.NAKSHATRA_BAND_MIN_PERCENT = this.RASHI_BAND_MAX_PERCENT + (1 / 100);   // bit of a fudge, to easily separate these bands a bit more
    this.NAKSHATRA_BAND_MAX_PERCENT = (100 / 100);   // bandwidth percentage should be half the size of the rashi band, as there is overlap!
    this.nakshatraBandRadiusMax;
    this.NAKSHATRA_BAND_CURVE_DEPTH_PERCENT = ( 160 / 100);

    // note double codes are needed at Javascript uses 16-bit encoding (https://stackoverflow.com/questions/32915485/how-to-prevent-unicode-characters-from-rendering-as-emoji-in-html-from-javascrip) 
    // and suffix "\uFE0E" is needed to enforce text-rendering instead of coloured emoji (though this may not work in edge)
    this.NAKSHATRA_LABELS = ['\uD83D\uDC0E\uFE0E', // horse / Sshvini - alternative is '♘' - current needs testing in Edge
                            '\u25EC',              // Yoni / Bharani
                            '\uD83D\uDDE1',        // knife/spear / Krittika
                            '\u2638',              // wheel (of a chariot) / Rohini
                            '\uD83E\uDD8C\uFE0E',  // deer / Mrigashīrsha
                            '\uD83D\uDCA7\uFE0E',  // tear drop / Ardra
                            '\uD83C\uDFF9\uFE0E',  // bow (and arrow) / Punarvasu 
                            '\uD83C\uDFF5\uFE0E',  // rosette flower (lotus) / Pushya  - could use improvement if a lotus character appears
                            '\uD83D\uDC0D\uFE0E',  // a serpent / Āshleshā
                            '\uD83D\uDC51\uFE0E',  // a crown (the throne) / Maghā
                            '\uD83C\uDF33\uFE0E',  // a fig tree (more commonly the front legs of a bed - but no emoji for that) / Pūrva Phalgunī
                            '\uD83D\uDECF\uFE0E',  // four legs of a bed  /  Uttara Phalgunī
                            '\u270B\uFE0E',        //  a hand  / Hasta
                            '\uD83D\uDC8E\uFE0E',  // a gem  /  Chitra
                            '\uD83C\uDF31\uFE0E',  // the shoot of a plant / Svati
                            '\uD83C\uDFFA\uFE0E',  // pottery  / Vishakha
                            '\uD83C\uDFF4\uFE0E',  // flag of victory (a triumphal arch, overcoming adversity) / Anuradha
                            '\uD83D\uDC8D\uFE0E',  // a ring (circular amulet) / Jyeshtha
                            '\uD83C\uDF3F\uFE0E',  // a herb (tangled roots) / Mula
                            '\uD83C\uDF3E\uFE0E',  // rice/grain (a winnowing basket) / Purva Ashadha
                            '\uD83D\uDC18\uFE0E',  //  elephant tusk   / Uttara Ashadha
                            '\uD83D\uDC63\uFE0E',  //  footprints /  Sravana
                            '\uD83E\uDD41\uFE0E',  // drum /  Dhanishta
                            '\u25CB',              // empty circle / Shatabhisha
                            '\u26B1',              // a funeral urn  / Purva Bhadrapada
                            '\u2687',              // two dots (twins)  / Uttara Bhādrapadā
                            '\uD83D\uDC1F\uFE0E']; // a fish / Revati




  }

/*  calculate(solarAltitude) { */   // not sure why this parameter was left in the brackets
  calculate() {

    var solarAltitude = Sun.getInstance().getAltitude();

    if (solarAltitude > this.THEME_THRESHOLD_DIMMING) {
      this.theme = this.THEME_DAY;
      if (fullDebug) { console.log('Palette.calculate: Day theme selected'); }
    } else if ((solarAltitude <= this.THEME_THRESHOLD_DIMMING) && (solarAltitude > this.THEME_THRESHOLD_TWILIGHT)) { // Stops at "Blue Hour", four degrees below horizon
      this.theme = this.THEME_DIMMING;
      if (fullDebug) { console.log('Palette.calculate: Golden theme selected'); }
    } else if ((solarAltitude <= this.THEME_THRESHOLD_TWILIGHT) && (solarAltitude > this.THEME_THRESHOLD_NIGHT)) { // Includes "Blue Hour" and that part of "Civic Twilight", "Nautical Twilight", "Astronomical Twilight"
      this.theme = this.THEME_TWILIGHT;
      if (fullDebug) { console.log('Palette.calculate: Twilight theme selected'); }
    } else {  //   ** solarAltitude <= THEME_THRESHOLD_NIGHT
      this.theme = this.THEME_NIGHT;
      if (fullDebug) { console.log('Palette.calculate: Night theme selected'); }
    }

    switch(this.theme) {
    case(this.THEME_DAY):

      this.background = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + this.backgroundLuminosityMax + '%)'; 
      this.grahaShadow = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + this.backgroundLuminosityMax + '%, ' + this.GRAHA_SHADOW_ALPHA + ')';    
      this.grahaBorder = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + this.backgroundLuminosityMax + '%, ' + this.GRAHA_BORDER_ALPHA + ')';    


      this.backgroundDetailStrong = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (this.backgroundLuminosityMax - this.backgroundDetailStrongLuminosityDiff) + '%)';  
 
      this.backgroundDetailMid = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (this.backgroundLuminosityMax - this.backgroundDetailMidLuminosityDiff) + '%)';   


      break;

    case(this.THEME_DIMMING):
      var backgroundLuminosityFactor = (solarAltitude - this.THEME_THRESHOLD_TWILIGHT) / (this.THEME_THRESHOLD_DIMMING - this.THEME_THRESHOLD_TWILIGHT);  
      var backgroundLuminosity = this.backgroundLuminosityLightDarkCutoff + ((this.backgroundLuminosityMax - this.backgroundLuminosityLightDarkCutoff) * backgroundLuminosityFactor);

      this.background = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' +  backgroundLuminosity + '%)';  
      this.grahaShadow = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + backgroundLuminosity + '%, ' + this.GRAHA_SHADOW_ALPHA + ')';  
      this.grahaBorder = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + backgroundLuminosity + '%, ' + this.GRAHA_BORDER_ALPHA + ')';  


      this.backgroundDetailStrong = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (backgroundLuminosity - this.backgroundDetailStrongLuminosityDiff) + '%)';   
      this.backgroundDetailMid = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (backgroundLuminosity - this.backgroundDetailMidLuminosityDiff) + '%)';   


      break;

    case(this.THEME_TWILIGHT):
      var backgroundLuminosityFactor = (solarAltitude - this.THEME_THRESHOLD_NIGHT) / (this.THEME_THRESHOLD_TWILIGHT - this.THEME_THRESHOLD_NIGHT);
      var backgroundLuminosity = this.backgroundLuminosityMin + ((this.backgroundLuminosityLightDarkCutoff - this.backgroundLuminosityMin) * backgroundLuminosityFactor);

      this.background = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' +  backgroundLuminosity + '%)';  
      this.grahaShadow = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + backgroundLuminosity + '%, ' + this.GRAHA_SHADOW_ALPHA + ')';  
      this.grahaBorder = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + backgroundLuminosity + '%, ' + this.GRAHA_BORDER_ALPHA + ')';  


      this.backgroundDetailStrong = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (backgroundLuminosity + this.backgroundDetailStrongLuminosityDiff) + '%)';   

      this.backgroundDetailMid = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (backgroundLuminosity + this.backgroundDetailMidLuminosityDiff) + '%)';   


      break;

    case(this.THEME_NIGHT):
      this.background = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + this.backgroundLuminosityMin + '%)';   
      this.grahaShadow = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + this.backgroundLuminosityMin + '%, ' + this.GRAHA_SHADOW_ALPHA + ')';  
      this.grahaBorder = 'hsla(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' + this.backgroundLuminosityMin + '%, ' + this.GRAHA_BORDER_ALPHA + ')';  


      this.backgroundDetailStrong = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (this.backgroundLuminosityMin + this.backgroundDetailStrongLuminosityDiff) + '%)'; 
      this.backgroundDetailMid = 'hsl(' + this.backgroundHue + ', ' + this.backgroundSaturation + '%, ' 
                                  + (this.backgroundLuminosityMin + this.backgroundDetailMidLuminosityDiff) + '%)'; 

    } // end switch



    var offsetSolarAltitude = solarAltitude - this.RAY_LIGHTNESS_CURVE_OFFSET; // doing this here makes all the calcs simpler - but in practice we're adding the offset to all the thresholds (by subtracting it from what we're comparing to the unchanged thresholds)
    var curveFactor = 25; // must be an odd number, 3 or above - the higher the number, the sharper the transition

    if (offsetSolarAltitude > this.THEME_THRESHOLD_DIMMING) {

      this.rayLightnessAdjustment = this.RAY_LIGHTNESS_ADJUSTMENT_DOWN;

    } else if ((offsetSolarAltitude <= this.THEME_THRESHOLD_DIMMING) && (offsetSolarAltitude > this.THEME_THRESHOLD_TWILIGHT)) { 

      // needs to be a positive number, decreasing towards twilight point, for "cubic root" lightness adjustment to work correctly and keep the maximum difference between foreground and background with the smallest "crossover" period - 
      // in principle would calculate negative with same formula as after twilight, but Javascript limit on negative fraction power means it has to be reworked
      var rayLightnessFactor = (offsetSolarAltitude - this.THEME_THRESHOLD_TWILIGHT) / (this.THEME_THRESHOLD_DIMMING - this.THEME_THRESHOLD_TWILIGHT);  

      // multiply power by -1 to get the curve we would've got had we been able to use negative values for rayLightnessFactor
      // multiple ray lightness adj down by -1 because we just want the magnitude - we don't want the shape of the curve (this is all because we can't use a negative value of x, thanks javascript)
      // we had to flip the cubic function around the x axis, so need to flip the ray adjustment as well to compensate
      this.rayLightnessAdjustment = (-1 * this.RAY_LIGHTNESS_ADJUSTMENT_DOWN) * (-1 * Math.pow(rayLightnessFactor, (1/curveFactor)));   

    } else if ((offsetSolarAltitude <= this.THEME_THRESHOLD_TWILIGHT) && (offsetSolarAltitude > this.THEME_THRESHOLD_NIGHT)) { 

      // needs to be a positive number, increasing from twilight point, for "cubic root" lightness adjustment to work correctly and keep the maximum difference between foreground and background with the smallest "crossover" period
      var rayLightnessFactor = (this.THEME_THRESHOLD_TWILIGHT - offsetSolarAltitude) / (this.THEME_THRESHOLD_TWILIGHT - this.THEME_THRESHOLD_NIGHT);  

      this.rayLightnessAdjustment = this.RAY_LIGHTNESS_ADJUSTMENT_UP * (Math.pow(rayLightnessFactor, (1/curveFactor))); 

    } else {  //   ** solarAltitude <= THEME_THRESHOLD_NIGHT

      this.rayLightnessAdjustment = this.RAY_LIGHTNESS_ADJUSTMENT_UP;
    }






    if (fullDebug) {
    console.log('Palette.calculate: solarAltitude = ' + solarAltitude);
    console.log('Palette.calculate: this.theme = ' + this.theme);
    console.log('Palette.calculate: this.background = ' + this.background);
    console.log('Palette.calculate: this.backgroundDetailStrong = ' + this.backgroundDetailStrong);
    console.log('Palette.calculate: this.rayLightnessAdjustment = ' + this.rayLightnessAdjustment);
    }

  } // end calculate

  // A couple of utility methods for presentation
  // Draw a stylized line terminus along the Aries "zero" axis (positive X is right from center, positive Y is down from center) from startX to endX
  // Do this along the axis to avoid any issues with calculation rounding errors introducing misalignment between the different line segments
  drawLineQuadTerminus(context, startX, endX, strokeStyle, lineWidth) {

    context.save();

    var dotLength = (1.6 * lineWidth);          
    var length = endX - startX;
    var totalGap = length - ((5.5 + 4 + 2.5 + 1) * dotLength);    // note - we subtract a multiple of 1.5 each time from the length of the stroke (see loop below)

    var gaps = [];
    gaps.push((totalGap / 14) * 2);
    gaps.push((totalGap / 14) * 3);
    gaps.push((totalGap / 14) * 4);
    gaps.push((totalGap / 14) * 5);

    var turtleX = startX;
    context.strokeStyle = strokeStyle;   // Need to add specification of the line width here!
    context.lineWidth = lineWidth;

    // turtleX is current "pen" position as we move along the line, drawing each dot after each gap in turn
    for (var g = 0; g < gaps.length; g++) {
      turtleX += gaps[g];                           // move along the line, to the start of the dot after this gap
      context.beginPath();
      context.moveTo(turtleX, 0);
      turtleX += (5.5 * dotLength) - (g * 1.5);
      context.lineTo(turtleX, 0);
      context.stroke();
      context.closePath(); 
    }

    context.restore();
  }

  // There is some cut and pasting here. Had I worked hard enough, and if it had been needed, I may have been able to make this method calculate 
  // everything from a parameter saying how many dots I wanted. But it would've made the code impenetrable and hard to maintain. 
  // So I cut, pasted, and adjusted manually as two separate methods. That way I can use the two different methods where I wish - the "quad" version
  // for the outer chart areas, where there's more space to fill, and the "triple" version for the center, where things are more cramped.
  // (or maybe even use the "quad" version for the rashi and the "triple" version for the Nakshatra, too)
  drawLineTripleTerminus(context, startX, endX, strokeStyle, lineWidth) {

    context.save();

    var dotLength = (1.6 * lineWidth);          
    var length = endX - startX;
    var totalGap = length - ((4 + 2.5 + 1) * dotLength);    // note - we subtract a multiple of 1.5 each time from the length of the stroke (see loop below)

    var gaps = [];
    gaps.push((totalGap / 9) * 2);
    gaps.push((totalGap / 9) * 3);
    gaps.push((totalGap / 9) * 4);

    var turtleX = startX;
    context.strokeStyle = strokeStyle;   // Need to add specification of the line width here!
    context.lineWidth = lineWidth;

    // turtleX is current "pen" position as we move along the line, drawing each dot after each gap in turn
    for (var g = 0; g < gaps.length; g++) {
      turtleX += gaps[g];                           // move along the line, to the start of the dot after this gap
      context.beginPath();
      context.moveTo(turtleX, 0);
      turtleX += (4 * dotLength) - (g * 1.5);
      context.lineTo(turtleX, 0);
      context.stroke();
      context.closePath(); 
    }

    context.restore();
  }

}
var palette = new Palette();

// *******************************************************************************************************


function getDaysSinceMillennium(date) {  // Days since noon 1999/12/31 UTC (as orbital equations given for that date by Paul Schlyter)
  var y = date.getFullYear();
  var M = 1 + date.getMonth();
  var D = date.getDate();

  var days = (367 * y) - Math.floor(7 * ( y + Math.floor((M + 9) / 12) ) / 4) 
             - Math.floor(3 * ( Math.floor(( y + Math.floor((M - 9)/7) ) / 100) + 1 ) / 4)
             + Math.floor((275 * M) / 9) + D - 730515;

  var timeAsSeconds = ((date.getHours() * 60 * 60) + (date.getMinutes() * 60) + date.getSeconds());
  var timeAsDayDecimal = (timeAsSeconds / (60 * 60 * 24));
  days = days + timeAsDayDecimal;
  var timezoneOffsetAsDayDecimal = date.getTimezoneOffset() / (60 * 24);
  days = days + timezoneOffsetAsDayDecimal;

  return days;
}

function getJulianDay(date) {  // http://radixpro.com/a4a-start/julian-day-and-julian-day-number/ Note - presuming the date is not BC for our purposes here

  // Workaround
  var daysSinceMillennium = getDaysSinceMillennium(date);
  var julianDay = daysSinceMillennium + 2451543.5;

  return julianDay;
}


function rev(degrees) {   // Make sure a degree value is within 360 degrees, or convert accordingly
    degrees = degrees % 360;
    if (degrees < 0.0) {
      degrees += 360;
    }
    return degrees;
}

function revTime(hours) {   // Make sure a hour value is within 360 degree24 hours, or convert accordingly
    hours = hours % 24;
    if (hours < 0.0) {
      hours += 24;
    }
    return hours;
}

function degreesToRadians(degrees) {   // Convert degrees to radians, because maths libraries expect radians for trig functions (!!)
    return (degrees * Math.PI / 180);
}

function radiansToDegrees(radians) {   // Convert degrees to radians, because maths libraries expect radians for trig functions (!!)
    return (radians * 180 / Math.PI);
}


function refineEccentricAnomaly(eccentricAnomaly, eccentricity, meanAnomaly) {

    // *** refine iteratively until variation between iterations is under 0.001 (or until we've iterated 20 times)
    var e1 = eccentricAnomaly + 1;
    var count = 0;
    var diff = 0.0;
    do {
      e1 = eccentricAnomaly 
           - ((eccentricAnomaly - ((180/Math.PI) * eccentricity * Math.sin(degreesToRadians(eccentricAnomaly))) - meanAnomaly)
           / (1 - (eccentricity * Math.cos(degreesToRadians(eccentricAnomaly)))));
      count++;
      if (fullDebug) { console.debug('refineEccentricAnomaly: e1 (' + count + ') ' + e1 + ' \n'); }
      diff = Math.abs(e1 - eccentricAnomaly);
      eccentricAnomaly = e1;
      if (count >=20) { 
        console.log("refineEccentricAnomaly: ********** couldn't refine eccentric anomaly in 20 iterations **********"); 
      }
    } while ((diff > 0.001) && (count < 20)) 

    return eccentricAnomaly;
}


function getAyanamsha(date) {  // Calculates Lahiri ayanamsha

    var origin = new Date('1 Jan 2000 00:00:00 GMT');
    var ayanamshaAtOrigin = 23 + (51 / 60) + (11 / (60 * 60));  // 23°51'11" - from https://www.astro.com/astrowiki/en/Ayanamsha
    var precessionRateAtOrigin = 50.2564 / (60 * 60); // in degrees - from https://atmanandanatha.com/2020/08/01/astrology-lesson-5-ayanamsha/

    var yearsSinceOrigin = (getDaysSinceMillennium(date) - getDaysSinceMillennium(origin)) / 365.25;    // Basic calculation presuming a leap year every four years (needs another look)
    if (fullDebug) { console.debug('getAyanamsha: Years since 1 Jan 2000 00:00:00 GMT = ' + yearsSinceOrigin + ' \n'); }

    var ayanamsha = (yearsSinceOrigin * precessionRateAtOrigin) + ayanamshaAtOrigin;
    if (fullDebug) { console.debug('getAyanamsha: Lahiri ayanamsha degrees = ' + ayanamsha + ' \n'); }
    return ayanamsha;
}

function getSiderealTimeFromSun(sunsLongitude, hoursUT, terrestialLongitude) {

    var gmst0 = rev(sunsLongitude + 180) / 15;
    if (fullDebug) { console.debug('getSiderealTimeFromSun:  gmst0 = ' + gmst0 + ' \n\n'); }
    var siderealTime = gmst0 + hoursUT + revTime(terrestialLongitude / 15);
    return siderealTime;
}

function getFactorTatMidnightUT(date) {
    var dateAtMidnightUT = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0)); // get a new date object set to midnight UTC
    if (fullDebug) { console.debug('getFactorTatMidnightUT: dateAtMidnightUT = ' + dateAtMidnightUT); }
    return getFactorT(dateAtMidnightUT);
}

function getFactorT(date) {
    if (fullDebug) { console.debug('getFactorT: Julian Day = ' + getJulianDay(date)); }
    var factorT = (getJulianDay(date) - 2451545) / 36525;  // as per http://radixpro.com/a4a-start/factor-t-and-delta-t/
    return factorT;
}

function getSiderealTime(date, terrestrialLongitude) {  //wip http://radixpro.com/a4a-start/sidereal-time/

    // returns sidereal time in hours as a decimal value
    if (fullDebug) { console.debug('getSiderealTime: Called with values date = ' + date.toUTCString() + ' , terrestrialLongitude = ' + terrestrialLongitude); }

    // Requires factorT *at midnight UT* on the given date
    var factorT = getFactorTatMidnightUT(date)  // (getJulianDay(dateAtMidnightUT) - 2451545) / 36525;  // as per http://radixpro.com/a4a-start/factor-t-and-delta-t/
    if (fullDebug) { console.debug('getSiderealTime: factor T = ' + factorT); }

    // calculate sidereal time for 0:00 UT at Greenwich, so for 0 deg geographic longitude.
    var stDateDegrees = 100.46061837 + (36000.770053608 * factorT) + (0.000387933 * (factorT * factorT)) - ((factorT * factorT * factorT) / 38710000);
    stDateDegrees = rev(stDateDegrees);
    if (fullDebug) { console.debug('getSiderealTime: Sidereal time for 0UT at Greenwich in degrees (stDateDegrees) = ' + stDateDegrees); }
    var stDate = stDateDegrees / 15;    
    if (fullDebug) { console.debug('getSiderealTime: Sidereal time for 0UT at Greenwich in hours (stDate) = ' + stDate + ' \n\n'); }

    // correction for actual UT
    var decimalHours = ((date.getUTCHours() * 60 * 60) + (date.getUTCMinutes() * 60) + date.getUTCSeconds()) / (60 * 60);
    if (fullDebug) { console.debug('getSiderealTime: correction for actual UT (decimalHours) = ' + decimalHours); }
    var stDateTime = revTime(stDate + (decimalHours * 1.00273790935));
    if (fullDebug) { console.debug('getSiderealTime: Sidereal time for actual UT at Greenwich in hours (stDateTime) = ' + stDateTime); }

    // correction for geographic longitude
    var longitudeHours = terrestrialLongitude / 15;
    if (fullDebug) { console.debug('getSiderealTime: correction for actual geographic longitude (longitudeHours) = ' + longitudeHours); }
    var stDateTimePlace = revTime(stDateTime + longitudeHours);
    if (fullDebug) { console.debug('getSiderealTime: Returning sidereal time for actual UT at actual geographic longitude (stDateTimePlace) = ' + stDateTimePlace); }

    return stDateTimePlace;
}

function getEclipticObliquityApprox(date) {  // http://radixpro.com/a4a-start/obliquity/

  var factorT = getFactorTatMidnightUT(date);
 
  var eclipticObliquityApprox = (((23 * 60 * 60) + (26 * 60) + 21.488) / (60 * 60))   
                          - ((46.815 / (60 * 60)) * factorT) 
                          - ((0.00059 / (60 * 60)) * Math.pow(factorT, 2))
                          + ((0.001813 / (60 * 60)) * Math.pow(factorT, 3));

  return eclipticObliquityApprox;
}

function getEclipticObliquity(date) {  // http://radixpro.com/a4a-start/obliquity/
  
  if (true) { return getEclipticObliquityApprox(date); } // for speed, for now - if statement used to avoid warning in console log

  var factorT = getFactorTatMidnightUT(date);

  var smallT = factorT / 100;
  if (fullDebug) { console.debug('smallT = ' + smallT); }
 
  var eclipticObliquity = (((23 * 60 * 60) + (26 * 60) + 21.488) / (60 * 60))   
                          - ((4680.93 / (60 * 60)) * smallT) 
                          - ((1.55 / (60 * 60)) * Math.pow(smallT, 2))
                          + ((1999.25 / (60 * 60)) * Math.pow(smallT, 3)) 
                          - ((51.38 / (60 * 60)) * Math.pow(smallT, 4))
                          - ((249.67 / (60 * 60)) * Math.pow(smallT, 5)) 
                          - ((39.05 / (60 * 60)) * Math.pow(smallT, 6))
                          + ((7.12 / (60 * 60)) * Math.pow(smallT, 7)) 
                          + ((27.87 / (60 * 60)) * Math.pow(smallT, 8))
                          + ((5.79 / (60 * 60)) * Math.pow(smallT, 9)) 
                          + ((2.45 / (60 * 60)) * Math.pow(smallT, 10));

  return eclipticObliquity;
}

function getMediumCoeliTropical(siderealTime, terrestrialLongitude, eclipticObliquity) {  http://radixpro.com/a4a-start/medium-coeli/

  var rightAscensionMediumCoeli = 15 * siderealTime;
  if (fullDebug) { console.debug('getMediumCoeliTropical: Right Ascension of the Medium Coeli = ' + rightAscensionMediumCoeli); }

  var tanMediumCoeli = Math.sin(degreesToRadians(rightAscensionMediumCoeli)) / 
                    (Math.cos(degreesToRadians(rightAscensionMediumCoeli)) * Math.cos(degreesToRadians(eclipticObliquity)));

  if (fullDebug) { console.debug('getMediumCoeliTropical:  Math.sin(degreesToRadians(rightAscensionMediumCoeli)) = ' + Math.sin(degreesToRadians(rightAscensionMediumCoeli))); }
  if (fullDebug) { console.debug('getMediumCoeliTropical:  Math.cos(degreesToRadians(rightAscensionMediumCoeli)) = ' + Math.cos(degreesToRadians(rightAscensionMediumCoeli))); }
  if (fullDebug) { console.debug('getMediumCoeliTropical:  Math.cos(degreesToRadians(eclipticObliquity)) = ' + Math.cos(degreesToRadians(eclipticObliquity))); }

  if (fullDebug) { console.debug('getMediumCoeliTropical:  Tan of the medium coeli = ' + tanMediumCoeli); }

  var mediumCoeli = rev(radiansToDegrees(Math.atan(tanMediumCoeli)));

  // quadrant correction 
  if (((siderealTime < 12) && (mediumCoeli >= 180)) || ((siderealTime >= 12) && (mediumCoeli < 180))) {
    if (fullDebug) { console.debug('getMediumCoeliTropical:  Correcting quadrant (siderealTime = ' + siderealTime + ', mediumCoeli = ' + mediumCoeli + ')'); }
    mediumCoeli = rev(mediumCoeli + 180);
  }
  if (fullDebug) { console.debug('getMediumCoeliTropical:  Returning medium coeli = ' + mediumCoeli); }
  return mediumCoeli;
  
}

function getAscendantTropical(siderealTime, terrestrialLatitude, terrestrialLongitude, eclipticObliquity, mediumCoeliTropical) {  https://radixpro.com/a4a-start/the-ascendant/
  // siderealTime, eclipticObliquity and mediumCoeliTropical could be calculated within this method 
  // but passing as parameters for efficiency to avoid calculating multiple times

  var rightAscensionMediumCoeli = 15 * siderealTime;
  if (fullDebug) { console.debug('getAscendantTropical: Right Ascension of the Medium Coeli = ' + rightAscensionMediumCoeli); }

  var tanAscendant = Math.cos(degreesToRadians(rightAscensionMediumCoeli)) / 
                    ( ( (Math.sin(degreesToRadians(eclipticObliquity)) * Math.tan(degreesToRadians(terrestrialLatitude))) 
                    + (Math.cos(degreesToRadians(eclipticObliquity)) * Math.sin(degreesToRadians(rightAscensionMediumCoeli))) ) * (0 - 1));
  if (fullDebug) { console.debug('getAscendantTropical:  Math.cos(degreesToRadians(rightAscensionMediumCoeli)) = ' + Math.cos(degreesToRadians(rightAscensionMediumCoeli))); }
  if (fullDebug) { console.debug('getAscendantTropical:  Math.sin(degreesToRadians(eclipticObliquity)) = ' +  Math.sin(degreesToRadians(eclipticObliquity))); }
  if (fullDebug) { console.debug('getAscendantTropical:  Math.tan(degreesToRadians(terrestrialLatitude)) = ' + Math.tan(degreesToRadians(terrestrialLatitude))); }
  if (fullDebug) { console.debug('getAscendantTropical:  Math.cos(degreesToRadians(eclipticObliquity)) = ' + Math.cos(degreesToRadians(eclipticObliquity))); }
  if (fullDebug) { console.debug('getAscendantTropical:  Math.sin(degreesToRadians(rightAscensionMediumCoeli)) = ' + Math.sin(degreesToRadians(rightAscensionMediumCoeli)) + '\n'); }

  if (fullDebug) { console.debug('getAscendantTropical:  Tan of the ascendant = ' + tanAscendant); }

  var ascendantTropical = rev(radiansToDegrees(Math.atan(tanAscendant)));

  // hemisphere correction
  if ( ((mediumCoeliTropical < ascendantTropical) && ((ascendantTropical - mediumCoeliTropical) >= 180)) ||
      (mediumCoeliTropical > ascendantTropical) && ((mediumCoeliTropical - ascendantTropical) <= 180) ) {
    if (fullDebug) { console.debug('getAscendantTropical:  Correcting hemisphere (mediumCoeliTropical = ' + mediumCoeliTropical + ', ascendantTropical = ' + ascendantTropical + ')'); }
    ascendantTropical = rev(ascendantTropical + 180);
  }

  if (fullDebug) { console.debug('getAscendantTropical: Returning ascendantTropical = ' + ascendantTropical); }
  return ascendantTropical;
  
}


// *******************************************************************************************************

class RayOfLight {

  constructor(hues, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth) {

    // @hues is a two dimensional array with each row being a triplet of values, the first identifying the hue 
    // the second showing how many steps either side of the hue we can randomly go
    // the third saturation and the fourth lightness, and the fifth lightness range either side of lightness
    // @gleamSpeed = a value between 0 and 100 showing how far the beam extends "per tick"
    // @rotationSpeed = a number of degrees showing how much the beam rotates "per tick"

    var hueId = Math.floor(hues.length * Math.random());
    this.hue = rev(Math.floor((hues[hueId][0] - hues[hueId][1]) + ((hues[hueId][1] * 2) * Math.random())));
    this.saturation = hues[hueId][2];
    this.lightness = Math.floor((hues[hueId][3] - hues[hueId][4]) + ((hues[hueId][4] * 2) * Math.random()));

    this.minLength = minLength;
    this.maxLength = maxLength;
    this.powerFactor = powerFactor;

    var direction = 0;
    if (Math.random() > 0.5) { direction = 1; } else { direction = -1; }

    var rotationSpeedFactor = maxRotationSpeed - minRotationSpeed;
    this.rotationSpeed = (minRotationSpeed + (rotationSpeedFactor * Math.random())) * direction;
    if (Math.random() > 0.5) { direction = 1; } else { direction = -1; }  // set it again so we don't have all the rays rotating one way expanding/contracting at the same time
    var gleamSpeedFactor = maxGleamSpeed - minGleamSpeed;
    this.gleamSpeed = ((minGleamSpeed + (gleamSpeedFactor * Math.random())) / 100) * direction; // we need a value between 0 and 1;
    this.beamWidth = beamWidth;

    this.baseFactor = Math.pow((this.maxLength - this.minLength), (1 / this.powerFactor));
    this.lengthFactor = Math.random();

    this.currentLength = 0.0;
    this.currentAngle = Math.random() * 360;

  }

  calculate() {
    this.currentAngle = rev(this.currentAngle + this.rotationSpeed);
    this.lengthFactor = this.lengthFactor + this.gleamSpeed;
    if (this.lengthFactor < 0) { this.lengthFactor = 0; }  // because the Math.pow specification borks at raising x < 0 to powers that are decimals incase the result is an imaginary number
    if (this.lengthFactor > 1) { this.lengthFactor = 1; }  // because it's supposed to max out at 1
    this.currentLength = this.minLength + Math.pow((this.baseFactor * this.lengthFactor), this.powerFactor);
    if ((this.currentLength >= this.maxLength) || (this.currentLength <= this.minLength)) { 
      this.gleamSpeed = (-1 * this.gleamSpeed);  // reverse the adjustment "per tick" to the beam length if we're at the maximum or minimum length
    }
  }

  draw(context, originX, originY, shadowAngle, shadowExtent) {

    this.calculate();  

    // zero degrees is zero Aries

    var visibleLength = this.currentLength;

    if ((drawPhases) && (shadowExtent)) {        // checks shadowExtent is not zero and has been calculated (it only has if phase is calculated for this graha)

      // calculate visibleLength given phase and sun angle here!

      // shadowExtent = 15; // for debugging

      var distanceFromShadowAngle = rev(this.currentAngle - shadowAngle);
      if (distanceFromShadowAngle > (360 - shadowExtent)) {              // If currentAngle is just behind the shadowAngle, in a clockwise direction ...
        distanceFromShadowAngle = (-1 * distanceFromShadowAngle) + 360;  // ... normalize distanceFromShadowAngle so it's a value between 0 and shadowExtent
      }

      if (distanceFromShadowAngle < shadowExtent) {

        var FADE_MAX_ANGLE = 150;    // either 90 or 120, or somewhere in between - was 110 earlier in the cycle
        if ((shadowExtent - distanceFromShadowAngle) < FADE_MAX_ANGLE) {
          visibleLength = Math.max(this.minLength, visibleLength * (1 - ((shadowExtent - distanceFromShadowAngle) / FADE_MAX_ANGLE)));    // direct proportionality (aside from when the value is smaller than the minimum length)
        } else {
          visibleLength = this.minLength;
        }
      }

    }


/** 
    //           ******************************** DEBUGGING *********************************
    // let's start by drawing zero Aries, for debugging
    var beamX = originX + (-1 * (Math.cos(degreesToRadians(0)) * this.maxLength));
    var beamY = originY + (-1 * (Math.sin(degreesToRadians(0)) * this.maxLength));
    context.beginPath();
    context.moveTo(originX, originY);
    context.strokeStyle = "red";  
    context.lineWidth = this.beamWidth;
    context.lineTo(beamX, beamY);
    context.stroke(); 

    // now let's draw the shadow angle
    var beamX = originX + (-1 * (Math.cos(degreesToRadians(shadowAngle)) * this.maxLength));
    var beamY = originY + (-1 * (Math.sin(degreesToRadians(shadowAngle)) * this.maxLength));
    context.beginPath();
    context.moveTo(originX, originY);
    context.strokeStyle = "blue";  
    context.lineWidth = this.beamWidth;
    context.lineTo(beamX, beamY);
    context.stroke(); 
    //      ******************************** DEBUGGING *********************************
*/

    // Re-add var declarations after debugging!!!!
    var beamX = originX + (-1 * (Math.cos(degreesToRadians(this.currentAngle)) * visibleLength));
    var beamY = originY + (-1 * (Math.sin(degreesToRadians(this.currentAngle)) * visibleLength));

    context.beginPath();
    context.moveTo(originX, originY);
    context.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + (this.lightness + palette.rayLightnessAdjustment) + '%, ' + palette.RAY_ALPHA + ')';  
    context.lineWidth = this.beamWidth;
    context.lineTo(beamX, beamY);
    context.stroke(); 

  }
}

class Graha {

  constructor() {

    // Non-graha-specific variables
    this.daysSinceMillennium;
    this.siderealTime;
    this.eclipticObliquity; // oblecl, degrees
    this.ayanamsha;
    this.terrestrialLatitude; // used for calculating Sun's altitude

    // for unit conversions
    this.ONE_AU_IN_KILOMETERS = 149597870.7;  // from Wikipedia (see https://www.nature.com/articles/nature.2012.11416 )
    this.EARTH_RADIUS_IN_KILOMETERS = 6371;   // from NASA

    // Graha-specific
    this.name = 'Graha';
    this.glyph = 'X';
    
    // These four needed for Sun
    this.longitudeOfPeriapsis; // w, degrees - the point on the elliptic path that is closest to the centre of orbit
    this.meanDistance; // a, a.u.
    this.eccentricity; // e
    this.meanAnomaly; // M, degrees - fraction of an elliptic orbit's period that has ellapsed since periapsis (but assumes constant speed, which is true for circle not for elliptic path)

    // These two more needed for Moon etc.
    this.longitudeOfAscendingNode;  // N
    this.inclination; // i

    // These (onward) are calculated
    this.meanLongitude; // L, degrees - surely this is wrong/pointless because it doesn't take account of the eccentric anomaly
    this.eccentricAnomaly; // E, degrees - fraction of elliptic path that has been travelled since periapsis (accounting for the fact that speed of motion around the elliptic path isn't constant -- see Kepler)

    this.orbitalPerihelionAxisX; // X - rectangular coordinates in the orbital plane, where the X axis points towards the perihelion
    this.orbitalPerihelionAxisY; // Y - rectangular coordinates in the orbital plane, where the X axis points towards the perihelion
    this.orbitalPerihelionAxisZ; // Z - rectangular coordinates in the orbital plane, where the X axis points towards the perihelion MAYBE WE DONT NEED!


    //this.eclipticXpAxis; // X - rectangular coordinates (either heliocentric or geocentric), where the X axis points towards the perihelion
    //this.eclipticYpAxis; // Y - rectangular coordinates (either heliocentric or geocentric), where the X axis points towards the perihelion
    //this.eclipticZpAxis; // Z - rectangular coordinates (either heliocentric or geocentric), where the X axis points towards the perihelion MAYBE WE DONT NEED!

    this.distance; // r 
    this.trueAnomaly; // v 
    this.eclipticLongitudeTropical; // long
    this.eclipticLongitudeSidereal; 
    this.eclipticLatitude;
    this.heliocentricDistance;
    this.geocentricDistance;

    this.rectancularVernalAxisX; // X - rectangular coordinates (either heliocentric or geocentric), where the X axis points towards the vernal point
    this.rectancularVernalAxisY; // Y - rectangular coordinates (either heliocentric or geocentric), where the X axis points towards the vernal point
    this.rectancularVernalAxisZ; // Z - rectangular coordinates (either heliocentric or geocentric), where the X axis points towards the vernal point

    this.equatorialVernalAxisX; // X - rectangular coordinates in the equatorial plane, where the X axis points towards the vernal point
    this.equatorialVernalAxisY; // Y - rectangular coordinates in the equatorial plane, where the X axis points towards the vernal point
    this.equatorialVernalAxisZ; // Z - rectangular coordinates in the equatorial plane, where the X axis points towards the vernal point

    this.geocentricX; // X - rectangular geocentric coordinates, where the X axis points towards the vernal point
    this.geocentricY; // X - rectangular geocentric coordinates, where the X axis points towards the vernal point
    this.geocentricZ; // X - rectangular geocentric coordinates, where the X axis points towards the vernal point

    this.rightAscension; // RA, degrees
    this.declination; // Decl

    this.hourAngle; // HA, hours - The hour angle is zero when the celestial body is on the meridian
    this.azimuth; //
    this.altitude;

    this.elongation;
    this.phaseAngle;
    this.phase;

    // Constants and admin
    this.RADIUS; // kilometers
    this.lastCalculated;
    this.RECALCULATE_THRESHOLD = (1000 * 60); // sixty seconds by default

    // Display variables
    this.chartRays = [];
    this.chartGrahaRadius; // pixels
    this.chartGrahaHaloRadius; 
    this.chartOrbitalRadiusFactor; // a percentage, as a decimal, of how far through the graha band, from the center, this graha should be displayed

    this.chartDistanceFromOrigin;
    this.chartEclipticLongitude;
    this.chartPosX;
    this.chartPosY;

  }

  getChartPositionX() {
    return this.chartPosX;
  }

  getChartPositionY() {
    return this.chartPosY;
  }

  getGlyph() {
    return this.glyph;
  }

  getMeanAnomaly() {
    return this.meanAnomaly;
  }

  getMeanLongitude() {
    return this.meanLongitude;
  }

  getLongitudeOfAscendingNode() {
    return this.longitudeOfAscendingNode;
  }

  getDistance() {              // lets disable this at some point
    return this.distance;
  }

  getRectancularVernalAxisX() {
    return this.rectancularVernalAxisX;
  }

  getRectancularVernalAxisY() {
    return this.rectancularVernalAxisY;
  }

  getRectancularVernalAxisZ() {
    return this.rectancularVernalAxisZ;
  }

  getEclipticLongitudeTropical() {                    // all these methods should, perhaps, check whether the values have been calculated first!
    return this.eclipticLongitudeTropical;
  }

  getGeocentricDistance() {
    return this.geocentricDistance;
  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    this.daysSinceMillennium = daysSinceMillennium;
    this.eclipticObliquity = eclipticObliquity;
    this.siderealTime = siderealTime;
    this.terrestrialLatitude = terrestrialLatitude;
    this.ayanamsha = ayanamsha;

    // Implemented graha overload this method (to keep mechanism by which calculations are done encapsulated for OO) 
    // but call shared orbital calculations after performing graha-specific code following return from this super method

  }

  sharedOrbitalCalculations() {

    // Note - this has to include N (see the calculation for the moon, under the perturbations section) - N is zero for the sun
    this.meanLongitude = rev(this.longitudeOfAscendingNode + this.longitudeOfPeriapsis + this.meanAnomaly);

    this.eccentricAnomaly = this.meanAnomaly + ((180/Math.PI) * this.eccentricity * Math.sin(degreesToRadians(this.meanAnomaly)) * (1 + (this.eccentricity * Math.cos(degreesToRadians(this.meanAnomaly)))));
    this.eccentricAnomaly = refineEccentricAnomaly(this.eccentricAnomaly, this.eccentricity, this.meanAnomaly);


    // Testing converting this from sun only to general - ************RENAME THIS AS PER MOON SECTION 
    this.orbitalPerihelionAxisX = this.meanDistance * (Math.cos(degreesToRadians(this.eccentricAnomaly)) - this.eccentricity);
    this.orbitalPerihelionAxisY = this.meanDistance * (Math.sin(degreesToRadians(this.eccentricAnomaly)) * Math.sqrt(1 - (this.eccentricity * this.eccentricity)));


    this.distance = Math.sqrt((this.orbitalPerihelionAxisX * this.orbitalPerihelionAxisX) + (this.orbitalPerihelionAxisY * this.orbitalPerihelionAxisY));
    this.trueAnomaly = rev(radiansToDegrees(Math.atan2(this.orbitalPerihelionAxisY, this.orbitalPerihelionAxisX)));
    // now we have the graha's position in *its own* orbit, where the X axis points towards the perihelion

    // calculate graha's position in rectancular coordinates where the X axis points towards the vernal equinox - needed to calculate the Sun's altitude and 
    // the longitude of graha other than the Sun/Moon, where orbits were specified as heliocentric rather than geocentric and must be converted in rectangular coordinates


    // xeclip = r * ( cos(N) * cos(v+w) - sin(N) * sin(v+w) * cos(i) )
    this.rectancularVernalAxisX = this.distance 
                          * ( (Math.cos(degreesToRadians(this.longitudeOfAscendingNode)) * Math.cos(degreesToRadians(this.trueAnomaly + this.longitudeOfPeriapsis)))
                          - (Math.sin(degreesToRadians(this.longitudeOfAscendingNode)) * Math.sin(degreesToRadians(this.trueAnomaly + this.longitudeOfPeriapsis)) * Math.cos(degreesToRadians(this.inclination))) );
    if (fullDebug) { console.log('this.rectancularVernalAxisX = ' + this.rectancularVernalAxisX); }

    // yeclip = r * ( sin(N) * cos(v+w) + cos(N) * sin(v+w) * cos(i) )
    this.rectancularVernalAxisY = this.distance 
                          * ( (Math.sin(degreesToRadians(this.longitudeOfAscendingNode)) * Math.cos(degreesToRadians(this.trueAnomaly + this.longitudeOfPeriapsis)))
                          + (Math.cos(degreesToRadians(this.longitudeOfAscendingNode)) * Math.sin(degreesToRadians(this.trueAnomaly + this.longitudeOfPeriapsis)) * Math.cos(degreesToRadians(this.inclination))) );
    if (fullDebug) { console.log('this.rectancularVernalAxisY = ' + this.rectancularVernalAxisY); }

    // zeclip = r * sin(v+w) * sin(i)
    this.rectancularVernalAxisZ = this.distance * Math.sin(degreesToRadians(this.trueAnomaly + this.longitudeOfPeriapsis)) * Math.sin(degreesToRadians(this.inclination));
    if (fullDebug) { console.log('this.rectancularVernalAxisZ = ' + this.rectancularVernalAxisZ); }

  }

  convertHeliocentricCoordinatesToGeocentricCoordinates() {

    // From Swedish page, section 14:
    // To convert the planets' heliocentric positions to geocentric positions, we simply add the Sun's rectangular (x,y,z) coordinates
    // to the rectangular (x,y,z) heliocentric coordinates of the planet:
    // Let's do this for Mercury on our test date - we add the x, y and z coordinates separately:

    // xsun  = +0.881048   ysun  = +0.482098   zsun  = 0.0
    // xplan = -0.367821   yplan = +0.061084   zplan = +0.038699
    // -----------------------------------------------------------------
    // xgeoc = +0.513227   ygeoc = +0.543182   zgeoc = +0.038699

    // lets presume the sun isn't calling this method.

    var sun = Sun.getInstance();

    this.geocentricX = sun.getRectancularVernalAxisX() + this.rectancularVernalAxisX;     // FIX THESE later so we have getter methods, not directly reaching into the object
    this.geocentricY = sun.getRectancularVernalAxisY() + this.rectancularVernalAxisY;
    this.geocentricZ = sun.getRectancularVernalAxisZ() + this.rectancularVernalAxisZ;

  }

  calculateRectangularXFromSphericalCoordinates(latitude, longitude, distance) {  

    // See "3. Rectangular and spherical coordinates" on Swedish page
    // x = r * cos(RA) * cos(Decl)
    return (distance * Math.cos(degreesToRadians(longitude)) * Math.cos(degreesToRadians(latitude)));

  }

  calculateRectangularYFromSphericalCoordinates(latitude, longitude, distance) {  

    // See "3. Rectangular and spherical coordinates" on Swedish page
    // y = r * sin(RA) * cos(Decl)
    return (distance * Math.sin(degreesToRadians(longitude)) * Math.cos(degreesToRadians(latitude)));

  }

  calculateRectangularZFromSphericalCoordinates(latitude, longitude, distance) {  

    // See "3. Rectangular and spherical coordinates" on Swedish page
    // z = r * sin(Decl)
    return (distance * Math.sin(degreesToRadians(latitude)));

  }

  calculateSphericalLongitudeFromRectangularCoordinates(rectangularX, rectangularY, rectangularZ) {  

    // (based on formulas given for the moon etc. in swedish page)
    // long =  atan2( yeclip, xeclip )
    return rev(radiansToDegrees(Math.atan2(rectangularY, rectangularX)));
  }

  calculateSphericalLatitudeFromRectangularCoordinates(rectangularX, rectangularY, rectangularZ) {  

    // lat  =  atan2( zeclip, sqrt( xeclip*xeclip + yeclip*yeclip ) )
    return radiansToDegrees( Math.atan2(rectangularZ, Math.sqrt((rectangularX * rectangularX) + (rectangularY * rectangularY))) );
  }

  calculateSphericalRadiusFromRectangularCoordinates(rectangularX, rectangularY, rectangularZ) {  

    // r    =  sqrt( xeclip*xeclip + yeclip*yeclip + zeclip*zeclip )
    return Math.sqrt( (rectangularX * rectangularX) + (rectangularY * rectangularY) + (rectangularZ * rectangularZ) );
    // Note - the distance does change for planets initially specified in heliocentric orbits (which have a different distance relative to the geocentric earth)

  }


  calculateEclipticCoordinatesFromGeocentricOrbitalCoordinates() {      // OLD METHOD - TEST WITH RENAME, THEN DELETE!!

    // First, if geocentric coordinates haven't been defined (conversion method wasn't called), presume rectancular
    // coordinates with vernal equinox as X axis are already geocentric!

    if (!this.geocentricX) {
      console.log('Presuming rectancular vAxis coords are geocentric!');
      this.geocentricX = this.rectancularVernalAxisX;
      this.geocentricY = this.rectancularVernalAxisY;
      this.geocentricZ = this.rectancularVernalAxisZ;
    }


    // General formula for all graha (based on formulas given for the moon etc. in swedish page)
    // long =  atan2( yeclip, xeclip )
    this.eclipticLongitudeTropical = rev(radiansToDegrees(Math.atan2(this.geocentricY, this.geocentricX)));
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);

    // lat  =  atan2( zeclip, sqrt( xeclip*xeclip + yeclip*yeclip ) )
    this.eclipticLatitude = radiansToDegrees( Math.atan2(this.geocentricZ, 
                            Math.sqrt((this.geocentricX * this.geocentricX) + (this.geocentricY * this.geocentricY))) );

    // r    =  sqrt( xeclip*xeclip + yeclip*yeclip + zeclip*zeclip )
    this.distance = Math.sqrt( (this.geocentricX * this.geocentricX) + (this.geocentricY * this.geocentricY) + (this.geocentricZ * this.geocentricZ) );

    // Note - the distance does change for planets initially specified in heliocentric orbits (which have a different distance relative to the geocentric earth)

  }


  getAltitude() {

    // Everything below this point is to get the altitude (!), from the bottom of the sun section in the swedish page

    // calculation of rectangular coordinates in ecliptic plane isn't needed here - it's now done in main method using general formula for all graha rather than
    // the sun-specific formula given in the "sun" section of the swedish page


    this.equatorialVernalAxisX = this.rectancularVernalAxisX;  // of course
    this.equatorialVernalAxisY = (this.rectancularVernalAxisY * Math.cos(degreesToRadians(this.eclipticObliquity))) - (this.rectancularVernalAxisZ * Math.sin(degreesToRadians(this.eclipticObliquity)));
    this.equatorialVernalAxisZ = (this.rectancularVernalAxisY * Math.sin(degreesToRadians(this.eclipticObliquity))) + (this.rectancularVernalAxisZ * Math.cos(degreesToRadians(this.eclipticObliquity)));

    if (fullDebug) {
      console.log(this.name + '.debug:  equatorialVernalAxisX (x) = ' + this.equatorialVernalAxisX + ' \n');
      console.log(this.name + '.debug:  equatorialVernalAxisY (y) = ' + this.equatorialVernalAxisY + ' \n');
      console.log(this.name + '.debug:  equatorialZvernal (y) = ' + this.equatorialVernalAxisZ + ' \n\n');
    }

    this.rightAscension = radiansToDegrees(Math.atan2(this.equatorialVernalAxisY, this.equatorialVernalAxisX));
    this.declination = radiansToDegrees(Math.atan2(this.equatorialVernalAxisZ, Math.sqrt((this.equatorialVernalAxisX * this.equatorialVernalAxisX) + (this.equatorialVernalAxisY * this.equatorialVernalAxisY))));

    if (fullDebug) {
      console.log(this.name + '.debug:  rightAscension (RA) = ' + this.rightAscension + ' \n');
      console.log(this.name + '.debug:  declination (Decl) = ' + this.declination + ' \n\n');
    }

    if (fullDebug) { console.log(this.name + '.debug:  siderealTime (SIDTIME) = ' + this.siderealTime + ' \n'); }
    this.hourAngle = (this.siderealTime * 15) - this.rightAscension; // Note - siderealTime was calculated in hours
    if (fullDebug) { console.log(this.name + '.debug:  hourAngle (HA) = ' + this.hourAngle + ' \n'); }

    // Rectangular coordinates with the celestial equator in the south, the western horizon and the celestial north pole as axis X, Y, Z. 
    // (We don't need these coordinates again, so local declaration is fine)
    var swnX = Math.cos(degreesToRadians(this.hourAngle)) * Math.cos(degreesToRadians(this.declination));     
    var swnY = Math.sin(degreesToRadians(this.hourAngle)) * Math.cos(degreesToRadians(this.declination));
    var swnZ = Math.sin(degreesToRadians(this.declination));
    if (fullDebug) { 
      console.debug('swnX = ' + swnX); 
      console.debug('swnY = ' + swnY);
      console.debug('swnZ = ' + swnZ);
    }
    
    // Rotate around east-west axis
    var horX = (swnX * Math.sin(degreesToRadians(this.terrestrialLatitude))) - (swnZ * Math.cos(degreesToRadians(this.terrestrialLatitude)));
    var horY = swnY;
    var horZ = (swnX * Math.cos(degreesToRadians(this.terrestrialLatitude))) + (swnZ * Math.sin(degreesToRadians(this.terrestrialLatitude)));
    if (fullDebug) {   
      console.debug('horX = ' + horX);
      console.debug('horY = ' + horY);
      console.debug('horZ = ' + horZ);
    }

    this.azimuth  = radiansToDegrees(Math.atan2(horY, horX)) + 180;
    this.altitude = radiansToDegrees(Math.asin(horZ));

    if (fullDebug) {   
      console.log(this.name + '.debug:  azimuth = ' + this.azimuth + ' \n');
      console.log(this.name + '.debug:  altitude = ' + this.altitude + ' \n');
    }

  }

  calculatePhase() {

    // Use "less accurate" method than that given for the moon 
    // (because distance is more important? Not really sure about this, but the Moon equation doesn't produce results that value Stellarium)
    // Answer (?): Because the moon is so close, it looks "half full" when its elongation (the angle between earth-Sun and earth-planet) is 90 degrees
    // and/or when the ecliptic angle difference is 90 degrees. But for planets that are further away, people on earth will see more than half of
    // that planet illuminated at a 90 degree elongation (depending on how far away it is) because from that planet's perspective its
    // angle to the sun is less than 90 degrees from its angle to the earth (a phase angle of less than 90 degrees)

    // elong = acos( ( s*s + R*R - r*r ) / (2*s*R) )
    var s = Sun.getInstance().getGeocentricDistance();
    var r = this.heliocentricDistance;
    var R = this.geocentricDistance;
    this.elongation = radiansToDegrees(Math.acos(  ((s * s) + (R * R) - (r * r)) / ( 2 * s * R) ));

    //  FV    = acos( ( r*r + R*R - s*s ) / (2*r*R) )
    this.phaseAngle = radiansToDegrees(Math.acos(  ((r * r) + (R * R) - (s * s)) / ( 2 * r * R) ));

    // phase  =  ( 1 + cos(FV) ) / 2  =  hav(180_deg - FV)
    this.phase = ( 1 + Math.cos(degreesToRadians(this.phaseAngle)) ) / 2;

  }

  calculatePhaseMoon() {

    // Use "more accurate" method given for the moon

    // elong = acos( cos(slon - mlon) * cos(mlat) )
    var sLon = Sun.getInstance().getEclipticLongitudeTropical();
    this.elongation = radiansToDegrees(Math.acos( Math.cos(degreesToRadians(sLon - this.eclipticLongitudeTropical)) * Math.cos(degreesToRadians(this.eclipticLatitude)) ));

    this.phaseAngle = 180 - this.elongation;

    // phase  =  ( 1 + cos(FV) ) / 2  =  hav(180_deg - FV)
    this.phase = ( 1 + Math.cos(degreesToRadians(this.phaseAngle)) ) / 2;

  }

  chartCalculations() {
    // Note - this isn't going to work the first time it's called from within the calculate method, as the chart orbital radius factor
    // won't have been set by the sky yet - that's why we need to check this.chartPosX is set at the start of both the draw methods
    this.chartDistanceFromOrigin = palette.grahaBandRadiusMin + (this.chartOrbitalRadiusFactor * (palette.grahaBandRadiusMax - palette.grahaBandRadiusMin));

if (false) { // Now we're not using inner lines, we don't need to do this.... but I'll leave it here for now
    // Make sure we don't exceed the bounds when our halo is applied)
    if ((this.chartDistanceFromOrigin - this.chartGrahaHaloRadius) < palette.grahaBandRadiusMin) {
      this.chartDistanceFromOrigin += this.chartGrahaHaloRadius;
    }
    if ((this.chartDistanceFromOrigin + this.chartGrahaHaloRadius) > palette.grahaBandRadiusMax) {
      this.chartDistanceFromOrigin -= this.chartGrahaHaloRadius;
    }
}

    if (isSidereal) {
      this.chartEclipticLongitude = this.eclipticLongitudeSidereal;
    } else {
      this.chartEclipticLongitude = this.eclipticLongitudeTropical;
    }
    this.chartPosX = -1 * (Math.cos(degreesToRadians(this.chartEclipticLongitude)) * this.chartDistanceFromOrigin);
    this.chartPosY = (Math.sin(degreesToRadians(this.chartEclipticLongitude)) * this.chartDistanceFromOrigin);
  }

  debug() {
    console.log(this.name + '.debug:  ********************************************************************************');
    console.log(this.name + '.debug:  longitudeOfAscendingNode (N) = ' + this.longitudeOfAscendingNode + ' \n');
    console.log(this.name + '.debug:  inclination (i) = ' + this.inclination + ' \n');
    console.log(this.name + '.debug:  longitudeOfPeriapsis (w) = ' + this.longitudeOfPeriapsis + ' \n');
    console.log(this.name + '.debug:  meanDistance (a) = ' + this.meanDistance + ' \n');
    console.log(this.name + '.debug:  eccentricity (e) = ' + this.eccentricity + ' \n');
    console.log(this.name + '.debug:  meanAnomaly (M) = ' + this.meanAnomaly + ' \n');
    console.log(this.name + '.debug:  eclipticObliquity (oblecl) = ' + this.eclipticObliquity + ' \n');
    console.log(this.name + '.debug:  meanLongitude (L) = ' + this.meanLongitude + ' \n');
    console.log(this.name + '.debug:  eccentricAnomaly (E) = ' + this.eccentricAnomaly + ' \n\n');

    console.log(this.name + '.debug:  orbitalPerihelionAxisX (x) = ' + this.orbitalPerihelionAxisX + ' \n');
    console.log(this.name + '.debug:  orbitalPerihelionAxisY (y) = ' + this.orbitalPerihelionAxisY + ' \n');
    console.log(this.name + '.debug:  orbitalPerihelionAxisZ (z) = ' + this.orbitalPerihelionAxisZ + ' \n\n');

    console.log(this.name + '.debug:  distance (r) = ' + this.distance + ' \n');
    console.log(this.name + '.debug:  trueAnomaly (v) = ' + this.trueAnomaly + ' \n');

    //console.log(this.name + '.debug:  eclipticXpAxis (x) = ' + this.eclipticXpAxis + ' \n');
    //console.log(this.name + '.debug:  eclipticYpAxis (y) = ' + this.eclipticYpAxis + ' \n');
    //console.log(this.name + '.debug:  eclipticZpAxis (z) = ' + this.eclipticZpAxis + ' \n\n');

    console.log(this.name + '.debug:  rectancularVernalAxisX (x) = ' + this.rectancularVernalAxisX + ' \n');
    console.log(this.name + '.debug:  rectancularVernalAxisY (y) = ' + this.rectancularVernalAxisY + ' \n');
    console.log(this.name + '.debug:  rectancularVernalAxisZ (z) = ' + this.rectancularVernalAxisZ + ' \n\n');

    console.log(this.name + '.debug:  geocentricX = ' + this.geocentricX + ' \n');
    console.log(this.name + '.debug:  geocentricY = ' + this.geocentricY + ' \n');
    console.log(this.name + '.debug:  geocentricZ = ' + this.geocentricZ + ' \n\n');

    console.log(this.name + '.debug:  heliocentricDistance = ' + this.heliocentricDistance + ' \n\n');
    console.log(this.name + '.debug:  geocentricDistance = ' + this.geocentricDistance + ' \n\n');    

    console.log(this.name + '.debug:  eclipticLongitudeTropical (long) = ' + this.eclipticLongitudeTropical + ' \n\n');
    console.log(this.name + '.debug:  eclipticLongitudeSidereal = ' + this.eclipticLongitudeSidereal + ' \n\n');
    console.log(this.name + '.debug:  eclipticLatitude = ' + this.eclipticLatitude + ' \n\n');

    console.log(this.name + '.debug:  elongation = ' + this.elongation + ' \n\n');
    console.log(this.name + '.debug:  phaseAngle = ' + this.phaseAngle + ' \n\n');
    console.log(this.name + '.debug:  phase = ' + this.phase + ' \n\n');

    console.log(this.name + '.debug:  chartDistanceFromOrigin = ' + this.chartDistanceFromOrigin + ' \n\n');
    console.log(this.name + '.debug:  chartEclipticLongitude = ' + this.chartEclipticLongitude + ' \n\n');
    console.log(this.name + '.debug:  chartPosX = ' + this.chartPosX + ' \n\n');
    console.log(this.name + '.debug:  chartPosY = ' + this.chartPosY + ' \n\n');

  }

  drawBackground(context) {     // Not used for the Earth

    context.save();

    // rotate canvas so graha axis is aligned to Aries zero
    context.rotate(degreesToRadians(-1 * this.chartEclipticLongitude)); // this variable already takes into account whether we're sidereal or tropical

    // Note - line should probably start some way into the glyph band (at least the max halo radius?)
    var grahaBandWidth = palette.grahaBandRadiusMax - palette.grahaBandRadiusMin;
    var glyphBandWidth = palette.glyphBandRadiusMax - palette.grahaBandRadiusMax;

    var lineTerminatorWidth = grahaBandWidth / 8;
    var grahaToGlyphLabelDistance = palette.grahaBandRadiusMax + (glyphBandWidth / 4) - (this.chartDistanceFromOrigin + this.chartGrahaHaloRadius);
    var grahaToGlyphBandDistance = palette.grahaBandRadiusMax - (this.chartDistanceFromOrigin + this.chartGrahaHaloRadius);

    if (grahaToGlyphLabelDistance < (2 * lineTerminatorWidth)) {    // Just draw a terminator

      palette.drawLineTripleTerminus(context, 
                                    -1 * (palette.grahaBandRadiusMax + (glyphBandWidth / 4)),        // start
                                    -1 * (palette.grahaBandRadiusMax + (glyphBandWidth / 4) - (grahaToGlyphLabelDistance / 2)),              // end                                                             // end
                                    palette.backgroundDetailMid, palette.backgroundDetailMidLineWidth);


    } else {                                                 // Draw a line and the terminator

      // Line from edge to the start of the terminator
      context.beginPath();
      context.moveTo(-1 * (palette.grahaBandRadiusMax + (glyphBandWidth / 4)), 0);
      context.lineTo(-1 * (this.chartDistanceFromOrigin + this.chartGrahaHaloRadius + (2 * lineTerminatorWidth)), 0);
      context.strokeStyle = palette.backgroundDetailMid;
      context.stroke();
      context.closePath(); 

      palette.drawLineTripleTerminus(context, 
                                    -1 * (this.chartDistanceFromOrigin + this.chartGrahaHaloRadius + (2 * lineTerminatorWidth)),        // start
                                    -1 * (this.chartDistanceFromOrigin + this.chartGrahaHaloRadius + lineTerminatorWidth),              // end                                                             // end
                                    palette.backgroundDetailMid, palette.backgroundDetailMidLineWidth);

    }

    // labels


    context.beginPath();
//    context.arc(-1 * (palette.grahaBandRadiusMax + (glyphBandWidth / 2)), 0, (glyphBandWidth / 4), 0, Math.PI * 2, false);
    context.arc(-1 * (palette.grahaBandRadiusMax + (glyphBandWidth / 2)), 0, (glyphBandWidth / 4), degreesToRadians(-60), degreesToRadians(60), false);
    context.strokeStyle = palette.backgroundDetailMid;
    context.stroke();
    context.closePath(); 


    var fontSize = glyphBandWidth * 0.3;
    var labelOriginX = -1 * ((glyphBandWidth * 0.4) + palette.grahaBandRadiusMax);    // 0.4 = 1/4 + 0.15

    // push context in case we screw up, translate to label origin, rotate 90 degrees, write label, reverse translation and rotation
    context.save();
    context.translate(labelOriginX, 0);
    context.rotate(-Math.PI/2);
    context.textAlign = "center";
    context.font = fontSize + 'px san-serif';
    context.fillStyle = palette.backgroundDetailStrong;
    context.fillText(this.glyph, 0, 0);
    context.restore();                      // <--- this undoes the translation, rotation etc. used to write the *text label* correctly



    context.restore();  // for all the rotation used to draw the background

  }

  getChartSunAngle() {

    var sun = Sun.getInstance();

    var opposite = this.getChartPositionY() - sun.getChartPositionY();
    var adjacent = this.getChartPositionX() - sun.getChartPositionX();

    var angle = radiansToDegrees(Math.atan(opposite / adjacent));

    if (adjacent < 0) {    
      angle = angle + 180;  // Correct result of arcTangent for negative adjacent values
    }

    if (fullDebug) { 
      console.log("getChartSunAngle() for " + this.name + ": opposite = " + opposite); 
      console.log("getChartSunAngle() for " + this.name + ": adjacent = " + adjacent); 
      console.log("getChartSunAngle() for " + this.name + ": angle = " + angle); 
    }

    return angle;
  }

  draw(context) {

    var shadowAngle = rev(this.getChartSunAngle() + 180);                  // The shadow is opposite the sun
    var shadowExtent = this.phaseAngle; // 90 * ( (0.5 - Math.abs(this.phase - 0.5)) / 0.5 );  // The angle that the shadow extends, either side of the shadowAngle

    // planets appear "full" or "new" when within 3.3 degrees of their max or min 
    // (moon phase angle stays within 3.3 degrees from max/min for 24 hours - about 15 mins
    // more after than before, strangely), and their max or min is determined by inclination
    var exceptionAngle = 3.3 + this.inclination;
    if ( (shadowExtent < exceptionAngle) || (shadowExtent > (180 - exceptionAngle)) ) {  
       shadowExtent = 0;
       if (fullDebug) { console.log(this.name + " is new or full"); }
    }

    if (false) {
      console.log("sun angle for " + this.name + " = " + this.getChartSunAngle());
      console.log("shadowAngle for " + this.name + " = " + shadowAngle);
      console.log("shadowExtent for " + this.name + " = " + shadowExtent);
    }

    // Draw rays
    for (var ray of this.chartRays) {
      ray.draw(context, this.chartPosX, this.chartPosY, shadowAngle, shadowExtent);
    }

    // Draw sphere
    context.beginPath();
    context.strokeStyle = palette.grahaBorder;
    context.lineWidth = palette.GRAHA_BORDER_LINE_WIDTH;
    context.arc(this.chartPosX, this.chartPosY, this.chartGrahaRadius, 0, (Math.PI * 2), false);
    context.stroke();
    context.closePath(); 

    // Draw phase shadow
    if ((drawPhases) && (this.phase)) {  // only draw it if phases are enabled (not turned off for graphics work) and the phase is set
      context.beginPath();
      context.fillStyle = palette.grahaShadow;                    // "red"; for debugging
//      context.lineWidth = palette.GRAHA_BORDER_LINE_WIDTH;    // delete this line if commenting it doesn't break anything!

      // X axis points to the right, Y axis points down - arc angles are measured from the positive X axis in *radians*
      // shadow points out towards the positive X axis (right)
      // we presume the sun is to the left, along the negative X axis 

      var chartSunAngle = this.getChartSunAngle();  // angle of the sun, in degrees, from the negative X axis

      // Start by drawing the part of the shadow that is furthest from the sun

      var shadowStartAngle = (-1 * (Math.PI / 2)) + degreesToRadians(chartSunAngle);
      var shadowEndAngle = (Math.PI / 2) + degreesToRadians(chartSunAngle);
      context.arc(this.chartPosX, this.chartPosY, this.chartGrahaRadius, shadowStartAngle, shadowEndAngle, false);

      // this.phase = 0.75; // for debugging

      // What we do next depends on the phase angle
      if (this.phase > 0.5) {  // Graha is more than 50% full
        var ellipseRadiusX = ((this.phase - 0.5) * 2) * this.chartGrahaRadius;
        context.ellipse(this.chartPosX, this.chartPosY, ellipseRadiusX, this.chartGrahaRadius, degreesToRadians(chartSunAngle), (Math.PI / 2), (-1 * (Math.PI / 2)), true);  // draw counterclockwise

      } else if (this.phase == 0.5) {

        var terminusX = this.chartPosX + (Math.sin(degreesToRadians(chartSunAngle)) * this.chartGrahaRadius);
        var terminusY = this.chartPosY - (Math.cos(degreesToRadians(chartSunAngle)) * this.chartGrahaRadius);
        context.lineTo(terminusX, terminusY);  // if rotated this will need adjusting
        // context.lineTo(this.chartPosX, this.chartPosY + this.chartGrahaRadius);  // if rotated this will need adjusting

      } else {  // Graha is less than 50% full
        var ellipseRadiusX = ((0.5 - this.phase) * 2) * this.chartGrahaRadius;
        context.ellipse(this.chartPosX, this.chartPosY, ellipseRadiusX, this.chartGrahaRadius, degreesToRadians(chartSunAngle), (Math.PI / 2),(-1 * (Math.PI / 2)), false); // draw clockwise
      }

      context.fill();
      context.closePath(); 



    }



    if (false) {
    // Draw distance debug
    context.beginPath();
    context.strokeStyle = palette.backgroundDetailStrong;
    context.lineWidth = palette.GRAHA_BORDER_LINE_WIDTH;
    context.arc(0, 0, this.chartDistanceFromOrigin, 0, (Math.PI * 2), false);
    context.stroke();
    context.closePath(); 
    }

    // Draw lines!

  }
}




class Pluto extends Graha {

  static instance;

  constructor() {

    super();
    Pluto.instance = this;

    this.name = 'Pluto';
    this.glyph = '♇';
    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.PLUTO_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Pluto.instance) {
      console.log("Creating new Pluto");
      Pluto.instance = new Pluto();
    }
    return Pluto.instance;
  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

    this.inclination = 17.16; // adding this for full/new phase calculations, even though we don't use it at all to calculate position

    // Pluto has custom calculations to find its heliocentric coordinates (see http://stjarnhimlen.se/comp/ppcomp.html#14)
    // S  =   50.03  +  0.033459652 * d
    var s = 50.03 + (0.033459652 * this.daysSinceMillennium);
    // P  =  238.95  +  0.003968789 * d
    var p = 238.95 + (0.003968789 * this.daysSinceMillennium);

/**
    lonecl = 238.9508  +  0.00400703 * d
            - 19.799 * sin(P)     + 19.848 * cos(P)
             + 0.897 * sin(2*P)    - 4.956 * cos(2*P)
             + 0.610 * sin(3*P)    + 1.211 * cos(3*P)
             - 0.341 * sin(4*P)    - 0.190 * cos(4*P)
             + 0.128 * sin(5*P)    - 0.034 * cos(5*P)
             - 0.038 * sin(6*P)    + 0.031 * cos(6*P)
             + 0.020 * sin(S-P)    - 0.010 * cos(S-P)
*/

    var heliocentricLongitude = 238.9508  +  (0.00400703 * this.daysSinceMillennium)
                              - (19.799 * Math.sin(degreesToRadians(p))) + (19.848 * Math.cos(degreesToRadians(p)))
                              + (0.897 * Math.sin(degreesToRadians(2 * p))) - (4.956 * Math.cos(degreesToRadians(2 * p)))
                              + (0.610 * Math.sin(degreesToRadians(3 * p))) + (1.211 * Math.cos(degreesToRadians(3 * p)))
                              - (0.341 * Math.sin(degreesToRadians(4 * p))) - (0.190 * Math.cos(degreesToRadians(4 * p)))
                              + (0.128 * Math.sin(degreesToRadians(5 * p))) - (0.034 * Math.cos(degreesToRadians(5 * p)))
                              - (0.038 * Math.sin(degreesToRadians(6 * p))) + (0.031 * Math.cos(degreesToRadians(6 * p)))
                              + (0.020 * Math.sin(degreesToRadians(s - p))) - (0.010 * Math.cos(degreesToRadians(s - p)));

/**
    latecl =  -3.9082
             - 5.453 * sin(P)     - 14.975 * cos(P)
             + 3.527 * sin(2*P)    + 1.673 * cos(2*P)
             - 1.051 * sin(3*P)    + 0.328 * cos(3*P)
             + 0.179 * sin(4*P)    - 0.292 * cos(4*P)
             + 0.019 * sin(5*P)    + 0.100 * cos(5*P)
             - 0.031 * sin(6*P)    - 0.026 * cos(6*P)
                                   + 0.011 * cos(S-P)
*/
    var heliocentricLatitude = -3.9082
                                - (5.453 * Math.sin(degreesToRadians(p))) - (14.975 * Math.cos(degreesToRadians(p)))
                                + (3.527 * Math.sin(degreesToRadians(2 * p))) + (1.673 * Math.cos(degreesToRadians(2 * p)))
                                - (1.051 * Math.sin(degreesToRadians(3 * p))) + (0.328 * Math.cos(degreesToRadians(3 * p)))
                                + (0.179 * Math.sin(degreesToRadians(4 * p))) - (0.292 * Math.cos(degreesToRadians(4 * p)))
                                + (0.019 * Math.sin(degreesToRadians(5 * p))) + (0.100 * Math.cos(degreesToRadians(5 * p)))
                                - (0.031 * Math.sin(degreesToRadians(6 * p))) - (0.026 * Math.cos(degreesToRadians(6 * p)))
                                                                              + (0.011 * Math.cos(degreesToRadians(s - p)));

/**

   r     =  40.72
           + 6.68 * sin(P)       + 6.90 * cos(P)
           - 1.18 * sin(2*P)     - 0.03 * cos(2*P)
           + 0.15 * sin(3*P)     - 0.14 * cos(3*P)
*/
   var hDistance = 40.72
                   + (6.68 * Math.sin(degreesToRadians(p))) + (6.90 * Math.cos(degreesToRadians(p)))             
                   - (1.18 * Math.sin(degreesToRadians(2 * p))) - (0.03 * Math.cos(degreesToRadians(2 * p)))   
                   + (0.15 * Math.sin(degreesToRadians(3 * p))) - (0.14 * Math.cos(degreesToRadians(3 * p)));   

    if (fullDebug) {
      console.log("Pluto heliocentricLongitude" + heliocentricLongitude);
      console.log("Pluto heliocentricLatitude" + heliocentricLatitude);
      console.log("Pluto hDistance" + hDistance);
    }

    this.heliocentricDistance = hDistance;

    // Once we have the three values for the spherical coordinates of its heliocentric orbit, convert these into rectangular coordinates using the existing methods
    this.rectancularVernalAxisX = super.calculateRectangularXFromSphericalCoordinates(heliocentricLatitude, heliocentricLongitude, hDistance);
    this.rectancularVernalAxisY = super.calculateRectangularYFromSphericalCoordinates(heliocentricLatitude, heliocentricLongitude, hDistance);
    this.rectancularVernalAxisZ = super.calculateRectangularZFromSphericalCoordinates(heliocentricLatitude, heliocentricLongitude, hDistance);

    // then convert to geocentric
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();    

    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);

    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);  // Not sure we need this
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance;  // remove this after methods that rely on it are removed
    
    super.calculatePhase();

    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Pluto.instance.name = ' + Pluto.instance.name + ' \n');
  }

}




class Neptune extends Graha {

  static instance;

  constructor() {

    super();
    Neptune.instance = this;

    this.name = 'Neptune';
    this.glyph = '♆';
    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.NEPTUNE_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Neptune.instance) {
      console.log("Creating new Neptune");
      Neptune.instance = new Neptune();
    }
    return Neptune.instance;
  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);

    // N = 131.7806_deg + 3.0173E-5_deg    * d
    this.longitudeOfAscendingNode = rev(131.7806 + (0.000030173 * this.daysSinceMillennium));  // N

    // i =   1.7700_deg - 2.55E-7_deg      * d
    this.inclination = rev(1.7700 - (0.000000255 * this.daysSinceMillennium)); // i

    // w = 272.8461_deg - 6.027E-6_deg     * d
    this.longitudeOfPeriapsis = rev(272.8461 - (0.000006027 * this.daysSinceMillennium)); // w

    // a = 30.05826     + 3.313E-8         * d
    this.meanDistance = 30.05826 + (0.00000003313 * this.daysSinceMillennium); // a 

    // e = 0.008606     + 2.15E-9          * d
    this.eccentricity = 0.008606 + (0.00000000215 * this.daysSinceMillennium); // e

    // M = 260.2471_deg + 0.005995147_deg  * d
    this.meanAnomaly = rev(260.2471 + (0.005995147 * daysSinceMillennium)); // M


    super.sharedOrbitalCalculations();  // where the meat is!
    this.heliocentricDistance = this.distance;

    // No perturbations for Neptune

    // Orbital calculations for all bar sun and moon were given for heliocentric orbit, not the geocentric orbit we need
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();

    // For testing:
    //this.geocentricX = this.rectancularVernalAxisX;
    //this.geocentricY = this.rectancularVernalAxisY;
    //this.geocentricZ = this.rectancularVernalAxisZ;

    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);

    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);  // Not sure we need this
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance; // remove this

    super.calculatePhase();    

    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Neptune.instance.name = ' + Neptune.instance.name + ' \n');
  }

}




class Jupiter extends Graha {

  static instance;

  constructor() {

    super();
    Jupiter.instance = this;

    this.name = 'Jupiter';
    this.glyph = '♃';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.JUPITER_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Jupiter.instance) {
      console.log("Creating new Jupiter");
      Jupiter.instance = new Jupiter();
    }
    return Jupiter.instance;
  }

  calculateMeanAnomaly(daysSinceMillennium) {

    if (!this.meanAnomaly) {
      this.meanAnomaly = rev(19.8950 + (0.0830853001 * daysSinceMillennium)); // M
    }
    return this.meanAnomaly;

  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);
    this.longitudeOfAscendingNode = rev(100.4542 + (0.0000276854 * this.daysSinceMillennium));  // N
    this.inclination = rev(1.3030 - (0.0000001557 * this.daysSinceMillennium)); // i

    this.longitudeOfPeriapsis = rev(273.8777 + (0.0000164505 * this.daysSinceMillennium)); // w
    this.meanDistance = 5.20256; // a 

    this.eccentricity = 0.048498 + (0.000000004469 * this.daysSinceMillennium); // e
    if (!this.meanAnomaly) {
      this.meanAnomaly = this.calculateMeanAnomaly(daysSinceMillennium); // M
    }

    super.sharedOrbitalCalculations();  // where the meat is!

    if (fullDebug) {
      console.log(" ********** START coordinate conversion test!! ********** ");
      console.log("this.rectancularVernalAxisX (before) = " + this.rectancularVernalAxisX);
      console.log("this.rectancularVernalAxisY (before) = " + this.rectancularVernalAxisY);
      console.log("this.rectancularVernalAxisZ (before) = " + this.rectancularVernalAxisZ);
    }

    // Calculate heliocentric radial coordinates in order to apply perturbations
    var hLongitude = super.calculateSphericalLongitudeFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);
    var hLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);
    var hDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);

    if (fullDebug) {
      console.log("heliocentricLongitude (before) = " + hLongitude);
      console.log("heliocentricLatitude (before) = " + hLatitude);
      console.log("heliocentricDistance (before) = " + hDistance);
    }

//    // REMOVE THIS BLOCK AFTER TEST
//    this.rectancularVernalAxisX = super.calculateRectangularXFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
//    this.rectancularVernalAxisY = super.calculateRectangularYFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
//    this.rectancularVernalAxisZ = super.calculateRectangularZFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
//    console.log("this.rectancularVernalAxisX (after) = " + this.rectancularVernalAxisX);
//    console.log("this.rectancularVernalAxisY (after) = " + this.rectancularVernalAxisY);
//    console.log("this.rectancularVernalAxisZ (after) = " + this.rectancularVernalAxisZ);
//    console.log(" ********** after should be the same as before! ********** ");
//    console.log(" ********** END coordinate conversion test!! ********** ");


    // Perturbations of Jupiter's heliocentric longitude (degrees)
    var perturbationsLongitude = 0.0;
    var saturnMeanAnomaly = Saturn.getInstance().calculateMeanAnomaly(daysSinceMillennium);   

    if (fullDebug) { console.log("Saturn anomaly = " + saturnMeanAnomaly); }
    if (fullDebug) { console.log("Jupiter longitude before perturbations = " + hLongitude); }

    // -0.332_deg * sin(2*Mj - 5*Ms - 67.6_deg)
    perturbationsLongitude += -0.332 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (5 * saturnMeanAnomaly) - 67.6));
    if (fullDebug) { console.log(-0.332 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (5 * saturnMeanAnomaly) - 67.6))); }

    // -0.056_deg * sin(2*Mj - 2*Ms + 21_deg)
    perturbationsLongitude += -0.056 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (2 * saturnMeanAnomaly) + 21));
    if (fullDebug) { console.log(-0.056 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (2 * saturnMeanAnomaly) + 21))); }

    // +0.042_deg * sin(3*Mj - 5*Ms + 21_deg)
    perturbationsLongitude += 0.042 * Math.sin(degreesToRadians((3 * this.meanAnomaly) - (5 * saturnMeanAnomaly) + 21));
    if (fullDebug) { console.log(0.042 * Math.sin(degreesToRadians((3 * this.meanAnomaly) - (5 * saturnMeanAnomaly) + 21))); }

    // -0.036_deg * sin(Mj - 2*Ms)
    perturbationsLongitude += -0.036 * Math.sin(degreesToRadians(this.meanAnomaly - (2 * saturnMeanAnomaly)));
    if (fullDebug) { console.log(-0.036 * Math.sin(degreesToRadians(this.meanAnomaly - (2 * saturnMeanAnomaly)))); }

    // +0.022_deg * cos(Mj - Ms)
    perturbationsLongitude += 0.022 * Math.cos(degreesToRadians(this.meanAnomaly - saturnMeanAnomaly));
    if (fullDebug) { console.log(0.022 * Math.cos(degreesToRadians(this.meanAnomaly - saturnMeanAnomaly))); }

    // +0.023_deg * sin(2*Mj - 3*Ms + 52_deg)
    perturbationsLongitude += 0.023 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (3 * saturnMeanAnomaly) + 52));
    if (fullDebug) { console.log(0.023 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (3 * saturnMeanAnomaly) + 52))); }

    // -0.016_deg * sin(Mj - 5*Ms - 69_deg)
    perturbationsLongitude += -0.016 * Math.sin(degreesToRadians(this.meanAnomaly - (5 * saturnMeanAnomaly) - 69));
    if (fullDebug) { console.log(-0.016 * Math.sin(degreesToRadians(this.meanAnomaly - (5 * saturnMeanAnomaly) - 69))); }


    hLongitude = rev(hLongitude + perturbationsLongitude);
    if (fullDebug) { console.log("Jupiter longitude after perturbations = " + hLongitude); }

    this.heliocentricDistance = hDistance;

    // Now we need to reconvert radial coords (including perturbations) to rectancular, then convert Heliocentric to Geocentric, then convert back to radial coords!

    // 1. Convert heliocentric spherical coordinates back into heliocentric rectancular coordinates
    this.rectancularVernalAxisX = super.calculateRectangularXFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
    this.rectancularVernalAxisY = super.calculateRectangularYFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
    this.rectancularVernalAxisZ = super.calculateRectangularZFromSphericalCoordinates(hLatitude, hLongitude, hDistance);

    // 2. Convert heliocentric rectangular coordinates into geocentric rectangular coordinates
    // Orbital calculations for all bar sun and moon were given for heliocentric orbit, not the geocentric orbit we need
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();  // ************************* FOR NOW

    // 3. Convert geocentric rectangular coordinates into geocentric spherical coordinates
    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance; // delete this later

    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);  

    super.calculatePhase();

    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Jupiter.instance.name = ' + Jupiter.instance.name + ' \n');
  }

}



class Saturn extends Graha {

  static instance;

  constructor() {

    super();
    Saturn.instance = this;

    this.name = 'Saturn';
    this.glyph = '♄';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.SATURN_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Saturn.instance) {
      console.log("Creating new Saturn");
      Saturn.instance = new Saturn();
    }
    return Saturn.instance;
  }

  calculateMeanAnomaly(daysSinceMillennium) {
    if (!this.meanAnomaly) {
      this.meanAnomaly = rev(316.9670 + (0.0334442282 * daysSinceMillennium)); // M
    }
    return this.meanAnomaly;

  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);
    this.longitudeOfAscendingNode = rev(113.6634 + (0.0000238980 * this.daysSinceMillennium));  // N
    this.inclination = rev(2.4886 - (0.0000001081 * this.daysSinceMillennium)); // i

    this.longitudeOfPeriapsis = rev(339.3939 + (0.0000297661 * this.daysSinceMillennium)); // w
    this.meanDistance = 9.55475; // a 

    this.eccentricity = 0.055546 - (0.000000009499 * this.daysSinceMillennium); // e
    if (!this.meanAnomaly) {
      this.meanAnomaly = this.calculateMeanAnomaly(daysSinceMillennium); // M
    }

    super.sharedOrbitalCalculations();  // where the meat is!

    var hLongitude = super.calculateSphericalLongitudeFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);
    var hLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);
    var hDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);


    // Perturbations of Saturn's heliocentric longitude (degrees)
    var perturbationsLongitude = 0.0;
    var jupiterMeanAnomaly = Jupiter.getInstance().calculateMeanAnomaly(daysSinceMillennium);   

    if (fullDebug) { console.log("Saturn longitude before perturbations = " + hLongitude); }
    // +0.812_deg * sin(2*Mj - 5*Ms - 67.6_deg)
    perturbationsLongitude += 0.812 * Math.sin(degreesToRadians((2 * jupiterMeanAnomaly) - (5 * this.meanAnomaly) - 67.6));
    if (fullDebug) { console.log(0.812 * Math.sin(degreesToRadians((2 * jupiterMeanAnomaly) - (5 * this.meanAnomaly) - 67.6))); }

    // -0.229_deg * cos(2*Mj - 4*Ms - 2_deg)
    perturbationsLongitude += -0.229 * Math.cos(degreesToRadians((2 * jupiterMeanAnomaly) - (4 * this.meanAnomaly) - 2));
    if (fullDebug) { console.log(-0.229 * Math.cos(degreesToRadians((2 * jupiterMeanAnomaly) - (4 * this.meanAnomaly) - 2))); }

    // +0.119_deg * sin(Mj - 2*Ms - 3_deg)
    perturbationsLongitude += 0.119 * Math.sin(degreesToRadians(jupiterMeanAnomaly - (2 * this.meanAnomaly) - 3));
    if (fullDebug) { console.log(0.119 * Math.sin(degreesToRadians(jupiterMeanAnomaly - (2 * this.meanAnomaly) - 3))); }

    // +0.046_deg * sin(2*Mj - 6*Ms - 69_deg)
    perturbationsLongitude += 0.046 * Math.sin(degreesToRadians((2 * jupiterMeanAnomaly) - (6 * this.meanAnomaly) - 69));
    if (fullDebug) { console.log(0.046 * Math.sin(degreesToRadians((2 * jupiterMeanAnomaly) - (6 * this.meanAnomaly) - 69))); }

    // +0.014_deg * sin(Mj - 3*Ms + 32_deg)
    perturbationsLongitude += 0.014 * Math.sin(degreesToRadians(jupiterMeanAnomaly - (3 * this.meanAnomaly) + 32));
    if (fullDebug) { console.log(0.014 * Math.sin(degreesToRadians(jupiterMeanAnomaly - (3 * this.meanAnomaly) + 32))); }

    if (fullDebug) { console.log("Saturn longitude perturbations = " + perturbationsLongitude); }

    hLongitude = rev(hLongitude + perturbationsLongitude);
    if (fullDebug) { console.log("Saturn longitude after perturbations = " + hLongitude); }


    // Perturbations to Saturn's latitude
    var perturbationsLatitude = 0.0;
    if (fullDebug) { console.log("Saturn latitude before perturbations = " + hLatitude); }

    // -0.020_deg * cos(2*Mj - 4*Ms - 2_deg)
    perturbationsLatitude += -0.020 * Math.cos(degreesToRadians((2 * jupiterMeanAnomaly) - (4 * this.meanAnomaly) - 2));
    if (fullDebug) { console.log(-0.020 * Math.cos(degreesToRadians((2 * jupiterMeanAnomaly) - (4 * this.meanAnomaly) - 2))); }

    // +0.018_deg * sin(2*Mj - 6*Ms - 49_deg)
    perturbationsLatitude += 0.018 * Math.sin(degreesToRadians((2 * jupiterMeanAnomaly) - (6 * this.meanAnomaly) - 49));
    if (fullDebug) { console.log(0.018 * Math.sin(degreesToRadians((2 * jupiterMeanAnomaly) - (6 * this.meanAnomaly) - 49))); }

    if (fullDebug) { console.log("Saturn latitude perturbations = " + perturbationsLatitude); }
    hLatitude += perturbationsLatitude;   // don't "rev" this - goes from +180 to -180 (!!)
    if (fullDebug) { console.log("Saturn latitude after perturbations = " + hLatitude); }

    this.heliocentricDistance = hDistance;

    // Now we need to reconvert radial coords (including perturbations) to rectancular, then convert Heliocentric to Geocentric, then convert back to radial coords!

    // 1. Convert heliocentric spherical coordinates back into heliocentric rectancular coordinates
    this.rectancularVernalAxisX = super.calculateRectangularXFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
    this.rectancularVernalAxisY = super.calculateRectangularYFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
    this.rectancularVernalAxisZ = super.calculateRectangularZFromSphericalCoordinates(hLatitude, hLongitude, hDistance);

    // 2. Convert heliocentric rectangular coordinates into geocentric rectangular coordinates
    // Orbital calculations for all bar sun and moon were given for heliocentric orbit, not the geocentric orbit we need
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();  

    // 3. Convert geocentric rectangular coordinates into geocentric spherical coordinates
    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance; // remove this later

    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);  
    
    super.calculatePhase();
    // could use adding something for the rings here, too

    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Saturn.instance.name = ' + Saturn.instance.name + ' \n');
  }

}



class Uranus extends Graha {

  static instance;

  constructor() {

    super();
    Uranus.instance = this;

    this.name = 'Uranus';
    this.glyph = '♅';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.URANUS_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Uranus.instance) {
      console.log("Creating new Uranus");
      Uranus.instance = new Uranus();
    }
    return Uranus.instance;
  }

  calculateMeanAnomaly(daysSinceMillennium) {

    if (!this.meanAnomaly) {
      this.meanAnomaly = rev(142.5905 + (0.011725806 * daysSinceMillennium)); // M
    }
    return this.meanAnomaly;

  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);
    this.longitudeOfAscendingNode = rev(74.0005 + (0.000013978 * this.daysSinceMillennium));  // N
    this.inclination = rev(0.7733 + (0.000000019 * this.daysSinceMillennium)); // i

    this.longitudeOfPeriapsis = rev(96.6612 + (0.000030565 * this.daysSinceMillennium)); // w
    this.meanDistance = 19.18171 - (0.0000000155 * this.daysSinceMillennium); // a 

    this.eccentricity = 0.047318 + (0.00000000745 * this.daysSinceMillennium); // e
    if (!this.meanAnomaly) {
      this.meanAnomaly = this.calculateMeanAnomaly(daysSinceMillennium); // M
    }

    super.sharedOrbitalCalculations();  // where the meat is!

    var hLongitude = super.calculateSphericalLongitudeFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);
    var hLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);
    var hDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.rectancularVernalAxisX, this.rectancularVernalAxisY, this.rectancularVernalAxisZ);

    // Perturbations of Uranus' heliocentric longitude (degrees)
    var perturbationsLongitude = 0.0;
    var jupiterMeanAnomaly = Jupiter.getInstance().calculateMeanAnomaly(daysSinceMillennium);  
    var saturnMeanAnomaly = Saturn.getInstance().calculateMeanAnomaly(daysSinceMillennium);   
    if (fullDebug) { console.log("Uranus longitude before perturbations = " + hLongitude); }

    // +0.040_deg * sin(Ms - 2*Mu + 6_deg)
    perturbationsLongitude += 0.040 * Math.sin(degreesToRadians(saturnMeanAnomaly - (2 * this.meanAnomaly) + 6));
    if (fullDebug) { console.log(0.040 * Math.sin(degreesToRadians(saturnMeanAnomaly - (2 * this.meanAnomaly) + 6))); }

    // +0.035_deg * sin(Ms - 3*Mu + 33_deg)
    perturbationsLongitude += 0.035 * Math.sin(degreesToRadians(saturnMeanAnomaly - (3 * this.meanAnomaly) + 33));
    if (fullDebug) { console.log(0.035 * Math.sin(degreesToRadians(saturnMeanAnomaly - (3 * this.meanAnomaly) + 33))); }

    // -0.015_deg * sin(Mj - Mu + 20_deg)
    perturbationsLongitude += -0.015 * Math.sin(degreesToRadians(jupiterMeanAnomaly - this.meanAnomaly + 20));
    if (fullDebug) { console.log(-0.015 * Math.sin(degreesToRadians(jupiterMeanAnomaly - this.meanAnomaly + 20))); }

    if (fullDebug) { console.log("Uranus longitude perturbations = " + perturbationsLongitude); }

    hLongitude = rev(hLongitude + perturbationsLongitude);
    if (fullDebug) { console.log("Uranus longitude after perturbations = " + hLongitude); }


    this.heliocentricDistance = hDistance;
    // Now we need to reconvert radial coords (including perturbations) to rectancular, then convert Heliocentric to Geocentric, then convert back to radial coords!

    // 1. Convert heliocentric spherical coordinates back into heliocentric rectancular coordinates
    this.rectancularVernalAxisX = super.calculateRectangularXFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
    this.rectancularVernalAxisY = super.calculateRectangularYFromSphericalCoordinates(hLatitude, hLongitude, hDistance);
    this.rectancularVernalAxisZ = super.calculateRectangularZFromSphericalCoordinates(hLatitude, hLongitude, hDistance);

    // 2. Convert heliocentric rectangular coordinates into geocentric rectangular coordinates
    // Orbital calculations for all bar sun and moon were given for heliocentric orbit, not the geocentric orbit we need
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();  

    // 3. Convert geocentric rectangular coordinates into geocentric spherical coordinates
    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance;

    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);  

    super.calculatePhase();    

    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Uranus.instance.name = ' + Uranus.instance.name + ' \n');
  }

}



class Ketu extends Graha {

  static instance;

  constructor() {

    super();
    Ketu.instance = this;

    this.name = 'Ketu';
    this.glyph = '☋';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 2.5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 5.5); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 2.2;
    var beamWidth = 1.2;
    while (this.chartRays.length < 80) {
      this.chartRays.push(new RayOfLight(palette.KETU_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Ketu.instance) {
      console.log("Creating new Ketu");
      Ketu.instance = new Ketu();
    }
    return Ketu.instance;
  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

    var moon = Moon.getInstance();
    this.longitudeOfAscendingNode = rev(moon.getLongitudeOfAscendingNode() - 180); // N
    this.eclipticLongitudeTropical = this.longitudeOfAscendingNode; 
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);  // have to reapply because we changed the tropical longitude!

    this.geocentricDistance = moon.getDistance(); // Sky will set the chart distance
    this.distance = this.geocentricDistance;

    

    this.lastCalculated = Date.now();
  }



  debug() {
    super.debug();
    console.log(this.name + '.debug:  Ketu.instance.name = ' + Ketu.instance.name + ' \n');
  }


  draw(context) {
    super.draw(context);
  }
}


class Rahu extends Graha {

  static instance;

  constructor() {

    super();
    Rahu.instance = this;

    this.name = 'Rahu';
    this.glyph = '☊';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 2.5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 5.5); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 2.2;
    var beamWidth = 1.2;
    while (this.chartRays.length < 70) {
      this.chartRays.push(new RayOfLight(palette.RAHU_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.sun = Sun.getInstance();  // needs reference to the sun to calculate perturbations in orbit! 


    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Rahu.instance) {
      console.log("Creating new Rahu");
      Rahu.instance = new Rahu();
    }
    return Rahu.instance;
  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

    var moon = Moon.getInstance();
    this.longitudeOfAscendingNode = moon.getLongitudeOfAscendingNode(); 
    this.eclipticLongitudeTropical = this.longitudeOfAscendingNode; 
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);  // have to reapply because we changed the tropical longitude!

    this.geocentricDistance = moon.getDistance(); // Sky will set the chart distance
    this.distance = this.geocentricDistance;
    
    this.lastCalculated = Date.now();
  }



  debug() {
    super.debug();
    console.log(this.name + '.debug:  Rahu.instance.name = ' + Rahu.instance.name + ' \n');
  }


  draw(context) {
    super.draw(context);
  }
}


class Mars extends Graha {

  static instance;

  constructor() {

    super();
    Mars.instance = this;

    this.name = 'Mars';
    this.glyph = '♂';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.MARS_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Mars.instance) {
      console.log("Creating new Mars");
      Mars.instance = new Mars();
    }
    return Mars.instance;
  }


  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);
    this.longitudeOfAscendingNode = rev(49.5574 + (0.0000211081 * this.daysSinceMillennium));  // N
    this.inclination = rev(1.8497 - (0.0000000178 * this.daysSinceMillennium)); // i

    this.longitudeOfPeriapsis = rev(286.5016 + (0.0000292961 * this.daysSinceMillennium)); // w
    this.meanDistance = 1.523688; // * this.ONE_AU_IN_KILOMETERS; // a 

    this.eccentricity = 0.093405 + (0.000000002516 * this.daysSinceMillennium); // e
    this.meanAnomaly = rev(18.6021 + (0.5240207766 * this.daysSinceMillennium)); // M

    super.sharedOrbitalCalculations();  // where the meat is!

    this.heliocentricDistance = this.distance;

    // Orbital calculations for all bar sun and moon were given for heliocentric orbit, not the geocentric orbit we need
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();

    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);

    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);  // Not sure we need this
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance; // delete this after ?
    
    super.calculatePhase();

    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Mars.instance.name = ' + Mars.instance.name + ' \n');
  }

}

class Venus extends Graha {

  static instance;

  constructor() {

    super();
    Venus.instance = this;

    this.name = 'Venus';
    this.glyph = '♀';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.VENUS_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Venus.instance) {
      console.log("Creating new Venus");
      Venus.instance = new Venus();
    }
    return Venus.instance;
  }


  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);
    this.longitudeOfAscendingNode = rev(76.6799 + (0.0000246590 * this.daysSinceMillennium));  // N
    this.inclination = rev(3.3946 + (0.0000000275 * this.daysSinceMillennium)); // i

    this.longitudeOfPeriapsis = rev(54.8910 + (0.0000138374 * this.daysSinceMillennium)); // w
    this.meanDistance = 0.723330; // * this.ONE_AU_IN_KILOMETERS; // a 

    this.eccentricity = 0.006773 - (0.000000001302 * this.daysSinceMillennium); // e
    this.meanAnomaly = rev(48.0052 + (1.6021302244 * this.daysSinceMillennium)); // M

    super.sharedOrbitalCalculations();  // where the meat is!

    this.heliocentricDistance = this.distance;

    // Orbital calculations for all bar sun and moon were given for heliocentric orbit, not the geocentric orbit we need
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();

    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);

    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);  // Not sure we need this
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance; // delete me later
    
    super.calculatePhase();

    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Venus.instance.name = ' + Venus.instance.name + ' \n');
  }


  draw(context) {
    super.draw(context);
  }
}


class Mercury extends Graha {

  static instance;

  constructor() {

    super();
    Mercury.instance = this;

    this.name = 'Mercury';
    this.glyph = '☿';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.MERCURY_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Mercury.instance) {
      console.log("Creating new Mercury");
      Mercury.instance = new Mercury();
    }
    return Mercury.instance;
  }


  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);
    this.longitudeOfAscendingNode = rev(48.3313 + (0.0000324587 * this.daysSinceMillennium));  // N
    this.inclination = rev(7.0047 + (0.00000005 * this.daysSinceMillennium)); // i

    this.longitudeOfPeriapsis = rev(29.1241 + (0.0000101444 * this.daysSinceMillennium)); // w
    this.meanDistance = 0.387098; //* this.ONE_AU_IN_KILOMETERS; // a 

    this.eccentricity = 0.205635 + (0.000000000559 * this.daysSinceMillennium); // e
    this.meanAnomaly = rev(168.6562 + (4.0923344368 * this.daysSinceMillennium)); // M

    // gets different at eclipticXpAxis

    super.sharedOrbitalCalculations();  // where the meat is!

    this.heliocentricDistance = this.distance;

    // Orbital calculations for all bar sun and moon were given for heliocentric orbit, not the geocentric orbit we need
    super.convertHeliocentricCoordinatesToGeocentricCoordinates();

    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);

    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);  // Not sure we need this
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance; // delete me later

    super.calculatePhase();
    
    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Mercury.instance.name = ' + Mercury.instance.name + ' \n');
  }


  draw(context) {
    super.draw(context);
  }
}


class Moon extends Graha {

  static instance;

  constructor() {

    super();
    Moon.instance = this;

    this.name = 'Moon';
    this.glyph = '☽';

    this.RADIUS = 1740; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 3); 

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.MOON_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    // Moon-specific
    this.meanElongation;  // D
    this.argumentOfLatitude;  // F


    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Moon.instance) {
      console.log("Creating new Moon");
      Moon.instance = new Moon();
    }
    return Moon.instance;
  }


  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

//  console.log('this.daysSinceMillennium ' + this.daysSinceMillennium);
    this.longitudeOfAscendingNode = rev(125.1228 - (0.0529538083 * this.daysSinceMillennium));  // N
    this.inclination = 5.1454; // i

    this.longitudeOfPeriapsis = rev(318.0634 + (0.1643573223 * this.daysSinceMillennium)); // w (for moon, arg. of perigee)
    this.meanDistance = 60.2666 * (this.EARTH_RADIUS_IN_KILOMETERS / this.ONE_AU_IN_KILOMETERS); // a     moon's distance was given in earth's radii


    this.eccentricity = 0.054900; // e
    this.meanAnomaly = rev(115.3654 + (13.0649929509 * this.daysSinceMillennium)); // M



    super.sharedOrbitalCalculations();  // where the meat is!

    // The moon orbits the earth, so we don't need to convert our (already geocentric) rectangular coordinates from heliocentric to geocentric 
    this.geocentricX = this.rectancularVernalAxisX;
    this.geocentricY = this.rectancularVernalAxisY;
    this.geocentricZ = this.rectancularVernalAxisZ;

    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    // Will calculate sidereal longitude after perturbations
    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);


    
    // ****** Moon-specific perturbations *********

    var sun = Sun.getInstance();

    if (fullDebug) { 
    console.log('Moon perturbations');
    console.log('Sun mean anomaly (Ms) = ' + sun.getMeanAnomaly());
    console.log('Moon mean anomaly (Mm) = ' + this.getMeanAnomaly);
    console.log('Sun mean longitude (Ls) = ' + sun.getMeanLongitude());
    console.log('Moon mean longitude (Lm) = ' + this.getMeanLongitude);
    }


    this.meanElongation = this.meanLongitude - sun.getMeanLongitude();
    if (fullDebug) { console.log('Moon mean elongation (D) = ' + this.meanElongation); }

    this.argumentOfLatitude = this.meanLongitude - this.longitudeOfAscendingNode;
    if (fullDebug) { console.log('Moon argument of latitude (F) = ' + this.argumentOfLatitude); }

    // Perturbations in longitude (degrees):
    var perturbationsLongitude = 0.0;

    // -1.274_deg * sin(Mm - 2*D)    (Evection)
    perturbationsLongitude += -1.274 * Math.sin(degreesToRadians(this.meanAnomaly - (2 * this.meanElongation)));
    if (fullDebug) { console.log(-1.274 * Math.sin(degreesToRadians(this.meanAnomaly - (2 * this.meanElongation)))); }

    // +0.658_deg * sin(2*D)         (Variation)
    perturbationsLongitude += 0.658 * Math.sin(degreesToRadians(2 * this.meanElongation));
    if (fullDebug) { console.log((0.658 * Math.sin(degreesToRadians(2 * this.meanElongation)))); }

    // -0.186_deg * sin(Ms)          (Yearly equation)
    perturbationsLongitude += -0.186 * Math.sin(degreesToRadians(sun.getMeanAnomaly()));
    if (fullDebug) { console.log(-0.186 * Math.sin(degreesToRadians(sun.getMeanAnomaly()))); }

    // -0.059_deg * sin(2*Mm - 2*D)
    perturbationsLongitude += -0.059 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (2 * this.meanElongation)));
    if (fullDebug) { console.log(-0.059 * Math.sin(degreesToRadians((2 * this.meanAnomaly) - (2 * this.meanElongation)))); }

    // -0.057_deg * sin(Mm - 2*D + Ms)
    perturbationsLongitude += -0.057 * Math.sin(degreesToRadians(this.meanAnomaly - (2 * this.meanElongation) + sun.getMeanAnomaly()));
    if (fullDebug) { console.log(-0.057 * Math.sin(degreesToRadians(this.meanAnomaly - (2 * this.meanElongation) + sun.getMeanAnomaly()))); }

    // +0.053_deg * sin(Mm + 2*D)
    perturbationsLongitude += 0.053 * Math.sin(degreesToRadians(this.meanAnomaly + (2 * this.meanElongation)));
    if (fullDebug) { console.log(+0.053 * Math.sin(degreesToRadians(this.meanAnomaly + (2 * this.meanElongation)))); }

    // +0.046_deg * sin(2*D - Ms)
    perturbationsLongitude += 0.046 * Math.sin(degreesToRadians((2 * this.meanElongation) - sun.getMeanAnomaly()));
    if (fullDebug) { console.log(+0.046 * Math.sin(degreesToRadians((2 * this.meanElongation) - sun.getMeanAnomaly()))); }

    // +0.041_deg * sin(Mm - Ms)
    perturbationsLongitude += 0.041 * Math.sin(degreesToRadians(this.meanAnomaly - sun.getMeanAnomaly()));
    if (fullDebug) { console.log(0.041 * Math.sin(degreesToRadians(this.meanAnomaly - sun.getMeanAnomaly()))); }

    // -0.035_deg * sin(D)            (Parallactic equation)                                   *******
    perturbationsLongitude += -0.035 * Math.sin(degreesToRadians(this.meanElongation));
    if (fullDebug) { console.log(-0.035 * Math.sin(degreesToRadians(this.meanElongation))); }

    // -0.031_deg * sin(Mm + Ms)
    perturbationsLongitude += -0.031 * Math.sin(degreesToRadians(this.meanAnomaly + sun.getMeanAnomaly()));
    if (fullDebug) { console.log(-0.031 * Math.sin(degreesToRadians(this.meanAnomaly + sun.getMeanAnomaly()))); }

    // -0.015_deg * sin(2*F - 2*D)
    perturbationsLongitude += -0.015 * Math.sin(degreesToRadians((2 * this.argumentOfLatitude) - (2 * this.meanElongation)));
    if (fullDebug) { console.log(-0.015 * Math.sin(degreesToRadians((2 * this.argumentOfLatitude) - (2 * this.meanElongation)))); }

    // +0.011_deg * sin(Mm - 4*D)
    perturbationsLongitude += 0.011 * Math.sin(degreesToRadians(this.meanAnomaly - (4 * this.meanElongation)));
    if (fullDebug) { console.log(0.011 * Math.sin(degreesToRadians(this.meanAnomaly - (4 * this.meanElongation)))); }

    if (fullDebug) { console.log(perturbationsLongitude); }

    this.eclipticLongitudeTropical = rev(this.eclipticLongitudeTropical + perturbationsLongitude);
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);  // have to reapply because we changed the tropical longitude!

    // Perturbations in latitude (degrees):
    var perturbationsLatitude = 0.0;

    // -0.173_deg * sin(F - 2*D)
    perturbationsLatitude += -0.173 * Math.sin(degreesToRadians(this.argumentOfLatitude - (2 * this.meanElongation)));
    if (fullDebug) { console.log(-0.173 * Math.sin(degreesToRadians(this.argumentOfLatitude - (2 * this.meanElongation)))); }

    // -0.055_deg * sin(Mm - F - 2*D)
    perturbationsLatitude += -0.055 * Math.sin(degreesToRadians(this.meanAnomaly - this.argumentOfLatitude - (2 * this.meanElongation)));
    if (fullDebug) { console.log(-0.055 * Math.sin(degreesToRadians(this.meanAnomaly - this.argumentOfLatitude - (2 * this.meanElongation)))); }

    // -0.046_deg * sin(Mm + F - 2*D)
    perturbationsLatitude += -0.046 * Math.sin(degreesToRadians(this.meanAnomaly + this.argumentOfLatitude - (2 * this.meanElongation)));
    if (fullDebug) { console.log(-0.046 * Math.sin(degreesToRadians(this.meanAnomaly + this.argumentOfLatitude - (2 * this.meanElongation)))); }

    // +0.033_deg * sin(F + 2*D)
    perturbationsLatitude += 0.033 * Math.sin(degreesToRadians(this.argumentOfLatitude + (2 * this.meanElongation)));
    if (fullDebug) { console.log(0.033 * Math.sin(degreesToRadians(this.argumentOfLatitude + (2 * this.meanElongation)))); }

    // +0.017_deg * sin(2*Mm + F)
    perturbationsLatitude += 0.017 * Math.sin(degreesToRadians((2 * this.meanAnomaly) + this.argumentOfLatitude));
    if (fullDebug) { console.log(0.017 * Math.sin(degreesToRadians((2 * this.meanAnomaly) + this.argumentOfLatitude))); }

    if (fullDebug) { console.log(perturbationsLatitude); }

    this.eclipticLatitude += perturbationsLatitude;   // don't "rev" this - goes from +180 to -180 (!!)

    // Perturbations in lunar distance (Earth radii):
    // (convert to au!)
    var perturbationsDistance = 0.0;

    // -0.58 * cos(Mm - 2*D)
    perturbationsDistance += -0.58 * Math.cos(degreesToRadians(this.meanAnomaly - (2 * this.meanElongation)));
    if (fullDebug) { console.log(-0.58 * Math.cos(degreesToRadians(this.meanAnomaly - (2 * this.meanElongation)))); }

    // -0.46 * cos(2*D)
    perturbationsDistance += -0.46 * Math.cos(degreesToRadians(2 * this.meanElongation));
    if (fullDebug) { console.log(-0.46 * Math.cos(degreesToRadians(2 * this.meanElongation))); }

    if (fullDebug) { console.log(perturbationsDistance); }

    // convert this one to au!
    perturbationsDistance = perturbationsDistance * (this.EARTH_RADIUS_IN_KILOMETERS / this.ONE_AU_IN_KILOMETERS);
    this.distance += perturbationsDistance;

    this.distance = this.distance * 97;   // EXPLAIN ME! (multiplied based on Venus being at closest 0.28au from the earth, as per physics.org page, 0.26au is about 97 times current distance.

    this.geocentricDistance = this.distance;

    super.calculatePhaseMoon();

    this.lastCalculated = Date.now();
  }


  debug() {
    super.debug();
    console.log(this.name + '.debug:  Moon.instance.name = ' + Moon.instance.name + ' \n');
  }


  draw(context) {
    super.draw(context);
  }
}


class Sun extends Graha {

  static instance;

  constructor() {

    super();
    Sun.instance = this;

    this.name = 'Sun';
    this.glyph = '☉';

    this.RADIUS = 696000; // kilometers
    this.chartGrahaRadius = 5; // pixels - for double this radius, need to double the chart rays (roughly)  - max size is probably around 8
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 4); // this multiplier needs to reduce a bit for larger radius - size of 3 worked better with 10 pixels, 4 with 5 pixels ...

    // Configure rays - these settings are (mostly) customized for each graha to give the visual representations distinctive qualities
    var maxRotationSpeed = 3;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 4;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius);
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 1.8;
    var beamWidth = 1.6;
    while (this.chartRays.length < 240) {
      this.chartRays.push(new RayOfLight(palette.SUN_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

 static getInstance() {
    if (!Sun.instance) {
      console.log("Creating new Sun");
      Sun.instance = new Sun();
    }
    return Sun.instance;
  }

  getAltitude() {
    return this.altitude;
  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating ' + this.name);}

    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);

    // We're orbiting in the ecliptic, so these two values are zero
    this.longitudeOfAscendingNode = 0.0;  // N
    this.inclination = 0.0; // i

    this.longitudeOfPeriapsis = rev(282.9404 + (0.0000470935 * this.daysSinceMillennium));  // w
    this.meanDistance = 1.000000; // * this.ONE_AU_IN_KILOMETERS;                               // a 

    this.eccentricity = 0.016709 - (0.000000001151 * this.daysSinceMillennium);        // e
    this.meanAnomaly = rev(356.0470 + (0.9856002585 * this.daysSinceMillennium));      // M

    super.sharedOrbitalCalculations();  // where the meat is!

    // In this model the sun orbits the earth, so we don't need to convert our (already geocentric) rectangular coordinates from heliocentric to geocentric 
    this.geocentricX = this.rectancularVernalAxisX;
    this.geocentricY = this.rectancularVernalAxisY;
    this.geocentricZ = this.rectancularVernalAxisZ; // 0; // In our model here for the sun, Z is zero because the inclination of orbit is zero (this.rectancularVernalAxisZ is undefined)

    this.eclipticLongitudeTropical = super.calculateSphericalLongitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.eclipticLongitudeSidereal = rev(this.eclipticLongitudeTropical - this.ayanamsha);

    this.eclipticLatitude = super.calculateSphericalLatitudeFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ); 
    this.geocentricDistance = super.calculateSphericalRadiusFromRectangularCoordinates(this.geocentricX, this.geocentricY, this.geocentricZ);
    this.distance = this.geocentricDistance; // delete me later

    super.getAltitude(); // extra stuff we only need for the sun because we want to use its altitude to determine rising/setting animations
    
    this.lastCalculated = Date.now();
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Sun.instance.name = ' + Sun.instance.name + ' \n');
  }


  draw(context) {
    super.draw(context);
  }
}


class Earth extends Graha {

  static instance;

  constructor() {

    super();
    Earth.instance = this;

    this.name = 'Earth';
    this.RADIUS = 696000; // kilometers
    this.chartGrahaRadius = 5; // pixels
    this.chartGrahaHaloRadius = (this.chartGrahaRadius * 2.5); 

    // Configure rays
    var maxRotationSpeed = 1;
    var minRotationSpeed = 0.1;
    var maxGleamSpeed = 2;
    var minGleamSpeed = 1;
    var minLength = (this.chartGrahaRadius); // for some reason this freaks out if I make it 0.5 even though 0 is fine ..... need to look into that (!!)
    var maxLength = this.chartGrahaHaloRadius;
    var powerFactor = 3;
    var beamWidth = 1.6;
    while (this.chartRays.length < 220) {
      this.chartRays.push(new RayOfLight(palette.EARTH_HUES, minLength, maxLength, powerFactor, minRotationSpeed, maxRotationSpeed, minGleamSpeed, maxGleamSpeed, beamWidth));
    }

    this.RECALCULATE_THRESHOLD = (1000 * 60); // a minute <--- revisit this!!
  }

  static getInstance() {
    if (!Earth.instance) {
      console.log("Creating new Earth");
      Earth.instance = new Earth();
    }
    return Earth.instance;
  }

  calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha) {
    super.calculate(daysSinceMillennium, siderealTime, terrestrialLatitude, eclipticObliquity, ayanamsha);
    // Nothing to calculate - maybe we could make it dark if the sun is below the horizon? not sure tho

    this.distance = 0;
    this.geocentricDistance = this.distance;

    this.phaseAngle = 90;
    this.phase = 0.5;

    this.lastCalculated = Date.now();
    
  }
  debug() {
    super.debug();
    console.log(this.name + '.debug:  Earth.instance.name = ' + Earth.instance.name + ' \n');
  }

  chartCalculations() {

    this.chartDistanceFromOrigin = 0;
    this.chartEclipticLongitude = 0;
    this.chartPosX = 0;
    this.chartPosY = 0;
  }

  draw(context) {
    super.draw(context);
/**
    // Calculations
    var distanceFromOrigin = 0;

    // Draw rays
    for (var ray of this.chartRays) {
      ray.draw(context, 0, 0);
    }

    // Draw sphere
    context.beginPath();
    context.strokeStyle = palette.grahaShadow;
    context.lineWidth = palette.GRAHA_BORDER_LINE_WIDTH;
    context.arc(0, 0, this.chartGrahaRadius, 0, (Math.PI * 2), false);
    context.stroke();
    context.closePath(); 

*/

  }


  drawBackground(context) {  
    // Draw horizon and MC/IC lines here
  }
}


class Sky {

  constructor(date, terrestrialLatitude, terrestrialLongitude) {  // pass a null date for a constantly updating object

    this.date = date;
    this.terrestrialLatitude = terrestrialLatitude;
    this.terrestrialLongitude = terrestrialLongitude;
    this.daysSinceMillennium = 0.0;
    this.siderealTime = 0.0;
    this.eclipticObliquity = 0.0;
    this.ayanamsha = 0.0
    this.mediumCoeliTropical = 0.0;
    this.mediumCoeliSidereal = 0.0;
    this.ascendantTropical = 0.0;
    this.ascendantSidereal = 0.0;

    this.graha = [];

    this.graha.push(Earth.getInstance());
    this.graha.push(Sun.getInstance());
    this.graha.push(Moon.getInstance());
    this.graha.push(Rahu.getInstance());
    this.graha.push(Ketu.getInstance());
    this.graha.push(Mercury.getInstance());
    this.graha.push(Venus.getInstance());
    this.graha.push(Mars.getInstance());
    this.graha.push(Jupiter.getInstance());
    this.graha.push(Saturn.getInstance());
    this.graha.push(Uranus.getInstance());
    this.graha.push(Neptune.getInstance());
    this.graha.push(Pluto.getInstance());

    this.lastCalculated;
    this.RECALCULATE_THRESHOLD = (1000 * 20); // twenty seconds <---- this has to be the most frequently recalculated element as it calls calculate() on all the others!!

  }

  calculate() {

    if ( (this.lastCalculated) && ((Date.now() - this.lastCalculated) < this.RECALCULATE_THRESHOLD) ) { return; } else { console.log('Recalculating Sky');}

    var date = this.date;

    if (!date) {  // if the object is null
      date = new Date();
      if (fullDebug) { console.debug('Sky.calculate: Setting date to current time'); }
    }
    if (fullDebug) { console.debug('Sky.calculate: date = ' + date); }

    // Calculate shared variables here to avoid calculating them repeatedly for each graha

    this.daysSinceMillennium = getDaysSinceMillennium(date);
    this.siderealTime = getSiderealTime(date, this.terrestrialLongitude);
    this.eclipticObliquity = 23.4393 - (0.0000003563 * this.daysSinceMillennium);  // Swedish formula
    // this.eclipticObliquity = getEclipticObliquity(date); // use radixPro formula

    this.mediumCoeliTropical = getMediumCoeliTropical(this.siderealTime, this.terrestrialLongitude, this.eclipticObliquity);
    this.ayanamsha = getAyanamsha(date);
    this.mediumCoeliSidereal = rev(this.mediumCoeliTropical - this.ayanamsha);

    this.ascendantTropical = getAscendantTropical(this.siderealTime, this.terrestrialLatitude, this.terrestrialLongitude, this.eclipticObliquity, this.mediumCoeliTropical);
    this.ascendantSidereal = rev(this.ascendantTropical - this.ayanamsha);

    // Distribute graha through band of chart, in proportion to their actual distances
    this.furthestGrahaOrbitalDistance;
    this.nearestGrahaOrbitalDistance;
    var realGrahaCount = 0;

    for (var graha of this.graha) {
      graha.calculate(this.daysSinceMillennium, this.siderealTime, this.terrestrialLatitude, this.eclipticObliquity, this.ayanamsha); // pass here as parameters to avoid having to calculate them again

      if ((graha.name != 'Earth') && (graha.name != 'Moon') && (graha.name != 'Rahu') && (graha.name != 'Ketu')) {  // skip the earth, moon, rahu and ketu (moon, rahu and ketu have special arrangements!)
        realGrahaCount++;
        if ((!this.furthestGrahaOrbitalDistance) || ((this.furthestGrahaOrbitalDistance) && (graha.geocentricDistance > this.furthestGrahaOrbitalDistance))) {
          this.furthestGrahaOrbitalDistance = graha.geocentricDistance;
        }
        if ((!this.nearestGrahaOrbitalDistance) || ((this.nearestGrahaOrbitalDistance) && (graha.geocentricDistance < this.nearestGrahaOrbitalDistance))) {
          this.nearestGrahaOrbitalDistance = graha.geocentricDistance;
        }
      }
    }

    if (false) {
      console.debug('Sky.calculate: this.furthestGrahaOrbitalDistance = ' + this.furthestGrahaOrbitalDistance);
      console.debug('Sky.calculate: this.nearestGrahaOrbitalDistance = ' + this.nearestGrahaOrbitalDistance);
    }
    // Now we know the nearest and furthest distance - for each one calculate how far through the band (from the center) it should sit

    if (fullDebug) { console.debug(this.graha.length); }
    if (realGrahaCount > 2) {

      var root = 4.6;   // Tried 4.8 for a bit, seemed too much. // Was set to 2.8 when I was focusing on this, then adjusted up after adding Neptune (just to try it out) - we want at least half of the chart used by the "main" 7 planets - possibly 2/3
      var marsMaxDistance = 2.8; // 1; // Use this to offset the "root" curve so that "1" in a normal root curve corresponds with the orbit just outside Mars 
      var rangeOfGrahaOrbitalDistances = (this.furthestGrahaOrbitalDistance - this.nearestGrahaOrbitalDistance);
      var chartGrahaBandWidth = Math.pow((rangeOfGrahaOrbitalDistances / marsMaxDistance), 1/root);   
      if (fullDebug) { console.debug('Sky.calculate: chartGrahaBandWidth = ' + chartGrahaBandWidth); }

      // Add a gap the size of the maximum space divided into equally spaced orbits to the minimum distance 
      // and offset the innermost band to allow space for the Moon, Rahu, Ketu
      // (dividing by one less than the total, which will include the moon orbit, because we're counting spaces between orbits, not no. of orbits)

      var proportionOfBandBetweenMoonAndOtherGraha = 1 / realGrahaCount;                      // divided by our (realGrahaCount - 1) spaces between other Graha plus one space from them to the moon
      var proportionOfBandSharedByAllOtherGraha = (realGrahaCount - 1) / realGrahaCount;      // the (realGrahaCount - 1) spaces between other Graha (the remainder)
      if (fullDebug) { console.debug('Sky.calculate: proportionOfBandBetweenMoonAndOtherGraha = ' +  proportionOfBandBetweenMoonAndOtherGraha);  }

      for (var graha of this.graha) {
        if ((graha.name != 'Earth') && (graha.name != 'Moon') && (graha.name != 'Rahu') && (graha.name != 'Ketu')) {


           graha.chartOrbitalRadiusFactor = proportionOfBandBetweenMoonAndOtherGraha
                                            + (proportionOfBandSharedByAllOtherGraha * 
                                            Math.pow((graha.geocentricDistance - this.nearestGrahaOrbitalDistance) / marsMaxDistance, 1/root)    // Dividing by marsMaxDistance here to turn outside of Mars orbit into "1" in our root curve
                                            / chartGrahaBandWidth); 
                                           

           if (fullDebug) { 
             console.debug('Sky.calculate: graha.chartOrbitalRadiusFactor (' + graha.name + ') = ' + graha.chartOrbitalRadiusFactor); 
             console.debug('Sky.calculate: graha.distance (' + graha.name + ') = ' + graha.geocentricDistance);
           }
        }
      }
    } else if (realGrahaCount == 2) {
      for (var graha of this.graha) { // set them each 1/3 of the way into the band
        // The Earth, Moon, Rahu and Ketu are not going to match either of these conditions, as they were excluded when these distances were collected
        if (graha.geocentricDistance == this.furthestGrahaOrbitalDistance) {
          graha.chartOrbitalRadiusFactor = 2/3;
        } else if (graha.geocentricDistance == this.nearestGrahaOrbitalDistance) {
          graha.chartOrbitalRadiusFactor = 1/3;
        }
      }
    } else { // there is only one (or one and the earth, which doesn't use this variable, or moon/rahu/ketu, which we will set separately in a moment!)
      for (var graha of this.graha) { graha.chartOrbitalRadiusFactor = (1/2); }
      if (fullDebug) { console.debug(graha.chartOrbitalRadiusFactor); }
    }

    // Set values for Moon, Rahu and Ketu!
    Moon.getInstance().chartOrbitalRadiusFactor = 0;
    Rahu.getInstance().chartOrbitalRadiusFactor = 0;
    Ketu.getInstance().chartOrbitalRadiusFactor = 0;

    for (var graha of this.graha) {
      graha.chartCalculations();     // can't call this until we've set the orbital radius factor - can't do that until we've done the physics calcs
    }
    this.lastCalculated = Date.now();
  }

  debug() {
    console.log('Sky.debug:  ********************************************************************************');
    console.log('Sky.debug:  date = ' + this.date + ' \n');
    console.log('Sky.debug:  terrestrialLatitude = ' + this.terrestrialLatitude + ' \n');
    console.log('Sky.debug:  terrestrialLongitude = ' + this.terrestrialLongitude + ' \n');
    console.log('Sky.debug:  daysSinceMillennium = ' + this.daysSinceMillennium + ' \n');
    console.log('Sky.debug:  siderealTime = ' + this.siderealTime + ' \n');
    console.log('Sky.debug:  eclipticObliquity = ' + this.eclipticObliquity + ' \n');
    console.log('Sky.debug:  ayanamsha = ' + this.ayanamsha + ' \n');
    console.log('Sky.debug:  mediumCoeliTropical = ' + this.mediumCoeliTropical + ' \n');
    console.log('Sky.debug:  mediumCoeliSidereal = ' + this.mediumCoeliSidereal + ' \n');
    console.log('Sky.debug:  ascendantTropical = ' + this.ascendantTropical + ' \n');
    console.log('Sky.debug:  ascendantSidereal = ' + this.ascendantSidereal + ' \n');
    for (var graha of this.graha) {
      graha.debug();
    }
    console.log('Sky.debug:  lastCalculated = ' + this.lastCalculated + ' \n');
  }

  draw(context) {

    this.calculate();

    palette.calculate();

    context.clearRect((0 - (context.canvas.clientWidth / 2)), (0 - (context.canvas.clientHeight / 2)), context.canvas.clientWidth, context.canvas.clientHeight);
    context.fillStyle = palette.background;
    context.fillRect((0 - (context.canvas.clientWidth / 2)), (0 - (context.canvas.clientHeight / 2)), context.canvas.clientWidth, context.canvas.clientHeight);

    context.lineWidth = palette.backgroundDetailStrongLineWidth;

    // Central dot
//    context.beginPath();
//    context.arc(0, 0, 5, 0, Math.PI * 2, false);
    context.fillStyle = palette.backgroundDetailStrong;
//    context.fill();
//    context.closePath(); 

    // Horizon
    context.beginPath();
    context.moveTo((-1 * palette.grahaBandRadiusMax), 0);
    context.lineTo(palette.grahaBandRadiusMax, 0);
    context.strokeStyle = palette.backgroundDetailStrong;
    context.stroke();
    context.closePath(); 

    // START: line around nakshatras  ---- this section for debugging!

    context.beginPath();
    context.arc(0, 0, palette.nakshatraBandRadiusMax, 0, Math.PI * 2, false);
    context.strokeStyle = palette.backgroundDetailStrong;
//    context.stroke();
    context.closePath(); 
    context.beginPath();
    context.arc(0, 0, palette.rashiBandRadiusMax, 0, Math.PI * 2, false);
    context.strokeStyle = palette.backgroundDetailStrong;
//    context.stroke();
    context.closePath(); 
    // END: line around nakshatras  ---- this section for debugging!

    // Rotate grid according to ascendant position before drawing rashis and grahas  (which all rotate with ascending sign cusp) 
    context.save(); // before everything that involves rotating sphere as per aries position
    if (isSidereal) {
      context.rotate(degreesToRadians(this.ascendantSidereal)); // rotate the context clockwise by the ascendant value (all elements drawn presume aries zero is at the eastern horizon, origin is already in the centre of the screen)
    } else {
      context.rotate(degreesToRadians(this.ascendantTropical)); // rotate the context clockwise by the ascendant value (all elements drawn presume aries zero is at the eastern horizon, origin is already in the centre of the screen)
    }

    context.save(); // before drawing rashi


    var rashiBandWidth = (palette.rashiBandRadiusMax - palette.glyphBandRadiusMax);
    var thisRashi = 0;

    while (thisRashi < 12) {

      // draw cusp line at zero degrees of the rashi
      context.beginPath();
      context.moveTo((-1 * palette.glyphBandRadiusMax), 0);
      context.lineTo(-1 * (palette.glyphBandRadiusMax - (rashiBandWidth * 1)), 0);
      context.strokeStyle = palette.backgroundDetailStrong;
      context.stroke();
      context.closePath(); 

      palette.drawLineQuadTerminus(context, 
                                (-1 * (palette.glyphBandRadiusMax - (rashiBandWidth * 1))),                     // start
                                (-1 * (palette.glyphBandRadiusMax - (rashiBandWidth * 2))),                    // end - multiplier should be two                                                               // end
                                palette.backgroundDetailStrong, palette.backgroundDetailStrongLineWidth);


      context.rotate(degreesToRadians(360 / -24)); // -15 degree offset, so we land each time in centre of the rashi - to move design clockwise, rotate x/y anticlockwise around z!

      var controlPointOffsetOuter = (rashiBandWidth / 2) * palette.RASHI_BAND_CURVE_DEPTH_PERCENT_OUTER;
      var controlPointOffsetInner = (rashiBandWidth / 2) * palette.RASHI_BAND_CURVE_DEPTH_PERCENT_INNER;
      var outerTipHoriz = (-1 * palette.rashiBandRadiusMax);
  
      var cp2Horiz = -1 * (Math.cos(degreesToRadians(360/24)) * (palette.glyphBandRadiusMax + controlPointOffsetInner));
      var cp2Vert = -1 * (Math.sin(degreesToRadians(360/24)) * (palette.glyphBandRadiusMax + controlPointOffsetInner));
  
      var innerTipHoriz = -1 * (Math.cos(degreesToRadians(360/24)) * palette.glyphBandRadiusMax);
      var innerTipVert = -1 * (Math.sin(degreesToRadians(360/24)) * palette.glyphBandRadiusMax);

      context.beginPath();

      // upper curve
      context.moveTo(innerTipHoriz, innerTipVert);                   // start point of upper curve (we start on the upper, innermost point of the curve)
      context.bezierCurveTo(cp2Horiz, cp2Vert,                       // control point 1
                            outerTipHoriz + controlPointOffsetOuter, 0,   // control point 2
                            outerTipHoriz, 0);                       // end point of upper curve (the outer tip of the rashi shape, on the horizon)

      // lower curve 
      // end point of upper curve is start point of lower curve, so no movement needed
      context.bezierCurveTo(outerTipHoriz + controlPointOffsetOuter, 0,      // control point 1
                            cp2Horiz, (-1 * cp2Vert),                   // control point 2
                            innerTipHoriz, (-1 * innerTipVert));        // end point of upper curve

      context.stroke();     // stroke the path before we add the lines to the centre, used only for the fill (we don't want to stroke them)

      // add line to centre and close path (which will take us back to the start point) before filling with a radial fill
      context.lineTo(0,0);

      var rashiGradient = context.createRadialGradient(0,0,(palette.grahaBandRadiusMax / 2),0,0,palette.rashiBandRadiusMax);    // creates a gradient moving outwards from the center
      rashiGradient.addColorStop(0, 'white');
      rashiGradient.addColorStop(.9, 'pink');
      rashiGradient.addColorStop(1, 'green');
      context.fillStyle = rashiGradient;

//      context.fill();
      context.closePath(); 

      // label
      var fontSize = (rashiBandWidth) * 0.4;
      var labelOriginX = -1 * ((rashiBandWidth * 0.1) + palette.glyphBandRadiusMax);  

      // push context in case we screw up, translate to label origin, rotate 90 degrees, write label, reverse translation and rotation
      context.save();
      context.translate(labelOriginX, 0);
      context.rotate(-Math.PI/2);
      context.textAlign = "center";
      context.font = fontSize + 'px san-serif';
      context.fillStyle = palette.backgroundDetailStrong;
      context.fillText(palette.RASHI_LABELS[thisRashi], 0, 0);

      context.restore();                      // <--- this undoes the translation, rotation etc. used to write the text label correctly



      thisRashi++;
      context.rotate(degreesToRadians(360 / -24)); // correct 15 degree offset so we're at zero degrees of the next rashi

    } // end while for rashi loop

    context.restore(); // after drawing rashi

// ****** Start drawing Nakshatras

    context.save(); // before drawing nakshatras


    var nakshatraBandWidth = (palette.nakshatraBandRadiusMax - palette.nakshatraBandRadiusMin);
    var padaLineOriginX = -1 * ((nakshatraBandWidth * 2 * 0.1) + (palette.nakshatraBandRadiusMin - nakshatraBandWidth)); // "0.1" (10%) below the baseline for the font 
    var thisNakshatra = 0;

    while (thisNakshatra < 27) {

      // draw cusp line at zero degrees of the rashi
      context.beginPath();
      context.moveTo(-1 * (palette.nakshatraBandRadiusMin - (nakshatraBandWidth * 1)), 0);
      context.lineTo(-1 * (palette.nakshatraBandRadiusMin - (nakshatraBandWidth * 2)), 0);
        context.strokeStyle = palette.backgroundDetailMid;  // change this after drawing
      context.stroke();
      context.closePath(); 

      palette.drawLineTripleTerminus(context, 
                                (-1 * (palette.nakshatraBandRadiusMin - (nakshatraBandWidth * 2))),                     // start
                                (-1 * (palette.nakshatraBandRadiusMin - (nakshatraBandWidth * 5))),                    // end   
                                palette.backgroundDetailMid, palette.backgroundDetailStrongLineWidth);

      // will have to change this to add in the padas
      context.rotate(degreesToRadians(360 / -108)); // to the end of the first pada - to move design clockwise, rotate x/y anticlockwise around z!

      // draw the second pada line
      palette.drawLineTripleTerminus(context, 
                                (-1 * palette.nakshatraBandRadiusMin),                     // start
                                (-1 * (palette.nakshatraBandRadiusMin - (nakshatraBandWidth * 3))),                    // end                                                               // end
                                palette.backgroundDetailMid, palette.backgroundDetailStrongLineWidth);


      context.rotate(degreesToRadians(360 / -108)); // to the centre of the nakshatra - to move design clockwise, rotate x/y anticlockwise around z!


      var controlPointOffsetOuter = nakshatraBandWidth;   // redundancy here but let's keep it like this in case it needs to change in future (and to help understand what's going on!)
      var controlPointOffsetInner = (nakshatraBandWidth) * palette.NAKSHATRA_BAND_CURVE_DEPTH_PERCENT;
      var outerTipHoriz = (-1 * palette.nakshatraBandRadiusMax);
  
      var cp2Horiz = -1 * (Math.cos(degreesToRadians(360/54)) * ((palette.nakshatraBandRadiusMin - nakshatraBandWidth) + controlPointOffsetInner));
      var cp2Vert = -1 * (Math.sin(degreesToRadians(360/54)) * ((palette.nakshatraBandRadiusMin - nakshatraBandWidth) + controlPointOffsetInner));
  
      var innerTipHoriz = -1 * (Math.cos(degreesToRadians(360/54)) * (palette.nakshatraBandRadiusMin - nakshatraBandWidth));
      var innerTipVert = -1 * (Math.sin(degreesToRadians(360/54)) * (palette.nakshatraBandRadiusMin - nakshatraBandWidth));

      context.beginPath();

      // upper curve
      context.moveTo(innerTipHoriz, innerTipVert);                   // start point of upper curve (we start on the upper, innermost point of the curve)
      context.bezierCurveTo(cp2Horiz, cp2Vert,                       // control point 1
                            outerTipHoriz + controlPointOffsetOuter, 0,   // control point 2
                            outerTipHoriz, 0);                       // end point of upper curve (the outer tip of the nakshatra shape, on the horizon)

      // lower curve 
      // end point of upper curve is start point of lower curve, so no movement needed
      context.bezierCurveTo(outerTipHoriz + controlPointOffsetOuter, 0,      // control point 1
                            cp2Horiz, (-1 * cp2Vert),                   // control point 2
                            innerTipHoriz, (-1 * innerTipVert));        // end point of upper curve

      context.stroke();     // stroke the path before we add the lines to the centre, used only for the fill (we don't want to stroke them)

      // add line to centre and close path (which will take us back to the start point) before filling with a radial fill
      context.lineTo(0,0);

//      var rashiGradient = context.createRadialGradient(0,0,(palette.grahaBandRadiusMax / 2),0,0,palette.rashiBandRadiusMax);    // creates a gradient moving outwards from the center
//      rashiGradient.addColorStop(0, 'white');
//      rashiGradient.addColorStop(.9, 'pink');
//      rashiGradient.addColorStop(1, 'green');
//      context.fillStyle = rashiGradient;
//      context.fill();

      context.closePath(); 

      // label
      var fontSize = (nakshatraBandWidth * 2) * 0.4;
      var labelOriginX = -1 * ((nakshatraBandWidth * 2 * 0.2) + (palette.nakshatraBandRadiusMin - nakshatraBandWidth));  

      // push context in case we screw up, translate to label origin, rotate 90 degrees, write label, reverse translation and rotation
      context.save();
      context.translate(labelOriginX, 0);
      context.rotate(-Math.PI/2);
      if (thisNakshatra == 1) { // rotate the Bharani glyph 180 degrees
        context.rotate(-Math.PI);
        context.translate(0, (fontSize / 2)); // need to do this on the Y axis instead as we already rotated 90 degrees to print the text for all labels
      }
      context.textAlign = "center";
      context.font = fontSize + 'px san-serif';
      context.fillStyle = palette.backgroundDetailMid;
      context.fillText(palette.NAKSHATRA_LABELS[thisNakshatra], 0, 0);

      context.restore();                      // <--- this undoes the translation, rotation etc. used to write the text label correctly

      // draw the third pada line here
      palette.drawLineTripleTerminus(context, 
                                (-1 * ((nakshatraBandWidth * 2 * 0.1) + (palette.nakshatraBandRadiusMin - nakshatraBandWidth))), // start - "0.1" (10%) below the baseline for the font )
                                (-1 * (palette.nakshatraBandRadiusMin - (nakshatraBandWidth * 2))),                    // end                                                               // end
                                palette.backgroundDetailMid, palette.backgroundDetailStrongLineWidth);                                                            // end

      context.rotate(degreesToRadians(360 / -108)); // to the end of the third pada - to move design clockwise, rotate x/y anticlockwise around z!
      // draw the fourth pada line here
      palette.drawLineTripleTerminus(context, 
                                (-1 * palette.nakshatraBandRadiusMin),                     // start
                                (-1 * (palette.nakshatraBandRadiusMin - (nakshatraBandWidth * 3))),                    // end                                                               // end
                                palette.backgroundDetailMid, palette.backgroundDetailStrongLineWidth);

      thisNakshatra++;
      context.rotate(degreesToRadians(360 / -108)); // correct 15 degree offset so we're at zero degrees of the next rashi

    } // end while for rashi loop

    context.restore(); // after drawing rashi
// ****** End drawing Nakshatras


    for (var graha of this.graha) {
      graha.drawBackground(context);    // do this in a separate loop to make sure these lines don't get drawn over the top of other graha
    }

    for (var graha of this.graha) {
      graha.draw(context);
    }

    context.restore();    // rotation for ascendant position
  }
}

// *******************************************************************************************************

var canvas;
var context;
//   const c = canvas.getContext('2d'); // where should this be?
var sky;


function init() {
  creation();
  addEventListener('resize', creation);

  if (window.location.host.indexOf('localhost:8081') > -1) {
    document.title = document.title + " journal (private)";
  } else {
    document.title = document.title + " velw.github.io";
  }

}




function creation() {
    canvas = document.getElementById("akash");
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    if (canvas.getContext) {
      context = canvas.getContext('2d');

      context.font = 'Arial, serif';

      
      // set up chart variables for graphics
      var maxRadius = Math.floor(context.canvas.clientHeight / 2);
      palette.grahaBandRadiusMax = maxRadius * palette.GRAHA_BAND_MAX_PERCENT;
      palette.grahaBandRadiusMin = maxRadius * palette.GRAHA_BAND_MIN_PERCENT;

      palette.glyphBandRadiusMax = maxRadius * palette.GLYPH_BAND_MAX_PERCENT;
      palette.rashiBandRadiusMax = maxRadius * palette.RASHI_BAND_MAX_PERCENT;
      palette.nakshatraBandRadiusMin = maxRadius * palette.NAKSHATRA_BAND_MIN_PERCENT;
      palette.nakshatraBandRadiusMax = maxRadius * palette.NAKSHATRA_BAND_MAX_PERCENT;
      palette.rashiLabelBandRadiusMax = maxRadius * palette.RASHI_LABEL_BAND_MAX_PERCENT;


      context.translate(Math.floor(innerWidth / 2), Math.floor(innerHeight / 2));
      context.save(); // We should never be restoring to this point, but it's just to set a baseline

      var tokyoLatitude = ((35*60) + 42) / 60; // 35N42'
      var tokyoLongitude = ((139*60) + 46) / 60; // 139E46'

      var swedenLatitude = 60; // 
      var swedenLongitude = 15; //



      // ************** START: For debugging
      // sky = new Sky(new Date('19 Apr 1990 00:00:00 GMT'), swedenLatitude, swedenLongitude);  // Swedish page test date
      // sky = new Sky(new Date('2 June 2022 16:00:00 GMT'), tokyoLatitude, tokyoLongitude);

      // ************** END: For debugging

      // ************** For live view
      sky = new Sky(null, tokyoLatitude, tokyoLongitude);

      if (!sky.date) {                      // only start animating if we're displaying a live view rather than a specific time
        requestAnimationFrame(update); 
      }
      else {                                // otherwise just draw once
        sky.draw(context); 
      }

      // ************** START: For debugging
      // sky.debug();
      // ************** END: For debugging

    } else {
          // canvas-unsupported code here
    }  // if (canvas.getContext) 
    
}


var MILLISECONDS_PER_FRAME = 41;  // 41.6 = 24fps
var lastFrame = Date.now() + MILLISECONDS_PER_FRAME;  // So it refreshes immediately the first time

// Stop untidy freezing of animation when user navigates away from page
var unloading = false;
window.addEventListener('beforeunload', (event) => {
  unloading = true;
  // Chrome requires returnValue to be set.
  event.returnValue = '';
});

function update() {
  
  if (!unloading) {
    if ((lastFrame) && ((Date.now() - lastFrame) >= MILLISECONDS_PER_FRAME)) { 
      // console.debug('Updating at ' + new Date());
      sky.draw(context);
      lastFrame = Date.now();
    }
    requestAnimationFrame(update);
  }
}



