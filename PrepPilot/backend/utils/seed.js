/**
 * Seeds the database with a handful of sample quizzes so the Quizzes page
 * has content immediately after cloning the project.
 *
 * Usage: npm run seed   (from the backend/ directory)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Quiz = require('../models/Quiz');

const sampleQuizzes = [
  {
    title: 'Aptitude Basics — Quantitative I',
    category: 'Aptitude',
    difficulty: 'Easy',
    durationMinutes: 10,
    questions: [
      {
        question: 'A train travels 60 km in 45 minutes. What is its speed in km/h?',
        options: ['60 km/h', '80 km/h', '75 km/h', '90 km/h'],
        correctIndex: 1,
        explanation: '60 km in 45 min = 60 / (45/60) = 80 km/h.',
      },
      {
        question: 'If 5 workers complete a task in 12 days, how many days will 10 workers take?',
        options: ['24 days', '6 days', '10 days', '12 days'],
        correctIndex: 1,
        explanation: 'Work is constant: 5 x 12 = 10 x d => d = 6 days.',
      },
      {
        question: 'What is 15% of 240?',
        options: ['32', '36', '30', '40'],
        correctIndex: 1,
        explanation: '15% of 240 = 0.15 x 240 = 36.',
      },
    ],
  },
  {
    title: 'Core JavaScript Concepts',
    category: 'Technical',
    difficulty: 'Medium',
    durationMinutes: 15,
    questions: [
      {
        question: 'What does the "this" keyword refer to inside a regular function called as a method?',
        options: [
          'The global object always',
          'The object the method was called on',
          'undefined in all cases',
          'The function itself',
        ],
        correctIndex: 1,
        explanation: 'In a regular function call as obj.method(), "this" refers to obj.',
      },
      {
        question: 'Which of these correctly creates a shallow copy of an array in JS?',
        options: ['arr.copy()', '[...arr]', 'arr.clone()', 'new Array(arr)'],
        correctIndex: 1,
        explanation: 'The spread operator [...arr] creates a shallow copy.',
      },
      {
        question: 'What is the output of typeof null?',
        options: ['"null"', '"undefined"', '"object"', '"number"'],
        correctIndex: 2,
        explanation: 'typeof null returns "object" — a long-standing JS quirk.',
      },
    ],
  },
  {
    title: 'DSA Fundamentals Quiz',
    category: 'DSA',
    difficulty: 'Medium',
    durationMinutes: 15,
    questions: [
      {
        question: 'What is the average time complexity of searching in a balanced binary search tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 1,
        explanation: 'A balanced BST has height O(log n), so search is O(log n).',
      },
      {
        question: 'Which data structure uses FIFO (First In First Out) ordering?',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correctIndex: 1,
        explanation: 'A queue processes elements in the order they were added: FIFO.',
      },
      {
        question: 'What is the worst-case time complexity of quicksort?',
        options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
        correctIndex: 2,
        explanation: 'Quicksort degrades to O(n^2) on already-sorted/poor pivot choices.',
      },
    ],
  },
];

(async () => {
  await connectDB();
  await Quiz.deleteMany({});
  await Quiz.insertMany(sampleQuizzes);
  console.log(`Seeded ${sampleQuizzes.length} quizzes.`);
  await mongoose.disconnect();
  process.exit(0);
})();
