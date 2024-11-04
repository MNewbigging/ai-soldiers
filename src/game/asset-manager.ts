import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export class AssetManager {
  models = new Map();
  textures = new Map();
  animations = new Map();

  private loadingManager = new THREE.LoadingManager();

  cloneModel(name: string): THREE.Object3D {
    const model = this.models.get(name);
    if (model) {
      return SkeletonUtils.clone(model);
    }

    // Ensure we always return an object 3d
    return new THREE.Mesh(
      new THREE.SphereGeometry(),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
  }

  applyModelTexture(model: THREE.Object3D, textureName: string) {
    const texture = this.textures.get(textureName);
    if (!texture) {
      return;
    }

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = texture;
      }
    });
  }

  load(): Promise<void> {
    const fbxLoader = new FBXLoader(this.loadingManager);
    const gltfLoader = new GLTFLoader(this.loadingManager);
    const rgbeLoader = new RGBELoader(this.loadingManager);
    const textureLoader = new THREE.TextureLoader(this.loadingManager);

    this.loadModels(fbxLoader, gltfLoader);
    this.loadTextures(rgbeLoader, textureLoader);
    this.loadAnimations(fbxLoader);

    return new Promise((resolve) => {
      this.loadingManager.onLoad = () => {
        resolve();
      };
    });
  }

  private loadModels(fbxLoader: FBXLoader, gltfLoader: GLTFLoader) {
    // american soldier

    const asUrl = new URL(
      "/models/Character_American_Soldier_01.fbx",
      import.meta.url
    ).href;
    fbxLoader.load(asUrl, (group) => {
      this.models.set("soldier-am", group);
    });

    // american rifle

    const arUrl = new URL(
      "/models/SM_Wep_American_Rifle_01.fbx",
      import.meta.url
    ).href;
    fbxLoader.load(arUrl, (group) => {
      group.scale.multiplyScalar(0.01);
      this.models.set("rifle-am", group);
    });

    // bandit

    const banditUrl = new URL("/models/bandit.fbx", import.meta.url).href;
    fbxLoader.load(banditUrl, (group) => this.models.set("bandit", group));

    // box
    const boxUrl = new URL("/models/box-small.glb", import.meta.url).href;
    gltfLoader.load(boxUrl, (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.metalness = 0; // kenney assets require this to render correctly
        }
      });
      this.models.set("box", gltf.scene);
    });
  }

  private loadTextures(
    rgbeLoader: RGBELoader,
    textureLoader: THREE.TextureLoader
  ) {
    // bandit texture
    const banditUrl = new URL("/textures/bandit-texture.png", import.meta.url)
      .href;
    textureLoader.load(banditUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.set("bandit", texture);
    });

    // skybox
    const orchardUrl = new URL(
      "/textures/orchard_cartoony.hdr",
      import.meta.url
    ).href;
    rgbeLoader.load(orchardUrl, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.textures.set("hdri", texture);
    });

    // war texture 1A
    const a1Url = new URL(
      "/textures/PolygonWar_Texture_01_A.png",
      import.meta.url
    ).href;
    textureLoader.load(a1Url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.set("war-1A", texture);
    });

    // prototype floor texture
    const protoUrl = new URL("/textures/texture_02.png", import.meta.url).href;
    textureLoader.load(protoUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.set("floor", texture);
    });
  }

  private loadAnimations(fbxLoader: FBXLoader) {
    // bandit idle
    const idleUrl = new URL("/anims/idle.fbx", import.meta.url).href;
    fbxLoader.load(idleUrl, (group) => {
      if (group.animations.length) {
        const clip = group.animations[0];
        clip.name = "idle";
        this.animations.set("idle", clip);
      }
    });

    // rifle idle
    const rifleIdleUrl = new URL("/anims/Rifle Idle.fbx", import.meta.url).href;
    fbxLoader.load(rifleIdleUrl, (group) => {
      if (group.animations.length) {
        const clip = group.animations[0];
        clip.name = "rifle-idle";
        this.animations.set(clip.name, clip);
      }
    });
  }
}
