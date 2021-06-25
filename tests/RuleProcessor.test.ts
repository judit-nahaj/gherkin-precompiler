import { Rule, Feature, Scenario } from "gherkin-ast"
import { RuleProcessor } from "../src/RuleProcessor";

describe("RuleProcessor", ()=> {
     let feature1: Feature;
     let feature2: Feature;
     let rule1: Rule;
     let rule2: Rule;

     beforeEach(() => {
         rule1 = new Rule("1", "2", "3");
         rule2 = new Rule("4", "5", "6");
         feature1 = new Feature("1", "2", "3");
         feature2 = new Feature("4", "5", "6");
         feature1.elements = [rule1];
         feature2.elements = [
             rule1,
             rule2,
         ];
    })
    
    test("should handle if no pre/post-filter or event handler is set", () => {
        const items1 = feature1.elements;
        const items2 = feature2.elements;
        const ruleProcessor = new RuleProcessor();
        const result1 = ruleProcessor.execute(items1 as Rule[], feature1);
        const result2 = ruleProcessor.execute(items2 as Rule[], feature2);
        expect(result1).toEqual([rule1]);
        expect(result2).toEqual([rule1, rule2]);
    });

    test("should filter by pre-filter", () => {
        const items1 = feature1.elements;
        const items2 = feature2.elements;
        const onRule = jest.fn();
        const ruleProcessor = new RuleProcessor({
            preRule(e: Rule): boolean {
                return e.name === "5"
            },
            onRule
        });
        const result1 = ruleProcessor.execute(items1 as Rule[], feature1);
        const result2 = ruleProcessor.execute(items2 as Rule[], feature2);
        expect(result1).toEqual([]);
        expect(result2).toEqual([rule2]);
    });
    
    test("should filter by post-filter", () => {
        const items1 = feature1.elements;
        const items2 = feature2.elements;
        const onRule = jest.fn();
        const ruleProcessor = new RuleProcessor({
            postRule(e: Rule): boolean {
                return e.name === "2"
            },
            onRule
        });
        const result1 = ruleProcessor.execute(items1 as Rule[], feature1);
        const result2 = ruleProcessor.execute(items2 as Rule[], feature2);
        expect(result1).toEqual([rule1]);
        expect(result2).toEqual([rule1]);
    });

    test("should process array of rules with event handler", () => {
        const items = feature2.elements;
        const ruleProcessor = new RuleProcessor({
            onRule(e: Rule): Array<Rule> {
                const c = e.clone();
                c.name += "1"
                return [c, c];
            },
        });
        const results = ruleProcessor.execute(items as Rule[], feature2);

        const names = results.map(s => s.name)

        expect(names).toHaveLength(4);
        expect(names).toEqual(["21", "21", "51", "51"]);
    });

    test("should process scenarios", () => {
        rule1.elements = [new Scenario("Scenario", "1", "")];
        const ruleProcessor = new RuleProcessor({
            onRule(e: Rule) {
                e.name += "PROCESSED";
            },
            onScenario(e: Scenario) {
                e.name += "PROCESSED";
            }
        });
        const results = ruleProcessor.execute(feature1.elements as Rule[], feature1);
        expect(results[0].name).toContain("PROCESSED");
        expect(results[0].elements[0].name).toContain("PROCESSED");
    });
});