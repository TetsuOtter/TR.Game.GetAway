import { IMyWorld } from './MyWorld';

/**
 * 毎フレーム実行されるメソッドの型を定義したインターフェイス
 */
export interface IAnimatorMethod {
  /**
   * elapsedTime : 前回の実行からの経過時間 [ms]
   * 返り値 : 次も実行するかどうか
   */
  (elapsedTime: number): boolean;
}

/**
 * アニメーション機能を司るクラス
 */
export class Animator {
  /**
   * ワールド情報
   */
  private readonly myWorld: IMyWorld;

  /**
   * 毎フレーム実行するメソッド群  
   * nullの場合は実行しない
   */
  private readonly OnTickMethods: (IAnimatorMethod | null)[];

  /**
   * アニメーションが実行中であるか
   */
  private IsRunning: boolean = true;

  /**
   * 最後にアニメーション処理を実行した時間の記録
   */
  private lastExecTime: number;

  /**
   * Animationクラスを初期化する
   * @param myWorld ワールド情報が格納されたインスタンス
   */
  constructor(myWorld: IMyWorld) {
    this.myWorld = myWorld;
    this.OnTickMethods = new Array();
    this.lastExecTime = Date.now();
    this.DoAnimation();
  }

  /**
   * アニメーション処理を登録(追加)する
   * @param onTickMethod 毎フレーム実行するメソッド
   */
  public add(onTickMethod: IAnimatorMethod) {
    this.OnTickMethods.push(onTickMethod);
  }

  /**
   * @deprecated 未実装 メソッドの一致を確認する方法がわからなかった
  */
  public remove(onTickMethod: IAnimatorMethod) {
    const tmpArr = new Array();

    while (this.OnTickMethods.length > 0) {
      var tmp = this.OnTickMethods.pop();

      //一致を確認する必要がある

      //あとで戻すため
      tmpArr.push(tmp);
    }

    while (tmpArr.length > 0)
      this.OnTickMethods.push(tmpArr.pop());
  }

  /**
   * アニメーション実行メソッドリストを空にする
   * <==> すべてのアニメーションを削除する
   */
  public clear() {
    while (this.OnTickMethods.length > 0)
      this.OnTickMethods.pop();
  }

  /**
   * アニメーションを開始する  
   * コンストラクタで自動的に開始されるため, stopメソッドで停止した後に再開する場合に使用する
   */
  public start() {
    this.IsRunning = true;
    this.DoAnimation();
  }

  /**
   * アニメーションを一時停止する  
   * 再開する場合はstartメソッドを使用する
   */
  public stop() {
    this.IsRunning = false;
  }

  /**
   * 毎フレーム実行され, 登録されたアニメーションを実行する
   */
  private DoAnimation() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.lastExecTime;

    if (this.OnTickMethods.length > 0) {
      for (var i = 0; i < this.OnTickMethods.length; i++) {
        //毎フレーム実行するメソッドを呼ぶ
        //もし「次回からは実行しない」と返ったら, それを無効化する
        if (!this.OnTickMethods[i]?.(elapsedTime)) {
          //nullが残るためメモリリークする可能性がある
          //イベントに何度も登録することは想定された使い方ではない
          this.OnTickMethods[i] = null;
        }
      }

      // アニメーション処理による変更点を描画に反映させる (再描画)
      this.myWorld.renderer.render(this.myWorld.scene, this.myWorld.camera);

      // 実行時刻記録を更新
      this.lastExecTime = currentTime;
    }

    //実行中フラグが立っているなら, 次回も処理を実行する
    if (this.IsRunning)
      requestAnimationFrame(() => this.DoAnimation());
  }
}
