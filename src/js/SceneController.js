let getCanvasImageData;
let canvasImageData;
let capturer;
const DEFAULT_COLOR_BG = 0x222222;

class SceneController {
  constructor() {
    // console.log('SceneController.js', 'constructor');
    getCanvasImageData = false;
    capturer = new CCapture({
      format: 'png',
      timeLimit: 10,
    });

    this.renderQueue = [];
  }

  exportImage() {
    getCanvasImageData = true;
    this.render(true);

    const win = window.open('', 'Canvas Image');
    const canvas = this.renderer.domElement;

    const src = canvasImageData;
    win.document.write(`<img src='${src}' width='${canvas.width}' height='${canvas.height}'>`);
    console.log('SceneController.js', `width='${canvas.width}' height='${canvas.height}`);
  }

  init(color = DEFAULT_COLOR_BG) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(color);
    this.scene.fog = new THREE.Fog(color, 60, 80);
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 50;
    this.camera.lookAt(new THREE.Vector3());

    // Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 65;
    this.controls.enableDamping = true;
    this.controls.enableKeys = false;

    // Lights
    this.addLighting();

    // this.addSkyBox();

    // Resize
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    // Supplementals
    this.addStats();

    // Render
    this.render();

    // GUI
    this.initGUI();

    /**
     * Add listener to start capturing
     */

    // this.initOnClickCapturer();


    // capturer.start();
  }

  initGUI() {
    // console.log('SceneController.js', 'initGUI');
    this.gui = new dat.GUI();

    const config = {
      exportPngSequence: () => {
        console.warn('SceneController.js', 'Starting capture... ');
        capturer.start();
      },
      reload: () => {
        location.reload();
      },
    };

    this.gui.add(config, 'reload');
    this.gui.add(this, 'exportImage');
    this.gui.add(config, 'exportPngSequence');
    this.gui.add(this.controls, 'autoRotate').listen();
  }

  initOnClickCapturer() {
    console.warn('SceneController.js', 'Click to capture 10s');
    this.renderer.domElement.onclick = () => {
      console.warn('SceneController.js', 'Starting Capture!');
      capturer.start();
    };
  }

  addStats() {
    // console.log('SceneController.js', 'Adding Stats');
    this.statsUI = new Stats();
    this.statsUI.showPanel(0);
    document.body.appendChild(this.statsUI.dom);
  }

  onWindowResize() {
    // Update this.camera and renderer
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.resolution.set(window.innerWidth, window.innerHeight);
  }

  addSkyBox() {
    const skyBoxWidth = 200;
    const geometry = new THREE.BoxGeometry(skyBoxWidth, skyBoxWidth, skyBoxWidth);
    const material = new THREE.ShadowMaterial({
      side: THREE.BackSide,
    });
    material.opacity = 0.1;

    const skybox = new THREE.Mesh(geometry, material);
    skybox.receiveShadow = true;

    this.scene.add(skybox);
  }

  addLighting() {
    // Add a light
    const light1 = new THREE.SpotLight(0xffffff, 0.9);
    light1.position.set(-20, 40, 50);
    light1.target.position.set(0, 0, 0);

    // Shadow
    const shadowSize = 1024;

    light1.castShadow = true;
    light1.shadow.mapSize.width = shadowSize;
    light1.shadow.mapSize.height = shadowSize;
    // this.scene.add(new THREE.CameraHelper(light1.shadow.camera));
    // this.scene.add(new THREE.SpotLightHelper(light1));

    this.scene.add(light1);

    // add another spotlight
    const light2 = new THREE.SpotLight(0xffffff, 0.35);
    light2.position.set(20, -40, 10);
    light2.target.position.set(0, 0, 0);
    light2.castShadow = true;
    light2.shadow.mapSize.width = shadowSize;
    light2.shadow.mapSize.height = shadowSize;
    // this.scene.add(new THREE.CameraHelper(light2.shadow.camera));
    // this.scene.add(new THREE.SpotLightHelper(light2));
    this.scene.add(light2);

    // Add and additional AmbientLight
    this.scene.add(new THREE.AmbientLight(0xAAAAAA));
  }

  render(once = false) {
    if (!once) {
      requestAnimationFrame(() => {
        this.render();
      });
    }

    // Primary render method
    this.renderer.render(this.scene, this.camera);

    capturer.capture(this.renderer.domElement);

    if (this.statsUI) this.statsUI.begin();

    // Render methods here
    this.renderQueue.forEach((renderMethod) => {
      renderMethod();
    });


    if (this.statsUI) this.statsUI.end();

    // Update controls
    if (this.controls) this.controls.update();

    /**
     * Used by exportImage to generate the image data
     */

    if (getCanvasImageData === true) {
      getCanvasImageData = false;
      canvasImageData = this.renderer.domElement.toDataURL();
    }
  }
}

const sc = new SceneController();
export default sc;
