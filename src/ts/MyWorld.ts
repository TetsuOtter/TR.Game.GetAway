import { Animator } from "./Animator";

/**
 * ワールド情報を記録するクラス
 */
export class MyWorld implements IMyWorld {

  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.Camera;
  public animator: Animator;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, animator?: Animator) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    //アニメーターが選択されていた買った場合, 新規に作成して使用する
    this.animator = animator ?? new Animator(this);
  }

  /**
   * 再描画を行う
   */
  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}

/**
 * 外部からのアクセス用のワールド情報格納用インターフェイス
 */
export interface IMyWorld {
  get renderer(): THREE.WebGLRenderer;
  get scene(): THREE.Scene;
  get camera(): THREE.Camera;
  get animator(): Animator;

  render(): void;
}
