# Delir plugin example
Delirのサンプルプラグイン。
プラグイン開発のテンプレートとしてご利用ください。

[プラグインテンプレートをダウンロード](https://github.com/ra-gg/Delir/releases/download/untagged-40a78497634d1bd5f52d/plugin-template.zip)

## 開発のはじめ方
- **事前に`Node.js`と`yarn`のインストールが必要です。**
- 開発にはVisualStudio Codeの使用をおすすめします。

プラグインテンプレートをダウンロードし、以下の場所にフォルダごと展開しましょう。
（`delir/plugins/プラグイン名/package.json` が存在するようにしてください）

Windows: %AppData%\delir\plugins
macOS: $HOME/Library/Application\ Support/delir/plugins/

テンプレートを展開したら、コマンドラインから展開したプラグインフォルダへ移動(cd)して
以下のコマンドを実行してください

```shell
# Put below commands into shell
yarn install # 依存モジュールをインストールする
yarn dev # 更新監視モードで開発を始める（コードを書き換えると自動的にコンパイルが行われる）
```

## ファイル構造
- package.json - プラグイン情報を記述
- src - プラグインのコンパイル前ソースコード
    - index.ts - エントリポイントになるファイル。ここにレンダリング処理を記述します。
- dist - コンパイル後コードの出力先

## package.json のフィールドについて
### `engines.delir`
動作対象となるDelirのバージョンを指定します。

```json5
{
    // プラグインID（他のプラグインとかぶらないように！）
    "name": "@user/delir-plugin-example",
    "main": "dist/index.js",
    "engines": {
        // 対応しているdelir-coreのバージョン
        "delir-core": "0.0.x"
    }
}
```

### delir
プラグインについての詳細情報を記述します。

```json5
{
    "delir": {
        // プラグイン名
        "name": "サンプルプラグイン",

        // typeは現在 `post-effect` のみです
        "type": "post-effect"
    }
}
```

## プラグインインターフェース

### `static provideParameters()`
プラグインで利用可能なパラメータを返します。
`delir-core`モジュールから提供されるTypeクラスを利用してパラメータを定義します。
現在は以下の型が利用可能です。

- number - 整数型
- float - 小数型
- asset - Asset型（Assetに追加されたファイルを利用する場合に利用します）
- bool - 真偽型
- colorRgb / colorRgba - Color型（透明度なし・あり）

provideParametersメソッド内で以下のようにパラメータを定義します。

```javascript
// Example:
return Type
    // .<型名>('パラメータ名', {パラメータオプション})
    // パラメータオプション label - ユーザに表示されるパラメータ名を指定します。
    // パラメータオプション defaultValue - 初期値を指定します
    .number('x', {label: 'PositionX', defaultValue: 0})
    .number('y', {label: 'PositionY', defaultValue: 0})
    .bool('visibility', {label: 'Visible', defaultValue: true})
    .asset('image', {label: 'Image', extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg']})
    .colorRgba('color', {label: 'Color', defaultValue: new Delir.Values.ColorRGBA(0, 0, 0, 1)})
```

### `async initialize(context: Delir.PreRenderContext)`
レンダリング開始前の初期化処理で呼ばれるメソッドです。
画像などのファイルの読み込みはここで行います。

`req`オブジェクトには、Assetなどの初期値が含まれています。

```javascript
async initialize(context: Delir.PreRenderContext) {
    // req.parameters に provideParameters メソッドで指定したパラメータ名で初期値が渡されます
    const parameters = context.parameters;
    const imageAsset = parameters.image;

    if (! imageAsset == null) return;

    this.image = new Image();
    this.image.src = imageAsset.path;

    // 画像の読み込み完了を待つ
    await new Promise(resolve => this.image.onload = resolve)
}
```

### `async render(context: RenderContext)`
１フレームのレンダリングを行います。
`context`オブジェクトには`出力先のcanvas`、 `フレームレート`、`コンポジションのサイズ`、`コンポジション上の現在時間（およびフレーム番号）`、`現在のフレームのパラメータ`などが渡されます。

```javascript
async render(context: RenderContext)
{
    if (this.image == null) return;

    const dest = context.destCanvas;
    const context = dest.getContext('2d');

    // context.parametersにprovideParametersメソッドで指定したパラメータ名で、現在のフレームでの値が渡されます
    const params = req.parameters;

    if (params.visibility !== false) {
        context.drawImage(this.image, params.x, params.y)
    }
}
```
