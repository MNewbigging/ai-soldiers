import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as YUKA from 'yuka';

import { AssetManager } from "../asset-manager";
import { Level } from "../entities/Level";

export class GameState {
  // Three stuff
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  // Yuka stuff
  private time = new YUKA.Time();
  private entityManager = new YUKA.EntityManager();

  // Game stuff
  private level: Level;

  constructor(private assetManager: AssetManager) {
    // High level
    this.renderer = this.setupRenderer();
    this.camera = this.setupCamera();

    // Setup scene
    const hdri = this.assetManager.textures.get('hdri');
    this.scene.environment = hdri;
    this.scene.background = hdri;

    this.level = this.setupLevel();
    this.setupLights();

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);

    // Start game
    this.update();
  }

  addEntity(entity: YUKA.GameEntity, renderComponent: THREE.Object3D) {
    // Turn off matrix auto updates
    renderComponent.matrixAutoUpdate = false;
    renderComponent.updateMatrix();

    renderComponent.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      }
    });

    // Add it to the scene
    this.scene.add(renderComponent);

    // Setup the sync callback
    entity.setRenderComponent(renderComponent, sync);

    // Give to entity manager
    this.entityManager.add(entity);
  }

  removeEntity(entity: YUKA.GameEntity) {
    // Remove the entity from manager
    this.entityManager.remove(entity);

    // Dispose of threejs render component
    const e = entity as any;
    if (e._renderComponent !== null) {
      const object = e._renderComponent as THREE.Object3D;

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });

      this.scene.remove(object);
    }
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

  private setupLevel() {
    // Render component for the level is plane for now
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({ color: 'grey' })
    );
    plane.rotateX(-Math.PI / 2)

    const level = new Level();
    level.name = 'level';

    this.addEntity(level, plane);

    return level;
  }

  private update = () => {
    requestAnimationFrame(this.update);

    this.time.update();
    const dt = this.time.getDelta();

    this.controls.update();

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  };
}

export function sync(
  yukaEntity: YUKA.GameEntity,
  renderComponent: THREE.Object3D
) {
  const matrix = yukaEntity.worldMatrix as unknown;
  renderComponent.matrix.copy(matrix as THREE.Matrix4);
}
