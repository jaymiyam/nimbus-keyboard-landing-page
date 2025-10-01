import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let cachedModel = null;
let materials = null;

function createMaterials() {
  if (materials) return materials;

  const textureLoader = new THREE.TextureLoader();

  const goodwellTex = textureLoader.load('/textures/goodwell_uv.png');
  goodwellTex.flipY = false;
  goodwellTex.colorSpace = THREE.SRGBColorSpace;

  const knurlTex = textureLoader.load('/textures/Knurl.jpg');
  knurlTex.flipY = false;

  knurlTex.repeat.set(6, 6);
  knurlTex.wrapS = THREE.RepeatWrapping;
  knurlTex.wrapT = THREE.RepeatWrapping;

  const screenTex = textureLoader.load('/textures/screen_uv.png');
  screenTex.flipY = false;
  screenTex.repeat.set(-1, -1);
  screenTex.offset.set(1, 1);

  // keyboard materials
  materials = {
    keyboardMaterial: new THREE.MeshStandardMaterial({
      roughness: 0.7,
      map: goodwellTex,
    }),

    knobMaterial: new THREE.MeshStandardMaterial({
      color: '#E24818',
      metalness: 1,
      roughness: 0.5,
      bumpMap: knurlTex,
      bumpScale: 0.8,
    }),

    screenMaterial: new THREE.MeshStandardMaterial({
      map: screenTex,
      roughness: 0.3,
    }),

    plateMaterial: new THREE.MeshStandardMaterial({
      color: '#888888',
      roughness: 0.4,
    }),

    bottomCaseMaterial: new THREE.MeshStandardMaterial({
      color: '#1E548A',
      roughness: 0.4,
    }),

    topCaseMaterial: new THREE.MeshStandardMaterial({
      color: '#dddddd',
      roughness: 0.7,
    }),

    feetMaterial: new THREE.MeshStandardMaterial({
      color: '#333333',
      roughness: 0.6,
    }),
  };

  return materials;
}

export async function loadKeyboardModel() {
  if (cachedModel) return cachedModel.clone(true);

  const {
    keyboardMaterial,
    knobMaterial,
    screenMaterial,
    plateMaterial,
    bottomCaseMaterial,
    topCaseMaterial,
    feetMaterial,
  } = createMaterials();

  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);

  // keyboard model
  const gltf = await loader.loadAsync('/models/keyboard/keyboard.gltf');
  const keyboard = gltf.scene;

  // set materials
  keyboard.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      switch (child.name) {
        case 'Knob':
          child.material = knobMaterial;
          break;
        case 'Screen':
          child.material = screenMaterial;
          child.scale.setScalar(-1);
          break;
        case 'Top_Case':
          child.material = topCaseMaterial;
          break;
        case 'Plate':
        case 'PCB':
          child.material = plateMaterial;
          break;
        case 'Cube005':
          child.material = bottomCaseMaterial;
          break;
        case 'Cube005_1':
        case 'Weight':
          child.material = feetMaterial;
          break;
        default:
          child.material = keyboardMaterial;
          break;
      }
    }
  });
  cachedModel = keyboard;
  return cachedModel.clone(true);
}
