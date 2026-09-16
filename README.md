# KCNA Exam Simulator

A web-based simulator for the Kubernetes and Cloud Native Associate (KCNA) exam.

## Features

- Two sets of questions extracted from KCNA exam dumps
- 60-question exam simulation
- Timer to simulate real exam conditions
- Question navigation
- Optional practice mode: reveals correct (green) / incorrect (red) right after each question, with an explanation, instead of waiting until the end
- Detailed results with correct/incorrect answers
- Explanations for each question

## How to Use

1. Open `index.html` directly in a web browser (double-click it, or use `File > Open`)
2. Choose between Question Set 1 or Question Set 2
3. Answer all 60 questions within the 90-minute time limit
4. Submit your exam to see your results
5. Review your answers and explanations

No local server is required — see [Loading question data](#loading-question-data) below for why.

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- No external dependencies required
- Responsive design for desktop and mobile devices

### Loading question data

Question data lives in `data/questionSet1.js` and `data/questionSet2.js` as plain JavaScript
(`const questionSet1Data = [...]`), loaded via ordinary `<script>` tags in `index.html`. A
`<script src="...">` tag works the same whether the page is opened as a `file://` URL or served
over `http://`, so no local server is needed — that's different from `.json` files loaded with
`fetch`/`XMLHttpRequest`, which the browser blocks under CORS when the page is opened as `file://`.

If you need to edit the question data, edit `data/questionSet1.js` / `data/questionSet2.js`
directly — the array literal is just JSON with a `const ... =` prefix and a trailing `;`.

## Project Structure

```
kcna-examsimulator/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styling for the application
├── js/
│   └── app.js          # Application logic
├── data/
│   ├── questionSet1.js  # First set of questions (JS, not JSON — see above)
│   └── questionSet2.js  # Second set of questions (JS, not JSON — see above)
└── README.md           # This file
```

## License

This project is for educational purposes only.
