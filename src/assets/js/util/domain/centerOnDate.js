import d3 from 'd3';
import fc from 'd3fc';

export default function(domain, data, centerDate) {
    var dataExtent = fc.util.extent()
        .fields('date')(data);
    var domainTimes = domain.map(function(d) { return d.getTime(); });
    var domainTimeDifference = (d3.max(domainTimes) - d3.min(domainTimes)) / 1000;

    if (centerDate.getTime() < dataExtent[0] || centerDate.getTime() > dataExtent[1]) {
        return [new Date(d3.min(domainTimes)), new Date(d3.max(domainTimes))];
    }

    var centeredDataDomain = [d3.time.second.offset(centerDate, -domainTimeDifference / 2),
        d3.time.second.offset(centerDate, domainTimeDifference / 2)];
    var timeShift = 0;
    if (centeredDataDomain[1].getTime() > dataExtent[1].getTime()) {
        timeShift = (dataExtent[1].getTime() - centeredDataDomain[1].getTime()) / 1000;
    } else if (centeredDataDomain[0].getTime() < dataExtent[0].getTime()) {
        timeShift = (dataExtent[0].getTime() - centeredDataDomain[0].getTime()) / 1000;
    }

    return [d3.time.second.offset(centeredDataDomain[0], timeShift),
        d3.time.second.offset(centeredDataDomain[1], timeShift)];
}
