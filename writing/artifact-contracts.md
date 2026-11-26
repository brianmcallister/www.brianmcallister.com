# Artifact contracts

*Draft 1, 2026-11-26. Written from the script for the "Artifact contracts" talk, `video/script.md`. No illustrations exist yet. Each image placeholder names the deck slide in `video/index.html` the illustration should be redrawn from.*

---

**[Hero illustration: two agent sessions with a file between them and a contract above the file. From slide 8, "Artifact contracts".]**

In [Thinking in artifacts](https://www.youtube.com/watch?v=EorCEnMMxWY) I argued that every AI session should end in a file, and that the next session should start from that file instead of from the scrollback. This post is about what comes next. Once agents are passing files to each other, the shape of those files starts to matter, and a contract is how you define that shape. I think it is the step that makes fully end to end agentic processes possible.

## Agents pass artifacts to each other

**[Illustration: a chain of agents and files. Plan agent, plan.md, Spec agent, spec.md, Implement agent, code, Validate agent, review.md. From slide 3, "Agents pass artifacts to each other".]**

A quick recap. When you design a workflow to be artifact centric, you direct each session to produce artifacts, and those artifacts carry context forward into new, fresh sessions. It is a good way to manage how much sits in the context window before it becomes a problem.

Use agents this way and they end up passing artifacts between each other. A plan becomes a spec, a spec becomes code, code becomes a review. Each handoff is a file one agent writes and another reads.

The shape of those files influences three things you can optimize for: what the pipeline costs, how good the output is, and how fast it runs.

## A handoff is an API

**[Illustration: a server and a client with a response between them, mirrored below by two agent sessions with artifact.md between them, and the three words structure, decoupling, testability. From slide 4, "A handoff is an API".]**

There is a tool we all know well that solves the same problem: an API.

A server and a client do not share state, so they agree on an API and communicate through it. Two agent sessions are in a very similar arrangement. They share no memory and no context, but we can pass information between them with artifacts.

We use APIs for three reasons, and the rest of this post keeps coming back to them.

- **Structure.** The client reads only the fields it needs, not the entire database behind the application.
- **Decoupling.** Neither side has to know what sits upstream or downstream. You can swap the model, the tools or the harness, and nothing downstream needs to care.
- **Testability.** You can check, and more importantly enforce, what went into a session and what came out. A test fails when either is wrong, which saves time and money when you are designing agentic workflows.

## What goes wrong without them

Each of the three has a failure that shows up when it is missing.

### Without structure

**[Illustration: an agent session hands a plan.md of three thousand lines to the next session, whose context bar fills. From slide 5, "Without structure".]**

Your sessions may already be producing artifacts, and those artifacts can get large. That is not a bad thing in itself. But the next session may have to read the whole artifact to find the three or four facts it needs, and you pay for that read at every stage. Hand over three, five or ten thousand lines of Markdown and that plan refills the context window you just emptied.

### Without decoupling

**[Illustration: the chain of agents and files with one stage changed and everything downstream turning red. From slide 6, "Without decoupling".]**

Without decoupling you cannot safely change one part of the system without changing the rest. Swap the design of a skill or an agent at one stage, and everything downstream has to be adjusted for the difference in behavior.

### Without testability

**[Illustration: a coding agent hands free prose to a deploy agent, which cannot deploy it. From slide 7, "Without testability".]**

Without testability you cannot be sure your agent is doing what you want. A new model may produce subtly different results that are hard to catch until a person reviews the output, and that does not scale.

In the worst case you become the integration layer. Reviewing and re-checking everything by hand is exactly the work we were trying to automate.

## The contract sits in the middle

The contract sits between two sessions and defines what the artifact actually is. The two sessions still pass a file between them, but now a contract says exactly what that file must contain.

## A contract has three parts

**[Illustration: three columns. A JSON Schema, an artifact that conforms to it, and the output of git diff confirming the files it names. From slide 9, "A contract has three parts".]**

The first part is a schema. It says which sections, keys and values must be in the file. This example uses JSON Schema.

```json
{
  "required": ["verdict", "files", "ask"],
  "properties": {
    "verdict": { "enum": ["pass", "fail"] },
    "files": { "type": "array" },
    "ask": { "type": ["string", "null"] }
  }
}
```

An artifact that meets it looks like this.

```json
{
  "verdict": "fail",
  "files": ["src/export.ts", "src/export.test.ts"],
  "ask": "Keep legacy columns?"
}
```

The second part is enforcement. With a schema in place, deterministic code can check whether the output of a session matches what you expect. If you run eval pipelines, which is a topic for a later post, you can enforce this automatically, the same way tests run in a CI/CD pipeline.

The third part is external validation. A schema can be satisfied by an artifact whose contents are wrong, so you still need to check the contents. In this example that means checking that the two files the artifact names actually exist.

## Artifacts may have multiple readers

**[Illustration: session one writes review.md for human review and contract.json for session two. From slide 10, "Artifacts may have multiple readers".]**

One thing here can be unintuitive. Defining the shape of an artifact with a contract does not mean a session is only allowed to produce one artifact. A session can write several, for different readers and different reasons, and sometimes it should.

I find it very useful to produce content for people. It might be read during a review step in the workflow, but more often it gets used downstream, for example in a changelog that describes a collection of individual tasks.

Longer form content is also useful to agents that analyse sessions later, when you want to know what happened and when as an input to a feedback loop.

So you are not locked into one artifact per session. Produce as many as you need, based on who needs to read them.

## How contracts mature

**[Illustration: four rising steps. Convention, template, schema, verified. From slide 11, "How contracts mature".]**

If you want to start using this, it helps to think about adding it to your workflows progressively. There are four steps.

1. **Convention.** Your team, or your agent sessions, may already be writing plans. The structure of those plans is not defined yet.
2. **Template.** A template adds fixed structure to the artifact. Direct your agent to follow it, and check that it does.
3. **Schema.** Required fields and value types, validated by a script after every write. This is the step the post has been describing.
4. **Verified.** The schemas are integrated into an automated process that validates against ground truth. Usually that means automated eval pipelines that surface errors to people and agents to be fixed.

## Example: a software factory

**[Illustration: an issue goes in, a pull request comes out, and six stages sit between them with a file after each. Analyzer, Planner, Plan Validator, Implementer, Reviewer, Deployer. From slide 12, "A software factory".]**

Take the software factory pattern. An issue goes in one end and a reviewable pull request comes out the other. In between, six agents run in sequence, each as a fresh session: Analyzer, Planner, Plan Validator, Implementer, Reviewer and Deployer.

Each stage passes artifacts to the next. At each stage a validator reads the artifact against its contract, and if a heading is missing or a value is outside its allowed type, the pipeline stops and surfaces an error.

The error and the reason for it should be part of the output too, and enforced by the contract like everything else. If the Analyzer needs to stop the run, its output should say why. When a stage stops and the reason is written to an artifact, a person or an agent has what they need to decide how to fix it.

## Change one part, touch nothing else

**[Illustration: the same pipeline with a Risks section added to plan.md and every other stage and file unchanged. From slide 13, "Change one part, touch nothing else".]**

The same example shows what decoupling buys you.

Say we want to add a risks section to the Planner's output. We change the contract for the plan.md artifact. We may need to update the Plan Validator so it knows about the new structure. Nothing else changes, and everything downstream stays as it was.

## Example: consultant profiles

**[Illustration: many inputs on the left, a Profile agent writing profile.json in the middle, and deck, CV and Excel renderers on the right. From slide 15, "One schema in the middle".]**

Here is one from our own work. Lab49 is a consulting company, and we maintain a consultant profile for every consultant on the team. Think of it as a CV that is specific to Lab49. Every profile uses the same sections and standard language, so clients can easily understand the people on their project. If you are a Lab49 client, you have seen these.

Over time profiles drift out of date, and project history lives somewhere else entirely. Turning all of that into one current profile per person was manual and tedious, and the result could differ depending on who made the updates. We have automated it end to end.

The inputs are messy and disparate: CVs in whatever format people kept them, the existing profiles, data from completed projects, and input from clients describing what a project needs.

An agentic process reads them and writes an artifact, but the artifact is not a profile. The model generates the content, and instead of writing a document it writes a JSON file in the shape of the profile contract. We run a validator against it like any other artifact.

Renderers then read that file and produce whatever format suits the client. It could be a slide for a pitch deck, a PDF, or an Excel sheet of structured data.

If we change the inputs, add a data source, or swap the model the agent uses, the renderers do not change at all. If we need a new output format, the generation step does not change. The schema in the middle is what the two sides share. It is protected by tests and validation, so each part of the system can be iterated on independently.

## Five rules

**[Illustration: the five rules as a checklist. From slide 16, "Five rules".]**

If you want to do this yourself, here are five rules I would propose.

1. **Write artifacts for their consumers.** Markdown for people, JSON for the pipeline.
2. **Define the contract once and enforce it with a script.**
3. **Keep schemas in version control with your project,** versioned and reviewed like code.
4. **Write failure conditions into artifacts,** and define them in the schema.
5. **Validate artifacts, not just the schema.** Schema validation tells you the file is the right shape. True validation tells you the contents are correct.

## Where to start

Find the rung you are on. If your agents write plans by convention, give them a template. If they already follow a template, write the schema down and run a script against it after every write.

If you are on this journey and working out how to structure your agentic processes, we would be glad to talk. Reach out to us at Lab49.
