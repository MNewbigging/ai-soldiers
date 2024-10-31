import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { AnimatedCharacter } from "./animated-character";
import { AssetManager } from "./asset-manager";

export class GameState {
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private animatedCharacter: AnimatedCharacter;

  constructor(private assetManager: AssetManager) {
    this.renderer = this.setupRenderer();
    this.camera = this.setupCamera();

    this.setupLights();
    this.setupObjects();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);

    this.scene.background = new THREE.Color("#1680AF");

    this.animatedCharacter = this.setupAnimatedCharacter();
    this.scene.add(this.animatedCharacter.object);
    this.animatedCharacter.playAnimation("idle");

    // Start game
    this.update();
  }

  private setupRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1;

    document.body.appendChild(renderer.domElement);

    window.addEventListener("resize", this.onCanvasResize);

    return renderer;
  }

  private onCanvasResize = () => {
    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false
    );

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();
  };

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 3);

    camera.updateProjectionMatrix();

    return camera;
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(undefined, 1);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(undefined, Math.PI);
    directLight.position.copy(new THREE.Vector3(0.75, 1, 0.75).normalize());
    this.scene.add(directLight);
  }

  private setupObjects() {
    const box = this.assetManager.models.get("box");
    this.scene.add(box);
  }

  private setupAnimatedCharacter(): AnimatedCharacter {
    const object = this.assetManager.models.get("bandit");
    object.position.z = -0.5;
    this.assetManager.applyModelTexture(object, "bandit");

    const mixer = new THREE.AnimationMixer(object);
    const actions = new Map<string, THREE.AnimationAction>();
    const idleClip = this.assetManager.animations.get("idle");
    if (idleClip) {
      const idleAction = mixer.clipAction(idleClip);
      actions.set("idle", idleAction);
    }

    return new AnimatedCharacter(object, mixer, actions);
  }

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.controls.update();

    this.animatedCharacter.update(dt);

    this.renderer.render(this.scene, this.camera);
  };
}
