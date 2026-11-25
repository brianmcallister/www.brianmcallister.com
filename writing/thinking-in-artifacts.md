---
title: Thinking in Artifacts
date: 2026-11-22
description: Why ending each AI session with a file beats living in the chat, and how that habit leads to handing real work to agents.
draft: true
---

Most people start using AI the same way: chat. It's so easy to get going started, and you see results immediately. It absolutely feels like magic. After a while, it starts to build an understanding of what you're trying to accomplish, almost like it knows you. This feeling is a bit addictive. It's very fun, and I certainly have found myself going late into the night thinking "just one more prompt...".

However, after a few hours, you start to notice that your agent is making mistakes. You're having to backtrack more often; steer it more often. The quality starts to dip, and seems to stay there.

[Thinking In Artifacts](https://www.youtube.com/watch?v=EorCEnMMxWY)

This post is about a technique that fixes that. It's also about the first step toward getting agents to do work without you in the room.

## Who this is for

If you have used Copilot or ChatGPT mostly for one-off questions and quick answers, this is for you. It applies just as much if you already live in Claude Code, Copilot CLI or Codex. It doesn't matter too much where the chat window is on your screen, although if you've primarily been working in a web chat box, you'll quickly want to move to a CLI tool to make this technique easier.

## Why living in the chat breaks down

**[Image: slide "Living in the chat". A long chat transcript with the context window gauge at the bottom nearly full.]**

This is the view everyone will recognize. A single long conversation where everything you discuss lives in the chat. There's three things going on here that are less than ideal.

First, the context window fills. The context window is everything in an agent conversation, it's all the context that the agent passes to the underlying model. Claude does not have a memory at all, the chat application needs to pass the entire conversation to the model on every message back and forth. The more messages you send, the bigger the context grows, and we describe this context as the context window. Most chat applications show you how much context has been filled, expressed as a percentage.

What you may have noticed is that the quality of the answers tends to get worse the more the context window is filled. If we can keep the amount of context in a session as small as possible, the model will give you higher quality results.

Second, managing long chats, especially multiple, is just plain difficult. The list of conversations grows, and it's very easy to forget what any one session was about. You can search for your older conversations, but this problem only gets worse over time. 

Lastly, the conversation itself is fragile. If everything you've worked on with your agent lives in the conversation history, it's very easy to lose. Company policies change, subscriptions expire, and the chat applications themselves may change over time. This is getting better over time as tools become more mature and resilient, but it wasn't too long ago that chats would simply end and show you an error at any point.

## Two mental models

**[Image: slide "Chat-centric vs artifact-centric". Two columns side by side, the left a single long conversation, the right a chat producing files that fan out to people and agents.]**

On the left is the chat-centric model I just described. You interact with a chat, you have a long-running conversation, and everything you talked about lives in that history.

On the right is the artifact-centric model. You still work through a chat with your preferred model, but you direct the agent to write the outcomes of the conversation to artifacts: files, usually, on disk.

Artifacts matter because they are durable. Durable things are shareable with the people you work with and with other agents. And if you build them with a little care, they become agent consumable, which is what unlocks more complicated agentic processes down the line.

## Let the artifact be the memory

**[Image: slide "Where context lives". Context flowing from a chat session into files, with the chat-only path shown fading out.]**

When you think in artifacts, context finds its way into files. The opposite is the chat-centric workflow, where context only lives in the long lived conversation.

So the pattern is this: interact with your agent, and direct it to create artifacts that become the context for future sessions. Future sessions might be more chats you have yourself. As you get more comfortable with these tools and processes, sessions won't be chats but will be unattended agentic processes.

Either way, you do not want to be the memory of the task or the workflow you are trying to complete. Artifacts can be that memory.

## The loop

**[Image: slide "The artifact loop". A cycle of four steps: create artifacts, iterate in chat, update the artifacts, start a new chat with the artifacts as context.]**

There is a simple loop to this.

Direct your agent to create artifacts, so the output of a session lands in durable files. An extremely popular method most software engineers use today is to iterate in chat to build up context, and have the agent update the artifacts as you go. In software engineering work flows, these artifacts get committed into a version control system, like GitHub.

The easiest way to get started is to simply ask: "Plan my ask, and write the results to plan.md".

When you are ready, start a new chat and hand it the artifacts as its context. The artifacts carry the specific, needed context forward into every future session, and no single conversation has to hold all of it. 

A conversation that you see on screen is not just your questions and the model responses. There are many, many lines of content the chat applications don't show you, and those invisible lines use precious context. Some of these items are 1) thinking blocks: the text the models generate to coordinate their progress 2) tool calls: how models do things outside of their text generation capabilities, like search the web 3) MCP tools: connectors to outside tools like Jira or Figma, and more. All of these will increase the amount of content in the context, which will degrade the quality of model responses.

## The ladder to delegated work

**[Image: slide "The ladder". Four rungs from bottom to top: one-on-one chat, context copied out of chat, chat creating artifacts, agents looping on artifacts.]**

You can think of the journey as a ladder.

At the bottom is where everyone starts: a one-on-one chat session with an agent. One rung up is taking context out of the chat by hand, copying code or answers the agent gave you somewhere else. This post is about the next rung: chat that creates artifacts. Above that, agents loop on top of your artifacts, which gets much closer to fully delegating work to agentic processes.

In order to achieve fully agentic processes, it's useful to realize that you cannot hand an agent a long-running, ephemeral, personal chat history. However, you can hand an agent a spec file and a test plan. The artifacts you create are the on-ramp to fully agentic work.

## Session shapes

**[Image: slide "Session shapes". Left, one long bar for a multi-hour session. Right, a row of short sessions of different lengths, each ending in a file: plan.md, spec, test.]**

The two models look different when you draw the sessions.

On the left, one long-running session. It might run for hours, hold an enormous amount of content, drift away from what you set out to do, and leave nothing durable behind.

On the right, the same work divided into many small sessions. They have different lengths, different models and different artifacts. You might spend fifteen minutes with a very capable model like Opus producing a plan, and the artifact is a plan.md. From there you move to a faster model like Sonnet for a shorter conversation that produces a spec. Then Sonnet again, in a new session, to produce a test. The sessions get faster and smaller, and every single one ends in an artifact that is passed into the next session as context.

## What artifacts look like in practice

**[Image: slide "Artifacts in practice". A grid of artifact types: markdown spec or PRD, code change, generated tests, Jira issue, Confluence page.]**

Artifacts come in many shapes. These are the ones we see engineering teams using most.

- **Plans.** Markdown specs are popular, as are product requirement documents.
- **Code changes.** The change itself is an artifact. You can watch it land whether you work in a CLI tool or an IDE.
- **Generated tests.** Unit and integration suites that live in the project as code.
- **Jira issues.** If you have skills or agents that help write user stories, the stories are the artifact, in Jira or whatever tracker you use.
- **Documentation.** Runbooks and architecture notes in Confluence or its equivalent, where both people and agents can read them later.

## Where to start

Pick the work you are doing in a chat today and end the session with a file. A plan, a spec, a test, a ticket. Start the next session from that file instead of the scrollback. That is the habit, and everything more ambitious builds on it.
