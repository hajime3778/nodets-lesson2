## ディレクトリ構成

- controller (handler)
  - HTTPリクエストを受け取る箇所

- service
  - APIのメインになる処理

- repository
  - DB、外部のリソースにアクセスする箇所

- model (entity)
  - テーブルの形を型として定義する箇所

テスト用ライブラリ導入コマンド
`npm install -D jest @types/jest ts-jest eslint-plugin-jest`
