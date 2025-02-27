from flask import Flask, request, jsonify, send_file, g
from flask_cors import CORS  # Add this import
from flask_socketio import SocketIO
import os
import zipfile
import io
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt
from single_student import init_routes as init_single_student_routes, check_graduation_requirements, parse_grades, extract_multi_grades
from multi_student import init_routes as init_multi_student_routes, unpack_all, get_histogram_image
import logging  # Add this import
UPLOAD_FOLDER = "/Users/roshanshah/Downloads/pythonfinal/flask_server/uploads"

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.DEBUG)

socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize routes for single and multi student processing
init_single_student_routes(app)
init_multi_student_routes(app)


uploaded_files = {}  # Global dictionary to store uploaded files

@app.route('/upload-multi-student', methods=['POST', 'OPTIONS'])
def upload_files():
    global uploaded_files  # Make sure we modify the global dictionary
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files part"}), 400
        
        files = request.files.getlist('files')
        for file in files:
            base_filename = os.path.basename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, base_filename)
            file.save(file_path)
            print(base_filename)
            uploaded_files[base_filename] = file_path #Use the base filename.
        return jsonify({"message": "Files uploaded successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/chart', methods=['GET'])
def chart():
    try:
        files = os.listdir(UPLOAD_FOLDER)
        if not files:
            return jsonify({"error": "No uploaded files found"}), 400

        cdata, cdata_course = unpack_all(files)
        img = get_histogram_image(cdata, cdata_course)
        
        return send_file(img, mimetype='image/png')
    
    except Exception as e:
        print("Error generating chart:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/check-graduation', methods=['GET'])
def check_graduation():
    try:
        if not os.path.exists(UPLOAD_FOLDER):
            return jsonify({"error": "Upload folder not found"}), 400
        
        files = os.listdir(UPLOAD_FOLDER)
        if not files:
            return jsonify({"error": "No uploaded files found"}), 400

        results = {}
        for file in files:
            file_path = os.path.join(UPLOAD_FOLDER, file)
            # Log file path to verify it's correct
            print(f"Processing file: {file_path}")
            results[file] = extract_multi_grades(file_path)
        return jsonify(results), 200
    except Exception as e:
        # Catch and return the actual error message
        return jsonify({"error": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)