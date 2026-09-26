/**
 * Seed Service — Demo Data for Memory Vault
 * Populates resources, revision_items, and pyqs for a given user.
 * Used only for development/demo purposes.
 */

import { supabase } from './supabaseClient';

const SEED_RESOURCES = [
  {
    title: 'Data Structures — Binary Trees',
    subject: 'Data Structures',
    topic: 'Binary Trees',
    description: 'A binary tree is a tree data structure where each node has at most two children: left and right. Binary Search Trees maintain the property that left < root < right, enabling O(log n) search, insert, and delete on average. Common traversals include inorder (LNR), preorder (NLR), and postorder (LRN). Height-balanced variants like AVL trees and Red-Black trees guarantee O(log n) worst case.',
    file_path: null,
    file_type: 'txt',
    file_size: 512,
    file_name: 'binary_trees.txt',
  },
  {
    title: 'Operating Systems — Process Scheduling',
    subject: 'Operating Systems',
    topic: 'CPU Scheduling',
    description: 'CPU scheduling determines which process runs next. Key algorithms: FCFS (First Come First Served) — simple but causes convoy effect. SJF (Shortest Job First) — optimal average waiting time but requires future knowledge. Round Robin — preemptive, uses time quantum, good for time-sharing. Priority Scheduling — each process has priority; may cause starvation, solved by aging. Multilevel Queue — separate queues for different process types.',
    file_path: null,
    file_type: 'txt',
    file_size: 640,
    file_name: 'cpu_scheduling.txt',
  },
  {
    title: 'Machine Learning — Gradient Descent',
    subject: 'Machine Learning',
    topic: 'Optimization',
    description: 'Gradient Descent minimizes a loss function by iteratively moving in the direction of steepest descent (negative gradient). Learning rate α controls step size — too large causes divergence, too small causes slow convergence. Variants: Batch GD uses all samples, Stochastic GD uses one sample per step, Mini-batch GD balances both. Adam optimizer adapts learning rates per parameter using first and second moment estimates.',
    file_path: null,
    file_type: 'txt',
    file_size: 580,
    file_name: 'gradient_descent.txt',
  },
  {
    title: 'Computer Networks — TCP/IP Model',
    subject: 'Computer Networks',
    topic: 'Network Protocols',
    description: 'The TCP/IP model has 4 layers: Application (HTTP, FTP, DNS, SMTP), Transport (TCP, UDP), Internet (IP, ICMP, ARP), and Network Access (Ethernet, Wi-Fi). TCP provides reliable, ordered, connection-oriented delivery with flow control and congestion control. UDP is connectionless and fast — used for streaming, DNS, gaming. The three-way handshake (SYN, SYN-ACK, ACK) establishes TCP connections.',
    file_path: null,
    file_type: 'txt',
    file_size: 620,
    file_name: 'tcp_ip_model.txt',
  },
  {
    title: 'Algorithms — Dynamic Programming',
    subject: 'Algorithms',
    topic: 'Dynamic Programming',
    description: 'Dynamic Programming solves complex problems by breaking them into overlapping subproblems and storing results (memoization/tabulation). Key properties: optimal substructure and overlapping subproblems. Classic problems: Fibonacci (O(n) vs O(2^n) naive), 0/1 Knapsack, Longest Common Subsequence (LCS), Edit Distance, Matrix Chain Multiplication, Coin Change. Bottom-up DP uses tabulation; top-down uses recursion + memoization.',
    file_path: null,
    file_type: 'txt',
    file_size: 670,
    file_name: 'dynamic_programming.txt',
  },
  {
    title: 'Database Systems — SQL & Normalization',
    subject: 'Database Systems',
    topic: 'Normalization',
    description: 'Database normalization reduces redundancy and improves integrity. 1NF: Atomic values, no repeating groups. 2NF: No partial dependency on composite key. 3NF: No transitive dependency. BCNF: Every determinant is a candidate key. SQL basics: SELECT, WHERE, JOIN (INNER, LEFT, RIGHT, FULL), GROUP BY, HAVING, ORDER BY. Indexes speed up queries but slow down writes. Transactions follow ACID properties: Atomicity, Consistency, Isolation, Durability.',
    file_path: null,
    file_type: 'txt',
    file_size: 700,
    file_name: 'sql_normalization.txt',
  },
];

const SEED_REVISION_ITEMS = [
  { topic: 'Binary Search Trees', subject: 'Data Structures', importance: 85, difficulty: 70, frequency: 90 },
  { topic: 'Dynamic Programming', subject: 'Algorithms', importance: 95, difficulty: 88, frequency: 85 },
  { topic: 'Process Synchronization', subject: 'Operating Systems', importance: 80, difficulty: 75, frequency: 70 },
  { topic: 'Gradient Descent & Backpropagation', subject: 'Machine Learning', importance: 90, difficulty: 82, frequency: 78 },
  { topic: 'TCP/IP & OSI Model', subject: 'Computer Networks', importance: 75, difficulty: 60, frequency: 80 },
  { topic: 'SQL Joins & Normalization', subject: 'Database Systems', importance: 85, difficulty: 65, frequency: 88 },
];

const SEED_PYQS = [
  { question: 'Explain the concept of Binary Search Tree and its operations. What is the time complexity of search, insert, and delete in best, average, and worst cases?', subject: 'Data Structures', topic: 'Binary Trees', year: 2023, marks: 10, difficulty: 65, frequency: 4 },
  { question: 'What is dynamic programming? Explain with the 0/1 Knapsack problem and its bottom-up solution.', subject: 'Algorithms', topic: 'Dynamic Programming', year: 2023, marks: 12, difficulty: 80, frequency: 5 },
  { question: 'Compare FCFS, SJF, and Round Robin CPU scheduling algorithms. Calculate average waiting time and turnaround time for a given set of processes.', subject: 'Operating Systems', topic: 'CPU Scheduling', year: 2022, marks: 10, difficulty: 60, frequency: 5 },
  { question: 'Explain Gradient Descent optimization. What are the differences between Batch, Stochastic, and Mini-batch Gradient Descent?', subject: 'Machine Learning', topic: 'Optimization', year: 2023, marks: 8, difficulty: 72, frequency: 3 },
  { question: 'Describe the TCP three-way handshake process. How does TCP ensure reliable data delivery?', subject: 'Computer Networks', topic: 'TCP/IP', year: 2022, marks: 8, difficulty: 55, frequency: 4 },
  { question: 'What are the normal forms in database normalization? Convert a given unnormalized relation to 3NF step by step.', subject: 'Database Systems', topic: 'Normalization', year: 2023, marks: 12, difficulty: 68, frequency: 4 },
  { question: 'Write an algorithm for Merge Sort. Analyze its time and space complexity. How does it compare to Quick Sort?', subject: 'Algorithms', topic: 'Sorting', year: 2022, marks: 10, difficulty: 58, frequency: 5 },
  { question: 'Explain Deadlock in operating systems. What are the four necessary conditions? Describe the Banker\'s algorithm for deadlock avoidance.', subject: 'Operating Systems', topic: 'Deadlock', year: 2023, marks: 12, difficulty: 78, frequency: 4 },
  { question: 'What is overfitting and underfitting in machine learning? Explain regularization techniques (L1 and L2).', subject: 'Machine Learning', topic: 'Regularization', year: 2022, marks: 8, difficulty: 65, frequency: 3 },
  { question: 'Explain the concept of indexing in databases. What are B-Trees and B+ Trees? How do they improve query performance?', subject: 'Database Systems', topic: 'Indexing', year: 2021, marks: 10, difficulty: 72, frequency: 3 },
];

/**
 * Seeds demo data for the given user ID.
 * Returns counts of inserted records.
 */
export async function seedDemoData(userId) {
  let inserted = { resources: 0, revision: 0, pyqs: 0, errors: [] };

  // Seed resources
  for (const r of SEED_RESOURCES) {
    const { error } = await supabase
      .from('resources')
      .insert([{ ...r, user_id: userId }]);
    if (error) inserted.errors.push(`Resource "${r.title}": ${error.message}`);
    else inserted.resources++;
  }

  // Seed revision items
  for (const r of SEED_REVISION_ITEMS) {
    const { error } = await supabase
      .from('revision_items')
      .insert([{ ...r, user_id: userId }]);
    if (error) inserted.errors.push(`Revision "${r.topic}": ${error.message}`);
    else inserted.revision++;
  }

  // Seed PYQs
  for (const p of SEED_PYQS) {
    const { error } = await supabase
      .from('pyqs')
      .insert([{ ...p, user_id: userId }]);
    if (error) inserted.errors.push(`PYQ: ${error.message}`);
    else inserted.pyqs++;
  }

  return inserted;
}
