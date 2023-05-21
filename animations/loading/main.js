/*
    Copyright (C) 2023 Sean Strain.
    This file is part of seanstrain.github.io.

    seanstrain.github.io is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    seanstrain.github.io is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with seanstrain.github.io. If not, see <http://www.gnu.org/licenses/>.
*/

const canvasEl = document.getElementById('canvas');
const ctx = canvasEl.getContext('2d');
const percentageEl = document.getElementById('percentage');
const epsilon = 0.0001;

var midScreen = {x: innerWidth/2, y: innerHeight/2};

function resize()
{
    canvasEl.width = innerWidth;
    canvasEl.height = innerHeight;
    midScreen = {x: innerWidth/2, y: innerHeight/2};
}
resize();
addEventListener("resize", (event) => { resize(); });

const defaultSettings =
{
    lineWidth: 3,
    lineBlur: 10,
    increment: 0.06,
    innerRadius: 100,
    numberOfLines: 12,
    lineSeparation: 25,
    spinRate: 3,
    spinDirection: 1,
    missEveryXLines: 0,
    startAngle: 0,
    numberOfSides: 0,
}
var settings;
function getSettingsFromHTML() 
{
    settings = 
    {
        lineWidth: parseFloat(document.getElementById("line-width").value),
        lineBlur: parseFloat(document.getElementById("line-blur").value),
        increment: parseFloat(document.getElementById("increment").value),
        innerRadius: parseFloat(document.getElementById("inner-circle-radius").value),
        numberOfLines: parseInt(document.getElementById("number-of-lines").value),
        lineSeparation: parseFloat(document.getElementById("line-separation").value),
        spinRate: parseFloat(document.getElementById("spin-rate").value),
        spinDirection: parseInt(document.getElementById("spin-direction").value),
        missEveryXLines: parseInt(document.getElementById("miss-every-x-lines").value),
        startAngle: parseFloat(document.getElementById("start-angle").value),
        numberOfSides: parseInt(document.getElementById("number-of-sides").value),
    };
    return settings;
}

const variables = document.getElementsByClassName("variable");
for (let variable of variables) { variable.oninput = () => { getSettingsFromHTML() }; }

document.getElementById("number-of-sides").oninput = () => // special case for monogon and digon
{
    let value = parseInt(document.getElementById("number-of-sides").value);
    if (value === 1 || value === 2)
    {
        if (settings.numberOfSides === 3) { document.getElementById("number-of-sides").value = 0; }
        else { document.getElementById("number-of-sides").value = 3; }
    }
    getSettingsFromHTML();
}

document.getElementById("spin-direction").addEventListener("input", (getSettingsFromHTML));
document.getElementById("shape").addEventListener("input", (getSettingsFromHTML));
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

    // case _:
    let colour = getColourAtPercentage(percentage);
    document.getElementById("percentage").style.setProperty("--text-colour", `${colour}`);
    ctx.strokeStyle = colour;
    ctx.shadowColor = colour;

    let direction = settings.spinDirection;

    for (let i = 0; i < settings.numberOfLines; i+=1)
    {
        if (settings.spinDirection === 2) { direction = i % 2 === 0 ? 1 : -1; }
        if (settings.missEveryXLines > 0 && (i+1) % settings.missEveryXLines === 0) continue;

        let radius = settings.innerRadius + i * settings.lineSeparation;
        
        let shift;
        let angleShift;
        let x1, y1, x2, y2, x3, y3;
        let sides, sideLengthPercentage, angleSeparation, angles, cornerPoints;
        let adjustedPercentage, start, end;

        if (settings.numberOfSides == 0)
        {
            shift = direction * i * (percentage / 100) * settings.spinRate;
            let startPoint = shift * Math.PI * 2 + degreesToRadians(settings.startAngle);
            let endPoint = startPoint + (percentage / 100) * Math.PI * 2;
    
            if (i === 0 && settings.spinDirection === -1) // don't ask
            {
                let temp = startPoint;
                startPoint = -endPoint + Math.PI * 2;
                endPoint = temp;
            }

            ctx.beginPath();
            ctx.arc(midScreen.x, midScreen.y, radius, startPoint, endPoint);
            ctx.stroke();
        } else {
            adjustedPercentage = (percentage * settings.spinRate * i) % 100;
            drawLineOnShape(percentage, adjustedPercentage, radius);
        }

        // switch (settings.numberOfSides)
        // {
        //     case 0:
        //         shift = direction * i * (percentage / 100) * settings.spinRate;
        //         let startPoint = shift * Math.PI * 2 + degreesToRadians(settings.startAngle);
        //         let endPoint = startPoint + (percentage / 100) * Math.PI * 2;
        
        //         if (i === 0 && settings.spinDirection === -1) // don't ask
        //         {
        //             let temp = startPoint;
        //             startPoint = -endPoint + Math.PI * 2;
        //             endPoint = temp;
        //         }

        //         ctx.beginPath();
        //         ctx.arc(midScreen.x, midScreen.y, radius, startPoint, endPoint);
        //         ctx.stroke();
        //         break;

        //     case "triangle-full":
        //         if (settings.spinDirection === 2) { direction = i % 2 === 0 ? 1 : -1; }

        //         shift = direction * i * (percentage / 100) * settings.spinRate;
        //         angleShift = shift * Math.PI * 2 - Math.PI / 2 + degreesToRadians(settings.startAngle);
                
        //         x1 = midScreen.x + radius * Math.cos(angleShift);
        //         y1 = midScreen.y + radius * Math.sin(angleShift);
        //         x2 = midScreen.x + radius * Math.cos(angleShift + Math.PI * 2 / 3);
        //         y2 = midScreen.y + radius * Math.sin(angleShift + Math.PI * 2 / 3);
        //         x3 = midScreen.x + radius * Math.cos(angleShift + Math.PI * 4 / 3);
        //         y3 = midScreen.y + radius * Math.sin(angleShift + Math.PI * 4 / 3);
        
        //         ctx.beginPath();
        //         ctx.moveTo(x1, y1);
        //         ctx.lineTo(x2, y2);
        //         ctx.lineTo(x3, y3);
        //         ctx.closePath();
        //         ctx.stroke();
        //         break;

        //     case "triangle-hybrid": // you have to see it to understand
        //         radius = settings.innerRadius + i * settings.lineSeparation;
        //         shift = direction * i * (percentage / 100) * settings.spinRate;
        //         angleShift = shift * Math.PI * 2 - Math.PI / 2 + degreesToRadians(settings.startAngle);
            
        //         x1 = midScreen.x + radius * Math.cos(angleShift);
        //         y1 = midScreen.y + radius * Math.sin(angleShift);
        //         x2 = midScreen.x + radius * Math.cos(angleShift + Math.PI * 2 / 3);
        //         y2 = midScreen.y + radius * Math.sin(angleShift + Math.PI * 2 / 3);
        //         x3 = midScreen.x + radius * Math.cos(angleShift + Math.PI * 4 / 3);
        //         y3 = midScreen.y + radius * Math.sin(angleShift + Math.PI * 4 / 3);
            
        //         ctx.beginPath();
        //         ctx.moveTo(x1, y1);
            
        //         if (percentage <= 33) 
        //         {
        //             let t = percentage / 33;
        //             let interX = x1 + (x2 - x1) * t;
        //             let interY = y1 + (y2 - y1) * t;
        //             ctx.lineTo(interX, interY);
        //         } else if (percentage <= 66) {
        //             ctx.lineTo(x2, y2);
        //             let t = (percentage - 33) / 33;
        //             let interX = x2 + (x3 - x2) * t;
        //             let interY = y2 + (y3 - y2) * t;
        //             ctx.lineTo(interX, interY);
        //         } else {
        //             ctx.lineTo(x2, y2);
        //             ctx.lineTo(x3, y3);
        //             let t = (percentage - 66) / 33;
        //             let interX = x3 + (x1 - x3) * t;
        //             let interY = y3 + (y1 - y3) * t;
        //             ctx.lineTo(interX, interY);
        //         }
        //         ctx.stroke();
        //         break;

        //     case 3:
        //         sideLengthPercentage = 1 / sides * 100;
            
        //         angleSeparation = Math.PI * 2 / sides;                

        //         angles = {
        //             angle1: degreesToRadians(settings.startAngle) - Math.PI / 2,
        //             angle2: degreesToRadians(settings.startAngle) - Math.PI / 2 + angleSeparation,
        //             angle3: degreesToRadians(settings.startAngle) - Math.PI / 2 + angleSeparation * 2
        //         }
                    
        //         cornerPoints = [
        //             { x: midScreen.x + radius * Math.cos(angles.angle1), y: midScreen.y + radius * Math.sin(angles.angle1) },
        //             { x: midScreen.x + radius * Math.cos(angles.angle2), y: midScreen.y + radius * Math.sin(angles.angle2) },
        //             { x: midScreen.x + radius * Math.cos(angles.angle3), y: midScreen.y + radius * Math.sin(angles.angle3) }
        //         ];
                
        //         getPosition = function getPositionOnTriangle(percentage) 
        //         {
        //             let sides = cornerPoints.length;
        //             let sideLengthPercentage = 100 / sides;
        //             let side = Math.floor(percentage / sideLengthPercentage);
        //             let portion = (percentage % sideLengthPercentage) / sideLengthPercentage;
        //             let point1 = cornerPoints[side % sides];
        //             let point2 = cornerPoints[(side + 1) % sides];
        //             return {
        //                 x: point1.x + (point2.x - point1.x) * portion,
        //                 y: point1.y + (point2.y - point1.y) * portion,
        //                 side: side + 1
        //             };
        //         }
            
        //         adjustedPercentage = (percentage * settings.spinRate * i) % 100;

        //         drawLineOnShape(percentage, adjustedPercentage, sideLengthPercentage, sides);
        //         break;

        //     case 4:
        //         adjustedPercentage = (percentage * settings.spinRate * i) % 100;
        //         drawLineOnShape(percentage, adjustedPercentage, sideLengthPercentage, radius);
        // }
    }

    if (tick % framerate) { percentageEl.textContent = percentage.toFixed(0) + "%"; }
}

function getPositionOnShape(percentage, radius)
{
    angleSeparation = Math.PI * 2 / settings.numberOfSides;                

    let angles = [];
    for (let i = 0; i < settings.numberOfSides; i++) 
    {
        angles.push(degreesToRadians(settings.startAngle) - Math.PI / 2 + angleSeparation * i);
    }
        
    let cornerPoints = [];
    for (let i = 0; i < settings.numberOfSides; i++) 
    {
        cornerPoints.push({ x: midScreen.x + radius * Math.cos(angles[i]), y: midScreen.y + radius * Math.sin(angles[i]) });
    }

    let sideLengthPercentage = 1 / settings.numberOfSides * 100;
    let side = Math.floor(percentage / sideLengthPercentage);
    let portion = (percentage % sideLengthPercentage) / sideLengthPercentage;
    let point1 = cornerPoints[side % settings.numberOfSides];
    let point2 = cornerPoints[(side + 1) % settings.numberOfSides];

    return {
        x: point1.x + (point2.x - point1.x) * portion,
        y: point1.y + (point2.y - point1.y) * portion,
        side: side + 1
    };
}

function drawLineOnShape(percentage, adjustedPercentage, radius)
{
    let sideLengthPercentage = 100 / settings.numberOfSides;

    let start = getPositionOnShape(adjustedPercentage, radius);
    let end = getPositionOnShape((adjustedPercentage + percentage) % 100, radius);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y); // begin at start
    if (end.side === start.side && percentage < sideLengthPercentage) // if on the same side
    {
        ctx.lineTo(end.x, end.y); // basic line drawing
    } else {
        let endPoint = getPositionOnShape(start.side * sideLengthPercentage, radius); // end of the side
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke(); // draw to end of first side

        let percentageDistance = sideLengthPercentage * (start.side) - adjustedPercentage; // distance from start to end of first side
        let remainingPercentage = percentage - percentageDistance; // remaining percentage to draw
        let loops = 0;
        while (remainingPercentage >= sideLengthPercentage) 
        {
            loops++;
            let nextStartPoint = endPoint;
            endPoint = getPositionOnShape(((start.side + loops) % settings.numberOfSides) * sideLengthPercentage, radius); // end of the side
            drawLine(nextStartPoint, endPoint);
            remainingPercentage -= sideLengthPercentage;
        }
        ctx.beginPath();
        ctx.moveTo(endPoint.x, endPoint.y);
        ctx.lineTo(end.x, end.y);
    }
    ctx.stroke();
}

function drawLine(start, end)
{
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function euclideanDistance(x1, y1, x2, y2)
{
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
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
    var settings = defaultSettings;

    document.getElementById("line-width").value = settings.lineWidth;
    document.getElementById("line-blur").value = settings.lineBlur;
    document.getElementById("increment").value = settings.increment;
    document.getElementById("inner-circle-radius").value = settings.innerRadius;
    document.getElementById("number-of-lines").value = settings.numberOfLines;
    document.getElementById("line-separation").value = settings.lineSeparation;
    document.getElementById("spin-rate").value = settings.spinRate;
    document.getElementById("spin-direction").value = settings.spinDirection;
    document.getElementById("start-angle").value = settings.startAngle;

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
document.getElementById("reset").onclick = () => { resetVariables() };

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

function degreesToRadians(degrees) { return degrees * Math.PI / 180; }