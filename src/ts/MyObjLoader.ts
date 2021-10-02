import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

const path_base = './obj/';
const mtl_extention = '.mtl';
const obj_extention = '.obj';

// ref : https://nijibox.jp/blog/hello-threejs-load-model/
// ref : https://stackoverflow.com/questions/16334505/how-to-load-obj-model-with-three-js-in-typescript
/**
 * .obj形式のモデルをロードするやつ
 * @param fileNameWithoutExtention 拡張子なしのファイル名
 * @returns 読み込んだオブジェクトのインスタンス
 */
export async function MyObjLoaderAsync(fileNameWithoutExtention: string): Promise<THREE.Group> {
  var mtlLoader = new MTLLoader();
  var objLoader = new OBJLoader();

  // objフォルダ内にすべて入れることにする
  mtlLoader.setPath(path_base);
  objLoader.setPath(path_base);

  var mat = await mtlLoader.loadAsync(fileNameWithoutExtention + mtl_extention);
  mat.preload();

  objLoader.setMaterials(mat);

  var objModel = await objLoader.loadAsync(fileNameWithoutExtention + obj_extention);
  objModel = objModel.clone();

  objModel.castShadow = true;
  objModel.receiveShadow = true;

  return objModel;
}