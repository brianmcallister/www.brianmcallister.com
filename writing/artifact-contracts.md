---
title: Artifact Contracts
date: 2026-11-26
description: Once agents pass files to each other, the shape of those files matters. A contract defines that shape, and makes agentic pipelines cheaper, better and easier to change.
draft: true
---

In [Thinking in Artifacts](/writing/thinking-in-artifacts) I wrote about how to set up a process to get your agents writing their outputs to files, artifacts, which can be used to carry context forward into new, fresh agent sessions. The primary reason for doing this is to ensure that the context window of sessions stays as small as possible, which gets you higher-quality responses from the model you're using. While I didn't go into depth, you can read all about "the dumb zone" online. Here's [a fun one from Matt Pocock](https://x.com/mattpocockuk/status/2071288332642812229). This is what we're trying to avoid by using this technique.

[Artifact contracts: the shape of what agents hand each other](https://www.youtube.com/watch?v=y7LiidypVSU)

This post is about how to define and describe the shape of the artifacts themselves. Once you work out the basics of this flow, the shape of the artifacts really starts to matter, and a contract is how you define it. This is the step that makes fully end-to-end agentic processes possible.

## Agents pass artifacts to each other

A quick recap. When you design a workflow to be artifact-centric, you direct each session to produce artifacts, and those artifacts carry context forward into new, fresh sessions. It's a good way to manage how much sits in the context window before it becomes a problem.

![A plan agent writes plan.md, a spec agent reads it and writes spec.md, an implement agent writes code, and a validate agent writes review.md.](/images/artifact-contracts/01-agents-pass-artifacts@2x.png)

Use agents this way and they end up passing artifacts between each other. A plan becomes a spec, a spec becomes code, code becomes a review. Each handoff is a file one agent writes and another reads.

The shape of those files influences three things you can optimize for: what the pipeline costs, how good the output is, and how fast it runs.

## A handoff is an API

I think there's a great analogy we can make here. We use APIs all the time to add structure to the messages we send between a client and server. Two agents talking to each other is a similar style of communication, and we can follow this pattern to help our agents send the right messages to each other.

![A server sends a response to a client, just as one agent session sends artifact.md to another. Both give you structure, decoupling and testability.](/images/artifact-contracts/02-a-handoff-is-an-api@2x.png)

We use APIs for three reasons, and I'll keep coming back to these:

First is structure. An API client reads only the fields it needs. You wouldn't send an entire database table as JSON to a web app; you send a subset in the exact shape the UI needs.

Second is decoupling. Any individual agent doesn't have to know what sits upstream or downstream. You can swap the model like you would a database, the tools or the harness like you would infrastructure, and nothing downstream needs to care.

Last is testability. You can check, and more importantly enforce, what went into a session and what came out. You can design tests that fail when inputs and outputs don't match your expectations. This is a huge money saver, because you can be sure that agents behave the way you expect instead of burning tokens going in circles.

## What goes wrong without them

Each of the three has a failure that shows up when it is missing.

### Without structure

![One agent session hands a 3,000-line plan.md to the next, whose context fills to 176k of 200k tokens, 88% full.](/images/artifact-contracts/03-without-structure@2x.png)

Your sessions may already be producing artifacts. Those artifacts can get large and that's not an inherently bad thing. The issue is that if you pass an entire, large document to the next session, it reads the entire document to search for the three or four bits it really needs to do its job. You pay for those token writes and reads, even if your data is cached. If you're forcing the agent to consume three, five or ten thousand lines of Markdown, you're filling up the context window in the next session, which you just emptied from the last session.

### Without decoupling

![In a chain of plan, spec, implement and validate agents, pulling out the implement agent leaves its code with nowhere to go.](/images/artifact-contracts/04-without-decoupling@2x.png)

Without decoupling you can't safely change one part of the system without changing the rest. Swap the design of a skill or an agent at one stage, and everything downstream has to be adjusted for the difference in behavior.

### Without testability

![A coding agent hands a deploy agent free prose that starts "Once upon a time", and the deploy agent says "I can't deploy this". Game over.](/images/artifact-contracts/05-without-testability@2x.png)

Without testability you can't really be sure your agents are doing what you want. If you change the model any single agent uses, it may produce subtly different results that are hard to catch until a person reviews the output, and that doesn't scale.

In the worst case you become the integration layer. Reviewing and re-checking everything by hand is exactly the work we are trying to automate.

## The contract sits in the middle

The contract sits between two sessions and defines what the artifact actually is.

![Session one passes a JSON artifact, with a verdict, a list of files and an ask, to session two.](/images/artifact-contracts/00-hero@2x.png)

The two sessions still pass a file between them, but now a contract says exactly what that file contains.

## A contract has three parts

![A JSON schema, a contract artifact that matches it, checked by jsonschema.validate, and validation against the real files with git diff --stat.](/images/artifact-contracts/06-three-parts@2x.png)

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

An artifact that follows this shape may look like this:

```json
{
  "verdict": "fail",
  "files": ["src/export.ts", "src/export.test.ts"],
  "ask": "Keep legacy columns?"
}
```

The second part is enforcement. With a schema in place, deterministic code can check whether an artifact matches the intended schema. If you run eval pipelines, which is a topic for a later post, you can enforce this automatically, the same way tests run in a CI/CD pipeline.

The third part is external validation. A schema can be satisfied by an artifact whose contents are wrong, so you still need to check the contents. In this example that means checking that `src/export.ts` and `src/export.test.ts` actually exist. This could be as simple as `git diff --stat`.

## Artifacts may have multiple readers

![Session one writes review.md for a human review and contract.json for session two.](/images/artifact-contracts/07-multiple-readers@2x.png)

I do want to point out one thing that can be a bit unintuitive. Defining the shape of an artifact with a contract doesn't mean a session is only allowed to produce one artifact. A session can write many artifacts, for different readers and different reasons, and sometimes it should.

I find it very useful to direct agents to produce content for people. It might be read during a review step in the workflow, but more often it gets used downstream, for example in a changelog that describes a collection of individual tasks.

Longer-form content is also useful to agents that analyze sessions later, when you want to know what happened and when as an input to a feedback loop (yet another future post!).

So you're not locked into one artifact per session. Produce as many as you need, based on who is going to read them and why.

## How contracts mature

If you want to start using this, it helps to think about adding it to your workflows progressively. There are four steps.

![Four rising steps: convention, writing a plan.md; template, with fixed headings checked by eye; schema, with required keys and enums validated by a script; and verified, with content checked against ground truth.](/images/artifact-contracts/08-how-contracts-mature@2x.png)

1. **Convention.** Your team, or your agent sessions, may already be writing plans. The structure of those plans isn't defined yet.
2. **Template.** A template adds fixed structure to the artifact. Direct your agent to follow it, and check that it does.
3. **Schema.** Required fields and value types, validated by a script after every write. This is the step this post has been describing.
4. **Verified.** The schemas are integrated into an automated process that validates against ground truth. Usually that means automated eval pipelines that surface errors to people and agents to be fixed.

## Example: a software factory

Take the software factory pattern. An issue goes in one end and a reviewable pull request comes out the other. In between, six agents run in sequence, each as a fresh session: Analyzer, Planner, Plan Validator, Implementer, Reviewer and Deployer.

![An issue goes in, six agents run in sequence, analyzer, planner, plan validator, implementer, reviewer and deployer, each writing a file, and a pull request comes out.](/images/artifact-contracts/09-a-software-factory@2x.png)

Each stage passes artifacts to the next. At each stage a validator reads the artifact against its contract, and if a heading is missing or a value is outside its allowed type, the pipeline stops and surfaces an error.

The error and the reason for it should be part of the output too, and enforced by the contract like everything else. If the Analyzer needs to stop the run, its output should say why. When a stage stops and the reason is written to an artifact, a person or an agent has what they need to decide how to fix it. We used an example like this just a few lines up.

```json
{
  "verdict": "fail",
  "files": ["src/export.ts", "src/export.test.ts"],
  "ask": "Keep legacy columns?"
}
```

An error can still produce an artifact describing what went wrong, and that error can follow a contract. Imagine what you can do with this structured information. Now you can surface agent problems up to agents and humans for fixing.

## Change one part, touch nothing else

We can stick with the same example to show how you can achieve decoupling.

![A Risks section is added to the planner's plan.md, and every other stage and file in the software factory stays the same.](/images/artifact-contracts/10-change-one-part@2x.png)

Let's say we want to add a "risks" section to the Planner's output. We change the contract for the `plan.md` artifact. We may want to update the Plan Validator so it can make a decision or take an action with the new risks content, but nothing else changes. Everything downstream stays as it was with no changes.

## Example: consultant profiles

Here's a real example from my work at Lab49. Lab49 is a consulting company, and we maintain a consultant profile for every consultant on the team. You can think of it as a resume for our consultants, but very specific to Lab49. Every profile uses the same sections and standard language, so our clients can easily understand the profiles of the people we assign to their project. If you're a Lab49 client, you've certainly seen these.

![CVs, existing profiles, completed project data and a profile spec go into a profile agent, which writes profile.json. Deck, CV and Excel renderers turn it into slides, a CV document and Excel data.](/images/artifact-contracts/11-one-schema-in-the-middle@2x.png)

The problem here is that over time, profiles drift out of date, and project history lives somewhere else entirely. Turning all of that into one current profile per person was manual and tedious, and the results could vary quite a lot depending on who made the updates. Today, we've automated this end to end.

The inputs are messy and disparate: people's existing resumes are in all kinds of different formats and structures. Our library of existing profiles does quickly get out of date. Data from ongoing and completed projects are in multiple locations. Requirements from clients also come in many shapes and sizes.

We've designed a system of agents that reads all this content and writes an artifact. But that artifact isn't a profile. The agent generates the content, and instead of writing a consultant profile it writes a JSON file that matches the schema of the profile contract. We run a validator against it like any other artifact.

Document renderers then consume that file and produce whatever format suits the client. It could be a slide for a pitch deck, a PDF, or an Excel sheet of structured data. This means that the agents that produce outputs only read the exact data they need to do so. A client RFP never makes its way into a profile rendering agent, and it doesn't have to.

If we change the inputs, like adding a data source, or swap the model an agent uses, the renderers don't change at all. If we need a new output format, the earlier content generation steps don't change. The schema in the middle is what is shared and enforced. It's protected by tests and validation, so each part of the system can be iterated on independently.

## Five rules

If you want to do this yourself, here are five rules I would propose.

![Five rules: write artifacts for their consumers, Markdown for people and JSON for the pipeline; define the contract once and enforce it with a script; keep schemas in version control, versioned and reviewed like code; write failure conditions into artifacts, and define them in the schema; validate artifacts, not just the schema.](/images/artifact-contracts/12-five-rules@2x.png)

1. **Write artifacts for their consumers.** Markdown for people, JSON for the pipeline.
2. **Define the contract once and enforce it with a script.** Simple, deterministic, and a solved problem.
3. **Keep schemas in version control with your project**, versioned and reviewed like code.
4. **Write failure conditions into artifacts**, and define them in the schema.
5. **Validate artifacts, not just the schema.** Schema validation tells you artifacts are the right shape. Content validation checks that content is correct.

## Where to start

Find the step you're already on. If your agents write plans by convention, give them a template. If they already follow a template, write the schema down and run a script against it after every write.
