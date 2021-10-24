# A more complex example

The example given previously is a simple one. As noted at the start, it offers few advantages over hand-coding in HTML as it doubles the size of the markup and requires another 13k or so of JavaScript to do its job. So here we'll look at a more complex example; one that is highly tedious to code in HTML. Here's a screenshot:

![Example](/resources/img/keyboard.png)

The script for this layout can be downloaded from the repository so I'll just present it block by block. At the top is
```json
{
    "#doc": "The parent container supplied from outside Webson",
    "#": "$Container",
    
```
which allows us to set styles on the parent container, but here does nothing except invoke `$Container`:
```json
    "$Container": {
        "#doc": "The inner container",
        "#element": "div",
        "$NKeys": 10,
        "$NRows": 4,
        "$A": "<$NKeys*2>",
        "$B": "<$A/20>",
        "$C": "<$NKeys+$B*2>",
        "$ButtonSize": "<#parent_width/$C>",
        "$ButtonRadius": "<$ButtonSize/5>",
        "$Gap": "<$ButtonSize/20>",
        "$Height": "<$ButtonSize+$Gap*2>",
        "padding": "<#parent_width/50>px",
        "background": "#444",
        "#": "$Rows"
    },
```
Here we create a coontainer `<div>` and assign some user values. In most cases here we're doing arithmetic to establish the sizes of objects in the design.

The line `"$NKeys": 10` simply assigns a value to the variable `$NKeys`, which will be available in this block and in all child blocks of this one.

The line `"$A": "<$NKeys*2>"` performs arithmetic, multiplying the value of `$NKeys` by 2 and putting the result into `$A`. The angle braces perform a vital function here. If they are omitted, the expression is taken to be a literal (a string of characters. With the braces it becomes a numeric expression, to be evaluated immeditately. The JavaScript function `eval()` is used to evaluate the expression, so you can use anything that's legal for that function. Angle braces can be nested to control the precedence of arithmetic operations.

The line `"padding": "<#parent_width/50>px"`  evaluates the expression then tacks `px` on the end. Sometimes it's necessary to use braces when no arithmetic operation can be performed, to prevent a suffix like `px` being taken as part of a variable name. The `eval()` function will probably throw an error, but Webson catches it and simply expands any variables present, replacing their names with their values.

The main reason for including this component is to implement padding without running into issues with the browser's box model.

Next in the script comes a holder for a set of rows, called for in the `$Container` block above:
```json
    "$Rows": {
        "#doc": "The row holder",
        "#element": "div",
        "@id": "rowHolder",
        "width": "100%",
        "height": "<$ButtonSize*$NRows+$Gap*$NRows*2+$Gap>px",
        "text-align": "center",
        "#": ["$Row0", "$Row1", "$Row2", "$Row3"]
    },
```
This creates another `<div>`, computing its width and height using variables created in the `$Container` block. Then it calls for 4 rows of keys to be created.

Now we come to the rows of keys on our keyboard. Here's the top row:
```json
    "$Row0": {
        "#doc": "Row 0 of the virtual keyboard",
        "#element": "div",
        "@id": "row0",
        "width": "100%",
        "height": "<$Height>px",
        "$Row": 0,
        "$RowLabels": [
            "q", "w", "e", "r", "t", "y", "u", "i", "o", "p"
        ],
        "#": "$Buttons"
    },
```
By now this should be pretty self-explanatory. It defines the dimensions of the row and the labels for the key faces, as a simple array. Then it requests `$Buttons` to create the actual keys.

The other rows are very similar apart from the key legends. Some also have auxiliary keys, so the third row looks like this:
```json
    "$Row2": {
        "#doc": "Row 2 of the virtual keyboard",
        "#element": "div",
        "@id": "row2",
        "width": "100%",
        "height": "<$Height>px",
        "$Row": 2,
        "$RowLabels": [
            "z", "x", "c", "v", "b", "n", "m"
        ],
        "#": ["$Shift", "$Buttons", "$Backspace"]
    },
```
In all these cases, the row of keys is created in `$Buttons`, as follows:
```json
    "$Buttons": {
        "#repeat": {
            "#doc": "This repeats a row of keys",
            "#target": "$StandardButton",
            "#steps": {
                "#arraysize": "$RowLabels"
            }
        }
```
Here we have a new feature; `#repeat`. This doesn't create an element but identifies a target block, in this case `$StandardButton`, and specifies the number of steps that should be iterated, here the size of the `$RowLabels` array. So let's now look at `$StandardButton`:
```json
    "$StandardButton": {
        "#doc": "This is a standard key",
        "$ID": "r$Row-$Content",
        "$Width": "$ButtonSize",
        "$FontSize": "$ButtonSize*0.5",
        "$Content": {
            "#select": "$RowLabels",
            "#index": "#step"
        },
        "#": "$Button"
    },
 ```
This block does not implment an element either; it just sets things up for `$Button` to do the job. First it creates an `$ID` variable whose value concatenates the row number and the button face text, then `$Width` and `$FontSize` variables, all of which are used by the blocks that follow.

The `$Content` variable is special; it gets its value using a `#select`, which picks a single element from an array, in this case the `$RowLabels` variable created a couple of levels back. The value of `#step` is that of the current `#repeat` (so `#repeat`s cannot be nested).

Now we've reached the point where we can create a button. It's a 3-stage process, with an outer container, an inner container and a button face:
```json
    "$Button": {
        "#doc": "This is the outer container for a button",
        "#element": "div",
        "position": "relative",
        "display": "inline-block",
        "width": "<$Width>px",
        "height": "<$ButtonSize>px",
        "margin": "<$Gap>px",
        "border-radius": "$ButtonRadius",
        "#": "$ButtonInner"
    },
    
    "$ButtonInner": {
        "#doc": "This is the button inner container",
        "#element": "div",
        "position": "relative",
        "width": "<$Width-$ButtonSize/10>",
        "height": "90%",
        "top": "10%",
        "border-radius": "<$ButtonRadius>px",
        "background": "#888",
        "#": "$ButtonFace"
    },
    
    "$ButtonFace": {
        "#doc": "This is the actual button face",
        "#element": "a",
        "@id": "id-$ID",
        "display": "block",
        "position": "absolute",
        "width": "100%",
        "top": "<$ButtonSize*0.7-$FontSize>px",
        "color": "white",
        "font-family": "Arial, Helvetica, sans-serif",
        "font-size": "<$FontSize>px",
        "font-weight": "bold",
        "text-decoration": "none",
        "@href": "https://test.com?key=$Content",
        "#content": "$Content"
    }
```
This is where all the styles get applied. I've kept them all inline here to avoid the need to call out to a separate file, but you can of course use CSS classes if you prefer, by having a `@class` attribute. My view is that excessive use of classes is bad as it impairs readability. They're fine for global things like color schemes, margins and element sizes, but they should be avoided for single-use cases, where they are closely associated with specific elements. In Webson, inline styles tend to make the markup more compact but they presumably add an overhead to the size of the DOM. It's unlikely to cause memory issues but in a really complex design such things may matter.

The complete keyboard script can be found in the [repository]{https://github.com/easycoder/webson} or directly from [Netlify](https://webson.netlify.app/resources/json/virtual.json).