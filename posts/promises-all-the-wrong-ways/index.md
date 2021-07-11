---
title: 別這樣使用Promise
description: '聲明：本篇文章摘要自Promises: All The Wrong Ways'
date: '2016-06-28T03:28:17.843Z'
categories: []
keywords: []
layout: layouts/post.njk
---

_聲明：本篇文章_**_摘要_**_自_[_Promises: All The Wrong Ways_](https://blog.getify.com/promises-wrong-ways/)

#### 錯誤的開始

假設個情境：當你從其他函式庫引用_foo()_時，而回傳一個promise，問題來了，要如何肯定你使用的promise是你所想的那個promise嗎？例如開發者在先前使用了[Bluebird promises](https://github.com/petkaantonov/bluebird)(或其他promise-like api)，但此時引用的_foo()_所回傳的promise呢？

本篇文章建議標準化(normalize)你所使用的promise，方式如下：

```js
Promise.resolve(foo())
  .then( nextStep )
......
```

參考MDN(Mozilla Developer Network)對_Promise.resolve()_介紹：

> The **Promise.resolve(value)** method returns a [Promise.then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then "The then() method returns a Promise. It takes two arguments: callback functions for the success and failure cases of the Promise.") object that is resolved with the given value. If the value is a thenable (i.e. has a[”then” method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then "The then() method returns a Promise. It takes two arguments: callback functions for the success and failure cases of the Promise.")), the returned promise will “follow” that thenable, adopting its eventual state; otherwise the returned promise will be fulfilled with the value.

_Promise.resolve(value)_會回傳一個_Promise.then object_。如果_value_為thenable(也就是value含有then method)，則回傳一個已經執行過value(此時應是個thenable object)中所寫的各種行程的promise；而如果value非thenable，則回傳一個處於實現狀態的promise(fullfilled promise)，該promise最後的值則是停留在value。

回到這個例子，若_foo()_和你預期的promise相同，自然沒有不會有其他問題產生，他會跑完一遍這個promise的then然後回傳；反之，以這個方式使用你的promise，無論是不是native Promise，由於你所引用的promise應該是thenable，_Promise.resolve(..)_便能夠回傳一個你能夠信任的promise。

問題來了…

是否要在每一次使用promise都要這麼處理呢，作者認為不盡然。

```js
Promise.resolve(foo())
  .then(bar)
  .then( lastStep )
```

例如這個範例，若你是要連鎖使用不同種類的promise，只需要把promise放在_then(..)_使用，也會有相同的效果。現在儘管_foo(..)_和_bar(..)_是由不同的promise api產生，經過這個作法便達到標準化的效果。

#### 起步延遲

文章中提到在promise chain的起始部份，很可能出現的錯誤用法，其中之一：

```js
Promise.resolve()
  .then( firstStep );
```

這樣的寫法會讓程式先運行_Promise.resolve()_才運行_firstStep()_，儘管其實相差並不大，但如果在整體的程式碼中你時常這樣處理promise，這些延時(delays)則會累加。因此，簡單的說，直接把_firstStep()_放在_Promise.resolve()_中吧。上面提到的MDN對_Promise.resolve()_介紹頁中也有類似的[使用範例](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)：

```js
// Resolving anothoer Promise

var original = Promise.resolve(true);

var cast = Promise.resolve(original);

cast.then(function(v) {
  console.log(v); // true
});
```

另一個可能出現的不好寫法是：

```js
new Promise( function(resolve, reject){
  firstStep()
    .then( resolve, reject );
})
```
..

這個寫法的警告我似乎在其他地方也有看到，就不是要使用巢狀(nested)的promise結構組合不同的promise，會讓程式碼變得可讀性差，以及缺乏一致性，進而難以維護。

#### 開始時出現錯誤

文章中提到了如果你引用的promise f_irstStep()_的可能運行結果是一個同步例外(synchronous exception)而非rejected promise，那該如何以promise的概念作非同步處置呢？

作者建議以之前相同的概念，在例外(exception)外包覆一層_Promise.reject()_，讓你能夠再以promise的非同步性方式處理例外。範例如下：

```js
var p;

try {
  p = Promise.resolve( firstStep() );
}
catch (err) {
  p = Promise.reject( err );
}

p.then( .. )
```
..

實際上，這個寫法確實有些繁瑣，因此作者認為更好的寫法是使用es7的async function。async function會標準化_fistStep()_的回傳為一個promise，並且捕獲例外然後自然的轉為rejected promise。

不過和上面的寫法有點不同的是，如果你希望你的的程式碼中的promise都是某一種promise api所產生的promise(例如上面提過得Bluebird Promise)，由於使用async function會回傳一個原生(native)的promise，因此必須要再以該promise api的promise.resolve(或其他相同效果的api)轉換。

#### Promise 副作用

近年很火紅的函數式編程(Functional Programming, FP)，概念上希望函數能夠越純粹越好，也就是沒有副作用(side-effects)。然而在運用promise時我們很容易寫出有side-effect的程式碼。

第一個常出現side-effect的地方是，多個promise之間，相對序列關係的程式碼。

例如以下範例：

```js
firstStep()
  .then( secondStep )
  .then( function(){
    console.log( "two" );
});

firstStep()
  .then( function(){
    console.log( "one" );
});
```

當你撰寫出以上程式碼時，由於第一個_firstStep_需要先跑過_secondStep_才會運行_console.log(..)_，你應該是認為主控台會依序印出”one”、”two”。確實大部份情況可能如此，不過也不可避免的有一定機率第二個_firstStep_會在_secondStep_運行後才運行，而此時印出的順序則為”two”、”one”了。

作者如果你很在意執行順序，以上例而言就是預期會是先運行完第二個，才會完成第一個，請別這樣寫。畢竟後續維護者（說不定是你自己）不見得能夠保證這些順序的進行，例如倘若維護者要改寫_secondStep_。

除了多個promise之互相影響，還可能加入setTimeout這種函數來攪局：

```js
setTimeout( function(){
  console.log( "three" );
}, 0 );

Promise.resolve().then( function(){
  console.log( "two" );
});

console.log( "one" );
```

這段程式碼的預期console結果為”one”、”two”、”three”。

結果我看到這邊時才發現自己根本不會javascript(好厭世)，總之大家也可以參考中國開發者的[這篇](http://www.jianshu.com/p/80d52733fe06)。由於javascript對於microtask和macrotask有其複雜的運行順序，因此作者並不建議過度依賴這些機制來達成你希望獲得的順序。注意！不是不建議使用這些機制，只是**不建議用來獲得預期的順序**。

第二種可能出現side-effect的常見地方是在promise的建構子(constructor)。

由於我們知道建構子中的起始函數(initialize function)是同步化執行的，因此可能出現以下程式碼片段：

```js
var fn;

var pr = new Promise( function init(resolve){
  fn = resolve;
} );

fn( 42 );
```

老實說我自己沒辦法想像怎麼樣的時機會讓人想這樣寫。

作者認為這種混合了**同步**及**非同步**的寫法是容易讓人混淆的，因此不鼓勵這樣寫，可以改用這種寫法：

```js
var pr = Promise.resolve( 42 );
```


同樣地，作者自然並不是反對使用promise 建構子，而是反對依賴promise 建構子起始函數的同步性來部屬你的程式碼運行順序。

第三個容易出現side-effect的地方是**scope**(作用範圍)。

比較以下兩段程式碼：

```js
// usage with side-effect
function getOrderDetails(orderID) {
  var _order;

  return db.find( "orders", orderID )
    .then( function(order){
      _order = order;
      return db.find( "customers", order.customerID )
    } )
    .then( function(customer){
      _order.customer = customer;
      return _order;
    } );
}

// usage without side-effect
function getOrderDetails(orderID) {
  return db.find( "orders", orderID )
    .then( function(order){
      return db.find( "customers", order.customerID )
        // nested `then()` instead of flattened to outer chain,
        // so that we still have lexical scope access to `order`
        .then( function(customer){
          order.customer = customer;
          return order;
        } );
    } );
}
```

這兩個function都利用_db.find(..)_這個promise兩次，第一次取得_order_物件，第二次取得_customer_並且綁在_order_上。不過由於promise的特性是單一值的傳遞，我們會很容易就寫出像第一組那樣具side-effect的函數。

儘管第二個巢狀式promise使用也並不被推薦，作者仍然認為比起side-effect function他還更能接受nesting function。

#### Promise鏈

直接破題，作者認為promise鏈適合用在「在與時機無關的前提下，處理未來的值」，但他十分不建議使用promise的_then(..)_作為非同步流程控制(async flow control)管理。範例如下：

``` js
firstStep()
  .then( secondStep )
  .then( thirdStep );
```

promise的機制讓我們能夠預期每個鏈節點的時機，也因此往往我們會用來作流程控制。儘管作者也曾經是其深度使用者，但他越發覺得一個長的promise鏈確實是bad smell。

那該怎麼辦？使用**synchronous-async pattern**吧！

作者提供了兩個實做方式：

1.  Generators + Promises
2.  Async Functions(es7)

Generators + Promises的方法可以[參考](https://github.com/getify/You-Dont-Know-JS/blob/master/async%20&%20performance/ch4.md#generators--promises)，大致上來說，把流程寫成一個generator with promises，並且搭配一個runner來運行generator。這讓我想起了[Redux Saga](https://github.com/yelouafi/redux-saga)。

```js
// generators with promises
function *main() {
  yield firstStep();
  yield secondStep();
  yield thirdStep();
}
```

上面的程式碼便是一個範例，至於runner就請參考同作者所寫的[這篇](https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20&%20beyond/ch4.md#generators--promises)。

另一個實做方式是利用async functions，範例如下：

```js
async function main() {
await firstStep();
await secondStep();
await thirdStep();
}
```

如果要考量到數值傳遞和例外處理可以寫成：

```js
async function main() {
  try {
    var val1 = await firstStep();
    var val2 = await secondStep( val1 );
    var val3 = await thirdStep( val1, val2 );

    console.log( "Final: ", val3 );
  }
  catch (err) {
    console.error( err );
  }
}
```

無論是哪個實踐都算是容易懂，我們能夠同樣達到非同步流程控制，並且讓程式碼更好維護。我自己是認為簡易地使用promise的_then(..)_並不至於太可怕，但相對的是缺乏彈性。如果要在每個流程之中或之間作處理，便顯得不容易（由於promise單一數值傳遞的特性），硬要作又可能寫出具side-effect的函數。

### 總結

1.  使用任何你希望統一使用的promise api中的_Promise.resolve(..)_來標準化你所引用的不同來源promise
2.  直接把第一個函數放在_Promise.resolve(..)_中，不需要跳過而放在第一個_then(..)_裡頭
3.  在與javascript task、constructor、scope等有關的promise使用，可能會有side-effect
4.  不要使用promise作非同步流程控制，取而代之的是synchronous-async pattern
