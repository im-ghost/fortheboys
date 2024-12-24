import { getGrades, getCourses } from './data.js'; // Use Chart.js for visualization

let chartInstance; // Keep track of the chart instance
let progressChartInstance; // Track the progress chart instance

// Function to create the dropdown menu for selecting courses
export const createCourseDropdown = () => {
  const courseSelect = document.getElementById('courseSelect');
  const courses = getCourses();

  // Clear existing options in the dropdown
  courseSelect.innerHTML = '';

  if (courses.length === 0) {
    courseSelect.innerHTML = '<option>No courses available</option>';
    return;
  }

  // Create an option for each course
  courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course;
    option.textContent = course;
    courseSelect.appendChild(option);
  });

  // Trigger the display of grades for the first course by default
  const firstCourse = courses[0];
  displayGrades(firstCourse);
  displayPerformanceChart(firstCourse);
  displayProgressAndAdvice(firstCourse);

  // Add an event listener to handle course selection change
  courseSelect.addEventListener('change', (event) => {
    const selectedCourse = event.target.value;
    displayGrades(selectedCourse);
    displayPerformanceChart(selectedCourse);
    displayProgressAndAdvice(selectedCourse);
  });
};

// Display grades for the selected course
export const displayGrades = (courseName) => {
  const gradesContainer = document.getElementById('gradesContainer');
  const grades = getGrades();
  const courseGrades = Object.entries(grades).filter(([key]) => key.startsWith(courseName));

  gradesContainer.innerHTML = ''; // Clear existing grades

  if (courseGrades.length === 0) {
    gradesContainer.innerHTML = '<p>No grades available for this course. Take a test to start tracking your progress!</p>';
    return;
  }

  // Loop through each course-topic combination
  courseGrades.forEach(([key, attempts]) => {
    const [_, topicName] = key.split('-');

    // Check if the value is an array (multiple attempts per topic)
    if (Array.isArray(attempts)) {
      attempts.forEach((grade, index) => {
        const gradeCard = document.createElement('div');
        gradeCard.classList.add('grade-card');

        gradeCard.innerHTML = `
          <h4>${courseName} - ${topicName || 'All Topics'} - Attempt ${index + 1}</h4>
          <p>Score: ${grade.score}/${grade.total} (${((grade.score / grade.total) * 100).toFixed(2)}%)</p>
          <p>Date: ${new Date(grade.date).toLocaleDateString()}</p>
          <p>Attempts: ${grade.attempts}</p>
        `;

        gradesContainer.appendChild(gradeCard);
      });
    } else {
      // If there's only one attempt (non-array), handle it normally
      const grade = attempts;
      const gradeCard = document.createElement('div');
      gradeCard.classList.add('grade-card');

      gradeCard.innerHTML = `
        <h4>${courseName} - ${topicName || 'All Topics'}</h4>
        <p>Score: ${grade.score}/${grade.total} (${((grade.score / grade.total) * 100).toFixed(2)}%)</p>
        <p>Date: ${new Date(grade.date).toLocaleDateString()}</p>
        <p>Attempts: ${grade.attempts}</p>
      `;

      gradesContainer.appendChild(gradeCard);
    }
  });
};

// Display pie chart of performance for the latest attempt of the selected course
export const displayPerformanceChart = (courseName) => {
  const grades = getGrades();
  const ctx = document.getElementById('performanceChart').getContext('2d');

  if (window.performanceChartInstance) {
    window.performanceChartInstance.destroy(); // Destroy previous chart instance
  }

  const courseGrades = Object.entries(grades).filter(([key]) => key.startsWith(courseName));

  courseGrades.forEach(([key, attempts]) => {
    const lastAttempt = Array.isArray(attempts) ? attempts[attempts.length - 1] : attempts;
    const correct = lastAttempt.score;
    const incorrect = lastAttempt.total - lastAttempt.score;

    // Create pie chart for the latest attempt of the selected course
    window.performanceChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Correct', 'Incorrect'],
        datasets: [
          {
            data: [correct, incorrect],
            backgroundColor: ['#4caf50', '#f44336'], // Green for correct, red for incorrect
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  });
};

// Display a line chart of progress over time for the selected course
export const displayProgressAndAdvice = (courseName) => {
  const grades = getGrades();
  const adviceText = document.getElementById('adviceText');
  const ctx = document.getElementById('progressChart').getContext('2d');

  const scores = [];
  const labels = [];

  // Collect scores for all attempts in the selected course
  Object.entries(grades).forEach(([key, attempts]) => {
    if (key.startsWith(courseName)) {
      if (Array.isArray(attempts)) {
        attempts.forEach(grade => {
          const scorePercentage = (grade.score / grade.total) * 100;
          scores.push(scorePercentage);
          labels.push(`${key} - Attempt ${grade.attempts}`);
        });
      } else {
        const grade = attempts;
        const scorePercentage = (grade.score / grade.total) * 100;
        scores.push(scorePercentage);
        labels.push(`${key} - Attempt ${grade.attempts}`);
      }
    }
  });

  if (scores.length === 0) {
    adviceText.textContent = 'No data available for this course. Take tests to track your progress!';
    return;
  }

  // Destroy previous progress chart if it exists
  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  // Display Progress Chart
  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Progress Over Time',
          data: scores,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });

  // Generate Advice Based on Performance
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (averageScore >= 80) {
    adviceText.textContent = 'Great job! Keep up the excellent work!';
  } else if (averageScore >= 50) {
    adviceText.textContent = 'You’re doing well, but there’s room for improvement. Focus on weaker areas.';
  } else {
    adviceText.textContent = 'Keep trying! Review your mistakes and practice more.';
  }
};
