# ajax跨域的三种常用方案
在myweb与thirdparty目录下分别运行这两个项目
```
cd myweb
npm run start
```
```
cd thirdparty
npm run start
```

## 方案一、使用代理（proxy）
同源政策是浏览器层面的限制。那么，如果不在前端跨域，而将“跨域”的任务交给后端服务，就规避了同源政策。

这就是“代理”。这个代理可以将我们的请求转发，而后端并不会有所谓的同源政策限制。这个“代理”也可以理解为一个同域的后端服务。

由于我们的myweb是一个完整的web项目（包括前端界面和后端服务），因此，我们可以在myweb项目的后端添加一个`proxy`接口，专门处理各类跨域ajax请求的转发。
```javascript
const express = require('express');
const router = express.Router();
const request = require('request');

router.get('*', (req, res, next) => {
    let path = req.path.replace(/^\/proxy/, '');
    request.get(`http://127.0.0.1:3000${path}`, (err, response) => {
        res.json(JSON.parse(response.body));
    });
});

module.exports = router;
```
这样，我们在前端访问`/proxy/info/normal`后，就会自动转发到`http://127.0.0.1:3000/proxy/info/normal`。

前端ajax部分如下：
```javascript
document.getElementById('btn-1').addEventListener('click', function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert(xhr.responseText);
        }
    }
    xhr.open('get', '/proxy/info/normal');
    xhr.send(null);
});
```
该方法的优点很明显：不需要第三方服务`http://127.0.0.1:3000/info/normal`进行任何改造。

当然，该方法也有一些缺点：
- 首先，需要你有一个自己的后端服务能够接收并转发请求。如果你进行本地的纯静态页面开发，则需要一些浏览器插件或自动化工具中集成的本地服务器来实现。
- 此外，如果请求包含一些特殊的请求头（例如cookie等等），需要在转发时特殊处理。

下面两种方法则需要第三方服务端或多或少进行配合改造。

### 方案二、CORS
同源策略往往过于严格了，为了解决浏览器的这个问题，w3c提出了CORS（Cross-Origin Resource Sharing）标准。CORS通过相应的请求头与响应头来实现跨域资源访问。

如果我们打开控制台，可以在请求头中发现一个叫`origin`的头信息，它表明了请求的来源。这是浏览器自动添加的。
```
Referer: http://127.0.0.1:8085/
Origin: http://127.0.0.1:8085   <============   origin
Accept: */*
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8
Pragma: no-cache
```
与之对应的，服务器端的响应头中一个头信息为`Access-Control-Allow-Origin`，表明接受的跨域请求来源。显而易见，这两个信息如果一致，则这个请求就会被接受。
```javascript
router.get('/cors', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8085');
    res.json(data);
});
```
如果将`Access-Control-Allow-Origin`的值设置为`*`，则会接受所有域的请求。这时的客户端不需要任何配置即可进行跨域访问。

然而，还有一个问题，CORS默认是不会发送cookie，但是如果我希望这次的请求也能够带上对方服务所需的cookie怎么办？那就需要再进行一定的改造。

与`Access-Control-Allow-Origin`相配套的，还有一个叫`Access-Control-Allow-Credentials`的响应头，如果设置为`true`则表明服务器允许该请求内包含cookie信息。
```javascript
router.get('/cors', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8085');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.json(data);
});
```
同时，在客户端，还需要在ajax请求中设置`withCredentials`属性为`true`。
```javascript
document.getElementById('btn-1').addEventListener('click', function() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;  // 设置withCredentials以便发送cookie
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert(xhr.responseText);
        }
    }
    xhr.open('get', 'http://127.0.0.1:3000/info/cors');  // 跨域请求
    xhr.send(null);
});
```
可以看到，CORS方法有如下优点：
- 简单，几乎不需要什么开发量，只需要简单配置相应的请求与响应头信息即可。
- 支持各种类型的请求（`get`, `post`, `put`等等）。

但缺点是：
- 需要对跨域的服务接口进行一定的改造。如果该服务因为某些原因无法改造，则无法实现。但这种改造还是相对较小的。
- 不兼容一些“古董”浏览器。

### 方案三、jsonp
jsonp是跨域领域中历史非常传统的一种方法。如果你还记得第一部分中我们提到过的内容，一些跨域请求是不会受到同源政策的限制的。其中，`script`标签就是一个。

在`script`标签中我们可以引用其他服务上的脚本，最常见的场景就是CDN。因此，有人想到，当有跨域请求到来时，如果我们可以把客户端需要的数据写到javascript脚本文件中并返回给客户端，那么客户端就可以拿到这些数据并使用了。具体是怎样一个流程呢？
1. 首先，在myweb端，我们可以预先定义一个处理函数，叫它`callback`；
2. 然后，在myweb端，我们动态创建一个script标签，并将该标签的`src`属性指向跨域的接口，并将`callback`函数名作为请求的参数；
3. 跨域的thirdparty端接受到该请求后，返回一个javascript脚本文件，用`callback`函数包裹住数据；
4. 这时候，前端收到响应数据会自动执行该脚本，这样便会自动执行预先定义的`callback`函数。

将上面这个方法具体成下面的代码：
```javascript
// myweb 部分
// 1. 创建回调函数callback
function myCallback(res) {
    alert(JSON.stringify(res, null , 2));
}
document.getElementById('btn-4').addEventListener('click', function() {
    // 2. 动态创建script标签，并设置src属性，注意参数cb=myCallback
    var script = document.createElement('script');
    script.src = 'http://127.0.0.1:3000/info/jsonp?cb=myCallback';
    document.getElementsByTagName('head')[0].appendChild(script);
});
```
```javascript
// thirdparty
router.get('/jsonp', (req, res, next) => {
    var str = JSON.stringify(data);
    // 3. 创建script脚本内容，用`callback`函数包裹住数据
    // 形式：callback(data)
    var script = `${req.query.cb}(${str})`;
    res.send(script);
});
// 4. 前端收到响应数据会自动执行该脚本
```
当然，如果你是用类似jquery这样的库，其中的`$.ajax`本身是封装了JSONP方式的：
```javascript
$.ajax({
    url: 'http://127.0.0.1:3000/info/jsonp?cb=myCallback',
    dataType: 'jsonp', // 注意，此处dataType的值表示请求使用JSONP
    jsonp: 'cb', // 请求query中callback函数的键名
}).done(function (res) {
    alert(JSON.stringify(res, null , 2));
});
```
JSONP作为一个久远的方法，其最大的优点就是兼容性非常好。

但是其缺点也很明显，由于是通过`script`标签发起的请求，因此只支持`get`请求。同时可以看到，较之CORS，其前后端改造开发量要稍高一些。如果跨域服务端不支持改造，那么也无法使用该方法。
