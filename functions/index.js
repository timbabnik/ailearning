const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Create transporter (using Gmail or other email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendDailyEmail = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date();
    const currentHour = now.getHours();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = days[now.getDay()];

    // Get all users
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .get();

    for (const userDoc of usersSnapshot.docs) {
      const settingsDoc = await admin.firestore()
        .doc(`users/${userDoc.id}/settings/emailPreferences`)
        .get();

      if (!settingsDoc.exists) continue;

      const settings = settingsDoc.data();
      const schedule = settings.schedule[currentDay];
      const scheduleHour = parseInt(schedule.time.split(':')[0]);

      // Check if it's time to send email
      if (scheduleHour === currentHour) {
        let emailContent = '';

        switch (schedule.type) {
          case 'yellow': // Random Highlights
            emailContent = await generateRandomHighlights(userDoc.id, settings);
            break;
          case 'green': // Deep Learning
            emailContent = await generateDeepLearning(userDoc.id, settings);
            break;
          case 'purple': // Custom Text
            emailContent = settings.customText || await generateAIContent(settings);
            break;
          // Add other types...
        }

        // Send email
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: settings.email,
          subject: `Your Daily ${schedule.type} Content`,
          html: emailContent
        });
      }
    }
});

// Helper functions to generate content...
async function generateRandomHighlights(userId, settings) {
  // Implementation to get random highlights
}

async function generateDeepLearning(userId, settings) {
  // Implementation to get deep learning content
}

async function generateAIContent(settings) {
  // Implementation to generate AI content
} 