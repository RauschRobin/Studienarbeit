from flask import Flask, render_template, request, Response
from PIL import Image
import io
import base64  # Import the base64 module
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# Database ------------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///images.db'
db = SQLAlchemy(app)

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    real_image_data = db.Column(db.LargeBinary)
    drawing_image_data = db.Column(db.LargeBinary)



# Define the custom b64encode filter
def b64encode_image(image_data):
    return base64.b64encode(image_data).decode('utf-8')

# Register the custom filter with Jinja2
app.jinja_env.filters['b64encode'] = b64encode_image

#---------------------------------------

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
