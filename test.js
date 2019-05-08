const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

var i = 0;
send = function() {
    console.log("hello")
    if (i <= 5)
        wait(5000).then(send);

    i++;
}
send();