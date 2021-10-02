import * as THREE from "three";
import { createBG, createFloor, createGrassWall } from "./createMesh";
import { MyWorld, IMyWorld } from "./MyWorld";
import { createDLight, createAmbLight } from "./MyLight";
import { MyObjLoaderAsync } from "./MyObjLoader";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { UFO } from "./UFO";
import { Gun } from "./Gun";

const posChangeStep = 10;
const hoverCraft_X_Max = 100;
const hoverCraft_X_Min = hoverCraft_X_Max * -1;
const hoverCraft_Y_Max = 160;
const hoverCraft_Y_Min = 40;
const hoverCraft_obj_fileName = 'hovercraft';

const camera_rotation_x = -Math.PI / 10;
const camera_pos_x = 0;
const camera_pos_y = 255;
const camera_pos_z = 200;

/**
 * 地面を動かす速度 [/ms]
 */
const move_speed_PerMS = 0.5;

const shot_count = 100;
const gun_shot_speed_PerMS = 0.3;
const gameOver_Count = 20;
const gun_obj_fileName = 'gun';

const ufo_obj_fileName = 'ufo';
const ufo_base_posX = 0;
const ufo_base_posY = 200;
const ufo_base_posZ = -500;
const ufo_movable_X = 300;
const ufo_movable_Y = 100;
const ufo_movable_Z = 350;
const ufo_move_speed_PerMS = 0.1;

const dlight_pos = 10000;
const ambLight_intensity = 0.05;
const dLight_intensity = 1;

const bg_pos_x = 0;
const bg_pos_y = 6000;
const bg_pos_z = -10000;

const hover_wall_x = 0;
const hover_wall_y = 30;
const hover_wall_z = -40;

const fog_color = 0x88AACC;
const fog_density = 0.00006;


window.onload = () => {
  main(); //ページが読み込まれたらワールド生成を行う
}

function main() {
  var renderer = createRender();
  var scene = new THREE.Scene();
  var camera = createCamera(camera_pos_x, camera_pos_y, camera_pos_z);

  //ワールドに関する情報をまとめて管理する
  var myWorld = new MyWorld(renderer, scene, camera);

  scene.fog = new THREE.FogExp2(fog_color, fog_density);

  createWorld(myWorld);

  // ウィンドウサイズ変更時の再描画処理用
  window.onresize = () => onResize(myWorld);

  camera.rotation.x = camera_rotation_x; //30度下げる

  myWorld.render();
}

async function createWorld(myWorld: IMyWorld) {
  const floor = createFloor();
  myWorld.scene.add(floor);

  const hovercraft = await MyObjLoaderAsync(hoverCraft_obj_fileName);
  hovercraft.position.set(0, hoverCraft_Y_Min, 0);

  const wall = createGrassWall();
  wall.position.set(hover_wall_x, hover_wall_y, hover_wall_z);
  hovercraft.add(wall);

  myWorld.scene.add(hovercraft);

  const myUfo = new UFO(
    myWorld,
    await MyObjLoaderAsync(ufo_obj_fileName),
    new Gun(myWorld, await MyObjLoaderAsync(gun_obj_fileName))
  );
  myUfo.setPos(ufo_base_posX, ufo_base_posY, ufo_base_posZ).addToScene();
  const myUfo2 = myUfo.clone().setPos(ufo_base_posX, ufo_base_posY, ufo_base_posZ).addToScene();

  createUFOMoving(myWorld, myUfo);
  createUFOMoving(myWorld, myUfo2);

  //背景追加
  const bg = createBG();
  bg.position.set(bg_pos_x, bg_pos_y, bg_pos_z);
  myWorld.scene.add(bg);

  //#region ライト設定
  // 平行光
  var light = createDLight(0, 0, 0, dLight_intensity);
  light.position.set(dlight_pos, dlight_pos, 0);
  myWorld.scene.add(light);

  // 環境光
  myWorld.scene.add(createAmbLight(ambLight_intensity));
  //#endregion

  /* // XR Support => 見送り
  // ref : https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_panorama_depth.html
  myWorld.renderer.xr.enabled = true;
  myWorld.renderer.xr.setReferenceSpaceType('local');

  document.body.appendChild(VRButton.createButton(myWorld.renderer));
  */

  var shotCount = new ShotCounter(wall, myWorld);
  window.onkeydown = e => {
    //キー入力によりホバークラフトを動かす (X軸/Y軸)
    onKeyDown(e, hovercraft);

    //スペースキーを押すと銃弾の発射が開始される
    if (e.key == ' ') {
      var i = 0;
      shotCount.startTime = Date.now();
      myWorld.animator.add(t => { //処理が多くて固まるため, 毎フレームに分散させて実行する
        myUfo.gun.shotTo(wall, gun_shot_speed_PerMS, t => shotCount.OnCollisionDetected(t));

        myUfo2.gun.shotTo(wall, gun_shot_speed_PerMS, t => shotCount.OnCollisionDetected(t));

        return ++i < shot_count;
      });
      myUfo.gun.shotTo(wall, gun_shot_speed_PerMS);
    }
  }

  //地面を動かすアニメーション設定
  //地面を動かして, まるでホバークラフトとかが動いているように見せかける
  myWorld.animator.add(t => {
    const moveLen = t * move_speed_PerMS;
    floor.position.z -= moveLen;

    myWorld.camera.lookAt(hovercraft.getWorldPosition(new THREE.Vector3()));
    return true;
  });
}

/**
 * 被弾回数を数えるためのクラス
 */
class ShotCounter {
  public readonly target: THREE.Object3D;
  public Count: number = 0;
  public startTime: number = 0;
  public readonly myWorld: IMyWorld;

  constructor(target: THREE.Object3D, myWorld: IMyWorld) {
    this.target = target;
    this.myWorld = myWorld;
  }

  public OnCollisionDetected(e: THREE.Intersection) {
    if (e.object == this.target) {
      this.Count++;

      if (this.Count == gameOver_Count) {
        window.confirm("GAME OVER\n防衛時間[ms]:" + (Date.now() - this.startTime));

        while (this.myWorld.scene.children.length > 0)
          this.myWorld.scene.children.pop(); //子要素をすべて消す
        this.myWorld.animator.clear();

        createWorld(this.myWorld); //ワールドを再生成
      }
    }
  }
}

function onKeyDown(e: KeyboardEvent, targetObj: THREE.Object3D) {
  switch (e.key) {
    case "w":
    case "ArrowUp":
      targetObj.position.y += posChangeStep;
      if (targetObj.position.y > hoverCraft_Y_Max)
        targetObj.position.y = hoverCraft_Y_Max;

      break;
    case "s":
    case "ArrowDown":
      targetObj.position.y -= posChangeStep;
      if (targetObj.position.y < hoverCraft_Y_Min)
        targetObj.position.y = hoverCraft_Y_Min;
      break;

    case "a":
    case "ArrowLeft":
      targetObj.position.x -= posChangeStep;
      if (targetObj.position.x < hoverCraft_X_Min)
        targetObj.position.x = hoverCraft_X_Min;
      break;
    case "d":
    case "ArrowRight":
      targetObj.position.x += posChangeStep;
      if (targetObj.position.x > hoverCraft_X_Max)
        targetObj.position.x = hoverCraft_X_Max;
      break;
  }

}

/**
 * ウィンドウサイズが変更された際に, レンダリング結果を修正するためのメソッド
 * @param myWorld ワールド情報
 */
function onResize(myWorld: IMyWorld) {
  //ref : https://ics.media/tutorial-three/renderer_resize/
  myWorld.renderer.setPixelRatio(window.devicePixelRatio);
  myWorld.renderer.setSize(window.innerWidth, window.innerHeight);

  if (myWorld.camera instanceof THREE.PerspectiveCamera) {
    myWorld.camera.aspect = window.innerWidth / window.innerHeight;
    myWorld.camera.updateProjectionMatrix();
  }
}

/**
 * レンダラを生成する
 * @returns 生成したレンダラ
 */
function createRender(): THREE.WebGLRenderer {
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = true;

  var container = document.getElementById('container');
  container?.appendChild(renderer.domElement);

  return renderer;
}

/**
 * 指定の位置にPerspectiveCameraを生成する
 * @param x X座標
 * @param y Y座標
 * @param z Z座標
 * @returns 生成したPerspectiveCamera
 */
function createCamera(x: number, y: number, z: number): THREE.PerspectiveCamera {
  var camera = new THREE.PerspectiveCamera(
    90, //fov
    window.innerWidth / window.innerHeight, //aspect
    0.1, //near
    1000000); //far

  camera.position.set(x, y, z);

  return camera;
}

/**
 * UFOの移動を生成する
 * @param myWorld //ワールド情報
 * @param ufo //UFOを管理するクラスのインスタンス
 */
function createUFOMoving(myWorld: IMyWorld, ufo: UFO) {
  var nextUfoDst_X = ufo.resultObj3D.position.x;
  var nextUfoDst_Y = ufo.resultObj3D.position.y;
  var nextUfoDst_Z = ufo.resultObj3D.position.z;

  //X軸方向のアニメーション
  myWorld.animator.add(t => {
    if (ufo.resultObj3D.position.x == nextUfoDst_X) //一致するなら次の移動先を求める
      nextUfoDst_X = ufo_base_posX - Math.random() * ufo_movable_X * 2 + ufo_movable_X; //baseを中心に上下movableの範囲内で移動

    var diff = nextUfoDst_X - ufo.resultObj3D.position.x;
    var moveLen = Math.min(Math.abs(diff), t * ufo_move_speed_PerMS);

    //差がマイナス => CurrentPosを減らすことで差を小さくできる
    ufo.resultObj3D.position.x += moveLen * (diff > 0 ? 1 : -1);
    return true;
  });

  //y軸方向のアニメーション
  myWorld.animator.add(t => {
    if (ufo.resultObj3D.position.y == nextUfoDst_Y) //一致するなら次の移動先を求める
      nextUfoDst_Y = ufo_base_posY - Math.random() * ufo_movable_Y * 2 + ufo_movable_Y; //baseを中心に上下movableの範囲内で移動

    var diff = nextUfoDst_Y - ufo.resultObj3D.position.y;
    var moveLen = Math.min(Math.abs(diff), t * ufo_move_speed_PerMS);

    //差がマイナス => CurrentPosを減らすことで差を小さくできる
    ufo.resultObj3D.position.y += moveLen * (diff > 0 ? 1 : -1);
    return true;
  });

  //z軸方向のアニメーション
  myWorld.animator.add(t => {
    if (ufo.resultObj3D.position.z == nextUfoDst_Z) //一致するなら次の移動先を求める
      nextUfoDst_Z = ufo_base_posZ - Math.random() * ufo_movable_Z * 2 + ufo_movable_Z; //baseを中心に上下movableの範囲内で移動

    var diff = nextUfoDst_Z - ufo.resultObj3D.position.z;
    var moveLen = Math.min(Math.abs(diff), t * ufo_move_speed_PerMS);

    //差がマイナス => CurrentPosを減らすことで差を小さくできる
    ufo.resultObj3D.position.z += moveLen * (diff > 0 ? 1 : -1);
    return true;
  });
}