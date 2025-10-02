import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { loadKeyboardModel } from './keyboardModel';

gsap.registerPlugin(ScrollTrigger);

export function createHeroScene(loadingManager) {
  const canvas = document.querySelector('#canvas');
  const container = document.querySelector('.hero-scene-container');

  const bgColorChange = gsap.fromTo(
    container,
    {
      background:
        'linear-gradient(to bottom, #243a6eff, #0f172a, #062f4a, #7fa0b9)',
    },
    {
      background:
        'linear-gradient(to bottom, #ffffff, #ffffff, #ffffff, #ffffff)',
    }
  );

  ScrollTrigger.create({
    animation: bgColorChange,
    trigger: '.hero',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
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

  container.addEventListener('mousemove', (e) => {
    // create normalized value of -1 to 1 (left edge to right edge)
    let mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    // (-)negative flip is because in threeJS top is position but for screens top is 0
    let mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    gsap.to(camera.position, {
      x: mouseX * 0.1,
      y: mouseY * 0.1,
      duration: 1,
      ease: 'power2.out',
    });
  });

  // lights

  // Key light
  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(5, 4, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  keyLight.castShadow = true;
  keyLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 100;
  keyLight.shadow.bias = -0.0002;
  keyLight.shadow.normalBias = 0.002;

  //   Rim light
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(-5, 5, -5);
  scene.add(rimLight);

  // Fill light
  const fillLight = new THREE.HemisphereLight(0xa0c4ff, 0x444444, 0.2);
  scene.add(fillLight);

  gsap.to(keyLight.position, {
    x: 0,
    y: 4,
    z: 3,
    scrollTrigger: {
      trigger: container,
      start: '1% top',
      end: 'bottom bottom',
      scrub: 1,
    },
  });

  // models
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);
  const textureLoader = new THREE.TextureLoader();

  const keycapsGroup = new THREE.Group();
  const keycaps = [
    {
      texture: '/textures/keycap_uv-1.png',
      position: [0, -1, 2],
      rotation: [0.7, 0.1, 0.1],
    },
    {
      texture: '/textures/keycap_uv-2.png',
      position: [1, 2.5, -2],
      rotation: [0.7, 0.1, 0.1],
    },
    {
      texture: '/textures/keycap_uv-3.png',
      position: [-1, 1.1, 1],
      rotation: [0.2, 0.3, 1],
    },
    {
      texture: '/textures/keycap_uv-4.png',
      position: [1.7, 0, 1],
      rotation: [0.7, 0.1, -0.6],
    },
    {
      texture: '/textures/keycap_uv-5.png',
      position: [-1.5, -0.5, 1],
      rotation: [0.7, 0.7, 0.3],
    },
    {
      texture: '/textures/keycap_uv-6.png',
      position: [2, 0, 2],
      rotation: [0.2, 0.9, 0.1],
    },
    {
      texture: '/textures/keycap_uv-7.png',
      position: [-3, 2, -1],
      rotation: [0.7, -0.1, 0.1],
    },
    {
      texture: '/textures/keycap_uv-8.png',
      position: [2, -0.6, 2],
      rotation: [-0.7, 0.1, 0.1],
    },
    {
      texture: '/textures/keycap_uv-9.png',
      position: [-2.2, 0.5, 2],
      rotation: [0.7, 0.1, 0.1],
    },
  ];

  // keycap model
  keycaps.forEach((item) => {
    loader.load('/models/keycap/keycap.gltf', (gltf) => {
      const keycap = gltf.scene;

      const keycapTex = textureLoader.load(item.texture);
      keycapTex.flipY = false;
      keycap.scale.setScalar(20);
      keycap.children[0].material.map = keycapTex;
      keycap.children[0].material.roughness = 0.7;
      keycap.position.set(item.position[0], item.position[1], item.position[2]);
      keycap.rotation.set(item.rotation[0], item.rotation[1], item.rotation[2]);
      keycap.castShadow = true;
      keycapsGroup.add(keycap);

      // keycaps floating animation
      gsap.to(keycap.position, {
        x: '+=' + (Math.random() - 0.5) * 0.1,
        y: '+=' + (Math.random() - 0.5) * 0.1,
        z: '+=' + (Math.random() - 0.5) * 0.1,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(keycap.rotation, {
        x: '+=' + Math.PI * Math.random() * 0.1,
        y: '+=' + Math.PI * Math.random() * 0.1,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  });
  scene.add(keycapsGroup);

  gsap.to(keycapsGroup.position, {
    z: 10,
    scrollTrigger: {
      trigger: container,
      start: '1% top',
      bottom: 'bottom bottom',
      scrub: 1,
    },
  });

  // load keyboard model
  loadKeyboardModel(loadingManager).then((keyboard) => {
    // set keyboard translations
    keyboard.scale.setScalar(20);
    keyboard.position.set(0.5, -1, 0);
    keyboard.rotation.x = Math.PI * 0.5;
    keyboard.rotation.y = Math.PI * 0.1;

    scene.add(keyboard);
    keyboard.receiveShadow = true;

    gsap.to(keyboard.rotation, {
      paused: true,
      x: Math.PI * 2.25,
      y: Math.PI * 0,
      scrollTrigger: {
        start: '1% top',
        end: 'bottom bottom',
        trigger: container,
        scrub: 0.5,
      },
    });
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
