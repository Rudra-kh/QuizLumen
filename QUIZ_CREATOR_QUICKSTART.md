# 🎨 Quiz Creator - Quick Start

## 3 Ways to Create a Quiz

### 1️⃣ Manual Creation (Easiest)
```
1. Click "🎨 Create Quiz" button
2. Enter quiz title
3. Click "✍️ Create Manually"
4. Fill in question form:
   - Question text
   - 4 options
   - Mark correct answer
5. Click "➕ Add Question"
6. Repeat for all questions
7. Click "🚀 Create Quiz & Get Share Link"
8. Copy and share the link!
```

**Perfect for:** Small quizzes, quick tests, one-time use

---

### 2️⃣ Upload JSON File (Recommended)
```
1. Click "🎨 Create Quiz"
2. Enter quiz title
3. Click "📁 Upload File"
4. Click "📥 Download Template"
5. Edit template with your questions
6. Upload the file
7. Click "🚀 Create Quiz & Get Share Link"
8. Share the link!
```

**Perfect for:** Large quizzes, reusable content, team collaboration

---

### 3️⃣ Upload JavaScript File (For Developers)
```javascript
// myQuiz.js
const questions = [
    {
        id: 1,
        question: "What is React?",
        options: ["Library", "Framework", "Language", "Database"],
        correctAnswer: 0
    },
    // ... more questions
];
```

Upload this `.js` file directly!

**Perfect for:** Programmatically generated quizzes, existing codebases

---

## Sample Question Format

```json
{
    "id": 1,
    "question": "Your question here?",
    "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
    ],
    "correctAnswer": 2
}
```

**Important:**
- `id`: Unique number (1, 2, 3...)
- `question`: Your question text
- `options`: Exactly 4 choices
- `correctAnswer`: Index 0-3 (0=first, 1=second, 2=third, 3=fourth)

---

## Sharing Your Quiz

After creating, you'll get:

### 📋 Share Link
```
http://localhost:3000?quiz=quiz_1730588400000_abc123xyz
```
Copy this entire URL and send to participants!

### 🔑 Quiz ID  
```
quiz_1730588400000_abc123xyz
```
Alternative way to access (participants can paste in browser)

---

## What Participants See

1. **Click your link** → Quiz loads automatically
2. **See quiz title** at the top
3. **Answer questions** one by one
4. **Navigate** with Previous/Next buttons
5. **Submit answers** when done
6. **View confirmation** message

---

## Tips for Great Quizzes

✅ **DO:**
- Write clear, specific questions
- Use simple language
- Test before sharing
- Keep it engaging (5-15 questions ideal)
- Download backup after creating

❌ **DON'T:**
- Make questions too long
- Use confusing wording
- Forget to test the link
- Create duplicate questions
- Skip the correct answer

---

## Example Workflows

### For Teachers 👨‍🏫
```
1. Create quiz from lesson material
2. Download as backup
3. Share link with students
4. Students take quiz
5. Check leaderboard for results
```

### For Teams 👥
```
1. Download template
2. Team fills questions collaboratively
3. Upload completed file
4. Share with all members
5. Compare scores
```

### For Events 🎉
```
1. Create trivia quiz
2. Display quiz link on screen
3. Participants scan QR code
4. Live leaderboard competition
5. Winners get prizes!
```

---

## Keyboard Shortcuts

While creating manually:
- `Tab` - Move to next field
- `Enter` - Add question (when on button)
- `Ctrl+V` - Paste text

---

## Troubleshooting

**Q: My uploaded file isn't working**
- ✅ Check JSON is valid (use jsonlint.com)
- ✅ Ensure all fields are present
- ✅ Try the template file first

**Q: Link doesn't load my quiz**
- ✅ Copy the ENTIRE link including `?quiz=`
- ✅ Check in same browser you created it
- ✅ Check localStorage not cleared

**Q: Can't download template**
- ✅ Check browser allows downloads
- ✅ Click the button once only
- ✅ Check Downloads folder

---

## Advanced: Batch Create Quizzes

Use this template to create multiple quizzes:

```javascript
// generate-quizzes.js
const topics = ['Math', 'Science', 'History'];
const quizzes = topics.map((topic, i) => ({
    title: `${topic} Quiz`,
    questions: [
        // Add questions for each topic
    ]
}));

// Save each as separate JSON file
// Upload to create multiple quizzes
```

---

## Need Help?

📖 **Full Documentation:** [QUIZ_CREATOR_GUIDE.md](./QUIZ_CREATOR_GUIDE.md)
📊 **Sample Questions:** [quiz-template.json](./frontend/quiz-template.json)
🚀 **Getting Started:** [QUICKSTART.md](./QUICKSTART.md)

---

**Ready to create your first quiz?** 

Run the app:
```bash
cd frontend
npm start
```

Then click **"🎨 Create Quiz"** and start creating! 🎉
