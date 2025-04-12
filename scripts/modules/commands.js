/**
 * commands.js
 * Task Master CLI - Command handler module
 * 
 * Handles the parsing and execution of CLI commands for the task management system.
 */

// Import necessary modules
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Import the ai-helper module
import * as aiHelper from './ai-helper.js';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');
const TASKS_FILE = join(PROJECT_ROOT, 'tasks', 'tasks.json');
const TASKS_DIR = join(PROJECT_ROOT, 'tasks');
const DEFAULT_SUBTASKS = 3;

/**
 * Display help information for the CLI
 */
export function displayHelp() {
  console.log(`
🔧 Task Master CLI - AI-driven development task management

Usage:
  node scripts/dev.js [command] [options]

Available Commands:
  help                Show this help message
  list                List all tasks with status
  show <id>           Show detailed information about a specific task
  set-status <id> <status>  Change a task's status (done, pending, deferred)
  expand <id>         Add subtasks to a task
  clear-subtasks <id> Remove subtasks from a task
  next                Determine the next task to work on

Run 'node scripts/dev.js [command] --help' for more information on a specific command.
  `);
}

/**
 * Display error message and exit
 * @param {string} message - Error message
 */
export function handleError(message) {
  console.error(`❌ Error: ${message}`);
  process.exit(1);
}

/**
 * Check if tasks.json exists
 * @returns {boolean} - True if tasks.json exists
 */
async function tasksFileExists() {
  try {
    return existsSync(TASKS_FILE);
  } catch (error) {
    return false;
  }
}

/**
 * Load tasks from tasks.json
 * @returns {Object} - Tasks object
 */
async function loadTasks() {
  try {
    if (!await tasksFileExists()) {
      handleError('Tasks file not found. Please initialize the project first.');
    }
    
    const tasksData = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(tasksData);
  } catch (error) {
    handleError(`Failed to load tasks: ${error.message}`);
  }
}

/**
 * Save tasks to tasks.json
 * @param {Object} tasks - Tasks object
 */
async function saveTasks(tasks) {
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    console.log('✅ Tasks saved successfully.');
  } catch (error) {
    handleError(`Failed to save tasks: ${error.message}`);
  }
}

/**
 * Update task files based on tasks.json
 * @param {Object} tasks - Tasks object
 * @param {number|string} taskId - ID of the task to update (optional)
 */
async function updateTaskFiles(tasks, taskId = null) {
  try {
    const tasksToUpdate = taskId 
      ? [tasks.tasks.find(t => t.id.toString() === taskId.toString())]
      : tasks.tasks;
    
    if (taskId && !tasksToUpdate[0]) {
      handleError(`Task with ID ${taskId} not found.`);
    }
    
    for (const task of tasksToUpdate) {
      if (!task) continue;
      
      const taskFilePath = join(TASKS_DIR, `task_${task.id.toString().padStart(3, '0')}.txt`);
      
      // Generate task file content
      let content = `Title: ${task.title}\n`;
      content += `Status: ${task.status}\n`;
      content += `Priority: ${task.priority}\n`;
      
      if (task.dependencies && task.dependencies.length > 0) {
        content += `Dependencies: ${task.dependencies.join(', ')}\n`;
      }
      
      content += '\nDescription:\n';
      content += `${task.description}\n`;
      
      if (task.details) {
        content += '\nDetails:\n';
        content += `${task.details}\n`;
      }
      
      if (task.test_strategy) {
        content += '\nTest Strategy:\n';
        content += `${task.test_strategy}\n`;
      }
      
      if (task.subtasks && task.subtasks.length > 0) {
        content += '\nSubtasks:\n';
        
        for (const subtask of task.subtasks) {
          content += `\n[${task.id}.${subtask.id}] ${subtask.title} (Status: ${subtask.status})\n`;
          
          if (subtask.description) {
            content += `Description: ${subtask.description}\n`;
          }
          
          if (subtask.steps) {
            content += 'Implementation Steps:\n';
            for (const step of subtask.steps) {
              content += `- ${step}\n`;
            }
          }
          
          if (subtask.code_approach) {
            content += 'Code Approach:\n';
            content += `${subtask.code_approach}\n`;
          }
          
          if (subtask.test_approach) {
            content += 'Test Approach:\n';
            content += `${subtask.test_approach}\n`;
          }
        }
      }
      
      // Write task file
      await fs.writeFile(taskFilePath, content, 'utf8');
    }
    
    console.log(`✅ Task file${taskId ? '' : 's'} updated successfully.`);
  } catch (error) {
    handleError(`Failed to update task files: ${error.message}`);
  }
}

/**
 * List all tasks with status
 */
async function listTasks() {
  const tasks = await loadTasks();
  
  console.log('\n📋 Task List:');
  console.log('===========================================');
  
  for (const task of tasks.tasks) {
    const statusEmoji = task.status === 'done' ? '✅' : 
                        task.status === 'pending' ? '⏳' : '⏸️';
    
    console.log(`${statusEmoji} [${task.id}] ${task.title} (Priority: ${task.priority})`);
  }
  
  console.log('===========================================\n');
}

/**
 * Show detailed information about a specific task
 * @param {string} id - Task ID
 */
async function showTask(id) {
  const tasks = await loadTasks();
  const task = tasks.tasks.find(t => t.id.toString() === id.toString());
  
  if (!task) {
    handleError(`Task with ID ${id} not found.`);
  }
  
  console.log('\n📝 Task Details:');
  console.log('===========================================');
  console.log(`ID: ${task.id}`);
  console.log(`Title: ${task.title}`);
  console.log(`Status: ${task.status}`);
  console.log(`Priority: ${task.priority}`);
  
  if (task.dependencies && task.dependencies.length > 0) {
    console.log(`Dependencies: ${task.dependencies.join(', ')}`);
  }
  
  console.log('\nDescription:');
  console.log(task.description);
  
  if (task.subtasks && task.subtasks.length > 0) {
    console.log('\nSubtasks:');
    for (const subtask of task.subtasks) {
      const subtaskStatusEmoji = subtask.status === 'done' ? '✅' : 
                                subtask.status === 'pending' ? '⏳' : '⏸️';
      console.log(`  ${subtaskStatusEmoji} [${task.id}.${subtask.id}] ${subtask.title}`);
    }
  }
  
  console.log('===========================================\n');
}

/**
 * Set the status of a task
 * @param {string} id - Task ID
 * @param {string} status - New status
 */
async function setTaskStatus(id, status) {
  // Validate status
  const validStatuses = ['done', 'pending', 'deferred', 'in-progress'];
  if (!validStatuses.includes(status.toLowerCase())) {
    handleError(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}.`);
  }
  
  const tasks = await loadTasks();
  
  // Handle subtask IDs (e.g., "9.1")
  if (id.includes('.')) {
    const [parentId, subtaskId] = id.split('.');
    const task = tasks.tasks.find(t => t.id.toString() === parentId);
    
    if (!task) {
      handleError(`Parent task with ID ${parentId} not found.`);
    }
    
    const subtask = task.subtasks?.find(s => s.id.toString() === subtaskId);
    
    if (!subtask) {
      handleError(`Subtask with ID ${id} not found.`);
    }
    
    // Update subtask status
    subtask.status = status.toLowerCase();
    console.log(`✅ Subtask ${id} status updated to: ${status}`);
    
    // If all subtasks are done, ask if the parent task should be marked as done
    if (status.toLowerCase() === 'done') {
      const allSubtasksDone = task.subtasks.every(s => s.status === 'done');
      if (allSubtasksDone && task.status !== 'done') {
        console.log(`ℹ️ All subtasks for task ${parentId} are done.`);
        console.log(`ℹ️ Consider updating the parent task status: node scripts/dev.js set-status ${parentId} done`);
      }
    }
  } else {
    // Handle regular task IDs
    const task = tasks.tasks.find(t => t.id.toString() === id);
    
    if (!task) {
      handleError(`Task with ID ${id} not found.`);
    }
    
    // Update task status
    task.status = status.toLowerCase();
    console.log(`✅ Task ${id} status updated to: ${status}`);
    
    // If task is marked as done, also mark all subtasks as done
    if (status.toLowerCase() === 'done' && task.subtasks && task.subtasks.length > 0) {
      for (const subtask of task.subtasks) {
        subtask.status = 'done';
      }
      console.log(`✅ All subtasks for task ${id} marked as done.`);
    }
  }
  
  // Save tasks and update task files
  await saveTasks(tasks);
  await updateTaskFiles(tasks, id.split('.')[0]);
}

/**
 * Generate subtasks for a task using AI
 * @param {string} taskId - The ID of the task to generate subtasks for
 */
async function generateSubtasks(taskId) {
  try {
    // Check if tasks file exists
    if (!tasksFileExists()) {
      handleError('Tasks file not found. Run with "init" to create it.', 1);
      return;
    }

    // Load tasks data
    const tasks = await loadTasks();
    
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      handleError(`Task ${taskId} not found.`, 1);
      return;
    }
    
    console.log(`🧠 Generating subtasks for task ${taskId}: ${task.title}...`);
    
    // Call the AI helper to generate subtasks
    const subtasks = await aiHelper.generateSubtasks(taskId, task);
    
    // Update the task with subtasks
    task.subtasks = subtasks;
    
    // Save tasks
    await saveTasks(tasks);
    
    // Update individual task file if it exists
    await updateTaskFiles(taskId, { subtasks });
    
    console.log(`✅ Generated ${subtasks.length} subtasks for task ${taskId}`);
    console.log('\nSubtasks:');
    subtasks.forEach(subtask => {
      console.log(`  ⏳ [${subtask.id}] ${subtask.title}`);
    });
    
  } catch (error) {
    handleError(`Error generating subtasks: ${error.message}`, 1);
  }
}

/**
 * Expand a task into a detailed implementation plan using AI
 * @param {string} taskId - The ID of the task to expand
 */
async function expandTask(taskId) {
  try {
    // Check if tasks file exists
    if (!await tasksFileExists()) {
      handleError('Tasks file not found. Run with "init" to create it.');
      return;
    }

    // Load tasks data
    const tasks = await loadTasks();
    
    // Find the task
    const task = tasks.tasks.find(t => t.id.toString() === taskId.toString());
    if (!task) {
      handleError(`Task ${taskId} not found.`);
      return;
    }
    
    console.log(`🧠 Expanding task ${taskId}: ${task.title} into a detailed implementation plan...`);
    
    // Call the AI helper to expand the task
    const implementationPlan = await aiHelper.expandTask(taskId, task);
    
    // Create implementation plan file
    const planFilePath = path.join(TASKS_DIR, `implementation-plan-${taskId}.md`);
    await fs.writeFile(planFilePath, implementationPlan, 'utf8');
    
    console.log(`✅ Created implementation plan for task ${taskId}`);
    console.log(`📄 Plan saved to: ${planFilePath}`);
    
  } catch (error) {
    handleError(`Error expanding task: ${error.message}`);
  }
}

/**
 * Clear subtasks from a task
 * @param {string} id - Task ID
 */
async function clearSubtasks(id) {
  const tasks = await loadTasks();
  const task = tasks.tasks.find(t => t.id.toString() === id.toString());
  
  if (!task) {
    handleError(`Task with ID ${id} not found.`);
  }
  
  if (!task.subtasks || task.subtasks.length === 0) {
    console.log(`ℹ️ Task ${id} has no subtasks to clear.`);
    return;
  }
  
  const subtaskCount = task.subtasks.length;
  task.subtasks = [];
  
  // Save tasks and update task files
  await saveTasks(tasks);
  await updateTaskFiles(tasks, id);
  
  console.log(`✅ Cleared ${subtaskCount} subtasks from task ${id}.`);
}

/**
 * Display help for a specific command
 * @param {string} command - Command name
 */
function displayCommandHelp(command) {
  switch (command) {
    case 'list':
      console.log(`
📋 List Tasks

Usage:
  node scripts/dev.js list [options]

Description:
  Displays a list of all tasks with their status.

Options:
  --status=<status>    Filter tasks by status (done, pending, deferred)
  --with-subtasks      Include subtasks in the listing
      `);
      break;
    
    case 'show':
      console.log(`
📝 Show Task Details

Usage:
  node scripts/dev.js show <id>

Description:
  Displays detailed information about a specific task.

Arguments:
  id                  Task ID to show (e.g., 1 or 1.2 for subtasks)
      `);
      break;
    
    case 'set-status':
      console.log(`
✏️ Set Task Status

Usage:
  node scripts/dev.js set-status <id> <status>

Description:
  Changes the status of a task or subtask.

Arguments:
  id                  Task ID or subtask ID (e.g., 1 or 1.2)
  status              New status (done, pending, deferred, in-progress)

Notes:
  - When marking a task as done, all of its subtasks are automatically marked as done.
  - When marking a subtask as done, you'll be reminded to update the parent task if all subtasks are done.
      `);
      break;
    
    case 'next':
      console.log(`
🔍 Find Next Task

Usage:
  node scripts/dev.js next

Description:
  Determines the next task to work on based on dependencies and priority.
  
How it works:
  1. Identifies eligible tasks (pending tasks with satisfied dependencies)
  2. Sorts them by priority, dependency count, and ID
  3. Recommends the top task with suggested actions
  
Notes:
  - High priority tasks are prioritized over medium and low
  - Tasks with fewer dependencies are prioritized
  - Lower ID tasks (earlier in the sequence) are prioritized
      `);
      break;
    
    case 'expand':
      console.log(`
🌱 Expand Task

Usage:
  node scripts/dev.js expand <id> [options]

Description:
  Adds subtasks to a task for more detailed implementation.

Arguments:
  id                  Task ID to expand (e.g., 1)

Options:
  --num=<number>      Number of subtasks to generate (default: 3)
  --prompt=<text>     Additional instructions for subtask generation

Notes:
  - Subtasks will be added with 'pending' status
  - Existing subtasks will not be overwritten
  - In a full implementation, this would use AI to generate context-aware subtasks
      `);
      break;
    
    case 'clear-subtasks':
      console.log(`
🗑️ Clear Subtasks

Usage:
  node scripts/dev.js clear-subtasks <id>

Description:
  Removes all subtasks from a task.

Arguments:
  id                  Task ID to clear subtasks from (e.g., 1)

Notes:
  - This action is irreversible and will remove all subtasks
  - Use this before regenerating subtasks with the expand command
      `);
      break;
    
    default:
      displayHelp();
  }
}

/**
 * Parse command line arguments into options object
 * @param {string[]} args - Command line arguments
 * @returns {Object} - Parsed options
 */
function parseOptions(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value !== undefined ? value : true;
    } else if (!options.command) {
      options.command = arg;
    } else if (!options.id && !isNaN(arg)) {
      options.id = arg;
    }
  }
  
  return options;
}

/**
 * Determine the next task to work on based on dependencies
 */
async function nextTask() {
  const tasks = await loadTasks();
  
  // Find all completed task IDs
  const completedTaskIds = tasks.tasks
    .filter(t => t.status === 'done')
    .map(t => t.id.toString());
  
  // Find eligible tasks - pending tasks whose dependencies are all satisfied
  const eligibleTasks = tasks.tasks.filter(task => {
    // Skip completed tasks
    if (task.status === 'done') {
      return false;
    }
    
    // Skip deferred tasks
    if (task.status === 'deferred') {
      return false;
    }
    
    // Check if all dependencies are satisfied
    if (task.dependencies && task.dependencies.length > 0) {
      return task.dependencies.every(depId => completedTaskIds.includes(depId.toString()));
    }
    
    // If no dependencies, it's eligible
    return true;
  });
  
  if (eligibleTasks.length === 0) {
    console.log('\n⚠️ No eligible tasks found. All tasks are either completed, in progress with unsatisfied dependencies, or deferred.');
    return;
  }
  
  // Sort eligible tasks by priority (high > medium > low)
  const prioritySortValue = (priority) => {
    return priority === 'high' ? 1 : priority === 'medium' ? 2 : 3;
  };
  
  // Sort by priority, then by number of dependencies (fewer first), then by ID (lower first)
  eligibleTasks.sort((a, b) => {
    // First by priority
    const priorityComparison = prioritySortValue(a.priority) - prioritySortValue(b.priority);
    if (priorityComparison !== 0) {
      return priorityComparison;
    }
    
    // Then by number of dependencies (fewer first)
    const aDeps = a.dependencies?.length || 0;
    const bDeps = b.dependencies?.length || 0;
    const depsComparison = aDeps - bDeps;
    if (depsComparison !== 0) {
      return depsComparison;
    }
    
    // Finally by ID (lower first)
    return a.id - b.id;
  });
  
  // Get the top recommended task
  const nextTask = eligibleTasks[0];
  
  console.log('\n🔍 Next Task to Work On:');
  console.log('===========================================');
  console.log(`ID: ${nextTask.id}`);
  console.log(`Title: ${nextTask.title}`);
  console.log(`Status: ${nextTask.status}`);
  console.log(`Priority: ${nextTask.priority}`);
  
  if (nextTask.dependencies && nextTask.dependencies.length > 0) {
    console.log(`Dependencies: ${nextTask.dependencies.join(', ')} ✅`);
  }
  
  console.log('\nDescription:');
  console.log(nextTask.description);
  
  if (nextTask.subtasks && nextTask.subtasks.length > 0) {
    console.log('\nSubtasks:');
    for (const subtask of nextTask.subtasks) {
      const subtaskStatusEmoji = subtask.status === 'done' ? '✅' : 
                               subtask.status === 'pending' ? '⏳' : '⏸️';
      console.log(`  ${subtaskStatusEmoji} [${nextTask.id}.${subtask.id}] ${subtask.title}`);
    }
  }
  
  console.log('\nSuggested Actions:');
  console.log(`- Set as in-progress: node scripts/dev.js set-status ${nextTask.id} in-progress`);
  console.log(`- Mark as done: node scripts/dev.js set-status ${nextTask.id} done`);
  
  if (nextTask.subtasks && nextTask.subtasks.length > 0) {
    const nextSubtask = nextTask.subtasks.find(s => s.status !== 'done');
    if (nextSubtask) {
      console.log(`- Work on subtask: node scripts/dev.js set-status ${nextTask.id}.${nextSubtask.id} in-progress`);
    }
  } else {
    console.log(`- Add subtasks: node scripts/dev.js expand --id=${nextTask.id}`);
  }
  
  console.log('===========================================\n');
}

/**
 * Run the CLI with the given arguments
 * @param {string[]} argv - Command line arguments
 */
export async function runCLI(argv) {
  // Remove node and script name from arguments
  const args = argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    displayHelp();
    return;
  }
  
  // Parse command
  const command = args[0];
  
  // Check if requesting help for a specific command
  if (args.length > 1 && args[1] === '--help') {
    displayCommandHelp(command);
    return;
  }
  
  // Parse options for commands that need them
  const options = parseOptions(args.slice(1));
  
  switch (command) {
    case 'list':
      await listTasks();
      break;
    
    case 'show':
      if (args.length < 2) {
        handleError('Task ID is required. Usage: node scripts/dev.js show <id>');
      }
      await showTask(args[1]);
      break;
    
    case 'set-status':
      if (args.length < 3) {
        handleError('Task ID and status are required. Usage: node scripts/dev.js set-status <id> <status>');
      }
      await setTaskStatus(args[1], args[2]);
      break;
    
    case 'next':
      await nextTask();
      break;
    
    case 'expand':
      if (!options.id && args.length > 1) {
        options.id = args[1];
      }
      
      if (!options.id) {
        handleError('Task ID is required. Usage: node scripts/dev.js expand <id> [--num=3] [--prompt="Additional context"]');
      }
      
      await expandTask(options.id);
      break;
    
    case 'clear-subtasks':
      if (!options.id && args.length > 1) {
        options.id = args[1];
      }
      
      if (!options.id) {
        handleError('Task ID is required. Usage: node scripts/dev.js clear-subtasks <id>');
      }
      
      await clearSubtasks(options.id);
      break;
    
    default:
      handleError(`Unknown command: ${command}`);
  }
}

export default {
  runCLI,
  displayHelp,
  listTasks,
  showTask,
  setTaskStatus,
  generateSubtasks,
  expandTask,
  clearSubtasks
}; 