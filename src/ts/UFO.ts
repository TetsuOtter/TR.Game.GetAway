import * as THREE from 'three';
import { createBall } from './createMesh';
import { Gun } from './Gun';
import { IMyWorld } from './MyWorld';

const degPerSecond = 60;
const color = 0xFFFF00;
const radius = 34;
const lightPosY = -8.5;
const intensity = 0.03;
const lightStep = Math.PI / 4;// pi/4 = 45度ごとに配置
const lightStartAngle = 0;

/**
 * UFOオブジェクトを管理するクラス
 */
export class UFO {

  private readonly myWorld: IMyWorld;

  private readonly ufo: THREE.Object3D;
  public readonly gun: Gun;

  private readonly ufo_orig: THREE.Object3D;

  private readonly _resultObj3D: THREE.Object3D;
  public get resultObj3D(): THREE.Object3D {
    return this._resultObj3D;
  }

  constructor(myWorld: IMyWorld, ufo: THREE.Object3D, gun: Gun) {
    this.myWorld = myWorld;

    this.ufo = ufo.clone();
    this.gun = gun.clone();

    this._resultObj3D = new THREE.Object3D();

    this.ufo_orig = ufo;

    this.CreateUFO(0, 0, 0);
  }

  public clone(): UFO {
    return new UFO(this.myWorld, this.ufo_orig, this.gun);
  }

  public addTo(dst?: THREE.Object3D): UFO {
    //null OR undefinedに対する追加要求は, sceneへのaddとして対応する
    dst ??= this.myWorld.scene;

    //オブジェクトを追加する
    dst.add(this.resultObj3D);

    //dotで繋げて使用するために, 自身のインスタンスを返す
    return this;
  }
  public addToScene(): UFO {
    //Sceneにオブジェクトを追加する
    return this.addTo();
  }

  public setPos(x?: number, y?: number, z?: number): UFO {
    //位置指定がないなら, 現在セットされている値を使用する
    x ??= this.resultObj3D.position.x;
    y ??= this.resultObj3D.position.y;
    z ??= this.resultObj3D.position.z;

    //Position セット
    this.resultObj3D.position.set(x, y, z);

    return this;
  }

  private CreateUFO(x: number, y: number, z: number) {
    //#region 各種プロパティの初期化
    this.ufo.position.set(0, 0, 0);
    this.ufo.rotation.set(0, 0, 0);
    this.ufo.scale.set(1, 1, 1);
    this.gun.gunModel.position.set(0, -10, 0);
    this.gun.gunModel.rotation.set(0, 0, 0);
    this.gun.gunModel.scale.set(1, 1, 1);
    //#endregion

    this.SetLight();
    this.myWorld.animator.add(t => this.animatorMethod(t));

    this.resultObj3D.position.set(x, y, z);
    this.resultObj3D.add(this.ufo);
    this.resultObj3D.add(this.gun.gunModel);

    return this.resultObj3D;
  }

  private SetLight() {
    for (var i = lightStartAngle; i < 2 * Math.PI + lightStartAngle; i += lightStep) {
      const x = Math.sin(i) * radius;
      const y = lightPosY;
      const z = Math.cos(i) * radius;

      var light = new THREE.PointLight(color, intensity);
      light.position.set(x, y, z);

      var ball = createBall(2);
      ball.position.set(x, y, z);

      this.ufo.add(light);
    }
  }

  private animatorMethod(elapsedTime: number): boolean {
    this.ufo.rotateY
      (
        (elapsedTime / 1000) //ミリ秒→秒の変換
        * degPerSecond //一秒あたり何度動かすか
        * Math.PI / 180 //degree to radian
      );

    return true;
  }

}