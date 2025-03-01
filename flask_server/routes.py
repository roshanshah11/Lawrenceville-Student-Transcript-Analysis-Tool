from flask import Flask, request, jsonify, send_file, g, Blueprint
from flask_cors import CORS  # Add this import
from flask_socketio import SocketIO
import re
import PyPDF2
import os
import io
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename
import logging  # Add this import

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# Constants and Blueprint setup
UPLOAD_FOLDER = "/Users/roshanshah/Downloads/pythonfinal/flask_server/uploads"
multi_student_bp = Blueprint('multi_student', __name__)
uploaded_files = {}  # Global dictionary to store uploaded files

# Initialize routes
def init_routes(app):

    CORS(app)  # Add this line to enable CORS for routes
    course_category = {
        'Arts': 'VA',
        'English': 'EN',
        'Humanities-English': 'HU201',
        'Humanities-Cultural Studies': 'HU204',
        'History': 'HI',
        'Interdisciplinary': 'IN',
        'Language': 'LA',
        'Mathematics': 'MA',
        'Religion & Philosophy': 'RP',
        'Science': 'SC'
    }

    gpa_letter_to_num = {
        'A+': 4.3, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0,
        'F': 0.0
    }

    def create_data_container():
        cdata = {}
        cdata_course = {}
        
        for year in range(2025 - 9, 2025 + 1):
            key_year = str(year - 1) + '-' + str(year)
            cdata[key_year] = {}
            cdata_course[key_year] = {}
            for grade in range(9, 12 + 1):
                cdata[key_year][grade] = {}
                cdata_course[key_year][grade] = {}
                for term in range(1, 3 + 1):
                    cdata[key_year][grade][term] = []
                    cdata_course[key_year][grade][term] = {}
                    for course, course_ab in course_category.items():
                        cdata_course[key_year][grade][term][course_ab] = []
                cdata[key_year][grade]['Year Average'] = []
        return cdata, cdata_course

    def my_unpack(grades_dict, cdata, cdata_course):
        for new_data in grades_dict['Grades']:
            temp_term = 1
            for term_gpa in new_data['Term GPAs']:
                cdata[new_data['Year']][int(new_data['Grade Level'])][temp_term].append(term_gpa)
                temp_term += 1
            for i in range(0, 15):
                if not ((new_data['Courses'][i]['Grade'] == 'P') or (new_data['Courses'][i]['Grade'] == 'IP')):
                    course_abbreviation = (new_data['Courses'][i]['Course'])[0:2]
                    if course_abbreviation == 'HU':
                        course_abbreviation = (new_data['Courses'][i]['Course'])[0:5]
                    cdata_course[new_data['Year']][int(new_data['Grade Level'])][int(i/5) + 1][course_abbreviation].append(gpa_letter_to_num[new_data['Courses'][i]['Grade']])
            cdata[new_data['Year']][int(new_data['Grade Level'])]['Year Average'].append(new_data['Year Average'])

    def unpack_all(files):
        cdata, cdata_course = create_data_container()
        for file in files:
            file_path = os.path.join(UPLOAD_FOLDER, file)
            output_filename = "extracted_transcript.txt"
            extracted_data = extract_transcript_data(file_path, output_filename)
            grades_dict = parse_grades(output_filename)
            my_unpack(grades_dict, cdata, cdata_course)
        print("Uploaded files:", os.listdir(UPLOAD_FOLDER))
        #print("cdata:", cdata)
        #print("cdata_course:", cdata_course)
        return cdata, cdata_course

    def get_histogram_image(cdata=None, cdata_course=None, yrs=2024, yre=2025, s_grade=12, e_grade=12, s_term=1, e_term=3):

        year_range = str(yrs) + '-' + str(yre)
        list_hist = []
        list_hist2 = []
        course_list = list(course_category.keys())

        for grade in range(s_grade, e_grade + 1):
            for term in range(s_term, e_term + 1):
                try:
                    list_hist = list(list_hist + cdata[year_range][grade][term])
                except KeyError:
                    pass  # Continue if key not found.

        for grade in range(s_grade, e_grade + 1):
            for term in range(s_term, e_term + 1):
                for temp_course_type in course_list:
                    try:
                        list_hist2.extend(cdata_course[year_range][grade][term][course_category[temp_course_type]])
                    except KeyError:
                        pass  # Continue if key not found.
        if not list_hist2:
            raise ValueError("The input list (list_hist2) is empty. Cannot create a histogram.")
        print("list_hist2:", list_hist2)
        plt.hist(list_hist2, bins=32, color='skyblue', edgecolor='black')
        plt.xlabel('GPA')
        plt.ylabel('Frequency')

        # Save the image to a BytesIO stream
        img_io = io.BytesIO()
        plt.savefig(img_io, format='png')
        plt.close()  # Close the plot to free memory
        img_io.seek(0)

        return img_io

    def extract_transcript_data(pdf_path, output_filename="transcript_data.txt"):
        transcript = PyPDF2.PdfReader(pdf_path)
        all_text = ""
        enrollment_found = False

        for i in range(len(transcript.pages)):
            page_text = transcript.pages[i].extract_text()
            all_text += page_text
            if re.search(r"Enrolled:\s*\d{2}/\d{2}/\d{4}", page_text):
                enrollment_found = True
                break

        if enrollment_found:
            split_text = re.split(r"Enrolled:\s*\d{2}/\d{2}/\d{4}", all_text)
            text_to_save = split_text[0].strip()
            with open(output_filename, "w") as outfile:
                outfile.write(text_to_save)
            return text_to_save
        else:
            return "Enrollment date not found in the PDF."

    def parse_grades(filepath):
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        data = {"Grades": []}
        current_grade = None
        current_courses = []
        term_gpas = []
        sex = ""

        for line in lines:
            line = line.strip()
            match = re.search(r"Sex:\s*(Male|Female)", line)
            if match:
                sex_full = match.group(1).lower()
                sex = "M" if sex_full == "male" else "F"

        for line in lines:
            line = line.strip()        

            match = re.match(r"Grade (\d+) (\d{4}-\d{4}) Grade \d+ Year Average: ([\d.]+)", line)
            if match:
                if current_grade:
                    current_grade["Courses"] = current_courses
                    current_grade["Term GPAs"] = term_gpas
                    data["Grades"].append(current_grade)

                grade_level = match.group(1)
                year = match.group(2)
                year_avg = float(match.group(3))
                current_grade = {
                    "Grade Level": grade_level,
                    "Sex": sex,
                    "Year": year,
                    "Year Average": year_avg,
                    "Courses": [],
                    "Term GPAs": []
                }
            
                current_courses = []  # Reset course list for new grade
                term_gpas = []  # Reset GPA list for new grade

            elif "Term GPA" in line:
                matches = re.findall(r"Term GPA: ([\d.]+)", line)
                term_gpas.extend(map(float, matches))
            
            elif line and not line.startswith("Term GPA"):
                line = re.sub(r"([A-Za-z]{2}\d{3})", r"\n\1", line)
                course_entries = line.split("\n")

                for entry in course_entries:
                    match = re.match(r"([A-Za-z]{2}\d{3}) .* (.{1,2})$", entry)
                    if match:
                        course_code = match.group(1)
                        grade = match.group(2).strip()
                        current_courses.append({"Course": course_code, "Grade": grade})
                    else:
                        match_no_grade = re.match(r"([A-Za-z]{2}\d{3}) (.*)", entry)
                        if match_no_grade:
                            course_code = match_no_grade.group(1)
                            grade = "IP" 
                            current_courses.append({"Course": course_code, "Grade": grade})

        if current_grade:
            current_grade["Courses"] = current_courses
            current_grade["Term GPAs"] = term_gpas
            current_grade["Sex"] = sex
            data["Grades"].append(current_grade)

        return data
    def extract_multi_grades(file):
        print(file)
        if file:
            output_filename = "extracted_transcript.txt"
            extracted_data = extract_transcript_data(file, output_filename)
            grades_dict = parse_grades(output_filename)
            graduation_check = check_graduation_requirements(grades_dict)
            return {"graduation_check": graduation_check}

    def check_graduation_requirements(dataset):
        requirements = {
            '9': {
                'Arts': 3,
                'English': 9,
                'Humanities-English': 3,
                'History': 6,
                'Humanities-Cultural Studies': 3,
                'Interdisciplinary': 2,
                'Language': 3,
                'Mathematics': 1,
                'Religion & Philosophy': 2,
                'Science': 9,
            },
            '10': {
                'Arts': 2,
                'English': 9,
                'History': 6,
                'Interdisciplinary': 2,
                'Language': 3,
                'Mathematics': 1,
                'Religion & Philosophy': 2,
                'Science': 6,
            },
            '11': {
                'Arts': 1,
                'English': 6,
                'History': 3,
                'Interdisciplinary': 2,
                'Language': 2,
                'Mathematics': 1,
                'Religion & Philosophy': 1,
                'Science': 3,
            },
            '12': {
                'Arts': 1,
                'English': 2,
                'History': 2,
                'Interdisciplinary': 1,
                'Language': 2,
                'Mathematics': 1,
                'Religion & Philosophy': 1,
            },
        }

        if not dataset['Grades']:
            return {"error": "No grades available. Cannot determine graduation eligibility."}

        starting_grade = dataset['Grades'][0]['Grade Level']
        if starting_grade not in requirements:
            return {"error": f"Starting grade {starting_grade} is not supported."}

        required_courses = requirements[starting_grade]

        course_counts = {category: 0 for category in required_courses.keys()}
        math_level_met = False  

        for year_data in dataset['Grades']:
            for course_data in year_data['Courses']:
                course = course_data['Course']

                course_counts['Arts'] += int(course.startswith('VA'))
                course_counts['English'] += int(course.startswith('EN'))
                course_counts['Humanities-English'] += int(course.startswith('HU201'))
                course_counts['Humanities-Cultural Studies'] += int(course.startswith('HU204'))
                course_counts['History'] += int(course.startswith('HI'))
                course_counts['Interdisciplinary'] += int(course.startswith('IN'))
                course_counts['Language'] += int(course.startswith('LA'))
                course_counts['Mathematics'] += int(course.startswith('MA'))
                math_level_met = (int(course[2:5]) >= 400)
                course_counts['Religion & Philosophy'] += int(course.startswith('RP'))
                course_counts['Science'] += int(course.startswith('SC'))

        requirements_data = {"Graduation Requirements": required_courses}
        progress_data = {"Student Progress": {}}
        met_all_requirements = True

        for category, required_count in required_courses.items():
            student_count = course_counts[category]

            if category == "Mathematics":
                if not math_level_met:
                    progress_data["Student Progress"][category] = f"❌ Required 400+ level course. Not met."
                    met_all_requirements = False
                elif student_count >= required_count:
                    progress_data["Student Progress"][category] = f"{category}:✅ {student_count}/{required_count} (Met)"
                else:
                    progress_data["Student Progress"][category] = f"{category}:❌ {student_count}/{required_count} (Not met)"
                    met_all_requirements = False
            else:
                if student_count >= required_count:
                    progress_data["Student Progress"][category] = f"{category}:✅ {student_count}/{required_count} (Met)"
                else:
                    progress_data["Student Progress"][category] = f"{category}:❌ {student_count}/{required_count} (Not met)"
                    met_all_requirements = False

        return {
            "requirements": requirements_data,
            "progress": progress_data,
            "met_all_requirements": met_all_requirements
        }

    @app.route('/extract-grades', methods=['POST'])
    def extract_grades():
        if 'file' not in request.files:
            return jsonify({"error": "No file part"})

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"})

        if file:
            file.save(file.filename)
            output_filename = "extracted_transcript.txt"
            extracted_data = extract_transcript_data(file.filename, output_filename)
            grades_dict = parse_grades(output_filename)
            graduation_check = check_graduation_requirements(grades_dict)
            return jsonify({"grades": grades_dict, "graduation_check": graduation_check})
        return jsonify({"message": "Files successfully uploaded"}), 200


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
                uploaded_files[base_filename] = file_path  # Use the base filename.
            return jsonify({"message": "Files uploaded successfully"}), 200
        except Exception as e:
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

    @app.route('/')
    def index():
        return "SERVER IS UP"

# Initialize routes
init_routes(app)

# Run the app
if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)