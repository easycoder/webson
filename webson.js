const Webson = {
    
    // Expand all variables in a value.
    // Expressions inside parentheses are fed to eval().
    expand: (element, input, symbols) => {
        let output = input;
        let mod = true;
        let values;
        let changed = false;
        if (typeof input === `object`) {
            const keys = Object.keys(input);
            for (let key of keys) {
                switch (key) {
                    case `#select`:
                        // Process an array selector
                        const value = Webson.expand(element, input[key], symbols);
                        const index = input[`#index`];
                        if (typeof index === `undefined`) {
                            throw Error(`#select '${input[key]} has no #index`);
                        }
                        output = value[Webson.expand(element, index, symbols)];
                        mod = true;
                        changed = true;
                        break;
                    default:
                        break;
                }
            }
        } else {
            while (mod) {
                mod = false;
                re = /(?:\#|\$)[a-zA-Z0-9_.]*/g;
                while ((values = re.exec(output)) !== null) {
                    let item = values[0];
                    switch (item[0]) {
                        case `#`:
                            // Evaluate system values
                            switch (item) {
                                case `#element_width`:
                                    output = output.replace(item, element.offsetWidth);
                                    mod = true;
                                    changed = true;
                                    break;
                                case `#parent_width`:
                                    output = output.replace(
                                        item, element.parentElement.offsetWidth);
                                    mod = true;
                                    changed = true;
                                    break;
                                case `#random`:
                                    output = output.replace(item, Math.floor(Math.random() * 10));
                                    mod = true;
                                    changed = true;
                                    break;
                                case `#step`:
                                    output = output.replace(item, symbols[`#step`]);
                                    mod = true;
                                    changed = true;
                                    break;
                                default:
                                    break;
                            }
                            break;
                        case `$`:
                            let value = item;
                            const val = symbols[item];
                            if (Array.isArray(val)) {
                                output = val;
                            } else {
                                value = Webson.expand(element, val, symbols);
                                output = output.replace(item, value);
                            }
                            mod = true;
                            changed = true;
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        // Remove braces. Try to evaluate their contents.
        // If this doesn't work, assume it's a value that can't be further simplified.
        changed = true;
        while (changed) {
            changed = false;
            try {
                const p = output.lastIndexOf(`<`);
                if (p >= 0) {
                    const q = output.indexOf(`>`, p);
                    if (q < 0) {
                        throw Error(`Mismatched braces in ${input}`);
                    }
                    const substr = output.substring(p + 1, q);
                    let repl = `<${substr}>`;
                    try {
                        const v = eval(substr);
                        output = output.replace(repl, v);
                    } catch (e) {
                        output = output.replace(repl, substr);
                    }
                    changed = true;
                }
            }
            catch (e) {
            }
        }
        return output;
    },
    
    // Get the definitions from a set of items
    getDefinitions: (items, symbols) => {
        const keys = Object.keys(items);
        for (let key of keys) {
            if (key[0] === `$`) {
                symbols[key] = items[key];
            }
        }
    },
    
    // Include another script
    include: (parent, name, path, symbols) => {
        if (symbols[`#debug`] >= 2) {
            console.log(`#include ${name}: ${path}`);
        };
        fetch(path)
            .then(response => response.text())
            .then((script) => {
                element = document.createElement(`div`);
                element.style.width = `640px`;
                element.style.height = `480px`;
                Webson.build(parent, name, JSON.parse(script), symbols);
                parent.appendChild(element);
            });
    },
    
    // Build a DOM structure
    build: (parent, name, items, parentSymbols) => {
        if (typeof parent === `undefined`) {
            throw Error(`build: 'parent' is undefined`);
        }
        if (typeof name === `undefined`) {
            throw Error(`build: element is undefined (is the #element directive missing?`);
        }
        // Deep copy the symbol table
        const symbols = JSON.parse(JSON.stringify(parentSymbols));
        // Expand all definitions
        Webson.getDefinitions(items, symbols);
        // Set the debug level
        if (typeof items[`#debug`] !== `undefined`) {
            symbols[`#debug`] = items[`#debug`];
        }
        if (symbols[`#debug`] >= 2) {
            console.log(`Build ${name}`);
        }
        if (typeof items[`#doc`] !== `undefined`) {
            if (symbols[`#debug`] >= 1) {
                console.log(items[`#doc`]);
            }
        }
        // Set up an element if there is one.
        // If the element is a DOM type, create it and append it to the parent.
        // Otherwise, set the current element to the parent.
        // Then apply styles, content etc. 
        let element = parent;
        const elementType = items[`#element`];
        if (typeof elementType != `undefined`) {
            if (symbols[`#debug`] >= 2) {
                console.log(`#element: ${elementType}`);
            }
            if ([`div`, `span`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `br`, `a`,
                `input`, `select`, `ol`, `ul`, `list`, `listitem`,]
                .includes(elementType)) {
                element = document.createElement(elementType);
                parent.appendChild(element);
            }
        }
        symbols[`#element`] = element;
        // Do the main operations
        Object.keys(items).forEach(function(key) {
            let value = items[key];
            switch (key) {
                case `#`:
                case `#debug`:
                case "#doc":
                case `#element`:
                    break;
                case `#content`:
                    const val = Webson.expand(element, value, symbols);
                    if (symbols[`#debug`] >= 2) {
                        console.log(`#content: ${value} -> ${val}`);
                    }
                    // Update the item in the symbol table
                    symbols[value] = val;
                    switch (element.type) {
                        case `text`:
                        case `textarea`:
                        case `input`:
                            element.value = val;
                            break;
                        default:
                            element.innerHTML = val;
                            break;
                    }
                    break;
                case `#repeat`:
                    symbols[`#steps`] = 0;
                    for (let item in value) {
                        switch (item) {
                            case `#doc`:
                                if (symbols[`#debug`] >= 1) {
                                    console.log(value[item]);
                                }
                                break;
                            case `#target`:
                                symbols[`#target`] = value[item];
                                break;
                            case `#steps`:
                                const stepspec = value[item];
                                for (let stepitem in stepspec) {
                                    switch (stepitem) {
                                        case `#arraysize`:
                                            const name = stepspec[stepitem];
                                            symbols[`#steps`] = symbols[name].length;
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                break;
                        }
                    }
                    if (symbols[`#debug`] >= 2) {
                        console.log(`#repeat: ${symbols[`#target`]}, ${symbols[`#steps`]}`);
                    }
                    for (let step = 0; step < symbols[`#steps`]; step++) {
                        symbols[`#step`] = step;
                        Webson.build(
                            element, `${name}[${step}]`, symbols[symbols[`#target`]], symbols);
                    }
                    break;
                case `#include`:
                    if (Array.isArray(value)) {
                        for (item of value) {
                            const defs = Object.keys(item);
                            const name = defs[0];
                            const path = item[name];
                            Webson.include(element, name, path, symbols);
                        }
                    } else if (typeof value === `object`) {
                            const defs = Object.keys(value);
                            const name = defs[0];
                            const path = value[name];
                        Webson.include(element, name, path, symbols);
                    }
                    break;
                default:
                    if (key[0] === `@`) {
                        const aName = key.substring(1);
                        const aValue = Webson.expand(parent, value, symbols);
                        element.setAttribute(aName, aValue);
                        if (symbols[`#debug`] >= 2) {
                            console.log(
                                `Attribute ${aName}: ${JSON.stringify(value,0,0)} -> ${aValue}`);
                        }
                    } else if (key[0] === `$`) {
                        const val = Webson.expand(element, value, symbols);
                        symbols[key] = val;
                        if (symbols[`#debug`] >= 2) {
                            console.log(`Variable ${key}: ${JSON.stringify(value,0,0)} -> ${val}`);
                        }
                    } else {
                        const val = Webson.expand(element, value, symbols);
                        element.style[key] = val;
                        if (symbols[`#debug`] >= 2) {
                            console.log(`Style ${key}: ${JSON.stringify(value,0,0)} -> ${val}`);
                        }
                    }
                    break;
            }
        });
        // Get children
        if (typeof items[`#`] !== `undefined`) {
            const data = items[`#`];
            if (Array.isArray(data)) {
                data.forEach(function(name) {
                    Webson.build(element, name, symbols[name], symbols);
                });
            } else if (data[0] === `$`) {
                Webson.build(element, data, symbols[data], symbols);
            }
        }
    }, 
    
    // Render a script into a given container
    render: (parent, name, script) => {
        Webson.build(parent, name, JSON.parse(script), {
            "#debug": 0
        });
    }
};
