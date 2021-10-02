import * as THREE from "three";

const ball_default_radius = 20;
const ball_segments = 100;
const ball_default_color = 0x00FF00;

const floor_x = 100000;
const floor_z = 1000000;
const floor_texture_repeat_distance = 100;
const floor_texture_filepath = 'img/floor.jpg';

const bg_x = 100000;
const bg_y = 30000;
const bg_texture_filepath = 'img/bg.jpg';

const torus_color = 0x6699FF;

const grassWall_x = 60;
const grassWall_y = 60;
const grassWall_Color = 0xAAFFFF;


/**
 * 球体を生成する
 * @param radius 半径[rad]
 * @param color 球体の表面色
 * @returns 生成した球体のObject3D
 */
export function createBall(radius: number = ball_default_radius, color: THREE.ColorRepresentation = ball_default_color): THREE.Mesh<THREE.SphereGeometry, THREE.Material> {
  var geome = new THREE.SphereGeometry(radius, ball_segments, ball_segments);
  var material = new THREE.MeshStandardMaterial();
  material.color = new THREE.Color(color);
  material.roughness = 0.2;
  material.metalness = 0.6;

  var ball = new THREE.Mesh(geome, material);
  return ball;
}

/**
 * 床面(地面)を生成する
 * @returns 生成した床面のObject3D
 */
export function createFloor(): THREE.Mesh<THREE.BoxGeometry, THREE.Material> {
  var geome = new THREE.BoxGeometry(floor_x, 0.01, floor_z);
  var material = new THREE.MeshPhongMaterial();

  var texture = new THREE.TextureLoader().load(floor_texture_filepath);
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(floor_x / floor_texture_repeat_distance, floor_z / floor_texture_repeat_distance);

  material.map = texture;

  var plane = new THREE.Mesh(geome, material);
  //plane.castShadow = true; //床はcastしない
  plane.receiveShadow = true;
  return plane;
}

/**
 * 背景となる板を生成する
 * @returns 背景になる板のObject3D
 */
export function createBG(): THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> {
  var geome = new THREE.BoxGeometry(bg_x, bg_y, 0.01);

  var material = new THREE.MeshBasicMaterial();
  var texture = new THREE.TextureLoader().load(bg_texture_filepath);
  material.map = texture;

  var plane = new THREE.Mesh(geome, material);
  plane.receiveShadow = true;
  return plane;
}

/**
 * 10x10x10の立方体を生成する
 * @returns 生成した立方体のObject3D
 */
export function createCube(): THREE.Mesh<THREE.BoxGeometry, THREE.Material> {
  var geome = new THREE.BoxGeometry(10, 10, 10);
  var material = new THREE.MeshStandardMaterial();

  var cube = new THREE.Mesh(geome, material);
  cube.castShadow = true;
  cube.receiveShadow = true;
  return cube;
}

/**
 * 環状(ドーナツ型)のオブジェクトを生成する
 * @param radius 円の半径
 * @param tube チューブの半径
 * @param segs 曲面の分割数
 * @param arc 生成する弧の角度
 * @returns 生成した環状のObject3D
 */
export function createTorus(radius: number, tube: number, segs: number, arc: number): THREE.Mesh<THREE.TorusGeometry, THREE.Material> {
  var geome = new THREE.TorusGeometry(radius, tube, segs, segs, arc);
  var material = new THREE.MeshStandardMaterial();
  material.color = new THREE.Color(torus_color);
  material.roughness = 0.2;

  var torus = new THREE.Mesh(geome, material);
  torus.castShadow = true;
  torus.receiveShadow = true;
  return torus;
}

/**
 * ガラス風の壁を生成する
 * @returns 生成したオブジェクトのObject3D
 */
export function createGrassWall(): THREE.Mesh<THREE.BoxGeometry, THREE.Material> {
  //ref : https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_physical_transmission.html
  var geome = new THREE.BoxGeometry(grassWall_x, grassWall_y, 0.01);
  var material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(grassWall_Color),
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide, //描画する面(表面/裏面)
    transmission: 1, //透明度
  });
  material.thickness = 3;


  var plane = new THREE.Mesh(geome, material);
  plane.receiveShadow = true;
  plane.castShadow = true;
  return plane;
}
