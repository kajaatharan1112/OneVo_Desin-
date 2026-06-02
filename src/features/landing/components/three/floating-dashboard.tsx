import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Text, Box, Sphere, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export const FloatingDashboard: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation responding to mouse position
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.mouse.x * Math.PI) / 10, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (state.mouse.y * Math.PI) / 10, 0.05);
    }
  });

  return (
    <PresentationControls
      global
      rotation={[0, -0.1, 0]}
      polar={[-0.4, 0.2]}
      azimuth={[-0.4, 0.2]}
    >
      <group ref={groupRef}>
        {/* Main Central Dashboard Glass Panel */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <RoundedBox args={[6, 3.5, 0.1]} radius={0.2} smoothness={16} position={[0, 0, 0]} castShadow receiveShadow>
            <MeshTransmissionMaterial 
              thickness={0.2} 
              roughness={0.1} 
              transmission={1} 
              ior={1.2} 
              color="#ffffff" 
              transparent 
              opacity={0.3} 
            />
            
            {/* Embedded Screen Elements */}
            <RoundedBox args={[1.5, 2.5, 0.05]} position={[-1.8, 0, 0.1]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color="#FFFFFF" />
              <Text position={[0, 0.8, 0.05]} fontSize={0.15} color="#0F172A" anchorX="center" anchorY="middle">
                Activity Feed
              </Text>
              {/* Fake Skeleton rows */}
              <Box args={[1.2, 0.2, 0.01]} position={[0, 0.4, 0.05]}><meshStandardMaterial color="#F1F5F9" /></Box>
              <Box args={[1.2, 0.2, 0.01]} position={[0, 0.1, 0.05]}><meshStandardMaterial color="#F1F5F9" /></Box>
              <Box args={[1.2, 0.2, 0.01]} position={[0, -0.2, 0.05]}><meshStandardMaterial color="#F1F5F9" /></Box>
            </RoundedBox>

            <RoundedBox args={[3.2, 1.5, 0.05]} position={[0.8, 0.5, 0.1]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color="#FFFFFF" />
              <Text position={[-1.2, 0.5, 0.05]} fontSize={0.15} color="#0F172A" anchorX="left" anchorY="middle">
                Revenue Metrics
              </Text>
              {/* Fake Chart Bars */}
              <Box args={[0.2, 0.6, 0.05]} position={[-0.8, -0.1, 0.05]}><meshStandardMaterial color="#2563EB" /></Box>
              <Box args={[0.2, 0.9, 0.05]} position={[-0.4, 0.05, 0.05]}><meshStandardMaterial color="#3B82F6" /></Box>
              <Box args={[0.2, 0.4, 0.05]} position={[0, -0.2, 0.05]}><meshStandardMaterial color="#60A5FA" /></Box>
              <Box args={[0.2, 1.1, 0.05]} position={[0.4, 0.15, 0.05]}><meshStandardMaterial color="#8B5CF6" /></Box>
            </RoundedBox>

            <RoundedBox args={[3.2, 0.8, 0.05]} position={[0.8, -0.85, 0.1]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color="#FFFFFF" />
              <Text position={[0, 0, 0.05]} fontSize={0.15} color="#0F172A" anchorX="center" anchorY="middle">
                Active System Status: Optimal
              </Text>
            </RoundedBox>
          </RoundedBox>
        </Float>

        {/* Floating Accent Orbs representing AI/Modules */}
        <Float speed={3} rotationIntensity={1.5} floatIntensity={2} position={[-3.5, 1.5, 1]}>
          <Sphere args={[0.4, 32, 32]}>
            <MeshTransmissionMaterial thickness={1} roughness={0} transmission={1} ior={1.5} color="#EC4899" />
          </Sphere>
        </Float>

        <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5} position={[3.5, -1.5, 0.5]}>
          <Sphere args={[0.6, 32, 32]}>
            <MeshTransmissionMaterial thickness={1} roughness={0} transmission={1} ior={1.5} color="#3B82F6" />
          </Sphere>
        </Float>
      </group>
    </PresentationControls>
  );
};
