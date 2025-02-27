import os
from pathlib import Path
import pprint
import io
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt
from flask import Blueprint, request, jsonify, g
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename
from single_student import extract_transcript_data, parse_grades, check_graduation_requirements
UPLOAD_FOLDER = "/Users/roshanshah/Downloads/pythonfinal/flask_server/uploads"


multi_student_bp = Blueprint('multi_student', __name__)

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

def my_unpack(grades_dict,cdata,cdata_course):
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
            my_unpack(grades_dict,cdata,cdata_course)
    return cdata, cdata_course



def init_routes(app):
    app.register_blueprint(multi_student_bp)
    @app.route('/process-folder', methods=['GET'])
    def process_folder():
        try:
            results = {}
            for filename, file_path in g.file_data.items():
                results[filename] = "Processed"
            return jsonify(results), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500



import matplotlib.pyplot as plt
import io

def get_histogram_image(cdata=None, cdata_course=None,yrs=2024, yre=2025, s_grade=12, e_grade=12, s_term=1, e_term=3, course_category=None):
    if cdata is None or cdata_course is None or course_category is None:
        raise ValueError("cdata, cdata_course, and course_category must be provided.")

    year_range = str(yrs) + '-' + str(yre)
    list_hist = []
    list_hist2 = []
    course_list = list(course_category.keys())

    for grade in range(s_grade, e_grade + 1):
        for term in range(s_term, e_term + 1):
            try:
                list_hist.extend(cdata[year_range][grade][term])
            except KeyError:
                pass # Continue if key not found.

    for grade in range(s_grade, e_grade + 1):
        for term in range(s_term, e_term + 1):
            for temp_course_type in course_list:
                try:
                    list_hist2.extend(cdata_course[year_range][grade][term][course_category[temp_course_type]])
                except KeyError:
                    pass # Continue if key not found.

    plt.hist(list_hist2, bins=16, color='skyblue', edgecolor='black')
    plt.xlabel('GPA')
    plt.ylabel('Frequency')

    # Save the image to a BytesIO stream
    img_io = io.BytesIO()
    plt.savefig(img_io, format='png')
    plt.close()  # Close the plot to free memory
    img_io.seek(0)

    return img_io


__all__ = ['unpack_all', 'init_routes', 'get_hist',"get_histogram_image"]



