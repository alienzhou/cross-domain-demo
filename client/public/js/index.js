(function() {
    document.getElementById('btn-1').addEventListener('click', function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            console.log(xhr.readyState)
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
                alert(xhr.responseText);
            }
            else {
                console.error(xhr.responseText);
            }
        }
        xhr.open('get', 'http://127.0.0.1:3000/info/normal');
        xhr.send(null);
    });

    document.getElementById('btn-2').addEventListener('click', function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            console.log(xhr.readyState)
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
                alert(xhr.responseText);
            }
            else {
                console.error(xhr.responseText);
            }
        }
        xhr.open('get', '/proxy');
        xhr.send(null);
    });

    document.getElementById('btn-3').addEventListener('click', function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            console.log(xhr.readyState)
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
                alert(xhr.responseText);
            }
            else {
                console.error(xhr.responseText);
            }
        }
        xhr.open('get', 'http://test.az.com:3000/info/cors');
        xhr.send(null);
    });

    document.getElementById('btn-4').addEventListener('click', function() {
        var script = document.createElement('script');
        script.src = 'http://test.az.com:3000/info/jsonp?cb=myCallback';
        document.getElementsByTagName('head')[0].appendChild(script);
    });
}())

function myCallback(res) {
    alert(JSON.stringify(res));
}
