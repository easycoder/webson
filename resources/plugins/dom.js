const EasyCoder_DOM = {

	name: `EasyCoder_DOM`,

	DOM: {

		compile: compiler => {
			compiler.compileVariable(`dom`, `dom`);
			return true;
		},

		run: program => {
			return program[program.pc].pc + 1;
		}
	},

	Render: {

		compile: compiler => {
			const lino = compiler.getLino();
			if (compiler.nextIsSymbol())
			{
				const symbolRecord = compiler.getSymbolRecord();
				const keyword = symbolRecord.keyword;
				if (keyword === `dom`) {
                    if (compiler.nextTokenIs(`in`)) {
                        if (compiler.nextIsSymbol()) {
                            const parentRecord = compiler.getSymbolRecord();
                            if (parentRecord.extra === `dom`) {
                                if (compiler.nextTokenIs(`from`)) {
                                    const script = compiler.getNextValue();
                                    compiler.addCommand({
                                        domain: `dom`,
                                        keyword: `render`,
                                        lino,
                                        name: symbolRecord.name,
                                        parent: parentRecord.name,
                                        script
                                    });
                                    return true;
                                }
                            }
                        }
                    }
                 }
			}
			return false;
		},

		run: program => {
			const command = program[program.pc];
			const parent = program.getSymbolRecord(command.parent);
            const element = parent.element[parent.index];
            const script = program.getValue(command.script);
            Webson.render(element, script);
			return command.pc + 1;
		}
	},

	// Values
	value: {

		compile: compiler => {
            return null;
		},

		get: (program, value) => {
			return null;
		}
	},

	// Conditions
	condition: {

		compile: compiler => {
		},

		test: (program, condition) => {
            return false;
        }
    },

	// Dispatcher
	getHandler: name => {
		switch (name) {
		case `dom`:
			return EasyCoder_DOM.DOM;
		case `render`:
			return EasyCoder_DOM.Render;
		default:
			return false;
		}
	},

	run: program => {
		const command = program[program.pc];
		const handler = EasyCoder_DOM.getHandler(command.keyword);
		if (!handler) {
			program.runtimeError(command.lino, `Unknown keyword '${command.keyword}' in 'dom' package`);
		}
		return handler.run(program);
	}
};

// eslint-disable-next-line no-unused-vars
EasyCoder.domain.dom = EasyCoder_DOM;
