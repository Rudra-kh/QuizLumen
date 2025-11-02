# 🎨 Quiz Creator Feature Guide

## Overview
The Quiz Creator feature allows users to create custom quizzes and share them with participants. Users can either manually create questions or upload a JSON/JS file containing the quiz questions.

## Features

### 1. **Create Quiz Manually** ✍️
- Add questions one by one
- Specify 4 options for each question
- Mark the correct answer
- Review all questions before creating
- Download questions as JSON for backup

### 2. **Upload Quiz File** 📁
- Upload JSON or JavaScript files
- Automatically parse question arrays
- Download template file for reference
- Validate question format

### 3. **Share Quiz** 🔗
- Generate unique quiz ID
- Get shareable link
- Copy link/ID to clipboard
- Invite unlimited participants

## How to Use

### Creating a Quiz Manually

1. **Click "Create Quiz" button** in the main interface
2. **Enter Quiz Title** (e.g., "Geography Challenge")
3. **Select "Create Manually"**
4. **Add Questions:**
   - Enter your question text
   - Fill in all 4 options
   - Click "Set Correct" on the right answer
   - Click "Add Question"
5. **Review Questions** in the list below
6. **Click "Create Quiz & Get Share Link"**
7. **Share the generated link** with participants

### Uploading a Quiz File

1. **Click "Create Quiz" button**
2. **Enter Quiz Title**
3. **Select "Upload File"**
4. **Download Template** (optional) to see the format
5. **Upload your JSON file** with questions
6. **Click "Create Quiz & Get Share Link"**
7. **Share the link**

## File Formats

### JSON Format (Recommended)
```json
[
    {
        "id": 1,
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correctAnswer": 2
    },
    {
        "id": 2,
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": 1
    }
]
```

### JavaScript Format
```javascript
const myQuestions = [
    {
        id: 1,
        question: "Your question here?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0  // Index of correct option (0-3)
    }
];
```

## Question Format Rules

Each question MUST have:
- **id** (number): Unique identifier
- **question** (string): The question text
- **options** (array): Exactly 4 answer options
- **correctAnswer** (number): Index of correct option (0-3)
  - 0 = First option
  - 1 = Second option
  - 2 = Third option
  - 3 = Fourth option

## Participant Experience

1. User receives share link (e.g., `http://localhost:3000?quiz=quiz_1234567_abc`)
2. Opens link in browser
3. Sees custom quiz title and questions
4. Answers all questions
5. Submits answers
6. Results recorded on blockchain

## Storage

- **Development:** Quizzes stored in browser localStorage
- **Production:** Quizzes should be stored on:
  - IPFS for decentralized storage
  - Backend database for reliability
  - Blockchain for immutability (metadata only)

## Tips

✅ **DO:**
- Create clear, unambiguous questions
- Test your quiz before sharing
- Download questions as backup
- Use descriptive quiz titles
- Provide exactly 4 options per question

❌ **DON'T:**
- Leave questions or options empty
- Use special characters that break JSON
- Create too many questions (keep it engaging)
- Forget to mark the correct answer

## Advanced Usage

### Creating Quiz Templates
1. Create quiz manually
2. Download questions as JSON
3. Edit in text editor
4. Reuse template for similar quizzes

### Bulk Quiz Creation
```javascript
// Generate questions programmatically
const questions = [];
for (let i = 1; i <= 10; i++) {
    questions.push({
        id: i,
        question: `Question ${i}?`,
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    });
}
// Save as JSON and upload
```

### Sharing Multiple Quizzes
- Create multiple quizzes
- Each gets unique ID
- Share different links to different groups
- Track participation separately

## Troubleshooting

**Quiz not loading?**
- Check if quiz ID is correct
- Verify localStorage has quiz data
- Try creating quiz again

**Upload failed?**
- Verify JSON format is valid
- Check all required fields present
- Use template as reference

**Can't share link?**
- Copy manually from text box
- Check browser clipboard permissions
- Use "Copy Quiz ID" as backup

## Future Enhancements

🚀 Planned features:
- [ ] Quiz analytics dashboard
- [ ] Time limits per question
- [ ] Question categories/tags
- [ ] Import from Google Forms
- [ ] Export to PDF
- [ ] Quiz templates library
- [ ] Collaborative quiz editing
- [ ] Question pools/randomization

## Integration with Smart Contract

Once smart contract is deployed:
1. Quiz creator pays fee to create quiz
2. Participants pay fee to enter
3. Answers submitted to blockchain
4. Winners automatically determined
5. Prizes distributed on-chain

## Example Workflow

```
Creator Flow:
1. Click "Create Quiz" → 2. Add 10 questions → 
3. Get share link → 4. Share on social media

Participant Flow:
1. Click shared link → 2. Register (pay 10 XLM) → 
3. Answer questions → 4. Submit → 5. Wait for results

Admin Flow:
1. Start quiz → 2. Wait for submissions → 
3. End quiz → 4. Distribute prizes
```

## Support

For issues or questions:
- Check this guide first
- Review the template file
- Ensure JSON format is correct
- Test with sample quiz first
