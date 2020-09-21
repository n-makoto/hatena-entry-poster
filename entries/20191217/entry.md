# .vue ファイル の template タグ内に ESLint を効かせるために Pug を HTML に移行した話

こんにちは！スマートキャンプで[インサイドセールスに特化した SaaS](https://bales.smartcamp.co.jp/bales-cloud)を作っているエンジニアの中川です。
上記プロダクトのフロントエンドは Vue.js を用いて開発しているのですが、 その中で SFC 内の`template`タグで使用していた Pug をやめて HTML に移行した件をこの記事ではお話しようと思います。
また、実際に`template`タグに ESLint を効かせてみて発覚したエラーや警告のなかで数が多かったものや、これから Vue 3 に移行していく上で対応する必要があったルールを紹介します。

## 背景

まずは、なぜ Pug から HTML に移行する判断に至ったのかについて理由を説明します。

### eslint-plugin-vue が効かない

いきなりですが、これが最大の理由です。
`eslint-plugin-vue`は、読んで字の如く、ESLint のプラグインとして`.vue`ファイルの Lint を行えるようにするものであり、公式のプラグインも用意されていてデファクトスタンダードとなっています。
`.vue`ファイルの Lint ということで、当然ですが`.vue`ファイル内の`<script>`のみならず、`<template>`に対しても Lint が実行され、エラーとなるコードや推奨されないコードを検出してくれることを期待しますが、`<template lang="pug">`のように、Pug で書かれると、パースすることが出来ず、結果として template タグに対して Lint が実行されません。

つまり、プロジェクトの状態としては、

- ESLint, eslint-plugin-vue はパッケージとしてインストールされている
- `.vue`ファイルに対して ESLint の実行も出来る
- が、暗黙的に`<template lang="pug">`内は Lint の対象とならず、エラーや警告が検出されない
  といったものになっていました。
  ソースコードのうち一方は Lint され他方は Lint されないという状態は、開発者がそれ認識した上で”適切に”気を配る必要があるという意味で、Lint がまったく無い状態と同じ、もしくはそれ以上に危ういものと考えました。
  （事実、筆者はこのプロジェクトまで Pug を触ったことがなかったこともあり、恥ずかしながら template タグに`eslint-plugin-vue`が効いていない状態であることに気付いていませんでした。）

また、`eslint-plugin-vue`を効かせたかった理由として、到来する Vue 3 への準備を進めたかったことも大きいです。
現在、`eslint-plugin-vue`のバージョンを`next`としてインストールし Vue 3 向けのルールを有効化することで、Vue 3 で新しく追加・もしくは廃止される機能やシンタックスに対しての Lint が効くようになります。
あらかじめこの Lint を効かせておくことで、Vue 3 のリリース時に大きな手間をかけずにアップグレードしたいといった狙いがありました。

### チームに Pug 推進派がいない

プロジェクト黎明期に Pug を推進していたメンバーはすでにチームを離れていたため、現在の開発チームに Pug を推進しているメンバーはおらず、むしろ HTML で書きたいメンバーが存在している状況になっていました。
このような状態は、当然メンバーのモチベーション維持が難しく、また、その技術（今回でいえば Pug）を追っているメンバーがいないことでメンテナンス面で不安が生じます。

## Pug を HTML に移行するには

Pug を HTML に移行するために、AST など静的解析を使って変換するようなツールがないか調べたところ、`vue-pug-to-html`というまさに今回の移行にうってつけな変換ツールを発見し、さらにそこから fork する形で、`@plaidev/pug-to-html`という変換ツールが公開されていたので、今回はそちらを有り難く利用させて頂きました。

また、利用にあたっては制作者である株式会社プレイド様のテックブログに詳細が記載されており、大変参考になりました。
https://tech.plaid.co.jp/pug_to_html/

実際に導入する方法やハマりどころも上記記事にまとめてくださっているので、こちらで再度手順を記載するようなことは行いません。
この場を借りてお礼申し上げます。ありがとうございました！

## Vue 3 に準拠した Lint ルールを導入する

これで Pug がすべて HTML になり、Lint を実行する準備が整いましたが、前述の通り、Lint には Vue 3 に準拠したルールを使用したかったため、以下のリンクに従って導入を進めました。
https://eslint.vuejs.org/user-guide/#installation

また、ルールの適用にあたっては、ルールの優先度ごとにまとめたいくつかのルールセットが用意されているので、それらの中から推奨されている`vue/vue3-recommended`のルールセットを使用しました。
ルールセットの内訳としてはエラーを抑止するための`vue/vue3-essential`、可読性を向上させるための`vue/vue3-strongly-recommended`、任意の選択と認知的オーバーヘッドの最小化のための`vue/vue3-recommended`と用意されており、それぞれのルールセットは前の段階のルールセットを包含するような関係にあります。

### Lint を実行してみる

これで、`template`タグに対して Vue 3 に準拠したルールで Lint を実行する準備が整いました。
これまで Lint されていなかった膨大なコンポーネント（約 300 ファイル）に対して一気に Lint をかけるのは怖いですが、勇気を振り絞って実行してみます。

![エラー出力された様子](./img1.png)

...なるほど。ある程度覚悟していたとはいえ、実際の数字を目にすると心にくるものがありますね。
とはいえこれを見て見ぬ振りをするわけにもいかないので、順番に対処していきました。

ここからは、実際に修正していったうえで、特に目ぼしいルールをいくつか紹介していきます。

### 対応した目ぼしいルール

#### vue-require-v-for-key

これは Vue を触ったことがある方であれば一度は目にするようなお馴染みのルールではありますが、今回 template タグに対して初めて Lint が一斉に当たったこともあり、このルール違反が多数検出されました。
対処法としては非常に簡単で、`:key`として対象の`v-for`内で一意になるような値を設定するだけでよいのですが、今回はまとめてそれを行わなくてはいけなかったことが難点で、特に機能追加などなく長期間触っていなかったようなコンポーネントに対してこの修正をするのは、まず何を`v-for`で回しているのか、それは直接`:key`として設定出来るものなのか、出来なければ、どのプロパティがそれにあたるものなのか（key,id,etc...）を見極める作業が発生してしまい、非常に労力がかかりました。

https://eslint.vuejs.org/rules/require-v-for-key.html#vue-require-v-for-key

#### vue/valid-v-slot

`v-slot`ディレクティブに対して適切な使用法を定めるルールですが、検出数はそれほど多くはなかったものの、これもまた人力を必要とする点で労力がかかりました。

##### `template`タグ以外に対して`v-slot`を使用していた問題

`v-slot`は本来`template`タグ以外のタグに対しての使用は推奨されていないのですが、使用箇所が散見されました。
対処法としては、対象のタグを`template`タグで囲い、その`template`タグのディレクティブとして`v-slot`を記述することが必要になります。
これも前述の`vue-require-v-for-key`の問題と同じく、`template`タグで囲う範囲を見極める手作業が発生するため、手間・難易度ともに高くなりました。

##### そのほか

v-slot は挙動が複雑になりがちなこともあり、`vue/valid-v-slot`ルールのなかにもいくつも規則が存在するため、気になられた方は一度以下のリンクをチェックしてみることをおすすめします。
https://eslint.vuejs.org/rules/valid-v-slot.html

### Vue 3 にアップグレードするまで対応出来なかったルール

以下は Vue 3 によって機能追加もしくは廃止されるものに対してのルールになります。
当然準備段階ではバージョンが 2.x なので愚直にこれらのルールの通りに直しても動かないため、これらのルールは`.eslintrc.js`の`rules`プロパティにおいて`off`に指定しました。
準備として Vue 3 用の Lint ルールを先取りして適用したときにのみ発生するような状態なのでこの情報を活用するシーンはあまりないかもしれませんが、備忘としてまとめておきます。

#### vue/no-deprecated-v-bind-sync

2.x 時代に使えた`v-bind:hoge.sync="fuga"`といったシンタックスが廃止されたことを Lint するルールで、Vue 3 からは単純に`v-bind:hoge="fuga"`もしくは`:hoge="fuga"`とすることで同様の挙動となります。
https://eslint.vuejs.org/rules/no-deprecated-v-bind-sync.html

#### vue/no-deprecated-v-on-native-modifier

Vue 3 では`@keydown.enter.native="onKeydownEnter"`のように記述していた`.native`シンタックスが不要になりました。
https://eslint.vuejs.org/rules/no-deprecated-v-on-native-modifier.html

同内容の RFC を見てみるに、`v-on listeners used on a component will fallthrough and be registered as native listeners on the child component root. .native modifier is no longer needed.`とのことなので、純粋に`.native`をつけなくてもよくなった、ということのようです。
https://github.com/vuejs/rfcs/blob/master/active-rfcs/0031-attr-fallthrough.md

#### vue/no-deprecated-destroyed-lifecycle

これはコンポーネントのライフサイクルとして 2.x 時代に存在していた`beforeDestroy`や`destroyed`が廃止されたことを Lint するルールです。Vue 3 では代わりに`beforeUnmount`や`unmounted`が存在しています。
こちらの RFC はちょっと見つけられなかったのですが、以下のページ中のコードから、おそらく既に存在している`beforeMount`や`mounted`とあわせて、mount という単語に集約させたかったのではないかなと推測しました。
https://eslint.vuejs.org/rules/no-deprecated-destroyed-lifecycle.html

#### vue/no-deprecated-functional-template

Vue 2.x には functional template が存在しているかと思いますが、その廃止を Lint するルールになります。
https://eslint.vuejs.org/rules/no-deprecated-functional-template.html

以下の RFC によくまとめられていますが、JavaScript 内で`import { h } from 'vue'`など DOM を生成するための関数を使用することで同様のことを実現出来るので`functional template`を使う必要は無い、という意図のようです。
Vue 3 から使用できる（厳密には分離していますが）Composition API にも見られますが、関数に処理を閉じ込めたうえで、コンポーネントでは必要な関数を適宜インポートして使用するだけといった価値観の流れにあるルールなのかなと推察しました。
https://github.com/vuejs/rfcs/blob/master/active-rfcs/0007-functional-async-api-change.md

## まとめ

上記のものやその他のルール違反をつぶしていった結果、無事に Lint が通るようになりました！

普段の開発に忙殺されてメンテナンスがつい後手に回るようなことはよくありますが、溜まり溜まった負債を一気に解消しようとするのはやはり体力も精神力も必要と痛感したので、今後はこまめに負債と向き合う機会を意識的に設けていきたいです！

今回の対応のなかで、ここでは紹介しきれない細かな問題（Vuetify の 1 系が Vue 2.6 から導入されたスロットのシンタックスに対応しきれていないこと、などなど。。。）もあったりしたので、話を聞いてみたい方は筆者の Twitter（https://twitter.com/let_mkt）にDMいただけると嬉しいです！
また、ここがおかしいなどもあれば上記 Twitter 宛に教えていただけると有り難いです。

[宣伝]

いつもの
