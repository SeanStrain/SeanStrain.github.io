let enabled = false;
let deg1 = 0;
let deg2 = 0;

document.getElementById("menu-button").addEventListener("click", () => 
{
    var listener = false
    if (enabled)
    {
        if (listener)
        {
            document.getElementById('body').removeEventListener("click", listener);
            listener = false;
        }
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
    else
    {
        listener = document.getElementById('canvas').addEventListener("click", () =>
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