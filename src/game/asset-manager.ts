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

  getModel(name: string) {
    return this.models.get(name) as THREE.Object3D;
  }

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

    // soldier test - downloaded from mixamo with included anim
    // because mixamo will rename bones and anims should work better
    const soldierUrl = new URL('/models/soldier.fbx', import.meta.url).href;
    fbxLoader.load(soldierUrl, group => {
      this.models.set('soldier', group);
    })

    // american submachine gun
    const arUrl = new URL(
      "/models/SM_Wep_American_SubMachineGun_01.fbx",
      import.meta.url
    ).href;
    fbxLoader.load(arUrl, (group) => {
      this.models.set("smg-am", group);
    });
  }

  private loadTextures(
    rgbeLoader: RGBELoader,
    textureLoader: THREE.TextureLoader
  ) {
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
