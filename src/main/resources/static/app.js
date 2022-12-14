var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var messiCallback = function(theObject){
        var point = JSON.parse(theObject.body);
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    }


    var connectAndSubscribe = function (id) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + id, function (ola) {
                console.log(id)
                messiCallback(ola);
            });
        });

    };
    
    

    return {

        init: function () {
            //websocket connection
            connectAndSubscribe();
            document.getElementById("canvas").addEventListener("click", function(e){
                var point = getMousePosition(e);
                app.publishPoint(point.x, point.y)
            })
        },

        connect: function(id){
            app.disconnect();
            connectAndSubscribe(id);
            document.getElementById("canvas").addEventListener("click", function(e){
                var point = getMousePosition(e);
                app.publishPoint(point.x, point.y, id)
            })
        },

        publishPoint: function(px,py,id){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            //addPointToCanvas(pt);
            //publicar el evento
            stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt)); 
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            //setConnected(false);
            console.log("Disconnected");
        }
    };

})();