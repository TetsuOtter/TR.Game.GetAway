import * as THREE from "three";
import { createBall } from "./createMesh";
import { IMyWorld } from "./MyWorld";

//銃の回転速度
const rotationSpeed_RadPerMSec = Math.PI / 20; //9 [deg / sec]
const allowableErrorInRad = Math.PI / 1800; //0.1 [deg / sec]
const barrelPole_len_Y = 15;
const barrelPole_width = 3;
const gunBase_Radius = 5;
const shot_timeout_ms = 5 * 1000;
const gunBase_Color = 0xAA0000;
const bullet_color = 0xFF0000;
const bullet_Radius = 2;

/**
 * 銃オブジェクトを管理するクラス
 */
export class Gun {
  private readonly myWorld: IMyWorld;
  private readonly barrelWithPall: THREE.Object3D;
  private readonly barrelModel: THREE.Object3D;
  private readonly barrelModel_orig: THREE.Object3D;
  private readonly _gunModel: THREE.Object3D;
  private readonly bulletQueue: Array<number> = new Array<number>();

  /**
   * このインスタンスが管理する銃オブジェクトのObject3Dインスタンスを取得する
   */
  public get gunModel(): THREE.Object3D {
    return this._gunModel;
  }

  /**
   * Gunクラスを初期化する
   * @param myWorld ワールド情報が格納されたインスタンス
   * @param barrelModel_orig 銃身モデルオブジェクトのインスタンス
   */
  constructor(myWorld: IMyWorld, barrelModel_orig: THREE.Object3D) {
    this.myWorld = myWorld;

    this.barrelModel_orig = barrelModel_orig; //オリジナルを記録
    this.barrelModel = barrelModel_orig.clone(); //実際に使用するのは, オリジナルを複製したもの

    //プロパティの初期化
    this.barrelModel.position.set(0, barrelPole_len_Y * -1, 0);
    this.barrelModel.rotation.set(0, 0, 0);
    this.barrelModel.scale.set(1, 1, 1);

    //銃身と台座をつなぐポールをつくる
    var pole = new THREE.Mesh(new THREE.BoxGeometry(barrelPole_width, barrelPole_len_Y, barrelPole_width), new THREE.MeshStandardMaterial());
    pole.castShadow = true;
    pole.receiveShadow = true;
    pole.position.set(0, -1 * barrelPole_len_Y / 2, 0);

    this.barrelWithPall = new THREE.Object3D();
    this.barrelWithPall.add(this.barrelModel, pole); //回転をやりやすくするため, Object3DでWrapする

    var gunBase = createBall(gunBase_Radius, gunBase_Color);

    this._gunModel = new THREE.Object3D();
    this.gunModel.add(gunBase, this.barrelWithPall);
  }

  /**
   * Gunインスタンスの複製を生成する
   * @returns 複製したインスタンス
   */
  public clone(): Gun {
    return new Gun(this.myWorld, this.barrelModel_orig);
  }

  /**
   * 指定のオブジェクトに対して弾を撃つ
   * @param target ターゲットにするオブジェクト
   * @param speedPerMS 弾速[/ms]
   * @param onCollisionDetected 何らかのオブジェクトに衝突した際に呼ばれるメソッド
   */
  public shotTo(target: THREE.Object3D, speedPerMS: number, onCollisionDetected?: IOnCollisionDetected) {
    //弾丸オブジェクト
    var bullet = createBall(bullet_Radius, bullet_color); //弾丸は赤色

    var myBulletID = Math.random();
    while (this.bulletQueue.includes(myBulletID))
      myBulletID = Math.random();//IDの衝突が解消されるまで無限ループ
    this.bulletQueue.push(myBulletID);

    var props = new ShotProperties(this, target, bullet, speedPerMS, myBulletID, onCollisionDetected);

    this.myWorld.animator.add(t => Gun.onElapsed(t, props));
  }

  private static onElapsed(elapsedTime: number, props: ShotProperties): boolean {
    if (!props.isBulletFlying) {
      //発射待ち弾丸の先頭が自身でないなら待機する
      if (props.gun.bulletQueue[0] != props.bulletID)
        return true;

      //照準をあわせる
      var aimResult = this.takeAim(elapsedTime, props);

      //照準があった
      if (aimResult == true) {
        props.isBulletFlying = true; //弾を撃ちだす

        //銃身に弾を込める
        props.gun.barrelModel.add(props.bullet);
      }
    } else { //現在, 弾が飛んでいる
      //弾を動かす
      if (!this.moveBullet(props, elapsedTime))
        return false; //動かすのに失敗するなどしたら, アニメーション終了
    }

    props.time += elapsedTime; //タイムアウト計算用に経過時間を記録

    //タイムアウトチェック
    if (props.time > shot_timeout_ms) {
      //規定値以上実行したらタイムアウトにする
      //弾丸をワールドから取り除く
      props.bullet.removeFromParent();

      //実行完了を呼び出し元に通知する
      return false;
    }

    //次回も実行する
    return true;
  }

  /**
   * 照準を合わせる処理
   * @param t 前のフレームからの経過時間
   * @param props 操作にかかわるプロパティが記録されたインスタンス
   * @returns 照準が合ったかどうか
   */
  private static takeAim(t: number, props: ShotProperties): boolean {
    //ターゲットへの角度を計算する
    //ref : https://stackoverflow.com/questions/15098479/how-to-get-the-global-world-position-of-a-child-object
    var target_WPos = new THREE.Vector3();
    props.target.getWorldPosition(target_WPos);

    var gun_WPos = new THREE.Vector3();
    props.gun.gunModel.getWorldPosition(gun_WPos);

    const diff_gun = new THREE.Euler(
      gun_WPos.x - target_WPos.x,
      gun_WPos.y - target_WPos.y,
      gun_WPos.z - target_WPos.z
    );

    const dist_2 = Math.sqrt(Math.pow(diff_gun.x, 2) + Math.pow(diff_gun.z, 2));
    const dist_3 = Math.sqrt(Math.pow(dist_2, 2) + Math.pow(diff_gun.y, 2));
    const radius = Math.abs(props.gun.barrelModel.position.y);
    var rad_x = Math.acos(radius / dist_3) + Math.atan(diff_gun.y / dist_2) - Math.PI / 2;
    var rad_y = Math.atan(diff_gun.x / diff_gun.z) + (diff_gun.z < 0 ? 0 : Math.PI);

    //現在の角度との差を計算する
    var diff_rad_x = rad_x - props.gun.barrelWithPall.rotation.x;
    var diff_rad_y = rad_y - props.gun.gunModel.rotation.y;

    //銃を動かす
    //差が許容範囲内であれば銃を動かさない
    if (Math.abs(diff_rad_x) >= allowableErrorInRad) {
      var angleAddX = getRotationAngle(diff_rad_x, t * rotationSpeed_RadPerMSec);
      props.gun.barrelWithPall.rotation.x += angleAddX;
      props.gun.barrelModel.rotation.x %= Math.PI * 2; //値が大きくなりすぎないように
    }
    if (Math.abs(diff_rad_y) >= allowableErrorInRad) {
      var angleAddY = getRotationAngle(diff_rad_y, t * rotationSpeed_RadPerMSec);
      props.gun.gunModel.rotation.y += angleAddY;
      props.gun.gunModel.rotation.y %= Math.PI * 2;
    }

    //角度差を計算
    var diff_angle = new THREE.Euler(
      rad_x - props.gun.barrelWithPall.rotation.x,
      rad_y - props.gun.gunModel.rotation.y,
      0 //Z軸は動かさない
    );

    //銃を動かした後の銃口の向きを計算/記録する
    //銃口の向きが単位ベクトルで入る
    props.gun.barrelModel.getWorldDirection(props.barrelDirection);

    //差が許容範囲内か確認する
    //許容範囲ならtrue, 許容範囲外ならfalse
    return isInRange(diff_angle, allowableErrorInRad)
  }

  /**
   * 銃弾を動かす
   * @param props 動作のための各種情報が記録されたインスタンス
   * @param elapsedTime 前のフレームからの経過時間
   * @returns 次回実行が必要かどうか
   */
  private static moveBullet(props: ShotProperties, elapsedTime: number): boolean {
    //#region 球を進める作業
    if (props.gun.bulletQueue.length > 0 && props.gun.bulletQueue[0] == props.bulletID) {
      //まだ銃身から球が飛び出していない
      props.bullet.position.z += props.speedPerMS * elapsedTime;

      //球が銃身から離れたら, 発射待ち弾丸Queueから抜く
      if (props.bullet.position.z > 50) {
        //発射待ちQueueから弾丸を抜く
        props.gun.bulletQueue.shift();

        //ワールド座標にセットし直す
        var posInWorld = new THREE.Vector3();
        props.bullet.getWorldPosition(posInWorld);
        props.bullet.removeFromParent();
        props.bullet.position.set(posInWorld.x, posInWorld.y, posInWorld.z);
        props.gun.myWorld.scene.add(props.bullet);
      }
    } else { //既に球は銃身から飛び出している
      //今回移動する距離
      var move_dist = props.speedPerMS * elapsedTime;

      //ここから移動先までの間にオブジェクトが存在するか確認&処理
      if (this.collisionCheck(props, move_dist))
        return false;//今回の移動で衝突するので次回実行の必要なし

      //弾の移動処理
      props.bullet.position.x += props.barrelDirection.x * props.speedPerMS * elapsedTime;
      props.bullet.position.y += props.barrelDirection.y * props.speedPerMS * elapsedTime;
      props.bullet.position.z += props.barrelDirection.z * props.speedPerMS * elapsedTime;
      //#endregion
    }
    //#endregion

    //次回も実行する必要があるので true を返す
    return true;
  }

  /**
   * 衝突判定/衝突時処理を行う
   * @param props 動作のための各種情報が記録されたインスタンス
   * @param threshold 衝突と判定するしきい値
   * @returns 衝突したかどうか
   */
  private static collisionCheck(props: ShotProperties, threshold: number): boolean {
    var checkResult = this.getShortestDist(props);

    if (checkResult == undefined)
      return false; //衝突はなかった

    if (checkResult.distance < threshold) {
      //衝突したと判定
      //弾丸を消す
      props.bullet.removeFromParent();

      props.onCollisionDetected?.(checkResult);
      return true;//衝突した
    }

    return false; //まだ衝突まで距離がある
  }

  /**
   * 進行方向にある一番近い物体までの距離を返す
   * @param props 動作のための各種情報が記録されたインスタンス
   * @returns 進行方向にある一番近いオブジェクトに対する情報
   */
  private static getShortestDist(props: ShotProperties): THREE.Intersection | undefined {
    //ワールド座標を取得
    var posInWorld = new THREE.Vector3();
    props.bullet.getWorldPosition(posInWorld);

    //#region 衝突判定
    //ref : https://choflog.com/threejs-collision-box
    props.raycaster.set(posInWorld, props.barrelDirection);

    // 衝突したオブジェクト一覧を取得
    // childrenから再帰的に探索する => 孫要素に対しても衝突判定を行うため
    // ref : https://www.cresco.co.jp/blog/entry/10897/
    var intersects = props.raycaster.intersectObjects(props.gun.myWorld.scene.children, true);

    //光線に衝突があれば最も近いオブジェクトに対する情報を返し, なければundefinedを返す
    return intersects.length > 0 ? intersects[0] : undefined;
  }
}

/**
 * 銃/銃弾の操作にかかわる情報を記録するクラス
 */
class ShotProperties {

  /**
   * 銃を管理するクラス (弾丸の親であるクラス)
   */
  public readonly gun: Gun;

  /**
   * 狙撃ターゲットにするオブジェクト
   */
  public readonly target: THREE.Object3D;

  /**
   * 銃身のオブジェクト
   */
  public readonly bullet: THREE.Object3D;

  /**
   * 経過時間 [ms]
   */
  public time: number;

  /**
   * 弾丸が飛んでいるかどうか
   */
  public isBulletFlying: boolean;

  /**
   * 弾丸の速度 [/ms]
   */
  public readonly speedPerMS: number;

  /**
   * 銃身(銃口)が向いている向き
   */
  public barrelDirection: THREE.Vector3;

  /**
   * 衝突検知用の光線クラス
   */
  public readonly raycaster: THREE.Raycaster;

  /**
   * 銃弾を識別するUniqueなID
   */
  public readonly bulletID: number;

  /**
   * 衝突を検知した際に実行するメソッド
   */
  public readonly onCollisionDetected: IOnCollisionDetected | undefined;

  /**
   * クラスを初期化する
   * @param gun 銃を管理するクラス (弾丸の親であるクラス)
   * @param target 狙撃ターゲットにするオブジェクト
   * @param bullet 銃身のオブジェクト
   * @param speedPerMS 弾丸の速度 [/ms]
   * @param bulletID 銃弾を識別するUniqueなID
   * @param onCollisionDetected 衝突を検知した際に実行するメソッド
   */
  constructor(gun: Gun, target: THREE.Object3D, bullet: THREE.Object3D, speedPerMS: number, bulletID: number, onCollisionDetected?: IOnCollisionDetected) {
    this.gun = gun;
    this.time = 0;
    this.isBulletFlying = false;
    this.target = target;
    this.bullet = bullet;
    this.speedPerMS = speedPerMS;
    this.barrelDirection = new THREE.Vector3(0, 0, 0);
    this.raycaster = new THREE.Raycaster();
    this.bulletID = bulletID;
    this.onCollisionDetected = onCollisionDetected;
  }
}

/**
 * 衝突を検知した際に呼ばれるメソッドの型を定義したインターフェイス
 */
export interface IOnCollisionDetected {
  (e: THREE.Intersection): void;
}

/**
 * 各パラメータが許容範囲内に収まっているかどうかを確認する
 * @param difference パラメータ
 * @param allowableErrorInRad 許容誤差
 * @returns 許容誤差範囲内か
 */
function isInRange(difference: THREE.Euler, allowableErrorInRad: number): boolean {
  return isInRange_number(difference.x, allowableErrorInRad)
    && isInRange_number(difference.y, allowableErrorInRad)
    && isInRange_number(difference.z, allowableErrorInRad);
}

/**
 * 数値が許容範囲内に収まっているかどうか確認する
 * @param value パラメータ
 * @param allowableError 許容誤差
 * @returns 許容誤差範囲内か
 */
function isInRange_number(value: number, allowableError: number): boolean {
  return (allowableError * -1) <= value && value <= allowableError;
}
/**
 * 必要な回転角を計算する
 * @param diff 角度差
 * @param elapsedTime 前のフレームからの経過時間 [ms]
 * @returns 回転の必要がある角度 [rad]
 */
function getRotationAngle(diff: number, elapsedTime: number): number {
  return Math.min(Math.abs(diff), rotationSpeed_RadPerMSec * elapsedTime) //絶対値が小さい方を採用する
    * (diff < 0 ? -1 : 1) //回転方向を導出する
}
