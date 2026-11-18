---
title: "What are AI Agents?"
date: 2025-03-22T00:00:00Z
lastmod: 2026-11-18T00:00:00Z
tags: ["agents", "automation", "llm"]
categories: ["AI"]
description: "What AI agents are: programs that can search, analyze, and make decisions on their own"
draft: false
---

In simple terms, a Computer Agent (AI Agent) is something that can act like a kind of program that can perform some autonomous actions like searching, analyzing and taking decisions, and provide you the end results.

Don't think too complex. Let's think about the below scenario:

## Real-World Example: Booking a Cab

You wanted to book a cab. There are multiple platforms to book a cab (Ola, Uber, Rapido). How do you find the lowest cost and book the cab?

Currently, we need to open all the apps and provide the source and destination and check the price:

1. **Step 1:** Open Ola, provide the source and destination and check the price. (Remember the price)
2. **Step 2:** Open Uber, provide the source and destination and check the price. (Remember the price)  
3. **Step 3:** Open Rapido, provide the source and destination and check the price. (Remember the price)

### Three hassles with the above method:
1. Time consuming
2. Keep the price in mind
3. There are few repetitive operations

Now, an **Agent can perform the above operation on your behalf**. Just instruct the Agent to do the cab price analysis and book the cab. It can analyze the price and book the cab without human intervention.

You may think that this can be done even with a piece of code. Absolutely correct! But the problem here is: Let's assume you wrote a piece of code that can analyze and book the cab. After a few weeks you wanted to book a cab for later. Now you have to modify your code to introduce the new feature. With an AI Agent, it can do this for you without making any code changes.

Hope you got some idea about what an Agent is.

## How do Agents Work?

There are a few terminologies you need to understand about how AI Agents work:

1. **LLM**: Large Language Model
2. **Data set** (Training data, Testing data, Data sampling)
3. **Vector DB**: Vector database
4. **Training LLM**
5. **Agent Knowledge base**
6. **Agent Instruction**
7. **Agent Tools**

### LLM (Large Language Model)

LLM (Large Language Model) is a component which is trained using a set of algorithms and a huge amount of data. Let's assume our brain. A human brain is trained based on experience (data) and stored. The brain can think and collect the data from memory.

Similarly, LLMs are trained on vast amounts of text data and can understand, generate, and reason with language to help agents make intelligent decisions.

### Data Set

A data set is the collection of data used to teach the LLM. Let's assume a student preparing for an exam.

- **Training data**: The textbook the student studies from. The LLM learns patterns from this data.
- **Testing data**: The exam paper. It has questions the student has not seen before, so we can check if the student really learned or just memorised.
- **Data sampling**: Picking a smaller, balanced set from a huge pile of data. You can't read every book in the library, so you pick the right ones.

If the data is wrong, the learning is wrong. Garbage in, garbage out.

### Vector DB

A normal database finds data by exact match. If you search for "cab", it finds rows with the word "cab".

A vector database stores the meaning of the data as numbers (called vectors). So when you search for "cab", it can also find "taxi", "auto" and "ride", because their meanings are close.

Let's assume a library. A normal database is like searching by the exact book title. A vector database is like asking the librarian, "I want a book about space travel", and the librarian brings all the related books, even if the title doesn't say "space travel".

Agents use a vector DB to quickly find the right information before they answer.

### Training LLM

Training is the process of teaching the LLM using the data set. The LLM reads the training data again and again, makes a guess, checks how wrong it was, and adjusts itself a little every time. I wrote more about how this learning works in [What Are Neural Networks](/posts/neural_network/).

Training a big LLM needs huge computers and months of time. So most of us don't train our own LLM. We use a trained one (like Claude, GPT or Gemini) and build the agent on top of it.

### Agent Knowledge Base

The LLM knows a lot of general things, but it doesn't know your things. It doesn't know your company policy, your favourite cab app or your office address.

The knowledge base is where we keep this information for the agent. Usually it is stored in a vector DB, so the agent can find the right piece when it needs it.

Let's assume a new employee. They are smart (LLM), but on day one they don't know how your office works. You give them a handbook. That handbook is the knowledge base.

### Agent Instruction

Instructions tell the agent what its job is and how to do it. For our cab example:

> You are a cab booking assistant. Compare the prices on Ola, Uber and Rapido. Always pick the lowest price. If the price is above ₹500, ask me before booking.

Same LLM, different instructions, a completely different agent. One can be a cab booker, another can be a travel planner.

### Agent Tools

An LLM can only think and write text. It can't open an app or book a cab on its own. Tools give it hands.

A tool is a small piece of code the agent can call. For our cab example, the tools would be:

- Get the price from Ola
- Get the price from Uber
- Get the price from Rapido
- Book the cab

The LLM decides which tool to call and when. The tool does the actual work and gives the result back.

## Putting It All Together

Let's go back to the cab example. You say: "Book me the cheapest cab to the airport."

1. **Instruction**: The agent knows its job. It is a cab booking assistant, and it must ask before spending more than ₹500.
2. **Knowledge base**: It finds your home address and the cab type you like.
3. **LLM**: It plans the steps. Check all three prices, compare them, book the cheapest.
4. **Tools**: It calls the price tools for Ola, Uber and Rapido.
5. **Tools again**: It calls the booking tool for the cheapest one.
6. It tells you the result: "Booked Rapido, ₹320, driver arriving in 5 minutes."

All three hassles are gone. No opening apps, no remembering prices, no repeating the same steps.

## Wrapping Up

An agent is not magic. It is an LLM (the brain) with instructions (the job), a knowledge base (the handbook) and tools (the hands). Once you understand these pieces, you can understand any AI agent you see.
