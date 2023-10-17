from flask import Flask, render_template, request, Response
from PIL import Image
import io
import base64  # Import the base64 module

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process_image", methods=["POST"])
def process_image():
    # Get the image data from the form
    image_data = request.form.get("image_data")

    # Convert the data URL to a PIL Image
    image = Image.open(io.BytesIO(base64.b64decode(image_data.split(',')[1])))

    # Save the image as a PNG without the background
    output = io.BytesIO()
    image.save(output, format="PNG")

    # Create a Flask Response with the image data
    response = Response(output.getvalue())
    response.headers["Content-Type"] = "image/png"
    response.headers["Content-Disposition"] = "attachment; filename=transformed_image.png"

    return response

if __name__ == "__main__":
    app.run(debug=True)
