// Menu Animations:
const menu1 = document.getElementById("menu-1");
const height = parseInt(window.getComputedStyle(menu1).getPropertyValue('height'.split("px")[0]));
const spans = [document.getElementById("menu-1"), document.getElementById("menu-2"), document.getElementById("menu-3")]

const heightModifier = 5;
const resultHeight = 10;

const targets = [-10, 0, 10]
spans.forEach((span, index) =>
{
    setTimeout(() => 
    {
        h = 0
        //if (index == 0) h = -height
        //if (index == 2) h = height
        let target = targets[index]
        gsap.to(span,
        {
            transform: `translate(0, ${target}px)`,
            duration: 0.8
        })
    }, 300 * index + 1000)
})

var enabled = false;
var deg1 = 0;
var deg2 = 0;
document.getElementById("menu-button").addEventListener("click", () => 
{
    if (enabled)
    {
        deg1 = 0;
        deg2 = 0;
        enabled = false;
        gsap.to("#menu-2", 
        {
            duration: 0.3, 
            opacity: 1,
            ease: "power2.out"
        });
    
        gsap.to("#menu-1",
        {
            duration: 0.5,
            transform: `rotate3d(0, 0, 1, ${deg1}deg) translateY(${resultHeight}px)`,
            ease: "power2.out"
        });
        gsap.to("#menu-3",
        {
            duration: 0.5,
            transform: `rotate3d(0, 0, 1, ${deg2}deg) translateY(-${resultHeight}px)`,
            ease: "power2.out"
        });
        
    }
    else
    {
        listener = document.getElementById('title').addEventListener("click", () =>
        {
            if (enabled)
            {
                const menu1 = document.getElementById("menu-1");
                const height = parseInt(window.getComputedStyle(menu1).getPropertyValue('height'.split("px")[0]));
                deg1 = 0;
                deg2 = 0;
                enabled = false;
                gsap.to("#menu-2", 
                {
                    duration: 0.3, 
                    opacity: 1,
                    ease: "power2.out"
                });
            
                gsap.to("#menu-1",
                {
                    duration: 0.5,
                    transform: `rotate3d(0, 0, 1, ${deg1}deg) translateY(${10 + height}px)`,
                    ease: "power2.out"
                });
                gsap.to("#menu-3",
                {
                    duration: 0.5,
                    transform: `rotate3d(0, 0, 1, ${deg2}deg) translateY(-${10 + height}px)`,
                    ease: "power2.out"
                });
                
            }
            document.getElementById("menu").classList.remove("open");
        });
        enabled = true;
        deg1 = 45;
        deg2 = -45;
        gsap.to("#menu-2", 
        {
            duration: 0.3, 
            opacity: 0,
            ease: "power2.out"
        });
    
        gsap.to("#menu-1",
        {
            duration: 0.5,
            transform: `rotate3d(0, 0, 1, ${deg1}deg)`,
            ease: "power2.out"
        });
        gsap.to("#menu-3",
        {
            duration: 0.5,
            transform: `rotate3d(0, 0, 1, ${deg2}deg)`,
            ease: "power2.out"
        });
    }
    document.getElementById("menu").classList.toggle("open");
});