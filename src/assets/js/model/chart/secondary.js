export default function(initialProduct, initialDiscontinuityProvider) {
    return {
        data: [],
        visibleData: [],
        viewDomain: [],
        trackingLatest: true,
        product: initialProduct,
        discontinuityProvider: initialDiscontinuityProvider,
        isMobileWidth: false,
        indicators: []
    };
}
