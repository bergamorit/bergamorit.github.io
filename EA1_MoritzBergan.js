var isConstantlyAnimated = false;
var bildNummer = 1;
const speed = 40;


window.onkeydown = function(evt) {

    var key = evt.which ? evt.which : evt.keyCode;
    var c = String.fromCharCode(key);
    switch (c) {
    case ('A'):
            isConstantlyAnimated = !isConstantlyAnimated;
            animateImage();
            break;
    case ('L'):
            isConstantlyAnimated = false;
            break;
    case ('R'):
            turnRight();
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

//Rechts drehen
function turnRight(){
    var imageObj = new Image();
    imageObj.onload = function() {
        var img = document.getElementById('vinyl');
        img.setAttribute('src', this.src);
    }
    imageObj.src = "textures/" + "Vinyl" + bildNummer + ".png";

    //Scheibe eine Stufe nach rechts
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