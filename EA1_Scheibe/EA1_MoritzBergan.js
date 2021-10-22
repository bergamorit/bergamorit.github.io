///Animation Scheibe///
var isConstantlyAnimated = false;
var bildNummer = 1;
const speed = 40;
var clickedLeft = false;
var clickedRight = false;


window.onkeydown = function(evt) {
    console.log(evt);
    var key = evt.which ? evt.which : evt.keyCode;
    var c = String.fromCharCode(key);
    switch (c) {
    case ('A'):
            isConstantlyAnimated = !isConstantlyAnimated;
            animateImage();
            break;
    case ('L'):
        if (!clickedLeft) {
            turnLeft();
            clickedLeft = true;
        }
        break;
    case ('R'):
        if (!clickedRight) {
            turnRight();
            clickedRight = true;
        }
        break;
    }
}

window.onkeyup = function(evt) {
    console.log(evt);
    var key = evt.which ? evt.which : evt.keyCode;
    var c = String.fromCharCode(key);
    switch (c) {
    case ('L'):
        clickedLeft = false;
        break;
    case ('R'):
        clickedRight = false;
        break;
    }
}

//Animation initiieren
function animateImage() {
    var imageObj = new Image();
    imageObj.onload = function() {
        var img = document.getElementById('vinyl');
        img.setAttribute('src', this.src);
    }
    imageObj.src = "textures/" + "Vinyl" + bildNummer + ".png";

    //Konstant animiert
    if(isConstantlyAnimated == true){
        animationInterval = setInterval(() => {
            if (bildNummer < 36) {
                bildNummer ++;
            } else {
                bildNummer = 1;
            }
            imageObj.src = "textures/" + "Vinyl" + bildNummer + ".png";
        }, speed)
    }else{
        clearInterval(animationInterval);
        for (var i = 0; i < animationInterval; i++)
        {
            window.clearInterval(i);
        }
    }
}

//Links drehen
function turnLeft(){
    var imageObj = new Image();
    imageObj.onload = function() {
        var img = document.getElementById('vinyl');
        img.setAttribute('src', this.src);
    }
    imageObj.src = "textures/" + "Vinyl" + bildNummer + ".png";

    //Scheibe eine Stufe nach links drehen
    if(isConstantlyAnimated == true){
        clearInterval(animationInterval);
            for (var i = 0; i < animationInterval; i++){
                window.clearInterval(i);
            }
    isConstantlyAnimated = false;
    }
    if (bildNummer > 1) {
            bildNummer --;
    } else {
            bildNummer = 36;
    }
    imageObj.src = "textures/" + "Vinyl" + bildNummer + ".png";
}

//Rechts drehen
function turnRight(){
    var imageObj = new Image();
    imageObj.onload = function() {
        var img = document.getElementById('vinyl');
        img.setAttribute('src', this.src);
    }
    imageObj.src = "textures/" + "Vinyl" + bildNummer + ".png";

    //Scheibe eine Stufe nach rechts drehen
    if(isConstantlyAnimated == true){
        clearInterval(animationInterval);
            for (var i = 0; i < animationInterval; i++){
                window.clearInterval(i);
            }
    isConstantlyAnimated = false;
    }
    if (bildNummer < 36) {
            bildNummer ++;
    } else {
            bildNummer = 1;
    }
    imageObj.src = "textures/" + "Vinyl" + bildNummer + ".png";
}