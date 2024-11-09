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

  getTexturedModel(modelName: string, textureName: string) {
    const model = this.cloneModel(modelName);
    this.applyModelTexture(model, textureName);
    return model;
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
    /**
     * Note on character models:
     * You first have to upload the model to mixamo, apply any animation, then download
     * with skin to use as the base model. Then download all anims separately without skin.
     * This is because mixamo edits the bone names to match the anim, without it the anims
     * won't always work (they'll not find certain bones)
     */

    // american soldier
    // const asUrl = new URL(
    //   "/models/Character_American_Soldier_01.fbx",
    //   import.meta.url
    // ).href;
    // fbxLoader.load(asUrl, (group) => {
    //   this.models.set("soldier-am", group);
    // });

    this.loadModel(fbxLoader, "Character_American_Soldier_01", "soldier-am");

    // american submachine gun
    const arUrl = new URL(
      "/models/SM_Wep_American_SubMachineGun_01.fbx",
      import.meta.url
    ).href;
    fbxLoader.load(arUrl, (group) => {
      this.models.set("smg-am", group);
    });

    // german soldier
    const gsUrl = new URL(
      "/models/Character_German_Soldier_01.fbx",
      import.meta.url
    ).href;
    fbxLoader.load(gsUrl, (group) => {
      this.models.set("soldier-de", group);
    });

    // german assault rifle
    const germanArUrl = new URL(
      "/models/SM_Wep_German_AssaultRifle_01.fbx",
      import.meta.url
    ).href;
    fbxLoader.load(germanArUrl, (group) => {
      this.models.set("rifle-de", group);
    });
  }

  private loadModel(
    fbxLoader: FBXLoader,
    filename: string,
    alias: string,
    onLoad?: (group: THREE.Group) => void
  ) {
    const path = `/models/${filename}.fbx`;
    const url = getUrl(path);

    fbxLoader.load(url, (group: THREE.Group) => {
      onLoad?.(group);
      this.models.set(alias, group);
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

  private loadTexture(
    loader: RGBELoader | THREE.TextureLoader,
    filename: string, // includes the extension since it might differ between textures
    alias: string,
    onLoad?: (texture: THREE.Texture) => void
  ) {
    const path = `/textures/${filename}`;
    const url = getUrl(path);
    //loader.load(url, )
  }

  private loadAnimations(fbxLoader: FBXLoader) {
    // rifle idle
    const rifleIdleUrl = new URL("/anims/rifle-idle-1.fbx", import.meta.url)
      .href;
    fbxLoader.load(rifleIdleUrl, (group) => {
      if (group.animations.length) {
        const clip = group.animations[0];
        clip.name = "rifle-idle-1";
        this.animations.set(clip.name, clip);
      }
    });

    const rifleIdle2Url = new URL("/anims/rifle-idle-2.fbx", import.meta.url)
      .href;
    fbxLoader.load(rifleIdle2Url, (group) => {
      if (group.animations.length) {
        const clip = group.animations[0];
        clip.name = "rifle-idle-2";
        this.animations.set(clip.name, clip);
      }
    });
  }
}

function getUrl(path: string) {
  return new URL(path, import.meta.url).href;
}
