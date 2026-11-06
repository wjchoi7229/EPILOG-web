

const buildDomainCommand = function(geneNm, variantPos) {
    const info = (typeof GENE_DOMAIN_COLORS !== 'undefined') ? GENE_DOMAIN_COLORS[geneNm] : undefined;
    if (!info) return 'color spectrum;';

    let cmd = 'set thickness | linerad 0.25 | tracerad 0.5;color #2B2B2B;';
    info.segments.forEach(([start, end, name, hex]) => {
        cmd += `select .A:${start}-${end};color #${hex};`;
    });

    if (variantPos) cmd += buildVariantHighlightCommand(variantPos);
    return cmd;
};

const buildVariantHighlightCommand = function(variantPos) {

    let cmd = `select .A:${variantPos};color #39FF14;style proteins stick;`;

    const lo = variantPos - 1, hi = Number(variantPos) + 1;
    cmd += `select .A:${lo}-${hi};style proteins sphere;color #39FF14;`;
    return cmd;
};

const renderSequenceBar = function(containerId, geneNm) {
    const bar = (typeof GENE_SEQUENCE_BAR !== 'undefined') ? GENE_SEQUENCE_BAR[geneNm] : undefined;
    const len = (typeof GENE_PROTEIN_LENGTH !== 'undefined') ? GENE_PROTEIN_LENGTH[geneNm] : undefined;
    const container = document.getElementById(containerId);
    if (!container || !bar || !len) return;

    const pct = (n) => (n / len * 100).toFixed(3) + '%';

    const ROWS = 3;
    const ROW_H = 14;
    const barTop = 34, barH = 20;

    const segs = (typeof GENE_SEGMENT_BAR !== 'undefined') ? GENE_SEGMENT_BAR[geneNm] : undefined;
    const segTop = barTop + barH + 2, segH = 12;
    const posTop = barTop + barH + (segs ? segH + 6 : 4);
    const widthPx = container.clientWidth || 1150;
    const rowOf = [];
    const rowRight = [];
    bar.forEach(([start, end]) => {
        const half = (`${start}-${end}`.length * 5.6) / 2 + 4;
        const center = ((start + end) / 2) / len * widthPx;
        let r = 0;
        while (r < ROWS - 1 && rowRight[r] !== undefined && center - half < rowRight[r]) r++;
        rowRight[r] = center + half;
        rowOf.push(r);
    });
    const usedRows = Math.max(...rowOf) + 1;
    const totalH = posTop + usedRows * ROW_H + 4;

    let html = `<div style="font-size:16px;font-weight:700;margin-bottom:4px;">${geneNm} sequence &amp; domains (click a domain to highlight it in the structures)</div>`;
    html += `<div style="position:relative;height:${totalH}px;margin:4px 4px 4px 4px;">`;

    html += `<div style="position:absolute;left:0;right:0;top:${barTop + barH / 2 - 2}px;height:4px;background:#ccc;border-radius:2px;"></div>`;
    html += `<div style="position:absolute;left:0;top:${barTop - 14}px;font-size:11px;color:#666;">1</div>`;
    html += `<div style="position:absolute;right:0;top:${barTop - 14}px;font-size:11px;color:#666;">${len}</div>`;
    bar.forEach(([start, end, label, hex], i) => {
        html += `<div class="seqbar-domain" data-start="${start}" data-end="${end}"
            style="position:absolute;left:${pct(start)};width:${pct(end - start)};top:${barTop}px;height:${barH}px;
            background:#${hex};border-radius:3px;cursor:pointer;display:flex;align-items:center;justify-content:center;
            color:#fff;font-size:10px;font-weight:600;overflow:hidden;white-space:nowrap;box-shadow:0 0 0 1px rgba(0,0,0,0.15);"
            title="${label} (${start}-${end})">${label}</div>`;
        const rowTop = posTop + rowOf[i] * ROW_H;

        html += `<div style="position:absolute;left:${pct(start)};width:${pct(end - start)};top:${rowTop}px;
            font-size:10px;color:#666;text-align:center;white-space:nowrap;">${start}-${end}</div>`;
    });
    if (segs) {
        segs.forEach(([start, end, label, hex, full]) => {
            html += `<div class="seqbar-domain" data-start="${start}" data-end="${end}"
                style="position:absolute;left:${pct(start)};width:${pct(end - start + 1)};top:${segTop}px;height:${segH}px;
                background:#${hex};cursor:pointer;box-shadow:0 0 0 0.5px rgba(0,0,0,0.35);"
                title="${full || label} (${start}-${end})"></div>`;
        });
    }

    const vpos = (typeof vratLc !== 'undefined') ? parseInt(vratLc, 10) : 0;
    const vEl = document.getElementById('vratInfoLetter');
    const vName = vEl ? vEl.value : '';
    if (vpos > 0 && vpos <= len) {
        const left = ((vpos - 0.5) / len * 100).toFixed(3) + '%';
        html += `<div title="${vName} (position ${vpos})" style="position:absolute;left:${left};top:${barTop - 5}px;height:${posTop - barTop + 3}px;width:0;border-left:2px solid #111;z-index:4;pointer-events:none;"></div>`;
        html += `<div style="position:absolute;left:${left};top:${barTop - 12}px;margin-left:-5px;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid #111;z-index:4;pointer-events:none;"></div>`;
        html += `<div style="position:absolute;left:${left};top:3px;transform:translateX(-50%);font-size:11px;font-weight:700;color:#111;white-space:nowrap;z-index:4;pointer-events:none;">${vName}</div>`;
    }
    html += `</div>`;
    if (segs) {
        const chip = (c, n) => `<span style="display:inline-block;width:10px;height:10px;background:#${c};margin:0 3px 0 10px;box-shadow:0 0 0 0.5px rgba(0,0,0,0.35);"></span>${n}`;
        html += `<div style="font-size:11px;color:#555;margin:0 4px 2px;">Segments (UniProt): ${chip('0000FF','S1')}${chip('FFFF00','S2')}${chip('00CCFF','S3')}${chip('FF6600','S4')}${chip('CC00FF','S5')}${chip('FF0000','Pore')}${chip('00FFCC','S6')}<span style="margin-left:14px;">▼ variant position</span></div>`;
    } else if (vpos > 0) {
        html += `<div style="font-size:11px;color:#555;margin:0 4px 2px;">▼ variant position</div>`;
    }
    html += `<div id="divRmsd" style="margin-top:10px;padding:14px 18px;background:#fff;font-size:14px;line-height:1.6;color:#333;"></div>`;
    html += `<div style="margin-top:4px;"><a href="javascript:void(0);" onclick="clearDomainHighlight('${geneNm}')" style="font-size:12px;color:#0563C1;">Reset highlight</a></div>`;
    container.innerHTML = html;
    if (window.fillRmsd) window.fillRmsd();

    container.querySelectorAll('.seqbar-domain').forEach((el) => {
        el.addEventListener('click', () => {
            highlightDomainOnStructures(geneNm, parseInt(el.dataset.start, 10), parseInt(el.dataset.end, 10));
        });
    });
};

let _lastDomainHighlight = null; // {gene, start, end}

const buildRestoreCommand = function(geneNm, start, end) {
    const info = (typeof GENE_DOMAIN_COLORS !== 'undefined') ? GENE_DOMAIN_COLORS[geneNm] : undefined;
    let cmd = `select .A:${start}-${end};color #2B2B2B;`;
    if (info) {
        info.segments.forEach(([s, e, name, hex]) => {
            if (s >= start && e <= end) cmd += `select .A:${s}-${e};color #${hex};`;
        });
    }
    return cmd;
};

const DOMAIN_HIGHLIGHT_COLOR = 'FF0066';

const highlightDomainOnStructures = function(geneNm, start, end) {
    let cmd = '';
    if (_lastDomainHighlight) {
        cmd += buildRestoreCommand(_lastDomainHighlight.gene, _lastDomainHighlight.start, _lastDomainHighlight.end);
    }
    cmd += `select .A:${start}-${end};color #${DOMAIN_HIGHLIGHT_COLOR};zoom selection;`;
    _lastDomainHighlight = { gene: geneNm, start: start, end: end };

    Object.keys(_arrIcn3d).forEach((divid) => {
        const obj = _arrIcn3d[divid];
        if (!obj || !obj.icn3d || !obj.icn3d.loadScriptCls) return;
        let fullCmd = cmd;

        if (divid.indexOf('MUT') !== -1 && typeof vratLc !== 'undefined' && vratLc) {
            fullCmd += buildVariantHighlightCommand(vratLc);
        }

        obj.icn3d.loadScriptCls.loadScript(fullCmd, undefined, true);
    });
};

const clearDomainHighlight = function(geneNm) {
    if (!_lastDomainHighlight) return;
    const cmd = buildRestoreCommand(_lastDomainHighlight.gene, _lastDomainHighlight.start, _lastDomainHighlight.end) + 'reset orientation;';
    _lastDomainHighlight = null;
    Object.keys(_arrIcn3d).forEach((divid) => {
        const obj = _arrIcn3d[divid];
        if (!obj || !obj.icn3d || !obj.icn3d.loadScriptCls) return;
        let fullCmd = cmd;
        if (divid.indexOf('MUT') !== -1 && typeof vratLc !== 'undefined' && vratLc) {
            fullCmd += buildVariantHighlightCommand(vratLc);
        }
        obj.icn3d.loadScriptCls.loadScript(fullCmd, undefined, true);
    });
};

const fitViewerSize = function(divid) {
    const host = document.getElementById(divid);
    const area = host && host.closest('.ICn_area');
    const w = area ? Math.floor(area.clientWidth) : 0;
    if (w < 300) return undefined;
    return { width: w, height: Math.max(380, Math.min(520, Math.round(w * 0.75))) };
};

let _viewerResizeTimer = null;
window.addEventListener('resize', function() {
    clearTimeout(_viewerResizeTimer);
    _viewerResizeTimer = setTimeout(function() {
        Object.keys(_arrIcn3d || {}).forEach(function(divid) {
            const o = _arrIcn3d[divid], fit = fitViewerSize(divid);
            if (!o || !o.icn3d || !fit || !o.icn3d.resizeCanvasCls) return;
            const host = document.getElementById(divid);
            if (host && host.offsetParent !== null) o.icn3d.resizeCanvasCls.resizeCanvas(fit.width, fit.height, true);
        });
    }, 250);
});

const setupViewer = function(idName, idValue, divid, command, alignPdb, searchPdb, width) {
    let options = {};

    // --Modify iCn3D --: add commands, e.g., 'color spectrum'
    command = (command) ? command : '';
    width = (width) ? width : (1160*0.6);

    const fit = fitViewerSize(divid);
    if (fit) width = fit.width;

    let resdef = (alignPdb) ? alignPdb.resdef : ((searchPdb) ? searchPdb.resdef : undefined);
    let pdbstr = (alignPdb) ? alignPdb.pdbstr : ((searchPdb) ? searchPdb.pdbstr : undefined);

    let cfg = {
        divid: divid,
        width: width,
        height: (fit) ? fit.height : 400,
        resize: false,
        notebook: true,
        mobilemenu: true,
        showcommand: false,
        showtitle: false,
        command: command,
        options: options,
        chains: (alignPdb) ? alignPdb.chains : undefined,
        resdef: resdef,
        masterchain: (searchPdb) ? searchPdb.masterchain : undefined,
        matchedchains: (searchPdb) ? searchPdb.matchedchains : undefined
    };
    if(idName !== '') cfg[idName] = idValue;

    // When pass from VAST neighbor page, use NCBI residue number and use asymmetric units to get all chains
    if(searchPdb) {
        cfg.usepdbnum = 0;
        cfg.bu = 0;
    }

    //let icn3dui = new icn3d.iCn3DUI(cfg);
    _icn3dui = new icn3d.iCn3DUI(cfg);
    //icn3dui.show3DStructure();

    //communicate with the 3D viewer with chained functions

    $.when(_icn3dui.show3DStructure(pdbstr)).then(function() {
        // add functions here
        //icn3dui.updateHlAll();

        if (typeof icn3dDrawFin !== undefined) {
            //icn3dDrawFin(_arrIcn3d[divid]);
        }

    });

    console.log(divid);
    _arrIcn3d[divid] = _icn3dui;
}

const setupViewerLocal = function(targetId, command, pdbData, width) {
    let cfg = getConfig();
    cfg.version = 3;
    // --Modify iCn3D --: add commands, e.g., 'color spectrum'
    command = (command) ? command : '';
    cfg.command = command;
    cfg.resize = false;

    cfg.width = (1160*0.6);
    cfg.height = 400;

    cfg.mobilemenu = true;
    cfg.showcommand = false;
    cfg.showtitle = false;

    cfg.chains = undefined;
    cfg.resdef = undefined;
    cfg.masterchain = undefined;
    cfg.matchedchains = undefined;

    cfg.divid = targetId;

    _icn3dui = new icn3d.iCn3DUI(cfg);

    $.when(_icn3dui.show3DStructure()).then(function() {
        //icn3dui.setOption('color', 'spectrum');
    });

    _arrIcn3d[targetId] = _icn3dui;

    _arrIcn3d['divPdbMUT1'].icn3d.pdbParserCls.loadPdbData(pdbData, undefined, undefined, false);
    //$(`#divPdbMUT1_accordion0`).hide();
    //$(`#divPdbMUT1_fullscreen`).hide();
}

const showAf2 = (btnObj, ask, no, pdbNm, paeNm, pLddtNm, width) =>{
    $('.mlNum').removeClass('btn_rank_active');
    $(btnObj).addClass('btn_rank_active');

    $(`div[id^=div${ask}]`).hide();
    $(`div[id^=div${ask}${no}]`).show();

    let command = 'load url ' + decodeURIComponent(`/filedownload?file_name=${pdbNm}`) + ';color spectrum;';
    setupViewer(undefined, undefined, `divPdb${ask}${no}`, command, undefined, undefined, width);

    //$(`#divPdb${ask}${no}_accordion0`).hide();
    $(`#divPdb${ask}${no}_fullscreen`).hide();

    _paeChart.drawPae(paeNm, _arrIcn3d[`divPdb${ask}${no}`], `divPae${ask}${no}`);

    _plddtChart.drawPlddt(pLddtNm, _arrIcn3d[`divPdb${ask}${no}`], `divPlddt${ask}${no}`);
}

const showAf2Compare = (frontId, btnObj, ask, no, pdbNm, paeNm, pLddtNm, width) =>{
    $(btnObj).parent().find('button').removeClass('btn_rank_active');
    $(btnObj).addClass('btn_rank_active');

    $(`div[id^=${frontId}${ask}]`).hide();
    $(`div[id^=${frontId}${ask}${no}]`).show();

    let command = 'load url ' + decodeURIComponent(`/filedownload?file_name=${pdbNm}`) + ';color spectrum;';
    setupViewer(undefined, undefined, `${frontId}Pdb${ask}${no}`, command, undefined, undefined, width);

    //$(`#divCPdb${ask}${no}_accordion0`).hide();
    $(`#divPdb${ask}${no}_fullscreen`).hide();
    $(`#divCPdb${ask}${no}_fullscreen`).hide();

    if (frontId == 'div') {
        _oriPLddtNm = pLddtNm

        _paeChart.drawPae(paeNm, _arrIcn3d[`${frontId}Pdb${ask}${no}`], `${frontId}Pae${ask}${no}`);
    } else {
        _comparePLddtNm = pLddtNm

        _paeChartC.drawPae(paeNm, _arrIcn3d[`${frontId}Pdb${ask}${no}`], `${frontId}Pae${ask}${no}`);
    }

    if (_comparePLddtNm != undefined)_plddtChart.drawPlddtCv2(_oriPLddtNm, _comparePLddtNm, _arrIcn3d[`divPdb${ask}${no}`], _arrIcn3d[`divCPdb${ask}${no}`],'divPlddt', 'user','user')
}

const showAf2Cv2 = (btnObj, ask, no, pdbNm, paeNm, pLddtNm, width, pLddtNmCv2,prdctnProteinStruct) =>{
    $('.mlNum').removeClass('btn_rank_active');
    $(btnObj).addClass('btn_rank_active');

    $(`div[id^=div${ask}]`).hide();
    $(`div[id^=div${ask}${no}]`).show();

    let command = 'load url ' + decodeURIComponent(`/filedownload?file_name=${pdbNm}`) + ';' + buildDomainCommand(prdctnProteinStruct.split('_')[0], vratLc) ;
    setupViewer(undefined, undefined, `divPdb${ask}${no}`, command, undefined, undefined, width);

    //$(`#divPdb${ask}${no}_accordion0`).hide();
    $(`#divPdb${ask}${no}_fullscreen`).hide();

    const paePromise = _paeChart.drawPaeCsv(paeNm, _arrIcn3d[`divPdb${ask}${no}`], `divPae${ask}${no}`, prdctnProteinStruct);

    const geneWildLabel = prdctnProteinStruct.split('_')[0] + '_wild';
    _plddtChart.drawPlddtCv2(pLddtNm, pLddtNmCv2,_arrIcn3d[`divPdb${ask}${no}`], _arrIcn3d['divPdbCv2'],'divPlddtCv2', prdctnProteinStruct,geneWildLabel)

    return paePromise;
}

const showCv2 = (btnObj, ask, no, pdbNm, paeNm, pLddtNm, width, pLddtNmCv2,prdctnProteinStruct) =>{
    $('.plNum').removeClass('btn_rank_active');
    $(btnObj).addClass('btn_rank_active');

    $(`div[id^=div${ask}]`).hide();
    $(`div[id^=div${ask}${no}]`).show();

    let command = 'load url ' + decodeURIComponent(`/filedownload?file_name=${pdbNm}&file_type=${prdctnProteinStruct}`) + ';' + buildDomainCommand(prdctnProteinStruct.split('_')[0], undefined);
    setupViewer(undefined, undefined, `divPdb${ask}${no}`, command, undefined, undefined, width);

    //$(`#divPdb${ask}${no}_accordion0`).hide();

    $(`#divPdb${ask}${no}_fullscreen`).hide();

    return _paeChartCV.drawPaeCsv(paeNm, _arrIcn3d[`divPdb${ask}${no}`], `divPae${ask}${no}`, prdctnProteinStruct);
}

const getConfig = function() {
    // separating the GET parameters from the current URL
    // repalce "color #" with "color " in the url
    var url = document.URL.replace(/\#/g, '');

    var bNopara = false;
    var ampPos = url.indexOf("?");
    if(ampPos === -1) {
    //  alert("Please include '?pdbid=1GPK,2POR,...' in your url");
        bNopara = true;
    }

    var params = url.split("?");
    // transforming the GET parameters into a dictionnary
    var search = params[params.length - 1];

    var cfg = {};

    if(!bNopara) {
        var decodeSearch = decodeURIComponent(search).replace(/\+/g, ' ');

        // command could contains '&', for example when loading statefile 'load mmdb 1kq2 | parameters &atype=1'
        var commandPos = decodeSearch.indexOf('&command=');
        if(commandPos != -1) {
            cfg.command = decodeSearch.substr(commandPos + 9); // ";" separated commands
            decodeSearch = decodeSearch.substr(0, commandPos);

            var paraPos = decodeSearch.indexOf(' | parameters ');

            if(paraPos != -1) { //When loading statefile (e.g., 'load mmdb 1kq2 | parameters &atype=1'), the commands ends with '}}'.
                var tmpPos = cfg.command.indexOf('}}&');
                if(tmpPos != -1) { // more parameters after the command
                  decodeSearch += cfg.command.substr(tmpPos + 2);
                  cfg.command = cfg.command.substr(0, tmpPos + 2);
                }
            }
            else {
                var paraPos = cfg.command.indexOf(' | parameters ');

                if(paraPos != -1) { //"&command=load mmdb 7DDD | parameters &mmdbid=7DDD; select..." the commands ends with '}}'.
                    var tmpPos = cfg.command.indexOf('}}&');
                    if(tmpPos != -1) { // more parameters after the command
                      decodeSearch += cfg.command.substr(tmpPos + 2);
                      cfg.command = cfg.command.substr(0, tmpPos + 2);
                    }
                }
                else {
                    var tmpPos = cfg.command.indexOf('&');
                    if(tmpPos != -1) {
                      decodeSearch += cfg.command.substr(tmpPos);
                      cfg.command = cfg.command.substr(0, tmpPos);
                    }
                }
            }
        }
        else {
            cfg.command = '';
        }

        var hashes = decodeSearch.split('&');
        for (var i = 0; i < hashes.length; i++) {
            var hash = hashes[i].split('=');
            cfg[hash[0].trim()] = (hash[1] !== undefined) ? hash[1].trim() : undefined;
        }

        // for mmdb structures, pass the parameters after the first "&" sign
        cfg.inpara = "&" + url.substr(ampPos + 1);
    }

    // changed some parameter names
    cfg.rid = cfg.RID;

    cfg.urlname = cfg.url;
    if(cfg.urlname && cfg.urlname.indexOf('%3A%2F%2F') === -1) { // decoded URL
        // should encode it
        cfg.urlname = encodeURIComponent(cfg.urlname);
    }
    cfg.urltype = (cfg.type === undefined) ? 'pdb' : cfg.type;

    cfg.version = getValue(cfg.v);

    if(cfg.version !== undefined && window.localStorage && localStorage.getItem('fixedversion')) {
        var fixedUrl = url.replace('full.html', 'full_' + cfg.version + '.html');
        window.open(fixedUrl, '_self');

        localStorage.removeItem('fixedversion');
    }

    // standardize the input values
    for(var i in cfg) {
        if(i == 'bu') {
          cfg[i] = getInt(cfg[i]);
        }
        else {
           cfg[i] = getValue(cfg[i]);
        }
    }

    // backward compatible with showseq
    cfg.showanno = cfg.showanno || cfg.showseq;

    cfg.shownote = 1; //cfg.shownote;
    cfg.options = (cfg.options !== undefined) ? JSON.parse(cfg.options) : undefined;

    // default to show biological unit
    if(cfg.bu === undefined) cfg.bu = 1; //0;
    if(cfg.buidx !== undefined) cfg.bu = cfg.buidx;

    return cfg;
  }

  const getValue = function(input) {
    if(input == 'true' || input == '1') {
      input = true;
    }
    else if(input == 'false' || input == '0') {
      input = false;
    }

    return input;
  }

  const getInt = function(input) {
    if(input == 'true' || input == '1') {
      input = 1;
    }
    else if(input == 'false' || input == '0') {
      input = 0;
    }

    return input;
  }

const showAfLocal = (targetId, pdbData) =>{

    let command = 'append pdb file ranked_0.pdb';
    setupViewerLocal(targetId, command, pdbData);

    $(`#${targetId}_accordion0`).hide();
    $(`#${targetId}_fullscreen`).hide();
}

//============ modify default functions =========
// e.g., add the b-factor information in the mouseover
icn3d.Picking.prototype.showPicking = function(atom, x, y) {
    let ic = this.icn3d, me = ic.icn3dui;
    //me = ic.setIcn3dui(ic.id);
    if(me.cfg.cid !== undefined && ic.pk != 0) {
        ic.pk = 1; // atom
    }
    else {
        // do not change the picking option
    }
    ic.highlightlevel = ic.pk;
    this.showPickingBase(atom, x, y);

    if(ic.pk != 0) {
        if(x !== undefined && y !== undefined) { // mouse over
        if(me.cfg.showmenu != undefined && me.cfg.showmenu == true) {
            y += me.htmlCls.MENU_HEIGHT;
        }
        let text =(ic.pk == 1) ? atom.resn + atom.resi + '@' + atom.name : atom.resn + atom.resi;
        text += ', b: ' + atom.b;
        if(ic.structures !== undefined && Object.keys(ic.structures).length > 1) {
            text = atom.structure + '_' + atom.chain + ' ' + text;
            $("#" + ic.pre + "popup").css("width", "190px");
        }
        else {
            $("#" + ic.pre + "popup").css("width", "130px");
        }
        $("#" + ic.pre + "popup").html(text);
        $("#" + ic.pre + "popup").css("top", y).css("left", x+20).show();
        }
        else {
            // highlight the sequence background
            ic.hlUpdateCls.updateHlAll();
            let transformation = {}
            transformation.factor = ic._zoomFactor;
            transformation.mouseChange = ic.mouseChange;
            //transformation.quaternion = ic.quaternion;
            transformation.quaternion = {}
            transformation.quaternion._x = parseFloat(ic.quaternion._x).toPrecision(5);
            transformation.quaternion._y = parseFloat(ic.quaternion._y).toPrecision(5);
            transformation.quaternion._z = parseFloat(ic.quaternion._z).toPrecision(5);
            transformation.quaternion._w = parseFloat(ic.quaternion._w).toPrecision(5);
            if(ic.bAddCommands) {
                ic.commands.push('pickatom ' + atom.serial + '|||' + ic.transformCls.getTransformationStr(transformation));
                ic.optsHistory.push(me.hashUtilsCls.cloneHash(ic.opts));
                ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                if(me.utilsCls.isSessionStorageSupported()) ic.setStyleCls.saveCommandsToSession();
                ic.STATENUMBER = ic.commands.length;
            }
            ic.logs.push('pickatom ' + atom.serial + '(chain: ' + atom.structure + '_' + atom.chain + ', residue: ' + atom.resn + ', number: ' + atom.resi + ', atom: ' + atom.name + ')');
            if( $( "#" + ic.pre + "logtext" ).length )  {
            $("#" + ic.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + ic.pre + "logtext")[0].scrollHeight);
            }
            // update the interaction flag
            ic.bSphereCalc = false;
            //me.htmlCls.clickMenuCls.setLogCmd('set calculate sphere false', true);
            ic.bHbondCalc = false;
            //me.htmlCls.clickMenuCls.setLogCmd('set calculate hbond false', true);
        }
    }
}
//============ End of: modify default functions =========