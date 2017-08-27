(function() {
    document.getElementById('btn-1').addEventListener('click', function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                alert(xhr.responseText);
            }
        }
        xhr.open('get', 'http://127.0.0.1:3000/info/normal');
        xhr.send(null);
    });

    document.getElementById('btn-2').addEventListener('click', function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                alert(xhr.responseText);
            }
        }
        xhr.open('get', '/proxy/info/normal');
        xhr.send(null);
    });

    document.getElementById('btn-3').addEventListener('click', function() {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                alert(xhr.responseText);
            }
        }
        xhr.open('get', 'http://127.0.0.1:3000/info/cors');
        xhr.send(null);
    });

    document.getElementById('btn-4').addEventListener('click', function() {
        var script = document.createElement('script');
        script.src = 'http://127.0.0.1:3000/info/jsonp?cb=myCallback';
        document.getElementsByTagName('head')[0].appendChild(script);
    });

    document.getElementById('btn-5').addEventListener('click', function() {
        $.ajax({
            url: 'http://127.0.0.1:3000/info/jsonp?cb=myCallback',
            dataType: 'jsonp',
            jsonp: 'cb',
        }).done(function (res) {
            alert(JSON.stringify(res, null , 2));
        });
    });
}())

function myCallback(res) {
    alert(JSON.stringify(res, null , 2));
}
