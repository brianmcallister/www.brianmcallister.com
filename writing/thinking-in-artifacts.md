---
title: Thinking in Artifacts
date: 2026-11-22
description: Why ending each AI session with a file beats living in the chat, and how that habit leads to handing real work to agents.
draft: true
---

[Thinking In Artifacts](https://www.youtube.com/watch?v=EorCEnMMxWY)

Most of us started using AI the same way. Open a chat, ask a question, keep going. For a while that works. Then the answers get worse, the conversation drifts, and when the tab closes everything you built up inside it is gone. This post is about a habit that fixes that, and about why it is also the first step toward agents doing work without you in the room.

## Who this is for

If you have used Copilot or ChatGPT mostly for one-off questions and quick answers, and agentic workflows are the next step rather than something you do today, this is for you. It applies just as much if you already live in Claude Code, Copilot CLI or Codex. The interface changes. The habit does not.

## Why living in the chat breaks down

**[Image: slide "Living in the chat". A long chat transcript with the context window gauge at the bottom nearly full.]**

The view everyone recognises is a single long conversation. Everything you have discussed lives in the chat itself. Three things go wrong with that.

The context window fills. As it does, the quality of the model's responses degrades. You can watch it happen on the gauge at the bottom of the screen.

Long chats are hard for a person to manage. You forget what any one session was about, especially when you have three or four open at once, which most of us do now.

And the conversation is fragile. If the state of your task exists only in the scrollback, you are the memory of that task, and that memory evaporates when the session ends.

## Two mental models

**[Image: slide "Chat-centric vs artifact-centric". Two columns side by side, the left a single long conversation, the right a chat producing files that fan out to people and agents.]**

On the left is the chat-centric model. You interact with a chat, you have a long-running conversation, and everything you talked about lives in that history.

On the right is the artifact-centric model. You still work through a chat with your preferred model, but you direct the agent to write the outcomes of the conversation to artifacts: files, usually, on disk.

Artifacts matter because they are durable. Durable things are shareable, with the people you work with and with other agents. And if you build them with a little care, they become agent consumable, which is what unlocks more complicated agentic processes down the line.

## Let the artifact be the memory

**[Image: slide "Where context lives". Context flowing from a chat session into files, with the chat-only path shown fading out.]**

When you think in artifacts, context finds its way into files. The opposite is a chat-only workflow, where context lives only in the conversation and disappears with it.

So the pattern is this. Interact with your agent, and direct it to create artifacts that become the context for future sessions. Those sessions might be more chats you have yourself. They might be unattended agentic processes. Either way, you do not want to be the memory of the task or the workflow you are trying to complete. Let the artifact be that memory.

## The loop

**[Image: slide "The artifact loop". A cycle of four steps: create artifacts, iterate in chat, update the artifacts, start a new chat with the artifacts as context.]**

There is a simple loop to this.

Direct your agent to create artifacts, so the output of a session lands in durable files. Iterate in the chat to build up context, which is a perfectly good use of a conversation, and have the agent update the artifacts as you go. When you are ready, start a new chat and hand it the artifacts as its context. Then go round again. The artifacts carry the context forward into every future session, and no single conversation has to hold all of it.

## The ladder to delegated work

**[Image: slide "The ladder". Four rungs from bottom to top: one-on-one chat, context copied out of chat, chat creating artifacts, agents looping on artifacts.]**

You can also think of this as a ladder.

At the bottom is where everyone starts: a one-on-one chat session with an agent. One rung up is taking context out of the chat by hand, copying code or answers the agent gave you somewhere else. The rung this post is about is chat that creates artifacts. Above that, agents loop on top of your artifacts, which gets much closer to fully delegating work to agentic processes.

If I had to sum up why this matters in one line, it is this. You cannot hand an agent a long-running, ephemeral, personal chat history. You can hand an agent a spec and a test. The artifacts you create are the on-ramp to fully agentic work.

## Session shapes

**[Image: slide "Session shapes". Left, one long bar for a multi-hour session. Right, a row of short sessions of different lengths, each ending in a file: plan.md, spec, test.]**

The two models look different when you draw the sessions.

On the left, one long-running session. It might run for hours, hold an enormous amount of content, drift away from what you set out to do, and leave nothing durable behind.

On the right, the same work divided into many small sessions. They have different lengths, different models and different artifacts. You might spend fifteen minutes with a very capable model like Opus producing a plan, and the artifact is a plan.md. From there you move to a faster model like Sonnet for a shorter conversation that produces a spec. Then Sonnet again to produce a test. The sessions get faster and smaller, and every single one ends in an artifact that is passed into the next session as context.

## What artifacts look like in practice

**[Image: slide "Artifacts in practice". A grid of artifact types: markdown spec or PRD, code change, generated tests, Jira issue, Confluence page.]**

Artifacts come in many shapes. These are the ones we see engineering teams using most.

- **Plans.** Markdown specs are popular, as are product requirement documents.
- **Code changes.** The change itself is an artifact. You can watch it land whether you work in a CLI tool or an IDE.
- **Generated tests.** Unit and integration suites that live in the project as code.
- **Jira issues.** If you have skills or agents that help write user stories, the stories are the artifact, in Jira or whatever tracker you use.
- **Documentation.** Runbooks and architecture notes in Confluence or its equivalent, where both people and agents can read them later.

## Where to start

Pick the work you are doing in a chat today and end the session with a file. A plan, a spec, a test, a ticket. Start the next session from that file instead of the scrollback. That is the whole habit, and everything more ambitious builds on it.

If you are on this journey and working out how to structure your agentic processes, we would be glad to talk. Reach out to us at Lab49.
