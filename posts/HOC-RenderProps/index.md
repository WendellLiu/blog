---
title: HOC 與RenderProps，談我從她們身上學到什麼
description: 前言
date: '2018-12-03T02:36:13.091Z'
categories: [tech]
tags: [ReactJS, HOC]
layout: layouts/post.njk
---

![Focus on your tools (Photo by [Fleur Treurniet](https://unsplash.com/photos/dQf7RZhMOJU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/tools?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText))](./tools.jpeg)

### 前言

這陣子同事在討論HOC 與Render Props ，令我想起年初時閱讀了陳榮華老師的 _《海德格 〈存有與時間〉闡釋》_。其中海德格將周遭之物分為及手之物（Ready-to-hand）以及手前之物（Present-at-hand），用以區別面對他者的態度。前者視他者為工具，以使用作為其接觸的方式；後者則是將他者置於眼前，突兀地研究其原理、內涵。

作為一個開發者，大多時候我們僅將一些開發模式（pattern）視為及手之物，也就是工具；而鮮少將其視為手前之物來研究。先撇開海德格的方法論吧，作為工程師，如果少了研究的過程，或許錯失一些向前人學習的機會，並且忽略其本質而誤用（或濫用）。

因此我決定寫下我自己對於HOC 與Render Props 這兩個在React 開發上，常見的Code Reuse 模式。

本篇文章試圖包含：

*   介紹React Code Reuse 的過往歷史
*   分別說明這兩者的使用
*   我怎麼思考她們、具體來說她們分別關注什麼，以及可以從中獲得什麼

可能不包含：

*   許多的使用案例
*   優劣的比較
*   效能向的建議

### Code Reuse

程式碼的再利用一向是所有工程師所關注的問題，有效的再利用能夠減少程式碼的數量，並且讓可維護性提高。也因此，無論在何種領域的軟體社群中，提出程式碼再利用的模式是極常見的。React 社群自然不落人後。

#### Mixins

在利用 `React.createClass` 創建一個component 的古早時期，開發者多半僅能憑藉 mixin  來做到功能上的組合。範例如下，概念上是property merging 。因此當不同mixin 的property name 衝突時，會獲得警告一支，也就體現了其限制。更多資訊可參考 [Mixins Considered Harmful](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html) 這篇文章。

```js
// mixin example
var mixinDefaultProps = function(foo) {
 return {
     getDefaultProps: function() {
         return {foo: foo}
     }
 }
}

var DivComponent = React.createClass({
    mixins: \[mixinDefaultProps('bar')\],
    render: function(){
        return <div>{this.props.foo}</div>
    }
});

var H1Component = React.createClass({
    mixins: \[mixinDefaultProps('zelta'))\],
    render: function(){
        return <h1>{this.props.foo}</h1>
    }
});
```

#### Classes

接下來的前端圈開始了大ES6 時代，亦稱2015 年所批准ECMAScript standard 。此一版本中讓javascript 開始可使用class 這個保留字作為prototype-based object的創建語法糖。讓深受OOP 影響（荼毒）的一眾能夠在javascript 實現熟悉最對味的繼承、創建子、實例等模式。詳細的介紹請參考這份[Babel 文件](https://babeljs.io/docs/en/learn/#classes)。

React 自然不會放過這個機會，藉由class 語法取代原本 `React.createClass` 的元件創造，使程式碼更加清晰。method、static method、constructor 等用法則讓component 看起來更像一個純粹的javascript 內容。

而React Class Component 並不支援mixin ，但當然，你知道的，在class 繼承是可以的，因此同樣能夠依循 **mixins** 模式達到程式碼再利用。

Extend Custom Class Component

由於Class Extending 依舊屬於property merging ，因此仍稱不上太大的突破。實際上，在慢慢淘汰 `React.createClass` 的這個時期，React 社群便已經開始推廣HOC 的概念，所以倒是沒真的看過多少Class Extending 的實際應用。

好的，讓我們進入正題吧，談談現今常被提出的兩種Code Reuse Pattern。

### 所謂現代的Code Reuse in React

#### HOC(Higher-Order Component)

本篇不是什麼硬底子文章，所以我們直接看code 吧。

HOC for everything

在這裡我做了五件事：

1.  定義一個UI 型元件**Page**，將props 的資料簡單的轉成UI
2.  定義一個HOC — **numberAddOne** ，目的是將 `props.number` 數值加一
3.  定義一個HOC — **greetingWithName**，目的是將 `props.greeting` 加上一個自定義的名字
4.  定義一個HOC — **addATitle**，目的是無論何種UI ，都給我加上一個h1 title
5.  把上面這些HOC 一一套用在**Page** 上成為最終被使用的**App**

HOC ，High-Order Component ，中文可以譯為「高階元件」，又或者很俗氣地稱呼她為「元件改造產生器」。總之，就是可以一個**可組合、覆寫、編輯上層資料與UI ，成為一個新元件的函式**。

螢幕前的你看完上面程式碼可能會想一拳[㧌（mau）](https://www.moedict.tw/%27%E3%A7%8C)上來，對我破口罵「何不把這些HOC 參在一起做成一個HOC 雜燴」。實際上真要這樣做的確可行，這個範例中的多層的HOC 也是增加了[Call stack](https://en.wikipedia.org/wiki/Call_stack) size，至少在「效能，一點都不能少」的共識下，確實有其疑慮。

一來前頭已經打過預防針，本篇不涉及效能問題；二來，於我而言，比起效能，更重要的是元素的純淨性，所以我會傾向將每種 **「概念」** 分別置入不同的HOC ，如此更能讓未來的維護者在不細看程式碼的前提下，一目了然此完成體是被賦予哪些責任。

若開發者害怕

`const App = addATitle(greetingWithName(‘Hello')(numberAddOne(Page)))`

這種嚇人不好讀程式碼出現，可以善用各大工具庫（e.g. ramda, recompose, lodash, etc.）所提供的 `compose` 函數來組合，範例如下：

```js
import { compose } from 'recompose';

const hoc = compose(
  `addATitle,
  greetingWithName(‘Hello'),
  numberAddOne,
);`

const App = hoc(Page);
```

誠如上面所說，多層HOC 不是沒有效能疑慮，所以在效能與維護性上，端看各位的取捨。

另外，若能善用curry、closure 等技巧，也可以將上層情境的資料也乾淨地放入下層元件，有助於寫出更加純淨的元件。例如上頭的 `greetingWithName`，在創建時便能從最上層的scope 傳入打招呼的內容，而後再與name 來組合成最後呈現的結果。這裏讓我趁機打一下舊文[《純粹的好，Pure Function 知道》](https://medium.com/frochu/%E7%B4%94%E7%B2%B9%E7%9A%84%E5%A5%BD-pure-function-%E7%9F%A5%E9%81%93-574d5c0d7819)。

最經典的HOC 第三方套件是[Recompose](https://github.com/acdlite/recompose) ，裡頭有許多HOC 以及HOC Utilities ，例如將React Component 的state 創建與lifecycle 都包裹成HOC ，運用得宜，程式碼幾乎剩下HOC 與純UI 的Functional Component。不過隨著前陣子React Hooks 的問世，本人也在React Team 的原作者也[宣布會停止積極維護Recompose](https://github.com/acdlite/recompose#a-note-from-the-author-acdlite-oct-25-2018) 。

#### Render Props

Render Props 並不是一門新的技術，甚至不能算是一種新的模式，原因先看完以下的範例碼再行說明。

Render Props to share code

在這裡我做了四件事：

1.  定義一個Layout UI Component **CenterBlock**，作用是將**props.render** 函數所產生出的Component 以一個會直排、置中的wrapper 包覆，並且該wrapper 會由**props.backgroundColor** 決定整個**CenterBlock** 的background color
2.  在**App** 中，定義一個class method 是**renderBlock1** ，作用是 產生一個h1, h2 組合而成的UI
3.  在App 的render 中，使用**CenterBlock** ，props.render 為上述定義的**renderBlock1** ，並且給予props.backgroundColor 一個指定的顏色
4.  在App 的render 中，使用CenterBlock ，props.render 為一個inline function，產生一個由p、ul 所組合而成的UI ，並且給予props.backgroundColor 一個指定的顏色

大致看來，Render Props 是**一個函數，描述了一段UI ，並且具備可以直接從其他情境的Component 中取得資料的能力**（上述例子中，任何作為render 的函數皆有途徑可從**CenterBlock** 取得資料）。

Render Props 的範例中，可以發現，這幾乎就是children 的使用方式。當然，傳統上，由於JSX 的方便性，我們會傾向在children 給予一個Element 而不是Component （關於Element 與Component 的名詞定義可以參考[這篇](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)，你也可以參考我底下的備註 \*1）。也因此，本段的開頭才寫道Render Props 並非一個新的模式，只是在約2017年底才開始以「Code Reuse 模式」的定位受推廣。（2017 年底是謹以我的印象與約略查到的推廣文章發表時間論定，有其他更合適的答案也麻煩告訴我）

運用Render Props 的範例不少。早期版本的React Router 已有render 這個props 提供開發者簡潔地指定Matched Route 會呈現的View 。而React Apollo v2.1 也公開了Render Props 的API ，讓開發者直接在 `<Query>` 與 `<Mutation>` 的children 傳入Render Props Function ，以取得query 與mutation 的方法與資料，讀者可參考此[連結](https://blog.apollographql.com/introducing-react-apollo-2-1-c837cc23d926)。

除了第三方套件的應用外，React Core 本身在新版的Context API 也巧妙地運用了Render Props 。新版的Context API 中，開發者必須先利用 `React.createContext` 創建出兩個實例，分別為Provider 與Consumer 。Provider 的功用是提供context value ，而Consumer 顧名思義是讓開發者**使用**context value 。其中Consumer 的使用上，開發者必須以 `ContextValue -> ReactElement` 這樣的Render Props Function 來承接context value 。

### 殊途同歸

除了這幾年提及函數二字就會顯得很潮以外，在以上的內容中，函數這個詞不斷地出現，乃因無論是HOC 或是Render Props ，此二模式基本是建立於單一個十足簡單的函數之上，並沒有什麼魔法。所謂簡單的定義是隨人而定，本文想表達的簡單，乃是以**「開發者多有可能寫出最簡單的程式碼，以達到目的」**的標準下的簡單。換言之，開發者不需熟記各式特定API ，甚至不需要了解複雜的繼承系統（或說extends ，亦或説prototype），這是本文所謂的簡單。

在此基礎下，我認為HOC 與Render Props 是殊途同歸的，也就是**更多元的函數利用**。

### 如何看待

一如本文開頭時所說，在使用上，HOC 與Render Props 是殊途同歸的，開發者僅需熟知接口的位置以及使用的範本，並且傳入富含商業邏輯或UI 的函數即可。然而，我打算閒閒無代誌，以我自己的使用方式作為研究對象，將這兩者托於手上端詳，探尋可能無用的觀點。

#### HOC

首先，HOC 本質就是Functional Programming 裡必提及的HOF（High-Order Function）。這裡給一個HOF 的範例碼，complexMath 會接收一個filter function ，並且再接收一個整數，最後以filter function 篩選每一位的數字，並且重新組成新的整數。呃，我知道flow 的primitive types 建立在javascript 之上所以沒有`Nat` （自然數），但我懶得處理負數與小數點，所以就讓我偷懶限制在自然數吧 😏 。範例碼如下：

```js
// @flow
type ComplexMath = (filterNat: `Nat` => boolean) => (n: `Nat`) => `Nat`

const complexMath: ComplexMath = filterNat => n => {
  const result = n.toString().split('').filter(filterNat).join('');
  return Number(result);
};

const fn = complexMath(n => n > 5);
expect(fn(6125499)).to.equal(699) // pass!
```

本例中complexMath 是為一個HOF ，HOF 的廣義定義為「至少接收一個函數，或者回傳一函數的函數」，你也可以參考[維基百科](https://www.wikiwand.com/en/Higher-order_function)。觀察上面這段範例碼，若把 `n` 與 `Number(result)`都視為React Component ，那也就是一個HOC 了。

起初的React 設計哲學裡便強調了，React 所做的事可用 `F(state) => UI` 來概括，這裡的state 是廣義下任何描述UI 的狀態資料，意即UI 可以一組函數來表示。在這個脈絡底下，我認為HOC 再一次強化了此概念，也就是 **「元件即函數」**。

以我自己的使用習慣，由於HOC 本身即為一函數，因此極合適於建造處理資料的pipe line ，將每一個資料的組合、計算合理地切分在每一個HOC 。再藉由compose 函數，讓開發者不需要參雜UI 邏輯，組合成純純正正、正正當當的一條資料向的管線。而位於管線最下游的React Component ，僅需專注於描述**依據props 所應當呈現的View** 即可。

#### Render Props

上頭HOC 的內容提到，React 所做的事可以**F(state) = UI** 概括，而Render Props 在這裡則是一個**動態**的state ，我喜歡用 **「function in config」** 來代表她的角色。Render Props 有效地讓開發者在開發過程中獨立出Parent Component 處理資料以及產生UI 的邏輯。而換句話說也就是讓各類處理資料、side effect 的Component 可更簡潔地被再利用。

動態是一把兩面刃，我認為Render Props 是一個彈性導向的模式，好處是可讓開發者快速、具彈性地再利用很多邏輯，甚至可以直接以inline function 在props 直接寫出render 的結果。然而開發者必須自律地不寫出過度繁複流程、產生過多層次React Element 的函數，才能確保程式碼複雜度不隨著Render Props 的使用而提高。

另外，由於Render Props Function 在執行完後是很直白地回傳一組React Element 。因此相較於HOC，Render Props 並不會導致vDOM tree多一層，雖然function call stack 並沒有隨之減少，但減少vDOM tree的高度於對React Core 的處理是有利無害的。

### 結

總結本文的內容：

1.  HOC 活用了元件即函數 — **F(state) = UI** 的概念
2.  HOC 適合打造data pipeline
3.  Render Props 獨立了資料與UI 邏輯
4.  Render Props 能減少vDOM tree的高度，並且有彈性地以inline function 開發

資訊的圈子時時有新鮮事，站在前線的工程師是最容易忘記停下腳步、定睛於手中工具的族群。然而我認為這樣的研究過程有助於梳理對工具的運用時機、限制、抽象以及延伸，甚至對於未來開發內部使用的函式庫，甚至是開放的第三方套件品質，皆有助益。我們不只是開發者，也應該是個研究者與創造者。

> Man cannot be free if he does not know that he is subject to necessity, because his freedom is always won in his never wholly successful attempts to liberate himself from necessity. (The Human Condition)

### 🐝工商🐝

[**honestbee career - _Join our big exciting family_**
Join our big exciting familycareers.honestbee.com](https://careers.honestbee.com/ "https://careers.honestbee.com/")[](https://careers.honestbee.com/)

honestbee 🐝正在招募前端工程師，也就是我的同事。若你讀到這，也感到有興趣，歡迎參考這個[連結](https://careers.honestbee.com/departments/job/?gh_jid=1431558) ，或是來信 [cuk.bas@gmail.com](mailto:cuk.bas@gmail.com) 我可以幫忙轉介。

### 備註與其他參考

*   \*1 簡單說來，Element 是一個Plain Object ，描述著使用哪些Component ，以及其參數（props），也就是開發者寫成JSX 形式所會被編譯出的樣子；而Component 則是一個以資料為進、UI 為出的函數。
*   Mixins Are Dead. Long Live Composition([Dan Abramov](https://medium.com/@dan_abramov?source=post_header_lockup)) — [https://medium.com/@dan\_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750)
*   When to NOT use Render Props ([Kent C. Dodds](https://blog.kentcdodds.com/@kentcdodds?source=post_header_lockup)) — [https://blog.kentcdodds.com/when-to-not-use-render-props-5397bbeff746](https://blog.kentcdodds.com/when-to-not-use-render-props-5397bbeff746)
