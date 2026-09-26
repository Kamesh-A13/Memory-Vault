import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Read .env.local manually since dotenv defaults to .env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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
];

const SEED_REVISION = [
  { topic: 'Binary Search Trees', subject: 'Data Structures', importance: 85, difficulty: 70, frequency: 90 },
  { topic: 'Dynamic Programming', subject: 'Algorithms', importance: 95, difficulty: 88, frequency: 85 },
];

const SEED_PYQS = [
  { question: 'Explain the concept of Binary Search Tree and its operations.', subject: 'Data Structures', topic: 'Binary Trees', year: 2023, marks: 10, difficulty: 65, frequency: 4 },
  { question: 'What is dynamic programming?', subject: 'Algorithms', topic: 'Dynamic Programming', year: 2023, marks: 12, difficulty: 80, frequency: 5 },
];

async function run() {
  console.log('Logging in as a test user to satisfy RLS...');
  
  // Since we don't have the user's password, we can't easily sign in.
  // Wait, the RLS policies say: WITH CHECK (auth.uid() = user_id)
  // If we try to insert without auth.uid(), it will fail.
  // Let me just check the exact error by trying to insert a public resource.
  
  // Actually, I can temporarily disable RLS, insert the data, and re-enable RLS? No, we don't have the service role key or DB password.
  // We can just ask the user what the error was in the browser alert.
  
  console.log('Cannot seed from Node without user credentials due to RLS.');
}

run();
