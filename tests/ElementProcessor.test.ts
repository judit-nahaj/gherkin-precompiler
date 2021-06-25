import { Background, Scenario, ScenarioOutline, Feature, Element } from "gherkin-ast";
import { ElementProcessor } from "../src/ElementProcessor";

describe("ElementProcessor", () => {
    let background: Background;
    let scenario: Scenario;
    let scenarioOutline: ScenarioOutline;
    let feature: Feature;

    beforeEach(() => {
        background = new Background("1", "background", "3");
        scenario = new Scenario("1", "scenario", "3");
        scenarioOutline = new ScenarioOutline("1", "scenarioOutline", "3");
        feature = new Feature("1", "feature", "3");

        feature.elements = [background, scenario, scenarioOutline];
    })

    test("should handle if no pre/post-filter or event handler is set", () => {
        const elements = feature.elements as Element[];
        const elementProcessor = new ElementProcessor<Feature>();
        const results = elementProcessor.execute(elements, feature);
        expect(results).toEqual(elements);
    });

    test("should filter by pre-filter", () => {
        const onBackground = jest.fn();
        const onScenario = jest.fn();
        const onScenarioOutline = jest.fn();
        const elements = feature.elements as Element[];
        const elementProcessor = new ElementProcessor<Feature>({
            preBackground(e: Background): boolean {
                return e.name === ""
            },
            preScenario(e: Scenario): boolean {
                return e.keyword === "1"
            },
            preScenarioOutline(e: ScenarioOutline): boolean {
                return e.description === ""
            },
            onBackground,
            onScenario,
            onScenarioOutline
        });
        const results = elementProcessor.execute(elements, feature);

        expect(results).not.toContain(elements[0])
        expect(results).toContain(elements[1])
        expect(results).not.toContain(elements[2])
        
        expect(onBackground).not.toHaveBeenCalled();
        expect(onScenario).toHaveBeenCalledTimes(1);
        expect(onScenarioOutline).not.toHaveBeenCalled();
    });

    test("should handle if incorrect object type is passed", () => {
        const elements = {};
        const elementProcessor = new ElementProcessor<Feature>();
        const results = elementProcessor.execute(elements as Element[], feature);
        expect(results).toEqual([]);
    });
})