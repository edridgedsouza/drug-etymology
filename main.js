var _pyfunc_format = function (v, fmt) {  // nargs: 2
    fmt = fmt.toLowerCase();
    var s = String(v);
    if (fmt.indexOf('!r') >= 0) {
        try { s = JSON.stringify(v); } catch (e) { s = undefined; }
        if (typeof s === 'undefined') { s = v._IS_COMPONENT ? v.id : String(v); }
    }
    var fmt_type = '';
    if (fmt.slice(-1) == 'i' || fmt.slice(-1) == 'f' ||
        fmt.slice(-1) == 'e' || fmt.slice(-1) == 'g') {
            fmt_type = fmt[fmt.length-1]; fmt = fmt.slice(0, fmt.length-1);
    }
    var i0 = fmt.indexOf(':');
    var i1 = fmt.indexOf('.');
    var spec1 = '', spec2 = '';  // before and after dot
    if (i0 >= 0) {
        if (i1 > i0) { spec1 = fmt.slice(i0+1, i1); spec2 = fmt.slice(i1+1); }
        else { spec1 = fmt.slice(i0+1); }
    }
    // Format numbers
    if (fmt_type == '') {
    } else if (fmt_type == 'i') { // integer formatting, for %i
        s = parseInt(v).toFixed(0);
    } else if (fmt_type == 'f') {  // float formatting
        v = parseFloat(v);
        var decimals = spec2 ? Number(spec2) : 6;
        s = v.toFixed(decimals);
    } else if (fmt_type == 'e') {  // exp formatting
        v = parseFloat(v);
        var precision = (spec2 ? Number(spec2) : 6) || 1;
        s = v.toExponential(precision);
    } else if (fmt_type == 'g') {  // "general" formatting
        v = parseFloat(v);
        var precision = (spec2 ? Number(spec2) : 6) || 1;
        // Exp or decimal?
        s = v.toExponential(precision-1);
        var s1 = s.slice(0, s.indexOf('e')), s2 = s.slice(s.indexOf('e'));
        if (s2.length == 3) { s2 = 'e' + s2[1] + '0' + s2[2]; }
        var exp = Number(s2.slice(1));
        if (exp >= -4 && exp < precision) { s1=v.toPrecision(precision); s2=''; }
        // Skip trailing zeros and dot
        var j = s1.length-1;
        while (j>0 && s1[j] == '0') { j-=1; }
        s1 = s1.slice(0, j+1);
        if (s1.slice(-1) == '.') { s1 = s1.slice(0, s1.length-1); }
        s = s1 + s2;
    }
    // prefix/padding
    var prefix = '';
    if (spec1) {
        if (spec1[0] == '+' && v > 0) { prefix = '+'; spec1 = spec1.slice(1); }
        else if (spec1[0] == ' ' && v > 0) { prefix = ' '; spec1 = spec1.slice(1); }
    }
    if (spec1 && spec1[0] == '0') {
        var padding = Number(spec1.slice(1)) - (s.length + prefix.length);
        s = '0'.repeat(Math.max(0, padding)) + s;
    }
    return prefix + s;
};
var _pyfunc_op_instantiate = function (ob, args) { // nargs: 2
    if ((typeof ob === "undefined") ||
            (typeof window !== "undefined" && window === ob) ||
            (typeof global !== "undefined" && global === ob))
            {throw "Class constructor is called as a function.";}
    for (var name in ob) {
        if (Object[name] === undefined &&
            typeof ob[name] === 'function' && !ob[name].nobind) {
            ob[name] = ob[name].bind(ob);
            ob[name].__name__ = name;
        }
    }
    if (ob.__init__) {
        ob.__init__.apply(ob, args);
    }
};
var _pyfunc_truthy = function (v) {
    if (v === null || typeof v !== "object") {return v;}
    else if (v.length !== undefined) {return v.length ? v : false;}
    else if (v.byteLength !== undefined) {return v.byteLength ? v : false;}
    else if (v.constructor !== Object) {return true;}
    else {return Object.getOwnPropertyNames(v).length ? v : false;}
};
var _pymeth_append = function (x) { // nargs: 1
    if (!Array.isArray(this)) return this.append.apply(this, arguments);
    this.push(x);
};
var _pymeth_endswith = function (x) { // nargs: 1
    if (this.constructor !== String) return this.endswith.apply(this, arguments);
    return this.lastIndexOf(x) == this.length - x.length;
};
var _pymeth_format = function () {
    if (this.constructor !== String) return this.format.apply(this, arguments);
    var parts = [], i = 0, i1, i2;
    var itemnr = -1;
    while (i < this.length) {
        // find opening
        i1 = this.indexOf('{', i);
        if (i1 < 0 || i1 == this.length-1) { break; }
        if (this[i1+1] == '{') {parts.push(this.slice(i, i1+1)); i = i1 + 2; continue;}
        // find closing
        i2 = this.indexOf('}', i1);
        if (i2 < 0) { break; }
        // parse
        itemnr += 1;
        var fmt = this.slice(i1+1, i2);
        var index = fmt.split(':')[0].split('!')[0];
        index = index? Number(index) : itemnr
        var s = _pyfunc_format(arguments[index], fmt);
        parts.push(this.slice(i, i1), s);
        i = i2 + 1;
    }
    parts.push(this.slice(i));
    return parts.join('');
};
var _pymeth_items = function () { // nargs: 0
    if (this.constructor !== Object) return this.items.apply(this, arguments);
    var key, keys = Object.keys(this), res = []
    for (var i=0; i<keys.length; i++) {key = keys[i]; res.push([key, this[key]]);}
    return res;
};
var _pymeth_join = function (x) { // nargs: 1
    if (this.constructor !== String) return this.join.apply(this, arguments);
    return x.join(this);  // call join on the list instead of the string.
};
var _pymeth_lower = function () { // nargs: 0
    if (this.constructor !== String) return this.lower.apply(this, arguments);
    return this.toLowerCase();
};
var _pymeth_replace = function (s1, s2, count) {  // nargs: 2 3
    if (this.constructor !== String) return this.replace.apply(this, arguments);
    var i = 0, i2, parts = [];
    count = (count === undefined) ? 1e20 : count;
    while (count > 0) {
        i2 = this.indexOf(s1, i);
        if (i2 >= 0) {
            parts.push(this.slice(i, i2));
            parts.push(s2);
            i = i2 + s1.length;
            count -= 1;
        } else break;
    }
    parts.push(this.slice(i));
    return parts.join('');
};
var _pymeth_split = function (sep, count) { // nargs: 0, 1 2
    if (this.constructor !== String) return this.split.apply(this, arguments);
    if (sep === '') {var e = Error('empty sep'); e.name='ValueError'; throw e;}
    sep = (sep === undefined) ? /\s/ : sep;
    if (count === undefined) { return this.split(sep); }
    var res = [], i = 0, index1 = 0, index2 = 0;
    while (i < count && index1 < this.length) {
        index2 = this.indexOf(sep, index1);
        if (index2 < 0) { break; }
        res.push(this.slice(index1, index2));
        index1 = index2 + sep.length || 1;
        i += 1;
    }
    res.push(this.slice(index1));
    return res;
};
var _pymeth_startswith = function (x) { // nargs: 1
    if (this.constructor !== String) return this.startswith.apply(this, arguments);
    return this.indexOf(x) == 0;
};
var _pymeth_strip = function (chars) { // nargs: 0 1
    if (this.constructor !== String) return this.strip.apply(this, arguments);
    chars = (chars === undefined) ? ' \t\r\n' : chars;
    var i, s1 = this, s2 = '', s3 = '';
    for (i=0; i<s1.length; i++) {
        if (chars.indexOf(s1[i]) < 0) {s2 = s1.slice(i); break;}
    } for (i=s2.length-1; i>=0; i--) {
        if (chars.indexOf(s2[i]) < 0) {s3 = s2.slice(0, i+1); break;}
    } return s3;
};
var Linguist;
Linguist = function () {
    _pyfunc_op_instantiate(this, arguments);
}
Linguist.prototype._base_class = Object;
Linguist.prototype.__name__ = "Linguist";

Linguist.prototype.__init__ = function (file) {
    this.definitions = ({});
    this.patterns = ({});
    this._process_file(file);
    return null;
};

Linguist.prototype._strip_dash = function flx__strip_dash (string) {
    return _pymeth_replace.call(string, "-", "");
};

Linguist.prototype._process_file = function (file) {
    var defn, f, l, line, pattern, root, stem, stub1_context, stub2_err, stub3_, stub4_seq, stub5_itr;
    stub1_context = open(file, "r");
    f = stub1_context.__enter__();
    try {
        stub4_seq = f;
        if ((typeof stub4_seq === "object") && (!Array.isArray(stub4_seq))) { stub4_seq = Object.keys(stub4_seq);}
        for (stub5_itr = 0; stub5_itr < stub4_seq.length; stub5_itr += 1) {
            line = stub4_seq[stub5_itr];
            l = _pymeth_strip.call(line);
            stub3_ = _pymeth_split.call(l, "\t");
            stem = stub3_[0];defn = stub3_[1];
            this.definitions[stem] = defn;
            root = this._strip_dash(stem);
            if ((_pymeth_startswith.call(stem, "-") && ((!_pyfunc_truthy(_pymeth_endswith.call(stem, "-")))))) {
                pattern = cmpl(_pymeth_format.call(".*{}", root));
            } else if (_pyfunc_truthy((_pyfunc_truthy(_pymeth_endswith.call(stem, "-"))) && ((!_pymeth_startswith.call(stem, "-"))))) {
                pattern = cmpl(_pymeth_format.call("{}.*", root));
            } else if ((_pymeth_startswith.call(stem, "-") && (_pyfunc_truthy(_pymeth_endswith.call(stem, "-"))))) {
                pattern = cmpl(_pymeth_format.call(".*{}.*", root));
            } else {
                pattern = cmpl(_pymeth_format.call(".*{}.*", stem));
            }
            this.patterns[stem] = pattern;
        }
    } catch(err_1)  { stub2_err=err_1;
    } finally {
        if (stub2_err) { if (!stub1_context.__exit__(stub2_err.name || "error", stub2_err, null)) { throw stub2_err; }
        } else { stub1_context.__exit__(null, null, null); }
    }
    return null;
};

Linguist.prototype._etymology = function (drug) {
    var matching_roots, out, pattern, stem, stub6_seq, stub7_seq, stub8_itr;
    drug = _pymeth_lower.call(drug);
    matching_roots = [];
    stub6_seq = this.patterns;
    for (stem in stub6_seq) {
        if (!stub6_seq.hasOwnProperty(stem)){ continue; }
        pattern = stub6_seq[stem];
        if (_pyfunc_truthy(search(pattern, drug))) {
            _pymeth_append.call(matching_roots, stem);
        }
    }
    out = ({});
    stub7_seq = matching_roots;
    if ((typeof stub7_seq === "object") && (!Array.isArray(stub7_seq))) { stub7_seq = Object.keys(stub7_seq);}
    for (stub8_itr = 0; stub8_itr < stub7_seq.length; stub8_itr += 1) {
        stem = stub7_seq[stub8_itr];
        out[stem] = this.definitions[stem];
    }
    return out;
};

Linguist.prototype.explain = function (drug) {
    var lst, out, res;
    res = this._etymology(drug);
    if (_pyfunc_truthy(res)) {
        lst = _pymeth_join.call("\n", ((function list_comprehension (iter0) {var res = [];var stem, defn, i0;if ((typeof iter0 === "object") && (!Array.isArray(iter0))) {iter0 = Object.keys(iter0);}for (i0=0; i0<iter0.length; i0++) {stem = iter0[i0][0]; defn = iter0[i0][1];{res.push(_pymeth_format.call("\t{}:\t{}", stem, defn));}}return res;}).call(this, _pymeth_items.call(res))));
        out = _pymeth_format.call("Possible etymologies for drug {}:\n{}\n", drug, lst);
    } else {
        out = _pymeth_format.call("No matching etymologies for drug {}.\n", drug);
    }
    return out;
};