import os
from io import BytesIO
from flask import Flask, render_template, request, redirect, url_for, jsonify, send_file, abort
from PIL import Image as PILImage
from flask_sqlalchemy import SQLAlchemy
import base64

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

@app.route('/', methods=['GET', 'POST'])
def paintapp():
    if request.method == 'GET':
        return render_template("paint.html") 
 
@app.route('/save', methods=['POST'])
def save():
    try:
        image1 = request.form['realimg']
        image2 = request.form['drawimg']
        image1_data = base64.b64decode(image1.split(',')[1])
        image2_data = base64.b64decode(image2.split(',')[1])
        
        if image1 and image2:
            # Create a new Image object with the image data
            new_image = Image(real_image_data=image1_data, drawing_image_data=image2_data)
            db.session.add(new_image)
            db.session.commit()

            return jsonify({'message': 'Image uploaded successfully'})
        return jsonify({'message': 'Image not uploaded'})
    except Exception as e:
        db.session.rollback()
        render_template("save.html")
        return jsonify({'error': str(e)}), 400
        # return render_template("save.html")

@app.route('/view_image/<int:image_id>', methods=['GET'])
def view_image(image_id):
    image = Image.query.get(image_id)

    if image:
        # return send_file(BytesIO(image.drawing_image_data), mimetype='image/png')  # Adjust the mimetype as needed
        real_image = PILImage.open(BytesIO(image.real_image_data))
        draw_image = PILImage.open(BytesIO(image.drawing_image_data))

        # Combine the two images side by side
        combined_image = PILImage.new('RGB', (real_image.width + draw_image.width, real_image.height))
        combined_image.paste(real_image, (0, 0))
        combined_image.paste(draw_image, (real_image.width, 0))

        # Save the combined image to a BytesIO object
        combined_image_io = BytesIO()
        combined_image.save(combined_image_io, format='PNG')
        combined_image_io.seek(0)

        return send_file(combined_image_io, mimetype='image/png')
    else:
        abort(404)

@app.route('/images', methods=['GET'])
def view_all_images():
    images = Image.query.all()
    return render_template('view_all.html', images=images)

@app.route('/delete_image/<int:image_id>', methods=['GET'])
def delete_image(image_id):
    image = Image.query.get(image_id)
    if image:
        db.session.delete(image)
        db.session.commit()

        images = Image.query.all()
        return redirect('/images')
    else:
        return redirect('/images')

if __name__ == '__main__':
    
    with app.app_context():
        db.create_all()
        
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
