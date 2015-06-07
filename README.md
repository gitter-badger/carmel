# carmel

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
carmel init [template]
```

This gets you up and running quickly by creating a brand new website for you from a predefined template. If you don't specify a template, the default ```carmel/landing/default``` template will be used.

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

## Release History

* 0.1.5 Initial release
