

const HC_PALETTE = ['#67b7dc', '#6794dc', '#6771dc', '#8067dc', '#a367dc', '#c767dc', '#dc67ce', '#dc67ab', '#dc6788', '#dc6967', '#dc8c67', '#dcaf67'];

const HC_MAIN_BARS = ['#73556E', '#9FA1A6', '#F2AA6B', '#F28F6B', '#A95A52', '#E35B5D', '#FFA446'];

Highcharts.setOptions({ lang: { thousandsSep: ',' } });

const hcHex = (h) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const hcRgb = (a) => 'rgb(' + a.map(v => Math.max(0, Math.min(255, Math.round(v)))).join(',') + ')';

const hcShade = (hex, f) => { const c = hcHex(hex); return hcRgb(f >= 0 ? c.map(v => v * (1 - f)) : c.map(v => v + (255 - v) * (-f))); };
const hcLighten = (hex, f) => hcRgb(hcHex(hex).map(v => v + (255 - v) * f));

const hcRadialPie = (hex) => ({
    radialGradient: { cx: 0.5, cy: 0.5, r: 0.5 },
    stops: [[0, hcShade(hex, 0.35)], [0.55, hex], [1, hcShade(hex, 0.22)]]
});
const hcRadial = (hex) => ({
    radialGradient: { cx: 0.5, cy: 0.5, r: 0.5 },
    stops: [[0, hcShade(hex, 0.8)], [0.25, hcShade(hex, 0.8)], [0.5, hcShade(hex, 0.5)], [0.75, hex], [1, hcShade(hex, 0.5)]]
});

const hcTooltip = {
    useHTML: true, outside: false, backgroundColor: '#ffffff', borderColor: '#999999', borderRadius: 4, shadow: false,
    style: { fontSize: '11px', whiteSpace: 'normal', width: '170px', textAlign: 'center' }
};

const hcPie = (div, dataArr, opts) => {
    opts = opts || {};
    const flat = !!opts.colorMap;
    const total = dataArr.reduce((s, d) => s + (d.sales || 0), 0) || 1;
    const bottom = (opts.legend || 'bottom') === 'bottom';
    const cols = opts.columns || 3;
    const pts = dataArr.map((d, i) => {
        const base = flat ? ('#' + ((opts.colorMap[d.country] !== undefined ? opts.colorMap[d.country] : 0x999999).toString(16).padStart(6, '0'))) : HC_PALETTE[i % HC_PALETTE.length];
        return { name: d.country, y: d.sales, color: (!flat && opts.innerRadius !== 0) ? hcRadial(base) : base, _base: base };
    });
    const chart = Highcharts.chart(div, {
        chart: {
            type: 'pie', backgroundColor: 'transparent', spacing: [4, 4, 4, 4], animation: { duration: 800 },
            events: {

                render: function () {
                    const ch = this;

                    if (!flat && opts.innerRadius !== 0) {
                        ch.legend.allItems.forEach(it => { const sym = it.legendSymbol || (it.legendItem && it.legendItem.symbol); if (sym && it._base) { sym.attr({ fill: it._base }); } });
                    }

                    if (opts.centerLabel) {
                        if (ch._cl) { ch._cl.destroy(); }
                        const c = ch.series[0].center;
                        ch._cl = ch.renderer.text('<tspan style="font-weight:700">' + (total) + '</tspan><br/><tspan style="font-weight:700">' + opts.centerLabel + '</tspan>', ch.plotLeft + c[0], ch.plotTop + c[1] - 4)
                            .attr({ align: 'center' }).css({ color: '#555555', fontSize: '13px', textAlign: 'center' }).add();
                    }
                }
            }
        },
        title: { text: null }, credits: { enabled: false }, exporting: { enabled: false },
        tooltip: Object.assign({}, hcTooltip, { pointFormat: '{point.name}: {point.y} ({point.percentage:.1f}%)', headerFormat: '' }),
        plotOptions: { pie: {
            size: opts.size || 132, minSize: 60, innerSize: (opts.innerRadius === undefined ? 50 : opts.innerRadius) + '%',
            center: bottom ? ['50%', opts.centerY || 78] : ['50%', '50%'],
            borderWidth: flat ? 0 : 1, borderColor: '#ffffff', dataLabels: { enabled: false }, showInLegend: true, startAngle: 0,
            states: { hover: { halo: { size: 4, opacity: 0.25 }, brightness: 0 } }, allowPointSelect: false, slicedOffset: 0
        } },
        legend: bottom ? {
            layout: 'horizontal', align: 'center', verticalAlign: 'bottom', useHTML: true, symbolRadius: 2, symbolHeight: 10, symbolWidth: 10,
            itemWidth: Math.floor(338 / cols), itemMarginTop: 1, itemMarginBottom: 1, margin: 0, padding: 0, maxHeight: opts.legendHeight || 80,
            navigation: { enabled: false }, itemStyle: { fontWeight: 'normal', fontSize: (dataArr.length > 6 ? '10px' : '11px'), color: '#333333', width: (Math.floor(338 / cols) - 16) + 'px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
            labelFormatter: function () { return '<span title="' + this.name + '">' + this.name + ' ' + this.percentage.toFixed(2) + '%</span>'; }
        } : {
            layout: 'vertical', align: 'right', verticalAlign: 'middle', useHTML: true, symbolRadius: 2, symbolHeight: 10, symbolWidth: 10, itemMarginTop: 3, itemMarginBottom: 3,
            itemStyle: { fontWeight: 'normal', fontSize: '11px', color: '#333333' },
            labelFormatter: function () { return this.name + ' <span style="color:#555">' + this.percentage.toFixed(2) + '%</span>'; }
        },
        series: [{ name: 'Share', data: pts }]
    });
    return chart;
};

const hcBar = (div, dataArr, opts) => {
    opts = opts || {};
    const horizontal = !!opts.horizontal;
    const vals = dataArr.map(d => (d.value !== undefined ? d.value : d.sales) || 0);
    const total = vals.reduce((s, v) => s + v, 0) || 1;
    const main = !!opts.mainStyle;
    const colorOf = (i) => {
        if (main) { const base = HC_MAIN_BARS[i % HC_MAIN_BARS.length]; return Math.floor(i / HC_MAIN_BARS.length) ? hcLighten(base, 0.22 * Math.floor(i / HC_MAIN_BARS.length)) : base; }
        return HC_PALETTE[i % HC_PALETTE.length];
    };
    const tube = (hex) => ({

        linearGradient: horizontal ? { x1: 0, y1: 0, x2: 0, y2: 1 } : { x1: 0, y1: 0, x2: 1, y2: 0 },
        stops: [[0, hcShade(hex, 0.45)], [0.5, hex], [1, hcShade(hex, 0.45)]]
    });
    const pts = dataArr.map((d, i) => { const base = colorOf(i); return { name: d.country, full: d.full || d.country, y: vals[i], color: base, pct: Math.round(vals[i] / total * 1000) / 10 }; });
    const chart = Highcharts.chart(div, {
        chart: Object.assign({ type: horizontal ? 'bar' : 'column', backgroundColor: 'transparent', animation: { duration: 800 }, spacing: [4, 4, 4, 4] }, opts.margins || {}),
        title: { text: null }, credits: { enabled: false }, exporting: { enabled: false }, legend: { enabled: false },
        tooltip: Object.assign({}, hcTooltip, main
            ? { headerFormat: '', pointFormat: '{point.full}: {point.y}' }
            : { headerFormat: '', pointFormat: '{point.name}: {point.y} ({point.pct}%)' }),
        xAxis: {
            type: 'category', categories: dataArr.map(d => d.country), lineColor: main ? '#cccccc' : '#cccccc', tickLength: 0,
            labels: main
                ? { rotation: -45, step: 1, style: { fontSize: '10px', fontWeight: '600', color: '#555555', textOverflow: 'none' }, align: 'right' }
                : (horizontal ? { style: { fontSize: '10px', color: '#333333' }, align: 'right', formatter: function () { const t = String(this.value); return t.length > 22 ? t.slice(0, 21) + '…' : t; } }
                              : { style: { fontSize: '10px', width: '58px', textAlign: 'center', whiteSpace: 'normal', color: '#333333' }, useHTML: true })
        },
        yAxis: main
            ? { title: { text: opts.yTitle || 'Number of samples', style: { fontSize: '10px', fontWeight: '700', color: '#555555' } }, min: 0, gridLineColor: '#eeeeee', labels: { format: '{value:,.0f}', style: { fontSize: '10px', color: '#666666' } }, endOnTick: true }
            : { title: { text: null }, min: 0, visible: false },
        plotOptions: { series: { borderWidth: 0, borderRadius: main ? 4 : 2, pointPadding: main ? 0.1 : 0.12, groupPadding: 0.06, colorByPoint: true,
            states: { hover: { brightness: 0.08 } },
            dataLabels: main ? { enabled: false } : { enabled: true, useHTML: false, format: '{point.pct}%', style: { fontSize: '10px', fontWeight: 'normal', color: '#444444', textOutline: 'none' }, crop: false, overflow: 'allow', allowOverlap: true } } },
        series: [{ name: 'Count', data: pts }]
    });
    return chart;
};

const hcMainColor = (i) => { const b = HC_MAIN_BARS[i % HC_MAIN_BARS.length]; const k = Math.floor(i / HC_MAIN_BARS.length); return k ? hcLighten(b, 0.22 * k) : b; };
const hcMainBase = (type, spacing, extra) => Object.assign({
    chart: Object.assign({ type: type, backgroundColor: 'transparent', animation: { duration: 800 }, spacing: spacing }, extra.chart || {}),
    title: { text: null }, credits: { enabled: false }, exporting: { enabled: false }, legend: { enabled: false },
    tooltip: Object.assign({}, hcTooltip, { headerFormat: '', pointFormat: '{point.full}: {point.y}' })
}, extra.rest || {});
const hcMainYAxis = (yTitle) => ({ title: { text: yTitle || 'Number of samples', style: { fontSize: '10px', fontWeight: '700', color: '#555555' } }, min: 0, gridLineColor: '#eeeeee',
    labels: { format: '{value:,.0f}', style: { fontSize: '10px', color: '#666666' } }, endOnTick: true });
const hcMainPts = (dataArr) => dataArr.map((d, i) => ({ name: d.country, full: d.full || d.country, y: (d.value !== undefined ? d.value : d.sales) || 0, color: hcMainColor(i) }));

const hcMainHBar = (div, dataArr, opts) => {
    opts = opts || {};
    return Highcharts.chart(div, hcMainBase('bar', [4, 10, 4, 4], { chart: {}, rest: {
        xAxis: { type: 'category', categories: dataArr.map(d => d.country), lineColor: '#cccccc', tickLength: 0, labels: { style: { fontSize: '10px', fontWeight: '600', color: '#555555' } } },
        yAxis: hcMainYAxis(opts.yTitle),
        plotOptions: { series: { borderWidth: 0, borderRadius: 3, pointPadding: 0.12, groupPadding: 0.05, colorByPoint: true, states: { hover: { brightness: 0.08 } } } },
        series: [{ name: 'Count', data: hcMainPts(dataArr) }] } }));
};

const hcMainArea = (div, dataArr, opts) => {
    opts = opts || {};
    return Highcharts.chart(div, hcMainBase('area', [4, 8, 4, 4], { chart: {}, rest: {
        xAxis: { categories: dataArr.map(d => d.country), lineColor: '#cccccc', tickLength: 0,
                 labels: { rotation: -45, step: 1, style: { fontSize: '10px', fontWeight: '600', color: '#555555', textOverflow: 'none' }, align: 'right' } },
        yAxis: hcMainYAxis(opts.yTitle),
        plotOptions: { series: { lineWidth: 2.5, marker: { enabled: true, radius: 3.5, symbol: 'circle' }, fillOpacity: 0.28 } },
        series: [{ name: 'Count', color: opts.color || HC_MAIN_BARS[0], data: hcMainPts(dataArr).map(p => { delete p.color; return p; }) }] } }));
};

const hcMainRose = (div, dataArr) => {
    return Highcharts.chart(div, hcMainBase('column', [2, 2, 2, 2], { chart: { polar: true }, rest: {
        xAxis: { categories: dataArr.map(d => d.country), tickmarkPlacement: 'on', lineWidth: 0, labels: { style: { fontSize: '10px', fontWeight: '600', color: '#555555' } } },
        yAxis: { min: 0, gridLineColor: '#eeeeee', labels: { enabled: false }, endOnTick: false },
        plotOptions: { series: { pointPlacement: 'on', borderWidth: 0, colorByPoint: true, groupPadding: 0, pointPadding: 0.02 } },
        series: [{ name: 'Count', data: hcMainPts(dataArr) }] } }));
};
