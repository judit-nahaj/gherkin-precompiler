import { Step, Tag, Scenario, Feature } from "gherkin-ast";
import { ScenarioProcessor } from "../src/ScenarioProcessor";

describe("ScenarioProcessor", () => {
    let scenario1: Scenario, scenario2: Scenario;
    let feature: Feature;
    let steps: Step[];
    let tags: Tag[];

    beforeEach(() => {
        steps = [
            new Step("Given", "1"),
            new Step("When", "2"),
            new Step("Then", "3"),
        ];
        tags = [
            new Tag("tag", "1"),
            new Tag("tag", "2"),
            new Tag("tag", "3"),
        ];

        scenario1 = new Scenario("1", "2", "3");
        scenario2 = new Scenario("4", "5", "6");
        feature = new Feature("1", "2", "3");

        scenario1.steps = steps;
        scenario2.steps = steps;
        scenario1.tags = tags;
        scenario2.tags = tags;
        feature.elements.push(scenario1, scenario2);

    })

    test("should handle if no pre/post-filter or event handler is set", () => {
        const scenarioProcessor = new ScenarioProcessor<Feature>();
        const results = scenarioProcessor.process(scenario1, feature, 1);
        expect(results).toEqual(scenario1);
    });

    test("should filter by pre-filter", () => {
        const scenarioProcessor = new ScenarioProcessor<Feature>({
            preScenario(e: Scenario): boolean {
                return e.name === "2"
            },
        });
        const result1 = scenarioProcessor.preFilter(scenario1, feature, 1);
        const result2 = scenarioProcessor.preFilter(scenario2, feature, 1);
        expect(result1).toBe(true);
        expect(result2).toBe(false);        
    });
    
    test("should filter by post-filter", () => {
        const scenarioProcessor = new ScenarioProcessor<Feature>({
            postScenario(e: Scenario): boolean {
                return e.keyword === "4"
            },
        });
        const result1 = scenarioProcessor.postFilter(scenario1, feature, 1);
        const result2 = scenarioProcessor.postFilter(scenario2, feature, 1);
        expect(result1).toBe(false);
        expect(result2).toBe(true);        
    });
    
    test("should process scenarios", () => {
        const scenarioProcessor = new ScenarioProcessor<Feature>({
            onScenario(e: Scenario): Scenario {
                e.description += "1"
                return e;
            },
        });
        const result1 = scenarioProcessor.process(scenario1, feature, 1) as Scenario;
        const result2 = scenarioProcessor.process(scenario2, feature, 1) as Scenario;
        expect(result1.description).toBe("31");
        expect(result2.description).toBe("61");        
    });
    
    test("should process array of steps with event handler", () => {
        const scenarioProcessor = new ScenarioProcessor<Feature>({
            onScenario(e: Scenario): Array<Scenario> {
                const c = e.clone();
                c.keyword += "1"
                return [c, c];
            },
        });
        const results = scenarioProcessor.process(scenario1, feature, 1) as Scenario[];

        const keywords = results.map(s => s.keyword)

        expect(keywords).toHaveLength(2);
        expect(keywords).toEqual(["11", "11"]);
    });

    test("should handle null value", () => {
        const scenarioProcessor = new ScenarioProcessor<Feature>({
            onScenario(): Array<Scenario> {
                return null;
            },
        });
        const results = scenarioProcessor.process(scenario1, feature, 1) as Scenario[];

        expect(results).toBeNull();
    });

    test("should handle steps", () => {
        const scenarioProcessor = new ScenarioProcessor<Feature>({
            onScenario(e: Scenario) {
                e.name += "PROCESSED";
            },
            onStep(e: Step) {
                e.text += "PROCESSED";
            }
        });
        const result = scenarioProcessor.process(scenario1, feature, 0) as Scenario;
        expect(result.name).toContain("PROCESSED");
        expect(result.steps).toHaveLength(3);

        for (const step of result.steps) {
            expect(step.text).toContain("PROCESSED");
        }
    });
})