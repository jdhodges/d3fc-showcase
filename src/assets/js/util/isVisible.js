export default function(selection) {
    var boundingClientRect = selection.node().getBoundingClientRect();
    return boundingClientRect.height && boundingClientRect.width;
}
