# University Projects

This page details the various projects I have completed while studying at the University of Edinburgh.

---

## 3rd Year

### Air Quality Drone

<img src="/Images/aqmaps.PNG" alt="drawing" width="200"/>

The Air Quality Drone package was made during my Informatics Large Practical course. The course was fully devoted to creating one, large software project. It is a Java project aimed at simulating an autonomous air quality sensor drone around the main campus of Edinburgh University, but it can be used at any point around the globe. It makes use of WhatThreeWords for location data, a web-server to hold the information of the sensors, uses the GeoJSON format to encode geographical data structures, and has extensive JavaDoc documentation throughout.

The drone flies around a given area, avoiding obstacles - such as buildings - while collecting pollution data from various sensors, before returning to where it started. It uses the A* search algorithm to determine the path it takes between two sensors, and uses Nearest Neighbour and Two-Opt heuristics to find the most efficient tour.

GitHub link: [https://github.com/SeanStrain/AirQualityDrone](https://github.com/SeanStrain/AirQualityDrone)

For this project, I made a 14 page report containing documentation for the package, which you can download in the following formats:
[PDF](/Files/ilp-report.pdf), [DOCX](/Files/ilp-report.docx)
