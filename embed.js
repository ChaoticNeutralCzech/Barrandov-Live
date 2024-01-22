const tv = document.getElementById("tv");
const scale = 4; //simulated quality: 0.5 = "LQ", 1 = "SD", 4 = "HD"
const full = false;
var ctx;
const duha = document.getElementById("duha")
duha.style = "display: none";


function startTV()
{ 
	let s = scale;
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
	}
}

function updateTime()
{
	let s = scale;
	ctx.fillStyle = "#000";
	if(s < 1) {ctx.fillStyle = "#00000080"}; //afterglow half-life 40 ms, simulates compression artifacts
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
}

function goFullscreen()
{
}

function exitFullscreen()
{
}



function startUpdatingTime()
{
	let updater = setInterval(updateTime, 40);
}

function stopUpdatingTime()
{
	clearInterval(updater);
}

startTV();
startUpdatingTime();