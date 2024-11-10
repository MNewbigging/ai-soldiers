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

    this.loadModel(fbxLoader, "Character_American_Soldier_01", "soldier-am");
    this.loadModel(fbxLoader, "SM_Wep_American_SubMachineGun_01", "smg-am");
    this.loadModel(fbxLoader, "Character_German_Soldier_01", "soldier-de");
    this.loadModel(fbxLoader, "SM_Wep_German_AssaultRifle_01", "rifle-de");
  }

  private loadModel(
    loader: FBXLoader,
    filename: string,
    alias: string,
    onLoad?: (group: THREE.Group) => void
  ) {
    const path = `${getPathPrefix()}/models/${filename}.fbx`;
    const url = getUrl(path);

    loader.load(url, (group: THREE.Group) => {
      onLoad?.(group);
      this.models.set(alias, group);
    });
  }

  private loadTextures(
    rgbeLoader: RGBELoader,
    textureLoader: THREE.TextureLoader
  ) {
    this.loadTexture(rgbeLoader, "orchard_cartoony.hdr", "hdri", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
    });

    this.loadTexture(textureLoader, "PolygonWar_Texture_01_A.png", "war-1A");
    this.loadTexture(textureLoader, "texture_02.png", "floor");
  }

  private loadTexture(
    loader: RGBELoader | THREE.TextureLoader,
    filename: string, // includes the extension since it might differ between textures
    alias: string,
    onLoad?: (texture: THREE.Texture) => void
  ) {
    const path = `${getPathPrefix()}/textures/${filename}`;
    const url = getUrl(path);
    loader.load(url, (texture) => {
      // All textures need this
      texture.colorSpace = THREE.SRGBColorSpace;

      onLoad?.(texture);
      this.textures.set(alias, texture);
    });
  }

  private loadAnimations(fbxLoader: FBXLoader) {
    /**
     * These animations were taken from mixamo, using default animation properties/values
     * The hands/guns don't really align, but we can solve that later (IK?)
     */
    this.loadAnimation(fbxLoader, "Rifle Idle", "rifle-idle");
    this.loadAnimation(fbxLoader, "Rifle Down To Aim", "rifle-down-to-aim");
    this.loadAnimation(fbxLoader, "Rifle Aiming Idle", "rifle-aiming-idle");
    this.loadAnimation(fbxLoader, "Rifle Aim To Down", "rifle-aim-to-down");
  }

  private loadAnimation(loader: FBXLoader, filename: string, alias: string) {
    const path = `${getPathPrefix()}/anims/${filename}.fbx`;
    const url = getUrl(path);
    loader.load(url, (group) => {
      if (group.animations.length) {
        const clip = group.animations[0];
        clip.name = alias;
        this.animations.set(clip.name, clip);
      }
    });
  }
}

function getPathPrefix() {
  // Using template strings to create url paths breaks on github pages
  // We need to manually add the required /repo/ prefix to the path if not on localhost
  return location.hostname === "localhost" ? "" : "/ai-soldiers";
}

function getUrl(path: string) {
  return new URL(path, import.meta.url).href;
}
