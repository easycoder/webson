# Advanced Webson scripting

The virtual keyboard described [in the previous page](keyboard.md) is static, in that it doesn't change its appearance when a key is clicked. This is of course quite usual for HTML structures; it takes JavaScript code to do more than just call a new page when an item is clicked.

However, we do have some JavaScript here; it's the engine that renders our page. And with some small additions to the Webson syntax we can do some interesting things. In this case I want the keyboard to respond to the Shift key by chaning all the key labels to uppercase or back. I also want the ?123 key to force its own set of legends when clicked.

To do this requires a couple of new Webson constructs. I'll explain them by showing the things that are different to the previous version. Let's start with 