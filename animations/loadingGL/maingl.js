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
var tempGL = canvasEl.getContext('webgl');
if (!tempGL) { tempGL = canvasEl.getContext('experimental-webgl'); }
if (!tempGL) { alert('WebGL is not available on your browser'); }
const gl = tempGL;
gl.disable(gl.DEPTH_TEST)
gl.disable(gl.CULL_FACE)
gl.enable(gl.BLEND)

const percentageEl = document.getElementById('percentage');
const epsilon = 0.0001;

const TAU = Math.PI * 2;
const ETA = Math.PI / 2;

const fourByFourIdentity = createIdentity(4);

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

function createShader(type, source) 
{
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(vertexShader, fragmentShader) 
{
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

let vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_normal;
    attribute float a_miter; 

    uniform mat4 u_projection;
    uniform mat4 u_model;
    uniform mat4 u_view;
    uniform float u_thickness;
    
    varying float edge;

    void main() {
        edge = sign(a_miter);
        vec2 pointPos = a_position.xy + vec2(a_normal * u_thickness/2.0 * a_miter);
        gl_Position = u_projection * u_view * u_model * vec4(pointPos, 0.0, 1.0);
        gl_PointSize = 1.0;
    }
`;
let vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);

let fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;

    varying float edge;
        
    void main() {
      float v = 1.0 - abs(edge);
      v = smoothstep(0.65, 0.7, v*0.0); 
      gl_FragColor = mix(u_color, vec4(0.0), v);
    }
`;
let fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

let program = createProgram(vertexShader, fragmentShader);
gl.useProgram(program);

let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

let a_positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_positionLocation);
gl.vertexAttribPointer(a_positionLocation, 2, gl.FLOAT, false, 0, 0);

let u_projectionLocation = gl.getUniformLocation(program, "u_projection");
let projectionMatrix = [
    2.0 / gl.canvas.width, 0, 0, 0,
    0, -2.0 / gl.canvas.height, 0, 0,
    0, 0, 1, 1,
    -1, 1, 0, 0,
];
//gl.uniformMatrix4fv(u_projectionLocation, false, projectionMatrix);
  
gl.uniformMatrix4fv(u_projectionLocation, false, new Float32Array([2/innerWidth, 0, 0, 0, 0, 2/innerHeight, 0, 0, 0, 0, 1, 0, -1, -1, 0, 1]));
// gl.uniformMatrix4fv(u_projectionLocation, false, createIdentity(4));

let u_modelLocation = gl.getUniformLocation(program, "u_model");
gl.uniformMatrix4fv(u_modelLocation, false, createIdentity(4));

let u_viewLocation = gl.getUniformLocation(program, "u_view");
gl.uniformMatrix4fv(u_viewLocation, false, createIdentity(4));

var midScreen = {x: innerWidth/2, y: innerHeight/2};
function resize()
{
    canvasEl.width = innerWidth;
    canvasEl.height = innerHeight;
    midScreen = {x: innerWidth/2, y: innerHeight/2};
    gl.viewport(0, 0, innerWidth, innerHeight);
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), innerWidth, innerHeight);
}
resize();
addEventListener("resize", (event) => { resize(); });

function calculatePackedNormalsAndMiters(positions) 
{
    let count = positions.length / 2; // number of vertices
    let normals = new Float32Array(count * 2);
    let miters = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        let prev = (i - 1 + count) % count; // previous vertex index
        let next = (i + 1) % count; // next vertex index

        // Calculate the vectors representing the previous and next edges
        let prevEdge = [
            positions[2 * i] - positions[2 * prev],
            positions[2 * i + 1] - positions[2 * prev + 1]
        ];
        let nextEdge = [
            positions[2 * next] - positions[2 * i],
            positions[2 * next + 1] - positions[2 * i + 1]
        ];

        // Normalize the edge vectors
        let prevEdgeLength = Math.sqrt(prevEdge[0] * prevEdge[0] + prevEdge[1] * prevEdge[1]);
        let nextEdgeLength = Math.sqrt(nextEdge[0] * nextEdge[0] + nextEdge[1] * nextEdge[1]);
        prevEdge = [prevEdge[0] / prevEdgeLength, prevEdge[1] / prevEdgeLength];
        nextEdge = [nextEdge[0] / nextEdgeLength, nextEdge[1] / nextEdgeLength];

        // Compute the normals by rotating the edge vectors 90 degrees counter-clockwise
        let prevNormal = [-prevEdge[1], prevEdge[0]];
        let nextNormal = [-nextEdge[1], nextEdge[0]];

        // Add the normals to compute the miter vector
        let miter = [prevNormal[0] + nextNormal[0], prevNormal[1] + nextNormal[1]];

        // The miter length is inversely proportional to the cosine of half the angle between the normals
        // It's multiplied by the sign of the cross product to get the direction (left/right)
        let miterLength = Math.sign(prevNormal[0] * nextNormal[1] - prevNormal[1] * nextNormal[0]) / 
            Math.sqrt(miter[0] * miter[0] + miter[1] * miter[1]) + epsilon;

        normals[2 * i] = miter[0];
        normals[2 * i + 1] = miter[1];
        miters[i] = miterLength;
    }

    return { normals, miters };
}

let lineA = [0, 0];
let lineB = [0, 0];
let tangent = [0, 0];
let miter = [0, 0];
let count = 0;
function calculateNormalsAndMiters(points, closed) 
{
    function addNext(out, normal, length) 
    {
        out.push([[normal[0], normal[1]], length])
        return out
    }
    var curNormal = null
    var out = []
    if (closed) 
    {
        points = points.slice()
        points.push(points[0])
    }

    var total = points.length
    for (var i=1; i < total; i++) 
    {
        var last = points[i-1]
        var cur = points[i]
        var next = i < points.length-1 ? points[i+1] : null

        lineA = direction(lineA, cur, last)
        if (!curNormal)  
        {
            curNormal = [0, 0]
            curNormal = normal(curNormal, lineA)
        }

        if (i === 1) //add initial normals
        out = addNext(out, curNormal, 1)

        if (!next) { //no miter, simple segment
            curNormal = normal(curNormal, lineA) //reset normal
            out = addNext(out, curNormal, 1)
        } else { //miter with last
            //get unit dir of next line
            lineB = direction(lineB, next, cur)

            //stores tangent & miter
            var miterLen = computeMiter(tangent, miter, lineA, lineB, 1)
            out = addNext(out, miter, miterLen)
        }
    }

    //if the polyline is a closed loop, clean up the last normal
    if (points.length > 2 && closed) 
    {
        var last2 = points[total-2]
        var cur2 = points[0]
        var next2 = points[1]

        direction(lineA, cur2, last2)
        direction(lineB, next2, cur2)
        normal(curNormal, lineA)
        
        var miterLen2 = computeMiter(tangent, miter, lineA, lineB, 1)
        out[0][0] = miter.slice()
        out[total-1][0] = miter.slice()
        out[0][1] = miterLen2
        out[total-1][1] = miterLen2
        out.pop()
    }

    return out
}

function drawArc(centerX, centerY, radius, startAngle, endAngle, numSegments) 
{
    let angleStep = (endAngle - startAngle) / numSegments;
    let packedPositions = new Float32Array(2 * (numSegments + 1));    
    let positions = [];
    // Generate vertex positions for the arc
    for (let i = 0; i <= numSegments; i++) {
        let angle = startAngle + i * angleStep;
        positions.push([
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        ]);
    }

    // Generate vertex positions for the arc
    // for (let i = 0; i <= numSegments; i++) {
    //     let angle = startAngle + i * angleStep;
    //     packedPositions[2 * i] = centerX + radius * Math.cos(angle);
    //     packedPositions[2 * i + 1] = centerY + radius * Math.sin(angle);
    // }
    path = [ 
        [-1, -1], [1, -1], 
        [1, 1], [-1, 1]
    ]
    let closed = true;
    let tags = calculateNormalsAndMiters(path, closed);
    if (closed) 
    {
        path = path.slice()
        path.push(path[0])
        tags.push(tags[0])
    }

    count = (path.length-1) * 6;
    packedPositions = pack(path)


    //let { normals, miters } = calculatePackedNormalsAndMiters(packedPositions);
    let normals = tags.map(x => x[0]), miters = tags.map(x => x[1])

    normals = pack(normals);
    miters = pack(miters);

    normals = new Float32Array(duplicate(normals))
    miters = new Float32Array(duplicate(miters, true))
    positions = new Float32Array(duplicate(packedPositions));
    let indexUint16 = new Float32Array(createIndices(path.length));

    console.log(positions, normals, miters)

    console.log(gl.getError());

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    const miterBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, miterBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, miters, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexUint16, gl.STATIC_DRAW);

    const a_positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(a_positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(a_positionLocation, 2, gl.FLOAT, false, 0, 0);

    const a_normalLocation = gl.getAttribLocation(program, "a_normal");
    gl.enableVertexAttribArray(a_normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(a_normalLocation, 2, gl.FLOAT, false, 0, 0);

    const a_miterLocation = gl.getAttribLocation(program, "a_miter");
    gl.enableVertexAttribArray(a_miterLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, miterBuffer);
    gl.vertexAttribPointer(a_miterLocation, 1, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);

}

var percentage = 0;
function loading()
{
    percentage += settings.increment;

    if (percentage >= 100) { percentage = 0; }

    let colour = getColourAtPercentage(percentage);
    let colourCSS = colour.css;
    let colourWebGL = colour.webGL;
    document.getElementById("percentage").style.setProperty("--text-colour", colourCSS);

    let direction = settings.spinDirection;

    for (let i = 0; i < 1; i++)
    {
        if (settings.spinDirection === 2) { direction = i % 2 === 0 ? 1 : -1; }
        if (settings.missEveryXLines > 0 && (i+1) % settings.missEveryXLines === 0) continue;

        let radius = settings.innerRadius + i * settings.lineSeparation;
        
        if (settings.numberOfSides == 0)
        {
            let shift = direction * i * (percentage / 100) * settings.spinRate;
            let startPoint = shift * TAU + degreesToRadians(settings.startAngle);
            let endPoint = startPoint + (percentage / 100) * TAU;
    
            if (i === 0 && settings.spinDirection === -1) // don't ask
            {
                let temp = startPoint;
                startPoint = -endPoint + TAU;
                endPoint = temp;
            }

            gl.uniform4f(gl.getUniformLocation(program, "u_color"), colourWebGL[0], colourWebGL[1], colourWebGL[2], colourWebGL[3]);
            gl.uniform1f(gl.getUniformLocation(program, "u_thickness"), 0.2);

            const segmentLength = 1;  
            let numSegments = Math.ceil(8 / segmentLength);
            drawArc(midScreen.x, midScreen.y, radius, startPoint, endPoint, numSegments);
        }
    }
    if (tick % framerate) { percentageEl.textContent = percentage.toFixed(0) + "%"; }
}

function getPositionOnShape(percentage, radius)
{
    angleSeparation = TAU / settings.numberOfSides;                

    let angles = [];
    for (let i = 0; i < settings.numberOfSides; i++) 
    {
        angles.push(degreesToRadians(settings.startAngle) - ETA + angleSeparation * i);
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

let framerate = 60;
let tick = 0;
function animate()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    loading();
    tick++;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);


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

    return { css: colourToCSS(currentColour), webGL: colourToWebGL(currentColour) };
}

function colourToCSS(colour) 
{
    if (colour.a !== undefined) 
    {
        return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;
    }
    return `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
}

function colourToWebGL(colour) 
{
    // Convert colour components from 0-255 range to 0-1 range
    let r = colour.r / 255;
    let g = colour.g / 255;
    let b = colour.b / 255;
    let a = colour.a !== undefined ? colour.a / 255 : 1;

    return [r, g, b, a];
}

function hexToRGB(hexColour)
{
    let r = parseInt(hexColour.substring(1, 3), 16);
    let g = parseInt(hexColour.substring(3, 5), 16);
    let b = parseInt(hexColour.substring(5, 7), 16);
    let a = 1;

    if (hexColour.length > 7)
    {
        a = parseInt(hexColour.substring(7, 9), 16);
    }

    return { r, g, b, a };
}

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


// utility functions
function interpolate(start, end, factor) { return start + (end - start) * factor; }
function degreesToRadians(degrees) { return degrees * Math.PI / 180; }
function euclideanDistance(x1, y1, x2, y2) { return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)); }

function createIdentity(size)
{
    let identity = new Float32Array(size * size);
    for (let i = 0; i < size; i++) { identity[i * size + i] = 1; }
    return identity;
}

function createGLBuffer(data, type, usage)
{
    let buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, usage);
    return buffer;
}

// https://github.com/mattdesl/webgl-lines/blob/master/base/line-utils.js
function duplicate(nestedArray, mirror) 
{
    var out = [];
    nestedArray.forEach(x => 
    {
      let x1 = mirror ? -x : x;
      out.push(x1, x);
    });
    return out;
}
  
function createIndices(length) 
{
    let indices = new Uint16Array(length * 6);
    let c = 0, index = 0;
    for (let j = 0; j < length; j++) 
    {
      let i = index;
      indices[c++] = i + 0;
      indices[c++] = i + 1;
      indices[c++] = i + 2;
      indices[c++] = i + 2;
      indices[c++] = i + 1;
      indices[c++] = i + 3;
      index += 2;
    }
    return indices;
}

// Vector2 functions - https://glmatrix.net/docs/vec2.js.html
function add(out, a, b) { out[0] = a[0] + b[0]; out[1] = a[1] + b[1]; return out }
function subtract(out, a, b) { 
    out[0] = a[0] - b[0]; 
    out[1] = a[1] - b[1]; 
    return out;
}
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] }
function set(out, x, y) { out[0] = x; out[1] = y; return out }

function normalise(out, a)
{
    var x = a[0],
        y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    return out;

}
function computeMiter(tangent, miter, lineA, lineB, halfThick) 
{
    var tmp = [0, 0];
    //get tangent line
    tangent = add(tangent, lineA, lineB)
    tangent = normalise(tangent, tangent)

    //get miter as a unit vector
    miter = set(miter, -tangent[1], tangent[0])
    tmp = set(tmp, -lineA[1], lineA[0])

    //get the necessary length of our miter
    return halfThick / dot(miter, tmp)
}

function normal(out, dir) 
{
    out[0] = -dir[1];
    out[1] = dir[0];
    return out
}

function direction(out, a, b) 
{
    out = subtract(out, a, b)
    out = normalise(out, out)
    return out
}

// https://github.com/hughsk/array-pack-2d/blob/master/index.js
function pack(arr, type) {
    if (!arr[0] || !arr[0].length) {
        return arr;
    }

    let Arr;
    switch (type) {
        case 'float32':
            Arr = Float32Array;
            break;
        case 'float64':
            Arr = Float64Array;
            break;
        case 'int8':
            Arr = Int8Array;
            break;
        case 'int16':
            Arr = Int16Array;
            break;
        case 'int32':
            Arr = Int32Array;
            break;
        case 'uint8':
            Arr = Uint8Array;
            break;
        case 'uint16':
            Arr = Uint16Array;
            break;
        case 'uint32':
            Arr = Uint32Array;
            break;
        default:
            Arr = Array;
    }

    let dim = arr[0].length;
    let out = new Arr(arr.length * dim);
    let k = 0;

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < dim; j++) {
            out[k++] = arr[i][j];
        }
    }

    return out;
}

// https://github.com/stackgl/gl-mat4/blob/master/perspective.js
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};