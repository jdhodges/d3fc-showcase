import d3 from 'd3';
import fc from 'd3fc';

export default function(domain, data, ratio) {
    if (arguments.length < 3) {
        ratio = 1;
    }
    var dataExtent = fc.util.extent()
        .fields('date')(data);
    var dataTimeExtent = (dataExtent[1].getTime() - dataExtent[0].getTime()) / 1000;
    var domainTimes = domain.map(function(d) { return d.getTime(); });
    var scaledDomainTimeDifference = ratio * (d3.max(domainTimes) - d3.min(domainTimes)) / 1000;
    var scaledLiveDataDomain = scaledDomainTimeDifference < dataTimeExtent ?
        [d3.time.second.offset(dataExtent[1], -scaledDomainTimeDifference), dataExtent[1]] : dataExtent;
    return scaledLiveDataDomain;
}
