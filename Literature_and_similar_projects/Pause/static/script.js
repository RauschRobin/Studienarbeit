var canvas = document.getElementById("paint");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var curX, curY, prevX, prevY;
var hold = false;
ctx.lineWidth = 2;
var fill_value = true;
var stroke_value = false;
var canvas_data = {"pencil": [], "line": [], "rectangle": [], "circle": [], "eraser": []}
var upload_image_name;
 

// ------------------------------------------------------------
const imageInput = document.getElementById('imageInput');
const drawingCanvas = document.getElementById('drawingCanvas');

imageInput.addEventListener('change', function () {
    const file = imageInput.files[0];
    const image = new Image();
    const reader = new FileReader();
    upload_image_name = file.name;

    reader.onload = function (e) {
        image.src = e.target.result;
    };

    reader.readAsDataURL(file);

    image.onload = function () {
        drawingCanvas.style.backgroundImage = 'url(' + image.src + ')';
    };
});
// ------------------------------------------------------------


function color(color_value){
    ctx.strokeStyle = color_value;
    ctx.fillStyle = color_value;
}    
        
function add_pixel(){
    ctx.lineWidth += 1;
}
        
function reduce_pixel(){
    if (ctx.lineWidth == 1){
        ctx.lineWidth = 1;
    }
    else{
        ctx.lineWidth -= 1;
    }
}
        
function fill(){
    fill_value = true;
    stroke_value = false;
}
        
function outline(){
    fill_value = false;
    stroke_value = true;
}
               
function reset(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas_data = { "pencil": [], "line": [], "rectangle": [], "circle": [], "eraser": [] }
}
        
// pencil tool
function pencil() {
    canvas.onmousedown = function(e) {
        curX = e.clientX - canvas.getBoundingClientRect().left;
        curY = e.clientY - canvas.getBoundingClientRect().top;
        hold = true;

        prevX = curX;
        prevY = curY;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
    };

    canvas.onmousemove = function(e) {
        if (hold) {
            curX = e.clientX - canvas.getBoundingClientRect().left;
            curY = e.clientY - canvas.getBoundingClientRect().top;
            draw();
        }
    };

    canvas.onmouseup = function() {
        hold = false;
    };

    canvas.onmouseout = function() {
        hold = false;
    };

    function draw() {
        ctx.lineTo(curX, curY);
        ctx.stroke();
        canvas_data.pencil.push({ "startx": prevX, "starty": prevY, "endx": curX, "endy": curY, "thick": ctx.lineWidth, "color": ctx.strokeStyle });
        prevX = curX;
        prevY = curY;
    }
}

        
// line tool
        
function line(){
           
    canvas.onmousedown = function (e){
        img = ctx.getImageData(0, 0, width, height);
        prevX = e.clientX - canvas.offsetLeft;
        prevY = e.clientY - canvas.offsetTop;
        hold = true;
    };
            
    canvas.onmousemove = function linemove(e){
        if (hold){
            ctx.putImageData(img, 0, 0);
            curX = e.clientX - canvas.offsetLeft;
            curY = e.clientY - canvas.offsetTop;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(curX, curY);
            ctx.stroke();
            canvas_data.line.push({ "starx": prevX, "starty": prevY, "endx": curX, "endY": curY, "thick": ctx.lineWidth, "color": ctx.strokeStyle });
            ctx.closePath();
        }
    };
            
    canvas.onmouseup = function (e){
         hold = false;
    };
            
    canvas.onmouseout = function (e){
         hold = false;
    };
}
        
// eraser tool
        
function eraser(){
    
    canvas.onmousedown = function(e){
        curX = e.clientX - canvas.offsetLeft;
        curY = e.clientY - canvas.offsetTop;
        hold = true;
            
        prevX = curX;
        prevY = curY;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
    };
        
    canvas.onmousemove = function(e){
        if(hold){
            curX = e.clientX - canvas.offsetLeft;
            curY = e.clientY - canvas.offsetTop;
            erase();
        }
    };
        
    canvas.onmouseup = function(e){
        hold = false;
    };
        
    canvas.onmouseout = function(e){
        hold = false;
    };
        
    function erase(){
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(curX, curY);
        ctx.lineWidth = ctx.lineWidth; // Keep the same line width as the pen
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        canvas_data.eraser.push({ "startx": prevX, "starty": prevY, "endx": curX, "endy": curY, "thick": ctx.lineWidth });
        prevX = curX;
        prevY = curY;
    }    
}  
function download(){
    if(upload_image_name){

        const drawingImage = canvas.toDataURL('image/png');
        const lastDotIndex = upload_image_name.lastIndexOf(".");
    
        if (lastDotIndex > 0) {
            // Remove the existing extension and add the new one
            const filenameWithoutExtension = upload_image_name.substr(0, lastDotIndex -1);
            downloadFilename = filenameWithoutExtension.concat("_drawing.png");
        } else {
            // If there is no existing extension, simply add the new one
            downloadFilename = upload_image_name.concat("_drawing.png");
        }
    
        const downloadLink = document.createElement('a');
        downloadLink.href = drawingImage;
        downloadLink.download = downloadFilename;
        downloadLink.click();
    
    }
}

async function save(){

    let ctext = "Are you sure?";
    if (confirm(ctext) != true) {
        return ;
    } 
    
    const drawingImage = canvas.toDataURL('image/png');

    //-----------------------------------------
    var c = document.createElement('canvas');
    var element = drawingCanvas;
    var img = new Image();
    
    // Get the background image URL from the element's style
    var backgroundImage = getComputedStyle(element).getPropertyValue('background-image');
    var imageURL = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');

    img.src = imageURL;

    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var realimage = c.toDataURL();

    try {
        const formData = new FormData();
        formData.append('drawimg', drawingImage);
        formData.append('realimg', realimage);
    
        const response = await fetch('/save', {
          method: 'POST',
          body: formData,
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log('Image uploaded:', data);
        } else {
          console.error('Image upload failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    
    //----------------------------------------------
} 
async function updatedb(image_id){

    let ctext = "Are you sure?";
    if (confirm(ctext) != true) {
        return ;
    } 
    
    const drawingImage = canvas.toDataURL('image/png');

    //-----------------------------------------
    var c = document.createElement('canvas');
    var element = drawingCanvas;
    var img = new Image();
    
    // Get the background image URL from the element's style
    var backgroundImage = getComputedStyle(element).getPropertyValue('background-image');
    var imageURL = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');

    img.src = imageURL;

    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    try {
        const formData = new FormData();
        formData.append('drawimg', drawingImage);
        formData.append('image_id', image_id);
    
        const response = await fetch('/save', {
          method: 'POST',
          body: formData,
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log('Image uploaded:', data);
          location.reload();
        } else {
          console.error('Image upload failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    
    //----------------------------------------------
} 
