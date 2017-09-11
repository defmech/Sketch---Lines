import sc from './SceneController';
import MathUtils from './MathUtils';
import Easing from './Easing';

const RADIUS = {
  MIN: 14,
  MAX: 20,
};

const MIN_ROTATION_SPEED = 0.0025;

const perlinDivisor = 100;

const acc = new THREE.Vector3();

let seedHue;

const compColors = [];

const compHueOffset = 0.5;
const compHueOffsetDeviation = 0.05;

const defaults = {
  color: {
    s: 0.8,
    l: 0.5,
  },
};

const containers = {};
const curveObjects = [];

const preDefinedPalette = [new THREE.Color(0xFECB2F), new THREE.Color(0x435CCD), new THREE.Color(0XE8E7EC), new THREE.Color(0XAFB0B4)];

let seedGeneratedPalette;

let clock;

let paused;

class Lines {
  constructor() {
    const seed = THREE.Math.randInt(1, 65536);
    // const seed = 49462;

    console.log(`Seed: ${seed}`);

    paused = false;

    noise.seed(seed);

    seedHue = MathUtils.map(noise.simplex2(128, 128), -1, 1, 0, 1);
    // seedHue = Math.random();

    seedGeneratedPalette = [];
    seedGeneratedPalette.push(this.getColor(seedHue, 0.7, 0.7));
    seedGeneratedPalette.push(this.getColor((seedHue + compHueOffset) % 1, 0.5, 0.5));
    seedGeneratedPalette.push(this.getColor((seedHue + compHueOffset) % 1, 0.2, 0.8));
    seedGeneratedPalette.push(this.getColor((seedHue + compHueOffset) % 1, 0.2, 1));

    compColors.push((seedHue + (compHueOffset - compHueOffsetDeviation)) % 1);
    compColors.push((seedHue + (compHueOffset)) % 1);
    compColors.push((seedHue + (compHueOffset + compHueOffsetDeviation)) % 1);

    clock = new THREE.Clock();


    console.log(`seedHue: ${seedHue} On 0 - 1 scale.`);
  }

  get drawPaused() {
    return paused;
  }

  set drawPaused(value) {
    console.log('Lines.js', 'value', value);
    paused = value;
  }

  taper(p) {
    const turnPoint = 0.1;
    const before = Easing.easeOutQuint(MathUtils.map(p, 0, turnPoint, 0, 1));
    const after = Easing.easeOutQuint(MathUtils.map(p, turnPoint, 1, 1, 0));
    return p < turnPoint ? before : after;
  }

  init() {
    // sc.init(this.getColor(seedHue, defaults.color.s, 0.2).getHex());
    sc.init();
    sc.gui.add(this, 'drawPaused');

    const howManyLines = 100;

    let color;
    let radius;
    let seed;
    let howManyPoints;
    let container;
    let curveObject;

    for (let i = 0; i < howManyLines; i += 1) {
      // color = this.getColor(THREE.Math.randFloat(0.6, 0.9), defaults.color.s, THREE.Math.randFloat(0.2, 0.8));
      color = this.getColor(this.getRandomCompColor(), defaults.color.s, THREE.Math.randFloat(0.2, 0.8));
      // color = this.getRandomPredefinedPaletteColor();
      // color = this.getRandomSeedGeneratedPaletteColor();

      radius = MathUtils.round(THREE.Math.randFloat(RADIUS.MIN, RADIUS.MAX), 1);
      seed = Math.random();
      howManyPoints = THREE.Math.randFloat(100, 200);
      container = this.getContainerForRadius(1);

      curveObject = this.getLine(color, radius, seed, howManyPoints);

      if (curveObject !== null) {
        container.add(curveObject);

        curveObjects.push(curveObject);
      }
    }

    curveObject, length = 45; // Limit the max number of lines

    console.log(`Drawing ${curveObjects.length} lines.`);

    sc.renderQueue.push(this.render);

    // Object.keys(containers).forEach((key) => {
    //   console.log('Lines.js', 'key', key);
    // });
  }

  getRandomCompColor() {
    return compColors[THREE.Math.randInt(0, compColors.length - 1)];
  }

  getRandomPredefinedPaletteColor() {
    return preDefinedPalette[THREE.Math.randInt(0, preDefinedPalette.length - 1)];
  }

  getRandomSeedGeneratedPaletteColor() {
    return seedGeneratedPalette[THREE.Math.randInt(0, seedGeneratedPalette.length - 1)];
  }

  getContainerForRadius(radius) {
    if (containers[radius] === undefined) {
      const container = new THREE.Object3D();
      containers[radius] = container;
      sc.scene.add(container);
    }

    return containers[radius];
  }

  getLine(color, radius, seed = Math.random(), howManyPoints = 100) {
    const startPos = this.getPos(radius);

    const points = [];

    let prevPos = startPos;

    for (let i = 0; i < howManyPoints; i += 1) {
      const step = (i * seed * seed * seed) / 10;

      acc.x = noise.perlin3(
        prevPos.x / perlinDivisor,
        prevPos.y / perlinDivisor,
        step,
      );

      acc.y = noise.perlin3(
        prevPos.y / perlinDivisor,
        prevPos.z / perlinDivisor,
        step,
      );

      acc.z = noise.perlin3(
        prevPos.z / perlinDivisor,
        prevPos.x / perlinDivisor,
        step,
      );

      acc.multiplyScalar(3);

      const newPos = prevPos.clone().add(acc).setLength(radius);

      points.push(newPos);

      prevPos = newPos;
    }

    const curve = new THREE.CatmullRomCurve3(points);
    curve.type = 'catmullrom';
    // curve.tension = THREE.Math.randFloat(0.1, 0.6);
    curve.tension = THREE.Math.randFloat(0.5, 0.9);


    const geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints(howManyPoints * 2);

    geometry.vertices.forEach((vert) => {
      vert.setLength(radius);
    });

    const meshLine = new MeshLine();
    // meshLine.setGeometry(geometry, this.taper);
    meshLine.setGeometry(geometry);

    const meshLineMaterial = new MeshLineMaterial({
      color,
      opacity: 1,
      resolution: sc.resolution,
      // dashArray: new THREE.Vector2(10, 5),
      sizeAttenuation: true,
      lineWidth: MathUtils.map(seed, 0, 1, 0.1, 0.35),
      near: sc.camera.near,
      far: sc.camera.far,
      depthTest: false,
      depthWrite: true,
      alphaTest: 0,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create the final object to add to the scene
    const curveObject = new THREE.Mesh(meshLine.geometry, meshLineMaterial);
    curveObject.castShadow = true;
    curveObject.recieveShadow = true;

    curveObject.geometry.computeBoundingBox();

    // console.log('Lines.js', 'curve.getLength()', curve.getLength());
    // console.log('Lines.js', 'this.getVolumeOfBoundingBox(curveObject.geometry.boundingBox)', this.getVolumeOfBoundingBox(curveObject.geometry.boundingBox));

    if (this.getVolumeOfBoundingBox(curveObject.geometry.boundingBox) < 3000) {
      return null;
    }

    return curveObject;
  }

  getVolumeOfBoundingBox(boundingBox) {
    // console.log('Lines.js', 'boundingBox', boundingBox);
    const width = boundingBox.max.x - boundingBox.min.x;
    const height = boundingBox.max.y - boundingBox.min.y;
    const depth = boundingBox.max.z - boundingBox.min.z;

    return width * height * depth;
  }

  render() {
    if (paused === false) {
      const elapsed = clock.getElapsedTime();

      curveObjects.forEach((curveObject, index) => {
        const color = curveObject.material.uniforms.color.value.getHex();
        curveObject.material.uniforms.visibility.value = MathUtils.map(noise.simplex2(color / 50, elapsed / 10), -1, 1, 0.5, 0.95);
        curveObject.material.uniforms.start.value = MathUtils.map(noise.simplex2(color / 250, elapsed / 5), -1, 1, 0.05, 0.45);

        // This creates quite a nice smooth animation
        // curveObject.material.uniforms.visibility.value = MathUtils.map(Math.sin(elapsed / 2000), -1, 1, 0.5, 1);
        // curveObject.material.uniforms.start.value = MathUtils.map(Math.cos((elapsed) / 2000), -1, 1, 0, 0.5);
      });
    }
  }

  getPos(radius) {
    const pos = new THREE.Vector3();
    pos.x = THREE.Math.randFloatSpread(1000);
    pos.y = THREE.Math.randFloatSpread(1000);
    pos.z = THREE.Math.randFloatSpread(1000);

    pos.setLength(radius);

    return pos;
  }

  getColor(h = Math.random(), s = defaults.color.s, l = defaults.color.l) {
    // console.log('Lines.js', `h: ${h} s: ${s} l: ${l}`);
    const color = new THREE.Color();
    color.setHSL(h, s, l);
    return color;
  }
}

const lines = new Lines();

export default lines;
