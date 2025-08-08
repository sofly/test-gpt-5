import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

export default function Voice() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(200, 200);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 2.5;

    const geometry = new THREE.SphereGeometry(0.8, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLevel: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uLevel;
        varying vec3 vNormal;
        void main() {
          vec3 pos = position + normal * uLevel * 0.4 * sin(uTime + position.y * 4.0);
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uLevel;
        varying vec3 vNormal;
        void main() {
          float intensity = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
          vec3 base = mix(vec3(0.2, 0.8, 1.0), vec3(1.0, 0.2, 0.4), uLevel);
          gl_FragColor = vec4(base * intensity, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const data = new Uint8Array(analyser.frequencyBinCount);

    let cleanup = false;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (cleanup) return;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const animate = () => {
        if (cleanup) return;
        requestAnimationFrame(animate);
        analyser.getByteFrequencyData(data);
        const level = data.reduce((a, b) => a + b, 0) / data.length / 255;
        material.uniforms.uLevel.value = level;
        material.uniforms.uTime.value = performance.now() / 1000;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });

    return () => {
      cleanup = true;
    };
  }, []);

  return (
    <>
      <div style={{ position: "absolute", top: 16, left: 16 }}>
        <Link to="/circle" style={{ color: "#646cff" }}>Circle</Link>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#000",
        }}
      >
        <canvas ref={canvasRef} style={{ width: 200, height: 200 }} />
      </div>
    </>
  );
}
