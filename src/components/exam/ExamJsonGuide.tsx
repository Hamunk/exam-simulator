import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ExamJsonGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileJson className="w-4 h-4 mr-2" />
          View JSON Format Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Exam JSON Format Guide</DialogTitle>
          <DialogDescription>
            Learn the structure for importing exams via JSON
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(85vh-8rem)] pr-4">
          <div className="space-y-6 text-sm">
            {/* Basic Structure */}
            <div>
              <h3 className="font-semibold text-base mb-2">Basic Structure</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "courseCode": "TDT4172",
  "examTitle": "Midterm Exam",
  "examYear": "2024",
  "examSemester": "Spring",
  "isPublic": true,
  "blocks": [...]
}`}
              </pre>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">courseCode</code>: Must match an existing course (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">examTitle</code>: Name of the exam (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">examYear</code>: 4-digit year (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">examSemester</code>: e.g., "Spring", "Fall" (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">isPublic</code>: true or false (default: true)</li>
              </ul>
            </div>

            {/* Block Structure */}
            <div>
              <h3 className="font-semibold text-base mb-2">Block Structure</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "id": "block-1",
  "title": "Part 1: Fundamentals",
  "backgroundInfo": "This section tests basic concepts...",
  "canBeNegative": false,
  "questions": [...]
}`}
              </pre>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">id</code>: Unique ID like "block-1", "block-2" (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">title</code>: Block name (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">backgroundInfo</code>: Context, supports math & code (optional)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">canBeNegative</code>: Allow negative scores (default: false)</li>
              </ul>
            </div>

            {/* Question Structure */}
            <div>
              <h3 className="font-semibold text-base mb-2">Question Structure</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "id": "q-1-1",
  "text": "What is $2^3$?",
  "options": ["4", "6", "8", "16"],
  "correctAnswers": [2],
  "multipleCorrect": false
}`}
              </pre>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">id</code>: Unique within block, e.g., "q-1-1", "q-1-2" (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">text</code>: Question text, supports math & code (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">options</code>: Array of answer choices, min 2 (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">correctAnswers</code>: Array of 0-based indices, e.g., [2] means 3rd option (required)</li>
                <li><code className="text-xs bg-muted px-1 py-0.5 rounded">multipleCorrect</code>: false for single answer, true for multiple (required)</li>
              </ul>
            </div>

            {/* Math Notation */}
            <div>
              <h3 className="font-semibold text-base mb-2">Math Notation (LaTeX)</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-muted-foreground mb-1">Inline math:</p>
                  <pre className="bg-muted p-2 rounded text-xs">$E = mc^2$</pre>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Display math:</p>
                  <pre className="bg-muted p-2 rounded text-xs">{"$$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$"}</pre>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Greek letters:</p>
                  <pre className="bg-muted p-2 rounded text-xs">{"$\\alpha, \\beta, \\gamma, \\theta$"}</pre>
                </div>
              </div>
            </div>

            {/* Code Snippets */}
            <div>
              <h3 className="font-semibold text-base mb-2">Code Snippets</h3>
              <p className="text-muted-foreground mb-2">Use triple backticks with language:</p>
              <pre className="bg-muted p-4 rounded-lg text-xs">
{`\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\``}
              </pre>
              <p className="text-muted-foreground mt-2 text-xs">Supported languages: python, javascript, java, c, cpp, and more</p>
            </div>

            {/* Complete Example */}
            <div>
              <h3 className="font-semibold text-base mb-2">Complete Example</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "courseCode": "TDT4172",
  "examTitle": "Sample Exam",
  "examYear": "2024",
  "examSemester": "Spring",
  "isPublic": true,
  "blocks": [
    {
      "id": "block-1",
      "title": "Mathematics",
      "backgroundInfo": "Solve the following problems.",
      "canBeNegative": false,
      "questions": [
        {
          "id": "q-1-1",
          "text": "What is $\\\\sqrt{16}$?",
          "options": ["2", "4", "8", "16"],
          "correctAnswers": [1],
          "multipleCorrect": false
        },
        {
          "id": "q-1-2",
          "text": "Which are prime numbers?",
          "options": ["2", "4", "7", "9"],
          "correctAnswers": [0, 2],
          "multipleCorrect": true
        }
      ]
    },
    {
      "id": "block-2",
      "title": "Programming",
      "backgroundInfo": "Code analysis questions.",
      "canBeNegative": false,
      "questions": [
        {
          "id": "q-2-1",
          "text": "What does this code output?\\n\`\`\`python\\nprint(2 ** 3)\\n\`\`\`",
          "options": ["6", "8", "9", "16"],
          "correctAnswers": [1],
          "multipleCorrect": false
        }
      ]
    }
  ]
}`}
              </pre>
            </div>

            {/* LLM Prompt Template */}
            <div>
              <h3 className="font-semibold text-base mb-2">🤖 LLM Prompt for Formatting Exams</h3>
              <p className="text-muted-foreground mb-2">
                <strong>This JSON format is designed for LLMs to create.</strong> Copy the prompt below to ChatGPT, Claude, or any LLM:
              </p>
              <pre className="bg-muted p-4 rounded-lg text-xs whitespace-pre-wrap">
{`You are formatting exam questions into JSON. Follow these rules EXACTLY:

STRUCTURE:
{
  "courseCode": "COURSE_CODE",
  "examTitle": "EXAM_TITLE", 
  "examYear": "YYYY",
  "examSemester": "Spring or Fall",
  "isPublic": true,
  "blocks": [ /* array of block objects */ ]
}

BLOCK STRUCTURE:
{
  "id": "block-1",  // increment: block-1, block-2, etc.
  "title": "Block title here",
  "backgroundInfo": "",  // optional context for the entire block
  "canBeNegative": false,
  "questions": [ /* array of question objects */ ]
}

QUESTION STRUCTURE:
{
  "id": "q-1-1",  // format: q-{blockNum}-{questionNum}
  "text": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswers": [0],  // array of indices (0-based!)
  "multipleCorrect": false  // CRITICAL: false if 1 answer, true if 2+ answers
}

🔴 CRITICAL RULES - LLMs OFTEN GET THESE WRONG:

1. multipleCorrect field:
   - If ONLY ONE correct answer → "multipleCorrect": false
   - If TWO OR MORE correct answers → "multipleCorrect": true
   - This determines if users see radio buttons (single) or checkboxes (multiple)

2. correctAnswers array:
   - Use 0-based indices: [0] = first option, [1] = second option, etc.
   - Can have multiple indices: [0, 2] = first and third options are correct
   - Length MUST match multipleCorrect (length 1 → false, length >1 → true)

3. Math notation (LaTeX):
   - Inline math: Use $x^2$ for inline formulas
   - Display math: Use $$\\frac{a}{b}$$ for centered equations
   - Escape backslashes in JSON: Use \\\\sum not \\sum, \\\\frac not \\frac
   - Example: "text": "What is $\\\\sqrt{16}$?"
   - Example: "text": "Solve: $$x^2 + 2x + 1 = 0$$"

4. Code blocks:
   - Use triple backticks with language identifier
   - Escape newlines as \\n in JSON strings
   - Example: "text": "What does this output?\\n\`\`\`python\\nprint(2 ** 3)\\n\`\`\`"

5. ID naming:
   - Blocks: "block-1", "block-2", "block-3", etc.
   - Questions: "q-1-1", "q-1-2" (first block), "q-2-1", "q-2-2" (second block), etc.

EXAMPLE - Single correct answer:
{
  "id": "q-1-1",
  "text": "What is $2^3$?",
  "options": ["4", "6", "8", "16"],
  "correctAnswers": [2],
  "multipleCorrect": false
}

EXAMPLE - Multiple correct answers:
{
  "id": "q-1-2",
  "text": "Which are prime numbers?",
  "options": ["2", "4", "7", "9"],
  "correctAnswers": [0, 2],
  "multipleCorrect": true
}

EXAMPLE - Math equation:
{
  "id": "q-2-1",
  "text": "Solve for x: $\\\\frac{x}{2} = 4$",
  "options": ["2", "4", "8", "16"],
  "correctAnswers": [2],
  "multipleCorrect": false
}

EXAMPLE - Python code:
{
  "id": "q-3-1",
  "text": "What does this code output?\\n\`\`\`python\\ndef f(x):\\n    return x * 2\\nprint(f(5))\\n\`\`\`",
  "options": ["5", "10", "15", "20"],
  "correctAnswers": [1],
  "multipleCorrect": false
}

Now format these exam questions following the rules above:

[PASTE YOUR QUESTIONS HERE]`}
              </pre>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  ⚠️ Common LLM Mistakes to Check:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>✓ If 2+ correct answers, ensure <code className="bg-muted px-1 py-0.5 rounded">multipleCorrect: true</code></li>
                  <li>✓ Math uses double backslashes: <code className="bg-muted px-1 py-0.5 rounded">\\\\frac</code> not <code className="bg-muted px-1 py-0.5 rounded">\\frac</code></li>
                  <li>✓ Code blocks use <code className="bg-muted px-1 py-0.5 rounded">\\n</code> for newlines in JSON</li>
                  <li>✓ correctAnswers uses 0-based indices (first option = 0)</li>
                </ul>
              </div>
            </div>

            {/* Common Mistakes */}
            <div>
              <h3 className="font-semibold text-base mb-2">Common Mistakes</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>❌ Non-unique IDs (must be unique within scope)</li>
                <li>❌ correctAnswers out of bounds (must be valid indices)</li>
                <li>❌ multipleCorrect mismatch (false with 2+ correct answers)</li>
                <li>❌ courseCode doesn't exist (create course first)</li>
                <li>❌ Empty question text or options</li>
                <li>❌ No correct answers selected</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
