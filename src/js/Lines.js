import sc from "./SceneController";
import MathUtils from "./MathUtils";
import Easing from "./Easing";

const RADIUS = {
	MIN: 14,
	MAX: 20,
};

const perlinDivisor = 100;

const acc = new THREE.Vector3();

let seedHue;

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

const preDefinedPalette = [
	new THREE.Color(0xfecb2f),
	new THREE.Color(0x435ccd),
	new THREE.Color(0xe8e7ec),
	new THREE.Color(0xafb0b4),
];

let seedGeneratedPalette;

let clock;

let paused;

class Lines {
	constructor() {
		// const seed = THREE.Math.randInt(1, 65536);
		const seed = 34974;

		console.log(`Seed: ${seed}`);

		paused = false;

		noise.seed(seed);

		seedHue = MathUtils.map(noise.simplex2(128, 128), -1, 1, 0, 1); // Generate hue based on seeded noise. Reproducable
		// seedHue = Math.random();

		this.map = new THREE.TextureLoader().load("./assets/img/pencil.png");
		this.map.wrapS = THREE.RepeatWrapping;
		this.map.wrapT = THREE.RepeatWrapping;
		this.map.repeat.set(1, 1);

		/**
		 * Generate a color palette based on the seedHue, a complementary hue and two shades of grey.
		 */

		seedGeneratedPalette = [];
		seedGeneratedPalette.push(this.getColor(seedHue, 0.7, 0.7));
		seedGeneratedPalette.push(
			this.getColor((seedHue + compHueOffset) % 1, 0.5, 0.5)
		);
		seedGeneratedPalette.push(
			this.getColor((seedHue + compHueOffset) % 1, 0.2, 0.8)
		);
		seedGeneratedPalette.push(
			this.getColor((seedHue + compHueOffset) % 1, 0.2, 1)
		);

		clock = new THREE.Clock();

		console.log(`seedHue: ${seedHue} On 0 - 1 scale.`);
	}

	get drawPaused() {
		return paused;
	}

	set drawPaused(value) {
		paused = value;
	}

	init() {
		// sc.init(this.getColor(seedHue, defaults.color.s, 0.2).getHex()); // You can set the background of the scene to the seed color.
		sc.init();
		sc.gui.add(this, "drawPaused");

		const howManyLines = 50;

		let color;
		let radius;
		let seed;
		let howManyPoints;
		let container;
		let curveObject;

		for (let i = 0; i < howManyLines; i += 1) {
			/**
			 * A few different ways of getting a line color.
			 * 1: Totally Random Hue with set Saturation and Lightness between 0.2 - 0.8
			 * 2: Color pulled from the preDefinedPalette array. Yellow, BLue, two grays.
			 * 3: Color pulled from palette generated from the seedHue
			 */

			// color = this.getColor(THREE.Math.randFloat(0, 1), defaults.color.s, THREE.Math.randFloat(0.2, 0.8));
			// color = this.getRandomPredefinedPaletteColor();
			color = this.getRandomSeedGeneratedPaletteColor();

			/**
			 * Set the radius of the sphere lines lies on
			 */

			// radius = MathUtils.round(THREE.Math.randFloat(RADIUS.MIN, RADIUS.MAX), 1);
			radius = RADIUS.MAX;

			/**
			 * Give line a random seed later use in noise calculations
			 */

			seed = Math.random();
			howManyPoints = THREE.Math.randFloat(200, 1000);

			/**
			 * Originally had multiple containers but just using one now
			 */

			container = this.getContainerForRadius(1);

			curveObject = this.getLine(color, radius, seed, howManyPoints);

			/**
			 * curveObject can be null if the volume of the line is too small.
			 * We don't want tiny wobbly lines
			 */

			if (curveObject !== null) {
				container.add(curveObject);
				curveObjects.push(curveObject);
			}
		}

		if (curveObjects.length > 45) curveObjects.length = 45; // Limit the max number of lines

		console.log(`Drawing ${curveObjects.length} lines.`);

		sc.renderQueue.push(this.render);
	}

	getRandomPredefinedPaletteColor() {
		return preDefinedPalette[
			THREE.Math.randInt(0, preDefinedPalette.length - 1)
		];
	}

	getRandomSeedGeneratedPaletteColor() {
		return seedGeneratedPalette[
			THREE.Math.randInt(0, seedGeneratedPalette.length - 1)
		];
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
		const startPos = this.getPosOnSphere(radius);

		const points = [];

		let prevPos = startPos;

		for (let i = 0; i < howManyPoints; i += 1) {
			const step = (i * seed * seed * seed) / 10;

			acc.x = noise.perlin3(
				prevPos.x / perlinDivisor,
				prevPos.y / perlinDivisor,
				step
			);

			acc.y = noise.perlin3(
				prevPos.y / perlinDivisor,
				prevPos.z / perlinDivisor,
				step
			);

			acc.z = noise.perlin3(
				prevPos.z / perlinDivisor,
				prevPos.x / perlinDivisor,
				step
			);

			acc.multiplyScalar(3);

			const newPos = prevPos
				.clone()
				.add(acc)
				.setLength(radius);

			points.push(newPos);

			prevPos = newPos;
		}

		const curve = new THREE.CatmullRomCurve3(points);
		curve.type = "catmullrom";
		curve.tension = THREE.Math.randFloat(0.5, 0.9); // USe a random tension to generate different styles of lines

		const geometry = new THREE.Geometry();
		geometry.vertices = curve.getPoints(howManyPoints * 2);

		geometry.vertices.forEach(vert => {
			vert.setLength(radius);
		});

		const meshLine = new MeshLine();
		meshLine.setGeometry(geometry);

		const meshLineMaterial = new MeshLineMaterial({
			color: new THREE.Color(0x000000),
			useMap: true,
			// dashArray: 0.125 / 4,
			// dashOffset: 0,
			// dashRatio: 0.5,
			map: this.map,
			opacity: 0.6,
			resolution: sc.resolution,
			// dashArray: new THREE.Vector2(10, 5),
			sizeAttenuation: true,
			lineWidth: 0.05,
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

		// If volume of bounding box is too small we abort
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
				/**
				 * Using the color of a line as a seed for generating the start and end points of the sub-line being drawn.
				 */

				const color = curveObject.material.uniforms.color.value.getHex();
				curveObject.material.uniforms.visibility.value = MathUtils.map(
					noise.simplex2(color / 50, elapsed / 10),
					-1,
					1,
					0.5,
					0.95
				);
				curveObject.material.uniforms.start.value = MathUtils.map(
					noise.simplex2(color / 250, elapsed / 10),
					-1,
					1,
					0.05,
					0.45
				);

				// This creates quite a nice smooth animation
				// curveObject.material.uniforms.visibility.value = MathUtils.map(Math.sin(elapsed / 2000), -1, 1, 0.5, 1);
				// curveObject.material.uniforms.start.value = MathUtils.map(Math.cos((elapsed) / 2000), -1, 1, 0, 0.5);
			});
		}
	}

	/**
	 * Generates a random point on a sphere of supplied radius
	 */

	getPosOnSphere(radius) {
		const pos = new THREE.Vector3();
		pos.x = THREE.Math.randFloatSpread(1000);
		pos.y = THREE.Math.randFloatSpread(1000);
		pos.z = THREE.Math.randFloatSpread(1000);

		pos.setLength(radius);

		return pos;
	}

	/**
	 * Returns a color object from supplied Hue, Saturatio and Lightness.
	 */

	getColor(h = Math.random(), s = defaults.color.s, l = defaults.color.l) {
		// console.log('Lines.js', `h: ${h} s: ${s} l: ${l}`);
		const color = new THREE.Color();
		color.setHSL(h, s, l);
		return color;
	}
}

const lines = new Lines();

export default lines;
