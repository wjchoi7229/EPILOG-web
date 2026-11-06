
const PLDDT_COLORS = { variant: '#3091ff', wild: '#ff2d2d' };

const plddtOverlapColor = (hexA, hexB, a = 0.2) => {
    const rgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const layer = c => c.map(v => 255 * (1 - a) + v * a);
    const la = layer(rgb(hexA)), lb = layer(rgb(hexB));
    const m = la.map((v, i) => Math.round(v * lb[i] / 255));
    return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
};
const plddtFill = (hex, a = 0.2) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

class PrdctnChart {
    constructor(targetId, isEvent, width, height, callbak) {
        this.targetId = targetId;
        this.width = width;
        this.height = height;
        this.amRoot;
        this.amChart;
        this.callbak = callbak;
        this.paeChart;
        this.icn3dObj;
        this.arrAllMutVirusSeq = [];
        this.arrAllMutVirusChain = [];
        this.isEvent = isEvent;
        this.proteinStruc = 'MN';
        this.seq1 = '';
        this.seq2 = '';
        this.seq3 = '';
        this.seq4 = '';
        this.seq5 = '';
        this.seq6 = '';
        this.seq7 = '';
        this.seq8 = '';
        this.apessDistConf = {
                                chart: {
                                    type:'spline',
                                    zoomType: 'xy',
                                },
                                credits: {
                                    enabled: false
                                },
                                title: {
                                    text: 'Amino acid Property Eigen Selection Score'
                                },

                                yAxis: {
                                    title: {
                                        text: 'Density'
                                    }
                                },
                                xAxis: {
                                    type: 'string',
                                    max: 7,

                                    //plotLines: [{
                                        //color: '#FF0000', // Red
                                        //width: 2,
                                        //value: apess_sum // Position, you'll have to translate this to the values on your x axis
                                    //}],

                                    plotBands: [{
                                        from: 1.5,
                                        to: 8,
                                        color: '#FFEFFF',
                                        label: {
                                            text: 'Infectivity',
                                            style: {
                                                color: '#999999',
                                                fontSize: '40pt'

                                            },
                                            y: 180
                                        }
                                    },
                                    {
                                        from: -0.1,
                                        to: -2.0,
                                        color: '#EFFFFF',
                                        label: {
                                            text: '',
                                            style: {
                                                color: '#999999'
                                            },
                                            y: 180
                                        }
                                    }],

                                    reversed: false
                                },

                                plotOptions: {
                                    series: {
                                        marker: {
                                            enabled: false,
                                            symbol: 'circle',
                                            radius: 2
                                        },
                                        label: {
                                            connectorAllowed: false
                                        },
                                        pointStart: 0
                                    }
                                },
                                series: [
                                ],

                            };
    }

    makeIcn3dCmd(cmdKnd, posX, posY){
        let tmpCmd;
        if (cmdKnd == 'select'){

            tmpCmd = `select .${this.arrAllMutVirusChain[posX]}:${this.arrAllMutVirusSeq[posX].replace(/[^0-9]/g, '')}`

            if (posY){
                tmpCmd += ` or .${this.arrAllMutVirusChain[posY]}:${this.arrAllMutVirusSeq[posY].replace(/[^0-9]/g, '')}`
            }
        }

        return tmpCmd;
    }

    drawSubDomain(domainNm) {
        const prdctnObj = this;
        let data, categories;

        if (domainNm == 'ORF1ab') {
            data = [{ x: 1, x2: 180, y: 15 }, { x: 181, x2: 818, y: 14 }, { x: 819, x2: 2763, y: 13 }, { x: 2764, x2: 3263, y: 12 }, { x: 3264, x2: 3569, y: 11 }, { x: 3570, x2: 3859, y: 10 }, { x: 3860, x2: 3942, y: 9 }, { x: 3943, x2: 4140, y: 8 }, { x: 4141, x2: 4253, y: 7 }, { x: 4254, x2: 4392, y: 6 }, { x: 4393, x2: 4405, y: 5 }, { x: 4393, x2: 5324, y: 4 }, { x: 5325, x2: 5925, y: 3 }, { x: 5926, x2: 6452, y: 2 }, { x: 6453, x2: 6798, y: 1 }, { x: 6799, x2: 7096, y: 0 },];
            categories = ['NSP16', 'NSP15', 'NSP14', 'NSP13', 'NSP12', 'NSP11', 'NSP10', 'NSP9', 'NSP8', 'NSP7', 'NSP6', 'NSP5', 'NSP4', 'NSP3', 'NSP2', 'NSP1'];
        } else if (domainNm == 'S') {
            data = [{ x: 1, x2: 1273, y: 9 },{ x: 14, x2: 685, y: 8 }, { x: 686, x2: 1273, y: 7 }, { x: 816, x2: 1273, y: 6 }, { x: 319, x2: 541, y: 5 }, { x: 437, x2: 508, y: 4 }, { x: 816, x2: 837, y: 3 }, { x: 835, x2: 855, y: 2 }, { x: 920, x2: 970, y: 1 }, { x: 1163, x2: 1202, y: 0 },];

            categories = ['Heptad repeat 2', 'Heptad repeat 1', 'Fusion peptide 2', 'Fusion peptide 1', 'RBM', 'RBD', 'S2\'', 'S2', 'S1', 'S'];
        } else if (domainNm == 'N') {
            data = [{ x: 1, x2: 419, y: 2 }, { x: 1, x2: 97, y: 1 }, { x: 1, x2: 73, y: 0 },];

            categories = ['ORF9c', 'ORF9b', 'N'];
        }

        Highcharts.chart(prdctnObj.targetId, {
            chart: {
                type: 'xrange'
            },
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            accessibility: {
                point: {
                    descriptionFormatter: function (point) {
                        var ix = point.index + 1, category = point.yCategory, from = point.x, to = point.x2;
                        return ix + '. ' + category + ', ' + from +
                            ' to ' + to + '.';
                    }
                }
            },
            xAxis: {
                type: 'string'
            },
            yAxis: {
                title: {
                    text: ''
                },
                categories: categories,
                reversed: false
            },
            series: [{
                name: 'domain',
                // pointPadding: 0,
                // groupPadding: 0,
                borderColor: 'gray',
                pointWidth: 20,
                data: data,
                dataLabels: {
                    enabled: false
                },
                events: {
                    click: function (e) {
                        prdctnObj.callbak(e.point.yCategory);
                    }
                }
            }]
        });
    }

    drawPaeHeatMap(arrPaeData, cellSize) {
        cellSize = cellSize || 1;
        this.paeChart = Highcharts.chart(this.targetId, {
            chart: {
                type: 'heatmap',
                events: {
                    click: e =>  {
                        if (this.isEvent) this.icn3dObj.icn3d.loadScriptCls.loadScript(this.makeIcn3dCmd('select', this.paeChart.hoverPoint.x, this.paeChart.hoverPoint.y));
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Predicted Aligned Error'
            },

            boost: {
                useGPUTranslations: true
            },

            xAxis: {
                type: 'string',
                min: 0,
                max: arrPaeData[0].length,
                title: {
                    text: 'Aligned residue'
                },
                labels: {
                    align: 'left',
                    x: 5,
                    y: 14,
                    format: '{value}',
                },
                showLastLabel: false,
                tickLength: 1,
            },

            yAxis: {
                categories: this.arrAllMutVirusSeq,
                title: {
                    text: 'Aligned residue'
                },
                labels: {
                    format: '{value}'
                },
                minPadding: 0,
                maxPadding: 0,
                startOnTick: false,
                endOnTick: false,

                tickWidth: 1,
                min: 0,
                max: arrPaeData[1].length,
                reversed: false,
            },

            colorAxis: {

                stops: [
                    [0, '#440154'],
                    [0.25, '#3B528B'],
                    [0.5, '#21918C'],
                    [0.75, '#5EC962'],
                    [1, '#FDE725']
                ],
                startOnTick: false,
                endOnTick: false,
                max: 31.75,
                labels: {
                    format: '{value}'
                },
            },

            series: [{

                boostThreshold: 50000,

                colsize: cellSize,
                rowsize: cellSize,
                //borderWidth: 1,
                //nullColor: '#EFEFEF',
                data: arrPaeData,
                allowPointSelect: true,
                tooltip: {
                    headerFormat: 'PAE<br/>',
                    pointFormat: '{point.x} {point.y}: <b>{point.value}</b>'
                },
                turboThreshold: Number.MAX_VALUE //#3404, remove after 4.0.5 release
            }],
        });
    }

    initVirusSeq(resultForm) {
        this.seq1 = $(resultForm).find('input[name=output_virus_seq_1]').val();
        this.seq2 = $(resultForm).find('input[name=output_virus_seq_2]').val();
        this.seq3 = $(resultForm).find('input[name=output_virus_seq_3]').val();
        this.seq4 = $(resultForm).find('input[name=output_virus_seq_4]').val();
        this.seq5 = $(resultForm).find('input[name=output_virus_seq_5]').val();
        this.seq6 = $(resultForm).find('input[name=output_virus_seq_6]').val();
        this.seq7 = $(resultForm).find('input[name=output_virus_seq_7]').val();
        this.seq8 = $(resultForm).find('input[name=output_virus_seq_8]').val();

        if (this.seq1)
            for (let idx in this.seq1) { this.arrAllMutVirusSeq.push(this.seq1[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('A'); };
        if (this.seq2)
            for (let idx in this.seq2) { this.arrAllMutVirusSeq.push(this.seq2[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('B'); };
        if (this.seq3)
            for (let idx in this.seq3) { this.arrAllMutVirusSeq.push(this.seq3[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('C'); };
        if (this.seq4)
            for (let idx in this.seq4) { this.arrAllMutVirusSeq.push(this.seq4[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('D'); };
        if (this.seq5)
            for (let idx in this.seq5) { this.arrAllMutVirusSeq.push(this.seq5[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('E'); };
        if (this.seq6)
            for (let idx in this.seq6) { this.arrAllMutVirusSeq.push(this.seq6[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('F'); };
        if (this.seq7)
            for (let idx in this.seq7) { this.arrAllMutVirusSeq.push(this.seq7[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('G'); };
        if (this.seq8)
            for (let idx in this.seq8) { this.arrAllMutVirusSeq.push(this.seq8[idx] + (Number(idx) + 1)); this.arrAllMutVirusChain.push('H'); };

        if (`${this.seq2}${this.seq3}${this.seq4}${this.seq5}${this.seq6}${this.seq7}${this.seq8}` != '') this.proteinStruc = 'MT'
    }

    async drawPae(paePath, icn3dObj, targetId, fileType) {
        this.icn3dObj = icn3dObj;
        this.targetId = targetId ? targetId : this.targetId
        async function getPaeData() {
            const response = await fetch(
                decodeURIComponent(`/filedownload?file_name=${paePath}&file_type=${fileType}`)
            );
            return response.json();
        }

        const data = await getPaeData();

        let arrPaeData = [];
        if (data != '') {
            for (var i = 0; i < data[0].predicted_aligned_error.length; i++) {
                for (var j = 0; j < data[0].predicted_aligned_error[i].length; j++) {
                    arrPaeData.push({
                        x: i,
                        y: j,
                        value: data[0].predicted_aligned_error[i][j]
                    });
                }
            }
        }

        this.drawPaeHeatMap(arrPaeData);

        return data;
    }

    async drawPaeCsv(paePath, icn3dObj, targetId, fileType) {
        this.icn3dObj = icn3dObj;
        this.targetId = targetId ? targetId : this.targetId
        async function getPaeHeatmapData() {
            const response = await fetch(
                decodeURIComponent(`/pae_heatmap?file_name=${paePath}&file_type=${fileType}`)
            );
            return response.json();
        }

        const result = await getPaeHeatmapData();

        let arrPaeData = [];
        if (result && result.data) {
            for (let idx = 0; idx < result.data.length; idx++) {
                const [x, y, value] = result.data[idx];
                arrPaeData.push({ x, y, value });
            }
        }

        this.drawPaeHeatMap(arrPaeData, result ? result.bin_size : 1);

        return result;
    }

     drawPaeLocal(paeData, icn3dObj, targetId) {
        this.icn3dObj = icn3dObj;
        this.targetId = targetId ? targetId : this.targetId

        let arrPaeData = [];
        if (paeData != '') {

            if (!paeData[0].predicted_aligned_error) paeData = this.transNewPaeFormatt(paeData[0]);

            for (var i = 0; i < paeData[0].predicted_aligned_error.length; i++) {
                for (var j = 0; j < paeData[0].predicted_aligned_error[i].length; j++) {
                    arrPaeData.push({
                        x: i,
                        y: j,
                        value: paeData[0].predicted_aligned_error[i][j]
                    });
                }
            }
        }

        this.drawPaeHeatMap(arrPaeData);
    }

    transNewPaeFormatt(oldPaeData){
        let newPaeData = {
            max_predicted_aligned_error: oldPaeData.max_predicted_aligned_error,
        }
        let arrPae = [];
        let arrPaeDis = [];
        let oldVal = '';

        oldPaeData.residue1.map((val,idx) => {
            if (oldVal != val){
                if (idx > 0) arrPae.push(arrPaeDis);
                oldVal = val;
                arrPaeDis = [];
                arrPaeDis.push(oldPaeData.distance[idx]);
            } else {
                arrPaeDis.push(oldPaeData.distance[idx]);
            }
        });

        arrPae.push(arrPaeDis);
        newPaeData['predicted_aligned_error'] = arrPae;

        return [newPaeData];
    }

    drawPlddtLine(arrPlddtData, targetId) {
        this.targetId = targetId ? targetId : this.targetId
        const prdctnObj = this;

        Highcharts.chart(`${prdctnObj.targetId}Line`, {
            chart: {
                zoomType: 'x'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Predicted LDDT'
            },
            xAxis: {
                type: 'string',
                title: {
                    text: 'Residue'
                }
            },
            yAxis: {
                title: {
                    text: 'pLDDT'
                },
                max:100
            },
            legend: {
                enabled: false
            },

            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'pLDDT',
                data: arrPlddtData,
                events: {
                    click: e => {
                        if (this.isEvent) this.icn3dObj.icn3d.loadScriptCls.loadScript(this.makeIcn3dCmd('select', e.point.x));
                    }
                }
            }]
        });
    }

     drawPlddtCv2Line(arrPlddtData, arrPlddtCv2Data, icn3dObj, icn3dObjCv2, targetId,title1,title2) {
        this.targetId = targetId ? targetId : this.targetId
        const prdctnObj = this;

        const n1 = arrPlddtData.length, n2 = arrPlddtCv2Data.length, nMax = Math.max(n1, n2);
        const fillData = (showVar, showWild) => {
            const ov = [], exV = [], exW = [];
            for (let k = 0; k < nMax; k++) {
                const x = k + 1;
                const hasV = showVar && k < n1, hasW = showWild && k < n2;
                const v = hasV ? arrPlddtData[k][1] : 0;
                const w = hasW ? arrPlddtCv2Data[k][1] : 0;
                if (hasV && hasW) {
                    ov.push([x, Math.min(v, w)]);
                    exV.push([x, Math.max(v - w, 0)]);
                    exW.push([x, Math.max(w - v, 0)]);
                } else {
                    ov.push([x, 0]);
                    exV.push([x, v]);
                    exW.push([x, w]);
                }
            }
            return { ov, exV, exW };
        };
        const init = fillData(true, true);
        const fillOpt = (name, color, data) => ({
            name: name, type: 'area', stacking: 'normal', data: data,
            color: color, fillColor: (color.startsWith('rgb') ? color : plddtFill(color)), lineWidth: 0,
            marker: { enabled: false }, enableMouseTracking: false, showInLegend: false, label: { enabled: false }
        });

        const chart = Highcharts.chart(`${prdctnObj.targetId}Line`, {
            chart: {
                zoomType: 'x',
                type: 'line'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Predicted LDDT'
            },
            xAxis: {
                type: 'string',
                title: {
                    text: 'Residue'
                }
            },
            yAxis: {
                title: {
                    text: 'pLDDT'
                },
                max : 100
            },

            plotOptions: {
                line: {
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    }
                }
            },

            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },

            series:

            [fillOpt(title1 + ' only', PLDDT_COLORS.variant, init.exV),
             fillOpt(title2 + ' only', PLDDT_COLORS.wild, init.exW),
             fillOpt('overlap', plddtOverlapColor(PLDDT_COLORS.variant, PLDDT_COLORS.wild), init.ov),
            {
                name: title1,
                data: arrPlddtData,
                color: PLDDT_COLORS.variant,
                marker: { enabled: false },
                events: {
                    click: e => {
                        if (this.isEvent) icn3dObj.icn3d.loadScriptCls.loadScript(this.makeIcn3dCmd('select', e.point.x));
                    }
                }
            }].concat(n2 > 0 ? [{
                name: title2,
                data: arrPlddtCv2Data,
                color: PLDDT_COLORS.wild,
                marker: { enabled: false },
                events: {
                    click: e => {
                        if (this.isEvent) icn3dObjCv2.icn3d.loadScriptCls.loadScript(this.makeIcn3dCmd('select', e.point.x));
                    }
                }
            }] : [])
        });

        const refill = () => {
            const [exV, exW, ov, lv, lw] = chart.series;
            const d = fillData(lv.visible, lw ? lw.visible : false);
            ov.setData(d.ov, false); exV.setData(d.exV, false); exW.setData(d.exW, false);
            chart.redraw();
        };
        [chart.series[3], chart.series[4]].filter(Boolean).forEach(sr => sr.update({ events: { show: refill, hide: refill } }, false));
        chart.redraw();
        this.addDomainStrip(chart, title1);

        if (n2 > 0) this.addPlddtDiffToggle(chart, arrPlddtData, arrPlddtCv2Data, icn3dObj, title1, title2);
    }

    addDomainStrip(chart, geneLabel) {
        const gene = (String(geneLabel || '').match(/^[A-Za-z0-9]+/) || [''])[0];
        const segs = (typeof GENE_SEQUENCE_BAR !== 'undefined' && GENE_SEQUENCE_BAR[gene]) || null;
        if (!segs) return;
        const H = 7;
        const inner = (typeof GENE_SEGMENT_BAR !== 'undefined' && GENE_SEGMENT_BAR[gene]) || null;

        chart.xAxis[0].update({ labels: { y: 22 }, title: { margin: 14 } }, true);
        const draw = () => {
            if (chart._domStrip) chart._domStrip.destroy();
            const g = chart._domStrip = chart.renderer.g('domain-strip').attr({ zIndex: 3 }).add();
            const y = chart.plotTop + chart.plotHeight + 2;
            const x0 = chart.plotLeft, x1 = chart.plotLeft + chart.plotWidth;

            const rects = (list, opacityFor) => list.forEach(sg => {
                const a = Math.max(chart.xAxis[0].toPixels(sg[0], false), x0), b = Math.min(chart.xAxis[0].toPixels(sg[1] + 1, false), x1);
                if (b > a) chart.renderer.rect(a, y, b - a, H).attr({ fill: '#' + sg[3], opacity: opacityFor(sg), zIndex: 3 }).add(g);
            });
            rects(segs, sg => (inner && /^Domain/.test(sg[2])) ? 0.35 : 1);
            if (inner) rects(inner, () => 1);

            const vp = (typeof vratLc !== 'undefined') ? parseInt(vratLc, 10) : 0;
            if (vp > 0) {
                const px = chart.xAxis[0].toPixels(vp, false);
                if (px >= x0 && px <= x1) {
                    const vEl = document.getElementById('vratInfoLetter');
                    chart.renderer.path(['M', px, chart.plotTop, 'L', px, y + H]).attr({ stroke: '#111', 'stroke-width': 1.5, 'stroke-dasharray': '3,2', zIndex: 4 }).add(g);
                    chart.renderer.text(vEl ? vEl.value : String(vp), px + (px > (x0 + x1) / 2 ? -4 : 4), chart.plotTop + 12)
                        .attr({ 'text-anchor': px > (x0 + x1) / 2 ? 'end' : 'start', zIndex: 5 }).css({ fontSize: '11px', fontWeight: '700', color: '#111', textOutline: '2px #fff' }).add(g);
                }
            }
        };
        Highcharts.addEvent(chart, 'redraw', draw);
        draw();
    }

    addPlddtDiffToggle(chart, arrVar, arrWild, icn3dObj, title1, title2) {
        const lineEl = document.getElementById(`${this.targetId}Line`);
        if (!lineEl || document.getElementById(`${this.targetId}Diff`)) return;
        const diffEl = document.createElement('div');
        diffEl.id = `${this.targetId}Diff`;
        diffEl.style.cssText = 'width:100%;height:' + (lineEl.style.height || '350px') + ';float:left;display:none;';
        lineEl.parentNode.insertBefore(diffEl, lineEl.nextSibling);

        const n = Math.min(arrVar.length, arrWild.length);
        const diff = [];
        for (let k = 0; k < n; k++) diff.push([k + 1, Math.round((arrVar[k][1] - arrWild[k][1]) * 100) / 100]);

        const bar = document.createElement('div');
        bar.className = 'noprint';
        bar.style.cssText = 'position:absolute;top:6px;left:8px;z-index:5;';
        lineEl.parentNode.style.position = 'relative';
        const mk = (label, key) => {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = label; b.dataset.view = key;
            b.style.cssText = 'font-size:12px;font-weight:600;padding:3px 10px;margin-right:4px;border:1px solid #0068b9;border-radius:4px;cursor:pointer;';
            return b;
        };

        chart.update({ chart: { spacingTop: 38 }, title: { y: 34 } }, true);
        const bLine = mk('pLDDT', 'line'), bDiff = mk('Δ pLDDT', 'diff');
        bar.appendChild(bLine); bar.appendChild(bDiff);

        const RM = {
            rmsd: {
                btn: 'RMSD (Å)', color: '#7a4fd1', yTitle: 'Distance (Å)', min: 0, unit: ' Å',
                title: 'Per-residue Cα displacement (' + title1 + ' vs ' + title2 + ')',
                data: d => d.dist,
                note: d => '<b>RMSD (Å)</b> – per-residue Cα displacement between the predicted wild-type and variant structures (ranked_0). ' +
                    'The two models are superposed (Kabsch) on the residues that are helix or β-strand in both models (DSSP) and have pLDDT ≥ 70 in both (' + d.n_ss + ' residues); ' +
                    'the distance between the Cα atoms of each residue is then plotted. Large values in low-confidence loops and linkers mostly reflect run-to-run variability of the prediction rather than an effect of the variant.'
            }
        };
        const rmKeys = window.getRmsd ? ['rmsd'] : [];
        rmKeys.forEach(k => { RM[k].btnEl = mk(RM[k].btn, k); bar.appendChild(RM[k].btnEl); });
        lineEl.parentNode.insertBefore(bar, lineEl);

        let diffChart = null;

        const rmWrap = {};
        let anchor = diffEl;
        rmKeys.forEach(k => {
            const w = document.createElement('div');
            w.id = `${this.targetId}${k}`;
            w.style.cssText = 'width:100%;float:left;display:none;';
            w.innerHTML = '<div class="rm-chart" style="width:100%;height:' + (lineEl.style.height || '350px') + ';"></div><div class="rm-note" style="font-size:12.5px;line-height:1.55;color:#444;padding:8px 14px 12px;"></div>';
            lineEl.parentNode.insertBefore(w, anchor.nextSibling);
            anchor = w;
            rmWrap[k] = { el: w, chart: null };
        });
        const showRm = (k) => {
            const slot = rmWrap[k], spec = RM[k];
            if (slot.chart || slot.loading) return;
            slot.loading = true;
            window.getRmsd().then(d => {
                slot.loading = false;
                const noteEl = slot.el.querySelector('.rm-note');
                const holder = slot.el.querySelector('.rm-chart');
                if (!d) { holder.textContent = 'RMSD data not available.'; return; }
                const vals = spec.data(d);
                if (!vals) {
                    holder.innerHTML = '<div style="padding:60px 20px;text-align:center;color:#666;">The gene-wide baseline needs at least ' + d.baseline_min + ' variant structures of ' + geneNm +
                        ' (currently ' + d.baseline_n + '), so this chart is not available for this gene.</div>';
                    noteEl.innerHTML = '';
                    return;
                }
                const pts = d.residues.map((r, i) => [r, vals[i]]);
                const yAxis = { title: { text: spec.yTitle } };
                if (spec.min !== undefined) yAxis.min = spec.min;
                if (spec.zline) yAxis.softMax = 3.5;
                if (spec.zline) yAxis.plotLines = [{ value: 0, color: '#888', width: 1, zIndex: 3 }, { value: 3, color: '#c0392b', width: 1, dashStyle: 'Dash', zIndex: 3 }];
                slot.chart = Highcharts.chart(holder, {
                    chart: { zoomType: 'x', type: 'area', spacingTop: 38 },
                    credits: { enabled: false },
                    title: { text: spec.title, y: 34 },
                    xAxis: { title: { text: 'Residue' } },
                    yAxis: yAxis,
                    legend: { enabled: false },
                    tooltip: { pointFormat: spec.yTitle.split(' ')[0] + ': <b>{point.y:.2f}' + spec.unit + '</b>' },
                    plotOptions: { area: { lineWidth: 1, marker: { enabled: false }, fillOpacity: 0.3, threshold: spec.zline ? 0 : undefined }, series: { label: { enabled: false } } },
                    series: [{ name: spec.btn, color: spec.color, data: pts,
                        events: { click: e => { if (this.isEvent) icn3dObj.icn3d.loadScriptCls.loadScript(this.makeIcn3dCmd('select', e.point.x)); } } }]
                });
                noteEl.innerHTML = spec.note(d);
                this.addDomainStrip(slot.chart, title1);
                slot.chart.reflow();
            });
        };
        const show = (view) => {
            const isDiff = view === 'diff', isRm = rmKeys.indexOf(view) >= 0;
            lineEl.style.display = (isDiff || isRm) ? 'none' : '';
            diffEl.style.display = isDiff ? '' : 'none';
            rmKeys.forEach(k => { rmWrap[k].el.style.display = (view === k) ? '' : 'none'; });
            if (isRm) showRm(view);
            [[bLine, view === 'line'], [bDiff, isDiff]].concat(rmKeys.map(k => [RM[k].btnEl, view === k])).forEach(([b, on]) => {
                b.style.background = on ? '#1993f2' : '#fff'; b.style.color = on ? '#fff' : '#1993f2';
            });
            if (isDiff && !diffChart) {
                const ext = Math.max(5, Math.ceil(Math.max(...diff.map(d => Math.abs(d[1]))) / 5) * 5);
                diffChart = Highcharts.chart(diffEl.id, {
                    chart: { zoomType: 'x', type: 'area', spacingTop: 38 },
                    credits: { enabled: false },
                    title: { text: 'pLDDT difference (' + title1 + ' − ' + title2 + ')', y: 34 },
                    xAxis: { title: { text: 'Residue' } },
                    yAxis: { title: { text: 'Δ pLDDT' }, min: -ext, max: ext, plotLines: [{ value: 0, color: '#888', width: 1, zIndex: 3 }] },
                    legend: { enabled: false },
                    tooltip: { pointFormat: 'Δ pLDDT: <b>{point.y:.1f}</b>' },
                    plotOptions: { area: { threshold: 0, lineWidth: 1, marker: { enabled: false }, fillOpacity: 0.35 }, series: { label: { enabled: false } } },
                    series: [{
                        name: 'Δ pLDDT', data: diff,
                        zones: [{ value: 0, color: PLDDT_COLORS.wild }, { color: PLDDT_COLORS.variant }],
                        events: { click: e => { if (this.isEvent) icn3dObj.icn3d.loadScriptCls.loadScript(this.makeIcn3dCmd('select', e.point.x)); } }
                    }]
                });
            }
            if (isDiff && diffChart && !diffChart._domStrip) this.addDomainStrip(diffChart, title1);
            if (isDiff && diffChart) diffChart.reflow();
            if (view === 'line') chart.reflow();
            if (isRm && rmWrap[view].chart) rmWrap[view].chart.reflow();
        };
        bLine.onclick = () => show('line');
        bDiff.onclick = () => show('diff');
        rmKeys.forEach(k => { RM[k].btnEl.onclick = () => show(k); });
        show('line');
    }

    drawPlddtBoxplot(arrPlddtData,  targetId) {
        this.targetId = targetId ? targetId : this.targetId
        const prdctnObj = this;
        let arrData = [];
        let arrBoxplot = [];
        [...arrPlddtData].forEach(data => arrData.push(data[1]));

        const cmmMath = new CommonMath(arrData);
        //q1, q3, iqr
        const q1 = cmmMath.q1(arrData);
        const q3 = cmmMath.q3(arrData);
        const iqr = q3 - q1;
        const maximun = Math.max(...arrData.filter(d => d <= q3 + 1.5*iqr));
        const minimun = Math.min(...arrData.filter(d => d >= q1 - 1.5*iqr));

        arrBoxplot.push(minimun);      //minimum
        arrBoxplot.push(q1);    //q1
        arrBoxplot.push(cmmMath.median(arrData));   //q2, median
        arrBoxplot.push(q3);    //q3
        arrBoxplot.push(maximun);  //maximun

        let arrOutliers = [];
        arrData.forEach( data => {
            if (data > maximun || data < minimun) arrOutliers.push([0,data]);
        })

        Highcharts.chart(`${prdctnObj.targetId}Boxplot`, {
            chart: {
                type: 'boxplot'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'pLDDT box-plot'
            },

            legend: {
                enabled: false
            },

            xAxis: {

            },

            yAxis: {
                min: 0, max: 100,
                title: {
                    text: 'pLDDT'
                },
            },

            series: [{
                name: 'Observations',
                data: [
                    arrBoxplot,
                ],
                tooltip: {
                    headerFormat: '<em>Experiment No {point.key}</em><br/>'
                }
            }, {
                name: 'Outliers',
                color: Highcharts.getOptions().colors[0],
                type: 'scatter',
                data: arrOutliers,
                marker: {
                    fillColor: 'white',
                    lineWidth: 1,
                    lineColor: Highcharts.getOptions().colors[0]
                },
                tooltip: {
                    pointFormat: 'Observation: {point.y}'
                }
            }]
        });
    }

     drawPlddtCv2Boxplot(arrPlddtData, arrPlddtCv2Data, targetId,title1,title2) {
        this.targetId = targetId ? targetId : this.targetId
        const prdctnObj = this;
        let arrData = [], arrDataCv2 = [];
        let arrBoxplot = [], arrBoxplotCv2 = [];
        [...arrPlddtData].forEach(data => arrData.push(data[1]));

        const cmmMath = new CommonMath(arrData);
        //q1, q3, iqr
        const q1 = cmmMath.q1(arrData);
        const q3 = cmmMath.q3(arrData);
        const iqr = q3 - q1;
        const maximun = Math.max(...arrData.filter(d => d <= q3 + 1.5*iqr));
        const minimun = Math.min(...arrData.filter(d => d >= q1 - 1.5*iqr));

        arrBoxplot.push(minimun);      //minimum
        arrBoxplot.push(q1);    //q1
        arrBoxplot.push(cmmMath.median(arrData));   //q2, median
        arrBoxplot.push(q3);    //q3
        arrBoxplot.push(maximun);  //maximun

        [...arrPlddtCv2Data].forEach(data => arrDataCv2.push(data[1]));

        const cmmMathCv2 = new CommonMath(arrDataCv2);
        //q1, q3, iqr
        const q1Cv2 = cmmMathCv2.q1(arrDataCv2);
        const q3Cv2 = cmmMathCv2.q3(arrDataCv2);
        const iqrCv2 = q3Cv2 - q1Cv2;
        const maximunCv2 = Math.max(...arrDataCv2.filter(d => d <= q3Cv2 + 1.5*iqrCv2));
        const minimunCv2 = Math.min(...arrDataCv2.filter(d => d >= q1Cv2 - 1.5*iqrCv2));

        arrBoxplotCv2.push(minimunCv2);      //minimum
        arrBoxplotCv2.push(q1Cv2);    //q1
        arrBoxplotCv2.push(cmmMathCv2.median(arrDataCv2));   //q2, median
        arrBoxplotCv2.push(q3Cv2);    //q3
        arrBoxplotCv2.push(maximunCv2);  //maximun

        let arrOutliers = [], arrOutliersCv2 = [];
        arrData.forEach( data => {
            if (data > maximun || data < minimun) arrOutliers.push([0,data]);
        })

        arrDataCv2.forEach( data => {
            if (data > maximunCv2 || data < minimunCv2) arrOutliersCv2.push([1,data]);
        })

        Highcharts.chart(`${prdctnObj.targetId}Boxplot1`, {
            chart: {
                type: 'boxplot'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'box-plot'
            },

            legend: {
                enabled: false
            },

            xAxis: {
                categories : [title1]
            },

            yAxis: {
                min: 0, max: 100,
                title: {
                    text: 'pLDDT'
                },
            },

            series: [
                {
                name: 'User type',
                color: Highcharts.getOptions().colors[0],
                data: [
                    arrBoxplot,
                ],
                tooltip: {
                    headerFormat: ''
                }
            },
            {
                name: 'Outliers',
                color: Highcharts.getOptions().colors[0],
                type: 'scatter',
                data: arrOutliers,
                marker: {
                    fillColor: 'white',
                    lineWidth: 1,
                    lineColor: Highcharts.getOptions().colors[0]
                },
                tooltip: {
                    pointFormat: 'Observation: {point.y}'
                }
            }]
        });

        Highcharts.chart(`${prdctnObj.targetId}Boxplot2`, {
            chart: {
                type: 'boxplot'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'box-plot'
            },

            legend: {
                enabled: false
            },

            xAxis: {
                categories : [title2]
            },

            yAxis: {
                min: 0, max: 100,
                title: {
                    text: 'pLDDT'
                },
            },

            series: [
                {
                name: 'User type',
                color: Highcharts.getOptions().colors[1],
                data: [arrBoxplotCv2],
                tooltip: {
                    headerFormat: ''
                }
            },
            {
                name: 'Outliers',
                color: Highcharts.getOptions().colors[1],
                type: 'scatter',
                data: arrOutliersCv2,
                marker: {
                    fillColor: 'white',
                    lineWidth: 1,
                    lineColor: Highcharts.getOptions().colors[0]
                },
                tooltip: {
                    pointFormat: 'Observation: {point.y}'
                }
            }]
        });
    }

    async drawPlddt(plddtPath, icn3dObj, targetId, fileType) {
        this.icn3dObj = icn3dObj;
        this.targetId = targetId ? targetId : this.targetId

        async function getPlddtData() {
            const response = await fetch(
                decodeURIComponent(`/filedownload?file_name=${plddtPath}&file_type=${fileType}`)
            );
            return response.text();
        }

        const data = await getPlddtData();
        if (data != '') {
            let tmpCols, arrPlddtData = [];
            const tmpRows = data.split('\n');

            tmpRows.forEach((rows, idx) => {
                tmpCols = rows.split(',');
                if (idx > 0) {
                    tmpCols[0] = Number(tmpCols[0]);
                    tmpCols[1] = Number(tmpCols[1]);
                    arrPlddtData.push(tmpCols);
                }

            });

            this.drawPlddtLine(arrPlddtData);
            this.drawPlddtBoxplot(arrPlddtData);

            return data;
        } else {
            return '';
        }
    }

     async drawPlddtCv2(plddtPath1, plddtPath2, icn3dObj, icn3dObjCv2, targetId, fileType1, fileType2) {
        this.icn3dObj = icn3dObj;
        this.targetId = targetId ? targetId : this.targetId
        async function getPlddtData(plddtPath, fileType) {
            const response = await fetch(
                decodeURIComponent(`/filedownload?file_name=${plddtPath}&file_type=${fileType}`)
            );
            return response.text();
        }

        const data1 = await getPlddtData(plddtPath1, fileType1);
        const data2 = await getPlddtData(plddtPath2, fileType2);

        const parsePlddt = (txt) => {
            const out = [];
            String(txt || '').split(String.fromCharCode(10)).forEach((row, idx) => {
                if (idx > 0 && row.trim() !== '') {
                    const v = Number(row.trim());
                    if (Number.isFinite(v)) { out.push([out.length + 1, v]); }
                }
            });
            return out;
        };
        const arrPlddtData = parsePlddt(data1);

        const arrPlddtCv2Data = parsePlddt(data2);

        if (arrPlddtData.length > 0) {
            this.drawPlddtCv2Line(arrPlddtData, arrPlddtCv2Data,icn3dObj, icn3dObjCv2,null,fileType1,fileType2);

            return data1;
        } else {
            return '';
        }
    }

    drawPlddtAiveLocal(plddtData, icn3dObj, targetId) {
        this.icn3dObj = icn3dObj;
        this.targetId = targetId ? targetId : this.targetId

        if (plddtData != '') {
            let tmpCols, arrPlddtData = [];
            const tmpRows = plddtData.split('\n');

            tmpRows.forEach((rows, idx) => {
                tmpCols = rows.split(',');
                if (idx > 0) {
                    tmpCols[0] = Number(tmpCols[0]);
                    tmpCols[1] = Number(tmpCols[1]);
                    arrPlddtData.push(tmpCols);
                }

            });

            this.drawPlddtLine(arrPlddtData);
            this.drawPlddtBoxplot(arrPlddtData);
        } else {
            console.log('No Data');
        }
    }

     drawPlddtColabLocal(pdb, icn3dObj, targetId) {
        this.icn3dObj = icn3dObj;
        this.targetId = targetId ? targetId : this.targetId;

        const tmpPdb = pdb.split('\n');

        let arrPlddtData = [];
        let plddtNo = 0;
        let oldNo = '';
        tmpPdb.map(pdbLine => {
            let aaNo = pdbLine.slice(22,26).trim();
            let plddtVal = pdbLine.slice(61,66).trim();

            if (oldNo != aaNo){
                oldNo = aaNo;
                if (plddtVal) arrPlddtData.push([plddtNo++, Number(plddtVal)])
            }
        });

        this.drawPlddtLine(arrPlddtData);
        this.drawPlddtBoxplot(arrPlddtData);
    }

    drawBaeApess(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;
        Highcharts.chart(this.targetId, {
            title: {
                text: 'PPX4, PPX5, BLCR, CPES, APESS'
            },
            credits: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: 'Values'
                }
            },
            xAxis: {
                type: 'string'
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 0
                }
            },

            series: [{
                name: 'PPX4',
                data: apess.ppx4
            }, {
                name: 'PPX5',
                data: apess.ppx5
            }, {
                name: 'BLCR',
                data: apess.blcr
            }, {
                name: 'CPES',
                data: apess.cpes
            }, {
                name: 'APESS',
                data: apess.apess
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }

    drawReferenceBpesMr(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;

        Highcharts.chart(this.targetId, {
            chart: {
                zoomType: 'xy'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '',
                align: 'center'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'string'
            },
            yAxis: [{ // Primary yAxis

                title: {
                    text: 'mr',
                    style: {
                        color: '#FF007F'
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: '#FF007F'
                    }
                },
                opposite: true

            }, { // Secondary yAxis
                title: {
                    text: 'bpes',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }

            }],

            tooltip: {
                shared: true
            },
            legend: {
                align: 'center',
                verticalAlign: 'top',
                y : 0,
                floating: true,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)'
            },
            series: [{
                name: 'bpes',
                type: 'column',
                yAxis: 1,
                data: apess.bpes_input

            }, {
                name: 'mr',
                type: '',
                color: '#FF007F',
                data: apess.mr_input
            }]
        });

    }

    drawMutationBpesMr(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;

        Highcharts.chart(this.targetId, {
            chart: {
                zoomType: 'xy'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '',
                align: 'center'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'string'
            },
            yAxis: [{ // Primary yAxis

                title: {
                    text: 'mr',
                    style: {
                        color: '#FF007F'
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: '#FF007F'
                    }
                },
                opposite: true

            }, { // Secondary yAxis
                title: {
                    text: 'bpes',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }

            }],
            tooltip: {
                shared: true
            },
            legend: {
                align: 'left',
                x: 80,
                verticalAlign: 'top',
                y: 20,
                floating: true,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)'
            },
            series: [{
                name: 'bpes Mutation',
                type: 'column',
                yAxis: 1,
                data: apess.bpes_output

            }, {
                name: 'mr Mutation',
                type: '',
                color: '#FF007F',
                data: apess.mr_output
            }]
        });

    }

    /*drawPsScps(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;
        Highcharts.chart(this.targetId, {
            title: {
                text: ''
            },

            yAxis: {
                title: {
                    enabled: false
                },
                labels: {
                    formatter: function () {
                        let tmpTxt = '';
                        if (this.value == 0) tmpTxt = 'W/O'
                        else if (this.value == 1) tmpTxt = 'W'
                        return tmpTxt;
                    }
                }
            },

            xAxis: {
                type: 'string'
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2
                    },
                    labels:{
                        enalbed: false
                    }
                }
            },

            series: [ {
                label: false,
                type: 'area',
                step: 'left',
                color: '#CAE1BB',
                name: 'PS',
                data: apess.ps,
            },
            {
                label: false,
                type: 'area',
                step: 'left',
                color: '#F7C5BE',
                name: 'SCPS',
                data: apess.scps,
            }],

        });
    }*/

    drawPsScps(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;
        Highcharts.chart(this.targetId, {
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            yAxis: [{
                min: 0,
                title: {
                    text: 'pcs'
                },
                reversed: true
            }, {
                title: {
                    text: 'scps',
                },
                opposite: true,
                reversed: true
            }],
            legend: {
                shadow: false
            },
            tooltip: {
                shared: true
            },
            plotOptions: {
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'pcs',
                color: 'rgba(0, 234, 255, 0.75)',
                data: apess.ps,
            }, {
                name: 'scps',
                color: 'rgba(254, 154, 46, 0.75)',
                data: apess.scps,
                yAxis: 1
            },]
        });

    }

    drawBpes(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;
        Highcharts.chart(this.targetId, {
            chart: {
                type: 'area',
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },

            yAxis: {
                labels: {
                    format: '{value:.2f}'
                  },
                title: {
                    useHTML : true,
                    text: 'bpes (x10<sup>-6</sup>)'
                }
            },
            xAxis: {
                type: 'string'
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2
                    },
                }
            },

            series: [{
                label: false,
                name: 'Mutation',
                data: apess.bpes_output,
                color: '#C2BFFC',
                fillOpacity: 1.0
            }, {
                label: false,
                name: 'Reference',
                data: apess.bpes_input,
                color: '#D08EA4',
                fillOpacity: 0.3
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }

    drawMr(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;
        Highcharts.chart(this.targetId, {
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            yAxis: {
                labels: {
                    format: '{value:.2f}'
                  },
                title: {
                    useHTML : true,
                    text: 'mr (x10<sup>-8</sup>)'

                }
            },
            xAxis: {
                type: 'string'
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2
                    },
                }
            },

            series: [{
                label: false,
                type : 'area',
                name: 'Mutation',
                data: apess.mr_output,
                color: '#704876',
                fillOpacity: 0.9
            }, {
                label: false,
                type : 'area',
                name: 'Reference',
                data: apess.mr_input,
                color: '#EE9CD9',
                fillOpacity: 0.3
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }

    drawBlcrCpes(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;
        Highcharts.chart(this.targetId, {
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: 'Values'
                }
            },
            xAxis: {
                type: 'string'
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 0
                }
            },

            series: [{
                name: 'BLCR',
                data: apess.blcr
            }, {
                name: 'CPES',
                data: apess.cpes
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }

    drawApess(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;

        let input_virus_seq_1 = $('#input_virus_seq_1').val();
        let output_virus_seq_1 = $('#output_virus_seq_1').val();
        let trget_seq_rgin_st_lc = $('#trget_seq_rgin_st_lc').val();

        Highcharts.chart(this.targetId, {
            chart: {
                zoomType: 'xy'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '',
                align: 'center'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'string'
            },
            yAxis: [{
                title: {
                    text: '' ,
                },
                labels: {
                    format: '{value}'
                }

            }],
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        //format: '{point.y:.3f}'
                        formatter: function (){
                            if(this.y != 0){
                                return input_virus_seq_1.substring(this.x,this.x+1)+(Number(this.x)+Number(trget_seq_rgin_st_lc))+output_virus_seq_1.substring(this.x,this.x+1)+"</br>"+this.y.toFixed(3);
                            }
                        }
                    }
                }
            },
            tooltip: {
                shared: true
            },

            series: [{
                label: false,
                color:'#FF0000',
                type: 'column',
                name: 'Mutation',
                data: apess.apess
            }]

        });

        /*this.targetId = targetId ? targetId : this.targetId;
        Highcharts.chart(this.targetId, {
            title: {
                text: ''
            },

            yAxis: {
                labels: {
                    format: '{value:.2f}'
                  },
                title: {
                    useHTML : true,
                    text: 'APESS (x10<sup>-4</sup>)'
                }
            },
            xAxis: {
                type: 'string'
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2
                    },
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 0
                }
            },

            series: [{
                label: false,
                color:'#FF0000',
                type: 'area',
                name: 'Mutation',
                data: apess.apess
            },{
                lineWidth: 10,
                opacity: 0.5,
                type: 'area',
                name: 'Reference',
                data: apess.apess_wild
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });*/
    }

    drawApessDist(apess, targetId){
        this.targetId = targetId ? targetId : this.targetId;

        this.apessDistConf

        let apess_sum = apess.apess.reduce((sum, currVal) => {
            return sum + currVal;
        });

        //apess_sum = apess_sum/10;
        apess_sum = apess_sum;

        this.apessDistConf.series.push(
            {
                type: 'flags',
                shape: 'flag',
                name: 'Highcharts',
                color: '#FF0000',
                fillColor: '#FF0000',
                width: 100,
                style: { // text style
                    color: 'white'
                },
                y:-250,
                data: [
                    { x: apess_sum , text: 'Mutation', title: 'Mutation'},
                ],
                showInLegend: false
            },
            {
                label: false,
                name: 'G1',
                data: apess.apess_dist.g1Coord
            },
            {
                label: false,
                name: 'G2',
                data: apess.apess_dist.g2Coord
            },
            {
                label: false,
                name: 'G3',
                data: apess.apess_dist.g3Coord
            },
            {
                label: false,
                name: 'G4',
                data: apess.apess_dist.g4Coord
            },
        );

        if (apess_sum <= 3.2){

            this.apessDistConf.series.push(
                {
                    type: 'flags',
                    name: 'Highcharts',
                    color: '#333333',
                    shape: 'circlepin',
                    y:-30,
                    data: [
                        { x: -0.001312558, text: 'Alpha', title: 'Alpha' },
                        { x: 1.949547146, text: 'BA1', title: 'BA1' },
                        { x: 1.640392388, text: 'Delta', title: 'Delta' },
                        { x: 2.153744188, text: 'BA.5', title: 'BA.5' },
                    ],
                    showInLegend: false
                },
                {
                    type: 'flags',
                    name: 'Highcharts',
                    color: '#333333',
                    shape: 'circlepin',
                    y:-60,
                    data: [
                        { x: 2.052704741, text: 'BA2', title: 'BA2' },
                    ],
                    showInLegend: false
                },
                {
                    type: 'flags',
                    name: 'Highcharts',
                    color: '#333333',
                    shape: 'circlepin',
                    y:-90,
                    data: [
                        { x: 2.153744188, text: 'BA.4', title: 'BA.4' },
                        { x: 0.006397999,  text: 'Beta', title: 'Beta' },
                    ],
                    showInLegend: false
                },
                {
                    type: 'flags',
                    name: 'Highcharts',
                    color: '#333333',
                    shape: 'circlepin',
                    y:-120,
                    data: [
                        { x: 1.982796105, text: 'XBB', title: 'XBB' },
                    ],
                    showInLegend: false
                },
                {
                    type: 'flags',
                    name: 'Highcharts',
                    color: '#333333',
                    shape: 'circlepin',
                    y:-150,
                    data: [
                        { x: 2.079979966,  text: 'BQ.1', title: 'BQ.1' },
                    ],
                    showInLegend: false
                },
                {
                    type: 'flags',
                    name: 'Highcharts',
                    color: '#333333',
                    shape: 'circlepin',
                    y:-180,
                    data: [
                        { x: 1.926751413, text: 'BA.2.75', title: 'BA.2.75' },
                    ],
                    showInLegend: false
                },
            );

            this.apessDistConf.xAxis['min'] = -2;
            this.apessDistConf.xAxis['max'] = 3.5;

        } else {

            this.apessDistConf.series.push(
                {
                    label: false,
                    name: 'G5',
                    data: apess.apess_dist.g5Coord
                },
            );

            this.apessDistConf.xAxis['min'] = 3.2;
            this.apessDistConf.xAxis['max'] = 4.45;
        }

        Highcharts.chart(this.targetId, this.apessDistConf);

        return apess_sum;
    }

    drawPolarityInfo(polarity, targetId){
        this.targetId = targetId ? targetId : this.targetId;

        var polarityTmpX = Object.keys(polarity.dicInputPolar);
        var inputPolarityTmpY = Object.values(polarity.dicOutputPolar);
        var outputPolarityTmpY = Object.values(polarity.dicInputPolar);

        polarityTmpX.pop();
        inputPolarityTmpY.pop();
        outputPolarityTmpY.pop();

        Highcharts.chart(this.targetId, {

            title: {
                text: '',
                align: 'center'
            },
            credits: {
                enabled: false
            },
            subtitle: {
                text: '',
                align: 'left'
            },

            yAxis: {
                title: {
                    text: ''
                }
            },

            xAxis: {
                categories: polarityTmpX
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },

            series: [{
                name: 'Mutation',
                data: inputPolarityTmpY
            },{
                name: 'Reference',
                data: outputPolarityTmpY
            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        });
    }

}

