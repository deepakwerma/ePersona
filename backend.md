backend structure
two syatem prompt of two profile
  1. hitesh choudhary
  2. piyushb garg

the system is never break the personality

function tool calling
1. suggest thier own courses and yt videos on the topics if student asking.
2. they can serve the web to know th whats happening in tech industry to validate the new and other detail acrooss web.
3. parse pdf, photo for resume analysis and give them suggestion. they can also roast the resume.
4. also they have two personality, one personality gives natural and normal as per thier tair, 2nd one is also folllow thier personality and treat but they can slightly uses sarcastic and humurous way in thier own style. 

user features.
1. saving chats responses in their chat history.
2. user can anythime change the person , if they wanted to switch the personal to talk they can in the same chat when no conversation is in the queue.
3. better at managing the context like if they person change but the context is sharing across different persons and  works percetly. 
4. saves specific time and detail wghich are important for which can be used in further conversation better content manager.

the whole system of handling chain of thoughts prompt and the system has to reliable and exporing each steps to the frontent.
the system promt never break their personality when the prompt injection is happening then the system needs t be propm injection proof. also thebsystem need s to communicate properly with the frontent . 

for database we are using neondb





hey you are an expert developer of experience of 20 years and you have to make backend for your project with the following requirement so suggest aacording to the requirement which fits and does the job perfectly as a top developer and system needs to be more reliable
 you have to think first about the user problem what they are sying analysis the problem, then breakdown the problen innto each smaller components then think about the solution the again verify the solution reoate this process for all components and a th end before giving the suggestion again verify one ce the final and then give the final output. also the output shoul be clear and simple enought to understand the strucutre also use folder diagram to understand the strucutre of the system better


hey now lets focus on backend from backend we are making file in javascript and we are operating chain of thought prompt on the backend from deepseek api i bought bthe most affordabl plan for deepseek.  so just tell me the strucure to how to make the backend and connect with the frontentd. so help me to build thids . dont overexplain and write text also use file structure for better uderstanding and easy understanding. inside backen we are givign sy





Here's a complete question bank to run through NotebookLM (one pass per persona). Ask these in order — each builds on the last.
Step 1: Identity & Background
Based on these sources, summarize: their teaching background, what topics they focus on, their stated philosophy about learning/teaching, and any personal story they repeat often.
Step 2: Vocabulary & Language Patterns
List every recurring word, phrase, or expression this person uses repeatedly across these sources. Include filler words, transition phrases, and any Hindi-English code-switching patterns. Note approximate frequency if possible.
Step 3: Sentence Structure & Rhythm
Analyze how this person structures sentences when explaining something technical. Do they use short punchy sentences or long explanatory ones? Do they ask rhetorical questions before answering? Do they front-load conclusions or build up to them?
Step 4: Teaching Style
When this person explains a technical concept, what's their sequence? Do they start with an analogy, a real-world example, code first, or a definition first? Do they use storytelling? Give 2-3 examples of how they've explained different concepts.
Step 5: Tone & Emotional Register
Describe this person's tone when: (a) explaining something a beginner finds confusing, (b) reacting to a common mistake or bad practice, (c) discussing something they're excited about, (d) responding to an off-topic or lazy question. Is their default tone encouraging, blunt, sarcastic, or something else?
Step 6: Catchphrases & Signature Moves
What specific phrases or expressions does this person repeat so often they'd be considered a "catchphrase" or signature line? What analogies or metaphors do they reuse across multiple videos?
Step 7: Opinions & Stances
What strong opinions or recurring takes does this person express — on tools, frameworks, learning shortcuts, job-hunting, industry trends, or student habits? List specific stances, not generic statements.
Step 8: Reaction Patterns
How does this person typically respond to: a beginner asking something very basic, someone showing broken/bad code, someone asking about shortcuts or "easy way out," and hype/trendy topics?
Step 9: Structural Habits
Do they follow a consistent structure when answering questions or teaching a topic — e.g., always end with a challenge, always give steps, always summarize at the end? Describe any recurring format.
Step 10: What They'd Never Say
Based on their values and tone across these sources, what kind of response, language, or attitude would feel completely out of character for this person?
Step 11: Dual-Mode Tonal Range
Across these sources, find moments where this person's tone shifts from their default teaching register into something more sarcastic, teasing, or humorous — while still sounding like themselves. What triggers this shift (a bad practice, a repeated beginner mistake, an obvious question, a trending but overhyped tool)? 

Then for the final compilation, use this addendum prompt (paired with your existing closing prompt)
Based on the same personality profile for [name], write two versions of the Behavior and Constraints layers:

Mode A (Normal): Their natural, default teaching tone as consistently shown across sources.

Mode B (Sarcastic/Humorous): The same person, same values, same vocabulary and teaching goals — but leaning into the playful/sarcastic register identified in Step 11. This should read as the same person in a lighter mood, not a different character.
Keep Identity and Voice layers shared between both modes; only Behavior and Constraints should differ.
Output only the final text for both modes, ready to paste directly into config — no explanation, no meta-commentary.


2......  new final output



Based on the same personality profile for [name], write two versions of the Behavior and Constraints layers:

Mode A (Normal): Their natural, default teaching tone as consistently shown across sources.

Mode B (Sarcastic/Humorous): The same person, same values, same vocabulary and teaching goals — but leaning into the playful/sarcastic register identified in Step 11. This should read as the same person in a lighter mood, not a different character.

Keep Identity and Voice layers shared between both modes; only Behavior and Constraints should differ.

Output only the final text for both modes, ready to paste directly into config — no explanation, no meta-commentary.





1.... old final prompt



After collecting all 10 answers, compile them into one document per persona, then feed that whole compiled doc to Gemini/Claude with this final prompt:
Here are extracted personality patterns for [name] from real transcripts. Write a 4-layer system prompt (Identity, Voice, Behavior, Constraints) that would let an AI replicate this person's response style accurately. Do not use generic tutor language — bake in the specific patterns listed below: [paste compiled notes]
This gives you a traceable, complete trait map instead of guessing what to include.