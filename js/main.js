// main.js - Handles interactions for viewing and managing courses, topics, and flashcards

import {
  loadUserDashboard,
  loginUser,
  signupUser
} from './auth.js';
import { displayFlashcards } from './flashcards.js';
import { generateTest } from './test.js';
import { getCourses, getTopics, createCourse, addTopic, saveFlashcard } from './data.js';
console.log("ja")
//ocalStorage.clear();
document.addEventListener('DOMContentLoaded', () => {
  let username = document.getElementById("username")
  let loginBtn = document.getElementById("login");
  let signupBtn = document.getElementById("signup");
  let password = document.getElementById("password");
  console.log(password)
  loginBtn.addEventListener("click",()=>{
    if(loginUser(username.value, password.value)){
      loadUserDashboard()
    }else{
      alert("wrong credentials ")
    }
  })
  signupBtn.addEventListener("click",()=>{
    if(signupUser(username.value, password.value)){
      loadUserDashboard()
    }else{
      alert("User already exist")
    }
  })
  loadUserDashboard();
  const courseSelector = document.getElementById('courseSelector'); // For viewing flashcards
  const topicSelector = document.getElementById('topicSelector');   // For viewing flashcards
  const addCourseSelector = document.getElementById('course');      // For adding flashcards
  const addTopicSelector = document.getElementById('topic');        // For adding flashcards
  const newTopicInput = document.getElementById('newTopic');        // For adding a new topic
  const saveButton = document.getElementById('saveFlashcard');      // Save flashcard button
  const createCourseButton = document.getElementById('createCourseButton'); // Create course button
const courseSelectorForTest = document.getElementById('courseSelectorForTest');
  const topicSelectorForTest = document.getElementById('topicSelectorForTest');
  const testContainer = document.getElementById('testContainer');

  // Populate the courses dropdown in the test section
  const populateCoursesForTest = () => {
    const courses = getCourses();
    courseSelectorForTest.innerHTML = '<option disabled selected>Select a course</option>';
    
    if (courses.length === 0) {
      courseSelectorForTest.innerHTML += '<option disabled>No courses available</option>';
    } else {
      courses.forEach((course) => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelectorForTest.appendChild(option);
      });
    }
  };

  // Populate topics dropdown when a course is selected
  const populateTopicsForTest = (course) => {
    const topics = getTopics(course);
    topicSelectorForTest.innerHTML = '<option disabled selected>Select a topic (optional)</option>';

    if (topics.length === 0) {
      topicSelectorForTest.innerHTML += '<option disabled>No topics available</option>';
    } else {
      topics.forEach((topic) => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        topicSelectorForTest.appendChild(option);
      });
    }

    topicSelectorForTest.disabled = false; // Enable topic selection if course is selected
  };

  // Handle course selection in the test section
  courseSelectorForTest.addEventListener('change', () => {
    const selectedCourse = courseSelectorForTest.value;
    populateTopicsForTest(selectedCourse);  // Populate topics based on the selected course
    testContainer.innerHTML = '';  // Clear the previous test content when course changes
  });

  // Handle topic selection in the test section
  topicSelectorForTest.addEventListener('change', () => {
    const selectedCourse = courseSelectorForTest.value;
    const selectedTopic = topicSelectorForTest.value;
    generateTest(selectedCourse, selectedTopic); // Generate the test for the selected topic
  });

  // When no topic is selected, generate a test based on the entire course
  courseSelectorForTest.addEventListener('change', () => {
    const selectedCourse = courseSelectorForTest.value;
    generateTest(selectedCourse, null); // Passing null means the test will be for the whole course
  });

  // Initial population of courses in the test section
  populateCoursesForTest();
  
  // Populate dropdowns for selecting courses
  const populateCourses = () => {
    const courses = getCourses();
    // Populate "View Flashcards" course selector
    courseSelector.innerHTML = '<option disabled selected>Select a course</option>';
    addCourseSelector.innerHTML = '<option disabled selected>Select a course</option>';

    if (courses.length === 0) {
      courseSelector.innerHTML += '<option disabled>No courses available</option>';
      addCourseSelector.innerHTML += '<option disabled>No courses available</option>';
    } else {
      courses.forEach((course) => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelector.appendChild(option);

        const addOption = option.cloneNode(true);
        addCourseSelector.appendChild(addOption);
      });
    }
  };

  // Populate topics for a specific course
  const populateTopics = (course, isForAddingFlashcards = false) => {
    const topics = getTopics(course);
    const targetSelector = isForAddingFlashcards ? addTopicSelector : topicSelector;
    targetSelector.innerHTML = '<option disabled selected>Select a topic</option>';

    if (isForAddingFlashcards) {
      targetSelector.innerHTML += '<option value="add-new">Add New Topic</option>';
    }

    if (topics.length === 0) {
      targetSelector.innerHTML += '<option disabled>No topics available</option>';
    } else {
      topics.forEach((topic) => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        targetSelector.appendChild(option);
      });
    }

    targetSelector.disabled = false;
  };

  // Handle course selection for viewing flashcards
  courseSelector.addEventListener('change', () => {
    const selectedCourse = courseSelector.value;
    populateTopics(selectedCourse);
  });

  // Handle topic selection for viewing flashcards
  topicSelector.addEventListener('change', () => {
    const selectedCourse = courseSelector.value;
    const selectedTopic = topicSelector.value;
    displayFlashcards(selectedCourse, selectedTopic);
  });

  // Handle course selection for adding flashcards
  addCourseSelector.addEventListener('change', () => {
    const selectedCourse = addCourseSelector.value;
    populateTopics(selectedCourse, true);
  });

  // Handle topic selection for adding a new topic
  addTopicSelector.addEventListener('change', () => {
    if (addTopicSelector.value === 'add-new') {
      newTopicInput.style.display = 'block';
    } else {
      newTopicInput.style.display = 'none';
    }
  });

  // Handle creating a new course
  createCourseButton.addEventListener('click', () => {
    const courseName = prompt('Enter the name of the new course:').trim();
    if (!courseName) {
      alert('Course name cannot be empty.');
      return;
    }
    if (createCourse(courseName)) {
      alert(`Course "${courseName}" created successfully!`);
      populateCourses();
    } else {
      alert('Course already exists.');
    }
  });

  // Handle saving a new flashcard
  saveButton.addEventListener('click', () => {
    const selectedCourse = addCourseSelector.value;
    const selectedTopic = addTopicSelector.value === 'add-new' ? newTopicInput.value.trim() : addTopicSelector.value;
    const caseName = document.getElementById('casename').value.trim();
    const principle = document.getElementById('principle').value.trim();

    if (!selectedCourse || !selectedTopic || !caseName || !principle) {
      alert('Please fill out all fields.');
      return;
    }

    if (addTopicSelector.value === 'add-new') {
      addTopic(selectedCourse, selectedTopic); // Save the new topic
    }

    saveFlashcard(selectedCourse, selectedTopic, { caseName, principle }); // Save the flashcard

    // Clear form fields
    document.getElementById('casename').value = '';
    document.getElementById('principle').value = '';
    newTopicInput.value = '';
    newTopicInput.style.display = 'none';
    addTopicSelector.value = 'add-new';

    alert(`Flashcard added to "${selectedTopic}" in "${selectedCourse}".`);
  });

  // Initial population of course dropdowns
  populateCourses();
});
