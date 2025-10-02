import './style.css';
import * as THREE from 'three';
import { createHeroScene } from './heroScene';
import { createColorConfigScene } from './colorConfigScene';

const loadingManager = new THREE.LoadingManager(() => {
  const preloader = document.querySelector('.preloader');
  preloader.classList.add('hide');
  setTimeout(() => {
    preloader.remove();
  }, 600);
});

createHeroScene(loadingManager);
createColorConfigScene(loadingManager);
