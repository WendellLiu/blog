---
title: 讓你的Action能作更多 — Redux-Thunk
description: >-
  延續著自己寫的Redux
  Middleware大略架構，接下來要來介紹Redux-Thunk。本篇除了介紹Redux-Thunk在作些什麼外，也希望能稍微review
  React-Thunk中的原始碼（因為很短？）。
date: '2016-06-13T07:02:25.546Z'
categories: []
keywords: []
layout: layouts/post.njk
---

讓你的Action能作更多 — Redux-Thunk

延續著自己寫的[Redux Middleware大略架構](https://medium.com/@WendellLiu/redux-middleware%E5%A4%A7%E7%95%A5%E6%9E%B6%E6%A7%8B-ace7e646c929#.l7syseaiu)，接下來要來介紹[Redux-Thunk](https://github.com/gaearon/redux-thunk)。本篇除了介紹Redux-Thunk在作些什麼外，也希望能稍微review React-Thunk中的原始碼（因為很短？）。

首先，何謂thunk？問問[維基百科](https://en.wikipedia.org/wiki/Thunk)吧！

> In computer programming, a **thunk** is a subroutine that is created, often automatically, to assist a call to another subroutine.

簡而言之，thunk為一個能在其中呼叫另一個子程序(subroutine)的子程序。嗯…似乎有點拗口。簡單的說，若以function的作為例子，thunk就是一個function的內部會去呼叫另一個function，也就是再包裝的概念。

將這個概念用在Redux-Thunk上，便是包裝一個action creator為一個thunk。原生概念的action creator是回傳一個action(object)；而若是「thunk化」的action creator，則回傳一個function。接下來就如同上一段所說，在這個回傳的function中，我們可以複雜化我們的dispatch邏輯。且看一段範例代碼：

```js
const fetch_some = () => {
  return (dispatch, getState) => {

    doSomething()
    dispatch(fooAction())
    doSomethingElse()
    dispatch(barAction())
  }
}
```

在這個例子中，我們設計一個function，它回傳了一個輸入參數為dispatch和getState的function。在這個回傳的function中我們做了一些事情，也分別dispatch另外兩個action。

聽起來似乎有點類似[上一篇介紹](https://medium.com/@WendellLiu/redux-middleware%E5%A4%A7%E7%95%A5%E6%9E%B6%E6%A7%8B-ace7e646c929#.l7syseaiu)的Middleware概念。不過Middleware是雷同pipeline的概念，每每app在dispatch時都會做出指定的動作，而Thunk則是聚焦在更小範疇的action本身。

這很適合用來作些什麼呢？在Redux的官方文件，其中的[Async Actions](http://redux.js.org/docs/advanced/AsyncActions.html)這一章節便使用了Thunk。

若我們要在Redux的架構下，作ajax fetch會遇到非同步的問題。由於我們無法直接在action creator回傳的object直接call function來得到fetch回來的值。可以參考下面簡單的非同步結果（請看Result內div中的值）。由於foo中回傳的bar在return之時是為’before’，並不會是等到setTimeout結束後在被assign的’after’。

```js
const foo = () => {
	let bar = 'before'
	setTimeout(() => {
    bar = 'after'
  }, 3000)
  return {
  	bar
  }
}

document.getElementById('demo').innerHTML = foo().bar
```

此時，Redux官方文件就正式介紹Thunk出場了。藉著搭配[fetch](https://developer.mozilla.org/en/docs/Web/API/Fetch_API)的promise特性，在獲得、處理資料後，把資料傳進另一個一般的action creator，並且dispatch。（請看以下節錄的程式碼）

```js
function fetchPosts(subreddit) {
  return function (dispatch) {

  dispatch(requestPosts(subreddit))

  return fetch(`http://www.reddit.com/r/${subreddit}.json`)
    .then(response => response.json())
    .then(json =>

      dispatch(receivePosts(subreddit, json))
    )
  }
}
```

from [http://redux.js.org/docs/advanced/AsyncActions.html](http://redux.js.org/docs/advanced/AsyncActions.html)

除了非同步的用法外，實際上諸如：一次dispatch多個action、加log、先把資料處理後再dispatch等需求都能簡單使用thunk。由於以包裹的方式來讓你的action更添風采非常的方便，更必須要小心不要過度的包裹，並且仍要盡能的讓每一個action單純化。

再我們理解什麼是Thunk，並且這個概念如何在Redux系統的action creator實做後，那到底dispatch這個function是如何知道我們action creator回傳的究竟是pure object(action)還是function(thunk)呢？

![surprised dog](./1__bUmgZzJrHPxMzZFxQJEGrw.jpeg)
surprised dog

這也就是[React-Thunk](https://github.com/gaearon/redux-thunk)這個專案的內容了。實際上這個專案不是提供任何thunk讓大家使用，而是一個Redux Middleware。這個Middleware改造了你的dispatch，讓他有能力判斷送進去的東西是一個pure object還是function。

[**gaearon/redux-thunk**
_redux-thunk - Thunk middleware for Redux_github.com](https://github.com/gaearon/redux-thunk/blob/master/src/index.js "https://github.com/gaearon/redux-thunk/blob/master/src/index.js")[](https://github.com/gaearon/redux-thunk/blob/master/src/index.js)

原始碼中，首先判斷是否是function：

```js
if (typeof action === ‘function’){}

```


如果不是function，那自然就是一個pure object，利用next(本質上就是dispatch)送出，就是什麼都不做的意思；而若是function，則把這個thunk會需要的dispatch、getState和其他arguement送給thunk，讓它做你所指定它做的事情。

經由這個Redux Middleware我們就能夠毫無顧忌(？)的不分action creator或thunk都把他們通通dispatch。

![](./1__CnvFIXJjKsMlSYkV__NSIyg.jpeg)

總結：

1.  Thunk是一個以**action**為本的包裹器
2.  在Redux中藉由Redux-Thunk這個Redux Middleware讓我們可以在使用時不去區分pure action creator還是thunk action creator
