// Seed script — creates sample tasks assigned to the member "sanidhya"
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find the member user
  const allUsers = await User.find();
  console.log('All users:', allUsers.map(u => `${u.name} (${u.role}) [${u._id}]`));

  const member = allUsers.find(u => u.role === 'Member');
  const admin = allUsers.find(u => u.role === 'Admin');

  if (!member) {
    console.log('ERROR: No Member user found. Create one first.');
    process.exit(1);
  }
  if (!admin) {
    console.log('ERROR: No Admin user found. Create one first.');
    process.exit(1);
  }

  console.log(`\nAdmin: ${admin.name} (${admin._id})`);
  console.log(`Member: ${member.name} (${member._id})`);

  // Find projects that include this member
  const projects = await Project.find({ members: member._id });
  console.log(`\nProjects with member "${member.name}":`, projects.map(p => `${p.name} [${p._id}]`));

  if (projects.length === 0) {
    console.log('ERROR: Member is not part of any project.');
    process.exit(1);
  }

  // Check existing tasks
  const existingTasks = await Task.find();
  console.log(`\nExisting tasks in DB: ${existingTasks.length}`);

  // Create sample tasks assigned to the member in the first project
  const project = projects[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const sampleTasks = [
    {
      title: 'Design homepage wireframe',
      description: 'Create a wireframe for the main landing page with all sections',
      projectId: project._id,
      assignedTo: member._id,
      status: 'To Do',
      dueDate: nextWeek
    },
    {
      title: 'Set up database schema',
      description: 'Define MongoDB models for users, projects, and tasks',
      projectId: project._id,
      assignedTo: member._id,
      status: 'In Progress',
      dueDate: tomorrow
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints with request/response examples',
      projectId: project._id,
      assignedTo: member._id,
      status: 'To Do',
      dueDate: yesterday
    }
  ];

  // Also create tasks in the second project if it exists
  if (projects.length > 1) {
    sampleTasks.push({
      title: 'Review pull requests',
      description: 'Review and merge pending PRs from the team',
      projectId: projects[1]._id,
      assignedTo: member._id,
      status: 'To Do',
      dueDate: nextWeek
    });
  }

  const created = await Task.insertMany(sampleTasks);
  console.log(`\n✅ Created ${created.length} tasks assigned to "${member.name}":`);
  created.forEach(t => console.log(`   - "${t.title}" [${t.status}]`));

  await mongoose.disconnect();
  console.log('\nDone! Seed complete.');
}

seed().catch(err => { console.error(err); process.exit(1); });
