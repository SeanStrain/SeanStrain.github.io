<link href="Stylesheets/portfolio.css" rel="stylesheet">

# My Portfolio  
---  

## University Projects
This section contains the various projects I have completed as part of my studies at the University of Edinburgh.  

---

### 4th Year

#### Thesis: 'Automatically Generating Contextualised Responses to Phishing Reports'

My thesis in 4th Year was admitted to the 'Outstanding Project' archive of the University of Edinburgh 2021/22 for creating a thesis that achieved a mark of 80% and above.

You may download it [here](/Files/Automatically_Generating_Contextualised_Responses_to_Phishing_Reports_-_Sean_Strain.pdf), or visit the [University of Edinburgh's Outstanding Project archive](https://www.ed.ac.uk/informatics/undergraduate/our-degrees/outstanding-undergraduate-projects).

#### Displacement Sphere

<img align="center" src="/Images/Displacement_Sphere_small.jpeg" alt="drawing" width="50%"/>

As part of my Computer Graphics course I was tasked with extending the [pbrt-v3](https://github.com/mmp/pbrt-v3) renderer to include displacement mapped spheres. This required me to read in an image, convert it into a heightmap and map it onto the sphere using a UV map, devise an acceptable intersection test for a given ray and the sphere, and optimise this intersection test, all the while extending software I did not create.

GitHub link: [https://github.com/SeanStrain/DisplacementSphere](https://github.com/SeanStrain/DisplacementSphere)

Here is my report and evaluation of the project:
[PDF](/Files/Displacement_Sphere_Report.pdf)

#### Composite Image

In this component of my Computer Graphics course I had to composite a real-world photograph with virtually rendered objects, and make the resulting composite appear as real as possible. To do this, I first assembled a scene of real world objects and photographed using my DSLR. I then measured all objects in the scene to inform the creation of a virtual reproduction of the scene in [Blender](https://www.blender.org/), which I also used to produce a rendering of the virtual scene. Finally, I composited the image in [GIMP](https://www.gimp.org/).

<img align="center" src="/Images/composite-original_scene_small.jpeg" alt="original scene" width="350"/>  
[The original photo](/Images/composite-original_scene.JPG) of the scene before compositing.


<img align="center" src="/Images/composite-composite_small.jpeg" alt="composited image" width="350"/>  
[The composited image](/Images/composite-composite.png) after compositing.

For a more in-depth dive into the process I took in creating this final image, I made a full, step-by-step report:  
[PDF](/Files/Compositing_Report.pdf)

### 3rd Year

#### Air Quality Drone

<img align="center" src="/Images/aqmaps.PNG" alt="The Developer's Guide to aqMaps" width="350"/>

The Air Quality Drone package was made during my Informatics Large Practical course. The course was fully devoted to creating one, large software project. It is a Java project aimed at simulating an autonomous air quality sensor drone around the main campus of Edinburgh University, but it can be used at any point around the globe. It makes use of WhatThreeWords for location data, a web-server to hold the information of the sensors, uses the GeoJSON format to encode geographical data structures, and has extensive JavaDoc documentation throughout.

The drone flies around a given area, avoiding obstacles - such as buildings - while collecting pollution data from various sensors, before returning to where it started. It uses the A* search algorithm to determine the path it takes between two sensors, and uses Nearest Neighbour and Two-Opt heuristics to find the most efficient tour.

GitHub link: [https://github.com/SeanStrain/AirQualityDrone](https://github.com/SeanStrain/AirQualityDrone)

For this project, I made a 14 page report containing documentation for the package:  
[PDF](/Files/Informatics_Large_Practical_Report.pdf)
