$(document).ready( function() {$(this).scrollTop(0);}); // on load, scroll to top
window.onbeforeunload = function() {$(this).scrollTop(0);} // refresh

const body = document.getElementsByTagName("body")[0];
body.classList.add("loaded");


// Home page animations:
const title = document.getElementById("title");
const home = document.getElementById("home");
const tiles = document.getElementById("tiles");
const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

gsap.to(title,
{
        transform: "translate(0, 0)",
        opacity: 1,
        duration: 1,
})

// grid on home: - derived from https://www.youtube.com/@Hyperplexed - https://codepen.io/Hyperplexed/pen/zYWvXMM
const tileSize = 50;
const createTile = index => 
{
    const tile = document.createElement("div");
  
    tile.classList.add("tile");
            
    return tile;
}

const createTiles = quantity => 
{
    tiles.innerHTML = "";
    Array.from(Array(quantity)).map((tile, index) => 
    {
        tiles.appendChild(createTile(index));
    });
}

const createGrid = () => 
{    
    const homeHeightProperty = window.getComputedStyle(document.getElementById("home")).getPropertyValue("height");
    const homeHeight = parseFloat(homeHeightProperty.substring(0, homeHeightProperty.length - 2));
    let columns = Math.floor(document.body.clientWidth *1.1 / tileSize),
        rows = Math.floor(innerHeight * 1.1 / tileSize);
    
    tiles.style.height = `${homeHeight * 1.1}px`;
    tiles.style.setProperty("--columns", columns);
    tiles.style.setProperty("--rows", rows);
    
    createTiles(columns * rows);
}
createGrid();

window.onresize = createGrid;
document.addEventListener("resize", createGrid);
document.addEventListener("webkitfullscreenchange", createGrid);
document.addEventListener("mozfullscreenchange", createGrid);
document.addEventListener("msfullscreenchange", createGrid);
document.addEventListener("fullscreenchange", createGrid);

// card animations:
document.getElementById("cards").onmousemove = e => 
{
    for(const card of document.getElementsByClassName("card")) 
    {
      const rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;
  
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    };
}

// card clicking:
const linkedIn = document.getElementById("linkedin");
const mail = document.getElementById("mail");
const github = document.getElementById("github");

document.onclick = function (e) {
    e = e ||  window.event;
    var element = e.target || e.srcElement;
  
    if (element.tagName == 'A') {
      return false; // prevent default action and stop event propagation
    }
};

linkedIn.onclick = () => {window.open("https://www.linkedin.com/in/sean-strain-2b4279147/", "_blank");};
mail.onclick = () => {window.open("mailto:seanstrainwork@gmail.com", "_blank");};
github.onclick = () => {window.open("https://github.com/SeanStrain", "_blank");};

// tile animations:
var hoveredTiles = [];
var toSplice = [];
var justPushed = [];

var x = 0;
var y = 0;

document.addEventListener('mousemove', onMouseMove, false)
function onMouseMove(e)
{
    x = e.clientX;
    y = e.clientY;
}

function getMouseX() { return x; }

function getMouseY() { return y; }

let mayHover = true;
function hover()
{
    return;
    setInterval(() =>
    {
        if (!mayHover) { return; }
        const elements = document.elementsFromPoint(getMouseX(), getMouseY());
        const cards = document.getElementById("cards");
        if (elements.includes(cards))
        {
            return;
        }
        var justPushed = [];
        elements.forEach(tile =>
        {
            if (tile.classList.contains("tile"))
            {
                hoveredTiles.push(tile);
                justPushed.push(tile);
                tile.classList.add("tile-hover");
            }
        });
        hoveredTiles.forEach((tile, index) =>
        {
            if (true)
            {
                setTimeout(() =>
                {
                    tile.classList.remove("tile-hover");
                    toSplice.push(index);
                }, 99);
            }
        });
        toSplice.forEach(index =>
        {
            hoveredTiles.splice(index, 1);
        });
        setTimeout(() =>
        {
            toSplice = [];
            justPushed = [];
        }, 100);
    }, 0.1);
}
setTimeout(() => {hover()}, 10);

// initialise the lines
const lines = [...document.getElementsByClassName("title-border-line")];
const corners = [...document.getElementsByClassName("title-border-corner")];
function animateLines()
{
    if (isReduced) // if user prefers reduced motion, don't animate
    {
        corners.forEach((corner, index) =>
        {
            corner.style.opacity = 1;
            switch(index)
            {
                case 0:
                case 2:
                case 4:
                case 6:
                    corner.style.height = "30px";
                    break;
                case 1:
                case 3:
                case 5:
                case 7:
                    corner.style.width = "30px";
                    break;
            }
        });
    } else {
        lines.forEach((line, index) =>
        {
            switch(index)
            {
                case 0:
                    line.style.top = "0";
                    break;
                case 1:
                    line.style.top = "0";
                    line.style.left = "-45px";
                    break;
                case 2:
                    line.style.bottom = "0";
                    line.style.right = "0";
                    break;
                case 3:
                    line.style.bottom = "0";
                    line.style.right = "0";
                    break;
            }
        });

        // animate the lines
        setTimeout(() =>
        {
            lines.forEach((line, index) => 
            {

                const heightProperty = window.getComputedStyle(document.getElementById('title-wrapper')).getPropertyValue("height");
                const height = parseFloat(heightProperty.substring(0, heightProperty.length - 2));
                const widthProperty = window.getComputedStyle(document.getElementById('title-wrapper')).getPropertyValue("width");
                const width = parseFloat(widthProperty.substring(0, widthProperty.length - 2))+45;

                let duration = 0.85;
                let ease1 = "power2.out";
                let ease2 = "power2.inout";
                let duration2 = 0.85;
                let delay1 = 100;
                let delay2 = 150;
                switch(index)
                {
                    case 0:
                        gsap.to(line,
                        {
                            height: `${height}px`,
                            ease: ease1,
                            duration: duration,
                        });
                        break;
                    case 1:
                        gsap.to(line,
                        {
                            width: `${width}px`,
                            ease: ease1,
                            duration: duration,
                        });
                        break;
                    case 2:
                        setTimeout(() =>
                        {
                            gsap.to(line,
                            {
                                height: `${height}px`,
                                ease: ease1,
                                duration: duration,
                            });
                        }, delay1);
                        break;
                    case 3:
                        setTimeout(() =>
                        {
                            gsap.to(line,
                            {
                                width: `${width}px`,
                                ease: ease1,
                                duration: duration,
                            });
                        }, delay1);
                        break;
                }
                setTimeout(() =>
                {
                    corners.forEach((corner, index) =>
                    {
                        corner.style.opacity = 1;
                        switch(index)
                        {
                            case 0:
                                gsap.to(corner,
                                    {
                                        height: "30px",
                                        duration: 0.5,
                                    });
                                break;
                            case 1:
                                gsap.to(corner,
                                    {
                                        width: "30px",
                                        duration: 0.5,
                                    });
                                break;
                            case 6:
                                setTimeout(() =>
                                {
                                    gsap.to(corner,
                                        {
                                            height: "30px",
                                            duration: 0.5,
                                        });
                                }, delay2);
                                break;
                            case 7:
                                setTimeout(() =>
                                {
                                    gsap.to(corner,
                                        {
                                            width: "30px",
                                            duration: 0.5,
                                        });
                                }, delay2);
                                break;
                        }
                    });
                    switch(index)
                    {
                        case 0:
                            line.style.removeProperty("top");
                            line.style.bottom = "0";
                            gsap.to(line,
                                {
                                    height: 0,
                                    ease: ease2,
                                    duration: duration2,
                                });
                            break;
                        case 1:
                            line.style.removeProperty("left");
                            line.style.right = "0";
                            gsap.to(line,
                                {
                                    width: 0,
                                    ease: ease2,
                                    duration: duration2,
                                });
                            break;
                        case 2:
                            setTimeout(() =>
                            {
                                line.style.removeProperty("bottom");
                                line.style.top = "0";
                                gsap.to(line,
                                    {
                                        height: 0,
                                        ease: ease2,
                                        duration: duration2,
                                    });
                            }, delay2);
                            break;
                        case 3:
                            setTimeout(() =>
                            {
                            line.style.removeProperty("right");
                            line.style.left = "0";
                            gsap.to(line,
                                {
                                    width: 0,
                                    ease: ease2,
                                    duration: duration2,
                                });
                            }, delay2);
                            break;
                    }

                }, duration * 1000 - 100);

            });
        }, 250);
    }
}
animateLines();

// type the subtitle
// loop through the strings: write, delete, next
const subTitle = document.getElementById("subtitle");
const subTitleSpan = document.getElementById("subtitle-string");
const subTitleStrings = ["Web Developer", "Software Engineer", "Teacher", "Tutor",
                         "Researcher",];
let subTitleIndex = 0;
let currentStringIndex = 0;
let isDeleting = false;

function typeSubtitle() 
{
    let currentString = subTitleStrings[subTitleIndex];
    let timeout;
  
    if (isDeleting) 
    {
      subTitleSpan.textContent = currentString.slice(0, currentStringIndex - 1);
      currentStringIndex--;
      timeout = 50; 
    } else {
      subTitleSpan.textContent = currentString.slice(0, currentStringIndex + 1);
      currentStringIndex++;
      timeout = 80; 
    }
  
    if (currentStringIndex === currentString.length && !isDeleting) 
    {
      timeout = 1000;
      isDeleting = true;
    } else if (currentStringIndex === 0 && isDeleting) {
        timeout = 1000;
      subTitleIndex = (subTitleIndex + 1) % subTitleStrings.length;
      isDeleting = false;
    }
  
    setTimeout(typeSubtitle, timeout);
}
setTimeout(() => {typeSubtitle()}, 1250);

// scroll bar:
const bar = document.getElementById("bar");
const scrollableHeight = document.body.scrollHeight - window.innerHeight;
let scale = 0;

document.addEventListener("wheel", function (e) {

  scale += e.deltaY / 2.5;
  scale = Math.max(0, Math.min(scale, scrollableHeight));

  updateScrollBar(scale);

  window.scrollTo(0, scale);
});

function updateScrollBar(inputScale)
{
    scale = inputScale;
    const scrollPercentage = (scale / scrollableHeight) * 100;

    const maxTop = 100 - (bar.clientHeight / document.getElementById("scroll").clientHeight) * 100;
  
    bar.style.top = `${Math.min(scrollPercentage, maxTop)}%`;
}

const homeButton = document.getElementById("home-button");
const aboutButton = document.getElementById("about-button");
const workButton = document.getElementById("work-button");

homeButton.addEventListener("click", () =>
{
    smoothScrollTo(0);
    updateScrollBar(0);

    aboutButton.classList.remove("nav-on");
    homeButton.classList.add("nav-on");
    workButton.classList.remove("nav-on");
});
aboutButton.addEventListener("click", () =>
{
    smoothScrollTo(document.getElementById("about").offsetTop);
    updateScrollBar(document.getElementById("about").offsetTop);
    
    aboutButton.classList.add("nav-on");
    homeButton.classList.remove("nav-on");
    workButton.classList.remove("nav-on");
});
workButton.addEventListener("click", () =>
{
    smoothScrollTo(document.getElementById("work").offsetTop);
    updateScrollBar(document.getElementById("work").offsetTop);

    aboutButton.classList.remove("nav-on");
    homeButton.classList.remove("nav-on");
    workButton.classList.add("nav-on");
});


// scroll animations:
const about = document.getElementById("about");
const observer = new IntersectionObserver((observation) => 
{
    observation.forEach((element) =>
    {
        if (element.isIntersecting)
        {
            switch(element.target.id)
            {
                case "about-scroll-flag":
                    mayHover = false;
                    tiles.classList.add("tiles-scrolled-past");
                    about.classList.add("about-scrolled-to");
            }
        } else {
            switch(element.target.id)
            {
                case "about-scroll-flag":
                    mayHover = true;
                    tiles.classList.remove("tiles-scrolled-past");
                    about.classList.remove("about-scrolled-to");
            }
        }
        
    });
});
const aboutScrollFlag = document.getElementById("about-scroll-flag");
observer.observe(aboutScrollFlag);


// utility functions
function smoothScrollTo(y) {
    window.scrollTo({
        top: y,
        left: 0,
        behavior: 'smooth'
    });
}