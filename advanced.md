# Advanced Webson scripting

The virtual keyboard described [in the previous page](keyboard.md) is static, in that it doesn't change its appearance when a key is clicked. This is of course quite usual for HTML structures; it takes JavaScript code to do more than just call a new page when an item is clicked.

However, we do have some JavaScript here; it's the engine that renders our page. And with some small additions to the Webson syntax we can do some interesting things. In this case I want the keyboard to respond to the `Shift` key by changing all the key labels to uppercase or back. I also want the `?123` key to force its own set of legends when clicked. And I'd like the 2 keys in question to change their background colors to indicate which states they're in. The result can be seen [here](https://webson.netlify.app/) and you can take it for a test drive.

To do all this requires no conventional coding; just a couple of new Webson constructs. I'll explain them by showing the things that are different to the previous version. Let's start right at the top:
```json
{
    "#doc": "The parent container supplied from outside Webson",
    "#": "$Container",
    
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
        "$ButtonBackground": "#888",
        "#": "$Rows"
    },
```
The change is minor; all I've added is `"$ButtonBackground": "#888"` to provide a default button background that can be overridden when necessary.

Each of the rows of the keyboard now has 4 sets of labels. To choose which one to display requires an internal state variable, so the system sets one up at the start and gives it the value `default`. In this state, the regular lower-case keyboard is displayed. To handle the 4 different possible states needs some new syntax, and the code for the first display row now looks like this:
```json
    "$Row0": {
        "#debug": 2,
        "#doc": "Row 0 of the virtual keyboard",
        "#element": "div",
        "@id": "row0",
        "width": "100%",
        "height": "<$Height>px",
        "$Row": 0,
        "#switch": {
            "default": "$Default",
            "shifted": "$Shifted",
            "symbols": "$Symbols",
            "shifted symbols": "$Shifted_symbols"
        },

        "$Default": {
            "$RowLabels": [
                "q", "w", "e", "r", "t", "y", "u", "i", "o", "p"
            ],
            "#": "$Buttons"
        },
        
        "$Shifted": {
            "$RowLabels": [
                "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"
            ],
            "#": "$Buttons"
        },
        
        "$Symbols": {
            "$RowLabels": [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
            ],
            "#": "$Buttons"
        },
        
        "$Shifted_symbols": {
            "$RowLabels": [
                "~", "`", "|", "™", "¿", "«", "»", "¼", "½", "¾"
            ],
            "#": "$Buttons"
        }
    },
```
This is somewhat larger than the previous version but there's not much that's actually new. The main thing is the `#switch` directive replacing the original `#` item. It comprises a set of properties, one for each of the values that will be expected for the state variable. The values of each of these properties is the name of a user-defined variable. These are defined inside the `$Row0` structure in order to keep them private and allow their names to be reused by other rows. Each of the switch cases defines a set of row labels as before and calls `$Buttons` to display them.

The other rows are very similar; you can see the source code in the [repository](github.com/easycoder/webson) as `resources/json/virtual2.json`.

The third and fourth rows contain the Shift and Symbol buttons, so here's the new code for the `Shift` button:
```json
        "$Shift": {
            "#doc": "This is the Shift key",
            "$ID": "Shift",
            "$Width": "<$ButtonSize*1.6>",
            "$Content": "Shift",
            "$Href": "#",
            "$FontSize": "<$ButtonSize*0.4>",
            "#switch": {
                "default": "$Default",
                "shifted": "$Shifted",
                "symbols": "$Symbols",
                "shifted symbols": "$Shifted_Symbols"
            },
            "#onClick": {
                "default": "shifted",
                "shifted": "default",
                "symbols": "shifted symbols",
                "shifted symbols": "symbols"
            },
            
            "$Default": {
                "#": "$Button"
            },
            
            "$Shifted": {
                "$ButtonBackground": "#c88",
                "#": "$Button"
            },
            
            "$Symbols": {
                "#": "$Button"
            },
            
            "$Shifted_Symbols": {
                "$ButtonBackground": "#c88",
                "#": "$Button"
            }
        },
```
The magic is done by the `#onClick` directive. When the key is clicked, Webson examines the current status to see what the new status should be. It sets the internal status variable to that value then reloads the entire structure. The 2 shifted states each have their own background colors to override the previous values.

Much the same is done for the `?123` key in the third row; see the full listing in the repository.

This is the end of the Webson documentation for the time being. It's likely that further feature may be added to Webson, but we'll be sure to document them fully if that happens.

Feedback is welcome, as are suggestions for improvements. I hope some will find Webson useful.

Graham Trott¸ October 2021