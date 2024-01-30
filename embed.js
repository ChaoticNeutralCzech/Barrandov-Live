const tv = document.getElementById("tv");
const duha = document.getElementById("duha");
duha.crossOrigin = "anonymous";
duha.src = "duha.png";
const controls = document.getElementById("controls");
const urlParams = new URLSearchParams(window.location.search);
const fullButton = document.getElementById("full");
const exitButton = document.getElementById("exit");
var channel = parseInt(urlParams.get("ch"));
if (channel < 0 || channel > 3) channel = 0;

var scale = 4; //simulated quality: 0.5 = "LQ", 1 = "SD", 4 = "HD"
var full = false;
var ctx;
duha.style = "display: none";
const bootTime = Date.now();
var updater;
var autoScale;

function startTV()
{ 
	var s = scale;
	if(s==0) 
	{
		tv.width = 1;
		tv.height = 1;
		ctx = tv.getContext("2d");
		ctx.fillRect(0, 0, 1, 1);
	} else {
		tv.width = s*480;
		tv.height = s*270;
		ctx = tv.getContext("2d");
		if(s > 1) {
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;
			ctx.imageSmoothingEnabled = false;
		} else {
			ctx.webkitImageSmoothingEnabled = true;
			ctx.mozImageSmoothingEnabled = true;
			ctx.msImageSmoothingEnabled = true;
			ctx.imageSmoothingEnabled = true;
		}
		ctx.drawImage(duha, 0, 0, s*480, s*270);
	  ctx.font = s*12 + "pt Monoskop";
    ctx.fillStyle = "#000";
    var leftTopPixel = ctx.getImageData(0, 0, 1, 1)
    if(leftTopPixel.data[1] == 255) updateTime();
	}
}

function updateTime()
{
	var s = scale;
	ctx.fillRect(s*183, s*126, s*110, s*18);
	ctx.fillStyle = "#0f0";
	var dayMillis = (Date.now() + 3600*1000) % (1000*3600*24); //unix millis to CET day millis
	var frm = ((dayMillis %   1000)-(dayMillis %     40)) / 40;
	var sec = ((dayMillis %  60000)-(dayMillis %   1000)) / 1000;
	var min = ((dayMillis %3600000)-(dayMillis %  60000)) / 60000;
	var hrs = ( dayMillis          -(dayMillis %3600000)) / 3600000;
	
	var timeString = String(hrs).padStart(2, '0') + ':' + 
					 String(min).padStart(2, '0') + ':' + 
					 String(sec).padStart(2, '0') + ':' + 
					 String(frm).padStart(2, '0');
	ctx.fillText(timeString, s*183, s*142);
  ctx.fillStyle = "#000";
  if(s < 1) {ctx.fillStyle = "#00000080"}; //afterglow w half-life 40 ms, simulates compression artifacts
}

function goFullscreen()
{
}

function exitFullscreen()
{
}

function startUpdatingTime()
{
	if (!updater) updater = setInterval(updateTime, 40);
}

function stopUpdatingTime()
{
  clearInterval(updater);
}

var rot = 0;
var spinning;

function spin()
{
	spinner.style.transform = "rotate(" + 30*rot + "deg)";
	rot = (rot + 1) % 12;
}

function startSpinning()
{
	spinning = setInterval(spin, 40);
	spinner.style = "opacity: 1; visibility: visible";
}
function stopSpinning()
{
	clearInterval(spinning);
  spinning = false;
	spinner.style = "opacity: 0; visibility: hidden";
}

var imageLoadTime;
var loadInterval;

function updateQuality()
{
  stopSpinning(); 
  startTV();   
  startUpdatingTime();
}

function simulateLoading() 
{
  if (scale == 1) scale = computeAutoScale();
  if (!spinning && scale < 1) scale = 1;
  updateQuality(); 
  if (scale != 4)  loadInterval = setTimeout(simulateLoading, (imageLoadTime * 6 * scale + 3000 * scale - 1000));
}

function imagesCheck()
{
  if(duha.complete && duha.naturalWidth > 0 && spinner.complete && document.fonts.check("12px Monoskop"))
	{
    if (scale == 0) scale = 0.5;
    startTV();
    
    var leftTopPixel = ctx.getImageData(0, 0, 1, 1)
    if(leftTopPixel.data[1] == 255) 
    {
      clearInterval(loadInterval); 
      if (channel > 0) {
        imageLoadTime = Date.now() - bootTime;
        loadInterval = setTimeout(simulateLoading, imageLoadTime * 3 + 400);
        scale = .5;
      } else startUpdatingTime();
    } 
    
    
  } else if (Date.now() - bootTime > 1e4) location.reload();
}

var hideControlsTimeout;
var controlsDisabled = false;

function hideControls()
{
  controls.style.opacity = 0;
}

function showControls()
{
  if (!controlsDisabled)
  {
    clearTimeout(hideControlsTimeout);
    controls.style.opacity = 1;
    hideControlsTimeout = setTimeout(hideControls, 3000);
  }
}

function redoFullScreen(){};

function computeAutoScale()
{
  autoScale = Math.max(1, Math.floor(tv.clientHeight * window.devicePixelRatio / 270 + 0.8));
  redoFullScreen();
  return autoScale;
}

var qualityStepTimeout;

function stepQuality(s, delay, seamless)
{
  if (!seamless) {
    stopUpdatingTime();
    startSpinning();
  }
  clearTimeout(qualityStepTimeout);
  qualityStepTimeout = setTimeout(function(){scale = s; updateQuality()}, delay)
}

computeAutoScale();
document.body.onmousemove = showControls;
document.body.onresize = function(){stepQuality(computeAutoScale(), 1000, true)};

loadInterval = setInterval(imagesCheck, 200);

if (channel > 0) 
{ 
	startSpinning();
	scale = 0;
  controls.style.display = "flex";
	startTV();
} else {
  controlsDisabled = true;
	computeAutoScale();
  scale = autoScale;
}


function stepQualityRough(s, delay)
{

}
const me = document.documentElement;


function fullScreen() {
  var fsPromise = me.requestFullscreen();
  if (!fsPromise) fsPromise = me.webkitRequestFullscreen();
  if (!fsPromise) fsPromise = me.msRequestFullscreen();
  fsPromise.then(redoFullScreen)
}

function exitScreen() {
  var esPromise = document.exitFullscreen();
  if (!esPromise) esPromise = document.webkitExitFullscreen();
  if (!esPromise) esPromise = document.msExitFullscreen();
  esPromise.then(redoFullScreen)
}

fullButton.onclick = fullScreen;
exitButton.onclick = exitScreen;

function redoFullScreen(){ //runs on resize; checks if fullscreen, rectifies stuff if variable "full" is wrong
  if(document.fullscreenElement)
  {
    if (!full)
    {
      fullButton.style.display = "none";
      exitButton.style.display = "block";
    }
    full = true;
  } else {
    if (full)
    {
      fullButton.style.display = "block";
      exitButton.style.display = "none";
    }
    full = false;
  }
}


document.body.addEventListener("keydown", function(e){
  if (e.key == "f" || e.code == "f" || e.keyCode == 102 )  {
    if(full) exitScreen();
    else fullScreen();
  }
});
