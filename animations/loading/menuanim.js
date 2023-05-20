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
        // listener = document.getElementById('title').addEventListener("click", () =>
        // {
        //     if (enabled)
        //     {
        //         const menu1 = document.getElementById("menu-1");
        //         const height = parseInt(window.getComputedStyle(menu1).getPropertyValue('height'.split("px")[0]));
        //         deg1 = 0;
        //         deg2 = 0;
        //         enabled = false;
        //         gsap.to("#menu-2", 
        //         {
        //             duration: 0.3, 
        //             opacity: 1,
        //             ease: "power2.out"
        //         });
            
        //         gsap.to("#menu-1",
        //         {
        //             duration: 0.5,
        //             transform: `rotate3d(0, 0, 1, ${deg1}deg) translateY(${10 + height}px)`,
        //             ease: "power2.out"
        //         });
        //         gsap.to("#menu-3",
        //         {
        //             duration: 0.5,
        //             transform: `rotate3d(0, 0, 1, ${deg2}deg) translateY(-${10 + height}px)`,
        //             ease: "power2.out"
        //         });
                
        //     }
        //     document.getElementById("menu").classList.remove("open");
        // });
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