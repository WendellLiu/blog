---
title: Redux State、Immutable、React-Redux-Router、Logger一些小事
description: 這篇是個小筆記，紀錄一些關於Redux State、Immutable、React-Redux-Router、Logger之間的小事。
date: '2016-06-15T04:24:36.975Z'
categories: []
keywords: []
layout: layouts/post.njk
---

這篇是個小筆記，紀錄一些關於Redux State、Immutable、React-Redux-Router、Logger之間的小事。

運用Immutable概念在Redux Store是非常被推薦的，在官方文件中[開始時](http://redux.js.org/docs/introduction/PriorArt.html)就提到：

> Another important difference from Flux is that **Redux assumes you never mutate your data**. You can use plain objects and arrays for your state just fine, but mutating them inside the reducers is strongly discouraged. You should always return a new object, which is easy with the [object spread operator proposal](http://redux.js.org/docs/recipes/UsingObjectSpreadOperator.html), or with a library like [Immutable](https://facebook.github.io/immutable-js).

Redux的核心精神就假定你**絕對不會**(never)更動你的資料(state)，也就是Ruducer應總是回傳一個全新的物件而非更改後的舊state。而如果是用Immutable.js提供的一套系統，便可以很有效率、紀律的達到這個精神。

不過我自己開始使用以Immutable.js 為state system時，會遇到一些結構性小細節的問題：到底這個Immutable是要在最上層的state實做，還是個別state，就實做呢？以下兩個例子：

```js
import { fromJS } from 'Immutable'

const ImmutableForEachState = {
  state1: fromJS(state1),
  state2: fromJS(state2),
  state3: fromJS(state3)
}

const ImmutableWrapEntireState = fromJS(
  {
    state1,
    state2,
    state3
  }
)
```

第一個的State本身還是pure object，只是每一個單一的children state是immutable；而第二例則是從最外層的state就是屬於immutable。

如果是前者，除了在reducer或其他可能會碰到state地方都作適當處理，只要你是有運用redux原生的_combineReducers_來合併所有的children state則可以達成；而若為後者，一樣需要在碰到state的場所作一些處理外，還必須要overwrite原生的_combineReducers_，可以自行刻或者依靠[這個](https://github.com/gajus/redux-immutable)或[這個](https://github.com/indexiatech/redux-immutablejs)。

總之我是選擇運用第一個方式實做我的Immutable System。

接下來會遇到的問題是在當你想要寫一個logger middleware時。由於state已經是immutable的性質了，你則必須要在logging state，先將他處理成pure object（說不定你也能客製一個console）。我是這樣寫的：

```js
import { Iterable } from 'immutable'

const loggerForImmutable = ({ getState }) => next => action => {

    function mapStoreImmutableToJs(store_object){
        let key_array = Object.keys(store_object)

        return key_array.reduce((pV, cV, cI) => {
          if(Iterable.isIterable(store_object[cV])){
            pV[cV] = store_object[cV].toJS()
          }else{
            pV[cV] = store_object[cV]
          }

          return pV
        }, {})
    }

    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', mapStoreImmutableToJs(getState()))

    return result
}

export default loggerForImmutable

```

其中有一個這樣的判斷，就是為了應對React-Redux-Router：

```js
if(Iterable.isIterable(store\_object\[cV\])){
......
}
```

React-Redux-Router會運用_syncHistoryWithStore_來讓React-Router的歷史同步於Redux Store中。然而，若你使用Immutable作為你其他State的基礎，而Logger Middleware又是以此為基礎來logging，為了應對不是Immutable的React-Router state，可以在你的整個架構中作兩種改變：

1.  把React-Router state也變為Immutable
2.  讓Logger能判斷個別state是否是Immutable

起初我是想採用第一個方式解決，按照React-Redux-Router官方文件中的[這段](https://github.com/reactjs/react-router-redux#what-if-i-use-immutablejs-with-my-redux-store)，你必須overwrite兩個地方：

1.  一個新的routerReducer，作用是能夠接受_LOCATION\_CHANGE_這action type，然後能合併payload（可參考[routerRedcer的原始碼](https://github.com/reactjs/react-router-redux/blob/master/src/reducer.js)）
2.  syncHistoryWithStore的selectLocationState，這個function其實就是routing state的selector（一樣可參考[syncHistoryWithStore](https://github.com/reactjs/react-router-redux/blob/master/src/sync.js)原始碼）

我自己最後是選擇了「讓Logger能判斷個別state是否是Immutable」，所以才有了上面的那段if 判斷。不過因為Immutable.js目前尚未有一個判斷是否是Immutable形式物件的函數，查詢後大多推薦使用Immutable.Iterable.isIterable這個函數來作為替代方案。主要是因為每一個Immutable.js object都是繼承Immtable.Iterable。

幾個我自己有實際使用的小節：

1.  運用原生_combineReducers_就能夠合理的使用混合式的immutable state
2.  在Middleware使用Immutable.Iterable.isIterable來判斷是否為Immutable.js的物件，再加以應對
