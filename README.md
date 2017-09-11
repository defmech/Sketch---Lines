# Noise Generated Spherical Lines using THREE.js

Using noise to generate paths for lines on a sphere.

## Getting Started
Used JavaScript ES6 and uses a WebPack 3 build system using ExtractTextPlugin for external CSS.

This is my build system for an ES6 project with external CSS. It will build .scss files into an autoprefixed and minified external css file.

Yarn `yarn install` then `yarn run dev` to continually build.

NPM `npm install` then `npm run dev` to continually build.

You can also run `yarn run dist` or `npm run dist` to generate a minified code version.

## Exporting
You can export a single frame as a PNG in your browser using "exportImage" from the menu.

You can export a 10s PNG sequence to download using the "exportPngSequnce" menu option.

I usually use [Window Resizer for Chrome](https://chrome.google.com/webstore/detail/window-resizer/kkelicaakdanhinjdeammmilcgefonfh?hl=en) to set my window to 1024x1024 then use the following to make a high quality mp4.

`ffmpeg -r 60 -f image2 -s 1024x1024 -i %07d.png -vcodec libx264 -crf 15  -pix_fmt yuv420p output.mp4`

## Libraries

[THREE.js](https://threejs.org)

[NOISE!](https://github.com/josephg/noisejs)

[MeshLine](https://github.com/spite/THREE.MeshLine) - Slightly modified

[CCapture.js](https://github.com/spite/ccapture.js)

## License

MIT License

Copyright (c) 2017 David Lochhead

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
