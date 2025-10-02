import { gsap } from 'gsap';
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { loadKeyboardModel } from './keyboardModel';

const texturesData = [
  {
    id: 'goodwell',
    name: 'Goodwell',
    path: '/goodwell_uv.png',
    thumbnail: '/goodwell_thumbnail.webp',
    knobColor: '#E44E21',
  },
  {
    id: 'dreamboard',
    name: 'Dreamboard',
    path: '/dreamboard_uv.png',
    thumbnail: '/dreamboard_thumbnail.webp',
    knobColor: '#E9759F',
  },
  {
    id: 'cherrynavy',
    name: 'Cherry Navy',
    path: '/cherrynavy_uv.png',
    thumbnail: '/cherrynavy_thumbnail.webp',
    knobColor: '#F06B7E',
  },
  {
    id: 'kick',
    name: 'Kick',
    path: '/kick_uv.png',
    thumbnail: '/kick_thumbnail.webp',
    knobColor: '#FD0A0A',
  },
  {
    id: 'oldschool',
    name: 'Old School',
    path: '/oldschool_uv.png',
    thumbnail: '/oldschool_thumbnail.webp',
    knobColor: '#B89D82',
  },
  {
    id: 'candykeys',
    name: 'Candy Keys',
    path: '/candykeys_uv.png',
    thumbnail: '/candykeys_thumbnail.webp',
    knobColor: '#F38785',
  },
];
let textures = null;

function createTextures() {
  if (textures) return textures;

  textures = {};
  const textureLoader = new THREE.TextureLoader();

  texturesData.forEach((tex) => {
    const texture = textureLoader.load(`/textures${tex.path}`);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    textures[tex.id] = { map: texture, knobColor: tex.knobColor };
  });

  return textures;
}

export function createColorConfigScene() {
  let keyboardModel;
  let isAnimating = false;
  const canvas = document.querySelector('#config-canvas');
  const container = document.querySelector('#config-buttons');
  const keyboardThemes = createTextures();

  function handleThemeBtnClick(id) {
    if (isAnimating) return;
    isAnimating = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      },
    });
    tl.to(keyboardModel.position, {
      y: 0.5,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        changeTheme(id);
      },
    });
    tl.to(keyboardModel.position, {
      y: -1,
      duration: 0.6,
      ease: 'elastic.out(1,0.4)',
    });
  }

  function changeTheme(id) {
    const theme = keyboardThemes[id];

    keyboardModel.traverse((child) => {
      if (child.isMesh) {
        if (child.name === 'knob') {
          child.material.color.set(theme.knobColor);
        } else if (
          child.name !== 'Screen' &&
          child.name !== 'Top_Case' &&
          child.name !== 'Plate' &&
          child.name !== 'PCB' &&
          child.name !== 'Cube005' &&
          child.name !== 'Cube005_1' &&
          child.name !== 'Weight'
        ) {
          child.material.map = theme.map;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  //   Button elements generation
  texturesData.forEach((tex) => {
    const btn = document.createElement('button');
    btn.classList.add('config-button');
    btn.dataset.id = tex.id;

    const imgDiv = document.createElement('div');
    imgDiv.classList.add('config-button-image');

    const img = document.createElement('img');
    img.src = `/images${tex.thumbnail}`;
    imgDiv.appendChild(img);

    const text = document.createElement('span');
    text.innerHTML = tex.name;

    btn.appendChild(imgDiv);
    btn.appendChild(text);

    btn.addEventListener('click', () => {
      handleThemeBtnClick(btn.dataset.id);
    });

    container.appendChild(btn);
  });

  // scene
  const scene = new THREE.Scene();

  // camera
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.z = 5;
  scene.add(camera);

  // light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3);
  keyLight.position.set(0, 4, 0);
  keyLight.castShadow = true;
  scene.add(keyLight);

  keyLight.castShadow = true;
  keyLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 100;
  keyLight.shadow.bias = -0.0002;
  keyLight.shadow.normalBias = 0.002;

  // load keyboard model
  loadKeyboardModel().then((keyboard) => {
    // set keyboard translations
    keyboard.scale.setScalar(20);
    keyboard.position.set(0.5, -1, 0);
    keyboard.rotation.x = Math.PI * 0.3;
    keyboard.receiveShadow = true;

    scene.add(keyboard);
    keyboardModel = keyboard;
  });

  // renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  //   tone mapping helps with cinematic feeling
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // HDR
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const hdrLoader = new HDRLoader();
  hdrLoader.load('/textures/hdr/blue-studio.hdr', (tex) => {
    const envMap = pmremGenerator.fromEquirectangular(tex).texture;

    scene.environment = envMap;
    scene.environmentIntensity = 0.2;

    tex.dispose();
    pmremGenerator.dispose();
  });

  // render loop
  function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
}
