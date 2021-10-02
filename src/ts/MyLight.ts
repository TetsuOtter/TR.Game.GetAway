import * as THREE from "three";

/**
 * 平行光ライトを生成する
 * @param x X座標
 * @param y Y座標
 * @param z Z座標
 * @param intensity 光の強さ
 * @returns 生成したライトオブジェクト
 */
export function createDLight(x: number, y: number, z: number, intensity: number): THREE.DirectionalLight {
  var dLight = new THREE.DirectionalLight();
  dLight.position.set(x, y, z);
  dLight.castShadow = true;
  dLight.intensity = intensity;
  dLight.color.set(new THREE.Color(0xFFFFFF));

  dLight.shadow.mapSize.set(1024, 1024);
  return dLight;
}

/**
 * 環境光ライトを生成する
 * @param intensity 光の強さ
 * @returns 生成したライトのオブジェクト
 */
export function createAmbLight(intensity: number): THREE.AmbientLight {
  var dLight = new THREE.AmbientLight();
  dLight.intensity = intensity;
  dLight.color.set(new THREE.Color(0xFFFFFF));

  return dLight;
}

/**
 * 点光源ライトを生成する
 * @param intensity 光の強さ
 * @returns 生成したライトのオブジェクト
 */
export function createPointLight(intensity: number): THREE.PointLight {
  var pLight = new THREE.PointLight();
  pLight.intensity = intensity;
  pLight.color.set(0xFFFFFF);
  pLight.shadow.mapSize.set(1024, 1024);
  return pLight;
}