document.addEventListener("DOMContentLoaded", function() 
{
    setTimeout(() => 
    {
        window.scrollTo(0, 0);
    }, 100);
});

document.addEventListener("click", function() 
{
    state += 1;
    changeState(state);
});

document.addEventListener("keydown", function(event) 
{
    if (event.key === " ")
    {
        state += 1;
        changeState(state);
    }
});

window.onresize = resize;
document.addEventListener("resize", resize);
document.addEventListener("webkitfullscreenchange", resize);
document.addEventListener("mozfullscreenchange", resize);
document.addEventListener("msfullscreenchange", resize);
document.addEventListener("fullscreenchange", resize);

function resize()
{
    window.scrollTo(0, innerHeight * resizeScrollPosition);
}

var state = 0;
var resizeScrollPosition = 0;
function changeState(newState)
{
    state = newState;
    var page;

    const children = [document.getElementById("page-2-1"), document.getElementById("page-2-2"),
                      document.getElementById("page-2-3"), document.getElementById("page-2-4"),
                      document.getElementById("page-2-5")];

    switch(state)
    {

        // page-1:
        case 0:
            window.scrollTo(0, 0);
        case 1:
            window.scrollTo(0, 0);
            page = document.getElementById("page-1-title");
            const toType = "Why Code?";
            type(page, toType, true);

            const subtitleElement = document.getElementById("page-1-subtitle");
            const subtitle = "Sean Strain - Code Cadets";

            setTimeout(() =>
            {
                type (subtitleElement, subtitle, true);
            }, 1000)

            const boxes = document.getElementsByClassName("box-wrapper");

            for (let i = 0; i < boxes.length; i++)
            {
                let box = boxes[i];
                gsap.to(box,
                    {
                        opacity: 1,
                        ease: "power2.in",
                        duration: 2,
                    });
            }

            break;
        // page-2:
        case 2:
            smoothScrollTo(innerHeight);
            resizeScrollPosition = 1;
            page = document.getElementById("page-2-title");
            setTimeout(() => 
            {
                type(page, "Who am I to talk?", true);
            }, 1000);
            break;
        case 3:
            let talk = "Who am I to talk?";
            type(document.getElementById("page-2-title"), talk, false);
            setTimeout(() => {
                children.forEach((child) => {
                    child.style.display = "flex";
                });
                state++;
                changeState(state);
            }, talk.length * 80);
            break;
        case 4:
        case 5:
        case 6:
        case 7:
            setTimeout(() => 
            {
                state++;
                changeState(state);
            }, 800);
        case 8:
            const animationMap = {
                4: { elementId: "page-2-1", leftValue: 0 },
                5: { elementId: "page-2-2", leftValue: "calc(20vw - 15px)" },
                6: { elementId: "page-2-3", leftValue: 0 },
                7: { elementId: "page-2-4", leftValue: "calc(20vw - 15px)" },
                8: { elementId: "page-2-5", leftValue: 0 },
            }

            var elem = document.getElementById(animationMap[state].elementId);
            gsap.to(elem,
            {
                left: animationMap[state].leftValue,
                duration: 2.5,
                ease: "expo.inOut",
            })
            break;
        // page-3:
        case 9:
            children.forEach((child, index) => 
            {
                var leftValue = index % 2 === 0 ? "-85vw" : "185vw";
                gsap.to(child,
                    {
                        left: leftValue,
                        duration: 1,
                        ease: "power2.out",
                    })
            });
            resizeScrollPosition = 2;
            setTimeout(() => 
            {
                smoothScrollTo(innerHeight * 2);
                setTimeout(() => 
                {
                    page = document.getElementById("page-3-title");
                    type(page, "What do you want to be?", true);
                }, 1000);
            }, 600);

            var numRows = 7;
            var numColumns = 3;
            var cellWidth = 80 / numColumns;
            var cellHeight = 80 / numRows;

            const professions = ["Software Engineer", "Web Developer", "Game Developer", "Architect", "Doctor",
                                "Lawyer", "Teacher", "Scientist", "Engineer", "Artist", "Musician",
                                "Athlete", "Actor", "Politician", "Accountant", "Entrepreneur",
                                "Designer", "Photographer", "Journalist", "Psychologist", "Nurse",
                                "Police Officer", "Firefighter", "Chef", "Farmer", "Pilot", "Astronaut",
                                "Dentist", "Veterinarian", "Electrician", "Plumber", "Mechanic", "Carpenter",
                                "Construction Worker", "Judge", "Librarian", "Economist", "Author", "Biologist",
                                "Chemist", "Physicist", "Geologist", "Mathematician", "Statistician",
                                "Philosopher", "Historian", "Geographer", "Sociologist", "Anthropologist",
                                "Archaeologist", "Linguist", "Criminologist", "Counselor",
                                "Urban Planner", "Diplomat", "Translator", "Interpreter", 
                            ];

            setInterval(() => 
            {
                for (let i = 0; i < 9; i++)
                {
                    var takenProfessions = [];
                    var takenCells = [];
                    var takenHeights = [];
                    setTimeout(() => 
                    {
                        let profession = professions[Math.floor(Math.random() * professions.length)];
                        while (takenProfessions.includes(profession))
                        {
                            profession = professions[Math.floor(Math.random() * professions.length)];
                        }
                        takenProfessions.push(profession);

                        let random_wrapper = document.getElementById("random-wrapper-" + (i + 1));
                        let cellIndex = Math.floor(Math.random() * (numRows * numColumns));
                        let rowIndex = Math.floor(cellIndex / numColumns);
                        let columnIndex = cellIndex % numColumns;

                        let {x: xOffset, y: yOffset} = getRandomPositionInCell(cellWidth, cellHeight);

                        let leftValue = (columnIndex * cellWidth + xOffset) - 40;
                        let topValue = Math.min((rowIndex * cellHeight + yOffset / 5) - 40, 40) - 2 * i;
                        
                        random_wrapper.style.left = String(leftValue) + "vw";
                        random_wrapper.style.top = String(topValue) + "vh";
                        let computedHeight = window.getComputedStyle(random_wrapper).getPropertyValue("height");
                        while (takenCells.includes(cellIndex) || (rowIndex === 3 || rowIndex === 4) || withinRangeOfElements(takenHeights, computedHeight, 100))
                        {
                            cellIndex = Math.floor(Math.random() * (numRows * numColumns));
                            rowIndex = Math.floor(cellIndex / numColumns);
                            columnIndex = cellIndex % numColumns;

                            let {x: xOffset, y: yOffset} = getRandomPositionInCell(cellWidth, cellHeight);

                            leftValue = (columnIndex * cellWidth + xOffset) - 40;
                            topValue = Math.min((rowIndex * cellHeight + yOffset / 5) - 40, 40) - 2 * i;

                            random_wrapper.style.left = String(leftValue) + "vw";
                            random_wrapper.style.top = String(topValue) + "vh";
                            computedHeight = window.getComputedStyle(random_wrapper).getPropertyValue("height");
                        }

                        columnIndex = cellIndex % numColumns;
                        rowIndex = Math.floor(cellIndex / numColumns);
                        takenCells.push(cellIndex);
                        takenHeights.push(computedHeight);

                        console.log(takenHeights)

                        random_wrapper.style.left = String(leftValue) + "vw";
                        random_wrapper.style.top = String(topValue) + "vh";
                        
                        console.log(profession + ", rowIndex: " + rowIndex + ", columnIndex: " + columnIndex)
                    
                        let random = document.getElementById("random-" + (i + 1));
                        type(random, profession, true)
                        setTimeout(() => 
                        {
                            type(random, profession, false)
                        }, profession.length * 90 + 2000);
                    }, i * 100);
                }
                takenProfessions = [];
                takenCells = [];
            }, 5000);
            break;
        // page-4:
        case 10:
            page = document.getElementById("page-4");
            smoothScrollTo(innerHeight * 3);
            resizeScrollPosition = 3;
            break;
        // page-5:
        case 11:
            page = document.getElementById("page-5");
            smoothScrollTo(innerHeight * 4);
            resizeScrollPosition = 4;
            var string = randomString();
            type(page, string, true);

            setTimeout(() => 
            {
                type(page, string, false);
            }, string.length * 90 + 2000);

            setInterval(() => 
            {
                var string = randomString();
                type(page, string, true);
                setTimeout(() => {
                    type(page, string, false);
                }, string.length * 90 + 2000);
            }, 5000);

            break;
        // page-6:
        case 12:
            page = document.getElementById("page-6");
            smoothScrollTo(innerHeight * 5);
            resizeScrollPosition = 5;
            break;
        // page-7:
        case 13:
            page = document.getElementById("page-7");
            smoothScrollTo(innerHeight * 6);
            resizeScrollPosition = 6;
            type(page, "Coding doesn't have to be your everything.", true);
            break;
        // page-8:
        case 99:
            page = document.getElementById("page-8");
            smoothScrollTo(innerHeight * 7);
            resizeScrollPosition = 7;
            break;
    }
}
// function animate()
// {
//     requestAnimationFrame(animate);
// }
// animate();

function randomString()
{
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const specials = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const nums = "0123456789";
    let string = "";
    for (let i = 0; i < 7; i++)
    {
        string += characters[Math.floor(Math.random() * characters.length)];
    }
    string += specials[Math.floor(Math.random() * specials.length)];
    string += nums[Math.floor(Math.random() * nums.length)];
    string = string.split('').sort(function(){return 0.5-Math.random()}).join('');
    return string;

}

function type(element, string, increment, firstCall = true, currentStringIndex = 0) 
{
    // type to an element with a string
    let stringCopy = string;

    if (!increment && firstCall) currentStringIndex = stringCopy.length;

    element.innerText = stringCopy.slice(0, currentStringIndex + 1);

    if (increment)
    {
        currentStringIndex++;
        timeout = 90; 
    } else 
    {
        currentStringIndex--;
        timeout = 30;
    }

    if (increment && currentStringIndex !== stringCopy.length
        || !increment && currentStringIndex !== -2)
    {
        setTimeout(() => type(element, string, increment, false, currentStringIndex), timeout);
    }
    else
    {
        currentStringIndex = 0;
    }
}

function smoothScrollTo(y) {
    window.scrollTo({
        top: y,
        left: 0,
        behavior: 'smooth'
    });
}
function lerp(a, b, t)
{
    return a + (b - a) * t;
}

function getRandomPositionInCell(cellWidth, cellHeight) {
    const xOffset = Math.random() * (cellWidth);
    const yOffset = Math.random() * cellHeight;
    return {x: xOffset, y: yOffset};
}

function withinRangeOfElements(array, newElement, range)
{
    for (let i = 0; i < array.length; i++)
    {
        if (Math.abs(array[i] - newElement.x) < range)
        {
            return true;
        }
    }
    return false;
}