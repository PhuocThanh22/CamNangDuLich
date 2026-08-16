'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface FoodGlobeSpot {
  label: string;
  vido: number;
  kinhdo: number;
  img: string;
  monan: string;
  count: number;
  places: Array<{ id: string | number; ten: string; hinh: string; monan: string; danhgia: string }>;
}

interface FoodGlobeProps {
  spots: FoodGlobeSpot[];
  onSelect: (spot: FoodGlobeSpot) => void;
}

const SPHERE_RADIUS = 1.2;
const ARC_PAIRS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [0, 5],
  [2, 3],
  [2, 4],
  [1, 7],
  [5, 6],
];

function latLongToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function makeRadialTexture(inner: string, outer: string, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function createEarthTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#031720');
  grad.addColorStop(0.3, '#063a45');
  grad.addColorStop(0.5, '#0a4d46');
  grad.addColorStop(0.7, '#063a45');
  grad.addColorStop(1, '#031720');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(110,231,183,0.09)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 24; i++) {
    const x = (i * w) / 24;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let i = 0; i <= 12; i++) {
    const y = (i * h) / 12;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 2 + 0.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, 'rgba(255,179,64,0.16)');
    g.addColorStop(1, 'rgba(255,179,64,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function FoodGlobe({ spots, onSelect }: FoodGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    let running = true;
    let raf = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:2;';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.6);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const warmLight = new THREE.PointLight(0xffb340, 0.75);
    warmLight.position.set(-4, -1, 3);
    scene.add(warmLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({
        map: createEarthTexture(),
        roughness: 0.72,
        metalness: 0.08,
        emissive: new THREE.Color(0x083038),
        emissiveIntensity: 0.4,
      })
    );
    globeGroup.add(earth);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS * 1.28, 28, 18),
      new THREE.MeshBasicMaterial({ color: 0xffb340, wireframe: true, transparent: true, opacity: 0.15 })
    );
    scene.add(wire);

    const glowTex = makeRadialTexture('rgba(45,212,191,0.9)', 'rgba(45,212,191,0)');
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    glow.scale.set(5.6, 5.6, 1);
    scene.add(glow);

    const markerMeshes: THREE.Mesh[] = [];
    const markerPulses: THREE.Sprite[] = [];
    const pulseTex = makeRadialTexture('rgba(255,179,64,0.95)', 'rgba(255,179,64,0)');

    spots.forEach((spot) => {
      const pos = latLongToVector3(spot.vido, spot.kinhdo, SPHERE_RADIUS + 0.025);
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffb340 })
      );
      marker.position.copy(pos);
      marker.userData.spot = spot;
      globeGroup.add(marker);
      markerMeshes.push(marker);

      const pulse = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: pulseTex,
          color: 0xffb340,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.9,
        })
      );
      pulse.position.copy(pos);
      pulse.scale.set(0.14, 0.14, 1);
      globeGroup.add(pulse);
      markerPulses.push(pulse);
    });

    const arcPulses: Array<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; speed: number; offset: number }> = [];

    ARC_PAIRS.forEach(([a, b]) => {
      if (!spots[a] || !spots[b]) return;
      const from = latLongToVector3(spots[a].vido, spots[a].kinhdo, SPHERE_RADIUS + 0.025);
      const to = latLongToVector3(spots[b].vido, spots[b].kinhdo, SPHERE_RADIUS + 0.025);
      const mid = from.clone().add(to).multiplyScalar(0.5);
      mid.setLength(SPHERE_RADIUS + from.distanceTo(to) * 0.4);
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const points = curve.getPoints(40);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0x2dd4bf,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      globeGroup.add(line);

      const pulseMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfff3c4 })
      );
      globeGroup.add(pulseMesh);
      arcPulses.push({ mesh: pulseMesh, curve, speed: 0.35 + Math.random() * 0.3, offset: Math.random() });
    });

    const ringGroup = new THREE.Group();
    globeGroup.add(ringGroup);
    const ringPoints: THREE.Vector3[] = [];
    const ringRadius = SPHERE_RADIUS * 1.62;
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(a) * ringRadius, 0, Math.sin(a) * ringRadius));
    }
    ringGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ringPoints),
        new THREE.LineBasicMaterial({
          color: 0x5eead4,
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      )
    );
    const ringDots: THREE.Mesh[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.007, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.5 })
      );
      dot.position.set(Math.cos(a) * ringRadius, 0, Math.sin(a) * ringRadius);
      ringGroup.add(dot);
      ringDots.push(dot);
    }

    const starCanvas = document.createElement('canvas');
    starCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    starCanvas.width = width;
    starCanvas.height = height;
    container.appendChild(starCanvas);
    const sCtx = starCanvas.getContext('2d')!;
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.7 + 0.3,
      s: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));
    function drawStars(t: number) {
      sCtx.clearRect(0, 0, width, height);
      stars.forEach((s) => {
        const bright = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.s + s.phase));
        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(255,255,255,${bright * s.a})`;
        sCtx.fill();
      });
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3;';
    container.appendChild(overlay);

    const cards = spots.map((spot) => {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;top:0;left:0;pointer-events:auto;cursor:pointer;opacity:0;transition:opacity 0.3s ease;will-change:transform;transform:translate(-10000px,-10000px);';
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;filter:drop-shadow(0 6px 24px rgba(0,0,0,0.6));">
          <div style="width:72px;height:54px;border-radius:12px;overflow:hidden;border:2.5px solid rgba(255,255,255,0.85);background:#fff;">
            <img src="${spot.img}" alt="${spot.label}" style="width:100%;height:100%;object-fit:cover;" />
          </div>
          <div style="background:linear-gradient(135deg,rgba(0,0,0,0.7),rgba(10,10,30,0.8));backdrop-filter:blur(8px);border-radius:8px;padding:3px 10px;font-size:11px;font-weight:600;color:#fff;white-space:nowrap;letter-spacing:0.3px;border:1px solid rgba(255,255,255,0.1);">
            ${spot.label} · ${spot.monan}
          </div>
        </div>`;
      el.addEventListener('click', () => onSelectRef.current(spot));
      overlay.appendChild(el);
      return el;
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 2.6;
    controls.maxDistance = 8;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.85;

    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    const pauseAuto = () => {
      controls.autoRotate = false;
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };
    const scheduleAuto = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        controls.autoRotate = true;
        resumeTimer = null;
      }, 4000);
    };
    controls.addEventListener('start', pauseAuto);
    controls.addEventListener('end', scheduleAuto);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = false;
    let downX = 0;
    let downY = 0;
    const onPointerDown = (e: PointerEvent) => {
      pointerDown = true;
      downX = e.clientX;
      downY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDown) return;
      pointerDown = false;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markerMeshes, false);
      if (hits.length) {
        const spot = (hits[0].object as THREE.Mesh).userData.spot as FoodGlobeSpot;
        onSelectRef.current(spot);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const proj = new THREE.Vector3();
    const updateCardPositions = () => {
      cards.forEach((el, i) => {
        const marker = markerMeshes[i];
        if (!marker) {
          el.style.opacity = '0';
          return;
        }
        marker.getWorldPosition(proj);
        const facing = proj.clone().normalize().dot(camera.position.clone().sub(proj).normalize()) > 0.08;
        if (facing) {
          const p = proj.clone().project(camera);
          const x = (p.x * 0.5 + 0.5) * width;
          const y = (-p.y * 0.5 + 0.5) * height;
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -155%)`;
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
        } else {
          el.style.transform = 'translate(-10000px, -10000px)';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }
      });
    };

    const ro = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      starCanvas.width = width;
      starCanvas.height = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(container);

    const timer = new THREE.Timer();
    let elapsed = 0;
    const animate = () => {
      if (!running) return;
      raf = requestAnimationFrame(animate);
      timer.update();
      elapsed += Math.min(timer.getDelta(), 0.05);

      globeGroup.rotation.y += 0.0035;
      wire.rotation.y -= 0.0012;
      wire.rotation.x += 0.0005;
      ringGroup.rotation.y -= 0.004;

      markerPulses.forEach((p, i) => {
        const s = 0.12 + 0.05 * Math.sin(elapsed * 2.6 + i * 0.7);
        p.scale.set(s, s, 1);
      });

      arcPulses.forEach((ap) => {
        const t = (elapsed * ap.speed + ap.offset) % 1;
        ap.mesh.position.copy(ap.curve.getPoint(t));
      });

      drawStars(elapsed);
      updateCardPositions();
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      controls.removeEventListener('start', pauseAuto);
      controls.removeEventListener('end', scheduleAuto);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      ro.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (mat) {
          const mats = Array.isArray(mat) ? mat : [mat];
          mats.forEach((m) => {
            const m2 = m as THREE.Material & { map?: THREE.Texture };
            if (m2.map) m2.map.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots]);

  return <div ref={containerRef} className="relative h-full w-full" />;
}
