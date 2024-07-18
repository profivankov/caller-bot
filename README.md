# Caller bot

A telegram bot that stores and displays token data from when they were called with the intent to see how much the price has increased since the call was made.

Also a practice exercise fore Node.JS + Typescript + MongoDB

## Features

- Saves token data from any of the chains available on the dexscreener API (mainly SOL and ETH). Data saved: contractID, symbol, chain, initialPrice, currentPrice, callerName
- Updates the price every X minutes
- Displays the data through telegram commands

## Todos

- Implement using typescript
- Implement database validation
