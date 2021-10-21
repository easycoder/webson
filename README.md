## Synopsis
Webson is a JSON markup syntax for representing DOM elements, enabling entire web pages to be described without any HTML, and a JavaScript runtime engine to build pages in the browser. It has a number of key features such as variables and repeat blocks, that avoid the repetition found in large HTML scripts.

## Introduction
A web page is the visual representation of a Document Object Model, or DOM, the data structure understood by all browsers. In the past the DOM was constructed by the browser from HTML on the page and CSS supplied from the server, but more recently it has become increasingly common for JavaScript to create the DOM itself, with no HTML ever being seen. While this suits programmers well it requires a particular skill set that is not always held by those building pages the traditional way.

Web pages have become very complex, with hundreds or thousands of elements all carefully positioned to create the desired result. There's no way to hide this complexity, whether it's done with HTML/CSS, JavaScript or some kind of no-code visual builder. In the end it's a human brain that's doing the real work of translating the customer's requirements into something the browser can use to create the DOM.

HTML is a form of "markup", the ultimate expression of which came in the form of XML, able to represent not only visual structures but a wide range of other data too. Unfortunately, XML is wordy and hard to read and is not greatly loved. In 2001, Douglas Crockford invented (he would say "discovered") a simpler syntax for representing data structures, as a means of transferring data in and out of JavaScript programs in the form of plain text. The syntax is JavaScript Object Notation, or JSON, and in the past 2 decades it has widely supplanted XML. Virtually every programming language has the ability to read and write JSON and it's now the most common way to transfer data across the Web.

Since HTML shares many of the disadvantages of XML, the question might be asked, _Can JSON also replace HTML?_. If the answer is "yes", a couple of supplementary questions might be

_Can we have user-defined variables and reusable blocks?_
_How about conditional structures?_

which would greatly reduce the amount of markup needed to describe a complex web page, where items are commonly repeated with only minor differences.

This article introduces _Webson_, a proposed markup syntax that allows JSON to be used to describe a DOM, and provides a JavaScript rendering engine that can be embedded in any web page to process scripts at runtime. The system is immediately usable by HTML/CSS coders and no JavaScript experience is required. It's aimed at simplifying the design and implementation of highly complex layouts, where precise positioning of large numbers of elements is hard to achieve manually, and it achieves this with markup rather than with code.

> _I should perhaps note that this project started as a post-retirement coding exercise to keep the brain cells ticking over, without any specific aim in mind. Whether it has any real value I cannot say, but some may find it a useful building block._

## Getting started
Let's start with a simple example; a layout commonly found in online magazines and social media. At the top there's a full-width header; under this a central panel with 2 sidebars and at the bottom a footer. As this is only an example I've given each of the component `div`s its own background color so it stands out clearly. It looks like this:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lpj2kpnatrqxeavwk0tn.png)

Here's the HTML that will create this screen. It uses inline styles to avoid the need to present a separate CSS file:
```html
    <div style="width:50%;height:50%;display:flex;flex-direction:column">
        <div id="top" style="height:20%;background:cyan">
        </div>
        <div style="width:100%;flex:1;display:flex;flex-direction:row">
            <div id="left" style="display:inline-block;width:25%;height:100%;background:green">
            </div>
            <div id="center" style="display:inline-block;height:100%;background:yellow;flex:1">
            </div>
            <div id="right" style="display:inline-block;width:15%;height:100%;background:blue">
            </div>
        </div>
        <div id="bottom" style="height:10%;background:magenta">
        </div>
    </div>
```
This is a total of 655 characters. The corresponding Webson script to create the same screen is 1172 characters, nearly twice as many, and occupies 61 lines rather than 14, but before you dismiss Webson as being too wordy I must say this is a very basic example that doesn't make use of any of the more advanced features of the system. More complex scripts can be smaller than their HTML equivalents, as we'll see later.

The reason for the extra size is partly that every item is named and partly because JSON itself is fairly bulky (lots of double-quotes), while the increase in lines is mainly because it's a lot more spaced out. This is in the interests of readability; high information density makes code hard to read at a glance as the eye has to pick out specific details from a dense surrounding mass. With Webson, the CSS properties are separated out, one per line, rather than all being crammed onto a single line. This could of course be done with HTML too, but because there's no agreed way to present it the result is usually an unstructured mess, so most coders just put everything on the same line.

Here's the script. I'll get on to some of the advanced features shortly.
```json
{
    "width": "50%",
    "height": "50%",
    "display": "flex",
    "flex-direction": "column",
    "#": [
        {"#item": "$Top"},
        {"#item": "$Middle"},
        {"#item": "$Bottom"}
    ],
    
    "$Top": {
        "#element": "div",
        "height": "20%",
        "background": "cyan"
    },
    
    "$Middle": {
        "#element": "div",
        "width": "100%",
        "flex": 1,
        "display": "flex",
        "flex-direction": "row",
        "#": [
            {"#item": "$Left"},
            {"#item": "$Center"},
            {"#item": "$Right"}
        ]
    },
    
    "$Bottom": {
        "#element": "div",
        "height": "10%",
        "background": "magenta"
    },
    
    "$Left": {
        "#element": "div",
        "display": "inline-block",
        "width": "25%",
        "height": "100%",
        "background": "green"
    },
    
    "$Center": {
        "#element": "div",
        "display": "inline-block",
        "flex": 1,
        "height": "100%",
        "background": "yellow"
    },
    
    "$Right": {
        "#element": "div",
        "display": "inline-block",
        "width": "15%",
        "height": "100%",
        "background": "blue"
    }
}
```
Running through the script, you will see that every DOM element has its own named block of JSON data. User-defined names all start with `$`. There are also directives and other system items; the names of these start with `#`. Everything else in the script above is a CSS style to be applied to the current element.

In the above, most of the blocks include a `#element` directive, which names the DOM element type. If this is missing, everything in the block applies to the current element (the one defined in the block that calls this one). Here the only block that lacks an `#element` is the very first one, so the styles all apply to the parent container that was created outside Webson and passed to its renderer as a parameter.

The symbol `#` by itself signals that child elements are to be added. This directive takes either a single object or an array of objects, each of which is an `#item` that names another block.

The structure we've built here isn't much use unless we can add further items to the various `div`s. Some of this can be done with further Webson code but ultimately it will be a JavaScript function that populates elements of the DOM. For this to happen, elements must have unique ids to allow JavaScript to find them. Here's the `$Left` block again, with an id and a couple of other additions:
```json
    "$Left": {
        "#debug": 2,
        "#doc": "The left-hand sidebar",
        "#element": "div",
        "@id": "left",
        "display": "inline-block",
        "width": "25%",
        "height": "100%",
        "background": "green"
    },
```
Here we have another new symbol, `@`, which (appropriately) signifies an _attribute_. Various HTML elements require special attributes such as `@type`, `@href`, `@src`, etc.

Another feature above reveals a built-in debugging capability. When hand-building HTML, errors are common, often resulting in strange layout that are not at all as intended. Webson allows you to specify 3 different debug levels:

`"#debug": 0` - no debugging output    
`"#debug": 1` - Show all `#doc` properties    
`"#debug": 2` - Show every item    

which enables you to see clearly what is happening. The output for the above is
```
Build $Left
The left column
#element: div
Style display: "inline-block" -> inline-block
Style width: "25%" -> 25%
Style height: "100%" -> 100%
Style background: "green" -> green
```
where `webson.js` is the Webson rendering engine; a JavaScript file of about 13 kbytes in size.

`#doc` items can be either single lines of text or arrays of lines. They are just there for the benefit of the programmer and have no effect on the screen being constructed.

A `#debug` directive affects its own block and those below it (defined using `@`). It has no effect on its calling block or those above it.

## Nested bocks
Webson implements nesting, whereby items declared at one level apply to all those in lower (contained) levels. Changing a value at one level only affects those at that level and beneath it; those above are unaffected.

For example, let's suppose the two sidebars share a common feature; they each have an inner `div` and padding to produce a border. Here's what it should look like:
![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/40rop60gtl0ool33fme4.png)
To achieve this we can rewrite the last part of the script as follows:
```json
    "$Left": {
        "#doc": "The left column",
        "$ID": "left",
        "$Width": "25%",
        "$Color": "green",
        "#": {"#item": "$LRPanel"}
    },
    
    "$Right": {
        "#doc": "The right column",
        "$ID": "right",
        "$Width": "15%",
        "$Color": "blue",
        "#": {"#item": "$LRPanel"}
    },
    
    "$LRPanel": {
        "#element": "div",
        "display": "inline-block",
        "width": "calc($Width - 2em)",
        "height": "calc(100% - 2em)",
        "padding": "1em",
        "#": {"#item": "$LRSubPanel"}
    },
    
    "$LRSubPanel": {
        "#element": "div",
        "@id": "$ID",
        "width": "100%",
        "height": "100%",
        "background": "Ccolor"
    }
```
Here I've left out the block for `$Center` as it's unchanged. Both `$Left` and `$Right` now no longer declare their own `#element`; instead they set up user-defined variables `$ID`, `$Width` and `$Color` and invoke `$LRPanel` to construct the element. I suggest using an initial capital letter for each name, to make them easier to spot, but it's not mandatory. Any variable declared or modified at a given level in the structure will be visible at all points beneath that one, but changes do not propagate upwards.

`$LRPanel` creates a `div`, applies padding to it and creates an inner `div` called `$LRSubPanel`. Note how the `$color` variable is passed down and used here, resulting in a colored panel with a white border. Note also the use of `calc()` in `$LRPanel` to allow for the padding, which in a conformant browser adds to the height of the element. This also neatly introduces another powerful feature of Webson; the ability to put user variables into expressions.

## The HTML
To view this demo on a PC, use the following HTML file:
```html
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webson demo</title>
    <script type='text/javascript' src='https://webson.netlify.app/webson.js'></script>
  </head>

  <body>
    <script>
        const element = document.createElement(`div`);
        element.style.width = `640px`;
        element.style.height = `480px`;
        render(`resources/json/simple.json`);
        
        async function render(file) {
            const response = await fetch(file);
            const script = await response.text();
            Webson.render(element, `simple`, script);
            document.body.appendChild(element);
        }
    </script>
  </body>
</html>
```
For mobile, the width and height can both be set to `100%`. The JSON script is assumed to be in a folder on your server at `(your domain)/resources/json/simple.json`. The code above uses the relatively-new standard function `fetch()` to get the named script from a file on the server. It then calls `render()` in the Webson package to create the DOM tree that corresponds to the JSON script.

## From here on in
This has been a brief introduction to Webson, as to cover every feature in detail would result in a very lengthy article. A more in-depth treatment, with examples, can be found [here](https://webson.netlify.app). The source code is freely available for use from [the Webson repository](https://github.com/easycoder/webson) and comments are welcome on how to improve it. To finish up, here's a screenshot of one of the more complex layouts described in those pages:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8mgg7zmh0maie1jg64aw.png)
