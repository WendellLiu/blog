---
title: Redux Middleware大略架構
description: >-
  幾個月前開始接觸React，接下來除了一些基本範例外，比較有樣子的就是幫公司寫了一個簡單的csv
  uploader（但後來也不了了之了吧）。在比較熟悉React架構後，自然也對一樣是Facebook推出的Flux產生興趣。不過在大略看了一些簡介後，就直接往Redux走去。
date: '2016-06-01T07:37:14.577Z'
categories: []
keywords: []
layout: layouts/post.njk
---

幾個月前開始接觸React，接下來除了一些基本範例外，比較有樣子的就是幫公司寫了一個簡單的csv uploader（但後來也不了了之了吧）。在比較熟悉React架構後，自然也對一樣是Facebook推出的[Flux](https://facebook.github.io/flux/docs/overview.html)產生興趣。不過在大略看了一些簡介後，就直接往Redux走去。

Redux的[官方文件](http://redux.js.org/)是出了名的清楚、易懂，再加上作者在egghead.io的[教學影片](https://egghead.io/series/getting-started-with-redux)(It’s free!)，相信要了解基礎應用不至於太難。

本篇是基於了解Redux後，紀錄我自己研究Redux Middleware的流程。

首先，Redux Middleware是什麼？引用[官方文件](http://redux.js.org/docs/advanced/Middleware.html)的內容：

> It provides a third-party extension point between dispatching an action, and the moment it reaches the reducer.

Redux Middleware可以讓開發者自行寫出一套想實踐的邏輯，而作用時機為送出(dispatch)action到action到達reducer之間。基礎上，每一次的dispatch都會先經過middleware才進入reducer。

先來瞧瞧一個基本的middleware基本架構：
```js
// es6 version
const someMiddleware = (store) => next => action => {
  // do something before dispatch the action
  let dispatch_function = next(action)
  // do something after dispatch the action

  return dispatch_function
}

// es5 version
function someMiddleware(store){
  return function(next){
    return function(action){
      // do some before dispatch the action
      var dispatch_function = next(action)
      // do some after dispatch the action

      return dispatch_function
    }
  }
}
```

這個地方的**next**，實際上就是dispatch function。從上面這段程式碼可以發現，Middleware回傳一個經過幾個階段包裝的function。大致流程如下：

1.  輸入redux store，輸出一個需要輸入next的function
2.  輸入next，輸出一個需要輸入action的function
3.  輸入action，作一些你想作的事情，並且回傳next執行action的結果（也就是在經過這個middleware後新的store

我們聚焦在**第三點**，輸入action，然後作點事情。……那不就是一個增強版(enhanced）dispatch？

可以說，middleware的任務就是要包裹(wrap)dispatch，讓他**成為**一個能做到你在middleware寫的邏輯的dispatch，一個變身的概念。

![Cat-wrap — [Ryan Cousineau](https://www.flickr.com/photos/rcousine/ "移至 Ryan Cousineau 的所有相片")](./cat_wrap.jpg)
Cat-wrap — [Ryan Cousineau](https://www.flickr.com/photos/rcousine/ "移至 Ryan Cousineau 的所有相片")

如果到這邊有點不清楚，可以看看官方文件中的這段：

```js
// Warning: Naïve implementation!
// That's \*not\* Redux API.

function applyMiddleware(store, middlewares) {
  middlewares = middlewares.slice()
  middlewares.reverse()

  let dispatch = store.dispatch
  middlewares.forEach(middleware =>
    dispatch = middleware(store)(dispatch)
  )

  return Object.assign({}, store, { dispatch })
}
```

這段程式碼是一個概念性的applyMiddlerware實做，arguments中的middlewares便是一個包含所有你想使用的middeware的array。其中這部份就說明了前面提到的「包裝」：

dispatch = middleware(store)(dispatch)

將原本的dispatch assign為前面提到的**第二階段**的回傳function。

在完成客製的middleware後，便可以下面的方式在你的專案使用：

```js
import { createStore, applyMiddleware } from 'redux'
import multiReducers from './reducers' // 這是你的reducer或經過combineReducers產生的組合reducers

let store = createStore(
  multiReducers,
  applyMiddleware(someMiddleware)
)
```

官方文件中middleware part最後有一個**_Seven Examples_**，包含一些基本的middleware應用。最常見的自然是logging、action timeout。本篇將middleware中比較關鍵的部份強調，希望能讓大家比較理解middleware其內含究竟是什麼。

總結我認為redux-middleware的核心概念即是：

“以包裹的方式，改變原生dispatch的行為”

寫這篇以前，原本是希望簡介Redux-Saga。結果發現應該先自己整理一下Redux-Thunk，然後又往回，又認為應該先從Redux-Middleware開始。總之應該還有兩篇分別是Redux-Thunk、Redux-Saga的文章。
