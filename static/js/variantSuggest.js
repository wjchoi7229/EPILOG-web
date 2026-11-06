
(function () {
    var css = document.createElement('style');
    css.textContent = '.vs-box{position:absolute;z-index:3000;background:#fff;border:1px solid #c9d3e0;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.15);' +
        'max-height:260px;overflow-y:auto;min-width:220px;font-size:13px;text-align:left;}' +
        '.vs-item{padding:6px 12px;cursor:pointer;display:flex;justify-content:space-between;gap:16px;color:#1f2d4d;}' +
        '.vs-item small{color:#8a94a6;}.vs-item.on,.vs-item:hover{background:#eaf3ff;}.vs-item b{color:#0068b9;}.vs-gene{color:#6b7280;margin-right:6px;font-size:12px;}';
    document.head.appendChild(css);

    window.variantSuggest = function (input, opt) {
        var box = document.createElement('div'), items = [], idx = -1, timer = null, seq = 0;
        box.className = 'vs-box';
        box.style.display = 'none';
        document.body.appendChild(box);
        input.setAttribute('autocomplete', 'off');

        function place() {
            var r = input.getBoundingClientRect();
            box.style.left = (r.left + window.pageXOffset) + 'px';
            box.style.top = (r.bottom + window.pageYOffset + 2) + 'px';
            box.style.minWidth = Math.max(220, r.width) + 'px';
        }
        function hide() { box.style.display = 'none'; idx = -1; }
        function mark() {
            Array.prototype.forEach.call(box.children, function (c, i) { c.classList.toggle('on', i === idx); });
            if (box.children[idx]) { box.children[idx].scrollIntoView({ block: 'nearest' }); }
        }
        function pick(it) {
            input.value = opt.useValue ? it.value : it.variant;
            hide();
            if (opt.onPick) { opt.onPick(it); }
        }
        function render() {
            box.innerHTML = '';
            if (!items.length) { hide(); return; }
            items.forEach(function (it) {
                var d = document.createElement('div');
                d.className = 'vs-item';
                d.innerHTML = '<span>' + (opt.useValue || !opt.gene || !opt.gene() ? '<span class="vs-gene">' + it.gene + '</span>' : '') + '<b>' + it.variant + '</b></span><small>' + it.p3 + '</small>';
                d.addEventListener('mousedown', function (e) { e.preventDefault(); pick(it); });
                box.appendChild(d);
            });
            place();
            box.style.display = 'block';
            idx = -1;
        }
        function fetchItems() {
            var q = input.value.trim(), my = ++seq;
            if (q.length < 2) { hide(); return; }
            var g = opt.gene ? opt.gene() : '';
            fetch(opt.url + '?q=' + encodeURIComponent(q) + (g ? '&gene=' + encodeURIComponent(g) : ''), { credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (j) { if (my === seq) { items = j.items || []; render(); } })
                .catch(function () { hide(); });
        }
        input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(fetchItems, 120); });
        input.addEventListener('keydown', function (e) {
            if (box.style.display === 'none') { return; }
            if (e.key === 'ArrowDown') { idx = (idx + 1) % items.length; mark(); e.preventDefault(); }
            else if (e.key === 'ArrowUp') { idx = (idx - 1 + items.length) % items.length; mark(); e.preventDefault(); }
            else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); pick(items[idx]); }
            else if (e.key === 'Escape') { hide(); }
        });
        input.addEventListener('blur', function () { setTimeout(hide, 150); });
        window.addEventListener('resize', function () { if (box.style.display !== 'none') { place(); } });
    };
})();
