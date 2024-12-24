import { getGrades } from './data.js'; // Use Chart.js for visualization

let chartInstance; // Keep track of the chart instance

// Display all the grades and attempts
export const displayGrades = () => {
  const gradesContainer = document.getElementById('gradesContainer');
  const grades = getGrades();

  gradesContainer.innerHTML = ''; // Clear existing grades

  if (!grades || Object.keys(grades).length === 0) {
    gradesContainer.innerHTML = '<p>No grades available. Take a test to start tracking your progress!</p>';
    return;
  }

  // Loop through each course-topic combination
  Object.entries(grades).forEach(([key, attempts]) => {
    const [courseName, topicName] = key.split('-');

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

// Display pie chart of performance for the latest attempt
export const displayPerformanceChart = (score, total) => {
  const ctx = document.getElementById('performanceChart').getContext('2d');

  if (window.performanceChartInstance) {
    window.performanceChartInstance.destroy(); // Destroy previous chart instance
  }

  const correct = score;
  const incorrect = total - score;

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
};

// Display a line chart of progress over time
export const displayProgressAndAdvice = () => {
  const grades = getGrades();
  const adviceText = document.getElementById('adviceText');
  const ctx = document.getElementById('progressChart').getContext('2d');

  const scores = [];
  const labels = [];

  // Collect scores for all attempts
  Object.entries(grades).forEach(([key, attempts]) => {
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
  });

  if (scores.length === 0) {
    adviceText.textContent = 'No data available. Take tests to track your progress!';
    return;
  }

  // Display Progress Chart
  new Chart(ctx, {
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
