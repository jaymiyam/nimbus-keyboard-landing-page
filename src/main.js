import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createHeroScene } from './heroScene';
import { createColorConfigScene } from './colorConfigScene';

gsap.registerPlugin(ScrollTrigger);

// Three.js master loading manager
const loadingManager = new THREE.LoadingManager(() => {
  const preloader = document.querySelector('.preloader');
  preloader.classList.add('hide');
  setTimeout(() => {
    preloader.remove();
  }, 600);
});

// Initiate Three.js scenes
createHeroScene(loadingManager);
createColorConfigScene(loadingManager);

// Features section animations
document.querySelectorAll('.bento-cell').forEach((cell) => {
  const tween = gsap.from(cell, {
    opacity: 0,
    y: 50,
  });

  ScrollTrigger.create({
    animation: tween,
    trigger: cell,
    start: 'top 75%',
    toggleActions: 'play none none reverse',
  });
});
