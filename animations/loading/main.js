const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');
const percentageEl = document.getElementById('percentage');

var midScreen = {x: innerWidth/2, y: innerHeight/2};

function resize()
{
    canvasEl.width = innerWidth;
    canvasEl.height = innerHeight;
    midScreen = {x: innerWidth/2, y: innerHeight/2};
}
resize();
addEventListener("resize", (event) => { resize(); });

var settings;
function getSettingsFromHTML() 
{
    settings = 
    {
        lineWidth: parseFloat(document.getElementById("line-width").value),
        lineBlur: parseFloat(document.getElementById("line-blur").value),
        increment: parseFloat(document.getElementById("increment").value),
        innerCircleRadius: parseFloat(document.getElementById("inner-circle-radius").value),
        numberOfLines: parseInt(document.getElementById("number-of-lines").value),
        lineSeparation: parseFloat(document.getElementById("line-separation").value),
        spinRate: parseFloat(document.getElementById("spin-rate").value),
        spinDirection: parseInt(document.getElementById("spin-direction").value),
        missEveryXLines: parseInt(document.getElementById("miss-every-x-lines").value),
    };
    return settings;
}
const variables = document.getElementsByClassName("variable");
for (let variable of variables)
{
    variable.oninput = () => { getSettingsFromHTML() };
}
getSettingsFromHTML();

document.getElementById("text-size").oninput = () => 
{
    let textSize = parseFloat(document.getElementById("text-size").value);
    document.getElementById("percentage").style.setProperty("--text-size", textSize + "px");
};

document.getElementById("text-blur").oninput = () =>
{
    let textBlur = parseFloat(document.getElementById("text-blur").value);
    document.getElementById("percentage").style.setProperty("--text-blur", textBlur + "px");
}

var percentage = 0;
function loading()
{
    ctx.lineWidth = settings.lineWidth;
    ctx.shadowBlur = settings.lineBlur;

    percentage += settings.increment;

    if (percentage >= 100) { percentage = 0; }

    for (let i = 0; i < settings.numberOfLines; i+=1)
    {
        if (settings.missEveryXLines > 0 && (i+1) % settings.missEveryXLines === 0) continue;
        let radius = settings.innerCircleRadius + i * settings.lineSeparation;
        let shift = settings.spinDirection * i * (percentage / 100) * settings.spinRate;
        let startangle = shift * Math.PI * 2;
        let endangle = startangle + (percentage / 100) * Math.PI * 2;

        if (i === 0 && settings.spinDirection === -1) // don't ask
        {
            let temp = startangle;
            startangle = -endangle + Math.PI * 2;
            endangle = temp;
        }

        let colour = getColourAtPercentage(percentage);
        document.getElementById("percentage").style.setProperty("--text-colour", `${colour}`);

        ctx.beginPath();
        ctx.strokeStyle = colour;
        ctx.shadowColor = colour;
        ctx.arc(midScreen.x, midScreen.y, radius, startangle, endangle);
        ctx.stroke();
    }

    if (tick % framerate) { percentageEl.textContent = percentage.toFixed(0) + "%"; }
}

let framerate = 60;
let tick = 0;
function animate()
{
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    loading();
    tick++;
    requestAnimationFrame(animate);
}

animate();


function restart()
{
    tick = 0;
    percentage = 0;
    percentageEl.textContent = 0 + "%";
}
document.getElementById("restart").onclick =  restart;

function resetVariables()
{
    var settings = 
    {
        lineWidth: 3,
        lineBlur: 10,
        increment: 0.06,
        innerCircleRadius: 100,
        numberOfLines: 12,
        lineSeparation: 25,
        spinRate: 3,
        spinDirection: 1,
    };
    document.getElementById("line-width").value = settings.lineWidth;
    document.getElementById("line-blur").value = settings.lineBlur;
    document.getElementById("increment").value = settings.increment;
    document.getElementById("inner-circle-radius").value = settings.innerCircleRadius;
    document.getElementById("number-of-lines").value = settings.numberOfLines;
    document.getElementById("line-separation").value = settings.lineSeparation;
    document.getElementById("spin-rate").value = settings.spinRate;
    document.getElementById("spin-direction").value = settings.spinDirection;

    let initialTextSize = 80;
    let initialTextBlur = 7;
    document.getElementById("percentage").style.setProperty("--text-size", initialTextSize + "px");
    document.getElementById("percentage").style.setProperty("--text-blur", initialTextBlur + "px");

    document.getElementById("gradientStops").innerHTML = `
    <div id="gradientStops">
                        <div id="titles">
                            <div>Colour:</div>
                            <div>Percentage:</div>
                        </div>
                        <br>
                        <div class="gradientStop">
                            <input type="color" value="#ff0000" class="stopColour">
                            <input type="number" value="0" min="0" max="100" class="stopPosition">
                        </div>
                        <div class="gradientStop">
                            <input type="color" value="#0000ff" class="stopColour">
                            <input type="number" value="100" min="0" max="100" class="stopPosition">
                        </div>
    </div>`; // don't judge me for this
}
document.getElementById("reset").onclick = () => {resetVariables()};

function getColourAtPercentage(percentage) 
{
    let stopDivs = document.querySelectorAll(".gradientStop");
    let stops = [];
    for (let div of stopDivs) 
    {
        let colour = div.querySelector(".stopColour").value;
        let position = div.querySelector(".stopPosition").value;
        stops.push({colour: colour, stop: position});
    }
    stops.sort((a, b) => a.stop - b.stop);

    let lowerStop = stops[0];
    let upperStop;
    for (let i = 1; i < stops.length; i++) 
    {
        upperStop = stops[i];
        if (upperStop.stop >= percentage) { break; }
        lowerStop = upperStop;
    }

    let range = upperStop.stop - lowerStop.stop;
    let position = (percentage - lowerStop.stop) / range;  

    let lowerColour = hexToRGB(lowerStop.colour);  
    let upperColour = hexToRGB(upperStop.colour);
    let currentColour = {
        r: interpolate(lowerColour.r, upperColour.r, position),
        g: interpolate(lowerColour.g, upperColour.g, position),
        b: interpolate(lowerColour.b, upperColour.b, position)
    };

    return colourToCSS(currentColour);
}

function colourToCSS(colour) 
{
    if (colour.a !== undefined) 
    {
        return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;
    }
    return `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
}

function hexToRGB(hexColour)
{
    let r = parseInt(hexColour.substring(1, 3), 16);
    let g = parseInt(hexColour.substring(3, 5), 16);
    let b = parseInt(hexColour.substring(5, 7), 16);
    if (hexColour.length > 7)
    {
        let a = parseInt(hexColour.substring(7, 9), 16);
        return { r, g, b, a };
    }
    return { r, g, b };
}

function interpolate(start, end, factor) { return start + (end - start) * factor; }

function addGradientStop(color, position)
{
    let stopDiv = document.createElement("div");
    stopDiv.classList.add("gradientStop");
    
    let stopColour = document.createElement("input");
    stopColour.type = "color";
    stopColour.value = color;
    stopColour.classList.add("stopColour");
    
    let stopPosition = document.createElement("input");
    stopPosition.type = "number";
    stopPosition.min = "0";
    stopPosition.value = position;
    stopPosition.max = "100";
    stopPosition.classList.add("stopPosition");
    
    stopDiv.appendChild(stopColour);
    stopDiv.appendChild(stopPosition);
    
    document.getElementById("stops").appendChild(stopDiv);
}
document.getElementById("addStop").addEventListener("click", function() { addGradientStop("#000000", 50); });


function gradientPresetChange()
{
    preset = parseInt(document.getElementById("presets").value);
    stops = document.getElementById("stops");
    stops.innerHTML = "";
    switch (preset)
    {
        case 0: // red-green-blue
            addGradientStop("#ff0000", 0);
            addGradientStop("#00ff00", 50);
            addGradientStop("#0000ff", 100);
            break;
        case 1: // wedding day blues
            addGradientStop("#40e0d0", 0);
            addGradientStop("#ff8c00", 50);
            addGradientStop("#ff0080", 100);
            break;
        case 2: // sunset
            addGradientStop("#ffff00", 0);
            addGradientStop("#ff8000", 50);
            addGradientStop("#a80000", 100);
            break;
        case 3: // Ibiza sunset
            addGradientStop("#ee0979", 0);
            addGradientStop("#ff6a00", 100);
            break;
        case 4: // Tron:
            addGradientStop("#21C4E7", 0);
            addGradientStop("#21C4E7", 45);
            addGradientStop("#fc741e", 50);
            addGradientStop("#fc741e", 95);
            addGradientStop("#21C4E7", 100);
            break;
        case 5: // Spectrum
            addGradientStop("#ff0000", 0);
            addGradientStop("#ff8000", 20);
            addGradientStop("#ffff00", 40);
            addGradientStop("#00ff00", 60);
            addGradientStop("#0000ff", 80);
            addGradientStop("#ff00ff", 100);
            break;
    }
}
document.getElementById("presets").addEventListener("input", (gradientPresetChange));