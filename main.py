#!/usr/bin/env python3

# Data from INN Stembook 2018
# https://www.who.int/publications/i/item/who-emp-rht-tsn-2018-1
# https://cdn.who.int/media/docs/default-source/international-nonproprietary-names-(inn)/stembook-2018.pdf?sfvrsn=32a51b3c_6&download=true
# To update main.js, simply run this python script

from pscript import py2js


class Linguist():

    def __init__(self, data):  # Takes in tsv data as a variable
        self.definitions = {}
        self.patterns = {}
        self._process_data(data)

    def _process_data(self, data):
        for line in data.split('\n'):
            l = line.strip()
            stem, defn = l.split('\t')
            self.definitions[stem] = defn

            pattern = self._pattern_func(stem)
            self.patterns[stem] = pattern

    # @staticmethod
    def _pattern_func(self, stem):
        stem = stem.lower()
        root = self._strip_dash(stem)

        if stem.startswith('-') and not stem.endswith('-'):
            def func(drugname): return drugname.lower().endswith(root)
        elif stem.endswith('-') and not stem.startswith('-'):
            def func(drugname): return drugname.lower().startswith(root)
        elif stem.startswith('-') and stem.endswith('-'):
            def func(drugname): return root in drugname.lower()
        else:
            def func(drugname): return stem in drugname.lower()

        return func

    # @staticmethod
    def _strip_dash(self, string):
        return string.replace('-', '')

    def etymology(self, drug):
        drug = drug.lower().strip()
        matching_roots = []

        for stem, search_pattern in self.patterns.items():
            if search_pattern(drug):
                matching_roots.append(stem)

        out = {}  # py2js can't handle a dict comp
        for stem in matching_roots:
            out[stem] = self.definitions[stem]

        return out

    def explain(self, drug):
        res = self.etymology(drug)
        if res:
            lst = '\n'.join(
                [f'<li><b>{stem}:</b>&emsp;{defn}</li>' for stem, defn in res.items()])
            out = (f'Possible etymologies for drug <b>{drug}</b>:\n<ul>{lst}</ul>\n')
        else:
            out = (f'No matching etymologies for drug <b>{drug}</b>.\n')
        return out


# NOTE: Current transpilation for `endswith` gives incorrect results
# https://github.com/flexxui/pscript/issues/66
# This manual replacement seems to do the trick
wrong_code = """var _pymeth_endswith = function (x) { // nargs: 1
    if (this.constructor !== String) return this.endswith.apply(this, arguments);
    return this.lastIndexOf(x) == this.length - x.length;
};"""
right_code = """var _pymeth_endswith = function (x) { // nargs: 1
    if (this.constructor !== String) return this.endswith.apply(this, arguments);
    return this.endsWith(x);
};"""

if __name__ == '__main__':
    with open('main.js', 'w') as f:
        f.write(py2js(Linguist).replace(wrong_code, right_code))

    with open('stems.tsv', 'r') as f:
        data = f.read()
    l = Linguist(data)

    while True:
        d = input('What drug would you like to analyze?\n')
        if d.lower() == 'exit':
            print('Thanks for using my tool! Check it out on GitHub '
                  'https://github.com/edridgedsouza/drug-etymology')
            break
        print(l.explain(d))
