# Real AI answers to the example files

This folder holds real, unedited answers that an AI chat gave to one of the example files.
The survey shows each `*.output.md` file here on step 4 under "What an AI wrote back".
With no such file, that section does not appear.

How to add one:

1. Open the tool, click an example (for example "Tax office, 12 people") and go to step 4.
2. Download the file and upload it to one AI chat with the suggested message. Do not edit the answer.
3. Save the answer as `taxoffice.output.md` in this folder, with this header:

```
---
model: ChatGPT (GPT-5), free account
date: 2026-11-25
example: Tax office, 12 people
---
(the AI's answer, pasted as it came, Markdown is fine)
```

4. Run `npm run build`.

The example companies are fictional. Never write or polish the answer by hand.
