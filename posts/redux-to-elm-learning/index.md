---
title: 語言界的Redux？從學習Elm到函數式編程的啟發
description: 標題是「英國的五月天 — 披頭四」的惡搞哏
date: '2016-08-18T06:31:27.826Z'
categories: []
keywords: []
layout: layouts/post.njk
---

> 標題是「英國的五月天 — 披頭四」的惡搞哏

### Preface

大概一個月前，稍微碰了[Haskell](https://www.haskell.org/)。沒有特別打算作些什麼，只是單純地為了更瞭解Functional Programming。實際上功效還蠻大的，對於JavaScript乃至Python的編程上，都開了另一片天地。

這幾天無意查到了[Elm](http://elm-lang.org/)，著實覺得這是個神奇的傢伙，學習語法、概念、照著教學實做，應該可以大概介紹一下。希望以一個前端開發者的角度，記錄初探Elm的過程以及聯想。

本篇文章大概分為兩個部份：

1.  Elm的基礎介紹、開發工具及Elm架構
2.  Functional Programming給我的啟發

不會有的：

1.  Elm基礎語法
2.  Step-by-step的實做Tutorial

由於發展不過四年，Elm的社群自然不似JavaScript或其套件們那樣蓬勃。我在網路上或官網中，找到的範例相對精緻（不要一開始就給人家看TodoMVC啦）。所以要是需要真的非常簡單的例子可以參考我自己試玩Elm的[範例github repository](https://github.com/WendellLiu/tryElm)。

### Elm的基礎介紹、開發工具及Elm架構

先從維基百科的介紹開始：

> **Elm** is a [functional programming](https://www.wikiwand.com/en/Functional_programming) language for [declaratively](https://www.wikiwand.com/en/Declarative_programming) creating [web browser](https://www.wikiwand.com/en/Web_browser "Web browser")\-based [graphical user interfaces](https://www.wikiwand.com/en/Graphical_user_interface).（Elm為一個函數式語言，以宣告式的編程來撰寫Web UI。）

Elm於2012年首度發表，並且很直接地瞄準了Web UI的領域。作為一個語言，Elm最有趣的是compile（編譯）後的結果是JavaScript，實際上也能夠直接compile成Html。

所以或許能夠粗糙的將Elm視為以純函數式語言來撰寫JavaScript。然而與眾多[_compile-to-JavaScript-language_](http://compile%20to%20JavaScript%20language)比較，Elm總歸是一獨立語言，雖然提供了一些方式來和JavsScript溝通，但肯定更加不方便。例如import JavaScript module。實際上，Elm有其獨立的開發生態體系，因此更應該先有的觀念是，別把Elm直接和CoffeeScript、TypeScript聯想在一起。

![from [http://elm-lang.org/blog/blazing-fast-html](http://elm-lang.org/blog/blazing-fast-html)](./1__oc1x0W__QO1EyYJaBQSzVtg.png)
from [http://elm-lang.org/blog/blazing-fast-html](http://elm-lang.org/blog/blazing-fast-html)

由於Elm的重點擺在編寫Web UI，講白了就是要Render Html。官網有上面這張圖，目的是和其他一樣精於此道者的效能比較。這裡也有另一份2014年時作的[效能評測](https://github.com/pygy/todomvc-perf-comparison)，以供參考。

#### 開發工具

目前Elm的生態圈裡，有幾個官方工具是需要知道的：

1.  [elm-repl](https://github.com/elm-lang/elm-repl) — Elm的即時互動式界面
2.  [elm-reactor ](https://github.com/elm-lang/elm-reactor)— 開發Elm的工具。讓開法者直接以靜態網頁的形式讀取.elm file，再即時build成html。並且提供不錯的error report界面
3.  [elm-make ](https://github.com/elm-lang/elm-make)— Elm的build tool。可以編譯成JavaScript file或Html file

方便的是，包括其core和package manager，官方提供的[Installer](http://elm-lang.org/install)就一次攢便便。

#### The Elm Architecture

大家有碰過Redux嗎？其優雅且好測試的結構令人十分著迷。實際上，Redux的結構才是受到Elm的啟發，準確地說，是受到Elm先天支援的資料流架構，**The Elm Architecture**所影響。

特別的是，並非依靠第三方套件，Elm原生就創造了這個資料流架構。由於其高維護性、易測試性以及優雅而獲得青睞。

Elm Architecture的基本結構如下：

*   Model — App State
*   Update — 唯一能夠改變State的部位
*   Message — 送進Update，讓其對Model做出開發者定義的改變
*   View — App View

如果和Redux的架構比較，Elm的Model則相當於Redux的Store、Elm的Update則是Redux Reducer的前身，而Message則對應於Action。

```elm
import Html.App as App
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

main =
  App.beginnerProgram { model = model, view = view, update = update }

-- Model
type alias Model = Int
model : Model
model = 0

-- Update

-- define message
type Msg
  = Increment
  | Decrement

update : Msg -> Model -> Model
update msg model =
  case msg of
    Increment ->
      model + 1
    Decrement ->
      model - 1

-- View
view : Model -> Html Msg
view model =
  div []
    [
    button [ onClick Increment ] [ text "+" ]
    , div [] [ text (toString model) ]
    , button [ onClick Decrement ] [text "-" ]
    ]
```

這是一個實做簡易計數器的原始碼，大致就是與Redux相同的單一狀態庫單一資料流的架構。最後再以App.beginnerProgram將其串起來成為一個完整的web app。

稍微與Redux不同的是，由於如同Haskell，Elm支援Type（型態）。因此Message就是一個Function，佐以Type Annotations（型態註解）的方式宣告Message可能的Type（Union Types），來分別不同的Message。Redux則是以Action這個物件中的type對應的字串作為分別依據。如此一來便能夠在編譯階段就能察覺到typo（雖然在實務上在Redux中我們也能先定義type string為常數來達到一樣效果）。

關於Type的基礎可以參考[官方文件](http://guide.elm-lang.org/types/)。

大致上來說，Elm原生的開發工具、流程，都算很完整。只要搞懂純粹的函數式語言的編程方式，基礎開發應該問題不大。

### Functional Programming給我的啟發

第二部份會記錄在接觸純函數式語言後，對於我在寫具函數式特性但非純函數式語言，如JavaScript的啟發。因此這段落應該不會再有Elm的程式碼，而會以JavaScript作為範例。

#### Declarative vs. Imperative

開頭的介紹即有提到，Elm是屬於Declarative programming language（宣告式語言），或說函數式語言便是屬於宣告式語言的一種。

在宣告式語言中，每步最小單位有效的程式碼都是在宣告一個值。白話的說，你永遠都是在定義變數，無論是新變數或覆寫變數。相對於Imperative Programming（指令式編程），不會有流程向的程式碼來作定義目標變數前的準備。

```elm
// Imperative
var base = [5,9,1,5,2,7,6]
var result = []

for (var i = 0; i < base.length; i++){
  var tmp
  if(base[i] > 5){
    tmp = base[i] + 10
    result.push(tmp)
  }
}

// Declarative
var base = [5,9,1,5,2,7,6]
var result = base
  .filter(function(ele){
    return ele > 5
  })
  .map(function(ele){
    return ele + 10
  })
```


上面這Demo code是將一個陣列先篩選大於5的數字，然後再將它們加上10作為結果。當然無關函數式編程，上部份的確也是能再更簡化。但為了創造一個簡化但具有指令式編程特色的案例，我刻意在迴圈中加上一個臨時性變數來突顯何謂「流程向程式碼」。大家應該能夠試著對應出平時寫程式時，真正無法再簡化、必須經過的「流程向程式碼」。

採取宣告式的目的是希望能夠根本的**減少程式碼的副作用並且讓程式碼更簡潔**。由於少了我所謂的「流程向程式碼」，過往可能會在取得目標變數以前，改變了某個scope的變數，或因此撰寫了多餘的程式碼。我引用維基百科上的一段作為這部份的總結：

> 宣告式編程是告訴電腦需要計算「什麼」而不是「如何」去計算。

#### Immutable

在函數式編程中，所有的變數在初始化後都只能被覆寫，而「不可變動」。這意味著在撰寫程式碼時，你能夠很明確的知悉所有變數目前的值，而不會不小心在某個地方，因為副作用改變了變數的值。這能夠帶來安全性的增加以及減少變數值改變的混亂。

Vanilla JavaScript 變數並非是immutable。除了強制的讓變數不可變動外（例如使用immutable.js開發），以獲得上述的好處外，實質上，我們應當將其視為一種pattern。讓自己在寫程式時盡可能不去更動變數，尤其在不同scope間，盡可能不要寫下有副作用的程式碼。

#### Function is Simple

在JavaScript中，儘管function是第一級公民（First Class Citizen）。然而可能因為過去的編程習慣，function並不被強調，因此我們往往低估了function的彈性（而高估class）。而在函數式編程，「函數」自然是最重要的核心。藉由許多pattern，如currying、closure等，讓函數就能達到我們的各式需求，並且有許多好處。

```js
var node1 = document.querySelector('.foo')
var node2 = document.querySelector('.bar')

// uncurrying
node1.appendChild(foo)
// ......
node1.appendChild(bar)
// ......
node2.appendChild(some)
// ......

// currying
function appendNode(node){
  return function(n){
    node.appendChild(n)
  }
}

var appendForNode1 = appendNode(node1)
var appendForNode2 = appendNode(node2)

appendForNode1(foo)
// ......
appendForNode1(bar)
// ......
appendForNode2(some)
// ......
```

想像這個例子：目的是在接下來的程式碼中，能夠明確、有效率的在兩個已知的HTML Element中加入新的element。

將函數currying除了能夠避免重複的程式碼外，在維護性、擴充性上也更加良好。並且每次的動作都非常明確且安全。想像如果已知有第三個HTML Element — _node3_，若有個typo是_node3.appendChild(someNode)_，在運行上並不會出現錯誤，卻造成意想不到的結果。然而如果基於上述的寫法，由於沒有定義_appendForNode3_的函數，發生typo則會跳錯。某些意義上也是一種權限的概念。

物件導向編程當然也能夠很良好的處理上述的案例，不過物件導向在大部分的時候只是讓事情變得過度複雜。能夠簡單作的，何不就簡單呢？

> 函數式編程本身還有許多優點，而我這部份僅是以如何讓混合式（Hybrid）語言的撰寫上，從指令式語言的習慣作一些有意義的改善。若要強調函數式和物件導向的差異，可以參考[這篇](https://medium.com/@cscalfani/goodbye-object-oriented-programming-a59cda4c0e53#.h11qb3tpn)（謝謝碼天狗的推薦）。

### 後記

事實上，一開始我只覺得用一個純函數式語言寫web UI根本是在惡搞人，但在習慣後確實能夠寫得很簡捷（當然也托The Elm Architecture的福）。

然而無論接下來會不會試著用Elm作些什麼，其所帶來的啟發已是很不賴的。除了寫其他語言的影響外，若以開發函式庫的角度來說，純函數式語言也能夠讓你對模組化又多一層想像。

總之是持續關注Elm的發展。
