import { Background, Step, DocString, DataTable, TableRow, TableCell } from "gherkin-ast";
import { StepProcessor } from "../src/StepProcessor";

describe("StepProcessor", () => {
    let background: Background;
    let steps: Step[];

    beforeEach(() => {
        steps = [
            new Step("Given", "1"),
            new Step("When", "2"),
            new Step("Then", "3"),
        ];
        background = new Background("Background", "0", "");

        steps[0].docString = new DocString("1");
        steps[2].docString = new DocString("3");

        steps[0].dataTable = new DataTable([new TableRow([new TableCell("1")])]);
        steps[1].dataTable = new DataTable([new TableRow([new TableCell("2")])]);

        background.steps = steps;
    })

    test("should handle if no pre/post-filter or event handler is set", () => {
        const stepProcessor = new StepProcessor<Background>();
        const results = stepProcessor.execute(steps, background);

        expect(results).toEqual(steps);
    });

    test("should filter by pre-filter", () => {
        const onStep = jest.fn();
        const stepProcessor = new StepProcessor<Background>({
            preStep(e: Step): boolean {
                return e.text === ""
            },
            onStep
        });
        const results = stepProcessor.execute(steps, background);

        expect(results).toEqual([]);
        expect(onStep).not.toHaveBeenCalled();
    });

    test("should filter by post-filter", () => {
        const onStep = jest.fn();
        const stepProcessor = new StepProcessor<Background>({
            postStep(e: Step): boolean {
                return e.text === ""
            },
            onStep
        });
        const results = stepProcessor.execute(steps, background);

        expect(results).toEqual([]);
        expect(onStep).not.toHaveBeenCalledWith(steps, background);
    });

    test("should process step with event handler", () => {

        const stepProcessor = new StepProcessor<Background>({
            onStep(e: Step): void {
                e.text += "1";
            },
        });
        const results = stepProcessor.execute(steps, background);

        expect(results).toHaveLength(3);
        expect(results[0].text).toEqual("11");
        expect(results[1].text).toEqual("21");
        expect(results[2].text).toEqual("31");
    });

    test("should process array of steps with event handler", () => {
        const stepProcessor = new StepProcessor<Background>({
            onStep(e: Step): Array<Step> {
                const c = e.clone();
                c.text += 1
                return [c, c];
            },
        });
        const results = stepProcessor.execute(steps, background);

        const texts = results.map(s => s.text)

        expect(texts).toHaveLength(6);
        expect(texts).toEqual(["11", "11", "21", "21", "31", "31"]);
    });

    test("should process docString of step", () => {
        const stepProcessor = new StepProcessor<Background>({
            onStep(e: Step): void {
                e.text += "PROCESSED";
            },

            onDocString(e: DocString): void {
                e.content += "1";
            }
        });

        const results = stepProcessor.execute(steps, background);
        expect(results[0].docString.content).toEqual("11");
        expect(results[1].docString).toBeNull();
        expect(results[2].docString.content).toEqual("31");
        expect(results).not.toBeNull();
    });

    test("should process dataTable of step", () => {
        const stepProcessor = new StepProcessor<Background>({
            onDataTable(e: DataTable): void {
                e.rows[0].cells[0].value += "1"
            },
        });

        const results = stepProcessor.execute(steps, background);
        expect(results[0].dataTable.rows[0].cells[0].value).toEqual("11");
        expect(results[1].dataTable.rows[0].cells[0].value).toEqual("21");
        expect(results[2].dataTable).toBeNull();
        expect(results).not.toBeNull();
    });
})