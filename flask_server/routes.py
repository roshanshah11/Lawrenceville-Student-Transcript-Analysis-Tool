from flask import request, jsonify
from flask_cors import CORS  # Add this import
import re
import PyPDF2
import os
from werkzeug.utils import secure_filename

def init_routes(app):
    CORS(app)  # Add this line to enable CORS for routes

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

    @app.route('/upload-multi-student', methods=['POST'])
    def upload_multi_student():
        if 'files' not in request.files:
            return jsonify({"error": "No files part in the request"}), 400

        files = request.files.getlist('files')
        if not files:
            return jsonify({"error": "No files selected for uploading"}), 400

        for file in files:
            if file:
                filename = secure_filename(file.filename)
                file.save(os.path.join("uploads", filename))

        return jsonify({"message": "Files successfully uploaded"}), 200

    @app.route('/upload-folder', methods=['POST'])
    def upload_folder():
        if 'files' not in request.files:
            return jsonify({"error": "No files part"}), 400
        
        files = request.files.getlist('files')
        global file_data
        file_data = {}
        for file in files:
            file_path = os.path.join("uploads", file.filename)
            file.save(file_path)
            file_data[file.filename] = file_path
        
        return jsonify({"message": "Folder uploaded successfully"})

    @app.route('/')
    def index():
        return "SERVER IS UP"
