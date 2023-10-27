document.addEventListener("DOMContentLoaded", function () {
    let isDrawing = false;
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let drawing = false;

    const penTool = document.getElementById("pen-tool");
    const eraserTool = document.getElementById("eraser-tool");

    // Get the clear button element
    const clearButton = document.getElementById("clear-button");

    // Set up event listeners for touch/stylus input
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    // Set the pointer type to 'pen' to distinguish between touch and stylus
    canvas.style.touchAction = 'none';

    function handlePointerDown(e) {
        if (e.pointerType === 'pen' || e.pointerType === 'touch') {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
        }
    }

    function handlePointerMove(e) {
        if (drawing && (e.pointerType === 'pen' || e.pointerType === 'touch')) {
            ctx.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
            ctx.stroke();
        }
    }

    function handlePointerUp(e) {
        if (drawing && (e.pointerType === 'pen' || e.pointerType === 'touch')) {
            drawing = false;
            ctx.closePath();
        }
    }

    clearButton.addEventListener("click", function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    penTool.addEventListener("click", function () {
        penMode = true;
        penTool.classList.add("active");
        eraserTool.classList.remove("active");
        ctx.globalCompositeOperation = "source-over"; // Set to draw mode
        ctx.lineWidth = 1;
    });

    eraserTool.addEventListener("click", function () {
        penMode = false;
        eraserTool.classList.add("active");
        penTool.classList.remove("active");
        ctx.globalCompositeOperation = "destination-out"; // Set to erase mode (make transparent)
        ctx.lineWidth = 10;
    });

    // Add the "active" class to the pen tool initially
    penTool.classList.add("active");

    document.getElementById("save-button").addEventListener("click", function () {
        const imageData = canvas.toDataURL(); // Convert canvas to a data URL
        const imageInput = document.getElementById("image-data");
        imageInput.value = imageData;

        // Submit the form to send the image data to the server
        document.getElementById("image-form").submit();
    });

    canvas.addEventListener('touchend', () => {
        isDrawing = false;
        context.closePath();
    });

    clearButton.addEventListener("click", function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    penTool.addEventListener("click", function () {
        penMode = true;
        penTool.classList.add("active");
        eraserTool.classList.remove("active");
        ctx.globalCompositeOperation = "source-over"; // Set to draw mode
        ctx.lineWidth = 1;
    });

    eraserTool.addEventListener("click", function () {
        penMode = false;
        eraserTool.classList.add("active");
        penTool.classList.remove("active");
        ctx.globalCompositeOperation = "destination-out"; // Set to erase mode (make transparent)
        ctx.lineWidth = 10;
    });

    // Add the "active" class to the pen tool initially
    penTool.classList.add("active");

    canvas.addEventListener("mousedown", function (e) {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    });

    canvas.addEventListener("mousemove", function (e) {
        if (drawing) {
            ctx.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
            ctx.stroke();
        }
    });

    canvas.addEventListener("mouseup", function () {
        drawing = false;
    });

    document.getElementById("save-button").addEventListener("click", function () {
        const imageData = canvas.toDataURL(); // Convert canvas to a data URL
        const imageInput = document.getElementById("image-data");
        imageInput.value = imageData;
    
        // Submit the form to send the image data to the server
        document.getElementById("image-form").submit();
    });
});
