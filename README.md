# Get Away!
CG2021 レポート課題2向けに作成したゲームです

## 概要
変な乗り物に向けてUFOらしき飛行物体から弾丸が発射されるので, それを頑張って避けるゲームです

## あそびかた
1. UFO(仮)はユーザの挑発により発砲を開始するので, 「スペース」キー押下にてUFO(仮)を挑発しましょう.
2. プレイヤーが操作する乗り物は, 一般的なWASDキーおよび矢印キーにて操作可能です.  キーと運動方向の対照は下の表をご覧ください  
  なお, 表中「Direction」は, プレイヤーから見た方向です
3. ユーザが操作する乗り物にはターゲットとなる「青いガラスのような物体」が付いていて, そこに20発被弾すると負けです.
4. 青いガラスのような物体に20発被弾するとゲームオーバーとなり, ポップアップによりゲームオーバーが通知されます.  
  ゲームオーバーポップアップには, 挑発からゲームオーバーまでの時間が表示され, それがスコアに相当します.  
  「OK」あるいは「キャンセル」の押下によりゲームがリロードされ, 初期状態に移行します
5. UFOから弾が発射されなくなるとゲームクリアです.  ゲームクリア演出は面倒だったので実装していません  
  なお, 各UFOは弾を100発撃ちます.
6. 再度スペースキーにより挑発を行うと, 新しいゲームが開始されます.

|Key1|Key2|Direction|
|---|---|---|
|w|↑|Up|
|s|↓|Down|
|a|←|Left|
|d|→|Right|

## ライセンス
MITライセンスに基づいて自由に改造や再配布等が可能です.

## その他
- 面倒だったので, 地面の自動ロード/自動アンロードを実装していません.  それにより, 約15分表示し続けると地面が途切れてしまいますので, ご注意ください.  
  なお, ゲームの進行自体に影響はありません

