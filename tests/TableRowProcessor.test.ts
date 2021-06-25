import { DataTable, TableCell, TableRow } from "gherkin-ast"
import { TableRowProcessor } from "../src/TableRowProcessor";

describe("TableRowProcessor", () => {
    let dataTable: DataTable;
    let rows: TableRow[];

    beforeEach(() => {
        rows = [
            new TableRow([
                new TableCell("1"),
                new TableCell("2"),
            ]),
            new TableRow([
                new TableCell("3"),
                new TableCell("4"),
            ]),
        ];
        dataTable = new DataTable(rows);
    });

    test("should handle if no pre/post-filter or event handler is set", () => {
        const tableRowProcessor = new TableRowProcessor<DataTable>();
        const results = tableRowProcessor.execute(rows, dataTable);

        expect(results).toEqual(rows);
    });

    test("should filter by pre-filter", () => {
        const tableRowProcessor = new TableRowProcessor<DataTable>({
            preTableRow(e: TableRow): boolean {
                return e.cells.some(c => c.value === "1");
            },
            onTableRow(e: TableRow): void {
                e.cells.push(new TableCell("new"));
            },
        });
        const results = tableRowProcessor.execute(rows, dataTable);
        expect(results).toHaveLength(1);
        expect(results[0].cells).toHaveLength(3);
        expect(results[0].cells[0].value).toBe("1");
        expect(results[0].cells[1].value).toBe("2");
        expect(results[0].cells[2].value).toBe("new");
    });

    test("should filter by post-filter", () => {
        const tableRowProcessor = new TableRowProcessor<DataTable>({
            postTableRow(e: TableRow): boolean {
                return e.cells.some(c => c.value === "5");
            },
            onTableRow(e: TableRow): void {
                e.cells.push(new TableCell(
                    String(+e.cells[1].value + 1)
                ));
            },
        });
        const results = tableRowProcessor.execute(rows, dataTable);
        expect(results).toHaveLength(1);
        expect(results[0].cells).toHaveLength(3);
        expect(results[0].cells[0].value).toBe("3");
        expect(results[0].cells[1].value).toBe("4");
        expect(results[0].cells[2].value).toBe("5");
    });

    test("should process with event handler", () => {
        const tableRowProcessor = new TableRowProcessor<DataTable>({
            onTableRow(e: TableRow): void {
                e.cells.push(new TableCell("new"));
            },
        });
        const results = tableRowProcessor.execute(rows, dataTable);

        expect(results).toHaveLength(2);
        for (const row of results) {
            expect(row.cells).toHaveLength(3);
            expect(row.cells[2].value).toBe("new");
        }
    });
})