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

addEventListener("resize", (event) =>
{
    resize();
});


let percentage = 0;
let initialRadius = 100;

let strokeColour = "red";

ctx.strokeStyle = strokeColour;
function loading()
{
    settings = getSettingsFromHTML();
    ctx.lineWidth = settings.lineWidth;
    ctx.shadowBlur = settings.lineBlur;

    percentage += settings.increment;

    for (let i = 0; i < settings.numberOfLines; i+=1)
    {
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

    if (tick % framerate)
    {
        percentageEl.textContent = percentage.toFixed(0) + "%";
    }

    if (percentage >= 100)
    {
        percentage = 0;
    }
}

let framerate = 60;
let tick = 0;
let interval;
const loadingStep = () => { 
    interval = setInterval(() =>
    {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        loading();
        tick++;
    }, 1000 / framerate);
}

loadingStep();


function restart()
{
    tick = 0;
    percentage = 0;
    clearInterval(interval);
    percentageEl.textContent = 0 + "%";
    loadingStep();
}
document.getElementById("restart").onclick = () => {restart()};

function resetVariables()
{
    var settings = 
    {
        lineWidth: 2,
        lineBlur: 5,
        increment: 0.06,
        innerCircleRadius: 100,
        numberOfLines: 12,
        lineSeparation: 15,
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

    let initialTextSize = 90;
    let initialTextBlur = 5;
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

var settings = 
{
    lineWidth: 2,
    lineBlur: 5,
    increment: 0.06,
    innerCircleRadius: 100,
    numberOfLines: 12,
    lineSeparation: 15,
    spinRate: 3,
    spinDirection: 1,
};
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
    };
    
    return settings;
}

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

document.getElementById("addStop").addEventListener("click", function() 
{
    let stopDiv = document.createElement("div");
    stopDiv.classList.add("gradientStop");
    
    let stopColour = document.createElement("input");
    stopColour.type = "color";
    stopColour.value = "#000000";
    stopColour.classList.add("stopColour");
    
    let stopPosition = document.createElement("input");
    stopPosition.type = "number";
    stopPosition.min = "0";
    stopPosition.value = "50";
    stopPosition.max = "100";
    stopPosition.classList.add("stopPosition");
    
    stopDiv.appendChild(stopColour);
    stopDiv.appendChild(stopPosition);
    
    document.getElementById("gradientStops").appendChild(stopDiv);
});