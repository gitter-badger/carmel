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

## The carmel.yaml Configuration File

The configuration file has six main categories: text, style, assets, settings, pages and menu.

```
text
```

All the copy your site requires will be defined in the text category. For example, if you use the *hero* component, to specify the title, you have to give the ```hero-title``` a value. You do that by adding it to the ```text``` category. There are three ways to change text: at the global level, at the page level and at the component level.

```
style
```

Components expose certain variables that can be changed such as the *navbar* component exposing the ```navbar-background-color``` variable. You can adjust your sites style by tweaking the variables in the style category. Just like text, there are three ways to change style: at the global level, at the page level and at the component level.

```
assets
```

In order to use assets, you have to specify them in the assets category. Each asset has a container, such as the *images* container.

```
settings
```

You can specify any settings your site needs access to such as google analytics id or facebook page name.

```
pages
```

This category contains a list of pages that will be generated at build time. Each page has a name, a layout and a list of components.

```
menu
```

The menu consists of the links visible on all pages in the navigation bar.
