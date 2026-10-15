require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/userModel');
(async () => {
  const email = process.argv[2]?.toLowerCase().trim();
  if (!email) throw new Error('Usage: node promoteAdmin.js user@example.com');
  await connectDB();
  const user = await User.findOneAndUpdate({ email }, { $set: { role: 'Admin', accountStatus: 'Active' } }, { new: true });
  if (!user) throw new Error(`No user found for ${email}`);
  console.log(`Promoted ${user.email} to Admin`);
  process.exit(0);
})().catch((error) => { console.error(error.message); process.exit(1); });
