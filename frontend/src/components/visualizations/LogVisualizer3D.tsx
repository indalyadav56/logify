import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card } from "@/components/ui/card";

interface LogEvent {
  timestamp: number;
  severity: 'info' | 'warning' | 'error';
  category: string;
  value: number;
}

interface LogVisualizer3DProps {
  data: LogEvent[];
  width?: number;
  height?: number;
}

const LogVisualizer3D = ({ data, width = 800, height = 500 }: LogVisualizer3DProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x404040, 0x404040);
    scene.add(gridHelper);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create visualization elements
    const visualizeData = () => {
      // Clear existing elements
      scene.children = scene.children.filter(
        child => child === gridHelper || child === ambientLight || child === directionalLight
      );

      // Create data points
      data.forEach((event, index) => {
        // Create sphere for each event
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: event.severity === 'error' ? 0xff4444 :
                 event.severity === 'warning' ? 0xffbb33 :
                 0x33b5e5,
          transparent: true,
          opacity: 0.8,
        });
        const sphere = new THREE.Mesh(geometry, material);

        // Position based on timestamp and category
        const x = (event.timestamp % 1000) / 50 - 10;
        const y = event.value;
        const z = (index % 20) - 10;

        sphere.position.set(x, y, z);
        sphere.castShadow = true;
        scene.add(sphere);

        // Add connecting lines between points
        if (index > 0) {
          const prevEvent = data[index - 1];
          const prevX = (prevEvent.timestamp % 1000) / 50 - 10;
          const prevY = prevEvent.value;
          const prevZ = ((index - 1) % 20) - 10;

          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(prevX, prevY, prevZ),
            new THREE.Vector3(x, y, z),
          ]);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x404040,
            transparent: true,
            opacity: 0.3,
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
        }
      });
    };

    visualizeData();

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [data, width, height]);

  return (
    <Card className="p-4">
      <div ref={mountRef} className="rounded-lg overflow-hidden" />
    </Card>
  );
};

export default LogVisualizer3D;
