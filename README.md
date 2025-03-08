# Lawrenceville-Student-Transcript-Analysis-Tool

## Project Overview
This project is designed to help students and educators analyze academic performance by uploading and parsing transcripts. The application extracts grades and checks graduation requirements.

## Features
- Upload and parse transcripts in PDF format.
- Extract and display grades for each academic year.
- Check and display graduation requirements and student progress.
- Dark mode and light mode support.
- Multi-student transcript processing.
- Generate detailed academic reports.
- Export data to CSV format.
- User authentication and authorization.
- Responsive design for mobile and desktop.

## Installation
To install the project, follow these steps:
1. Clone the repository:
    ```bash
    git clone https://github.com/roshanshah11/Lawrenceville-Student-Transcript-Analysis-Tool.git
    ```
2. Navigate to the project directory:
    ```bash
    cd pythonfinal
    ```
3. Install the required dependencies for the backend:
    ```bash
    pip install -r requirements.txt
    ```
4. Navigate to the client directory and install the required dependencies for the frontend:
    ```bash
    cd client
    npm install
    ```
5. Install Tailwind CSS and its dependencies:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```

## Usage
To use the project, follow these steps:
1. Start the backend server:
    ```bash
    cd flask_server
    python routes.py
    ```
2. Start the frontend application:
    ```bash
    cd client
    npm start
    ```
3. Open your web browser and navigate to `http://localhost:3000`.
4. Upload a transcript PDF to analyze grades and graduation requirements.
5. For multi-student processing, upload a folder of transcript PDFs.

## Contributing
If you would like to contribute to this project, please follow these guidelines:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
If you have any questions or suggestions, please contact Roshan Shah at rshah25@lawrenceville.org