---
title: React Component Testing with Enzyme
description: 我猜寫寫測試不至於被發便當啦，大家不必擔心。
date: '2016-09-12T04:27:33.828Z'
categories: []
keywords: []
layout: layouts/post.njk
---

![](./ned_stark.jpeg)

> 我猜寫寫測試不至於被發便當啦，大家不必擔心。

為程式寫測試在現代軟體開發是非常普及的，並且許多基於測試的開發流程也越被大家關注。

作為使用React為主的工程師，自然也需要了解如何為你的專案寫單元測試。

本篇文章主要介紹主打React Component Testing的Enzyme。

內容會有：

1.  React Component測試與Enzyme
2.  一些關於React Component常見的測試項目
3.  其他[鋩角](http://twblg.dict.edu.tw/holodict_new/result_detail.jsp?n_no=11553&curpage=2&sample=kak&radiobutton=1&querytarget=1&limit=20&pagenum=4&rowcount=66)（mê-kak, 俗字為眉角）

### React Component測試

以React的架構而言，最小的單位是 **Component**，故為Component寫單元測試是一件非常重要的事。然而由於React Component在未被render的情況下，光就該function是無法有效的測試render後的結果。

因此要測試Rendered Component有幾個選擇，例如[_ReactDOM.render_](https://facebook.github.io/react/docs/top-level-api.html#reactdom.render)，但它是以browser端為導向的設計，如果要在node環境下則應當需要加上許多功(以node去模擬browser之類的）。

而另外的角度則是想到React方便的server-side render Api，[_ReactDOMServer.renderToString_](https://facebook.github.io/react/docs/top-level-api.html#reactdomserver.rendertostring)_。_不過這樣的輸出是字串，如果沒有測試到翻桌我家的蜜蜂就砍頭。

[Enzyme](https://github.com/airbnb/enzyme)也就橫空出世、姍姍來遲了（還有人記得莊園嗎？）。

Enzyme是Airbnb所開源的React Component測試工具。實際上，Enzyme建立於React原生提供的測試工具 — [ReactTestUtils](https://facebook.github.io/react/docs/test-utils.html)之上，以更簡易、直覺的界面讓開發者能夠更容易地使用。

Enzyme提供了三種Render的Api讓使用者取得rendered component物件，分別是：[Shallow Rendering](http://airbnb.io/enzyme/docs/api/shallow.html)、[Full Rendering](http://airbnb.io/enzyme/docs/api/mount.html)、[Static Rendering](http://airbnb.io/enzyme/docs/api/render.html)，差別如下。

1.  Shallow Rendering — _shallow()_：僅能讓你使用該Component，並且不是真正完整的React Render，無法與其children components互動，也無法測試lifecycle method
2.  Full Rendering —_ mount()_：若你的Component testing設計較為複雜，可使用Full Rendering來作更詳盡的測試（例如針對componentDidMount的測試）
3.  Static Rendering — _render()_：藉[Cheerio](http://cheerio.js.org/)得到DOM Object，因此就脫離了React Virtual DOM，而是針對實際瀏覽器上的HTML DOM來作測試

本篇的範例是以最細小單位的component測試為主，因此僅使用 **Shallow Rendering**。

#### 環境以及其他套件

會使用到的測試向套件如下

1.  [Mocha](https://mochajs.org/): JavaScript Testing Framework
2.  [Chai](http://chaijs.com/): Assertion
3.  [Enzyme](https://github.com/airbnb/enzyme): Testing utility for React
4.  react-addons-test-utils, react-dom: **needed for using React 0.14 or React 15.x**

實際上要用什麼Testing Framework都是可行的，官方文件也有提供[一些說明](http://airbnb.io/enzyme/docs/guides.html)。

### 測試什麼

這裡記錄一些我自己目前所能想像得到且稍有意義的測試。

#### 本身性質測試

首先，在我們大致決定React Component的架構後，可以利用_name()_，進行Component本身的node name測試。

```js
const Foo = () => ( <div> foo <div/> )
it(‘should be a div element ‘, () => {
  const wrapper = shallow(<Foo/>)
  const expectValue = wrapper.name()
  expect(expectValue).to.equal(‘div’)
})
```

接下來測試component的className，Enzyme一樣很貼心的提供了_hasClass(className)_用以測試該node是否包含某class。

```js
const Foo = () => (
  <div className="bar bell" />
)
it(‘should have className “bell”’, () => {
  const wrapper = shallow(<Foo/>)
  const expectValue = wrapper.hasClass("bell")
  expect(expectValue).to.equal(true)
})
```

如同上方這段程式碼的演示，_hasClass(className)_並非單純將預測的class name與component的className屬性值作字串比對；而是更方便地確認在該component中複數個className裡，是否包含我們所希望測試的class。

不過比起上面的示範，更可能作的應該是component本身會依據某些邏輯作className變化（for style）的測試：

```js
const Foo = ({ number }) => (
  <div className={number >= 0 ? "positive" : "negative"} />
)
it(‘should have className “negative” when number is negative’, () => {
  const wrapper = shallow(<Foo number={-100}/>)
  const expectValue = wrapper.hasClass("negative")

  expect(expectValue).to.equal(true)
})
```

#### 包含測試

React Component是巢狀結構，因此我們可以測試其內所包含的其他component。

最簡單的方式是利用_contains(nodeOrNodes)_，除了可以測試是否含有某node，也可以陣列的方式，把欲測試的各node一併測試。值得一提的是，上述所提到的node必須是一個完全相同的node，意即該node的property也必須相同：

```js
const Foo = () => (
  <div>
    <Bar num={1} />
  </div>
)
it(‘should match <Bar/>’, () => {
  const wrapper = shallow(<Foo/>)
  expect(wrapper.contains(<Bar/>)).to.equal(false)
  expect(wrapper.contains(<Bar num={1}/>).to.equal(true)
})
```

如果不打算連property的對錯一起作測試，則可使用_containsMatchingElement(node)_，他會忽略沒有寫進的property。但若你寫進了property，則其值仍會被視為比對的對象：

```js
const Foo = () => (
  <div>
    <Bar num={1} />
  </div>
)
it(‘should match <Bar/>’, () => {
const wrapper = shallow(<Foo/>)
  const expectValue = wrapper.containsMatchingElement(<Bar/>)
  expect(expectValue).to.equal(true)
  expect(wrapper.containsMatchingElement(<Bar num= {999}/>).to.equal(false)
})
```

Enzyme也提供了_containsAllMatchingElements(nodes)_、_containsAnyMatchingElements(nodes)_，以輸入陣列中每個component作_all_、_any_邏輯的判斷，也就是 **必須所有match**與 **允許部分match**的差別。

而上面介紹的contains家族，是以component為測試條件的Api。我們也能以css selector的角度去進行測試。Enzyme提供_find(selector)_則是以[Enzyme Selector](http://airbnb.io/enzyme/docs/api/selector.html)作為測試項目。

> Enzyme Selector 除了是標準的css selector外，React Component本身或React Component的display name亦是其可鎖定的範疇。並且與contains不同的是，find是回傳一個**包含其找到結果的wrapper**而非是否找到。

```js
const Foo = () => (
  <div>
    <span className="title">some text</span>
    <input
      type="number"
      className="credit-card"
    />
  </div>
)
it(‘should find ".title + .credit-card"’, () => {
  const wrapper = shallow(<Foo/>)
  const expectValue = wrapper.find(".title + .credit-card")
  expect(expectValue).to.have.length(1)
})
```

觀看上面的例子，_find(selector)_的確可以讓你以複雜的css selector來實踐你希望測試的邏輯，當然使用者仍應小心，別寫出失去彈性的測試，除非spec 內容已經十分肯定了（但或許，失去彈性仍是沒必要）。

我認為_contains_家族及_find_應該視為不同測試角度所使用的Api，不要僅以寫測試的**方便性**去選擇，而是需要思考你究竟是**為了什麼**而作這個測試。

例如component的內部邏輯會體現於render出的某child component**是否存在**，或想使用更進階的[**universal**](https://www.wikiwand.com/en/Universal_quantification)**(all)、**[**existential**](https://www.wikiwand.com/en/Existential_quantification)**(any)邏輯**，則使用_contains_；反之若內部邏輯體現於與class上，或重點在child component的**個數**，就適合使用_find_。

最後再給一個**包含測試**的相對複雜應用，這個例子是輸入一個陣列，其中包含不同狀態（完成或不完成）的task，我們希望測試render出completed和active分別的_<li>_**數目**是否符合預期邏輯：

```js
const tasksArray = [
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: false },
  { completed: false }
]
const Todos = ({ tasks }) => (
  <ul>
    {
      tasks.map((task) => {
        if(task.completed){
          return <li className="completed">task</li>
        }
        return <li className="active">task</li>
      })
    }
  </ul>
)
it(‘should find three completed li and two active li’, () => {
  const wrapper = shallow(<Todos tasks={ tasksArray }/>)
  expect(wrapper.find("li.completed")).to.have.length(3)
  expect(wrapper.find("li.active")).to.have.length(2)
})
```

#### Event 測試

前頭由小至大介紹了component本身的性質測試，再來是針對其中child component的包含測試。接下來則是加入Event的component 測試。

Enzyme以_simulate(event)_來模擬DOM event，直接看以下範例吧。建立一個_Shop_的component，其中會有一個_button_，按下後state中的fruits則會增加一個項目，並且有一個_ul_，會顯示fruits內含的項目：

```js
class Shop extends React.Component = {
  constructor(props){
    super(props)
    this.state = {
      fruits: []
    }
    this.handle_add = this.handle_add.bind(this)
  }
  handle_add(){
    let fruits = this.state.fruits
    fruits = fruits.concat({name: 'fruit'})
    this.setState({
      fruits
    })
  }
  render() {
    return (
      <div>
        <ul>
          {
            this.state.fruits.map((fruit) => (
              <li>fruit.name</li>
            ))
          }
        </ul>
        <button onClick={this.handle_add}>add fruit</button>
      </div>
    )
  }
}
it(‘should modify the fruit list when click button’, () => {
  const wrapper = shallow(<Shop/>)

  // default fruit list is empty
  expect(wrapper.find('li').length).to.equal(0)
  // when click button
  wrapper.find('button').simulate('click')
  // add one fruit to fruits
  expect(wrapper.find('li').length).to.equal(1)
})
```

需要注意的是，使用者需要指定其event作用的node（很理所當然，只是別遺漏了）。

### 其他[鋩角](http://twblg.dict.edu.tw/holodict_new/result_detail.jsp?n_no=11553&curpage=2&sample=kak&radiobutton=1&querytarget=1&limit=20&pagenum=4&rowcount=66)

#### Class testing in CSS Modules

如果有在使用CSS Modules，由於Component的className理應會被加上一些prefix和hash，測試上則需要稍微改寫。其實就是在測試時也使用CSS Modules的概念，不以純字串的方式測試：

```js
import style from './yourpath/scss/marker/style'

it(‘should have className “warning”’, () => {
 const expectValue = wrapper.hasClass(style.warning)
 const actualValue = true
  expect(expectValue).to.equal(actualValue)
})
```

並且，仍需要注意你測試時的環境是否包含**CSS Modules的編譯**。像我目前的test task是直接跑mocha，搭配_babel-register_和_.babelrc_，如下：

```json
// package.json

"test": "mocha — compilers js:babel-register — recursive"
```

假若你的架構與我雷同的話，你需要再利用[css modules的hook](https://github.com/css-modules/css-modules-require-hook)，另外寫一個compiler加入mocha測試碼的編譯。參考[此篇gist](https://gist.github.com/ryanseddon/e76fd16af2f8f4f4bed8)，我的寫法是：

```js
// cssModulesCompiler.js
var hook = require('css-modules-require-hook')
var sass = require('node-sass')
var path = require('path')
hook({
  extensions: ['.scss'],
  preprocessCss: function (css, filepath) {
    var result =  sass.renderSync({
      data: css,
      includePaths: [ path.resolve(filepath, '..') ]
    })
    return result.css;
  }
})

// package.json
"test": "mocha --compilers js:babel-register,js:./cssModulesCompiler.js --recursive"
```
#### propTypes

這裡其實跟React Component render後的測試完全無關，只是我想到或許可以把**有無propTypes**加入測試，以便提醒開發者要記得寫這個**防呆機制**：

```js
it('should have propTypes', () => {
    expect(Foo).to.have.property('propTypes')
})
```

### 後記

過去對於寫Component測試總感到興趣缺缺，但隨著開發經驗多一些後，發現要說服自己寫測試，首先取決於你（或你的團隊）制定Spec的能力。
像我對Spec的設計尚未熟練，幾乎Component內容都是隨著開發一直在改變，因此並不想寫這部份的測試，更遑論TDD這樣的開發方式也是有心無力。


但我想這樣的成長不見得是單向的，非得先增加設計恰當Spec的能力才開始寫測試。先強迫自己主動寫component的測試，會更了解component的設計上，哪些性質需有彈性、而哪些則是開發前就該注意到的。這過程反過來增加了我在寫程式碼前先行思考的能力。

如果未來更熟練，並且能夠整合一些成果，也希望能寫一篇關於開發前設計component的心得。

#### 參考資料

1.  [Enzyme: JavaScript Testing utilities for React](https://medium.com/airbnb-engineering/enzyme-javascript-testing-utilities-for-react-a417e5e5090f#.wu6cdgx6a) (by [AirbnbEng](https://medium.com/@airbnbeng?source=post_header_lockup))
