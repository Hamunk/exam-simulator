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
              <h3 className="font-semibold text-base mb-2">Using AI to Format Exams</h3>
              <p className="text-muted-foreground mb-2">Copy this prompt template to your favorite LLM:</p>
              <pre className="bg-muted p-4 rounded-lg text-xs whitespace-pre-wrap">
{`Convert the following exam questions into JSON format matching this structure:

{
  "courseCode": "COURSE_CODE",
  "examTitle": "EXAM_TITLE",
  "examYear": "YYYY",
  "examSemester": "Spring/Fall",
  "isPublic": true,
  "blocks": [
    {
      "id": "block-N",
      "title": "Block Title",
      "backgroundInfo": "Optional context",
      "canBeNegative": false,
      "questions": [
        {
          "id": "q-N-M",
          "text": "Question text",
          "options": ["option1", "option2", ...],
          "correctAnswers": [index1, index2, ...],
          "multipleCorrect": true/false
        }
      ]
    }
  ]
}

Rules:
- Use unique IDs: "block-1", "block-2" for blocks
- Use "q-1-1", "q-1-2" format for questions (block-question)
- correctAnswers contains 0-based indices (0 = first option)
- multipleCorrect: true if >1 correct answer, false if exactly 1
- Use LaTeX for math: $inline$ or $$display$$
- Use \`\`\`language for code blocks

My questions:
[PASTE YOUR QUESTIONS HERE]`}
              </pre>
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
