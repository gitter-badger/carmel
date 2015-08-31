# carmel

[![Join the chat at https://gitter.im/dancali/carmel](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dancali/carmel?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The easiest way to build a website.

## Installation

```
npm install carmel -g
```

## Getting Started

```
carmel init && carmel build && carmel preview
```

## Usage

#### Creating a brand new website

```
carmel init [theme]
```

This gets you up and running quickly by creating a brand new website for you from a predefined theme. If you don't specify a theme, the default ```carmel/corporate/default``` theme will be used.

At this point, you will see a ```carmel.yaml``` file in your current working directory and an ```images``` directory. This is all you need to manage your website.


#### Building your website

```
carmel build
```

This command builds your website from scratch and applies new changes. All generated content is stored in a hidden directory named ```.carmel``` in your current working directory.


#### Previewing your website

```
carmel preview
```

Run this command once you have built your website and then open your web browser to the local address specified in the console log.
