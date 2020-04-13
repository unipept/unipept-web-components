/**
 * Mock of the part of the jQuery-interface that's used by some of the components that are being tested.
 *
 * @author Pieter Verschaffelt
 */
import MockTreeview from "@/test/mocks/MockTreeview";

export default function $(args: any) {
    return new jQueryMock();
}

class jQueryMock {
    constructor() {}

    public treeview(data: any): MockTreeview {
        return new MockTreeview();
    }

    public html(args: string): jQueryMock {
        return this;
    }
}
