export const TASK_MESSAGES = {
    success: [
      "🎉 Great job completing that task!",
      "🌟 You're on fire! Another task down!",
      "💪 You're making great progress!",
      "🎯 Nailed it! Task complete!",
      "⭐ Awesome work! Keep it up!",
      "🚀 You're crushing it today!",
      "🏆 Victory! Task accomplished!",
      "✨ Brilliant work! Task done!",
      "💫 You're doing amazing!",
      "🌈 Success! Keep the momentum going!"
    ],
    // You can add other types of messages too
    warning: [
      "⚠️ Task due soon!",
      "⏰ Don't forget this task!"
    ],
    error: [
      "❌ Task removal failed",
      "⚠️ Couldn't update task"
    ]
  } as const;
  
  // Utility functions
  export const getRandomMessage = (type: keyof typeof TASK_MESSAGES = 'success'): string => {
    const messages = TASK_MESSAGES[type];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };