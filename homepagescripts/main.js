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

let ready = false;
function init()
{
    $(this).scrollTop(0);

    let interval = setInterval(() =>
    {
        if (ready)
        {
            clearInterval(interval);
            body.classList.add("loaded");
            cards.classList.add("loaded");
            about.classList.add("loaded");
            work.classList.add("loaded");
            header.classList.add("loaded");
            setTimeout(() => 
            {
                gsap.to(title,
                {
                        transform: "translate(0, 0)",
                        opacity: 1,
                        duration: 1.5,
                })
            }, 400);

            animateLines();
            setTimeout(() => {typeSubtitle()}, 2500);
        }
    }, 1);

}

$(document).ready( function() { init(); });
window.onbeforeunload = function() { init(); } // refresh

// Home page animations:
const title = document.getElementById("title");
const home = document.getElementById("home");
const tiles = document.getElementById("tiles");
const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

const body = document.getElementsByTagName("body")[0];
const header = document.getElementById("header");

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
    ready = true;
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
      return false; // prevent default action
    }
};

linkedIn.onclick = () => { window.open("https://www.linkedin.com/in/sean-strain-2b4279147/", "_blank"); };
mail.onclick = () => { window.open("mailto:seanstrainwork@gmail.com", "_blank"); };
github.onclick = () => { window.open("https://github.com/SeanStrain", "_blank"); };

// tile animations - disabled for performance reasons:
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
    } else { // otherwise, animate
        lines.forEach((line, index) =>
        {
            switch(index)
            {
                case 0:
                    line.style.top = "0";
                    break;
                case 1:
                    line.style.top = "0";
                    line.style.left = "0px";
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
                const width = parseFloat(widthProperty.substring(0, widthProperty.length - 2));

                let duration = 0.85;
                let ease1 = "power2.out";
                let ease2 = "power2.inout";
                let duration2 = 1;
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

// Morph-text - Derived from https://codepen.io/alvarotrigo/pen/eYEqPZa
const elts = {
    text1: document.getElementById("morph-text1"),
    text2: document.getElementById("morph-text2")
};

const texts = [
    "Passionate",
    "About",
    "Programming",
    "Passionate",
    "About",
    "Design",
    "Passionate",
    "About",
    "Teaching",
];

const morphTime = 1.5;
const cooldownTime = 0.9;

let textIndex = texts.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

function doMorph() 
{
    morph -= cooldown;
    cooldown = 0;

    let fraction = morph / morphTime;

    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }

    setMorph(fraction);
}

function setMorph(fraction) 
{
    elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    elts.text1.textContent = texts[textIndex % texts.length];
    elts.text2.textContent = texts[(textIndex + 1) % texts.length];
}

function doCooldown() 
{
    morph = 0;

    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";

    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

let firstRun = true;
function morphAnimate() 
{
    if ($.browser.mozilla) return;
    let newTime = new Date();
    let shouldIncrementIndex = cooldown > 0;
    let dt = (newTime - time) / 1000;
    time = newTime;

    if (firstRun) 
    {
        newTime = new Date();
        shouldIncrementIndex = cooldown > 0;
        dt = (newTime - time) / 1000;

        elts.text1.textContent = texts[textIndex % texts.length];
        elts.text2.textContent = texts[(textIndex + 1) % texts.length];
        firstRun = false;
    }

    requestAnimationFrame(morphAnimate);
    cooldown -= dt;

    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            textIndex++;
        }

        doMorph();
    } else {
        doCooldown();
    }
}


// scroll bar:
const bar = document.getElementById("bar");
const scrollableHeight = document.body.scrollHeight - window.innerHeight;
let scale = 0;
let state = 0;
const scrollToState1 = function() { 
    updateScrollBar(innerHeight + 25);
    smoothScrollTo(innerHeight + 25); 
}
document.addEventListener("wheel", function (e) 
{
    if (isMobile()) return;
    if (window.innerWidth < 1200) return;

    // if (e.deltaY < 0) { state = Math.max(state - 1, 0); } else { state = Math.min(state + 1, 1); }

    // switch (state)
    // {
    //     case 0:
    //         updateScrollBar(0);
    //         smoothScrollTo(0);
    //         aboutButton.classList.remove("nav-on");
    //         homeButton.classList.add("nav-on");
    //         workButton.classList.remove("nav-on");
    //         break;
    //     case 1:
    //         scrollToState1()
    //         aboutButton.classList.add("nav-on");
    //         homeButton.classList.remove("nav-on");
    //         workButton.classList.remove("nav-on");
    //         break;
    // }

    scale += e.deltaY / 1.2;
    scale = Math.max(0, Math.min(scale, scrollableHeight));

    updateScrollBar(scale);
    smoothScrollTo(scale);
    return false;
});

function updateScrollBar(inputScale)
{
    scale = inputScale;

    const scrollPercentage = (scale / scrollableHeight) * 100;
    const maxTop = 100 - (bar.clientHeight / document.getElementById("scroll").clientHeight) * 100;
  
    bar.style.top = `${Math.min(scrollPercentage, maxTop)}%`;
}

// scroll animations:
const about = document.getElementById("about");
const aboutTitle = document.getElementById("about-title");
const work = document.getElementById("work");
const workTitle = document.getElementById("work-title");
const cover = document.getElementById("cover");
const observer = new IntersectionObserver((observation) => 
{
    observation.forEach((element) =>
    {
        if (element.isIntersecting)
        {
            switch(element.target.id)
            {
                case "home-page-scroll-flag":
                    aboutButton.classList.remove("nav-on");
                    homeButton.classList.add("nav-on");
                    workButton.classList.remove("nav-on");
                    break;
                case "about":
                    mayHover = false;
                    tiles.classList.add("tiles-scrolled-past");
                    if (!$.browser.mozilla) about.classList.add("about-scrolled-to");
                    cover.classList.add("scrolled-to");
                    // morphAnimate();
                    gsap.to(aboutTitle,
                    {
                        opacity: 1,
                        duration: 1,
                    });
                    aboutButton.classList.add("nav-on");
                    homeButton.classList.remove("nav-on");
                    workButton.classList.remove("nav-on");
                    break;
                case "work-page":
                    gsap.to(workTitle,
                        {
                            opacity: 1,
                            duration: 1,
                        });
                    aboutButton.classList.remove("nav-on");
                    homeButton.classList.remove("nav-on");
                    if (!$.browser.mozilla) work.classList.add("work-scrolled-to");
                    workButton.classList.add("nav-on");
                    break;
            }
        } else {
            switch(element.target.id)
            {
                case "home-page":
                    break;
                case "about":
                    mayHover = true;
                    tiles.classList.remove("tiles-scrolled-past");
                    about.classList.remove("about-scrolled-to");
                    cover.classList.remove("scrolled-to");
                    break;
                case "work-page":
                    work.classList.remove("work-scrolled-to");
                    break;
            }
        }
        
    });
});
const scrollAnimated = [...document.getElementsByClassName("scroll-animated")];
scrollAnimated.forEach((element) =>
{
    observer.observe(element);
});

// nav bar:
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
    scrollToState1()

    
    aboutButton.classList.add("nav-on");
    homeButton.classList.remove("nav-on");
    workButton.classList.remove("nav-on");
});
workButton.addEventListener("click", () =>
{
    smoothScrollTo(document.getElementById("work-page").offsetTop);
    updateScrollBar(document.getElementById("work-page").offsetTop);

    aboutButton.classList.remove("nav-on");
    homeButton.classList.remove("nav-on");
    workButton.classList.add("nav-on");
});

const uoeCard = document.getElementById("uoe-card");
const tulipsCard = document.getElementById("tulips-card");
const cadenceCard = document.getElementById("cadence-card");
const codeCadetsCard = document.getElementById("code-cadets-card");

const strangeCard = document.getElementById("strange-card");
const circleShooterCard = document.getElementById("circle-shooter-card");
const presentationsCard = document.getElementById("presentations-card");
const displaceCard = document.getElementById("displace-card");
const animationsCard = document.getElementById("animations-card");

uoeCard.onclick = () => { window.open("https://project-archive.inf.ed.ac.uk/ug4/20223215/ug4_proj.pdf", "_blank"); };
tulipsCard.onclick = () => { window.open("https://groups.inf.ed.ac.uk/tulips/people.html", "_blank"); };
cadenceCard.onclick = () => { window.open("https://www.cadence.com/en_US/home.html", "_blank"); };
codeCadetsCard.onclick = () => { window.open("https://www.codecadets.co.uk/", "_blank"); };

strangeCard.onclick = () => { window.open("https://seanstrain.github.io/attractors/attractors", "_blank"); };
circleShooterCard.onclick = () => { window.open("https://seanstrain.github.io/games/circleshooter/circleshooter", "_blank"); };
presentationsCard.onclick = () => { window.open("https://seanstrain.github.io/presentations/WhyICode/", "_blank"); };
displaceCard.onclick = () => { window.open("https://github.com/SeanStrain/DisplacementSphere", "_blank"); };
animationsCard.onclick = () => { window.open("https://seanstrain.github.io/animations/loading", "_blank"); };

const seeMyWorkButton = document.getElementById("see-work-button");

seeMyWorkButton.onclick = () => 
{ 
    updateScrollBar(document.getElementById("work-page").offsetTop);
    smoothScrollTo(document.getElementById("work-page").offsetTop); 
};

// utility functions
let currentScroll = scale;
let targetScroll = y;
const ease = 0.05; // this is the speed of the scroll

function animateScroll() 
{
    currentScroll += (targetScroll - currentScroll) * ease;

    if (Math.abs(currentScroll - targetScroll) < 0.1) 
    {
        currentScroll = targetScroll;
        window.scroll(0, currentScroll, 'smooth');
        return;
    }
    
    window.scroll(0, currentScroll, 'smooth');
    requestAnimationFrame(animateScroll);
}

function smoothScrollTo(y) 
{
    targetScroll = y;
    animateScroll();
}

function isMobile()
{
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

if ($.browser.mozilla)
{
    elts.text1.style.backgroundImage = "none";
    elts.text2.style.backgroundImage = "none";
}