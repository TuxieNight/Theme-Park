# Theme Park
<p>
    My theme is "Fun Park". I not only had all of the objects be related to a fun park, but I also tried to keep the color theme consistent.
    <br><br>
    Move the camera:
    <ul>
    <li>Rotate: Right Click and Drag</li>
    <li>Pan: Left Click and Drag</li>
    <li>Dolly/Zoom: Two Finger Pinch/Spread</li>
    </ul>
    <br>
    Besides being ridable through the UI, I also have keyboard commands to ride the attractions.
    <ul>
    <li>Click and hold "c" to ride in the carousel.</li>
    <li>Click and hold "t" to ride in the spinning teacups.</li>
    <li>Click and hold "f" to ride in the ferris wheel.</li>
    </ul>
    <br>
    All objects, unless otherwise specified below, were created by me.
    <br><br>
    The objects loaded from a model file are the horses in the carousel. The horses were found online here: <a href = "https://free3d.com/3d-model/morgan-horse-galloping-v1--875431.html">https://free3d.com/3d-model/morgan-horse-galloping-v1--875431.html</a>. The model was updated in 2019 by the creator printable_models and has a personal use license.
    <br><br>
    I wrote three shaders. The flag's movement is achieved with shaders. The heart pond's shaders make the water look real. The circus tent's shaders make the shadows of the entrance to the tent fade out as the camera gets closer to the tent and fade in as the camera gets farther from the tent.
    <br><br>
    Besides having an animated shader effect with the tent and the movement of water and cloth through the pond and flag, I also have many diverse and advanced objects. While the complex admission entrance is made of multiple parts, I would like to stress the shapes I procedurally generated. I made the wheel of the ferris wheel, the wheel of the cart, and the circular path by computing the points and triangles. I also made the teacup bases, the teacup plates, and the ferris wheel seating areas in this way.
    While the heart looks like it could be made out of two cylinders and a box, I also built up a specialized set of triangles just for it and computed the uv values for each point so that I could have a texture lay nicely on it.
    <br><br>
    The textures I created were made using Paint3D. I made the texture for the heart pond, for the welcome hearts, for the circus tent, for the flag, and for the hot air balloon. I also made the bump map for the paths.
    <br><br>
    I borrowed the image used for the background from <a href = "https://www.freepik.com/free-photo/aerial-view-vang-vieng-with-mountains-balloon-sunset_13573490.htm#fromView=keyword&page=1&position=0&uuid=b6491b0f-2360-414f-80c4-71a5f2cae70c&query=Happy+Panorama">https://www.freepik.com/free-photo/aerial-view-vang-vieng-with-mountains-balloon-sunset_13573490.htm#fromView=keyword&page=1&position=0
        &uuid=b6491b0f-2360-414f-80c4-71a5f2cae70c&query=Happy+Panorama</a>.
        The author is tawatchai07. I needed to make edits to the image in Paint3D for the background to wrap around decently, because the image was not panoramic. I chose this image even though it was not panoramic, because its colors matched my color theme better than the panoramic images I found. This image was also used as an environment map for reflective objects.
    <br><br>
    I got the water normal map from Katsukagi on the website 3D Textures at <a href = "https://3dtextures.me/2018/11/29/water-002/">https://3dtextures.me/2018/11/29/water-002/</a>. I used this texture twice and shifted each version over each other with some noise, an idea I got from the YouTuber named Stylized Station at <a href = "https://www.youtube.com/watch?v=kXH1-uY0wjY">https://www.youtube.com/watch?v=kXH1-uY0wjY</a>.
    <br><br>
    I got the wood grain texture used for the admission entrances from FreePik at <a href="https://www.freepik.com/free-photo/brown-wood-textured-background-with-design-space_21631254.htm#fromView=keyword&page=1&position=3&uuid=b80da836-184e-4b13-bd7a-78dd6d3ba676&query=Wood+Texture">https://www.freepik.com/free-photo/brown-wood-textured-background-with-design-space_21631254.htm#fromView=keyword&page=1&position =3&uuid=b80da836-184e-4b13-bd7a-78dd6d3ba676&query=Wood+Texture</a>. The creator is rawpixel.com. This was intended to look like painted wood, which is something I saw a peer (Riley Howardsmith) do.
    <br><br>
    The cherry blossom trees were made by Riley Howardsmith, who gave me permission to include them and use her textures for them.
    <br><br>
    I spent more than two days on the heart pond alone. I went through many iterations of design. At first, I tried to use the heart mesh I made (the mesh used for the welcome entrance), but I was not happy with how it looked. I preferred how the water shaders worked on flatter meshes, so I then made a mesh with a heart-shaped hole to be able to see through it to a flat object that applied the water shader. However, I did not like how it was hard to avoid z-fighting with this setup. I then finally came up with the current setup of just drawing the heart in a texture and applying the water effect to only the parts of the texture that are blue.
  </p>

## Credit to CS559

This set of web pages forms a "workbook" assignment for 
CS559, Computer Graphics at the University of Wisconsin for Spring 2025.

Students should run a local web server and start with the `index.html` page.
The html files may not work as "files" without a local server.

Information about the class is available on the course web:
https://pages.graphics.cs.wisc.edu/559-sp25-regular/
https://pages.graphics.cs.wisc.edu/559-sp25-honors/

The `for_students` sub-directory contains files for the students to read and
modify. 

The `libs` sub-directory contains libraries used by the workbook. These
have separate open source licenses provided in the directories. 

The workbook content was primarily developed by Prof. Michael Gleicher with
assistance from the course staff, including Young Wu, over the years.

Students are granted the right to use the workbook content for their work
in class.

The workbook content is Copyright &copy; 2025, Michael Gleicher.

This workbook is provided under a Creative Commons Attribution-NonCommercial 4.0 International license. See https://creativecommons.org/licenses/by-nc/4.0/ for the explanation and https://creativecommons.org/licenses/by-nc/4.0/legalcode for the license itself.
