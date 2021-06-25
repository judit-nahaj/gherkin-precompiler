import { Examples, ScenarioOutline, TableCell, TableRow } from "gherkin-ast";
import { ExamplesProcessor } from "../src/ExamplesProcessor";

describe("ExampleProcessor", () => {
    let scenarioOutline: ScenarioOutline;
    let examples: Examples[];

    beforeEach(() => {
        examples = [
            new Examples("k", "n"),
            new Examples("n", "k"),
        ]
        scenarioOutline = new ScenarioOutline("1", "2", "3");
        scenarioOutline.examples = examples;    
    })
    
    test("should work if no pre/post-filter or event handler is set", () => {
        const examplesProcessor = new ExamplesProcessor();
        const result = examplesProcessor.execute(examples, scenarioOutline);
        expect(result).toEqual(examples);
    });

    test("should filter by pre-filter", () => {
        const onExamples = jest.fn();
        const examplesProcessor = new ExamplesProcessor({
            preExamples(e: Examples): boolean {
                return e.name === "k"
            },
            onExamples
        });
        const result = examplesProcessor.execute(examples, scenarioOutline);
        expect(result).toEqual([examples[1]]);
        expect(onExamples).toHaveBeenCalledTimes(1);
    });

    test("should filter by post-filter", () => {
        const onExamples = jest.fn();
        const examplesProcessor = new ExamplesProcessor({
            postExamples(e: Examples): boolean {
                return e.name === "n"
            },
            onExamples
        });
        const result = examplesProcessor.execute(examples, scenarioOutline);
        expect(result).toEqual([examples[0]]);
        expect(onExamples).toHaveBeenCalledTimes(2);
    });

    test("should process array of steps with event handler", () => {
        const exampleProcessor = new ExamplesProcessor({
            onExamples(e: Examples): Array<Examples> {
                const c = e.clone();
                c.name += 1
                return [c, c];
            },
        });
        const results = exampleProcessor.execute(examples, scenarioOutline);

        const names = results.map(s => s.name)

        expect(names).toHaveLength(4);
        expect(names).toEqual(["n1", "n1", "k1", "k1"]);
    });

    test("should process header", () => {
        const exampleProcessor = new ExamplesProcessor({
            onExamples(e: Examples) {
                e.name += "PROCESSED";
            },
            onTableRow(e: TableRow) {
                e.cells[0].value += "PROCESSED";
            }
        });
        examples[0].body = [new TableRow([
            new TableCell("1"),
        ])];

        const results = exampleProcessor.execute(examples, scenarioOutline);
        expect(results[0].name).toContain("PROCESSED");
        expect(results[0].body[0].cells[0].value).toContain("PROCESSED");
    })
})