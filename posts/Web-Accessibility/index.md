---
title: 回歸初心，一探Web Accessibility
description: 警告：不是在談WebAssembly，被騙進來的先說聲抱歉了（但仍然可以意思意思給一個clap）。
date: '2017-11-30T03:17:12.579Z'
categories: []
keywords: []
layout: layouts/post.njk
---

![Oscar Pistorius](./oscar_pistorius.jpeg)
Oscar Pistorius

> 警告：不是在談WebAssembly，被騙進來的先說聲抱歉了（但仍然可以意思意思給一個clap）。

> 此篇是在我上完Udacity [ud891](https://classroom.udacity.com/courses/ud891) 課程後所整理的文章，不知道有什麼智財權的問題，先在此聲明。

Web Accessibility，在漢文世界，有人稱之為「網頁可訪性」，也有「網頁親和力」的譯法。何謂Web Accessibility ，引用W3C — WAI 的[定義](https://www.w3.org/WAI/intro/accessibility.php)：

> Web accessibility means that people with disabilities can use the Web.

網頁可訪性是指讓身心障礙者能夠使用該網頁服務的程度，亦即身心障礙者**多_容易_**使用你的服務。所有身心障礙者中，就網頁服務，視障者（包含視野有限、弱視、全盲以及色盲等）是最被聚焦的族群，因此多數Web Accessibility 的討論都會以視障者的角度為優先，而本篇內容也多琢磨於視障者。

### tl;dr

1.  不要想著使用者缺乏什麼，想著使用者以什麼方式造訪
2.  使用html5 語意化標籤，或使用 `role` 、 `aria-*`
3.  思考Web Accessibility 也是重新思考UI 元件的方式

### 為什麼我

我是一個前端工程師，職責是讓系統、設計師與使用者三方有更緊密的連結。從最基礎的功能性介面開始，一直到更友善、美觀的進階設計。對於進階的設計，HTML、CSS 原生能支援的程度有限，故前端工程師時常會使用各種奇技淫巧實作元件。

過程中，很可能會將焦點集中在如何讓「功能完備」的使用者操作更加順暢，而對於有所不便利的使用者，則可能無意中犧牲其使用體驗。

根據衛生福利部統計處的[_資料_](https://dep.mohw.gov.tw/DOS/cp-1745-3328-113.html)，2016 年全台灣有57291 位視障者，當我們用心於效能與使用者體驗，然而光就這五萬多人，我們的網站能讓他們操作嗎？因此我認為對於一個已稍微熟悉前端開發的工程師，開始讓更多人能夠使用我們的服務，以達成身為工程師的社會責任，研究Web Accessibility 乃十足重要的事。

> “The principles of justice are chosen behind a veil of ignorance.” — John Rawls

### 正題

接下來我會先介紹最常見並且與本篇相關的輔具，接下來便依循[ud891](https://classroom.udacity.com/courses/ud891) 的順序，由Focus、Semantic HTML、Navigating Content、ARIA 、Styles ，分為五個項目撰寫。

正式進入上述內容前，Web Accessibility 的思考上，我建議大家，與其想著訪客缺少什麼，例如失去完整視力、手部操作能力等，或許不妨往訪客是以 **_何種形式造訪_** 我們的服務，可更容易察覺網站的不足之處。例如視障者可被純化為「鍵盤使用者」、「聽覺使用者」，而手部操作能力缺乏者，則通常屬於「聲控使用者」、「純手指使用者」，以這些作為思考的進入點。

#### Assistive Technology

操作一個網頁時，最廣泛使用的輔具為Screen Reader 以及Keyboard。

Screen Reader 為螢幕閱讀器，功能是將文字、圖片及軟體介面以聲音閱讀出來。從軟體本身、瀏覽器乃至作業系統都有可能內建Screen Reader ，例如最知名的Mac OS VoiceOver 是作業系統內建的Screen Reader 。

另一個輔具則是Keyboard ，對的，就是指螢幕前的那盤。由於滑鼠是一種講求高度手眼協調的工具，對於視障者並不是非常友善。因此就視障者的使用，除輸入的功能外，鍵盤還扮演著指引操作的角色。

#### Focus

Focus 是指在瀏覽器上，代表此刻瀏覽器聚焦在哪個元件的狀態，藉由此狀態，讓使用者知道此刻正在操作的元件，開發者亦常利用Focus 引導使用者的目光。

瀏覽器同時只能Focus 於一個元件上，這個特性在Screen Reader 上是十分重要，畢竟我們不會希望同時聽到針對兩個Focus 元件的描述，如此是徒增使用者的困難。上面介紹輔具時有提及，鍵盤扮演指引操作的功用，現在更詳盡地說，是使用者利用鍵盤在不同元件中移動Focus 點，以確認接下來的操作是在生效於哪個元件。

開發者與設計師必須注意元件是否有與Focus 相對應的樣式變化。想像一個只能使用鍵盤的使用者，通常是手腕活動不便，甚至是完全失去手部功能，僅得利用其他部位操作的使用者；在他的使用過程中，若缺乏樣式的變化，使用者便無法得知哪個是當下的Focus 點。實際上，瀏覽器預設都會有Focus 的樣式，大部分實際案例是開發者將其變化取消，這是個不友善的模式。

元件間的Focus 軌跡是一條單方向的路線，會遵循固定的順序向前向後。順序是照HTML 文本上DOM 的順序，也因此，在建議上，開發者應盡可能讓希望呈現的順序與HTML DOM 的順序相同。

儘管開發者是有能力讓每個元件都是Focusable （tabindex），然而需要注意的是，只有互動式元件需要被Focus 。相對於互動式元件是內容式元件，文字內容、圖片內容，這些則不需要能夠被Focus ，Screen Reader 有其他方式提供使用者閱讀。然而有一個例外，在切換頁面時，開發者可以刻意一次性地聚焦在適當的標題上，讓使用者更清楚新頁面的重點。

最後一個需要注意的開發要點，必須避免產生Key Trap ，也就是不要讓使用者在切換Focus 點時，卡在一個範圍無法脫逃，這會造成使用者繼續使用的困難。然而也是有個例外是Modal ，建議上反而希望開發者能讓Modal 開啟時，製造一個Key Trap 於Modal 的內部範圍，讓鍵盤使用者不會進入不相干的元件進而產生混肴。

#### Semantic HTML

HTML 是一個敘述網頁內容的標示性語言，其完整呈現網頁的外觀。然而為了彈性以及方便，HTML 本身的限制與瀏覽器對HTML 解析的方式，都具高度的寬容性。HTML Tag 的使用通常是沒有侷限的，所以會出現「一個div 打天下」的現象。此模式對於視覺正常的使用者是沒有差異的，然而對於仰賴Screen Reader 的使用者則相當不友善。Semantic HTML （語意化的HTML）就是為了讓元件準確地被Screen Reader 解析。

語意化的元件在實作上有兩個方面，一個是HTML Tag 的使用，另一個則是HTML Tag 所連帶的屬性。

正確選用HTML Tag 是指元件為輸入則使用 `<input>` 、標題則用 `<h1>` `<h2>` 等。如此Screen Reader 才能夠解構HTML ，以達到更進一步的整理與導向。

第二點，語意化的元件通常包含下列四種屬性：

1.  Role： 元件屬於哪種類型（如按鈕、下拉選單等）
2.  Name(Label)：通常是input 元件，意即是哪個資料項目的輸入元件
3.  State：元件當下的狀態（如展開、收合等）
4.  Value：通常是input 元件，意即此輸入此刻所代表的值

盡可能地給予這四種屬性，讓Screen Reader 能夠朗讀出更完整的資訊。

另外除了這四種屬性， `alt` 也是非常重要的，常用在圖片（ `<img>`）或影片（ `<video>`）上，提供一段對於該媒體的敘述，讓無法順利觀看的使用者，也能夠得知大略的資訊。不過有個例外，裝飾性的圖片，如icon ，就資訊的精煉化角度是無意義的，給予一個空的 `alt` 即可。

關於Screen Reader 朗讀資訊的方式、效果可以參考ud891 所提供的[範例](http://udacity.github.io/ud891/lesson3-semantics-built-in/16-labelling-input-elements/solution2/index.html) 或使用Chrome 安裝擴充套件[ChromeVox](https://chrome.google.com/webstore/detail/chromevox/kgejglhpjiefppelpmljglcjbhoiplfn?hl=zh-TW) ，若你使用Mac ，也可直接開啟VoiceOver 。經過親身體驗後，相信開發者應更能體會，若使用者只接收到少量元件資訊，或冗贅資訊的不便利。

#### Navigating Content

除了使用鍵盤前後地巡迴元件，Screen Reader 也提供集結（aggregate）的功能，讓使用者更容易在網頁上穿梭。

舉例來說，Screen Reader 能集結各大小標題、連結，讓使用者可一次獲知此頁面有哪些重要標題與連結。稍微想像一下，對使用者來說，比較快速的閱讀體驗應該是先知道大標、小標再來則是內容，否則當網頁內容太多太繁複時，只用單一線性路徑的方式瀏覽，不但沒效率，並且容易在過程中失去方向。除此之外，Screen Reader 也能夠整理該頁面的連結，讓使用者來去自如。

如何讓自己的程式碼與Screen Reader 或其他輔具合作無間？開發者最基本所需要做的是盡可能選用貼近內涵的HTML Tag 。

首先，大小標題選用適當的 `<h1>` 、 `<h2>` 等標題。請注意，開發者應依照標題在整體網頁的定位作為選用標題等級的依據，**_而非設計上的字體大小_**。換言之，假設設計需求是將某意義極微的文案放大，也不能因此使用 `<h1>` 等大標題，而是直接以CSS 實作字體放大，

再來是善用 `<header>` 、 `<main>` 、 `<footer>` 、 `<section>` 等區塊排版類別的Tag ，儘管這些Tag 通常與 `<div>` 的表現並無異，但對輔具而言，更能明確地解析我們的頁面結構。

最後，很重要卻也是容易讓現代開發者忽略的是正確使用 `<a>` 。現今**_Single Page App_** 當道，很多時候是JavaScript 寫到底，當跳轉頁面時，有時會直覺聯想到 `history.pushState` 的方式，也因此一些連結式的元件會出現 `onclick` 與 `pushState` 搭配的模式。然而這樣的元件就功能上能夠達到一樣的結果，但對輔具，是無法順利解析成「連結」，也就不可能再進一步提供使用者經整理的資訊。

順道一提，與輔具無關，使用 `<a>` 的寫法也才可讓使用者自由選擇開啟頁面的方式（如chrome in Mac OS的cmd + mouse click 是分頁），這也是個更友善的改進。

#### ARIA

ARIA 更完整寫為WAI-ARIA ，全稱是 **_Web Accessibility Initiative — Accessibility Rich Internet Applications_** **_（網頁可訪性倡議 — 無障礙網頁應用）_**。

有寫過HTML 的開發者應都看過HTML Tag 有群attribute 是屬 `aria-*` 的形式，這些是與無障礙實作相關的attributes ，所以實際上本小節並不是針對上述倡議的內容作介紹，而是以實用面的 `aria-*` 作為進入點描述起。

如果說DOM 是描述視覺所及的架構，那以無障礙角度所能獲得的網頁架構資訊就是Accessibility Tree ，而這兩者的差異便是 `aria-*` 與 `role` 的使用。可粗略化為以下關係：

> DOM + ARIA = Accessibility Tree

實際上，在HTML5 以後，瀏覽器已大量支援許多具無障礙特性的語意化HTML Tag ，詳情可見上頭的Semantic HTML 小章。然而很多不得已的時刻，開發者必須客製UI 元件，例如用 `<span>`實作button ，或 `<div>` 實作navbar ，此時就可拓善地使用 `aria-*` 與 `role` 讓客製化元件進入Accessibility Tree的範圍。

首先介紹 `role` ，它就是上面Semantic HTML 中提到的構築語意化元件其中一種需要的屬性；可將它視為ARIA 層面的高階屬性，其值有button、checkbox、navigation 等。賦予DOM `role` 等同於宣告此DOM 的角色，此舉會順勢綁定許多 `aria-*` 屬性的可使用性。關於各種 `role`的spec 可以參閱[w3c 的介紹](https://www.w3.org/TR/wai-aria-1.1/#role_definitions) ，包括此角色的superclass 與subclass ，以及該角色繼承到的state 與properties ，最後則是角色必須滿足的state 與properties 。

這裡我們以[checkbox 的spec](https://www.w3.org/TR/wai-aria-1.1/#checkbox) 為例子：checkbox 繼承了input ，其subclass 為menuitemcheckbox 與switch 。有不少可以使用的狀態、屬性，而必填的狀態則為 `aria-checked` 。

``` html/2/2
<input type="checkbox" id="subscribeNews" name="subscribe" checked >
<label for="subscribeNews">Subscribe to newsletter?</label>
```

``` html/2/2
<span role="checkbox" aria-checked="true" tabindex="0" id="checkbox"></span>
```

這段程式碼的上半部是一個正規checkbox，而下半部則是依據checkbox 的spec 所實作的客製化checkbox 。如此一來，不單外表、資料傳遞像是checkbox ，在Accessibility Tree 它也是個正港checkbox 。

`aria-*` 的屬性百百種，有分為狀態與屬性兩種類別，例如上面提到的 `aria-checked` 屬狀態類，表達該元件在Accessibility Tree上是否為checked 。接下來會以一些範例說明使用 `aria-*` 的重要性。

`aria-label` 與 `aria-labelledby` 提供開發者標示出custom input 的label ， `aria-label` 是直接給予label 值，而 `aria-labelledby` 則是給予欲作為label 的文字元件的 `id` 。當然若以最基本的 id-label tag 的組合也是有用的。

一個含有長清單widget 的使用，對於使用Screen Reader 與Keyboard 的使用者將是一大挑戰。若能給予母元件 `aria-activedescendant` 值某一子元件的 `id` 可讓Screen Reader 使用者知悉目前哪一個元件是active 。而相同的情境，在每個子元件都給定 `aria-setsize` ，等同於讓使用者在巡繞每個子元件時，都能夠再一次被提醒總和含多少子元件。

由於最佳的聽覺訊息傳遞體驗應是一次一則訊息，但頁面上的資訊往往會是持續被更新的，因此需要斟酌何謂真正必要的資訊，避免影響使用者的接收。`aria-relevant` 與 `aria-live` 就是影響Screen Reader如何提醒使用者網頁內容有改動的屬性。

`aria-relevant` 是指 **_哪些類型的內容_** 更動時，使用者會被提醒，其值有additions, removals, text, all 等。而 `aria-live` 則是指訊息與訊息間，先後被朗讀出的時機，例如assertive 是指每當有待傳訊息，會馬上被朗讀，打斷當下的朗讀；而polite 則是在當下的訊息結束後，接續著被朗讀出。

最後要談的是「消失」，要讓一個元件在Accessibility Tree 上消失有四種方式：

1.  display: none
2.  visibility: hidden
3.  hidden （input）
4.  aria-hidden=”true”

前三者會讓元件在視覺畫面也一併消失，而第四個則是沒有影響視覺表現，僅僅在Accessibility Tree 上隱藏。可能會使用到 `aria-hidden` 的情境是當元件的消失是來自於 **_位置_** 。 簡單的例子是利用 `position` 將元件移至畫面外，或元件是被動地被擠出畫面。位置消失的實作方式會讓輔具的使用者獲得商業邏輯上，不預期出現的元件資訊，此案例中在元件上加入 `aria-hidden` ，能讓元件消失於Accessibility Tree ，讓輔具的使用者也跟上產品的商業邏輯。

ARIA 讓所以元件都有機會成為無障礙元件，開發時可先從 `role` 的取用開始思考，再來補足規範上必要的 `aria-*` ，會是較有效率的開發流程。

#### Styles

元件的視覺樣式也是影響頁面Web Accessibility 的因素，主要針對的是色彩辨識能力缺乏者。

網頁中，內容間的顏色對比度，必須超過一定的數值。依據W3C 的[規範](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html)，網頁內容的顏色對比必須超過4.5 : 1 ，而規範也列舉了一些例外的使用情境。

好啦，數字拿出來是裝模作樣的，畢竟我也手算不出來顏色間的對比度，開發者與設計師可藉由[Color Contrast Checker](https://webaim.org/resources/contrastchecker/) 獲得顏色對比度，也許讀者可以試著藉此審視手邊的專案。

過低的顏色對比會影響色弱者對網頁的閱讀順暢度，而造訪者也可能是色盲，因此，也需要注意的是盡可能不要讓網頁資訊僅由**「顏色」**表現。例如表單的驗證，最常見的設計是使用紅色的文字或邊框提醒使用者，該欄位不合法，而更精進的設計方式是在顏色以外，也加上文字訊息，讓色盲者亦能知悉已填寫的欄位有不合法的情形，甚至佐以 `aria-*` 提供視力不全者更直接的提示。

### 之後呢

除了以上傳統定義的無障礙規範，我認為可能也是關於Web Accessibility 的關鍵字有國際化與在地化（i18n） 、 響應式設計（RWD） 、 漸進式網頁應用程式（PWA）。在一些情境下，這三者都會導致使用者 **_完全無法_** 使用服務，例如語言不通、小螢幕裝置或效能較低階的硬體設備，因此在設計產品時也應當將這三點納為計畫。

回到標題的「回歸初心」，過往自己對UI 元件的理解只停留在「直覺」、「似懂非懂」的階段：checkbox 就是打勾與Boolean 、dropdown 就是許多待選的列表。然而修習[ud891](https://classroom.udacity.com/courses/ud891) 的過程，使我重新審思一個UI 元件的構成，需要包含什麼狀態屬性、需要相互配合的元件、該元件是為了什麼資料項目、結構而被設計、元件的進階或原型又是哪類元件。

儘管是人道主義聲聲催喊著我接觸Web Accessibility ，但對於無多餘心力優化的開發者，我依然鼓勵最起碼地理解Web Accessibility ，促使自己更有條理地理解元件的根本性質，而僅剩下故事性的描述。

最後我想分享一段甘地的文字：

> My idea of society is that while we are born equal, meaning that we have a right to equal opportunities, all have not the same capacity.

> 我的理想社會是，人生而平等，意指我們擁有，能取得相同機會的權力；然而，彼此卻有著不同的能力。

如果你讀到這，覺得有些收穫，讓你更能體會受限於自身障礙而無法順利使用網路服務使用者的心境，歡迎你給我幾百個claps 👏👏👏👏👏
