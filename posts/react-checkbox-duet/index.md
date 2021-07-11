---
title: React Checkbox Duet的一些小事
description: 'Github Repository先上： https://github.com/WendellLiu/react-checkbox-duet'
date: '2016-07-26T07:25:07.444Z'
categories: []
keywords: []
layout: layouts/post.njk
---

Github Repository先上： [https://github.com/WendellLiu/react-checkbox-duet](https://github.com/WendellLiu/react-checkbox-duet)

最近又開源了一個React Component，React Checkbox Duet。因其可適用於兩不同情境，並且是兩個基礎component的搭配，故取名為Duet（二重奏）

![Freddie Mercury and David Bowie — Under Pressure](./1__p8i35MjmZng5FMQSqTeylA.jpeg)
Freddie Mercury and David Bowie — Under Pressure

簡而言之是一個React化的Checkbox，本篇是希望能夠寫一些和其他類似專案的比較和他們帶來的啟發。

#### 巨人們的肩膀

事情的起源是，在製作另一個待完成應用中的表單時，用到了幾種input，text、radio、checkbox等等。既然是使用React了，若有已經包裝好的component直接引用是十分合理的。不過在github上找尋checkbox的資源時，發現有一些不太合用，或說，可以再更直觀一點。

實際上在github上輸入關鍵字「React checkbox」的結果原本就不多，並且與其他各式component化的input元件比起來（例如text），可搜尋到的專案星星都相對算少。以下方幾個專案來說明：

1.  [instructure-react/react-toggle](https://github.com/instructure-react/react-toggle)
    這個專案是單一checkbox在**二元**上的應用，並且搭配其美美的style
2.  [luqin/react-icheck](https://github.com/luqin/react-icheck)
    作者的野心蠻大的，除了checkbox的應用也包含radio。也可讓使用者引用他的寫好的style，並且在component的property也許多關於外型的選項。甚至還支援mobile，應該是有針對mobile的event作測試吧。另外與上一個相同，原生的資料處理模式也是單一checkbox在二元上的應用為主
3.  [ziad-saab/react-checkbox-group](https://github.com/ziad-saab/react-checkbox-group)
    最後這一個，我在作[Nutrika](https://github.com/WendellLiu/Nutrika)的時候也有用到。與其他專案不同的是，此專案主打的是**多選**的checkbox群組，因此在資料傳遞上，你綁入的_onChange_可**直接獲得整個群組目前被勾選的項目**。另外，這個專案受到[chenglou/react-radio-group](https://github.com/chenglou/react-radio-group)的影響，結構上是以_CheckboxGroup_和_Checkbox_巢狀的組合來達到目的。但我認為比較奇怪的地方是，他並非如[chenglou/react-radio-group](https://github.com/chenglou/react-radio-group)一樣直接加入子元件（_Checkbox_），而是以**函數**的方式生成_Checkbox_元件（可參閱他的README）

在比較完survey到的幾個專案後，我希望作出的專案有幾個目標：

*   不給定style： 
    雖然前面幾個專案有給style的應該也沒有「必須」加上style，但總覺得這樣在開始學習時就會感到混淆
*   盡量減少元件可改變的屬性：
    總之就是盡可能輕量、簡易、彈性
*   一目了然的結構： 
    我自己是也有使用[chenglou/react-radio-group](https://github.com/chenglou/react-radio-group)在其他專案中，我蠻喜歡他「如何使用」的概念，也就是一個群組元件（group）夾帶單一元件，這樣程式碼讀起來一目了然。這也是我不想再次使用[ziad-saab/react-checkbox-group](https://github.com/ziad-saab/react-checkbox-group)的理由
*   多選、二元選擇都能使用：
    上面的專案中第一、二都蠻好的，不過都是比較合適於二元選擇。當然是也以自己多作點事情讓它們都能夠在多選的情境下使用
*   多選的情境下，能夠獲得被選取項目的array：
    與上一點雷同，絕對可以自己在外層加點工（例如onChange），來達到如同[ziad-saab/react-checkbox-group](https://github.com/ziad-saab/react-checkbox-group)的效果。但就是覺得如果能整合大家的優點那就太好了

#### 結果

最後就形成了[React Checkbox Duet](http://ziad-saab/react-checkbox-group)，結構上受啟發於[chenglou/react-radio-group](https://github.com/chenglou/react-radio-group)，也是以_<CheckboxGroup />_包裹_<Checkbox />_來使用。並且也可以單用_<Checkbox />_來作到二元選擇的效果，但目前必須將Checkbox的isGroup屬性設為false，才能有正確的二元效果（差別可參見下一段）。這部份尚有點麻煩，再想想是否能避掉這個步驟直接讓元件判斷是哪種使用。

如同上面的目標，如果是多選情境，帶入的_onChange_所接應的參數會是一個array，裡頭是**已勾選的項目**名稱（以input **value**為準）。若是二元的情境，_onChange_的是接應目前input checked的**反面布林值**。

#### 題外話

命名果然是一件困難的事情，原本是想取作two-face，也就是美漫的雙面人。不過因為一來這個專案的兩個面並不是對立或相反；二來總覺得命名為react-checkbox-two-face好像有點太冗長，哈。

在資訊圈，相對其他領域，各種開發的成本都低的多，因此學習最好的方式就是實做。除了實做程式碼外，寫文件、製作demo page的速度和品質也都有所提昇。比起本來就已經沒什麼人在用的[跑馬燈](https://github.com/WendellLiu/react-upward-marquee)（QQ）這次應該稍微有人能用了吧？
