var assert = require("assert");

var _ = require("underscore");

var test = require("../testing").test;
var html = require("../../lib/html");
var htmlPaths = require("../../lib/html-paths");

var nonFreshElement = html.nonFreshElement;
var text = html.text;
var pathToNodes = html.pathToNodes;

describe("simplify", function() {
    test("empty text nodes are removed", function() {
        assert.deepEqual(
            simplifyNode(text("")),
            []
        );
    });
    
    test("elements with no children are removed", function() {
        assert.deepEqual(
            simplifyNode(nonFreshElement("p", {}, [])),
            []
        );
    });
    
    test("elements only containing empty nodes are removed", function() {
        assert.deepEqual(
            simplifyNode(nonFreshElement("p", {}, [text("")])),
            []
        );
    });
    
    test("empty children of element are removed", function() {
        assert.deepEqual(
            simplifyNode(nonFreshElement("p", {}, [text("Hello"), text("")])),
            [nonFreshElement("p", {}, [text("Hello")])]
        );
    });
    
    test("successive fresh elements are not collapsed", function() {
        var path = htmlPaths.elements([
            htmlPaths.element("p", {}, {fresh: true})
        ]);
        var original = concat(
            pathToNodes(path, [text("Hello")]),
            pathToNodes(path, [text(" there")])
        );
        
        assert.deepEqual(
            html.simplify(original),
            original);
    });
    
    test("successive plain non-fresh elements are collapsed if they have the same tag name", function() {
        var path = htmlPaths.elements([
            htmlPaths.element("p", {}, {fresh: false})
        ]);
        assert.deepEqual(
            html.simplify(concat(
                pathToNodes(path, [text("Hello")]),
                pathToNodes(path, [text(" there")])
            )),
            pathToNodes(path, [text("Hello"), text(" there")])
        );
    });
    
    test("non-fresh can collapse into preceding fresh element", function() {
        var freshPath = htmlPaths.elements([
            htmlPaths.element("p", {}, {fresh: true})]);
        var nonFreshPath = htmlPaths.elements([
            htmlPaths.element("p", {}, {fresh: false})]);
        assert.deepEqual(
            html.simplify(concat(
                pathToNodes(freshPath, [text("Hello")]),
                pathToNodes(nonFreshPath, [text(" there")])
            )),
            pathToNodes(freshPath, [text("Hello"), text(" there")])
        );
    });
    
    test("children of collapsed element can collapse with children of another collapsed element", function() {
        assert.deepEqual(
            html.simplify([
                nonFreshElement("blockquote", {}, [nonFreshElement("p", {}, [text("Hello")])]),
                nonFreshElement("blockquote", {}, [nonFreshElement("p", {}, [text("there")])])
            ]),
            [nonFreshElement("blockquote", {}, [nonFreshElement("p", {}, [text("Hello"), text("there")])])]
        );
    });
    
    test("empty elements are removed before collapsing", function() {
        var freshPath = htmlPaths.elements([
            htmlPaths.element("p", {}, {fresh: true})]);
        var nonFreshPath = htmlPaths.elements([
            htmlPaths.element("p", {}, {fresh: false})]);
        assert.deepEqual(
            html.simplify(concat(
                pathToNodes(nonFreshPath, [text("Hello")]),
                pathToNodes(freshPath, []),
                pathToNodes(nonFreshPath, [text(" there")])
            )),
            pathToNodes(nonFreshPath, [text("Hello"), text(" there")])
        );
    });
});

function simplifyNode(node) {
    return html.simplify([node]);
}

function concat() {
    return _.flatten(arguments, true);
}
